"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/friends", label: "Friends", icon: PeopleIcon },
  { href: "/notifications", label: "Alerts", icon: BellIcon },
  { href: "/profile/me", label: "Profile", icon: PersonIcon },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 pb-safe border-t"
      style={{ background: "var(--surface)", borderColor: "var(--border)", paddingBottom: "max(16px, env(safe-area-inset-bottom))", paddingTop: "10px" }}
    >
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all"
          >
            <Icon active={active} />
            <span className="text-[10px] font-semibold" style={{ color: active ? "var(--terracotta)" : "var(--warm-brown)", opacity: active ? 1 : 0.5 }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "var(--terracotta)" : "none"} stroke={active ? "var(--terracotta)" : "var(--warm-brown)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.5}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function PeopleIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "var(--terracotta)" : "var(--warm-brown)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.5}>
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" />
    </svg>
  );
}

function BellIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "var(--terracotta)" : "none"} stroke={active ? "var(--terracotta)" : "var(--warm-brown)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.5}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "var(--terracotta)" : "none"} stroke={active ? "var(--terracotta)" : "var(--warm-brown)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.5}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
