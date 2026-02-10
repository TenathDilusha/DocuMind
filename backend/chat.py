from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain_classic.chains.retrieval_qa.base import RetrievalQA



def load_vector_store():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    return FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)

def create_qa_chain(vectorstore):
    llm = Ollama(model="llama3.2")
    return RetrievalQA.from_chain_type(
        llm=llm,
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        return_source_documents=True
    )

if __name__ == "__main__":
    vectorstore = load_vector_store()
    qa_chain = create_qa_chain(vectorstore)

    print("🧠 DocuMind-RAG is ready! Ask questions (type 'exit' to quit)\n")

    while True:
        query = input("❓ Question: ")
        if query.lower() == "exit":
            break

        result = qa_chain.invoke(query)
        print("\n💡 Answer:\n", result["result"], "\n")
