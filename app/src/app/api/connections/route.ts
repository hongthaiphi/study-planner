import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("connection_requests")
    .select("*, student:users!connection_requests_student_id_fkey(id, name, email, avatar, role), mentor:users!connection_requests_mentor_id_fkey(id, name, email, avatar, role)")
    .or(`student_id.eq.${user.id},mentor_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    return NextResponse.json({ error: "Only students can send requests" }, { status: 403 });
  }

  const body = await request.json();
  const mentorId = body.mentor_id;
  if (!mentorId) return NextResponse.json({ error: "mentor_id required" }, { status: 400 });

  const { data: mentorProfile } = await supabase
    .from("mentor_profiles")
    .select("id, max_students, is_public")
    .eq("id", mentorId)
    .eq("is_public", true)
    .single();

  if (!mentorProfile) return NextResponse.json({ error: "Mentor not found" }, { status: 404 });

  const { count: existing } = await supabase
    .from("connection_requests")
    .select("*", { count: "exact", head: true })
    .eq("student_id", user.id)
    .eq("mentor_id", mentorId)
    .in("status", ["pending", "accepted"]);

  if (existing && existing > 0) {
    return NextResponse.json({ error: "Request already exists" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("connection_requests")
    .insert({
      student_id: user.id,
      mentor_id: mentorId,
      message: (body.message ?? "").slice(0, 200) || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { request_id, status } = body;

  if (!request_id || !["accepted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid request_id or status" }, { status: 400 });
  }

  const { data: req } = await supabase
    .from("connection_requests")
    .select("*")
    .eq("id", request_id)
    .eq("mentor_id", user.id)
    .eq("status", "pending")
    .single();

  if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  const { error: updateError } = await supabase
    .from("connection_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", request_id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  if (status === "accepted") {
    const { data: existingGroups } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", user.id)
      .in("role_in_family", ["parent", "mentor"]);

    let groupId: string;

    if (existingGroups && existingGroups.length > 0) {
      groupId = existingGroups[0].family_id;
    } else {
      const { data: mentor } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .single();

      const { data: newGroup } = await supabase
        .from("families")
        .insert({ name: `Nhóm của ${mentor?.name ?? "Mentor"}` })
        .select()
        .single();

      if (!newGroup) return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
      groupId = newGroup.id;

      await supabase.from("family_members").insert({
        family_id: groupId,
        user_id: user.id,
        role_in_family: "parent",
      });
    }

    const { count: alreadyMember } = await supabase
      .from("family_members")
      .select("*", { count: "exact", head: true })
      .eq("family_id", groupId)
      .eq("user_id", req.student_id);

    if (!alreadyMember || alreadyMember === 0) {
      await supabase.from("family_members").insert({
        family_id: groupId,
        user_id: req.student_id,
        role_in_family: "child",
      });
    }
  }

  return NextResponse.json({ success: true });
}
