import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getFortressState } from "@/lib/types";
import type { Milestone, Topic, UserTopic } from "@/lib/types";

export default async function RoadmapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false });

  const primaryProject = projects?.[0];

  let milestones: Milestone[] = [];
  let topics: Topic[] = [];
  let userTopics: (UserTopic & { topic?: Topic })[] = [];

  if (primaryProject) {
    const [milestonesRes, topicsRes, userTopicsRes] = await Promise.all([
      supabase.from("milestones").select("*").eq("project_id", primaryProject.id).order("order"),
      supabase.from("topics").select("*").eq("project_id", primaryProject.id).order("order"),
      supabase.from("user_topics").select("*, topic:topics(*)").eq("user_id", user.id),
    ]);
    milestones = (milestonesRes.data ?? []) as Milestone[];
    topics = (topicsRes.data ?? []) as Topic[];
    userTopics = (userTopicsRes.data ?? []) as typeof userTopics;
  }

  const topicsByGroup = topics.reduce<Record<string, Topic[]>>((acc, t) => {
    if (!acc[t.group]) acc[t.group] = [];
    acc[t.group].push(t);
    return acc;
  }, {});

  const userTopicMap = new Map(userTopics.map((ut) => [ut.topic_id, ut]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🗺️ Lộ trình</h1>
        {primaryProject && (
          <span className="rounded-lg bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
            {primaryProject.name}
          </span>
        )}
      </div>

      {/* Milestones Timeline */}
      {milestones.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 Mốc quan trọng</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {milestones.map((m) => {
                const isPast = m.date && new Date(m.date) < new Date();
                return (
                  <div key={m.id} className="relative flex gap-4 pl-10">
                    <div className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 ${
                      m.status === "completed"
                        ? "border-green-500 bg-green-500"
                        : isPast
                        ? "border-red-400 bg-red-400"
                        : "border-indigo-400 bg-white"
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.name}</p>
                      {m.date && (
                        <p className="text-xs text-gray-500">
                          {new Date(m.date).toLocaleDateString("vi-VN")}
                          {!isPast && m.status !== "completed" && (
                            <span className="ml-2 text-indigo-600">
                              còn {Math.ceil((new Date(m.date).getTime() - Date.now()) / (86400000))} ngày
                            </span>
                          )}
                        </p>
                      )}
                      {m.notes && <p className="mt-1 text-xs text-gray-400">{m.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Topics / Fortresses */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🏰 Chuyên đề (Thành trì)</h2>
        {Object.keys(topicsByGroup).length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có chuyên đề nào</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(topicsByGroup).map(([group, groupTopics]) => {
              const avgScore = groupTopics.reduce((sum, t) => {
                const ut = userTopicMap.get(t.id);
                return sum + (ut?.avg_score ?? 0);
              }, 0) / groupTopics.length;

              return (
                <div key={group}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">{group}</h3>
                    <span className="text-xs text-gray-500">TB: {Math.round(avgScore)}%</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {groupTopics.map((topic) => {
                      const ut = userTopicMap.get(topic.id);
                      const score = ut?.avg_score ?? 0;
                      const fortress = getFortressState(score);

                      return (
                        <div
                          key={topic.id}
                          className="rounded-lg border border-gray-200 p-3 hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-800">{topic.name}</p>
                            <span className="text-xs text-gray-400">
                              {Math.round(topic.weight * 100)}%
                            </span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-gray-100">
                            <div
                              className={`h-2 rounded-full transition-all ${fortressColor(fortress.level)}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                            <span>{fortressLabel(fortress.level)}</span>
                            <span>{Math.round(score)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
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

function fortressLabel(level: string) {
  switch (level) {
    case "wasteland": return "Đất hoang";
    case "exploring": return "Đang khai phá";
    case "basic": return "Thành trì cơ bản";
    case "strong": return "Thành trì vững chắc";
    case "legendary": return "Pháo đài huyền thoại";
    default: return "Đất hoang";
  }
}
