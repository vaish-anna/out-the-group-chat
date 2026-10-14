"use client";
import { Destination } from "@/types";
import {
  REGION_GRADIENT,
  DESTINATION_VIBE,
  DESTINATION_PHOTO,
  DESTINATION_WEATHER,
  DESTINATION_HIGHLIGHTS,
} from "@/data/destinations";

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
  const photoId = DESTINATION_PHOTO[destination.id];
  const gradient = REGION_GRADIENT[destination.region] ?? REGION_GRADIENT["Europe"];
  const vibe = DESTINATION_VIBE[destination.id];
  const weather = DESTINATION_WEATHER[destination.id];
  const highlights = DESTINATION_HIGHLIGHTS[destination.id];

  const photoUrl = photoId
    ? `https://images.unsplash.com/photo-${photoId}?w=800&q=75&auto=format&fit=crop`
    : null;

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
              {vibe ? ` · ${vibe}` : ""}
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
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + "/profile/me");
              }}
              className="px-4 py-3 rounded-2xl font-bold text-sm"
              style={{ background: "var(--surface)", color: "var(--chocolate)", border: "1px solid var(--border)" }}
              title="Share your profile"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
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

          {/* Highlights */}
          {highlights && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--olive-dark)" }}>
                Things to see & do
              </p>
              <div className="flex flex-col gap-2">
                {highlights.map((h, i) => (
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
              </div>
            </div>
          )}

          {!weather && !highlights && (
            <div className="py-4 text-center" style={{ color: "var(--warm-brown)", opacity: 0.4 }}>
              <p className="text-sm">More details coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
