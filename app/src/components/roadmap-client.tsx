"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreateGoalForm } from "./create-goal-form";

export function CreateGoalButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Tạo mục tiêu
      </button>
      {open && <CreateGoalForm onClose={() => setOpen(false)} />}
    </>
  );
}

const TYPE_ICONS: Record<string, string> = {
  exam: "📝",
  learning: "📚",
  skill: "🎯",
  habit: "🔄",
  custom: "⚡",
};

export function ProjectTabs({
  projects,
  selectedId,
}: {
  projects: { id: string; name: string; type: string }[];
  selectedId: string;
}) {
  const router = useRouter();

  function handleSelect(id: string) {
    router.push(`/roadmap?project=${id}`);
  }

  if (projects.length <= 1) return null;

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      {projects.map((p) => {
        const active = p.id === selectedId;
        return (
          <button
            key={p.id}
            onClick={() => handleSelect(p.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all ${
              active
                ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <span className="text-sm">{TYPE_ICONS[p.type] ?? "📋"}</span>
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
