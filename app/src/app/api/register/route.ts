import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, name, role } = body;

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }
  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Tên phải có ít nhất 2 ký tự" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Mật khẩu phải có ít nhất 6 ký tự" }, { status: 400 });
  }
  if (!["student", "mentor"].includes(role)) {
    return NextResponse.json({ error: "Vai trò không hợp lệ" }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already been registered") || authError.message.includes("already exists")) {
      return NextResponse.json({ error: "Email này đã được đăng ký" }, { status: 409 });
    }
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const userId = authData.user.id;

  const { error: userError } = await supabaseAdmin
    .from("users")
    .insert({ id: userId, name: name.trim(), email, role });

  if (userError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "Không thể tạo hồ sơ: " + userError.message }, { status: 500 });
  }

  const { error: statsError } = await supabaseAdmin
    .from("user_game_stats")
    .insert({ user_id: userId, level: 1, xp: 0, gold: 0, rare_materials: 0, current_streak: 0, best_streak: 0, perfect_weeks: 0 });

  if (statsError) {
    await supabaseAdmin.from("users").delete().eq("id", userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "Không thể khởi tạo game stats: " + statsError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, userId });
}
