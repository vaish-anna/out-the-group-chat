"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🤔</div>
          <h1 className="text-xl font-bold text-gray-900">Invite not found</h1>
          <p className="text-gray-500 mt-2 text-sm">This link might be expired or invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="text-center">
          <div className="text-5xl mb-3">🗺️</div>
          <h1 className="text-2xl font-black text-gray-900">You&apos;re invited!</h1>
          <p className="mt-2 text-gray-500 text-sm">
            <span className="font-semibold text-gray-800">{trip.organizerName}</span> wants
            you to join
          </p>
          <div className="mt-3 bg-violet-50 border border-violet-200 rounded-2xl px-5 py-3">
            <p className="text-lg font-black text-violet-700">{trip.name}</p>
          </div>
        </div>

        {!user ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <p className="text-sm text-gray-500">Sign in to join the trip</p>
            <GoogleSignInButton />
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-base shadow-md active:scale-95 transition-all"
          >
            {joining ? "Joining…" : "Join trip →"}
          </button>
        )}
      </div>
    </main>
  );
}
