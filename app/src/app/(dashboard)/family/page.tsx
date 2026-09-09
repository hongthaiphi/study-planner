import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getWeatherFromStreak, getLevelTitle } from "@/lib/types";
import type { User, UserGameStats } from "@/lib/types";

export default async function FamilyPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: myFamilyMember } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", authUser.id)
    .single();

  if (!myFamilyMember) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">👨‍👩‍👧‍👦 Gia đình</h1>
        <p className="text-sm text-gray-500">Chưa tham gia nhóm gia đình nào</p>
      </div>
    );
  }

  const { data: family } = await supabase
    .from("families")
    .select("*")
    .eq("id", myFamilyMember.family_id)
    .single();

  const { data: members } = await supabase
    .from("family_members")
    .select("*, user:users(*)")
    .eq("family_id", myFamilyMember.family_id);

  const memberUsers = (members ?? []).map((m: any) => ({
    ...m.user,
    role_in_family: m.role_in_family,
  })) as (User & { role_in_family: string })[];

  const userIds = memberUsers.map((u) => u.id);

  const { data: allGameStats } = await supabase
    .from("user_game_stats")
    .select("*")
    .in("user_id", userIds);

  const gameStatsMap = new Map(
    (allGameStats ?? []).map((gs: UserGameStats) => [gs.user_id, gs])
  );

  const totalStreak = memberUsers.reduce((sum, u) => {
    const gs = gameStatsMap.get(u.id);
    return sum + (gs?.current_streak ?? 0);
  }, 0);

  const allActive = memberUsers.every((u) => {
    const gs = gameStatsMap.get(u.id);
    return (gs?.current_streak ?? 0) > 0;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">👨‍👩‍👧‍👦 {family?.name ?? "Gia đình"}</h1>

      {/* Family Streak */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <p className="text-sm font-medium opacity-80">Streak gia đình</p>
        <p className="text-3xl font-bold mt-1">{totalStreak} ngày tổng cộng</p>
        <p className="mt-2 text-sm opacity-90">
          {allActive
            ? "Cả nhà đều đang nỗ lực! 🎉"
            : "Có thành viên đang nghỉ — cũng cần phục hồi 💪"}
        </p>
      </div>

      {/* Members */}
      <div className="grid gap-4 sm:grid-cols-2">
        {memberUsers.map((member) => {
          const gs = gameStatsMap.get(member.id);
          const weather = getWeatherFromStreak(gs?.current_streak ?? 0);
          const title = getLevelTitle(gs?.level ?? 1);

          return (
            <div key={member.id} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-xs text-gray-500">
                    {member.role_in_family === "parent" ? "Phụ huynh" : "Học sinh"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">Level</p>
                  <p className="text-sm font-bold text-gray-900">{gs?.level ?? 1}</p>
                  <p className="text-xs text-gray-400">{title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Streak</p>
                  <p className="text-sm font-bold text-gray-900">{gs?.current_streak ?? 0}</p>
                  <p className="text-xs text-gray-400">{weather.emoji} {weather.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">XP</p>
                  <p className="text-sm font-bold text-gray-900">{gs?.xp ?? 0}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
