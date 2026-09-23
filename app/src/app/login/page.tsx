"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Tab = "login" | "register";
type Role = "student" | "mentor";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) window.location.href = "/dashboard";
    });
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email hoặc mật khẩu không đúng");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (name.trim().length < 2) {
      setError("Tên phải có ít nhất 2 ký tự");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name.trim(), role }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Đăng ký thất bại");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError("Đăng ký thành công nhưng không thể đăng nhập. Vui lòng đăng nhập lại.");
      setTab("login");
      setLoading(false);
      return;
    }

    window.location.href = role === "mentor" ? "/profile" : "/dashboard";
  }

  const inputClass =
    "mt-1.5 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:border-indigo-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all backdrop-blur-sm";

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent" />
      <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-xl shadow-indigo-500/30 ring-1 ring-white/10">
            S
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            StudyPlanner
          </h1>
          <p className="mt-1.5 text-[13px] text-indigo-200/60 font-medium">
            {tab === "login" ? "Đăng nhập để quản trị đế chế của bạn" : "Tạo tài khoản mới"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => { setTab("login"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition-all ${
              tab === "login"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setTab("register"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-[13px] font-semibold transition-all ${
              tab === "register"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-[13px] font-semibold text-indigo-200/80">Email</label>
              <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@example.com" />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-[13px] font-semibold text-indigo-200/80">Mật khẩu</label>
              <input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
            </div>
            {error && <p className="text-[13px] text-red-400 font-medium">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-[13px] font-bold text-white shadow-xl shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all">
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-[13px] font-semibold text-indigo-200/80">Tên hiển thị</label>
              <input id="reg-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-[13px] font-semibold text-indigo-200/80">Email</label>
              <input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@example.com" />
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-[13px] font-semibold text-indigo-200/80">Mật khẩu (tối thiểu 6 ký tự)</label>
              <input id="reg-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-[13px] font-semibold text-indigo-200/80 mb-2">Bạn là</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    role === "student"
                      ? "border-indigo-400/50 bg-indigo-500/15 ring-2 ring-indigo-500/30"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="text-lg">🎓</span>
                  <p className="text-[13px] font-bold text-white mt-1">Học sinh</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Quản lý lộ trình học tập</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("mentor")}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    role === "mentor"
                      ? "border-emerald-400/50 bg-emerald-500/15 ring-2 ring-emerald-500/30"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="text-lg">🧑‍🏫</span>
                  <p className="text-[13px] font-bold text-white mt-1">Mentor</p>
                  <p className="text-[10px] text-white/40 mt-0.5">Đồng hành cùng học sinh</p>
                </button>
              </div>
            </div>

            {error && <p className="text-[13px] text-red-400 font-medium">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-[13px] font-bold text-white shadow-xl shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all">
              {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </button>
          </form>
        )}

        <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300/50 mb-2">
            Tài khoản demo
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-white/40">
            <div><span className="font-medium text-white/60">HS1:</span> hs1@studyplanner.dev</div>
            <div><span className="font-medium text-white/60">HS2:</span> hs2@studyplanner.dev</div>
            <div><span className="font-medium text-white/60">MT1:</span> ph1@studyplanner.dev</div>
            <div><span className="font-medium text-white/60">MT2:</span> ph2@studyplanner.dev</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-[12px]">
          <Link href="/" className="text-indigo-300/50 hover:text-white transition-colors">
            Trang chủ
          </Link>
          <span className="text-white/10">|</span>
          <Link href="/help/student" className="text-indigo-300/50 hover:text-white transition-colors">
            Hướng dẫn
          </Link>
        </div>
        <p className="text-center text-[10px] text-white/20">v1.1.0</p>
      </div>
    </div>
  );
}
