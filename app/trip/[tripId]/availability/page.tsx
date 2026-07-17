"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToAvailability, submitAvailability, subscribeToMembers } from "@/lib/trips";
import { Availability, Member, DateRange } from "@/types";
import Link from "next/link";

const VIBES = [
  { id: "relax", label: "Relax 🏖️" },
  { id: "adventure", label: "Adventure 🧗" },
  { id: "food", label: "Food 🍜" },
  { id: "culture", label: "Culture 🏛️" },
  { id: "nightlife", label: "Nightlife 🎉" },
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

function getOverlapCounts(availabilities: Availability[]): Record<string, number> {
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
  year,
  month,
  overlapCounts,
  totalMembers,
  selectedDates,
  onToggle,
}: {
  year: number;
  month: number;
  overlapCounts: Record<string, number>;
  totalMembers: number;
  selectedDates: Set<string>;
  onToggle: (date: string) => void;
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const cells: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }),
  ];

  function overlapColor(count: number) {
    if (!count) return "";
    const intensity = count / Math.max(totalMembers, 1);
    if (intensity >= 1) return "bg-violet-600 text-white";
    if (intensity >= 0.6) return "bg-violet-400 text-white";
    if (intensity >= 0.3) return "bg-violet-200 text-violet-800";
    return "bg-violet-100 text-violet-700";
  }

  return (
    <div>
      <p className="font-bold text-gray-700 mb-2 text-sm">{monthName}</p>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-[10px] font-semibold text-gray-400 pb-1">
            {d}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date)
            return <div key={`empty-${i}`} />;
          const overlap = overlapCounts[date] ?? 0;
          const selected = selectedDates.has(date);
          return (
            <button
              key={date}
              onClick={() => onToggle(date)}
              className={`aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-all
                ${selected ? "ring-2 ring-offset-1 ring-violet-500" : ""}
                ${overlap > 0 ? overlapColor(overlap) : "text-gray-700 hover:bg-gray-100"}
              `}
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

  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
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
      // Pre-fill own availability
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
        const end = rangeStart < date ? date : rangeStart;
        getDatesInRange(start, end).forEach((d) => next.add(d));
        setRangeStart(null);
      }
      return next;
    });
  }

  function clearDates() {
    setSelectedDates(new Set());
    setRangeStart(null);
  }

  function toggleVibe(v: Vibe) {
    setVibes((prev) => {
      const next = new Set(prev);
      next.has(v) ? next.delete(v) : next.add(v);
      return next;
    });
  }

  function selectedDateRanges(): DateRange[] {
    const sorted = Array.from(selectedDates).sort();
    if (!sorted.length) return [];
    const ranges: DateRange[] = [];
    let start = sorted[0];
    let prev = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      const cur = sorted[i];
      const prevDate = new Date(prev + "T00:00:00");
      const curDate = new Date(cur + "T00:00:00");
      const diff = (curDate.getTime() - prevDate.getTime()) / 86400000;
      if (diff > 1) {
        ranges.push({ start, end: prev });
        start = cur;
      }
      prev = cur;
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen px-5 py-8 max-w-md mx-auto flex flex-col gap-6 pb-24">
      <div className="flex items-center gap-3">
        <Link href={`/trip/${tripId}`} className="text-gray-400 hover:text-gray-600 text-xl">
          ←
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-900">When can you go?</h1>
          <p className="text-xs text-gray-400">Tap a date to start, tap again to end a range</p>
        </div>
      </div>

      {/* Overlap legend */}
      {availabilities.length > 1 && (
        <div className="bg-violet-50 rounded-2xl px-4 py-3 border border-violet-100">
          <p className="text-xs font-bold text-violet-700 mb-2">
            Overlap ({availabilities.length} people submitted)
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-1">
                <div
                  className={`w-4 h-4 rounded ${
                    n === 1 ? "bg-violet-100" : n === 2 ? "bg-violet-300" : "bg-violet-600"
                  }`}
                />
                <span className="text-xs text-gray-500">{n}+ people</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-6">
        {months.map(({ year, month }) => (
          <CalendarMonth
            key={`${year}-${month}`}
            year={year}
            month={month}
            overlapCounts={overlapCounts}
            totalMembers={members.length}
            selectedDates={selectedDates}
            onToggle={toggleDate}
          />
        ))}
        {selectedDates.size > 0 && (
          <button onClick={clearDates} className="text-xs text-red-400 hover:text-red-600 text-center">
            Clear dates
          </button>
        )}
      </div>

      {/* Vibes */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 mb-3">What&apos;s your vibe?</h2>
        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <button
              key={v.id}
              onClick={() => toggleVibe(v.id)}
              className={`px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                vibes.has(v.id)
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 mb-1">Budget range</h2>
        <p className="text-xs text-gray-400 mb-3">Per person, total trip</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Min</label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">$</span>
              <input
                type="number"
                value={budget[0]}
                onChange={(e) => setBudget([Number(e.target.value), budget[1]])}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-medium outline-none focus:border-violet-400"
              />
            </div>
          </div>
          <span className="text-gray-300 mt-4">–</span>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Max</label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500">$</span>
              <input
                type="number"
                value={budget[1]}
                onChange={(e) => setBudget([budget[0], Number(e.target.value)])}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-medium outline-none focus:border-violet-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={selectedDates.size === 0 || saving}
          className="w-full max-w-md mx-auto block bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-base shadow-md active:scale-95 transition-all"
        >
          {saving ? "Saving…" : "Save availability →"}
        </button>
      </div>
    </main>
  );
}
