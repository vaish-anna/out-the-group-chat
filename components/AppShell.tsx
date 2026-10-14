"use client";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--cream)" }}>
      <Sidebar />
      <main
        className="flex-1 min-h-screen"
        style={{ marginLeft: "240px", padding: "48px 56px" }}
      >
        <div style={{ maxWidth: "720px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
