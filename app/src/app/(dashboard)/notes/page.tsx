"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Note {
  id: string;
  mentor_id: string;
  student_id: string;
  date: string;
  content: string;
  created_at: string;
}

export default function NotesPage() {
  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [children, setChildren] = useState<{ id: string; name: string }[]>([]);
  const [selectedChild, setSelectedChild] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: fm } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", user.id)
      .single();

    if (fm) {
      const { data: members } = await supabase
        .from("family_members")
        .select("*, user:users(id, name)")
        .eq("family_id", fm.family_id)
        .in("role_in_family", ["child", "member"]);

      const kids = (members ?? []).map((m: any) => m.user).filter(Boolean);
      setChildren(kids);
      if (kids.length > 0 && !selectedChild) setSelectedChild(kids[0].id);
    }

    const { data } = await supabase
      .from("parent_notes")
      .select("*")
      .eq("parent_id", user.id)
      .order("date", { ascending: false })
      .limit(30);

    setNotes(data ?? []);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !selectedChild) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("parent_notes").insert({
      parent_id: user.id,
      student_id: selectedChild,
      content: content.trim(),
    });

    setContent("");
    setSaving(false);
    loadData();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">📋 Nhật ký quan sát</h1>

      {children.length > 1 && (
        <div className="flex gap-2">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChild(c.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                selectedChild === c.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-xl bg-white p-6 shadow-sm space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
          placeholder="Ghi chú hôm nay: tâm trạng con, feedback thầy cô, quan sát..."
        />
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu ghi chú"}
        </button>
      </form>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ghi chú gần đây</h2>
        {notes.filter((n) => n.student_id === selectedChild).length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có ghi chú nào</p>
        ) : (
          <div className="space-y-4">
            {notes
              .filter((n) => n.student_id === selectedChild)
              .map((note) => (
                <div key={note.id} className="border-l-2 border-indigo-200 pl-4">
                  <p className="text-xs text-gray-500">
                    {new Date(note.date).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
