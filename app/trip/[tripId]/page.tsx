"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToTrip, subscribeToMembers } from "@/lib/trips";
import { Trip, Member } from "@/types";
import Avatar from "@/components/Avatar";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

const DEFAULT_CHECKLIST: Omit<ChecklistItem, "done">[] = [
  { id: "dates",       label: "Lock in the dates" },
  { id: "budget",      label: "Set a group budget" },
  { id: "flights",     label: "Check flights" },
  { id: "accommodation", label: "Book accommodation" },
  { id: "availability", label: "Collect everyone's availability" },
  { id: "decisions",   label: "Make group decisions" },
  { id: "itinerary",   label: "Build an itinerary" },
  { id: "insurance",   label: "Sort travel insurance" },
];

export default function TripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (!tripId) return;
    const ref = doc(db, "trips", tripId, "meta", "checklist");
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        setChecklist(snap.data().items ?? []);
      } else {
        const items = DEFAULT_CHECKLIST.map((i) => ({ ...i, done: false }));
        setDoc(ref, { items });
        setChecklist(items);
      }
    });
  }, [tripId]);

  async function toggleItem(id: string) {
    if (!tripId) return;
    const updated = checklist.map((i) => i.id === id ? { ...i, done: !i.done } : i);
    setChecklist(updated);
    await updateDoc(doc(db, "trips", tripId, "meta", "checklist"), { items: updated });
  }

  useEffect(() => {
    if (!tripId) return;
    const u1 = subscribeToTrip(tripId, setTrip);
    const u2 = subscribeToMembers(tripId, setMembers);
    return () => { u1(); u2(); };
  }, [tripId]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--terracotta)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const submitted = members.filter((m) => m.hasSubmittedPrefs).length;
  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${trip.inviteCode}`;
  const myMember = members.find((m) => m.uid === user?.uid);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--terracotta)" }}>
          Trip
        </p>
        <h1 className="text-3xl font-black" style={{ color: "var(--chocolate)" }}>{trip.name}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>
          Organized by {trip.organizerName}
          {trip.destination ? ` · ${trip.destination.name}, ${trip.destination.country}` : ""}
        </p>
      </div>

      {/* Availability progress */}
      <div
        className="rounded-2xl px-5 py-5 mb-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--olive-dark)" }}>
            Availability in
          </p>
          <span className="text-sm font-black" style={{ color: "var(--chocolate)" }}>
            {submitted} / {members.length}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: members.length ? `${(submitted / members.length) * 100}%` : "0%",
              background: submitted === members.length ? "var(--olive-dark)" : "var(--terracotta)",
            }}
          />
        </div>
        {submitted < members.length && (
          <p className="text-xs mt-2" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>
            Waiting on {members.length - submitted} more {members.length - submitted === 1 ? "person" : "people"}
          </p>
        )}
      </div>

      {/* Members */}
      <div
        className="rounded-2xl px-5 py-5 mb-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--olive-dark)" }}>
          Who's in ({members.length})
        </p>
        <div className="flex flex-col gap-3">
          {members.map((m) => (
            <div key={m.uid} className="flex items-center gap-3">
              <Avatar name={m.displayName} photoURL={m.photoURL} size={36} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--chocolate)" }}>
                  {m.displayName}
                  {m.uid === trip.organizerId && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--terracotta)" }}>
                      organizer
                    </span>
                  )}
                </p>
              </div>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                style={{
                  background: m.hasSubmittedPrefs ? "var(--olive-light)" : "var(--surface-2)",
                  color: m.hasSubmittedPrefs ? "var(--olive-dark)" : "var(--warm-brown)",
                }}
              >
                {m.hasSubmittedPrefs ? "In" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Planning checklist */}
      {checklist.length > 0 && (
        <div
          className="rounded-2xl px-5 py-5 mb-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--olive-dark)" }}>
              Trip checklist
            </p>
            <span className="text-xs font-semibold" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>
              {checklist.filter((i) => i.done).length} / {checklist.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(checklist.filter((i) => i.done).length / checklist.length) * 100}%`,
                background: checklist.every((i) => i.done) ? "var(--olive-dark)" : "var(--terracotta)",
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="flex items-center gap-3 text-left transition-all active:scale-98"
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: item.done ? "var(--olive-dark)" : "var(--border)",
                    background: item.done ? "var(--olive-dark)" : "transparent",
                  }}
                >
                  {item.done && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: item.done ? "var(--warm-brown)" : "var(--chocolate)",
                    textDecoration: item.done ? "line-through" : "none",
                    opacity: item.done ? 0.5 : 1,
                  }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link
          href={`/trip/${tripId}/availability`}
          className="w-full font-bold py-4 rounded-2xl text-base text-center transition-all active:scale-95"
          style={{ background: "var(--terracotta)", color: "white" }}
        >
          {myMember?.hasSubmittedPrefs ? "Update my availability" : "Add my availability"}
        </Link>

        <Link
          href={`/trip/${tripId}/decisions`}
          className="w-full font-bold py-4 rounded-2xl text-base text-center transition-all active:scale-95"
          style={{ background: "var(--surface)", color: "var(--chocolate)", border: "1px solid var(--border)" }}
        >
          Decision board
        </Link>

        {/* Invite */}
        <div
          className="rounded-2xl px-4 py-4"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>
            Invite link
          </p>
          <div className="flex items-center gap-3">
            <p className="text-xs truncate flex-1" style={{ color: "var(--chocolate)" }}>{inviteUrl}</p>
            <button
              onClick={() => navigator.clipboard.writeText(inviteUrl)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-all active:scale-95"
              style={{ background: "var(--terracotta)", color: "white" }}
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
