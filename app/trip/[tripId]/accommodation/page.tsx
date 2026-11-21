"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToTrip, subscribeToAvailability, TripAvailability } from "@/lib/trips";
import { Trip } from "@/types";
import { DESTINATION_COSTS } from "@/data/destinations";
import AppShell from "@/components/AppShell";
import Link from "next/link";

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start + "T00:00:00");
  const end_ = new Date(end + "T00:00:00");
  while (cur <= end_) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function getOverlapDates(avails: TripAvailability[]): { start: string; end: string; nights: number } | null {
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
  return {
    start: overlapping[0],
    end: overlapping[overlapping.length - 1],
    nights: overlapping.length - 1,
  };
}

const BOOKING_SITES = [
  {
    name: "Airbnb",
    description: "Entire homes, unique stays, and local experiences",
    color: "var(--terracotta)",
    buildUrl: (dest: string) => `https://www.airbnb.com/s/${encodeURIComponent(dest)}/homes`,
  },
  {
    name: "Booking.com",
    description: "Hotels, apartments, and guesthouses",
    color: "var(--slate)",
    buildUrl: (dest: string) => `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}`,
  },
  {
    name: "Hotels.com",
    description: "Hotels and earn free nights",
    color: "var(--warm-brown)",
    buildUrl: (dest: string) => `https://www.hotels.com/search/where:${encodeURIComponent(dest)}`,
  },
  {
    name: "VRBO",
    description: "Vacation rentals for groups",
    color: "var(--olive-dark)",
    buildUrl: (dest: string) => `https://www.vrbo.com/search/keywords:${encodeURIComponent(dest)}`,
  },
];

export default function AccommodationPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [availabilities, setAvailabilities] = useState<TripAvailability[]>([]);

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

  const destName = trip.destination?.name ?? trip.name;
  const costs = trip.destination ? DESTINATION_COSTS[trip.destination.id] : null;
  const overlap = getOverlapDates(availabilities);
  const groupSize = availabilities.length || 2;

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/trip/${tripId}`} className="text-sm font-semibold" style={{ color: "var(--terracotta)" }}>
          Back
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <div>
          <h1 className="text-3xl font-black" style={{ color: "var(--chocolate)" }}>Book accommodation</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>{trip.name}</p>
        </div>
      </div>

      {/* Cost estimate */}
      {costs && overlap && (
        <div
          className="rounded-2xl px-5 py-4 mb-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--olive-dark)" }}>
            Rough cost estimate
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl px-4 py-3" style={{ background: "var(--surface-2)" }}>
              <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>Per person per night</p>
              <p className="text-xl font-black" style={{ color: "var(--chocolate)" }}>
                ~${Math.round(costs.hotel / Math.max(groupSize / 2, 1))}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>sharing a room</p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ background: "var(--surface-2)" }}>
              <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>Total stay est.</p>
              <p className="text-xl font-black" style={{ color: "var(--chocolate)" }}>
                ~${Math.round((costs.hotel * overlap.nights) / Math.max(groupSize / 2, 1))}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>{overlap.nights} night{overlap.nights !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>{costs.note}</p>
        </div>
      )}

      {/* Overlap dates */}
      {overlap && (
        <div
          className="rounded-2xl px-5 py-4 mb-4"
          style={{ background: "var(--olive-light)", border: "1px solid var(--olive)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--olive-dark)" }}>
            Dates to book
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--chocolate)" }}>
            {new Date(overlap.start + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {" – "}
            {new Date(overlap.end + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      )}

      {/* Booking links */}
      <div
        className="rounded-2xl px-5 py-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--olive-dark)" }}>
          Search in {destName}
        </p>
        <div className="flex flex-col gap-3">
          {BOOKING_SITES.map((site) => (
            <a
              key={site.name}
              href={site.buildUrl(destName)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-5 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-between"
              style={{ background: site.color, color: "white" }}
            >
              <div>
                <div>{site.name}</div>
                <div className="text-xs font-normal mt-0.5" style={{ opacity: 0.75 }}>{site.description}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
        <p className="text-xs mt-4 text-center" style={{ color: "var(--warm-brown)", opacity: 0.4 }}>
          Direct booking API integrations coming soon
        </p>
      </div>
    </AppShell>
  );
}
