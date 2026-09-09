"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WeeklyGoal, User } from "@/lib/types";

function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1);
  return d.toISOString().split("T")[0];
}

export default function WeeklyGoalsPage() {
  const supabase = createClient();
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [children, setChildren] = useState<User[]>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: familyMembers } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", user.id)
      .single();

    if (familyMembers) {
      const { data: members } = await supabase
        .from("family_members")
        .select("*, user:users(*)")
        .eq("family_id", familyMembers.family_id)
        .eq("role_in_family", "child");

      const kids = (members ?? []).map((m: any) => m.user).filter(Boolean);
      setChildren(kids);
      if (kids.length > 0 && !selectedChild) setSelectedChild(kids[0].id);
    }

    const weekStart = getWeekStart();
    const { data: goalsData } = await supabase
      .from("weekly_goals")
      .select("*")
      .eq("set_by_user_id", user.id)
      .gte("week_start", weekStart)
      .order("created_at");

    setGoals(goalsData ?? []);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newGoal.trim() || !selectedChild) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("weekly_goals").insert({
      student_id: selectedChild,
      set_by_user_id: user.id,
      week_start: getWeekStart(),
      description: newGoal.trim(),
    });

    setNewGoal("");
    setSaving(false);
    loadData();
  }

  async function toggleGoal(goal: WeeklyGoal) {
    await supabase
      .from("weekly_goals")
      .update({
        is_completed: !goal.is_completed,
        completed_at: goal.is_completed ? null : new Date().toISOString(),
      })
      .eq("id", goal.id);
    loadData();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">🎯 Mục tiêu tuần</h1>

      {children.length > 1 && (
        <div className="flex gap-2">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                selectedChild === child.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Thêm mục tiêu mới cho con..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={saving || !newGoal.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Thêm
        </button>
      </form>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tuần {getWeekStart()}
        </h2>
        {goals.filter((g) => g.student_id === selectedChild).length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có mục tiêu nào tuần này</p>
        ) : (
          <div className="space-y-3">
            {goals
              .filter((g) => g.student_id === selectedChild)
              .map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                >
                  <button
                    onClick={() => toggleGoal(goal)}
                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                      goal.is_completed
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {goal.is_completed && "✓"}
                  </button>
                  <span
                    className={`text-sm ${
                      goal.is_completed ? "text-gray-400 line-through" : "text-gray-800"
                    }`}
                  >
                    {goal.description}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
