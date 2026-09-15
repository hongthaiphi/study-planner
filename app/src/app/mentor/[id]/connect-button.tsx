"use client";

import { useState } from "react";

export function ConnectButton({
  mentorId,
  existingStatus,
}: {
  mentorId: string;
  existingStatus: string | null;
}) {
  const [status, setStatus] = useState(existingStatus);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (status === "accepted") {
    return (
      <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/25 px-6 py-3.5 text-center">
        <p className="text-emerald-300 font-bold text-[15px]">Đã kết nối</p>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="rounded-2xl bg-amber-500/15 border border-amber-500/25 px-6 py-3.5 text-center">
        <p className="text-amber-300 font-bold text-[15px]">Đang chờ mentor duyệt...</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 200))}
          placeholder="Giới thiệu ngắn về bản thân (tuỳ chọn)..."
          rows={2}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white placeholder:text-white/30 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none transition-all"
        />
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setLoading(true);
              const res = await fetch("/api/connections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mentor_id: mentorId, message }),
              });
              setLoading(false);
              if (res.ok) {
                setStatus("pending");
              }
            }}
            disabled={loading}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-[14px] font-bold shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all"
          >
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="rounded-xl bg-white/10 px-4 py-3 text-[14px] font-medium text-slate-400 hover:bg-white/20 transition-all"
          >
            Huỷ
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-[15px] font-bold shadow-xl shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 transition-all ring-1 ring-white/10"
    >
      Gửi yêu cầu kết nối
    </button>
  );
}
