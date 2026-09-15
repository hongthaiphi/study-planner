import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { MentorProfile, User, MentorRoleType } from "@/lib/types";
import { MentorFilters } from "./filters";

const ROLE_LABELS: Record<MentorRoleType, string> = {
  parent: "Phụ huynh",
  tutor: "Gia sư",
  teacher: "Thầy / Cô giáo",
};

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; subject?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("mentor_profiles")
    .select("*, user:users(id, name, email, avatar, role)")
    .eq("is_public", true);

  if (params.role && ["parent", "tutor", "teacher"].includes(params.role)) {
    query = query.eq("role_type", params.role);
  }

  if (params.subject) {
    query = query.contains("subjects", [params.subject]);
  }

  const { data: profiles } = await query;
  const mentors = (profiles ?? []) as (MentorProfile & { user: User })[];

  const filtered = params.q
    ? mentors.filter(
        (m) =>
          m.user?.name.toLowerCase().includes(params.q!.toLowerCase()) ||
          m.subjects.some((s) => s.toLowerCase().includes(params.q!.toLowerCase()))
      )
    : mentors;

  const allSubjects = Array.from(new Set(mentors.flatMap((m) => m.subjects))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/15 via-transparent to-transparent" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold shadow-lg shadow-indigo-500/30">
            S
          </div>
          <span className="text-[15px] font-bold tracking-tight">StudyPlanner</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/help/student" className="hidden sm:inline text-[13px] font-medium text-slate-400 hover:text-white transition-colors">
            Hướng dẫn
          </Link>
          <Link href="/login" className="rounded-xl bg-white/10 px-4 py-2 text-[13px] font-semibold backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all">
            Đăng nhập
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Tìm <span className="text-emerald-400">Mentor</span> phù hợp
          </h1>
          <p className="mt-3 text-slate-400 max-w-lg mx-auto">
            Chọn mentor để đồng hành cùng bạn trên hành trình chinh phục tri thức.
          </p>
        </div>

        <MentorFilters
          currentQuery={params.q ?? ""}
          currentRole={params.role ?? ""}
          currentSubject={params.subject ?? ""}
          allSubjects={allSubjects}
        />

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-slate-400">Không tìm thấy mentor nào.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => {
              const initial = m.user?.name?.charAt(0)?.toUpperCase() ?? "?";
              return (
                <Link
                  key={m.id}
                  href={`/mentor/${m.id}`}
                  className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm hover:bg-white/[0.08] hover:border-white/20 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-lg font-bold text-white shadow-lg shadow-emerald-500/20">
                      {initial}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold group-hover:text-emerald-300 transition-colors">
                        {m.user?.name ?? "Mentor"}
                      </h3>
                      <p className="text-[12px] text-emerald-400/80">{ROLE_LABELS[m.role_type]}</p>
                    </div>
                  </div>

                  {m.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {m.subjects.slice(0, 4).map((s) => (
                        <span key={s} className="bg-emerald-500/10 text-emerald-300/80 text-[11px] font-medium px-2 py-1 rounded-md">
                          {s}
                        </span>
                      ))}
                      {m.subjects.length > 4 && (
                        <span className="text-[11px] text-slate-500">+{m.subjects.length - 4}</span>
                      )}
                    </div>
                  )}

                  {m.bio && (
                    <p className="text-[12px] text-slate-400 leading-relaxed mb-3 line-clamp-2">{m.bio}</p>
                  )}

                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-slate-500">
                      👥 {m.max_students} học sinh tối đa
                    </span>
                    <span className="text-indigo-400 font-medium group-hover:text-indigo-300 transition-colors">
                      Xem →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
