"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { IconGrid, IconLayers, IconBook, IconHelp, IconLogout } from "@/components/icons";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: IconGrid, exact: true },
  { href: "/dashboard/categories", label: "Categories", icon: IconLayers },
  { href: "/dashboard/courses", label: "Courses", icon: IconBook },
  { href: "/dashboard/notes", label: "Notes", icon: IconHelp },
];

export default function Sidebar({ email }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await api.post("/api/auth/logout", {});
    } catch {
      // ignore — cookie may already be gone
    }
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 bg-ink-950 border-r border-white/5 flex flex-col h-screen sticky top-0">
      <div className="px-7 pt-8 pb-6">
        <span className="font-display italic text-2xl text-cream-100">Curio</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors relative ${
                active
                  ? "text-gold-300 bg-white/[0.04]"
                  : "text-cream-300 hover:text-cream-100 hover:bg-white/[0.03]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gold-400" />
              )}
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-5 border-t border-white/5">
        <div className="px-3 mb-3">
          <p className="text-xs text-cream-500 truncate">{email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-cream-300 hover:text-clay-400 hover:bg-white/[0.03] w-full transition-colors"
        >
          <IconLogout />
          Sign out
        </button>
      </div>
    </aside>
  );
}
