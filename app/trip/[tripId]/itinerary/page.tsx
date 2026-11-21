"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToTrip, subscribeToAvailability, TripAvailability } from "@/lib/trips";
import { Trip } from "@/types";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { nanoid } from "nanoid";

interface ItineraryEvent {
  id: string;
  time: string;
  title: string;
  note: string;
}

interface ItineraryDay {
  date: string;
  events: ItineraryEvent[];
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");
  while (cur <= endDate) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function getOverlapDates(avails: TripAvailability[]): string[] {
  if (avails.length < 2) return [];
  const counts: Record<string, number> = {};
  for (const a of avails) {
    for (const r of a.dateRanges) {
      for (const d of getDatesInRange(r.start, r.end)) {
        counts[d] = (counts[d] ?? 0) + 1;
      }
    }
  }
  return Object.entries(counts)
    .filter(([, c]) => c >= avails.length)
    .map(([d]) => d)
    .sort();
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}

export default function ItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [availabilities, setAvailabilities] = useState<TripAvailability[]>([]);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tripId) return;
    const u1 = subscribeToTrip(tripId, setTrip);
    const u2 = subscribeToAvailability(tripId, setAvailabilities);
    const ref = doc(db, "trips", tripId, "meta", "itinerary");
    getDoc(ref).then((snap) => {
      if (snap.exists()) setDays(snap.data().days ?? []);
    });
    return () => { u1(); u2(); };
  }, [tripId]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  const overlapDates = getOverlapDates(availabilities);

  useEffect(() => {
    if (!overlapDates.length || days.length) return;
    setDays(overlapDates.map((d) => ({ date: d, events: [] })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlapDates.join(",")]);

  async function persistDays(updated: ItineraryDay[]) {
    if (!tripId) return;
    setSaving(true);
    await setDoc(doc(db, "trips", tripId, "meta", "itinerary"), { days: updated });
    setSaving(false);
  }

  function addEvent(date: string) {
    if (!newTitle.trim()) return;
    const event: ItineraryEvent = { id: nanoid(6), time: newTime, title: newTitle.trim(), note: newNote.trim() };
    const updated = days.map((d) =>
      d.date === date ? { ...d, events: [...d.events, event].sort((a, b) => a.time.localeCompare(b.time)) } : d
    );
    setDays(updated);
    persistDays(updated);
    setNewTime(""); setNewTitle(""); setNewNote(""); setAddingTo(null);
  }

  function removeEvent(date: string, eventId: string) {
    const updated = days.map((d) =>
      d.date === date ? { ...d, events: d.events.filter((e) => e.id !== eventId) } : d
    );
    setDays(updated);
    persistDays(updated);
  }

  if (loading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--terracotta)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/trip/${tripId}`} className="text-sm font-semibold" style={{ color: "var(--terracotta)" }}>
          Back
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <div>
          <h1 className="text-3xl font-black" style={{ color: "var(--chocolate)" }}>Itinerary</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>{trip.name}</p>
        </div>
      </div>

      {days.length === 0 && (
        <div
          className="rounded-2xl px-5 py-10 text-center mb-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--chocolate)" }}>No dates locked in yet</p>
          <p className="text-xs" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>
            Once everyone submits availability and you have overlapping dates, your itinerary days will appear here.
          </p>
          <Link
            href={`/trip/${tripId}/availability`}
            className="inline-block mt-4 px-5 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "var(--terracotta)", color: "white" }}
          >
            Add availability
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {days.map((day, dayIdx) => (
          <div
            key={day.date}
            className="rounded-2xl px-5 py-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--terracotta)" }}>
                  Day {dayIdx + 1}
                </p>
                <p className="font-black text-lg" style={{ color: "var(--chocolate)" }}>{formatDate(day.date)}</p>
              </div>
            </div>

            {day.events.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {day.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 group"
                  >
                    <span className="text-xs font-bold mt-0.5 w-10 shrink-0 text-right" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>
                      {event.time || "—"}
                    </span>
                    <div className="flex-1 rounded-xl px-3 py-2.5" style={{ background: "var(--surface-2)" }}>
                      <p className="text-sm font-semibold" style={{ color: "var(--chocolate)" }}>{event.title}</p>
                      {event.note && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>{event.note}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeEvent(day.date, event.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity mt-2"
                      style={{ color: "var(--warm-brown)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {addingTo === day.date ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="px-3 py-2 rounded-xl text-sm outline-none border-2 w-28"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--chocolate)" }}
                  />
                  <input
                    type="text"
                    placeholder="Activity or event"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                    className="flex-1 px-3 py-2 rounded-xl text-sm outline-none border-2 transition-colors"
                    style={{ background: "var(--surface-2)", borderColor: newTitle ? "var(--terracotta)" : "var(--border)", color: "var(--chocolate)" }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addEvent(day.date)}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none border-2 transition-colors"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--chocolate)" }}
                />
                <div className="flex gap-2">
                  <button onClick={() => addEvent(day.date)} disabled={!newTitle.trim()} className="text-sm font-bold disabled:opacity-40" style={{ color: "var(--terracotta)" }}>
                    Add
                  </button>
                  <button onClick={() => { setAddingTo(null); setNewTime(""); setNewTitle(""); setNewNote(""); }} className="text-sm" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingTo(day.date)}
                className="text-xs font-semibold"
                style={{ color: "var(--terracotta)" }}
              >
                + Add event
              </button>
            )}
          </div>
        ))}
      </div>

      {saving && (
        <p className="text-xs text-center mt-4" style={{ color: "var(--warm-brown)", opacity: 0.4 }}>Saving...</p>
      )}
    </AppShell>
  );
}
