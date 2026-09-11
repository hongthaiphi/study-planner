import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { project_id, topics } = body;

  if (!project_id || !Array.isArray(topics) || topics.length === 0) {
    return NextResponse.json({ error: "project_id and topics[] required" }, { status: 400 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", project_id)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const rows = topics.map((t: { name: string; group: string; weight?: number }, i: number) => ({
    project_id,
    name: t.name,
    group: t.group || "Chung",
    level: "beginner",
    weight: t.weight ?? 1 / topics.length,
    order: i,
  }));

  const { data, error } = await supabase.from("topics").insert(rows).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userTopicRows = (data ?? []).map((t) => ({
    user_id: user.id,
    topic_id: t.id,
    status: "not_started" as const,
    avg_score: 0,
  }));

  if (userTopicRows.length > 0) {
    await supabase.from("user_topics").insert(userTopicRows);
  }

  return NextResponse.json(data);
}
