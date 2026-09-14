import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

async function verifyTopicOwnership(supabase: Awaited<ReturnType<typeof createClient>>, topicId: string, userId: string) {
  const { data } = await supabase
    .from("topics")
    .select("id, project:projects!inner(user_id)")
    .eq("id", topicId)
    .single();
  if (!data) return false;
  const project = data.project as unknown as { user_id: string };
  return project.user_id === userId;
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, group, weight } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (!await verifyTopicOwnership(supabase, id, user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (group !== undefined) updates.group = group;
  if (weight !== undefined) updates.weight = weight;

  const { data, error } = await supabase
    .from("topics")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (!await verifyTopicOwnership(supabase, id, user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await supabase.from("user_topics").delete().eq("topic_id", id);
  const { error } = await supabase.from("topics").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

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
