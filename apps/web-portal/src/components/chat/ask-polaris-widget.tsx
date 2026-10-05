'use client';

import { useState } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AskPolarisWidget({ subdomain, officialName }: { subdomain: string; officialName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Halo! Saya Asisten Digital resmi dari ${officialName}. Ada yang bisa saya bantu terkait kebijakan daerah atau layanan publik?`,
    },
  ]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputQuestion.trim() || loading) return;

    const userText = inputQuestion.trim();
    setInputQuestion('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    try {
      const res = await fetch(`${API_BASE_URL}/constituent/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomainSlug: subdomain,
          question: userText,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || 'Mohon maaf, saat ini sistem sedang memproses antrean. Silakan coba sesaat lagi.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Terjadi kendala jaringan saat menghubungi asisten digital. Silakan coba kembali.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* FLOATING ACTION BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2.5 rounded-full bg-portal-primary px-5 py-3.5 text-sm font-bold text-white shadow-xl hover:opacity-95 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="h-5 w-5" />
          <span className="hidden sm:inline">Tanya Asisten Dewan</span>
          <span className="sm:hidden">Tanya AI</span>
        </button>
      )}

      {/* CHAT WINDOW MODAL */}
      {isOpen && (
        <div className="flex flex-col w-[360px] sm:w-[400px] h-[520px] rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* HEADER CHAT */}
          <div className="flex items-center justify-between p-4 bg-portal-primary text-white">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">POLARIS Civic Assistant</h4>
                <p className="text-[10px] opacity-80">Asisten Digital {officialName}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* MESSAGE AREA */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-portal-primary text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2 flex items-center space-x-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-portal-primary" />
                  <span className="text-[11px]">Asisten sedang menyusun jawaban...</span>
                </div>
              </div>
            )}
          </div>

          {/* CHAT INPUT FORM */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              placeholder="Tanyakan bansos, jalan rusak, regulasi..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2 text-xs focus:border-portal-primary focus:outline-none focus:ring-1 focus:ring-portal-primary"
            />
            <button
              type="submit"
              disabled={loading || !inputQuestion.trim()}
              className="rounded-xl bg-portal-primary p-2.5 text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
