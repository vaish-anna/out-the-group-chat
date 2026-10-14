"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToNotifications, markNotificationRead } from "@/lib/users";
import { createTrip } from "@/lib/trips";
import { OverlapNotification } from "@/types";
import AppShell from "@/components/AppShell";

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<OverlapNotification[]>([]);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    return subscribeToNotifications(user.uid, setNotifications);
  }, [user]);

  async function handleStartPlanning(n: OverlapNotification) {
    if (!user) return;
    setStarting(n.id);
    const destination = n.sharedDestinations[0];
    const tripName = destination
      ? `${destination.name} trip`
      : `Trip with ${n.friendNames.join(" & ")}`;
    const tripId = await createTrip(tripName, user.uid, user.displayName ?? "You");
    await markNotificationRead(user.uid, n.id);
    router.push(`/trip/${tripId}`);
  }

  async function dismiss(id: string) {
    if (!user) return;
    await markNotificationRead(user.uid, id);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--terracotta)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: "var(--chocolate)" }}>Notifications</h1>
        <p className="text-sm mt-1" style={{ color: "var(--warm-brown)", opacity: 0.7 }}>
          When your availability overlaps with a friend's wishlist, you'll see it here.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="py-16 text-center" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>
          <p className="text-sm font-medium">No notifications yet.</p>
          <p className="text-xs mt-1">Add friends and set your availability to find overlaps.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl px-5 py-5"
              style={{
                background: n.read ? "var(--surface)" : "var(--olive-dark)",
                border: n.read ? "1px solid var(--border)" : "none",
              }}
            >
              <p className="font-bold text-base" style={{ color: n.read ? "var(--chocolate)" : "white" }}>
                {n.friendNames.join(" & ")}
              </p>
              <p className="text-sm mt-1" style={{ color: n.read ? "var(--warm-brown)" : "rgba(255,255,255,0.7)" }}>
                You both want to visit {n.sharedDestinations.map((d) => d.name).join(", ")}
                {n.overlapSeasons && n.overlapSeasons.length > 0
                  ? ` and are both free in ${n.overlapSeasons.join(", ")}`
                  : ""}
                {n.overlapMonths && n.overlapMonths.length > 0
                  ? ` — shared months: ${n.overlapMonths.join(", ")}`
                  : ""}
              </p>
              {!n.read && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleStartPlanning(n)}
                    disabled={starting === n.id}
                    className="text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-60"
                    style={{ background: "var(--terracotta)", color: "white" }}
                  >
                    {starting === n.id ? "Creating trip..." : "Start planning"}
                  </button>
                  <button
                    onClick={() => dismiss(n.id)}
                    className="text-sm font-semibold px-4 py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
