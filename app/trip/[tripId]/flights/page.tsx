"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToTrip, subscribeToAvailability, TripAvailability } from "@/lib/trips";
import { Trip } from "@/types";
import AppShell from "@/components/AppShell";
import Link from "next/link";

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

function getOverlapDates(avails: TripAvailability[]): { start: string; end: string } | null {
  if (avails.length < 2) return null;
  const counts: Record<string, number> = {};
  for (const a of avails) {
    for (const r of a.dateRanges) {
      for (const d of getDatesInRange(r.start, r.end)) {
        counts[d] = (counts[d] ?? 0) + 1;
      }
    }
  }
  const overlapping = Object.entries(counts)
    .filter(([, c]) => c >= avails.length)
    .map(([d]) => d)
    .sort();
  if (!overlapping.length) return null;
  return { start: overlapping[0], end: overlapping[overlapping.length - 1] };
}

const FLIGHT_SITES = [
  { name: "Google Flights", color: "var(--terracotta)", buildUrl: (dest: string, from: string, dates: { start: string; end: string } | null) => {
    const q = encodeURIComponent(`flights from ${from || "my city"} to ${dest}${dates ? ` ${dates.start}` : ""}`);
    return `https://www.google.com/travel/flights/search?q=${q}`;
  }},
  { name: "Skyscanner", color: "var(--olive-dark)", buildUrl: (dest: string, from: string, dates: { start: string; end: string } | null) => {
    const d = dates?.start?.replace(/-/g, "") ?? "";
    const f = from.replace(/\s+/g, "-").toLowerCase();
    return `https://www.skyscanner.com/transport/flights/${f}/${dest.replace(/\s+/g, "-").toLowerCase()}/${d}/`;
  }},
  { name: "Kayak", color: "var(--warm-brown)", buildUrl: (dest: string, _from: string, _dates: { start: string; end: string } | null) => {
    return `https://www.kayak.com/flights`;
  }},
];

export default function FlightsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [availabilities, setAvailabilities] = useState<TripAvailability[]>([]);
  const [departureCity, setDepartureCity] = useState("");

  useEffect(() => {
    if (!tripId) return;
    const u1 = subscribeToTrip(tripId, setTrip);
    const u2 = subscribeToAvailability(tripId, setAvailabilities);
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

  const overlapDates = getOverlapDates(availabilities);
  const destName = trip.destination?.name ?? trip.name;

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/trip/${tripId}`} className="text-sm font-semibold" style={{ color: "var(--terracotta)" }}>
          Back
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <div>
          <h1 className="text-3xl font-black" style={{ color: "var(--chocolate)" }}>Check flights</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>{trip.name}</p>
        </div>
      </div>

      {/* Dates from availability */}
      {overlapDates ? (
        <div
          className="rounded-2xl px-5 py-4 mb-4"
          style={{ background: "var(--olive-light)", border: "1px solid var(--olive)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--olive-dark)" }}>
            Group overlap detected
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--chocolate)" }}>
            {new Date(overlapDates.start + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {" – "}
            {new Date(overlapDates.end + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>Dates everyone can make — check flights for this window</p>
        </div>
      ) : availabilities.length < 2 ? (
        <div
          className="rounded-2xl px-5 py-4 mb-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>
            Collect everyone's availability first to see overlapping dates here.
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl px-5 py-4 mb-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>
            No overlapping dates found yet — try more availability submissions.
          </p>
        </div>
      )}

      {/* Departure city input */}
      <div
        className="rounded-2xl px-5 py-5 mb-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--olive-dark)" }}>
          Where are you flying from?
        </p>
        <input
          type="text"
          placeholder="Your departure city (e.g. New York, Toronto)"
          value={departureCity}
          onChange={(e) => setDepartureCity(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 transition-colors"
          style={{
            background: "var(--surface-2)",
            borderColor: departureCity ? "var(--terracotta)" : "var(--border)",
            color: "var(--chocolate)",
          }}
        />
        <p className="text-xs mt-2" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>
          Each person books their own flight — everyone enters their own city here.
        </p>
      </div>

      {/* Search links */}
      <div
        className="rounded-2xl px-5 py-5 mb-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--olive-dark)" }}>
          Search flights to {destName}
        </p>
        <div className="flex flex-col gap-3">
          {FLIGHT_SITES.map((site) => (
            <a
              key={site.name}
              href={site.buildUrl(destName, departureCity, overlapDates)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-center transition-all active:scale-95 block"
              style={{ background: site.color, color: "white" }}
            >
              Search on {site.name}
            </a>
          ))}
        </div>
        <p className="text-xs mt-4 text-center" style={{ color: "var(--warm-brown)", opacity: 0.4 }}>
          Full API flight search coming soon
        </p>
      </div>
    </AppShell>
  );
}
