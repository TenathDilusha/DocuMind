import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { getDocuments, uploadPDF, deleteDocument, sendMessage } from './api';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocs = async () => {
    try {
      const res = await getDocuments();
      setDocuments(res.data);
    } catch {
      // ignore - backend might not be running yet
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (file) => {
    setIsUploading(true);
    try {
      await uploadPDF(file);
      await fetchDocs();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (name) => {
    try {
      await deleteDocument(name);
      await fetchDocs();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSend = async (question) => {
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setIsLoading(true);
    try {
      const res = await sendMessage(question);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.answer,
          sources: res.data.sources,
        },
      ]);
    } catch (err) {
      const detail =
        err.response?.data?.detail || 'Something went wrong. Is the backend running?';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${detail}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        documents={documents}
        onUpload={handleUpload}
        onDelete={handleDelete}
        isUploading={isUploading}
      />
      <ChatArea messages={messages} onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
