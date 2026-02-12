import { useState, useRef, useEffect } from 'react';
import {
    Send,
    Sparkles,
    FileText,
    Loader2,
} from 'lucide-react';

export default function ChatArea({ messages, onSend, isLoading }) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        onSend(input.trim());
        setInput('');
    };

    return (
        <div className="chat-area">
            <div className="chat-header">
                <div className="chat-header-icon">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h2>DocuMind Chat</h2>
                    <p className="chat-subtitle">Ask anything about your documents</p>
                </div>
            </div>

            <div className="messages-container">
                {messages.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Sparkles size={48} />
                        </div>
                        <h3>Welcome to DocuMind</h3>
                        <p>Upload a PDF document and start asking questions.<br />Your data stays completely local and private.</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.role}`}>
                        <div className="message-bubble">
                            {msg.role === 'assistant' && (
                                <div className="message-role-tag">
                                    <Sparkles size={12} /> DocuMind
                                </div>
                            )}
                            <p>{msg.content}</p>
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="sources">
                                    <span className="sources-label"><FileText size={12} /> Sources:</span>
                                    {msg.sources.map((s, j) => (
                                        <span key={j} className="source-badge">{s}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message assistant">
                        <div className="message-bubble loading-bubble">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-bar" onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask a question about your documents..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" disabled={!input.trim() || isLoading} className="send-btn">
                    {isLoading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                </button>
            </form>
        </div>
    );
}
