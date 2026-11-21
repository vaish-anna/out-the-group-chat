"use client";
import { useState, useEffect, useRef } from "react";
import { Destination, Trip } from "@/types";
import { REGION_GRADIENT, DESTINATION_PHOTO, DESTINATION_WEATHER, searchLocalDestinations } from "@/data/destinations";

function getBestSeason(destId: string): string | null {
  const w = DESTINATION_WEATHER[destId];
  if (!w) return null;
  const seasons = [
    { key: "spring" as const, label: "Spring" },
    { key: "summer" as const, label: "Summer" },
    { key: "fall" as const, label: "Fall" },
    { key: "winter" as const, label: "Winter" },
  ];
  const best = seasons.reduce((acc, s) => w[s.key] > w[acc.key] ? s : acc, seasons[0]);
  return w[best.key] >= 3 ? best.label : null;
}
import { nanoid } from "nanoid";
import DestinationModal from "@/components/DestinationModal";

interface Props {
  wishlist: Destination[];
  onSave: (updated: Destination[]) => Promise<void>;
  onStartPlanning?: (d: Destination) => void;
  onAddAvailability?: () => void;
  userTrips?: Trip[];
}

function DestinationCard({
  d,
  onTap,
  onRemove,
  isPlanning,
}: {
  d: Destination;
  onTap: () => void;
  onRemove: () => void;
  isPlanning: boolean;
}) {
  const photoId = DESTINATION_PHOTO[d.id];
  const gradient = REGION_GRADIENT[d.region] ?? REGION_GRADIENT["Europe"];
  const bestSeason = getBestSeason(d.id);
  const photoUrl = photoId
    ? `https://images.unsplash.com/photo-${photoId}?w=400&q=75&auto=format&fit=crop`
    : null;

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer group"
      style={{ border: "1px solid var(--border)" }}
      onClick={onTap}
    >
      {/* Photo / gradient hero */}
      <div
        className="relative flex flex-col justify-end"
        style={{
          height: "110px",
          background: photoUrl ? `url(${photoUrl}) center/cover` : gradient,
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 60%)" }}
        />
        {/* Remove button */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        {/* Planning badge */}
        {isPlanning && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
            style={{ background: "var(--terracotta)", color: "white" }}>
            Planning
          </div>
        )}
        <div className="relative px-3 pb-2">
          <p className="font-black text-white text-sm leading-tight">{d.name}</p>
          <p className="text-[10px] font-semibold text-white" style={{ opacity: 0.75 }}>{d.country}</p>
        </div>
      </div>

      {/* Card body */}
      <div className="px-3 py-2.5" style={{ background: "var(--surface)" }}>
        <div className="flex items-center justify-between gap-1">
          {bestSeason ? (
            <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "var(--olive-dark)" }}>
              Best: {bestSeason}
            </span>
          ) : (
            <span />
          )}
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
            style={{ background: "var(--surface-2)", color: "var(--warm-brown)" }}
          >
            {d.region}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function InlineBucketList({ wishlist, onSave, onStartPlanning, onAddAvailability, userTrips = [] }: Props) {
  const planningDestIds = new Set(userTrips.map((t) => t.destination?.id).filter(Boolean) as string[]);
  const [editing, setEditing] = useState(wishlist.length === 0);
  const [draft, setDraft] = useState<Destination[]>(wishlist);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Destination[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(wishlist);
  }, [wishlist, editing]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setResults(searchLocalDestinations(query));
  }, [query]);

  function toggle(dest: Destination) {
    setDraft((prev) => {
      const exists = prev.find((d) => d.id === dest.id);
      if (exists) return prev.filter((d) => d.id !== dest.id);
      return [...prev, { ...dest, id: dest.id || nanoid(6) }];
    });
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  }

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(wishlist);
    setQuery("");
    setResults([]);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
        <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search cities, countries, regions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 transition-colors"
            style={{
              background: "var(--surface-2)",
              borderColor: query ? "var(--terracotta)" : "var(--border)",
              color: "var(--chocolate)",
            }}
          />
          {results.length > 0 && (
            <div className="mt-2 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              {results.map((d, i) => {
                const isSelected = draft.some((s) => s.id === d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => toggle(d)}
                    className="w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors"
                    style={{
                      borderTop: i > 0 ? "1px solid var(--border)" : "none",
                      background: isSelected ? "var(--olive-dark)" : "var(--surface)",
                      color: isSelected ? "white" : "var(--chocolate)",
                    }}
                  >
                    <span>
                      <span className="font-semibold text-sm">{d.name}</span>
                      <span className="text-xs ml-2 opacity-55">{d.country}</span>
                    </span>
                    {isSelected && <span className="text-xs font-bold opacity-70">Added</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {draft.length > 0 && (
          <div className="px-4 py-3 flex flex-wrap gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
            {draft.map((d) => (
              <button
                key={d.id}
                onClick={() => toggle(d)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
                style={{ background: "var(--terracotta)", color: "white" }}
              >
                {d.name}
                <span style={{ opacity: 0.7 }}>×</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 px-4 py-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm disabled:opacity-40 transition-all"
            style={{ background: "var(--terracotta)", color: "white" }}
          >
            {saving ? "Saving..." : `Save${draft.length > 0 ? ` (${draft.length})` : ""}`}
          </button>
          {wishlist.length > 0 && (
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ color: "var(--warm-brown)" }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        {wishlist.map((d) => (
          <DestinationCard
            key={d.id}
            d={d}
            isPlanning={planningDestIds.has(d.id)}
            onTap={() => setActiveDestination(d)}
            onRemove={async () => {
              const updated = wishlist.filter((w) => w.id !== d.id);
              await onSave(updated);
            }}
          />
        ))}
      </div>

      <button
        onClick={() => { setDraft(wishlist); setEditing(true); }}
        className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{ background: "var(--surface-2)", color: "var(--warm-brown)", border: "1px dashed var(--border)" }}
      >
        + Add destination
      </button>

      {activeDestination && (
        <DestinationModal
          destination={activeDestination}
          onClose={() => setActiveDestination(null)}
          onStartPlanning={(d) => { onStartPlanning?.(d); setActiveDestination(null); }}
          onAddAvailability={() => { onAddAvailability?.(); setActiveDestination(null); }}
        />
      )}
    </div>
  );
}
