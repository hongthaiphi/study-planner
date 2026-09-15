"use client";

import { useState, useEffect } from "react";
import type { MentorProfile, MentorRoleType } from "@/lib/types";

const SUGGESTED_SUBJECTS = [
  "Toán", "Lý", "Hoá", "Sinh", "Văn", "Sử", "Địa", "Anh",
  "Tin học", "IELTS", "TOEIC", "SAT", "Lập trình", "Âm nhạc", "Thể thao",
];

const ROLE_LABELS: Record<MentorRoleType, string> = {
  parent: "Phụ huynh",
  tutor: "Gia sư",
  teacher: "Thầy / Cô giáo",
};

export default function ProfileEditPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bio, setBio] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [experience, setExperience] = useState("");
  const [roleType, setRoleType] = useState<MentorRoleType>("tutor");
  const [isPublic, setIsPublic] = useState(true);
  const [maxStudents, setMaxStudents] = useState(5);

  useEffect(() => {
    fetch("/api/mentor-profile")
      .then((r) => r.json())
      .then((data: MentorProfile | null) => {
        if (data) {
          setBio(data.bio ?? "");
          setSubjects(data.subjects ?? []);
          setExperience(data.experience ?? "");
          setRoleType(data.role_type ?? "tutor");
          setIsPublic(data.is_public ?? true);
          setMaxStudents(data.max_students ?? 5);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function addSubject(s: string) {
    const trimmed = s.trim();
    if (trimmed && !subjects.includes(trimmed) && subjects.length < 20) {
      setSubjects([...subjects, trimmed]);
    }
    setSubjectInput("");
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/mentor-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, subjects, experience, role_type: roleType, is_public: isPublic, max_students: maxStudents }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Profile Mentor</h1>
      <p className="text-sm text-slate-500 mb-6">Thông tin này sẽ hiển thị công khai cho học sinh tìm kiếm.</p>

      <div className="space-y-5">
        {/* Role type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Vai trò</label>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(ROLE_LABELS) as MentorRoleType[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleType(r)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  roleType === r
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Giới thiệu <span className="font-normal text-slate-400">({bio.length}/500)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="Giới thiệu ngắn về bản thân, kinh nghiệm, phương pháp giảng dạy..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none transition-all"
          />
        </div>

        {/* Subjects */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Môn / Lĩnh vực</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {subjects.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1.5 rounded-lg">
                {s}
                <button type="button" onClick={() => setSubjects(subjects.filter((x) => x !== s))} className="text-indigo-400 hover:text-red-500 transition-colors">
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(subjectInput); } }}
              placeholder="Thêm môn..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
            <button type="button" onClick={() => addSubject(subjectInput)} className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition-colors">
              Thêm
            </button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {SUGGESTED_SUBJECTS.filter((s) => !subjects.includes(s)).slice(0, 8).map((s) => (
              <button key={s} type="button" onClick={() => addSubject(s)} className="text-xs text-slate-500 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-2 py-1 rounded-md transition-colors">
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Kinh nghiệm <span className="font-normal text-slate-400">({experience.length}/200)</span>
          </label>
          <input
            value={experience}
            onChange={(e) => setExperience(e.target.value.slice(0, 200))}
            placeholder="VD: 5 năm giảng dạy Hoá học, chuyên luyện thi HSG"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
        </div>

        {/* Max students */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số học sinh tối đa</label>
          <input
            type="number"
            min={1}
            max={20}
            value={maxStudents}
            onChange={(e) => setMaxStudents(Math.min(Math.max(Number(e.target.value) || 1, 1), 20))}
            className="w-24 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
          />
        </div>

        {/* Public toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`relative w-10 h-6 rounded-full transition-colors ${isPublic ? "bg-indigo-600" : "bg-slate-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? "translate-x-4" : ""}`} />
          </button>
          <span className="text-sm text-slate-700">Hiển thị profile công khai cho học sinh tìm kiếm</span>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all"
          >
            {saving ? "Đang lưu..." : "Lưu profile"}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-medium">Đã lưu thành công!</span>}
        </div>
      </div>
    </div>
  );
}
