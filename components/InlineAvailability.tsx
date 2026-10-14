"use client";
import { useState } from "react";
import { Season, TravelMonth } from "@/types";

const SEASONS: { id: Season; label: string; hint: string }[] = [
  { id: "spring", label: "Spring", hint: "Mar–May" },
  { id: "summer", label: "Summer", hint: "Jun–Aug" },
  { id: "fall", label: "Fall", hint: "Sep–Nov" },
  { id: "winter", label: "Winter", hint: "Dec–Feb" },
];

const MONTHS: { id: TravelMonth; label: string }[] = [
  { id: "jan", label: "Jan" }, { id: "feb", label: "Feb" }, { id: "mar", label: "Mar" },
  { id: "apr", label: "Apr" }, { id: "may", label: "May" }, { id: "jun", label: "Jun" },
  { id: "jul", label: "Jul" }, { id: "aug", label: "Aug" }, { id: "sep", label: "Sep" },
  { id: "oct", label: "Oct" }, { id: "nov", label: "Nov" }, { id: "dec", label: "Dec" },
];

interface Props {
  onSave: (seasons: Season[], months: TravelMonth[]) => Promise<void>;
}

export default function InlineAvailability({ onSave }: Props) {
  const [seasons, setSeasons] = useState<Set<Season>>(new Set());
  const [months, setMonths] = useState<Set<TravelMonth>>(new Set());
  const [saving, setSaving] = useState(false);

  function toggleSeason(id: Season) {
    setSeasons((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleMonth(id: TravelMonth) {
    setMonths((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function handleSave() {
    setSaving(true);
    await onSave(Array.from(seasons), Array.from(months));
    setSaving(false);
  }

  const hasSelection = seasons.size > 0 || months.size > 0;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--olive-dark)" }}>
          When can you travel?
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>
          This helps surface overlaps with friends
        </p>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Seasons */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>
            Seasons
          </p>
          <div className="grid grid-cols-4 gap-2">
            {SEASONS.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleSeason(s.id)}
                className="flex flex-col items-center py-3 rounded-xl transition-all"
                style={{
                  background: seasons.has(s.id) ? "var(--olive-dark)" : "var(--surface-2)",
                  border: `1px solid ${seasons.has(s.id) ? "var(--olive-dark)" : "var(--border)"}`,
                }}
              >
                <span className="text-xs font-bold" style={{ color: seasons.has(s.id) ? "white" : "var(--chocolate)" }}>
                  {s.label}
                </span>
                <span className="text-[9px] mt-0.5" style={{ color: seasons.has(s.id) ? "rgba(255,255,255,0.55)" : "var(--warm-brown)", opacity: seasons.has(s.id) ? 1 : 0.5 }}>
                  {s.hint}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Months */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>
            Specific months
          </p>
          <div className="grid grid-cols-6 gap-1.5">
            {MONTHS.map((m) => (
              <button
                key={m.id}
                onClick={() => toggleMonth(m.id)}
                className="py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: months.has(m.id) ? "var(--slate)" : "var(--surface-2)",
                  color: months.has(m.id) ? "white" : "var(--chocolate)",
                  border: `1px solid ${months.has(m.id) ? "var(--slate)" : "var(--border)"}`,
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasSelection || saving}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-35"
          style={{ background: "var(--terracotta)", color: "white" }}
        >
          {saving ? "Saving..." : "Save availability"}
        </button>
      </div>
    </div>
  );
}
