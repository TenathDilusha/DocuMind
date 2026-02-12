import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chat import load_vector_store, create_qa_chain
from ingest import load_pdfs, split_documents, create_vector_store

app = FastAPI(title="DocuMind API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PDFS_DIR = os.path.join(os.path.dirname(__file__), "pdfs")
FAISS_DIR = os.path.join(os.path.dirname(__file__), "faiss_index")

os.makedirs(PDFS_DIR, exist_ok=True)

# --- Shared State ---
qa_chain = None


def init_qa_chain():
    """Load the vector store from chat.py and create the QA chain."""
    global qa_chain
    if os.path.exists(os.path.join(FAISS_DIR, "index.faiss")):
        vectorstore = load_vector_store()
        qa_chain = create_qa_chain(vectorstore)
    else:
        qa_chain = None


def run_ingestion():
    """Re-ingest all PDFs using ingest.py and reload the QA chain."""
    docs = load_pdfs()
    if not docs:
        return
    chunks = split_documents(docs)
    create_vector_store(chunks)
    init_qa_chain()


# --- Startup ---
@app.on_event("startup")
def startup():
    init_qa_chain()


# --- Models ---
class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]


class DocumentInfo(BaseModel):
    name: str
    size: int  # bytes


# --- Endpoints ---

@app.get("/api/documents", response_model=list[DocumentInfo])
def list_documents():
    docs = []
    for f in os.listdir(PDFS_DIR):
        if f.endswith(".pdf"):
            path = os.path.join(PDFS_DIR, f)
            docs.append(DocumentInfo(name=f, size=os.path.getsize(path)))
    return docs


@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    dest = os.path.join(PDFS_DIR, file.filename)
    with open(dest, "wb") as f:
        content = await file.read()
        f.write(content)

    # Re-ingest all documents using ingest.py logic
    run_ingestion()
    return {"message": f"'{file.filename}' uploaded and indexed successfully."}


@app.delete("/api/documents/{name}")
def delete_document(name: str):
    path = os.path.join(PDFS_DIR, name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Document not found.")
    os.remove(path)

    # Check if any PDFs remain
    remaining = [f for f in os.listdir(PDFS_DIR) if f.endswith(".pdf")]
    if remaining:
        run_ingestion()
    else:
        # No docs left — remove the index
        if os.path.exists(FAISS_DIR):
            shutil.rmtree(FAISS_DIR)
        global qa_chain
        qa_chain = None

    return {"message": f"'{name}' deleted."}


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """Send user question to chat.py's QA chain and return the answer."""
    if qa_chain is None:
        raise HTTPException(
            status_code=400,
            detail="No documents have been indexed yet. Please upload a PDF first.",
        )

    # This calls the same qa_chain from chat.py
    result = qa_chain.invoke(req.question)
    sources = []
    for doc in result.get("source_documents", []):
        src = doc.metadata.get("source", "unknown")
        page = doc.metadata.get("page", "?")
        sources.append(f"{os.path.basename(src)} (page {page})")
    # Deduplicate while preserving order
    seen = set()
    unique_sources = []
    for s in sources:
        if s not in seen:
            seen.add(s)
            unique_sources.append(s)

    return ChatResponse(answer=result["result"], sources=unique_sources)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
