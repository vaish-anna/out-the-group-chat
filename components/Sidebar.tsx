"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "./Avatar";

const NAV = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "var(--terracotta)" : "none"} stroke={active ? "var(--terracotta)" : "rgba(245,240,232,0.45)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/friends",
    label: "Friends",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--terracotta)" : "rgba(245,240,232,0.45)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" />
      </svg>
    ),
  },
  {
    href: "/feed",
    label: "Feed",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--terracotta)" : "rgba(245,240,232,0.45)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--terracotta)" : "rgba(245,240,232,0.45)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    href: "/profile/me",
    label: "Profile",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--terracotta)" : "rgba(245,240,232,0.45)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/login");
  }

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col"
      style={{
        width: "240px",
        background: "#2E3D14",
        borderRight: "1px solid rgba(245,240,232,0.07)",
        zIndex: 50,
      }}
    >
      {/* Wordmark */}
      <div className="px-6 pt-8 pb-8" style={{ borderBottom: "1px solid rgba(245,240,232,0.07)" }}>
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--olive-light)", opacity: 0.7 }}>
          Out the
        </p>
        <p className="text-lg font-black tracking-tight" style={{ color: "var(--cream)", lineHeight: 1 }}>
          Group Chat
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: active ? "rgba(196,84,29,0.18)" : "transparent",
                color: active ? "var(--terracotta)" : "rgba(245,240,232,0.55)",
                borderLeft: active ? "2px solid var(--terracotta)" : "2px solid transparent",
              }}
            >
              {icon(active)}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Tour replay */}
      <div className="px-4 pb-2">
        <button
          onClick={() => {
            try { localStorage.removeItem("otgc_tour_seen"); } catch {}
            window.dispatchEvent(new CustomEvent("otgc:replay-tour"));
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ color: "rgba(245,240,232,0.4)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          Take a tour
        </button>
      </div>

      {/* User */}
      {user && (
        <div
          className="px-4 py-4 flex items-center gap-3"
          style={{ borderTop: "1px solid rgba(245,240,232,0.07)" }}
        >
          <Avatar
            name={user.displayName ?? "User"}
            photoURL={user.photoURL ?? undefined}
            size={32}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: "rgba(245,240,232,0.85)" }}>
              {user.displayName}
            </p>
            <button
              onClick={handleSignOut}
              className="text-xs transition-colors hover:opacity-80"
              style={{ color: "rgba(245,240,232,0.35)" }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
