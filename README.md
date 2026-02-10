# DocuMind 🧠📄

DocuMind is a **privacy-first, local Retrieval-Augmented Generation (RAG) system** that allows users to upload PDF documents and ask natural language questions to receive accurate, context-aware answers powered by **Ollama** and **vector search**.

Unlike cloud-based AI tools, this system runs **entirely locally**, ensuring data security while delivering powerful document intelligence.

---

## 🚀 Features

- 📂 Upload and manage multiple PDF documents
- 🔍 Semantic search using vector embeddings
- 💬 Conversational Q&A over document content
- 🤖 Local LLM inference using Ollama
- 📌 Source-aware answers with page references
- ⚡ Fast retrieval using FAISS vector database
- 🧠 Modular and extensible RAG architecture

---

## 🏗️ System Architecture

PDFs → Text Extraction → Chunking → Embeddings → Vector DB (FAISS)
↓
User Query → Embedding → Relevant Chunks → Ollama LLM → Answer


---

## 🛠️ Tech Stack

**Backend**
- Python
- LangChain
- Ollama 
- FAISS (Vector Database)

**NLP & Data**
- Sentence Transformers / Ollama Embeddings
- PyPDF

**Frontend**
- React

---

## 📦 Installation

### 1️⃣ Install Ollama
```bash
curl -fsSL https://ollama.com/install.sh | sh
```
Pull a model:

ollama pull mistral
Clone the Repository
```bash
git clone https://github.com/TenathDilusha/documind.git
cd documind
```

Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate
```

Install Dependencies
```bash
pip install -r requirements.txt
```

📄 Adding PDFs

Place your PDF files inside the pdfs/ directory:

pdfs/
 ├── sample1.pdf
 ├── sample2.pdf

Run the ingestion script:
```bash
python ingest.py
```

💬 Ask Questions
```bash
python chat.py
```

📁 Project Structure

documind-rag/
│── app.py            # UI / API entry point
│── ingest.py         # PDF ingestion & indexing
│── chat.py           # Question answering logic
│── pdfs/             # Uploaded PDF documents
│── faiss_index/      # Vector database
│── requirements.txt
│── README.md
🔐 Privacy & Security
All inference runs locally

No document data is sent to external APIs

Ideal for sensitive or private documents
