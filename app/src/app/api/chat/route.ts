import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY ?? "";
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";

function buildStudentSystemPrompt(context: string) {
  return `Bạn là AI Coach trong hệ thống "Đế chế Tri thức" — một ứng dụng game hoá lộ trình học tập.

Vai trò: Huấn luyện viên thân thiện, nói chuyện với học sinh.

Nguyên tắc:
- Khen nỗ lực, không khen tài năng ("Em đã cố gắng luyện 5 bài" > "Em giỏi quá")
- Dùng "chưa" thay "không" ("Em chưa nắm vững" > "Em không biết")
- Gợi ý 2-3 option để học sinh tự chọn (tôn trọng tự chủ)
- Xen ngôn ngữ game: thành trì, lãnh thổ, nhiệm vụ, kinh nghiệm
- Ưu tiên gợi ý "làm đề" > "đọc lý thuyết"
- Celebrate ngay khi hoàn thành quest
- Giọng: thân thiện, năng động, như anh/chị đi trước

Dữ liệu hiện tại của học sinh:
${context}

Trả lời bằng tiếng Việt. Ngắn gọn, dưới 200 từ trừ khi cần phân tích chi tiết.`;
}

function buildParentSystemPrompt(context: string) {
  return `Bạn là AI Coach trong hệ thống "Đế chế Tri thức" — một ứng dụng quản trị mục tiêu.

Vai trò: Cố vấn đáng tin cậy, nói chuyện với phụ huynh.

Nguyên tắc:
- Tone bình tĩnh, chuyên nghiệp
- Gợi ý phụ huynh làm "consultant" (cố vấn) chứ không phải "manager" (quản lý)
- Báo cáo tính cách, thái độ bên cạnh điểm số
- Không dùng thuật ngữ chuyên môn
- Khi con nghỉ học: nói "bình thường, cần nghỉ ngơi" chứ không gây hoảng
- Gợi ý khen nỗ lực thay vì kết quả
- Mục tiêu tuần = đề xuất cùng con, không áp đặt
- Khi không đủ data: nói thẳng "chưa đủ dữ liệu"

Dữ liệu hiện tại:
${context}

Trả lời bằng tiếng Việt. Ngắn gọn, thiết thực.`;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!DEEPSEEK_API_KEY) {
    return Response.json({ error: "DEEPSEEK_API_KEY chưa được cấu hình" }, { status: 500 });
  }

  const { messages } = await request.json();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id);

  const { data: gameStats } = await supabase
    .from("user_game_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: recentLogs } = await supabase
    .from("activity_logs")
    .select("*, topic:topics(name, group)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: userTopics } = await supabase
    .from("user_topics")
    .select("*, topic:topics(name, group, weight)")
    .eq("user_id", user.id);

  const context = JSON.stringify({
    profile: { name: profile?.name, role: profile?.role },
    projects: projects?.map((p) => ({ name: p.name, type: p.type, deadline: p.deadline, unit: p.unit })),
    gameStats: gameStats ? { level: gameStats.level, xp: gameStats.xp, streak: gameStats.current_streak } : null,
    recentActivity: recentLogs?.map((l) => ({
      date: l.date,
      type: l.type,
      topic: l.topic?.name,
      duration: l.duration_minutes,
      score: l.value && l.max_value ? `${l.value}/${l.max_value}` : null,
      mood: l.mood,
    })),
    topicProgress: userTopics?.map((ut) => ({
      name: ut.topic?.name,
      group: ut.topic?.group,
      status: ut.status,
      avgScore: ut.avg_score,
      lastStudied: ut.last_studied_at,
    })),
  }, null, 2);

  const systemPrompt = profile?.role === "parent"
    ? buildParentSystemPrompt(context)
    : buildStudentSystemPrompt(context);

  try {
    const res = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `DeepSeek API error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "Không có phản hồi.";

    return Response.json({ message: text });
  } catch (e: any) {
    return Response.json({ error: e.message ?? "Lỗi kết nối DeepSeek" }, { status: 502 });
  }
}
