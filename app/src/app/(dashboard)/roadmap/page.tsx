import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getFortressState } from "@/lib/types";
import type { Milestone, Project, Topic, UserTopic } from "@/lib/types";
import { CreateGoalButton, ProjectTabs } from "@/components/roadmap-client";
import {
  EditProjectButton,
  EditableTopicCard,
  AddTopicButton,
  EditableMilestone,
  AddMilestoneButton,
} from "@/components/edit-roadmap";

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: allProjects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false });

  const projects = (allProjects ?? []) as Project[];

  const params = await searchParams;
  const selectedId = params.project || projects[0]?.id;
  const selectedProject = projects.find((p) => p.id === selectedId) ?? projects[0] ?? null;

  let milestones: Milestone[] = [];
  let topics: Topic[] = [];
  let userTopics: (UserTopic & { topic?: Topic })[] = [];

  if (selectedProject) {
    const [milestonesRes, topicsRes, userTopicsRes] = await Promise.all([
      supabase.from("milestones").select("*").eq("project_id", selectedProject.id).order("order"),
      supabase.from("topics").select("*").eq("project_id", selectedProject.id).order("order"),
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Lộ trình</h1>
          {selectedProject && <EditProjectButton project={selectedProject} />}
        </div>
        <CreateGoalButton />
      </div>

      {/* Project Tabs */}
      {projects.length > 0 && (
        <ProjectTabs
          projects={projects.map((p) => ({ id: p.id, name: p.name, type: p.type }))}
          selectedId={selectedProject?.id ?? ""}
        />
      )}

      {!selectedProject && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-8 text-center">
          <p className="text-[13px] text-slate-400">Chưa có mục tiêu nào. Nhấn "Tạo mục tiêu" để bắt đầu.</p>
        </div>
      )}

      {/* Milestones Timeline */}
      {selectedProject && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 mb-4">Mốc quan trọng</h2>
          {milestones.length === 0 ? (
            <p className="text-[13px] text-slate-400 mb-2">Chưa có mốc nào.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-5">
                {milestones.map((m) => (
                  <EditableMilestone key={m.id} milestone={m} />
                ))}
              </div>
            </div>
          )}
          <AddMilestoneButton projectId={selectedProject.id} />
        </div>
      )}

      {/* Topics / Fortresses */}
      {selectedProject && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 mb-4">Chuyên đề</h2>
          {Object.keys(topicsByGroup).length === 0 ? (
            <p className="text-[13px] text-slate-400 mb-3">Chưa có chuyên đề nào trong mục tiêu này.</p>
          ) : (
            <div className="space-y-5">
              {Object.entries(topicsByGroup).map(([group, groupTopics]) => {
                const avgScore = groupTopics.reduce((sum, t) => {
                  const ut = userTopicMap.get(t.id);
                  return sum + (ut?.avg_score ?? 0);
                }, 0) / groupTopics.length;

                return (
                  <div key={group}>
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-[13px] font-semibold text-slate-700">{group}</h3>
                      <span className="text-[11px] text-slate-400 tabular-nums">TB: {Math.round(avgScore)}%</span>
                    </div>
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {groupTopics.map((topic) => {
                        const ut = userTopicMap.get(topic.id);
                        const score = ut?.avg_score ?? 0;
                        const fortress = getFortressState(score);

                        return (
                          <EditableTopicCard
                            key={topic.id}
                            topic={topic}
                            score={score}
                            fortressLevel={fortress.level}
                            fortressLabel={fortressLabel(fortress.level)}
                            fortressColor={fortressColor(fortress.level)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-3">
            <AddTopicButton projectId={selectedProject.id} defaultGroup={Object.keys(topicsByGroup)[0] ?? "Chung"} />
          </div>
        </div>
      )}
    </div>
  );
}

function fortressColor(level: string) {
  switch (level) {
    case "wasteland": return "bg-slate-300";
    case "exploring": return "bg-amber-400";
    case "basic": return "bg-blue-400";
    case "strong": return "bg-indigo-500";
    case "legendary": return "bg-purple-600";
    default: return "bg-slate-300";
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
