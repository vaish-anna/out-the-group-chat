"use client";
import { useState, useEffect, useRef } from "react";
import { Destination } from "@/types";
import { REGION_GRADIENT, DESTINATION_VIBE, searchLocalDestinations } from "@/data/destinations";
import { nanoid } from "nanoid";

interface Props {
  wishlist: Destination[];
  onSave: (updated: Destination[]) => Promise<void>;
}

export default function InlineBucketList({ wishlist, onSave }: Props) {
  const [editing, setEditing] = useState(wishlist.length === 0);
  const [draft, setDraft] = useState<Destination[]>(wishlist);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Destination[]>([]);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync when wishlist prop changes (Firestore update)
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
        {/* Search */}
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

        {/* Selected chips */}
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

        {/* Actions */}
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

  // View mode
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {wishlist.map((d) => {
          const gradient = REGION_GRADIENT[d.region] ?? REGION_GRADIENT["Europe"];
          const vibe = DESTINATION_VIBE[d.id];
          return (
            <div
              key={d.id}
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              {/* Color header */}
              <div
                className="flex flex-col justify-end px-4 pt-4 pb-3"
                style={{ background: gradient, minHeight: "70px" }}
              >
                <p className="font-black text-white text-base leading-tight" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                  {d.name}
                </p>
                <p className="text-xs font-semibold text-white mt-0.5" style={{ opacity: 0.75 }}>
                  {d.country}
                </p>
              </div>
              {/* Card body */}
              <div className="px-4 py-3" style={{ background: "var(--surface)" }}>
                <div className="flex items-center justify-between">
                  {vibe && (
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--terracotta)" }}>
                      {vibe}
                    </span>
                  )}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{ background: "var(--surface-2)", color: "var(--warm-brown)" }}>
                    {d.region}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => { setDraft(wishlist); setEditing(true); }}
        className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{ background: "var(--surface-2)", color: "var(--warm-brown)", border: "1px dashed var(--border)" }}
      >
        + Add destination
      </button>
    </div>
  );
}
