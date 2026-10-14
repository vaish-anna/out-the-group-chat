"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToAvailability, submitAvailability, subscribeToMembers, TripAvailability } from "@/lib/trips";
import { Member, DateRange } from "@/types";
import AppShell from "@/components/AppShell";
import Link from "next/link";

const VIBES = [
  { id: "relax",     label: "Relax" },
  { id: "adventure", label: "Adventure" },
  { id: "food",      label: "Food" },
  { id: "culture",   label: "Culture" },
  { id: "nightlife", label: "Nightlife" },
] as const;

type Vibe = (typeof VIBES)[number]["id"];

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

function getOverlapCounts(availabilities: TripAvailability[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const avail of availabilities) {
    for (const range of avail.dateRanges) {
      for (const date of getDatesInRange(range.start, range.end)) {
        counts[date] = (counts[date] ?? 0) + 1;
      }
    }
  }
  return counts;
}

function CalendarMonth({
  year, month, overlapCounts, totalMembers, selectedDates, onToggle,
}: {
  year: number; month: number;
  overlapCounts: Record<string, number>;
  totalMembers: number;
  selectedDates: Set<string>;
  onToggle: (date: string) => void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month, 1).toLocaleString("default", { month: "long", year: "numeric" });

  const cells: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }),
  ];

  function overlapStyle(count: number): React.CSSProperties {
    if (!count) return {};
    const intensity = count / Math.max(totalMembers, 1);
    if (intensity >= 1)   return { background: "var(--olive-dark)", color: "white" };
    if (intensity >= 0.6) return { background: "var(--olive)", color: "white" };
    if (intensity >= 0.3) return { background: "var(--olive-light)", color: "var(--olive-dark)" };
    return { background: "var(--powder)", color: "var(--slate)" };
  }

  return (
    <div>
      <p className="text-sm font-bold mb-3" style={{ color: "var(--chocolate)" }}>{monthName}</p>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-[10px] font-semibold pb-1" style={{ color: "var(--warm-brown)", opacity: 0.4 }}>
            {d}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;
          const overlap = overlapCounts[date] ?? 0;
          const selected = selectedDates.has(date);
          return (
            <button
              key={date}
              onClick={() => onToggle(date)}
              className="aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-all"
              style={{
                outline: selected ? "2px solid var(--terracotta)" : "none",
                outlineOffset: "1px",
                color: overlap ? undefined : "var(--chocolate)",
                ...overlapStyle(overlap),
              }}
            >
              {new Date(date + "T00:00:00").getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AvailabilityPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [availabilities, setAvailabilities] = useState<TripAvailability[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [vibes, setVibes] = useState<Set<Vibe>>(new Set());
  const [budget, setBudget] = useState<[number, number]>([500, 2000]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tripId) return;
    const u1 = subscribeToAvailability(tripId, (avails) => {
      setAvailabilities(avails);
      const mine = avails.find((a) => a.uid === user?.uid);
      if (mine) {
        const dates = new Set<string>();
        mine.dateRanges.forEach((r) => getDatesInRange(r.start, r.end).forEach((d) => dates.add(d)));
        setSelectedDates(dates);
        setVibes(new Set(mine.vibes as Vibe[]));
        setBudget([mine.budgetRange.min, mine.budgetRange.max]);
      }
    });
    const u2 = subscribeToMembers(tripId, setMembers);
    return () => { u1(); u2(); };
  }, [tripId, user?.uid]);

  function toggleDate(date: string) {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (!rangeStart) {
        setRangeStart(date);
        next.add(date);
      } else {
        const start = rangeStart < date ? rangeStart : date;
        const end   = rangeStart < date ? date : rangeStart;
        getDatesInRange(start, end).forEach((d) => next.add(d));
        setRangeStart(null);
      }
      return next;
    });
  }

  function selectedDateRanges(): DateRange[] {
    const sorted = Array.from(selectedDates).sort();
    if (!sorted.length) return [];
    const ranges: DateRange[] = [];
    let start = sorted[0];
    let prev  = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      const diff = (new Date(sorted[i] + "T00:00:00").getTime() - new Date(prev + "T00:00:00").getTime()) / 86400000;
      if (diff > 1) { ranges.push({ start, end: prev }); start = sorted[i]; }
      prev = sorted[i];
    }
    ranges.push({ start, end: prev });
    return ranges;
  }

  async function handleSave() {
    if (!user || !tripId) return;
    setSaving(true);
    await submitAvailability(tripId, {
      uid: user.uid,
      dateRanges: selectedDateRanges(),
      vibes: Array.from(vibes) as Vibe[],
      budgetRange: { min: budget[0], max: budget[1] },
    });
    router.push(`/trip/${tripId}`);
  }

  const overlapCounts = getOverlapCounts(availabilities);
  const today = new Date();
  const months = Array.from({ length: 3 }, (_, i) => ({
    year: today.getMonth() + i > 11 ? today.getFullYear() + 1 : today.getFullYear(),
    month: (today.getMonth() + i) % 12,
  }));

  if (loading) {
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
          <h1 className="text-3xl font-black" style={{ color: "var(--chocolate)" }}>When can you go?</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>
            Tap a date to start, tap again to end a range
          </p>
        </div>
      </div>

      {/* Overlap legend */}
      {availabilities.length > 1 && (
        <div
          className="rounded-2xl px-5 py-4 mb-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--olive-dark)" }}>
            {availabilities.length} people submitted — overlap shown
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: "1 person", style: { background: "var(--powder)", color: "var(--slate)" } },
              { label: "2+ people", style: { background: "var(--olive-light)", color: "var(--olive-dark)" } },
              { label: "Everyone", style: { background: "var(--olive-dark)", color: "white" } },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded" style={item.style} />
                <span className="text-xs" style={{ color: "var(--warm-brown)", opacity: 0.7 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div
        className="rounded-2xl px-5 py-5 mb-4 flex flex-col gap-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {months.map(({ year, month }) => (
          <CalendarMonth
            key={`${year}-${month}`}
            year={year} month={month}
            overlapCounts={overlapCounts}
            totalMembers={members.length}
            selectedDates={selectedDates}
            onToggle={toggleDate}
          />
        ))}
        {selectedDates.size > 0 && (
          <button
            onClick={() => { setSelectedDates(new Set()); setRangeStart(null); }}
            className="text-xs font-semibold"
            style={{ color: "var(--warm-brown)", opacity: 0.5 }}
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Vibes */}
      <div
        className="rounded-2xl px-5 py-5 mb-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--olive-dark)" }}>
          What's the vibe?
        </p>
        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <button
              key={v.id}
              onClick={() => setVibes((p) => { const n = new Set(p); n.has(v.id) ? n.delete(v.id) : n.add(v.id); return n; })}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: vibes.has(v.id) ? "var(--olive-dark)" : "var(--surface-2)",
                color: vibes.has(v.id) ? "white" : "var(--chocolate)",
                border: `1px solid ${vibes.has(v.id) ? "var(--olive-dark)" : "var(--border)"}`,
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div
        className="rounded-2xl px-5 py-5 mb-24"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--olive-dark)" }}>
          Budget range
        </p>
        <p className="text-xs mb-4" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>Per person, total trip</p>
        <div className="flex items-center gap-4">
          {[
            { label: "Min", idx: 0 },
            { label: "Max", idx: 1 },
          ].map(({ label, idx }) => (
            <div key={label} className="flex-1">
              <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>{label}</label>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <span className="text-sm" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>$</span>
                <input
                  type="number"
                  value={budget[idx]}
                  onChange={(e) => setBudget((p) => idx === 0 ? [Number(e.target.value), p[1]] : [p[0], Number(e.target.value)])}
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                  style={{ color: "var(--chocolate)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky save */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 py-4"
        style={{ background: "var(--cream)", borderTop: "1px solid var(--border)" }}
      >
        <div style={{ maxWidth: "720px", marginLeft: "240px" }}>
          <button
            onClick={handleSave}
            disabled={selectedDates.size === 0 || saving}
            className="w-full font-bold py-4 rounded-2xl text-base transition-all active:scale-95 disabled:opacity-40"
            style={{ background: "var(--terracotta)", color: "white" }}
          >
            {saving ? "Saving..." : "Save availability"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
