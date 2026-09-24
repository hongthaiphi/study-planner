"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityLog, Topic, User } from "@/lib/types";

export default function ChildProgressPage() {
  const supabase = createClient();
  const [children, setChildren] = useState<User[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [logs, setLogs] = useState<(ActivityLog & { topic?: Topic })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) loadChildLogs(selectedChild);
  }, [selectedChild]);

  async function loadChildren() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: fm } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", user.id)
      .single();

    if (fm) {
      const { data: members } = await supabase
        .from("family_members")
        .select("*, user:users(*)")
        .eq("family_id", fm.family_id)
        .in("role_in_family", ["child", "member"]);

      const kids = (members ?? []).map((m: any) => m.user).filter(Boolean);
      setChildren(kids);
      if (kids.length > 0) setSelectedChild(kids[0].id);
    }
    setLoading(false);
  }

  async function loadChildLogs(childId: string) {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data } = await supabase
      .from("activity_logs")
      .select("*, topic:topics(name, group)")
      .eq("user_id", childId)
      .gte("date", since.toISOString().split("T")[0])
      .order("date", { ascending: false });

    setLogs((data ?? []) as typeof logs);
  }

  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0);
  const totalSessions = logs.length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Học sinh</h1>
      <p className="text-sm text-gray-500 -mt-4">Theo dõi hoạt động và tiến bộ của học sinh</p>

      {children.length > 1 && (
        <div className="flex gap-2">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChild(c.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                selectedChild === c.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Buổi học (30 ngày)</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{totalSessions}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Tổng thời gian</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {Math.round(totalMinutes / 60)}h {totalMinutes % 60}m
              </p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">TB/ngày</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {Math.round(totalMinutes / 30)}m
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Hoạt động gần đây</h2>
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có hoạt động</p>
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 15).map((log) => (
                  <div key={log.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {log.topic?.name ?? log.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.date).toLocaleDateString("vi-VN")}
                        {log.duration_minutes && ` — ${log.duration_minutes} phút`}
                      </p>
                    </div>
                    {log.value != null && log.max_value != null && (
                      <span className={`text-sm font-medium ${
                        log.value / log.max_value >= 0.8
                          ? "text-green-600"
                          : log.value / log.max_value >= 0.5
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}>
                        {log.value}/{log.max_value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
