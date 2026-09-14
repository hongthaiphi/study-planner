import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

async function verifyMilestoneOwnership(supabase: Awaited<ReturnType<typeof createClient>>, milestoneId: string, userId: string) {
  const { data } = await supabase
    .from("milestones")
    .select("id, project:projects!inner(user_id)")
    .eq("id", milestoneId)
    .single();
  if (!data) return false;
  const project = data.project as unknown as { user_id: string };
  return project.user_id === userId;
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, date, status, notes } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (!await verifyMilestoneOwnership(supabase, id, user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (date !== undefined) updates.date = date || null;
  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes || null;

  const { data, error } = await supabase
    .from("milestones")
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

  if (!await verifyMilestoneOwnership(supabase, id, user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase.from("milestones").delete().eq("id", id);

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
  const { project_id, milestones } = body;

  if (!project_id || !Array.isArray(milestones) || milestones.length === 0) {
    return NextResponse.json({ error: "project_id and milestones[] required" }, { status: 400 });
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

  const rows = milestones.map((m: { name: string; date?: string; notes?: string }, i: number) => ({
    project_id,
    name: m.name,
    date: m.date || null,
    status: "pending" as const,
    notes: m.notes || null,
    order: i,
  }));

  const { data, error } = await supabase.from("milestones").insert(rows).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
