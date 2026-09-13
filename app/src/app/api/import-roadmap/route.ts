import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface ParsedRoadmap {
  name: string;
  type: string;
  deadline: string | null;
  description: string | null;
  topics: { name: string; group: string }[];
  milestones: { name: string; date: string | null }[];
}

const TYPE_MAP: Record<string, string> = {
  exam: "exam",
  "thi cử": "exam",
  "thi": "exam",
  learning: "learning",
  "học tập": "learning",
  skill: "skill",
  "kỹ năng": "skill",
  habit: "habit",
  "thói quen": "habit",
  custom: "custom",
  "tùy chỉnh": "custom",
};

function parseMarkdown(md: string): ParsedRoadmap {
  const lines = md.split("\n");
  const result: ParsedRoadmap = {
    name: "",
    type: "exam",
    deadline: null,
    description: null,
    topics: [],
    milestones: [],
  };

  let section: "meta" | "topics" | "milestones" = "meta";
  let currentGroup = "Chung";

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // H1 = project name
    if (line.startsWith("# ") && !line.startsWith("## ")) {
      result.name = line.slice(2).trim();
      section = "meta";
      continue;
    }

    // H2 = section switch
    if (line.startsWith("## ")) {
      const heading = line.slice(3).trim().toLowerCase();
      if (heading.includes("chuyên đề") || heading.includes("topic")) {
        section = "topics";
      } else if (heading.includes("mốc") || heading.includes("milestone")) {
        section = "milestones";
      }
      continue;
    }

    // H3 = topic group
    if (line.startsWith("### ")) {
      currentGroup = line.slice(4).trim();
      continue;
    }

    // Meta fields (under H1, before any H2)
    if (section === "meta" && line.startsWith("- ")) {
      const content = line.slice(2).trim();
      const colonIdx = content.indexOf(":");
      if (colonIdx > 0) {
        const key = content.slice(0, colonIdx).trim().toLowerCase();
        const val = content.slice(colonIdx + 1).trim();

        if (key === "loại" || key === "type") {
          result.type = TYPE_MAP[val.toLowerCase()] ?? "custom";
        } else if (key === "deadline" || key === "hạn") {
          const dateMatch = val.match(/\d{4}-\d{2}-\d{2}/);
          if (dateMatch) result.deadline = dateMatch[0];
        } else if (key === "mô tả" || key === "description") {
          result.description = val;
        }
      }
      continue;
    }

    // Topic items
    if (section === "topics" && line.startsWith("- ")) {
      const topicName = line.slice(2).trim();
      if (topicName) {
        result.topics.push({ name: topicName, group: currentGroup });
      }
      continue;
    }

    // Milestone items: "- YYYY-MM-DD: Name" or "- Name"
    if (section === "milestones" && line.startsWith("- ")) {
      const content = line.slice(2).trim();
      const dateMatch = content.match(/^(\d{4}-\d{2}-\d{2})\s*:\s*(.+)/);
      if (dateMatch) {
        result.milestones.push({ name: dateMatch[2].trim(), date: dateMatch[1] });
      } else {
        result.milestones.push({ name: content, date: null });
      }
      continue;
    }
  }

  return result;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const text = formData.get("text") as string | null;

  let markdown = "";
  if (file) {
    markdown = await file.text();
  } else if (text) {
    markdown = text;
  } else {
    return NextResponse.json({ error: "file or text required" }, { status: 400 });
  }

  const parsed = parseMarkdown(markdown);

  if (!parsed.name) {
    return NextResponse.json({ error: "Không tìm thấy tên mục tiêu (dòng # ...)" }, { status: 400 });
  }

  // Check if primary exists
  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_primary", true);

  const isPrimary = !existing || existing.length === 0;

  // Create project
  const { data: project, error: projError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: parsed.name,
      type: parsed.type,
      description: parsed.description,
      deadline: parsed.deadline,
      unit: "điểm",
      is_primary: isPrimary,
    })
    .select()
    .single();

  if (projError) {
    return NextResponse.json({ error: projError.message }, { status: 500 });
  }

  // Create topics
  let topicsCreated = 0;
  if (parsed.topics.length > 0) {
    const topicRows = parsed.topics.map((t, i) => ({
      project_id: project.id,
      name: t.name,
      group: t.group,
      level: "beginner",
      weight: 1 / parsed.topics.length,
      order: i,
    }));

    const { data: topicsData, error: topicsError } = await supabase
      .from("topics")
      .insert(topicRows)
      .select();

    if (topicsError) {
      return NextResponse.json({ error: topicsError.message }, { status: 500 });
    }

    topicsCreated = topicsData?.length ?? 0;

    // Create user_topics
    const userTopicRows = (topicsData ?? []).map((t) => ({
      user_id: user.id,
      topic_id: t.id,
      status: "not_started" as const,
      avg_score: 0,
    }));

    if (userTopicRows.length > 0) {
      await supabase.from("user_topics").insert(userTopicRows);
    }
  }

  // Create milestones
  let milestonesCreated = 0;
  if (parsed.milestones.length > 0) {
    const msRows = parsed.milestones.map((m, i) => ({
      project_id: project.id,
      name: m.name,
      date: m.date,
      status: "pending" as const,
      notes: null,
      order: i,
    }));

    const { data: msData, error: msError } = await supabase
      .from("milestones")
      .insert(msRows)
      .select();

    if (msError) {
      return NextResponse.json({ error: msError.message }, { status: 500 });
    }

    milestonesCreated = msData?.length ?? 0;
  }

  return NextResponse.json({
    project,
    summary: {
      name: parsed.name,
      type: parsed.type,
      topics: topicsCreated,
      milestones: milestonesCreated,
    },
  });
}
