"use client";

import { useState, useEffect } from "react";
import type { ConnectionRequest, User } from "@/lib/types";

type RequestWithUsers = ConnectionRequest & { student: User; mentor: User };

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestWithUsers[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    const res = await fetch("/api/connections");
    if (res.ok) {
      setRequests(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => { loadRequests(); }, []);

  async function handleAction(requestId: string, status: "accepted" | "rejected") {
    await fetch("/api/connections", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: requestId, status }),
    });
    loadRequests();
  }

  const pending = requests.filter((r) => r.status === "pending");
  const handled = requests.filter((r) => r.status !== "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Yêu cầu kết nối</h1>
      <p className="text-sm text-slate-500 mb-6">Quản lý yêu cầu kết nối từ học sinh.</p>

      {pending.length === 0 && handled.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-2xl mb-2">📭</p>
          <p>Chưa có yêu cầu kết nối nào.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
            Đang chờ duyệt ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((r) => (
              <div key={r.id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-bold text-white">
                    {r.student?.name?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{r.student?.name}</p>
                    <p className="text-xs text-slate-500">{r.student?.email}</p>
                  </div>
                </div>
                {r.message && (
                  <p className="text-sm text-slate-600 bg-white rounded-lg p-2.5 mb-3 border border-slate-100">
                    &ldquo;{r.message}&rdquo;
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(r.id, "accepted")}
                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => handleAction(r.id, "rejected")}
                    className="flex-1 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {handled.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
            Đã xử lý
          </h2>
          <div className="space-y-2">
            {handled.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                    {r.student?.name?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{r.student?.name}</p>
                    <p className="text-xs text-slate-400">{r.student?.email}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  r.status === "accepted"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }`}>
                  {r.status === "accepted" ? "Đã chấp nhận" : "Đã từ chối"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
