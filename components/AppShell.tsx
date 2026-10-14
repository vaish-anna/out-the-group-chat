"use client";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--cream)" }}>
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <main
        className="flex-1 min-h-screen px-4 py-6 md:px-14 md:py-12"
        style={{ marginLeft: "0" }}
      >
        {/* Desktop offset for sidebar */}
        <div className="md:ml-[240px]">
          <div style={{ maxWidth: "720px" }} className="pb-24 md:pb-8">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <div className="block md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
