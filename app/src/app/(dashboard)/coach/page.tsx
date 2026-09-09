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
      <h1 className="text-2xl font-bold text-gray-900 mb-4">🤖 AI Coach</h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl bg-white shadow-sm p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-4xl mb-4">⚔️</p>
            <p className="text-lg font-semibold text-gray-700">
              Chào Lãnh chúa! Hôm nay cần gì?
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Hỏi về lộ trình, gợi ý học tập, hoặc đánh giá tiến bộ
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
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
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-500">
              Đang suy nghĩ...
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
          className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Gửi
        </button>
      </form>
    </div>
  );
}
