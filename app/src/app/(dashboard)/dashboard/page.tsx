import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getWeatherFromStreak,
  getLevelTitle,
  getFortressState,
  type User,
  type Project,
  type UserGameStats,
  type UserTopic,
  type Quest,
  type Topic,
} from "@/lib/types";
import { EmpireMap } from "@/components/empire-map";

async function getStudentDashboardData(supabase: ReturnType<typeof import("@/lib/supabase/server").createClient> extends Promise<infer T> ? T : never, userId: string) {
  const [
    { data: allProjects },
    { data: gameStats },
    { data: quests },
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("user_id", userId).order("is_primary", { ascending: false }),
    supabase.from("user_game_stats").select("*").eq("user_id", userId).single(),
    supabase.from("quests").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
  ]);

  const projects = (allProjects ?? []) as Project[];
  const primaryProject = projects[0] ?? null;

  const { data: userTopicsData } = await supabase
    .from("user_topics")
    .select("*, topic:topics(*)")
    .eq("user_id", userId);
  const userTopics = (userTopicsData as (UserTopic & { topic: Topic })[]) ?? [];

  const projectIds = projects.map((p) => p.id);
  let allTopics: Topic[] = [];
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from("topics")
      .select("*")
      .in("project_id", projectIds)
      .order("order");
    allTopics = (data ?? []) as Topic[];
  }

  return {
    projects,
    primaryProject,
    gameStats: gameStats as UserGameStats | null,
    quests: (quests ?? []) as Quest[],
    userTopics,
    allTopics,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile) redirect("/login");
  const user = profile as User;

  if (user.role === "parent") {
    return <ParentDashboard supabase={supabase} userId={user.id} />;
  }

  const { projects, primaryProject, gameStats, quests, userTopics, allTopics } = await getStudentDashboardData(supabase, user.id);
  const weather = getWeatherFromStreak(gameStats?.current_streak ?? 0);
  const levelTitle = getLevelTitle(gameStats?.level ?? 1);

  const daysUntilDeadline = primaryProject?.deadline
    ? Math.ceil((new Date(primaryProject.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const mapTopics = allTopics.map((t) => {
    const ut = userTopics.find((ut) => ut.topic_id === t.id);
    const fortress = getFortressState(ut?.avg_score ?? 0);
    const proj = projects.find((p) => p.id === t.project_id);
    return {
      name: t.name,
      group: t.group,
      score: ut?.avg_score ?? 0,
      level: fortress.level,
      projectName: proj?.name ?? "Chung",
    };
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 bg-clip-text text-transparent">
            Đế chế của bạn
          </h1>
          <p className="mt-1 text-[13px] text-slate-500 font-medium">
            {weather.emoji} {weather.name} · {levelTitle} · Level {gameStats?.level ?? 1}
          </p>
        </div>
        {daysUntilDeadline !== null && (
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 px-5 py-3 text-white shadow-xl shadow-indigo-500/25 ring-1 ring-white/10">
            <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">Countdown</p>
            <p className="text-3xl font-black tabular-nums tracking-tight">{daysUntilDeadline} <span className="text-sm font-semibold text-indigo-200">ngày</span></p>
          </div>
        )}
      </div>

      {/* 3D Empire Map */}
      <EmpireMap
        topics={mapTopics}
        weather={weather}
        streak={gameStats?.current_streak ?? 0}
        level={gameStats?.level ?? 1}
        xp={gameStats?.xp ?? 0}
        gold={gameStats?.gold ?? 0}
        projectName={primaryProject?.name ?? "Đế chế"}
        allProjectNames={projects.map((p) => p.name)}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Level" value={gameStats?.level ?? 1} color="indigo" icon="🏰" />
        <StatCard label="XP" value={gameStats?.xp ?? 0} color="cyan" icon="✨" />
        <StatCard label="Vàng" value={gameStats?.gold ?? 0} color="amber" icon="🪙" />
        <StatCard label="Streak" value={`${gameStats?.current_streak ?? 0} ngày`} color="orange" icon="🔥" />
      </div>

      {/* Quests */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm shadow-slate-200/50">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">⚔️</span>
          <h2 className="text-[15px] font-bold tracking-tight text-slate-900">Nhiệm vụ tuần</h2>
        </div>
        {quests.length === 0 ? (
          <p className="text-[13px] text-slate-400">Chưa có nhiệm vụ nào tuần này</p>
        ) : (
          <div className="space-y-2">
            {quests.map((q) => (
              <div
                key={q.id}
                className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                  q.is_completed ? "border-emerald-200 bg-emerald-50/50" : tierBorderColor(q.tier)
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{q.is_completed ? "✅" : tierIcon(q.tier)}</span>
                  <div>
                    <p className={`text-[13px] font-medium ${q.is_completed ? "text-emerald-700 line-through" : "text-slate-800"}`}>
                      {q.title}
                    </p>
                    {q.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{q.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right text-[11px] font-medium text-slate-400 tabular-nums">
                  <span>+{q.reward_xp} XP</span>
                  <span className="ml-2">+{q.reward_gold} G</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function ParentDashboard({ supabase, userId }: { supabase: any; userId: string }) {
  const { data: familyMembers } = await supabase
    .from("family_members")
    .select("*, user:users(*)")
    .eq("user_id", userId);

  const familyId = familyMembers?.[0]?.family_id;

  let children: User[] = [];
  if (familyId) {
    const { data: allMembers } = await supabase
      .from("family_members")
      .select("*, user:users(*)")
      .eq("family_id", familyId)
      .eq("role_in_family", "child");
    children = (allMembers ?? []).map((m: any) => m.user).filter(Boolean);
  }

  const { data: gameStats } = await supabase
    .from("user_game_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  const weather = getWeatherFromStreak(gameStats?.current_streak ?? 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 bg-clip-text text-transparent">
          Dashboard Phụ huynh
        </h1>
        <p className="mt-1 text-[13px] text-slate-500 font-medium">{weather.emoji} Theo dõi lộ trình con & project cá nhân</p>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm shadow-slate-200/50">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">👨‍👩‍👧‍👦</span>
          <h2 className="text-[15px] font-bold tracking-tight text-slate-900">Con của bạn</h2>
        </div>
        {children.length === 0 ? (
          <p className="text-[13px] text-slate-400">Chưa liên kết với con nào</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {children.map((child: User) => (
              <div key={child.id} className="rounded-lg border border-slate-200/80 p-3.5 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-[13px] font-semibold text-white">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">{child.name}</p>
                    <p className="text-[11px] text-slate-400">{child.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Level" value={gameStats?.level ?? 1} color="indigo" icon="🏰" />
        <StatCard label="XP" value={gameStats?.xp ?? 0} color="cyan" icon="✨" />
        <StatCard label="Streak" value={`${gameStats?.current_streak ?? 0} ngày`} color="orange" icon="🔥" />
        <StatCard label="Perfect Weeks" value={gameStats?.perfect_weeks ?? 0} color="emerald" icon="🏆" />
      </div>
    </div>
  );
}

const STAT_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  indigo: { bg: "from-indigo-500 to-indigo-700", text: "text-white", ring: "ring-indigo-400/20" },
  cyan: { bg: "from-cyan-500 to-teal-600", text: "text-white", ring: "ring-cyan-400/20" },
  amber: { bg: "from-amber-400 to-orange-500", text: "text-white", ring: "ring-amber-400/20" },
  orange: { bg: "from-orange-500 to-red-500", text: "text-white", ring: "ring-orange-400/20" },
  emerald: { bg: "from-emerald-500 to-green-600", text: "text-white", ring: "ring-emerald-400/20" },
};

function StatCard({ label, value, color = "indigo", icon }: { label: string; value: string | number; color?: string; icon?: string }) {
  const c = STAT_COLORS[color] ?? STAT_COLORS.indigo;
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${c.bg} px-4 py-4 shadow-lg ring-1 ${c.ring}`}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">{label}</p>
        {icon && <span className="text-lg opacity-80">{icon}</span>}
      </div>
      <p className={`mt-1 text-2xl font-black tabular-nums tracking-tight ${c.text}`}>{value}</p>
    </div>
  );
}

function tierIcon(tier: string) {
  switch (tier) {
    case "royal": return "👑";
    case "epic": return "🔥";
    case "challenge": return "⚡";
    default: return "📋";
  }
}

function tierBorderColor(tier: string) {
  switch (tier) {
    case "royal": return "border-amber-300 bg-amber-50";
    case "epic": return "border-purple-200 bg-purple-50";
    case "challenge": return "border-blue-200 bg-blue-50";
    default: return "border-gray-200";
  }
}
