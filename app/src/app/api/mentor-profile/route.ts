import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("mentor_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return NextResponse.json(data);
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

  if (!profile || (profile.role !== "mentor" && profile.role !== "parent")) {
    return NextResponse.json({ error: "Not a mentor" }, { status: 403 });
  }

  const body = await request.json();
  const payload = {
    id: user.id,
    bio: (body.bio ?? "").slice(0, 500) || null,
    subjects: Array.isArray(body.subjects) ? body.subjects.slice(0, 20) : [],
    experience: (body.experience ?? "").slice(0, 200) || null,
    role_type: ["parent", "tutor", "teacher"].includes(body.role_type) ? body.role_type : "tutor",
    is_public: body.is_public !== false,
    max_students: Math.min(Math.max(Number(body.max_students) || 5, 1), 20),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("mentor_profiles")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
