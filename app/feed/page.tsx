"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getFollowingProfiles } from "@/lib/users";
import { subscribeToUserTrips } from "@/lib/trips";
import { Trip, UserProfile } from "@/types";
import AppShell from "@/components/AppShell";
import Avatar from "@/components/Avatar";
import Link from "next/link";

export default function FeedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [feedTrips, setFeedTrips] = useState<{ trip: Trip; owner: UserProfile }[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const unsubs: (() => void)[] = [];

    getFollowingProfiles(user.uid).then((friends) => {
      if (!active) return;
      const allTrips: Map<string, { trip: Trip; owner: UserProfile }> = new Map();

      for (const friend of friends) {
        const unsub = subscribeToUserTrips(friend.uid, (trips) => {
          if (!active) return;
          for (const trip of trips) {
            allTrips.set(trip.id, { trip, owner: friend });
          }
          // Also clear removed
          for (const [id, entry] of allTrips.entries()) {
            if (entry.owner.uid === friend.uid && !trips.some((t) => t.id === id)) {
              allTrips.delete(id);
            }
          }
          const sorted = Array.from(allTrips.values()).sort(
            (a, b) => b.trip.createdAt - a.trip.createdAt
          );
          setFeedTrips(sorted);
          setFetching(false);
        });
        unsubs.push(unsub);
      }

      if (friends.length === 0) setFetching(false);
    });

    return () => {
      active = false;
      unsubs.forEach((u) => u());
    };
  }, [user]);

  const statusLabel: Record<string, string> = {
    planning: "Planning",
    decided: "Decided",
    done: "Done",
    completed: "Completed",
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--terracotta)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: "var(--chocolate)" }}>Feed</h1>
        <p className="text-sm mt-1" style={{ color: "var(--warm-brown)", opacity: 0.65 }}>
          Trips your friends are planning right now
        </p>
      </div>

      {feedTrips.length === 0 ? (
        <div className="py-20 text-center" style={{ color: "var(--warm-brown)", opacity: 0.4 }}>
          <p className="text-sm font-medium">Nothing here yet.</p>
          <p className="text-xs mt-1">Follow friends to see what they're planning.</p>
          <Link
            href="/friends"
            className="inline-block mt-4 text-xs font-bold px-4 py-2 rounded-xl"
            style={{ background: "var(--terracotta)", color: "white", opacity: 1 }}
          >
            Find friends
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {feedTrips.map(({ trip, owner }) => (
            <div
              key={trip.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              {/* Header row */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                <Link href={`/profile/${owner.uid}`}>
                  <Avatar name={owner.displayName} photoURL={owner.photoURL} size={36} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${owner.uid}`}>
                    <span className="font-bold text-sm" style={{ color: "var(--chocolate)" }}>{owner.displayName}</span>
                  </Link>
                  <p className="text-xs" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>
                    is planning a trip
                  </p>
                </div>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                  style={{
                    background: trip.status === "decided" ? "var(--olive-light)" : "var(--powder)",
                    color: trip.status === "decided" ? "var(--olive-dark)" : "var(--slate)",
                  }}
                >
                  {statusLabel[trip.status]}
                </span>
              </div>

              {/* Trip details */}
              <div className="px-5 py-4">
                <p className="font-black text-lg" style={{ color: "var(--chocolate)" }}>{trip.name}</p>
                {trip.destination && (
                  <p className="text-sm mt-1" style={{ color: "var(--warm-brown)" }}>
                    {trip.destination.name}, {trip.destination.country}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>
                    {trip.participantUids.length} {trip.participantUids.length === 1 ? "person" : "people"} going
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
