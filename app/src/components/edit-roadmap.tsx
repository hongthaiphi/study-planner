"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project, Topic, Milestone, ProjectType } from "@/lib/types";

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "exam", label: "Thi cử" },
  { value: "learning", label: "Học tập" },
  { value: "skill", label: "Kỹ năng" },
  { value: "habit", label: "Thói quen" },
  { value: "custom", label: "Tùy chỉnh" },
];

// --- Edit Project Modal ---

export function EditProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [type, setType] = useState<ProjectType>(project.type);
  const [description, setDescription] = useState(project.description ?? "");
  const [deadline, setDeadline] = useState(project.deadline?.split("T")[0] ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim()) { setError("Tên không được trống"); return; }
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: project.id, name, type, description, deadline: deadline || null }),
    });
    if (!res.ok) { setError("Lỗi cập nhật"); setLoading(false); return; }
    router.refresh();
    onClose();
  }

  async function handleDelete() {
    if (!confirm("Xoá mục tiêu này? Tất cả chuyên đề và mốc quan trọng sẽ bị xoá.")) return;
    setLoading(true);
    await fetch("/api/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: project.id }),
    });
    router.push("/roadmap");
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-300/30">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">Chỉnh sửa mục tiêu</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="block text-[13px] font-medium text-slate-700">Tên mục tiêu</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Loại</label>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_TYPES.map((pt) => (
                <button key={pt.value} onClick={() => setType(pt.value)}
                  className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all ${type === pt.value ? "border-indigo-300 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-700">Mô tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-700">Deadline</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors" />
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <button onClick={handleDelete} disabled={loading}
            className="rounded-lg px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
            Xoá mục tiêu
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 hover:bg-slate-50 transition-colors">Huỷ</button>
            <button onClick={handleSave} disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors">
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Edit Project Button (trigger) ---

export function EditProjectButton({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} title="Chỉnh sửa mục tiêu"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      {open && <EditProjectModal project={project} onClose={() => setOpen(false)} />}
    </>
  );
}

// --- Editable Topic Card ---

export function EditableTopicCard({
  topic,
  score,
  fortressLevel,
  fortressLabel,
  fortressColor,
}: {
  topic: Topic;
  score: number;
  fortressLevel: string;
  fortressLabel: string;
  fortressColor: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(topic.name);
  const [group, setGroup] = useState(topic.group);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const res = await fetch("/api/topics", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: topic.id, name, group }),
    });
    setLoading(false);
    if (res.ok) { router.refresh(); setEditing(false); }
  }

  async function handleDelete() {
    if (!confirm(`Xoá chuyên đề "${topic.name}"?`)) return;
    await fetch("/api/topics", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: topic.id }),
    });
    router.refresh();
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-indigo-300 bg-indigo-50/30 p-3 ring-1 ring-indigo-200">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên chuyên đề"
          className="block w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        <input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Nhóm"
          className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        <div className="mt-2 flex items-center justify-between">
          <button onClick={handleDelete} className="text-[11px] text-red-500 hover:text-red-700 transition-colors">Xoá</button>
          <div className="flex gap-1.5">
            <button onClick={() => { setEditing(false); setName(topic.name); setGroup(topic.group); }}
              className="rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 transition-colors">Huỷ</button>
            <button onClick={handleSave} disabled={loading}
              className="rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
              {loading ? "..." : "Lưu"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-lg border border-slate-200/80 p-3 hover:border-indigo-300 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-slate-800">{topic.name}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 tabular-nums">{Math.round(topic.weight * 100)}%</span>
          <button onClick={() => setEditing(true)}
            className="flex h-5 w-5 items-center justify-center rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-slate-100">
        <div className={`h-1.5 rounded-full transition-all ${fortressColor}`} style={{ width: `${score}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
        <span>{fortressLabel}</span>
        <span className="tabular-nums">{Math.round(score)}%</span>
      </div>
    </div>
  );
}

// --- Add Topic Inline ---

export function AddTopicButton({ projectId, defaultGroup }: { projectId: string; defaultGroup: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [group, setGroup] = useState(defaultGroup);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, topics: [{ name, group }] }),
    });
    setLoading(false);
    if (res.ok) { router.refresh(); setOpen(false); setName(""); }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[12px] font-medium text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors w-full justify-center">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Thêm chuyên đề
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-indigo-300 bg-indigo-50/30 p-3 ring-1 ring-indigo-200">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên chuyên đề"
        autoFocus
        className="block w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
      <input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Nhóm"
        className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
      <div className="mt-2 flex justify-end gap-1.5">
        <button onClick={() => { setOpen(false); setName(""); }}
          className="rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 transition-colors">Huỷ</button>
        <button onClick={handleAdd} disabled={loading || !name.trim()}
          className="rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
          {loading ? "..." : "Thêm"}
        </button>
      </div>
    </div>
  );
}

// --- Editable Milestone ---

export function EditableMilestone({
  milestone,
}: {
  milestone: Milestone;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(milestone.name);
  const [date, setDate] = useState(milestone.date?.split("T")[0] ?? "");
  const [notes, setNotes] = useState(milestone.notes ?? "");
  const [loading, setLoading] = useState(false);

  const isPast = milestone.date && new Date(milestone.date) < new Date();

  async function handleSave() {
    setLoading(true);
    const res = await fetch("/api/milestones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: milestone.id, name, date: date || null, notes: notes || null }),
    });
    setLoading(false);
    if (res.ok) { router.refresh(); setEditing(false); }
  }

  async function handleToggleStatus() {
    const newStatus = milestone.status === "completed" ? "pending" : "completed";
    await fetch("/api/milestones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: milestone.id, status: newStatus }),
    });
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Xoá mốc "${milestone.name}"?`)) return;
    await fetch("/api/milestones", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: milestone.id }),
    });
    router.refresh();
  }

  if (editing) {
    return (
      <div className="relative flex gap-4 pl-10">
        <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-indigo-400 bg-white" />
        <div className="flex-1 rounded-lg border border-indigo-300 bg-indigo-50/30 p-3 ring-1 ring-indigo-200">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên mốc"
            className="block w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          <div className="mt-1.5 flex gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="block flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ghi chú (tuỳ chọn)"
            className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          <div className="mt-2 flex items-center justify-between">
            <button onClick={handleDelete} className="text-[11px] text-red-500 hover:text-red-700 transition-colors">Xoá</button>
            <div className="flex gap-1.5">
              <button onClick={() => { setEditing(false); setName(milestone.name); setDate(milestone.date?.split("T")[0] ?? ""); setNotes(milestone.notes ?? ""); }}
                className="rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 transition-colors">Huỷ</button>
              <button onClick={handleSave} disabled={loading}
                className="rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                {loading ? "..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex gap-4 pl-10">
      <button onClick={handleToggleStatus} title={milestone.status === "completed" ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
        className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 cursor-pointer transition-colors ${
          milestone.status === "completed"
            ? "border-emerald-500 bg-emerald-500 hover:bg-emerald-400"
            : isPast
            ? "border-red-400 bg-red-400 hover:bg-red-300"
            : "border-indigo-400 bg-white hover:bg-indigo-100"
        }`} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-slate-800">{milestone.name}</p>
          <button onClick={() => setEditing(true)}
            className="flex h-5 w-5 items-center justify-center rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
        {milestone.date && (
          <p className="text-[11px] text-slate-400 mt-0.5">
            {new Date(milestone.date).toLocaleDateString("vi-VN")}
            {!isPast && milestone.status !== "completed" && (
              <span className="ml-2 text-indigo-500 font-medium">
                còn {Math.ceil((new Date(milestone.date).getTime() - Date.now()) / 86400000)} ngày
              </span>
            )}
          </p>
        )}
        {milestone.notes && <p className="mt-0.5 text-[11px] text-slate-400">{milestone.notes}</p>}
      </div>
    </div>
  );
}

// --- Add Milestone Inline ---

export function AddMilestoneButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, milestones: [{ name, date: date || null }] }),
    });
    setLoading(false);
    if (res.ok) { router.refresh(); setOpen(false); setName(""); setDate(""); }
  }

  if (!open) {
    return (
      <div className="relative flex gap-4 pl-10 mt-3">
        <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-dashed border-slate-300" />
        <button onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-indigo-500 transition-colors">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Thêm mốc
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex gap-4 pl-10 mt-3">
      <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-indigo-400 bg-white" />
      <div className="flex-1 rounded-lg border border-indigo-300 bg-indigo-50/30 p-3 ring-1 ring-indigo-200">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên mốc quan trọng"
          autoFocus
          className="block w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="mt-1.5 block w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
        <div className="mt-2 flex justify-end gap-1.5">
          <button onClick={() => { setOpen(false); setName(""); setDate(""); }}
            className="rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 transition-colors">Huỷ</button>
          <button onClick={handleAdd} disabled={loading || !name.trim()}
            className="rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
            {loading ? "..." : "Thêm"}
          </button>
        </div>
      </div>
    </div>
  );
}
