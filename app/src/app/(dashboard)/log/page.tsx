"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project, Topic, ActivityLog, Mood, ActivityType } from "@/lib/types";

const moodOptions: { value: Mood; label: string; emoji: string }[] = [
  { value: "great", label: "Tuyệt vời", emoji: "😄" },
  { value: "good", label: "Tốt", emoji: "🙂" },
  { value: "okay", label: "Bình thường", emoji: "😐" },
  { value: "tired", label: "Mệt", emoji: "😴" },
  { value: "frustrated", label: "Chán nản", emoji: "😫" },
];

const activityTypes: { value: ActivityType; label: string }[] = [
  { value: "theory", label: "Lý thuyết" },
  { value: "exercise", label: "Bài tập" },
  { value: "mock_exam", label: "Đề thi thử" },
  { value: "practice", label: "Thực hành" },
  { value: "session", label: "Buổi học/luyện" },
];

interface Rewards {
  xp: number;
  gold: number;
  streakBonus: number;
  newStreak: number;
  newLevel: number;
  leveledUp: boolean;
  levelUpBonus: number;
}

export default function LogPage() {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [logs, setLogs] = useState<(ActivityLog & { topic?: Topic })[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("exercise");
  const [duration, setDuration] = useState("");
  const [value, setValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState<Mood | "">("");
  const [saving, setSaving] = useState(false);
  const [rewards, setRewards] = useState<Rewards | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadTopics(selectedProject);
    }
  }, [selectedProject]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: projectsData } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false });

    if (projectsData) {
      setProjects(projectsData);
      if (projectsData.length > 0) setSelectedProject(projectsData[0].id);
    }

    const { data: logsData } = await supabase
      .from("activity_logs")
      .select("*, topic:topics(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (logsData) setLogs(logsData as typeof logs);
  }

  async function loadTopics(projectId: string) {
    const { data } = await supabase
      .from("topics")
      .select("*")
      .eq("project_id", projectId)
      .order("order");
    setTopics(data ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setRewards(null);

    const res = await fetch("/api/log-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: selectedProject,
        topic_id: selectedTopic || null,
        type: activityType,
        duration_minutes: duration ? parseInt(duration) : null,
        value: value ? parseFloat(value) : null,
        max_value: maxValue ? parseFloat(maxValue) : null,
        notes: notes || null,
        mood: mood || null,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      if (data.rewards) {
        setRewards(data.rewards);
        setTimeout(() => setRewards(null), 8000);
      }
      setDuration("");
      setValue("");
      setMaxValue("");
      setNotes("");
      setMood("");
      loadData();
    }
    setSaving(false);
  }

  const currentProject = projects.find((p) => p.id === selectedProject);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Log hoạt động</h1>

      {rewards && (
        <div className="rounded-xl border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 p-4 shadow-lg animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎉</span>
            <h3 className="text-lg font-bold text-amber-800">Phần thưởng!</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">✨</span>
              <span className="font-semibold text-indigo-700">+{rewards.xp} XP</span>
              {rewards.streakBonus > 0 && (
                <span className="text-xs text-indigo-500">(+{rewards.streakBonus} streak bonus)</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🪙</span>
              <span className="font-semibold text-amber-700">+{rewards.gold} Gold</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">🔥</span>
              <span className="font-semibold text-orange-700">Streak: {rewards.newStreak} ngày</span>
            </div>
          </div>
          {rewards.leveledUp && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 p-2">
              <span className="text-xl">🏆</span>
              <span className="font-bold text-purple-800">
                Level Up! Bạn đã đạt Level {rewards.newLevel}!
              </span>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.is_primary ? "⭐" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Chuyên đề / Mảng</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">— Không chọn —</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.group}] {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Loại hoạt động</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as ActivityType)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {activityTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Thời gian (phút)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="45"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kết quả ({currentProject?.unit ?? "điểm"})
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                step="0.1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="8"
              />
              <span className="flex items-center text-gray-400">/</span>
              <input
                type="number"
                step="0.1"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="10"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tâm trạng</label>
          <div className="mt-2 flex gap-2">
            {moodOptions.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(mood === m.value ? "" : m.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  mood === m.value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Hôm nay học được gì..."
          />
        </div>

        <button
          type="submit"
          disabled={saving || !selectedProject}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </form>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử gần đây</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có hoạt động nào</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {log.mood ? moodOptions.find((m) => m.value === log.mood)?.emoji ?? "📝" : "📝"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {log.topic?.name ?? activityTypes.find((t) => t.value === log.type)?.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.date).toLocaleDateString("vi-VN")}
                      {log.duration_minutes && ` — ${log.duration_minutes} phút`}
                      {log.value != null && log.max_value != null && ` — ${log.value}/${log.max_value}`}
                    </p>
                  </div>
                </div>
                {log.notes && (
                  <p className="max-w-xs truncate text-xs text-gray-400">{log.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
