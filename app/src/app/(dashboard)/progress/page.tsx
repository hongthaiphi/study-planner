"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityLog, Topic } from "@/lib/types";

export default function ProgressPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<(ActivityLog & { topic?: Topic })[]>([]);
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period]);

  async function loadData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const since = new Date();
    since.setDate(since.getDate() - parseInt(period));

    const { data } = await supabase
      .from("activity_logs")
      .select("*, topic:topics(name, group)")
      .eq("user_id", user.id)
      .gte("date", since.toISOString().split("T")[0])
      .order("date", { ascending: true });

    setLogs((data ?? []) as typeof logs);
    setLoading(false);
  }

  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0);
  const totalSessions = logs.length;
  const avgScore = (() => {
    const scored = logs.filter((l) => l.value != null && l.max_value != null && l.max_value > 0);
    if (scored.length === 0) return null;
    return scored.reduce((sum, l) => sum + (l.value! / l.max_value!) * 100, 0) / scored.length;
  })();

  const byDate = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.date] = (acc[l.date] ?? 0) + (l.duration_minutes ?? 0);
    return acc;
  }, {});

  const byType = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.type] = (acc[l.type] ?? 0) + 1;
    return acc;
  }, {});

  const byTopic = logs.reduce<Record<string, { count: number; totalMinutes: number }>>((acc, l) => {
    const name = l.topic?.name ?? "Không chọn";
    if (!acc[name]) acc[name] = { count: 0, totalMinutes: 0 };
    acc[name].count++;
    acc[name].totalMinutes += l.duration_minutes ?? 0;
    return acc;
  }, {});

  const moodCounts = logs.reduce<Record<string, number>>((acc, l) => {
    if (l.mood) acc[l.mood] = (acc[l.mood] ?? 0) + 1;
    return acc;
  }, {});

  const typeLabels: Record<string, string> = {
    theory: "Lý thuyết",
    exercise: "Bài tập",
    mock_exam: "Đề thi thử",
    practice: "Thực hành",
    session: "Buổi học",
  };

  const moodEmojis: Record<string, string> = {
    great: "😄",
    good: "🙂",
    okay: "😐",
    tired: "😴",
    frustrated: "😫",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">📊 Tiến bộ</h1>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {(["7", "30", "90"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                period === p
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {p} ngày
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard label="Tổng buổi" value={totalSessions} />
            <SummaryCard label="Tổng thời gian" value={`${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m`} />
            <SummaryCard label="TB/ngày" value={`${Math.round(totalMinutes / parseInt(period))}m`} />
            <SummaryCard label="Điểm TB" value={avgScore ? `${Math.round(avgScore)}%` : "—"} />
          </div>

          {/* Activity Heatmap (simplified) */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Hoạt động theo ngày</h2>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: parseInt(period) }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - parseInt(period) + i + 1);
                const key = d.toISOString().split("T")[0];
                const minutes = byDate[key] ?? 0;
                return (
                  <div
                    key={key}
                    title={`${key}: ${minutes} phút`}
                    className={`h-4 w-4 rounded-sm ${
                      minutes === 0
                        ? "bg-gray-100"
                        : minutes < 30
                        ? "bg-green-200"
                        : minutes < 60
                        ? "bg-green-400"
                        : "bg-green-600"
                    }`}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <span>Ít</span>
              <div className="h-3 w-3 rounded-sm bg-gray-100" />
              <div className="h-3 w-3 rounded-sm bg-green-200" />
              <div className="h-3 w-3 rounded-sm bg-green-400" />
              <div className="h-3 w-3 rounded-sm bg-green-600" />
              <span>Nhiều</span>
            </div>
          </div>

          {/* By Type */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Theo loại</h2>
              <div className="space-y-3">
                {Object.entries(byType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{typeLabels[type] ?? type}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full bg-indigo-500"
                            style={{ width: `${(count / totalSessions) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs text-gray-500">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">😊 Tâm trạng</h2>
              {Object.keys(moodCounts).length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(moodCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([mood, count]) => (
                      <div key={mood} className="flex items-center justify-between">
                        <span className="text-sm">
                          {moodEmojis[mood]} {mood}
                        </span>
                        <span className="text-xs text-gray-500">{count} lần</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* By Topic */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🏰 Theo chuyên đề</h2>
            {Object.keys(byTopic).length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(byTopic)
                  .sort((a, b) => b[1].totalMinutes - a[1].totalMinutes)
                  .map(([name, stats]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{name}</span>
                      <div className="text-right text-xs text-gray-500">
                        <span>{stats.count} buổi</span>
                        <span className="ml-3">{stats.totalMinutes}m</span>
                      </div>
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

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
