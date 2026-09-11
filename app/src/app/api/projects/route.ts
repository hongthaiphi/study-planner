import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, type, description, deadline, unit } = body;

  if (!name || !type) {
    return NextResponse.json({ error: "name and type required" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_primary", true);

  const isPrimary = !existing || existing.length === 0;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name,
      type: type || "exam",
      description: description || null,
      deadline: deadline || null,
      unit: unit || "điểm",
      is_primary: isPrimary,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
