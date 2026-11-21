"use client";
import { useState, useEffect } from "react";
import { Destination } from "@/types";
import {
  REGION_GRADIENT,
  DESTINATION_PHOTO,
  DESTINATION_WEATHER,
  DESTINATION_HIGHLIGHTS,
} from "@/data/destinations";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SEASON_LABELS = ["Spring", "Summer", "Fall", "Winter"] as const;
type SeasonKey = "spring" | "summer" | "fall" | "winter";

function WeatherDot({ rating }: { rating: number }) {
  const colors = ["", "var(--warm-brown)", "var(--powder)", "var(--olive)", "var(--olive-dark)"];
  const labels = ["", "Avoid", "OK", "Good", "Ideal"];
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-3 h-3 rounded-full" style={{ background: colors[rating] ?? colors[2] }} />
      <span className="text-[9px] font-semibold" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>
        {labels[rating] ?? "OK"}
      </span>
    </div>
  );
}

export default function DestinationModal({
  destination,
  onClose,
  onStartPlanning,
  onAddAvailability,
}: {
  destination: Destination;
  onClose: () => void;
  onStartPlanning: (d: Destination) => void;
  onAddAvailability: () => void;
}) {
  const { user } = useAuth();
  const photoId = DESTINATION_PHOTO[destination.id];
  const gradient = REGION_GRADIENT[destination.region] ?? REGION_GRADIENT["Europe"];
  const weather = DESTINATION_WEATHER[destination.id];
  const highlights = DESTINATION_HIGHLIGHTS[destination.id];

  const [userNotes, setUserNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const photoUrl = photoId
    ? `https://images.unsplash.com/photo-${photoId}?w=800&q=75&auto=format&fit=crop`
    : null;

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      const notes = snap.data()?.wishlistNotes?.[destination.id] ?? [];
      setUserNotes(notes);
    });
  }, [user, destination.id]);

  async function addNote() {
    if (!user || !newNote.trim() || savingNote) return;
    setSavingNote(true);
    const updated = [...userNotes, newNote.trim()];
    setUserNotes(updated);
    setNewNote("");
    await updateDoc(doc(db, "users", user.uid), {
      [`wishlistNotes.${destination.id}`]: updated,
    });
    setSavingNote(false);
  }

  async function removeNote(index: number) {
    if (!user) return;
    const updated = userNotes.filter((_, i) => i !== index);
    setUserNotes(updated);
    await updateDoc(doc(db, "users", user.uid), {
      [`wishlistNotes.${destination.id}`]: updated,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{ maxWidth: "540px", maxHeight: "90vh", background: "var(--cream)" }}
      >
        {/* Hero image */}
        <div
          className="relative flex flex-col justify-end"
          style={{
            height: "220px",
            background: photoUrl ? `url(${photoUrl}) center/cover` : gradient,
          }}
        >
          <div
            className="absolute inset-0 rounded-t-3xl sm:rounded-t-3xl"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.35)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="relative px-5 pb-5">
            <h2 className="text-2xl font-black text-white leading-tight">{destination.name}</h2>
            <p className="text-sm text-white mt-0.5" style={{ opacity: 0.8 }}>
              {destination.country}
            </p>
          </div>
        </div>

        <div className="px-5 py-5 flex flex-col gap-6">
          {/* Quick actions */}
          <div className="flex gap-2">
            <button
              onClick={() => { onStartPlanning(destination); onClose(); }}
              className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
              style={{ background: "var(--terracotta)", color: "white" }}
            >
              Start planning
            </button>
            <button
              onClick={() => { onAddAvailability(); onClose(); }}
              className="flex-1 py-3 rounded-2xl font-bold text-sm"
              style={{ background: "var(--surface)", color: "var(--chocolate)", border: "1px solid var(--border)" }}
            >
              Add availability
            </button>
          </div>

          {/* Weather */}
          {weather && (
            <div
              className="rounded-2xl px-5 py-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--olive-dark)" }}>
                Best time to visit
              </p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {(["spring", "summer", "fall", "winter"] as SeasonKey[]).map((s, i) => (
                  <div key={s} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>
                      {SEASON_LABELS[i]}
                    </span>
                    <WeatherDot rating={weather[s]} />
                  </div>
                ))}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--warm-brown)", opacity: 0.7 }}>
                {weather.note}
              </p>
            </div>
          )}

          {/* Things to see & do */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--olive-dark)" }}>
              Things to see & do
            </p>
            <div className="flex flex-col gap-2">
              {highlights?.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <span
                    className="text-xs font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--terracotta)", color: "white" }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm font-semibold" style={{ color: "var(--chocolate)" }}>{h}</p>
                </div>
              ))}

              {/* User's personal excited-about notes */}
              {userNotes.map((note, i) => (
                <div
                  key={`user-${i}`}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 group"
                  style={{ background: "var(--surface-2)", border: "1px dashed var(--border)" }}
                >
                  <span
                    className="text-xs font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--olive)", color: "white" }}
                  >
                    {(highlights?.length ?? 0) + i + 1}
                  </span>
                  <p className="text-sm font-semibold flex-1" style={{ color: "var(--chocolate)" }}>{note}</p>
                  <button
                    onClick={() => removeNote(i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--warm-brown)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add note input */}
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  placeholder="What are you most excited for?"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none border-2 transition-colors"
                  style={{
                    background: "var(--surface-2)",
                    borderColor: newNote ? "var(--terracotta)" : "var(--border)",
                    color: "var(--chocolate)",
                  }}
                />
                {newNote.trim() && (
                  <button
                    onClick={addNote}
                    disabled={savingNote}
                    className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-40"
                    style={{ background: "var(--terracotta)", color: "white" }}
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
