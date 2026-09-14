"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email hoặc mật khẩu không đúng");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent" />
      <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="relative w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-xl shadow-indigo-500/30 ring-1 ring-white/10">
            S
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            StudyPlanner
          </h1>
          <p className="mt-1.5 text-[13px] text-indigo-200/60 font-medium">
            Đăng nhập để quản trị đế chế của bạn
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[13px] font-semibold text-indigo-200/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:border-indigo-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all backdrop-blur-sm"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[13px] font-semibold text-indigo-200/80">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:border-indigo-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all backdrop-blur-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-400 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-[13px] font-bold text-white shadow-xl shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:opacity-50 transition-all"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

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
      </div>
    </div>
  );
}
