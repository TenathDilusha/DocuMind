import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


def load_pdfs():
    documents = []
    for file in os.listdir("pdfs"):
        if file.endswith(".pdf"):
            loader = PyPDFLoader(os.path.join("pdfs", file))
            documents.extend(loader.load())
    return documents

def split_documents(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )
    return splitter.split_documents(documents)

def create_vector_store(chunks):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local("faiss_index")

if __name__ == "__main__":
    docs = load_pdfs()
    chunks = split_documents(docs)
    create_vector_store(chunks)
    print("PDFs indexed successfully!")
