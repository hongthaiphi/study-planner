import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { MentorProfile, User, MentorRoleType } from "@/lib/types";
import { ConnectButton } from "./connect-button";

const ROLE_LABELS: Record<MentorRoleType, string> = {
  parent: "Phụ huynh",
  tutor: "Gia sư",
  teacher: "Thầy / Cô giáo",
};

export default async function MentorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  let currentUserRole: string | null = null;
  let connectionStatus: string | null = null;

  if (authUser) {
    const { data: currentProfile } = await supabase
      .from("users")
      .select("role")
      .eq("id", authUser.id)
      .single();
    currentUserRole = currentProfile?.role ?? null;

    if (currentUserRole === "student") {
      const { data: existingReq } = await supabase
        .from("connection_requests")
        .select("status")
        .eq("student_id", authUser.id)
        .eq("mentor_id", id)
        .in("status", ["pending", "accepted"])
        .single();
      connectionStatus = existingReq?.status ?? null;
    }
  }

  const { data: profile } = await supabase
    .from("mentor_profiles")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (!profile) notFound();

  const mentorProfile = profile as MentorProfile;

  const { data: userData } = await supabase
    .from("users")
    .select("id, name, email, avatar, role")
    .eq("id", id)
    .single();

  if (!userData) notFound();

  const user = userData as User;

  const { data: mentorGroups } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", id)
    .in("role_in_family", ["parent", "mentor"]);

  const groupIds = mentorGroups?.map((r) => r.family_id) ?? [];
  let currentStudents = 0;

  if (groupIds.length > 0) {
    const { count: studentCount } = await supabase
      .from("family_members")
      .select("*", { count: "exact", head: true })
      .eq("role_in_family", "child")
      .in("family_id", groupIds);
    currentStudents = studentCount ?? 0;
  }

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/15 via-transparent to-transparent" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold shadow-lg shadow-indigo-500/30">
            S
          </div>
          <span className="text-[15px] font-bold tracking-tight">StudyPlanner</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/mentors" className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors">
            Tất cả Mentor
          </Link>
          {authUser ? (
            <Link href="/dashboard" className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-[13px] font-semibold shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition-all ring-1 ring-white/10">
              Vào Dashboard
            </Link>
          ) : (
            <Link href="/login" className="rounded-xl bg-white/10 px-4 py-2 text-[13px] font-semibold backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all">
              Đăng nhập
            </Link>
          )}
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <div className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm">
          {/* Avatar + Name */}
          <div className="flex items-center gap-5 mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-3xl font-bold text-white shadow-xl shadow-emerald-500/25 ring-2 ring-white/10">
              {initial}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{user.name}</h1>
              <p className="text-emerald-400 font-medium mt-0.5">{ROLE_LABELS[mentorProfile.role_type]}</p>
            </div>
          </div>

          {/* Bio */}
          {mentorProfile.bio && (
            <div className="mb-6">
              <p className="text-slate-300 leading-relaxed text-[15px] italic">&ldquo;{mentorProfile.bio}&rdquo;</p>
            </div>
          )}

          {/* Subjects */}
          {mentorProfile.subjects.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <span>📚</span> Môn giảng dạy
              </h3>
              <div className="flex flex-wrap gap-2">
                {mentorProfile.subjects.map((s) => (
                  <span key={s} className="bg-emerald-500/15 text-emerald-300 text-sm font-medium px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {mentorProfile.experience && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-400 mb-1 flex items-center gap-2">
                <span>💼</span> Kinh nghiệm
              </h3>
              <p className="text-white text-[15px]">{mentorProfile.experience}</p>
            </div>
          )}

          {/* Student count */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-1 flex items-center gap-2">
              <span>👥</span> Học sinh
            </h3>
            <p className="text-white text-[15px]">
              {currentStudents}/{mentorProfile.max_students}
              {currentStudents >= mentorProfile.max_students && (
                <span className="ml-2 text-amber-400 text-sm">(Đã đầy)</span>
              )}
            </p>
          </div>

          {/* CTA */}
          {currentStudents < mentorProfile.max_students && (
            authUser && currentUserRole === "student" ? (
              <ConnectButton mentorId={id} existingStatus={connectionStatus} />
            ) : !authUser ? (
              <Link
                href="/login"
                className="block text-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-[15px] font-bold shadow-xl shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 transition-all ring-1 ring-white/10"
              >
                Đăng nhập để gửi yêu cầu kết nối
              </Link>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
