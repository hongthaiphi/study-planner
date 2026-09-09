"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project, ProjectType } from "@/lib/types";
import Link from "next/link";

const projectTypeLabels: Record<ProjectType, { label: string; emoji: string }> = {
  exam: { label: "Ôn thi", emoji: "📚" },
  learning: { label: "Học tập", emoji: "🎓" },
  fitness: { label: "Thể thao", emoji: "🏃" },
  skill: { label: "Kỹ năng", emoji: "🛠️" },
  habit: { label: "Thói quen", emoji: "📖" },
  custom: { label: "Tự do", emoji: "⭐" },
};

export default function MyProjectsPage() {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>("learning");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [unit, setUnit] = useState("hours");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("is_primary", { ascending: false });

    setProjects(data ?? []);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isPrimary = projects.length === 0;

    await supabase.from("projects").insert({
      user_id: user.id,
      name: name.trim(),
      type,
      description: description || null,
      deadline: deadline || null,
      unit,
      is_primary: isPrimary,
    });

    setName("");
    setDescription("");
    setDeadline("");
    setShowForm(false);
    setSaving(false);
    loadProjects();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">👤 Project cá nhân</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          + Tạo mới
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl bg-white p-6 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên project</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="VD: IELTS 7.0, Chạy bộ 100km..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Loại</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProjectType)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {Object.entries(projectTypeLabels).map(([key, { label, emoji }]) => (
                  <option key={key} value={key}>
                    {emoji} {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Đơn vị đo</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="hours, km, score, pages..."
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              Tạo project
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Huỷ
            </button>
          </div>
        </form>
      )}

      {/* Project list */}
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => {
          const info = projectTypeLabels[project.type] ?? projectTypeLabels.custom;
          return (
            <div key={project.id} className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{info.emoji}</span>
                    <h3 className="text-base font-semibold text-gray-900">{project.name}</h3>
                    {project.is_primary && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Chính
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                <span>{info.label}</span>
                <span>Đơn vị: {project.unit}</span>
                {project.deadline && (
                  <span>Deadline: {new Date(project.deadline).toLocaleDateString("vi-VN")}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && !showForm && (
        <div className="rounded-xl bg-white p-12 shadow-sm text-center">
          <p className="text-4xl mb-4">🚀</p>
          <p className="text-lg font-semibold text-gray-700">Chưa có project nào</p>
          <p className="mt-1 text-sm text-gray-500">
            Tạo project đầu tiên để bắt đầu hành trình!
          </p>
        </div>
      )}
    </div>
  );
}
