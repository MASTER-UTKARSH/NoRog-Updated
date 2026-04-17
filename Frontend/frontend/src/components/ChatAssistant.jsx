import { useState, useEffect, useRef } from "react";
import { getChatHistory, sendChatMessage, resetChatHistory } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Activity, Trash2, X, ArrowUp } from 'lucide-react';
import toast from "react-hot-toast";

export default function ChatAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && isOpen) {
      loadHistory();
    }
  }, [user, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const { data } = await getChatHistory();
      if (data.length === 0) {
        // Just show a quiet welcome message without calling the API
        setMessages([{ 
          role: "assistant", 
          content: "Hello! I'm your NoRog Assistant. I'm here to help whenever you have a health question or need to log a concern.",
          options: [] 
        }]);
      } else {
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load history");
    }
  };

  const handleSend = async (text = null, quiet = false) => {
    const msgText = text || input;
    if (!msgText.trim()) return;

    if (!quiet) {
      setMessages(prev => [...prev, { role: "user", content: msgText }]);
      setInput("");
    }
    
    setLoading(true);
    try {
      const { data } = await sendChatMessage(msgText);
      setMessages(prev => [...prev, data]);
    } catch (err) {
      toast.error("Assistant disconnected. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm("Delete chat history and start over?")) {
      await resetChatHistory();
      setMessages([]);
      handleSend("Hello! I'm starting over.", true);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="glass-card w-[400px] h-[600px] mb-4 flex flex-col shadow-2xl animate-scale-in overflow-hidden border-[var(--color-brand-alpha)]">
          {/* Header */}
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-surface-alt)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-white text-lg"><Activity size={18} /></div>
              <div>
                <h3 className="text-sm font-bold">NoRog Assistant</h3>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Always Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleReset} className="p-1.5 hover:bg-white/10 rounded-lg text-[var(--color-text-muted)]" title="Clear Chat">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg flex items-center justify-center text-[var(--color-text-muted)]">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-[var(--color-bg-body)]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  m.role === "user" 
                    ? "bg-[var(--color-brand)] text-white rounded-tr-none" 
                    : "bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-tl-none"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  
                  {/* Smart Options */}
                  {m.role === "assistant" && m.options?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.options.map((opt, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleSend(opt)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-[var(--color-brand-alpha)] hover:bg-[var(--color-brand)] hover:text-white border border-[var(--color-brand)] rounded-full text-xs transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl rounded-tl-none p-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[var(--color-brand)] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[var(--color-brand)] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-[var(--color-brand)] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-surface-alt)]" 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <div className="relative">
              <input
                type="text"
                className="input-field pr-12 text-sm h-11"
                placeholder="Ask me anything about your health..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1.5 w-8 h-8 rounded-lg bg-[var(--color-brand)] text-white flex items-center justify-center disabled:opacity-50 transition-opacity"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl transition-all ${
          isOpen ? "bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] scale-90" : "bg-[var(--color-brand)] text-white hover:scale-110 active:scale-95"
        }`}
      >
        {isOpen ? <X size={24} /> : <Activity size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[var(--color-bg-body)] animate-pulse"></span>
        )}
      </button>
    </div>
  );
}
