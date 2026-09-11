"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectType } from "@/lib/types";

const PROJECT_TYPES: { value: ProjectType; label: string; desc: string }[] = [
  { value: "exam", label: "Thi cử", desc: "Ôn thi đại học, IELTS, SAT..." },
  { value: "learning", label: "Học tập", desc: "Học một kỹ năng hoặc môn mới" },
  { value: "skill", label: "Kỹ năng", desc: "Lập trình, vẽ, nhạc cụ..." },
  { value: "habit", label: "Thói quen", desc: "Đọc sách, tập thể dục..." },
  { value: "custom", label: "Tùy chỉnh", desc: "Mục tiêu khác" },
];

interface TopicInput {
  name: string;
  group: string;
}

interface MilestoneInput {
  name: string;
  date: string;
}

export function CreateGoalForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>("exam");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const [topics, setTopics] = useState<TopicInput[]>([
    { name: "", group: "Chung" },
  ]);

  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { name: "", date: "" },
  ]);

  function addTopic() {
    setTopics([...topics, { name: "", group: topics[topics.length - 1]?.group || "Chung" }]);
  }

  function removeTopic(i: number) {
    if (topics.length <= 1) return;
    setTopics(topics.filter((_, idx) => idx !== i));
  }

  function updateTopic(i: number, field: keyof TopicInput, value: string) {
    const next = [...topics];
    next[i] = { ...next[i], [field]: value };
    setTopics(next);
  }

  function addMilestone() {
    setMilestones([...milestones, { name: "", date: "" }]);
  }

  function removeMilestone(i: number) {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, idx) => idx !== i));
  }

  function updateMilestone(i: number, field: keyof MilestoneInput, value: string) {
    const next = [...milestones];
    next[i] = { ...next[i], [field]: value };
    setMilestones(next);
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const projRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, description, deadline: deadline || null }),
      });
      if (!projRes.ok) throw new Error("Không thể tạo project");
      const project = await projRes.json();

      const validTopics = topics.filter((t) => t.name.trim());
      if (validTopics.length > 0) {
        const topicsRes = await fetch("/api/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project_id: project.id, topics: validTopics }),
        });
        if (!topicsRes.ok) throw new Error("Không thể tạo chuyên đề");
      }

      const validMilestones = milestones.filter((m) => m.name.trim());
      if (validMilestones.length > 0) {
        const msRes = await fetch("/api/milestones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project_id: project.id, milestones: validMilestones }),
        });
        if (!msRes.ok) throw new Error("Không thể tạo mốc quan trọng");
      }

      router.refresh();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-300/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
              Tạo mục tiêu mới
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Bước {step} / 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700">
                  Tên mục tiêu
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Ôn thi Đại học 2027"
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-2">
                  Loại mục tiêu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROJECT_TYPES.map((pt) => (
                    <button
                      key={pt.value}
                      onClick={() => setType(pt.value)}
                      className={`rounded-lg border px-3 py-2.5 text-left transition-all ${
                        type === pt.value
                          ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className={`text-[13px] font-medium ${type === pt.value ? "text-indigo-700" : "text-slate-700"}`}>
                        {pt.label}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{pt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700">
                  Mô tả <span className="text-slate-400 font-normal">(tuỳ chọn)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Mô tả ngắn về mục tiêu..."
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-slate-700">
                  Deadline <span className="text-slate-400 font-normal">(tuỳ chọn)</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-slate-700">Chuyên đề / Chủ đề</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Các phần cần học trong mục tiêu</p>
                </div>
                <button
                  onClick={addTopic}
                  className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[11px] font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Thêm
                </button>
              </div>

              {topics.map((topic, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex-1 space-y-1.5">
                    <input
                      value={topic.name}
                      onChange={(e) => updateTopic(i, "name", e.target.value)}
                      placeholder={`Chuyên đề ${i + 1}, VD: Đại số`}
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                    />
                    <input
                      value={topic.group}
                      onChange={(e) => updateTopic(i, "group", e.target.value)}
                      placeholder="Nhóm, VD: Toán"
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-[11px] text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                    />
                  </div>
                  {topics.length > 1 && (
                    <button
                      onClick={() => removeTopic(i)}
                      className="mt-2 flex h-6 w-6 items-center justify-center rounded text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-slate-700">Mốc quan trọng</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Các cột mốc để theo dõi tiến độ</p>
                </div>
                <button
                  onClick={addMilestone}
                  className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[11px] font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Thêm
                </button>
              </div>

              {milestones.map((ms, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex-1 space-y-1.5">
                    <input
                      value={ms.name}
                      onChange={(e) => updateMilestone(i, "name", e.target.value)}
                      placeholder={`Mốc ${i + 1}, VD: Hoàn thành chương 1-5`}
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                    />
                    <input
                      type="date"
                      value={ms.date}
                      onChange={(e) => updateMilestone(i, "date", e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-[11px] text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                    />
                  </div>
                  {milestones.length > 1 && (
                    <button
                      onClick={() => removeMilestone(i)}
                      className="mt-2 flex h-6 w-6 items-center justify-center rounded text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="mt-3 text-[13px] font-medium text-red-500">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                Quay lại
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Huỷ
            </button>
            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1 && !name.trim()) {
                    setError("Vui lòng nhập tên mục tiêu");
                    return;
                  }
                  setError("");
                  setStep(step + 1);
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                Tiếp tục
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {loading ? "Đang tạo..." : "Tạo mục tiêu"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
