"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToTrip, subscribeToMembers } from "@/lib/trips";
import { Trip, Member } from "@/types";
import Avatar from "@/components/Avatar";
import Link from "next/link";

export default function TripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!tripId) return;
    const unsub1 = subscribeToTrip(tripId, setTrip);
    const unsub2 = subscribeToMembers(tripId, setMembers);
    return () => { unsub1(); unsub2(); };
  }, [tripId]);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  if (loading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const submitted = members.filter((m) => m.hasSubmittedPrefs).length;
  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${trip.inviteCode}`;
  const isOrganizer = user?.uid === trip.organizerId;

  return (
    <main className="min-h-screen px-5 py-8 max-w-md mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-1">
          Trip
        </p>
        <h1 className="text-2xl font-black text-gray-900">{trip.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Organized by {trip.organizerName}
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Availability in</span>
          <span className="text-sm font-bold text-violet-600">
            {submitted}/{members.length}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all"
            style={{ width: members.length ? `${(submitted / members.length) * 100}%` : "0%" }}
          />
        </div>
        {submitted < members.length && (
          <p className="text-xs text-gray-400 mt-2">
            Waiting on {members.length - submitted} more {members.length - submitted === 1 ? "person" : "people"}
          </p>
        )}
      </div>

      {/* Members */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 mb-3">
          Who&apos;s in ({members.length})
        </h2>
        <div className="flex flex-col gap-3">
          {members.map((m) => (
            <div key={m.uid} className="flex items-center gap-3">
              <Avatar name={m.displayName} photoURL={m.photoURL} size={36} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  {m.displayName}
                  {m.uid === trip.organizerId && (
                    <span className="ml-1 text-xs text-violet-500">organizer</span>
                  )}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  m.hasSubmittedPrefs
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {m.hasSubmittedPrefs ? "✓ in" : "pending"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link
          href={`/trip/${tripId}/availability`}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-2xl text-base text-center shadow-md active:scale-95 transition-all"
        >
          {members.find((m) => m.uid === user?.uid)?.hasSubmittedPrefs
            ? "✓ Update my availability"
            : "Add my availability →"}
        </Link>

        <Link
          href={`/trip/${tripId}/decisions`}
          className="w-full bg-white border-2 border-violet-200 hover:border-violet-400 text-violet-700 font-bold py-4 rounded-2xl text-base text-center active:scale-95 transition-all"
        >
          Decision board
        </Link>

        {/* Invite link */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">Invite link</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-amber-800 truncate flex-1">{inviteUrl}</p>
            <button
              onClick={() => navigator.clipboard.writeText(inviteUrl)}
              className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg shrink-0"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
