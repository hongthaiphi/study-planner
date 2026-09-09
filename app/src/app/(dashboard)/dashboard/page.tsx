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

async function getStudentDashboardData(supabase: ReturnType<typeof import("@/lib/supabase/server").createClient> extends Promise<infer T> ? T : never, userId: string) {
  const [
    { data: projects },
    { data: gameStats },
    { data: quests },
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("user_id", userId).eq("is_primary", true).single(),
    supabase.from("user_game_stats").select("*").eq("user_id", userId).single(),
    supabase.from("quests").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
  ]);

  let topics: (UserTopic & { topic: Topic })[] = [];
  if (projects) {
    const { data } = await supabase
      .from("user_topics")
      .select("*, topic:topics(*)")
      .eq("user_id", userId);
    topics = (data as typeof topics) ?? [];
  }

  return { project: projects as Project | null, gameStats: gameStats as UserGameStats | null, quests: (quests ?? []) as Quest[], topics };
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

  const { project, gameStats, quests, topics } = await getStudentDashboardData(supabase, user.id);
  const weather = getWeatherFromStreak(gameStats?.current_streak ?? 0);
  const levelTitle = getLevelTitle(gameStats?.level ?? 1);

  const topicsByGroup = topics.reduce<Record<string, typeof topics>>((acc, ut) => {
    const group = ut.topic?.group ?? "Khác";
    if (!acc[group]) acc[group] = [];
    acc[group].push(ut);
    return acc;
  }, {});

  const daysUntilDeadline = project?.deadline
    ? Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {weather.emoji} Đế chế của bạn
          </h1>
          <p className="text-sm text-gray-500">
            {weather.name} — {levelTitle} (Level {gameStats?.level ?? 1})
          </p>
        </div>
        {daysUntilDeadline !== null && (
          <div className="rounded-xl bg-indigo-600 px-4 py-2 text-white">
            <p className="text-xs font-medium opacity-80">Countdown</p>
            <p className="text-2xl font-bold">{daysUntilDeadline} ngày</p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Level" value={gameStats?.level ?? 1} icon="⭐" />
        <StatCard label="XP" value={gameStats?.xp ?? 0} icon="✨" />
        <StatCard label="Vàng" value={gameStats?.gold ?? 0} icon="🪙" />
        <StatCard label="Streak" value={`${gameStats?.current_streak ?? 0} ngày`} icon={weather.emoji} />
      </div>

      {/* Quests */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">⚔️ Nhiệm vụ tuần</h2>
        {quests.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có nhiệm vụ nào tuần này</p>
        ) : (
          <div className="space-y-3">
            {quests.map((q) => (
              <div
                key={q.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  q.is_completed ? "border-green-200 bg-green-50" : tierBorderColor(q.tier)
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{q.is_completed ? "✅" : tierIcon(q.tier)}</span>
                  <div>
                    <p className={`text-sm font-medium ${q.is_completed ? "text-green-700 line-through" : "text-gray-900"}`}>
                      {q.title}
                    </p>
                    {q.description && (
                      <p className="text-xs text-gray-500">{q.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <span>+{q.reward_xp} XP</span>
                  <span className="ml-2">+{q.reward_gold} 🪙</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empire Map — Territory Grid */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Bản đồ Đế chế</h2>
        {Object.keys(topicsByGroup).length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có chuyên đề nào</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(topicsByGroup).map(([group, userTopics]) => (
              <div key={group} className="rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">{group}</h3>
                <div className="space-y-2">
                  {userTopics.map((ut) => {
                    const fortress = getFortressState(ut.avg_score);
                    return (
                      <div key={ut.id} className="flex items-center gap-3">
                        <span className="text-sm">{fortressEmoji(fortress.level)}</span>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-800">{ut.topic?.name}</p>
                          <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                            <div
                              className={`h-1.5 rounded-full ${fortressColor(fortress.level)}`}
                              style={{ width: `${fortress.percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{Math.round(ut.avg_score)}%</span>
                      </div>
                    );
                  })}
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {weather.emoji} Dashboard Phụ huynh
        </h1>
        <p className="text-sm text-gray-500">Theo dõi lộ trình con & project cá nhân</p>
      </div>

      {/* Children overview */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">👨‍👩‍👧‍👦 Con của bạn</h2>
        {children.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa liên kết với con nào</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {children.map((child: User) => (
              <div key={child.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{child.name}</p>
                    <p className="text-xs text-gray-500">{child.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Level" value={gameStats?.level ?? 1} icon="⭐" />
        <StatCard label="XP" value={gameStats?.xp ?? 0} icon="✨" />
        <StatCard label="Streak" value={`${gameStats?.current_streak ?? 0} ngày`} icon={weather.emoji} />
        <StatCard label="Perfect Weeks" value={gameStats?.perfect_weeks ?? 0} icon="🏆" />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
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

function fortressEmoji(level: string) {
  switch (level) {
    case "wasteland": return "🌫️";
    case "exploring": return "⛏️";
    case "basic": return "🏠";
    case "strong": return "🏰";
    case "legendary": return "🏯";
    default: return "🌫️";
  }
}

function fortressColor(level: string) {
  switch (level) {
    case "wasteland": return "bg-gray-300";
    case "exploring": return "bg-yellow-400";
    case "basic": return "bg-blue-400";
    case "strong": return "bg-indigo-500";
    case "legendary": return "bg-purple-600";
    default: return "bg-gray-300";
  }
}
