"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";

const studentNav = [
  { href: "/dashboard", label: "Đế chế", icon: "🏰" },
  { href: "/roadmap", label: "Lộ trình", icon: "🗺️" },
  { href: "/log", label: "Log học tập", icon: "📝" },
  { href: "/progress", label: "Tiến bộ", icon: "📊" },
  { href: "/coach", label: "AI Coach", icon: "🤖" },
];

const parentNav = [
  { href: "/dashboard", label: "Dashboard con", icon: "🏰" },
  { href: "/weekly-goals", label: "Mục tiêu tuần", icon: "🎯" },
  { href: "/notes", label: "Nhật ký quan sát", icon: "📋" },
  { href: "/child-progress", label: "Tiến bộ con", icon: "📊" },
  { href: "/coach", label: "AI Coach", icon: "🤖" },
  { href: "/my-projects", label: "Project cá nhân", icon: "👤" },
  { href: "/family", label: "Gia đình", icon: "👨‍👩‍👧‍👦" },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = user.role === "student" ? studentNav : parentNav;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-bold text-gray-900">⚔️ Đế chế Tri thức</h2>
        <p className="mt-1 text-sm text-gray-500">{user.name}</p>
        <span className="inline-block mt-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {user.role === "student" ? "Học sinh" : "Phụ huynh"}
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <span className="text-lg">🚪</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
