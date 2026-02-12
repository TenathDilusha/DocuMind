import { useState, useCallback } from 'react';
import {
    FileText,
    Upload,
    Trash2,
    Brain,
    X,
    FileUp,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

export default function Sidebar({ documents, onUpload, onDelete, isUploading }) {
    const [dragOver, setDragOver] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | null
    const [uploadMsg, setUploadMsg] = useState('');

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            setDragOver(false);
            const files = Array.from(e.dataTransfer.files).filter((f) =>
                f.name.endsWith('.pdf')
            );
            if (files.length > 0) {
                doUpload(files[0]);
            }
        },
        [onUpload]
    );

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) doUpload(file);
    };

    const doUpload = async (file) => {
        setUploadStatus(null);
        try {
            await onUpload(file);
            setUploadStatus('success');
            setUploadMsg(`"${file.name}" uploaded successfully!`);
            setTimeout(() => {
                setShowModal(false);
                setUploadStatus(null);
            }, 1500);
        } catch {
            setUploadStatus('error');
            setUploadMsg('Upload failed. Please try again.');
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <Brain size={24} />
                    </div>
                    <div>
                        <h1>DocuMind</h1>
                        <span className="brand-tagline">Local AI · Private</span>
                    </div>
                </div>

                <button className="upload-btn" onClick={() => setShowModal(true)}>
                    <Upload size={16} />
                    Upload PDF
                </button>

                <div className="documents-section">
                    <h3 className="section-title">Documents</h3>
                    {documents.length === 0 ? (
                        <p className="no-docs">No documents uploaded yet.</p>
                    ) : (
                        <ul className="doc-list">
                            {documents.map((doc) => (
                                <li key={doc.name} className="doc-item">
                                    <div className="doc-info">
                                        <FileText size={16} className="doc-icon" />
                                        <div>
                                            <span className="doc-name" title={doc.name}>
                                                {doc.name}
                                            </span>
                                            <span className="doc-size">{formatSize(doc.size)}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="doc-delete-btn"
                                        onClick={() => onDelete(doc.name)}
                                        title="Delete document"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="sidebar-footer">
                    <p>Powered by Ollama + FAISS</p>
                </div>
            </aside>

            {/* Upload Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => !isUploading && setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Upload Document</h3>
                            <button className="modal-close" onClick={() => !isUploading && setShowModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div
                            className={`drop-zone ${dragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                        >
                            {isUploading ? (
                                <div className="upload-progress">
                                    <div className="spinner"></div>
                                    <p>Uploading & indexing...</p>
                                    <span className="upload-hint">This may take a moment</span>
                                </div>
                            ) : uploadStatus === 'success' ? (
                                <div className="upload-result success">
                                    <CheckCircle2 size={40} />
                                    <p>{uploadMsg}</p>
                                </div>
                            ) : uploadStatus === 'error' ? (
                                <div className="upload-result error">
                                    <AlertCircle size={40} />
                                    <p>{uploadMsg}</p>
                                </div>
                            ) : (
                                <>
                                    <FileUp size={40} className="drop-icon" />
                                    <p>Drag & drop a PDF here</p>
                                    <span className="drop-or">or</span>
                                    <label className="file-select-btn">
                                        Browse Files
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileSelect}
                                            hidden
                                        />
                                    </label>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
