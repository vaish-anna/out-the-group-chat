"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createProfile, updateProfile } from "@/lib/users";
import { Destination, Season, TravelMonth, UserProfile } from "@/types";
import { CURATED_DESTINATIONS, searchDestinations } from "@/data/destinations";
import { nanoid } from "nanoid";

const SEASONS: { id: Season; label: string }[] = [
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "fall", label: "Fall" },
  { id: "winter", label: "Winter" },
];

const MONTHS: { id: TravelMonth; label: string }[] = [
  { id: "jan", label: "Jan" }, { id: "feb", label: "Feb" }, { id: "mar", label: "Mar" },
  { id: "apr", label: "Apr" }, { id: "may", label: "May" }, { id: "jun", label: "Jun" },
  { id: "jul", label: "Jul" }, { id: "aug", label: "Aug" }, { id: "sep", label: "Sep" },
  { id: "oct", label: "Oct" }, { id: "nov", label: "Nov" }, { id: "dec", label: "Dec" },
];

const FEATURED_REGIONS = ["Europe", "Asia", "Americas", "Africa", "Oceania", "Middle East"];

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0); // 0=phone, 1=destinations, 2=availability
  const [phone, setPhone] = useState("");
  const [wishlist, setWishlist] = useState<Destination[]>([]);
  const [seasons, setSeasons] = useState<Set<Season>>(new Set());
  const [months, setMonths] = useState<Set<TravelMonth>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("Europe");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      const results = await searchDestinations(searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  function toggleDestination(dest: Destination) {
    setWishlist((prev) => {
      const exists = prev.find((d) => d.name === dest.name && d.country === dest.country);
      if (exists) return prev.filter((d) => !(d.name === dest.name && d.country === dest.country));
      return [...prev, dest];
    });
  }

  function isSelected(dest: Destination) {
    return wishlist.some((d) => d.name === dest.name && d.country === dest.country);
  }

  function toggleSeason(s: Season) {
    setSeasons((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  }

  function toggleMonth(m: TravelMonth) {
    setMonths((prev) => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });
  }

  async function finish(skip = false) {
    if (!user) return;
    setSaving(true);
    const profile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName ?? "Traveler",
      photoURL: user.photoURL ?? "",
      phoneNumber: phone.replace(/\D/g, ""),
      bio: "",
      wishlist: skip ? [] : wishlist,
      availability: {
        seasons: skip ? [] : Array.from(seasons),
        months: skip ? [] : Array.from(months),
        dateRanges: [],
      },
      travelPlans: [],
      onboardingComplete: true,
      createdAt: Date.now(),
    };
    await createProfile(profile);
    router.replace("/dashboard");
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--terracotta)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const filteredCurated = CURATED_DESTINATIONS.filter((d) => d.region === selectedRegion);

  return (
    <main className="min-h-screen flex flex-col px-5 py-10 max-w-md mx-auto" style={{ background: "var(--cream)" }}>
      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i <= step ? "var(--terracotta)" : "var(--border)" }}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-6 flex-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--terracotta)" }}>Step 1 of 3</p>
            <h1 className="text-2xl font-black" style={{ color: "var(--chocolate)" }}>What's your number?</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--warm-brown)" }}>
              We'll use this to help you find friends who are already on the app.
            </p>
          </div>
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoFocus
            className="w-full px-4 py-3.5 rounded-2xl text-base font-medium outline-none border-2 transition-colors"
            style={{
              background: "var(--surface)",
              borderColor: phone ? "var(--terracotta)" : "var(--border)",
              color: "var(--chocolate)",
            }}
          />
          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={() => setStep(1)}
              disabled={!phone.trim()}
              className="w-full font-bold py-4 rounded-2xl text-base transition-all active:scale-95 disabled:opacity-40"
              style={{ background: "var(--terracotta)", color: "white" }}
            >
              Continue
            </button>
            <button
              onClick={() => setStep(1)}
              className="text-sm text-center"
              style={{ color: "var(--warm-brown)", opacity: 0.7 }}
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-5 flex-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--terracotta)" }}>Step 2 of 3</p>
            <h1 className="text-2xl font-black" style={{ color: "var(--chocolate)" }}>Where do you want to go?</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--warm-brown)" }}>
              Build your bucket list. You can always add more later.
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search any destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none border-2 transition-colors"
              style={{
                background: "var(--surface)",
                borderColor: searchQuery ? "var(--terracotta)" : "var(--border)",
                color: "var(--chocolate)",
              }}
            />
            {(searchResults.length > 0 || searching) && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-2xl shadow-lg overflow-hidden z-10"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                {searching ? (
                  <div className="px-4 py-3 text-sm" style={{ color: "var(--warm-brown)" }}>Searching...</div>
                ) : (
                  searchResults.map((dest, i) => (
                    <button
                      key={i}
                      onClick={() => { toggleDestination(dest); setSearchQuery(""); setSearchResults([]); }}
                      className="w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors hover:opacity-80"
                      style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none", color: "var(--chocolate)" }}
                    >
                      <span>
                        <span className="font-semibold">{dest.name}</span>
                        <span className="ml-1 opacity-60">{dest.country}</span>
                      </span>
                      {isSelected(dest) && <span style={{ color: "var(--terracotta)" }}>Added</span>}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected */}
          {wishlist.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {wishlist.map((d) => (
                <button
                  key={d.id}
                  onClick={() => toggleDestination(d)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                  style={{ background: "var(--terracotta)", color: "white" }}
                >
                  {d.name}
                  <span className="text-xs opacity-70">x</span>
                </button>
              ))}
            </div>
          )}

          {/* Region tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {FEATURED_REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: selectedRegion === r ? "var(--olive-dark)" : "var(--surface-2)",
                  color: selectedRegion === r ? "white" : "var(--chocolate)",
                }}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Curated grid */}
          <div className="grid grid-cols-2 gap-2 overflow-y-auto" style={{ maxHeight: "260px" }}>
            {filteredCurated.map((dest) => (
              <button
                key={dest.id}
                onClick={() => toggleDestination(dest)}
                className="text-left px-3 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: isSelected(dest) ? "var(--terracotta)" : "var(--surface)",
                  color: isSelected(dest) ? "white" : "var(--chocolate)",
                  border: `1px solid ${isSelected(dest) ? "var(--terracotta)" : "var(--border)"}`,
                }}
              >
                <p className="font-semibold leading-tight">{dest.name}</p>
                <p className="text-xs mt-0.5 opacity-60">{dest.country}</p>
              </button>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-2">
            <button
              onClick={() => setStep(2)}
              className="w-full font-bold py-4 rounded-2xl text-base transition-all active:scale-95"
              style={{ background: "var(--terracotta)", color: "white" }}
            >
              {wishlist.length > 0 ? `Continue with ${wishlist.length} destination${wishlist.length > 1 ? "s" : ""}` : "Continue"}
            </button>
            <button onClick={() => setStep(2)} className="text-sm text-center" style={{ color: "var(--warm-brown)", opacity: 0.7 }}>
              Skip for now
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6 flex-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--terracotta)" }}>Step 3 of 3</p>
            <h1 className="text-2xl font-black" style={{ color: "var(--chocolate)" }}>When can you travel?</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--warm-brown)" }}>
              This helps us find overlaps with your people.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--olive-dark)" }}>Seasons</p>
            <div className="grid grid-cols-2 gap-2">
              {SEASONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleSeason(s.id)}
                  className="py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    background: seasons.has(s.id) ? "var(--olive-dark)" : "var(--surface)",
                    color: seasons.has(s.id) ? "white" : "var(--chocolate)",
                    border: `1px solid ${seasons.has(s.id) ? "var(--olive-dark)" : "var(--border)"}`,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--olive-dark)" }}>Specific months</p>
            <div className="grid grid-cols-4 gap-2">
              {MONTHS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMonth(m.id)}
                  className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: months.has(m.id) ? "var(--slate)" : "var(--surface)",
                    color: months.has(m.id) ? "white" : "var(--chocolate)",
                    border: `1px solid ${months.has(m.id) ? "var(--slate)" : "var(--border)"}`,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-2">
            <button
              onClick={() => finish(false)}
              disabled={saving}
              className="w-full font-bold py-4 rounded-2xl text-base transition-all active:scale-95 disabled:opacity-50"
              style={{ background: "var(--terracotta)", color: "white" }}
            >
              {saving ? "Setting up your profile..." : "Done, let's go"}
            </button>
            <button
              onClick={() => finish(true)}
              className="text-sm text-center"
              style={{ color: "var(--warm-brown)", opacity: 0.7 }}
            >
              Skip and go to my dashboard
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
