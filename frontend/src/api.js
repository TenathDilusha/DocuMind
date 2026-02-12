import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

export const uploadPDF = (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress,
    });
};

export const getDocuments = () => api.get('/documents');

export const deleteDocument = (name) => api.delete(`/documents/${encodeURIComponent(name)}`);

export const sendMessage = (question) => api.post('/chat', { question });

export default api;
