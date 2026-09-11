import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { calculateLevel } from "@/lib/types";

interface LogPayload {
  project_id: string;
  topic_id: string | null;
  type: string;
  duration_minutes: number | null;
  value: number | null;
  max_value: number | null;
  notes: string | null;
  mood: string | null;
}

function calculateXpReward(payload: LogPayload): number {
  let xp = 10;

  if (payload.duration_minutes) {
    xp += Math.floor(payload.duration_minutes / 10) * 5;
  }

  if (payload.value != null && payload.max_value != null && payload.max_value > 0) {
    const ratio = payload.value / payload.max_value;
    if (ratio >= 0.9) xp += 20;
    else if (ratio >= 0.7) xp += 10;
    else if (ratio >= 0.5) xp += 5;
  }

  switch (payload.type) {
    case "mock_exam": xp = Math.round(xp * 1.5); break;
    case "exercise": xp = Math.round(xp * 1.2); break;
  }

  return xp;
}

function calculateGoldReward(payload: LogPayload): number {
  let gold = 5;

  if (payload.duration_minutes && payload.duration_minutes >= 60) {
    gold += 5;
  }

  if (payload.type === "mock_exam") gold += 5;

  return gold;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: LogPayload = await request.json();

  const { data: log, error: logError } = await supabase
    .from("activity_logs")
    .insert({
      user_id: user.id,
      project_id: payload.project_id,
      topic_id: payload.topic_id,
      type: payload.type,
      duration_minutes: payload.duration_minutes,
      value: payload.value,
      max_value: payload.max_value,
      notes: payload.notes,
      mood: payload.mood,
    })
    .select()
    .single();

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 400 });
  }

  const { data: stats } = await supabase
    .from("user_game_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!stats) {
    return NextResponse.json({ log, rewards: null });
  }

  const xpEarned = calculateXpReward(payload);
  const goldEarned = calculateGoldReward(payload);

  const today = new Date().toISOString().slice(0, 10);
  const { data: todayLogs } = await supabase
    .from("activity_logs")
    .select("id")
    .eq("user_id", user.id)
    .gte("date", today)
    .limit(2);

  const isFirstLogToday = (todayLogs?.length ?? 0) <= 1;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const { data: yesterdayLogs } = await supabase
    .from("activity_logs")
    .select("id")
    .eq("user_id", user.id)
    .gte("date", yesterday)
    .lt("date", today)
    .limit(1);

  let newStreak = stats.current_streak;
  if (isFirstLogToday) {
    if (yesterdayLogs && yesterdayLogs.length > 0) {
      newStreak = stats.current_streak + 1;
    } else if (stats.current_streak === 0) {
      newStreak = 1;
    } else {
      newStreak = 1;
    }
  }

  let streakBonus = 0;
  if (newStreak >= 14) streakBonus = 10;
  else if (newStreak >= 7) streakBonus = 5;
  else if (newStreak >= 3) streakBonus = 2;

  const totalXp = xpEarned + streakBonus;
  const newXp = stats.xp + totalXp;
  const newGold = stats.gold + goldEarned;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > stats.level;
  const newBestStreak = Math.max(stats.best_streak, newStreak);

  const { error: updateError } = await supabase
    .from("user_game_stats")
    .update({
      xp: newXp,
      gold: newGold,
      level: newLevel,
      current_streak: newStreak,
      best_streak: newBestStreak,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ log, rewards: null, error: updateError.message });
  }

  if (payload.topic_id) {
    const { data: existing } = await supabase
      .from("user_topics")
      .select("id, avg_score")
      .eq("user_id", user.id)
      .eq("topic_id", payload.topic_id)
      .single();

    if (existing) {
      const newScore = payload.value != null && payload.max_value
        ? Math.round((existing.avg_score + (payload.value / payload.max_value) * 100) / 2)
        : existing.avg_score;
      await supabase
        .from("user_topics")
        .update({ avg_score: newScore, status: "in_progress", last_studied_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      const score = payload.value != null && payload.max_value
        ? Math.round((payload.value / payload.max_value) * 100)
        : 0;
      await supabase.from("user_topics").insert({
        user_id: user.id,
        topic_id: payload.topic_id,
        status: "in_progress",
        avg_score: score,
        last_studied_at: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({
    log,
    rewards: {
      xp: totalXp,
      gold: goldEarned,
      streakBonus,
      newStreak,
      newLevel,
      leveledUp,
      levelUpBonus: leveledUp ? 50 : 0,
    },
  });
}
