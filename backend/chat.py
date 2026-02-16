from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser


def load_vector_store():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    return FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)

def create_qa_chain(vectorstore):
    llm = Ollama(model="llama3.2")
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    # Create a prompt template
    template = """Use the following pieces of context to answer the question at the end. 
If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context: {context}

Question: {question}

Answer:"""
    
    prompt = PromptTemplate(
        template=template,
        input_variables=["context", "question"]
    )
    
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)
    
    # Create the chain
    chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough()
        }
        | prompt
        | llm
        | StrOutputParser()
    )
    
    # Wrap to return both answer and source documents
    class QAChainWrapper:
        def __init__(self, chain, retriever):
            self.chain = chain
            self.retriever = retriever
        
        def invoke(self, question):
            # Get the answer
            if isinstance(question, dict):
                question = question.get("question", question)
            
            answer = self.chain.invoke(question)
            # Get source documents using invoke instead
            source_docs = self.retriever.invoke(question)
            
            return {
                "result": answer,
                "source_documents": source_docs
            }
    
    return QAChainWrapper(chain, retriever)

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
