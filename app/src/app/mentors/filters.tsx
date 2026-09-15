"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";

const ROLE_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "parent", label: "Phụ huynh" },
  { value: "tutor", label: "Gia sư" },
  { value: "teacher", label: "Thầy / Cô" },
];

export function MentorFilters({
  currentQuery,
  currentRole,
  currentSubject,
  allSubjects,
}: {
  currentQuery: string;
  currentRole: string;
  currentSubject: string;
  allSubjects: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(currentQuery);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/mentors?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams("q", query.trim());
  }

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên hoặc môn..."
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:border-indigo-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all backdrop-blur-sm"
        />
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Tìm
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {ROLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateParams("role", opt.value)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
              currentRole === opt.value
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}

        {allSubjects.length > 0 && (
          <>
            <span className="text-white/10 self-center">|</span>
            {allSubjects.slice(0, 8).map((s) => (
              <button
                key={s}
                onClick={() => updateParams("subject", currentSubject === s ? "" : s)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                  currentSubject === s
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
