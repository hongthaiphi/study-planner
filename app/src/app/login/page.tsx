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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-slate-200/60 bg-white p-7 shadow-xl shadow-slate-200/40">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
            S
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            StudyPlanner
          </h1>
          <p className="mt-1 text-[13px] text-slate-400">
            Đăng nhập để quản trị đế chế của bạn
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-slate-700">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-2">
            Tài khoản demo
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-500">
            <div><span className="font-medium text-slate-600">HS1:</span> hs1@studyplanner.dev</div>
            <div><span className="font-medium text-slate-600">HS2:</span> hs2@studyplanner.dev</div>
            <div><span className="font-medium text-slate-600">PH1:</span> ph1@studyplanner.dev</div>
            <div><span className="font-medium text-slate-600">PH2:</span> ph2@studyplanner.dev</div>
          </div>
        </div>
      </div>
    </div>
  );
}
