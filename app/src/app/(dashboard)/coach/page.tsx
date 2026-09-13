"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });

      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.message }]);
    } catch {
      setMessages([
        ...updated,
        { role: "assistant", content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại." },
      ]);
    }

    setLoading(false);
  }

  const quickPrompts = [
    "Hôm nay nên học gì?",
    "Đánh giá tuần của tôi",
    "Gợi ý chiến lược ôn thi",
    "Chuyên đề nào cần cải thiện nhất?",
  ];

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 bg-clip-text text-transparent mb-4">AI Coach</h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200/60 bg-white shadow-sm shadow-slate-200/50 p-5 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25">
              <span className="text-3xl">⚔️</span>
            </div>
            <p className="text-lg font-bold text-slate-800">
              Chào Lãnh chúa! Hôm nay cần gì?
            </p>
            <p className="mt-1.5 text-[13px] text-slate-500">
              Hỏi về lộ trình, gợi ý học tập, hoặc đánh giá tiến bộ
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="rounded-full border border-slate-200 bg-slate-50/50 px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-[13px] ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  : "bg-slate-50 text-slate-800 border border-slate-100 shadow-sm"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-[13px] text-slate-400 shadow-sm">
              <span className="inline-flex items-center gap-1">
                <span className="animate-pulse">Đang suy nghĩ</span>
                <span className="animate-bounce">...</span>
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="mt-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi AI Coach..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 transition-all"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
