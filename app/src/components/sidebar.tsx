"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { User } from "@/lib/types";

const studentNav = [
  { href: "/dashboard", label: "Đế chế", icon: "castle" },
  { href: "/roadmap", label: "Lộ trình", icon: "map" },
  { href: "/log", label: "Log", icon: "edit" },
  { href: "/progress", label: "Tiến bộ", icon: "chart" },
  { href: "/coach", label: "Coach", icon: "bot" },
  { href: "/mentors", label: "Tìm Mentor", icon: "search" },
];

const mentorNav = [
  { href: "/dashboard", label: "Dashboard", icon: "castle" },
  { href: "/weekly-goals", label: "Mục tiêu", icon: "target" },
  { href: "/notes", label: "Nhật ký", icon: "clipboard" },
  { href: "/child-progress", label: "Tiến bộ", icon: "chart" },
  { href: "/coach", label: "Coach", icon: "bot" },
  { href: "/my-projects", label: "Project", icon: "user" },
  { href: "/family", label: "Nhóm", icon: "users" },
  { href: "/requests", label: "Yêu cầu", icon: "inbox" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

function NavIcon({ name, className }: { name: string; className?: string }) {
  const cn = className ?? "w-[18px] h-[18px]";
  const icons: Record<string, React.ReactNode> = {
    castle: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 21V11l4-4 4 4 4-4 4 4v10" /><path d="M4 21h16" /><path d="M10 21v-4h4v4" /><path d="M2 11h2" /><path d="M20 11h2" />
      </svg>
    ),
    map: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15" /><path d="M15 6v15" />
      </svg>
    ),
    edit: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    chart: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
      </svg>
    ),
    bot: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><circle cx="8" cy="16" r="1" /><circle cx="16" cy="16" r="1" />
      </svg>
    ),
    target: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    ),
    clipboard: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      </svg>
    ),
    user: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    users: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    inbox: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
      </svg>
    ),
    search: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    profile: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    help: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
      </svg>
    ),
    logout: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    menu: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    close: (
      <svg className={cn} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  };
  return icons[name] ?? null;
}

export function Sidebar({ user, pendingRequests = 0 }: { user: User; pendingRequests?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMentor = user.role === "mentor" || (user.role as string) === "parent";
  const nav = isMentor ? mentorNav : studentNav;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-slate-900/95 backdrop-blur-lg px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/30">
            S
          </div>
          <span className="text-sm font-bold text-white">StudyPlanner</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-1">
            <NavIcon name={mobileOpen ? "close" : "menu"} className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="md:hidden fixed top-[52px] left-0 right-0 z-50 bg-slate-900/98 backdrop-blur-xl border-b border-white/10 p-3 space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-indigo-600/90 to-indigo-500/80 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className={active ? "text-indigo-200" : "text-slate-500"}>
                    <NavIcon name={item.icon} />
                  </span>
                  {item.label}
                  {item.href === "/requests" && pendingRequests > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {pendingRequests}
                    </span>
                  )}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <NavIcon name="logout" />
              Đăng xuất
            </button>
          </div>
        </>
      )}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 flex items-center justify-around px-1 py-1.5 safe-bottom">
        {(isMentor ? mentorNav : studentNav).slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${
                active ? "text-indigo-400" : "text-slate-500"
              }`}
            >
              <NavIcon name={item.icon} className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950">
        <div className="px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30">
              S
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">StudyPlanner</h2>
              <p className="text-[11px] text-indigo-300/70 font-medium">Đế chế Tri thức</p>
            </div>
          </div>
        </div>

        <div className="mx-4 border-t border-white/10" />

        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[12px] font-bold text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400/20">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400">
                {isMentor ? "Mentor" : "Học sinh"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                  active
                    ? "bg-gradient-to-r from-indigo-600/90 to-indigo-500/80 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={active ? "text-indigo-200" : "text-slate-500"}>
                  <NavIcon name={item.icon} />
                </span>
                {item.label}
                {item.href === "/requests" && pendingRequests > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {pendingRequests}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 border-t border-white/10" />

        <div className="p-3 space-y-0.5">
          <Link
            href={isMentor ? "/help/mentor" : "/help/student"}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-500 hover:bg-white/5 hover:text-white transition-colors"
          >
            <NavIcon name="help" />
            {"Hướng dẫn"}
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <NavIcon name="logout" />
            {"Đăng xuất"}
          </button>
        </div>
      </aside>
    </>
  );
}
