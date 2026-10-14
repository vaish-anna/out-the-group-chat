"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTripByInviteCode, joinTrip } from "@/lib/trips";
import { useAuth } from "@/hooks/useAuth";
import { Trip } from "@/types";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function JoinPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [fetching, setFetching] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    getTripByInviteCode(inviteCode).then((t) => {
      setTrip(t);
      setFetching(false);
    });
  }, [inviteCode]);

  async function handleJoin() {
    if (!user || !trip) return;
    setJoining(true);
    await joinTrip(trip.id, user.uid, user.displayName ?? "Friend", user.photoURL ?? "");
    router.push(`/trip/${trip.id}`);
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--terracotta)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--cream)" }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: "var(--chocolate)" }}>Invite not found</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>
            This link might be expired or invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "var(--cream)" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--terracotta)" }}>
            You're invited
          </p>
          <h1 className="text-2xl font-black" style={{ color: "var(--chocolate)" }}>
            {trip.organizerName} wants you in
          </h1>
          <div
            className="mt-4 rounded-2xl px-6 py-4"
            style={{ background: "var(--olive-dark)" }}
          >
            <p className="text-lg font-black text-white">{trip.name}</p>
            <p className="text-xs text-white mt-1" style={{ opacity: 0.65 }}>
              {trip.participantUids.length} {trip.participantUids.length === 1 ? "person" : "people"} planning
            </p>
          </div>
        </div>

        {!user ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <p className="text-sm" style={{ color: "var(--warm-brown)", opacity: 0.7 }}>Sign in to join the trip</p>
            <GoogleSignInButton />
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full font-bold py-4 rounded-2xl text-base transition-all active:scale-95 disabled:opacity-40"
            style={{ background: "var(--terracotta)", color: "white" }}
          >
            {joining ? "Joining..." : "Join trip"}
          </button>
        )}
      </div>
    </main>
  );
}
