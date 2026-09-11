"use client";

import { useState } from "react";
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
