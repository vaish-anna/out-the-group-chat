"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToTrip } from "@/lib/trips";
import { Trip } from "@/types";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { nanoid } from "nanoid";

interface Activity {
  id: string;
  name: string;
  dressCode: string;
}

interface PackingData {
  activities: Activity[];
  baseOutfits: number;
  extraItems: string[];
}

const ACTIVITY_SUGGESTIONS: Record<string, string[]> = {
  beach:       ["Swimsuit", "Beach towel", "Sunscreen SPF 50+", "Sandals", "Cover-up", "Sunglasses"],
  pool:        ["Swimsuit", "Pool slides", "Sunscreen"],
  hike:        ["Hiking boots", "Moisture-wicking socks", "Rain jacket", "Quick-dry layers", "Daypack", "Sunscreen"],
  trek:        ["Hiking boots", "Rain jacket", "Layering base", "Warm mid-layer", "Daypack", "Trekking poles"],
  dinner:      ["Smart outfit", "Dress shoes or heels"],
  restaurant:  ["Smart casual outfit"],
  fancy:       ["Formal outfit", "Dress shoes or heels"],
  formal:      ["Formal outfit", "Dress shoes or heels"],
  winery:      ["Smart casual outfit", "Comfortable walking shoes"],
  wine:        ["Smart casual outfit"],
  club:        ["Going-out outfit", "Comfortable shoes for dancing"],
  nightlife:   ["Going-out outfit"],
  bar:         ["Going-out outfit"],
  museum:      ["Comfortable walking shoes", "Light layers"],
  culture:     ["Comfortable walking shoes", "Modest cover-up (for religious sites)"],
  temple:      ["Modest cover-up", "Slip-on shoes"],
  ski:         ["Ski jacket", "Ski pants", "Thermal base layer", "Ski gloves", "Ski goggles", "Warm socks"],
  snow:        ["Warm coat", "Thermal layers", "Waterproof boots", "Gloves", "Wool hat"],
  yoga:        ["Yoga mat (if not provided)", "Workout gear"],
  gym:         ["Workout clothes", "Trainers"],
  sailing:     ["Non-slip boat shoes", "Wind-resistant layer", "Sunscreen"],
  diving:      ["Swimsuit", "Rash guard", "Sunscreen"],
  picnic:      ["Comfortable casual outfit"],
  brunch:      ["Casual smart outfit"],
  shopping:    ["Comfortable shoes", "Foldable tote bag"],
};

function suggestItems(activities: Activity[]): string[] {
  const items = new Set<string>();
  for (const a of activities) {
    const text = (a.name + " " + a.dressCode).toLowerCase();
    for (const [keyword, suggestions] of Object.entries(ACTIVITY_SUGGESTIONS)) {
      if (text.includes(keyword)) suggestions.forEach((s) => items.add(s));
    }
  }
  return Array.from(items);
}

const ALWAYS_PACK = [
  "Passport / ID",
  "Travel adapter",
  "Phone charger + cable",
  "Portable battery bank",
  "Reusable water bottle",
  "Hand sanitiser",
  "Paracetamol + basic meds",
  "Lip balm",
];

export default function PackingPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [data, setData] = useState<PackingData>({ activities: [], baseOutfits: 4, extraItems: [] });
  const [newActivity, setNewActivity] = useState("");
  const [newDressCode, setNewDressCode] = useState("");
  const [addingActivity, setAddingActivity] = useState(false);
  const [newExtra, setNewExtra] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tripId) return;
    const u1 = subscribeToTrip(tripId, setTrip);
    const ref = doc(db, "trips", tripId, "meta", "packing");
    getDoc(ref).then((snap) => {
      if (snap.exists()) setData(snap.data() as PackingData);
    });
    return () => u1();
  }, [tripId]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  async function saveData(updated: PackingData) {
    if (!tripId) return;
    setSaving(true);
    await setDoc(doc(db, "trips", tripId, "meta", "packing"), updated);
    setSaving(false);
  }

  function addActivity() {
    if (!newActivity.trim()) return;
    const updated = {
      ...data,
      activities: [...data.activities, { id: nanoid(6), name: newActivity.trim(), dressCode: newDressCode.trim() }],
    };
    setData(updated);
    saveData(updated);
    setNewActivity("");
    setNewDressCode("");
    setAddingActivity(false);
  }

  function removeActivity(id: string) {
    const updated = { ...data, activities: data.activities.filter((a) => a.id !== id) };
    setData(updated);
    saveData(updated);
  }

  function addExtra() {
    if (!newExtra.trim()) return;
    const updated = { ...data, extraItems: [...data.extraItems, newExtra.trim()] };
    setData(updated);
    saveData(updated);
    setNewExtra("");
  }

  function removeExtra(i: number) {
    const updated = { ...data, extraItems: data.extraItems.filter((_, idx) => idx !== i) };
    setData(updated);
    saveData(updated);
  }

  function setOutfits(n: number) {
    const updated = { ...data, baseOutfits: n };
    setData(updated);
    saveData(updated);
  }

  if (loading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--terracotta)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const suggested = suggestItems(data.activities);

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/trip/${tripId}`} className="text-sm font-semibold" style={{ color: "var(--terracotta)" }}>
          Back
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <div>
          <h1 className="text-3xl font-black" style={{ color: "var(--chocolate)" }}>Packing list</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>{trip.name}</p>
        </div>
      </div>

      {/* Activities table */}
      <div
        className="rounded-2xl px-5 py-5 mb-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--olive-dark)" }}>
          What's on the agenda?
        </p>

        {data.activities.length > 0 && (
          <div className="mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="grid grid-cols-2 px-4 py-2" style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>Activity</span>
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>Dress code / vibe</span>
            </div>
            {data.activities.map((a) => (
              <div key={a.id} className="grid grid-cols-2 px-4 py-3 group items-center" style={{ borderTop: "1px solid var(--border)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--chocolate)" }}>{a.name}</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm" style={{ color: "var(--warm-brown)", opacity: a.dressCode ? 1 : 0.4 }}>
                    {a.dressCode || "—"}
                  </span>
                  <button
                    onClick={() => removeActivity(a.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: "var(--warm-brown)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {addingActivity ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Activity (e.g. Beach day, Fancy dinner, Winery tour)"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border-2 transition-colors"
              style={{ background: "var(--surface-2)", borderColor: newActivity ? "var(--terracotta)" : "var(--border)", color: "var(--chocolate)" }}
            />
            <input
              type="text"
              placeholder="Dress code / vibe (e.g. Smart casual, Casual, Swimwear)"
              value={newDressCode}
              onChange={(e) => setNewDressCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addActivity()}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border-2 transition-colors"
              style={{ background: "var(--surface-2)", borderColor: newDressCode ? "var(--terracotta)" : "var(--border)", color: "var(--chocolate)" }}
            />
            <div className="flex gap-2">
              <button
                onClick={addActivity}
                disabled={!newActivity.trim()}
                className="text-sm font-bold disabled:opacity-40"
                style={{ color: "var(--terracotta)" }}
              >
                Add
              </button>
              <button onClick={() => { setAddingActivity(false); setNewActivity(""); setNewDressCode(""); }} className="text-sm" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingActivity(true)}
            className="text-xs font-semibold"
            style={{ color: "var(--terracotta)" }}
          >
            + Add activity
          </button>
        )}
      </div>

      {/* Base outfits */}
      <div
        className="rounded-2xl px-5 py-5 mb-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--olive-dark)" }}>
          General outfits
        </p>
        <p className="text-xs mb-3" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>
          How many general casual outfits (beyond the activities above)?
        </p>
        <div className="flex gap-2 flex-wrap">
          {[2, 3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              onClick={() => setOutfits(n)}
              className="w-10 h-10 rounded-full font-bold text-sm transition-all"
              style={{
                background: data.baseOutfits === n ? "var(--terracotta)" : "var(--surface-2)",
                color: data.baseOutfits === n ? "white" : "var(--chocolate)",
                border: `1px solid ${data.baseOutfits === n ? "var(--terracotta)" : "var(--border)"}`,
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Activity-based suggestions */}
      {suggested.length > 0 && (
        <div
          className="rounded-2xl px-5 py-5 mb-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--olive-dark)" }}>
            Suggested based on your activities
          </p>
          <div className="flex flex-wrap gap-2">
            {suggested.map((item) => (
              <span
                key={item}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "var(--olive-light)", color: "var(--olive-dark)" }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Always pack */}
      <div
        className="rounded-2xl px-5 py-5 mb-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--olive-dark)" }}>
          Always pack
        </p>
        <div className="flex flex-wrap gap-2">
          {ALWAYS_PACK.map((item) => (
            <span
              key={item}
              className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "var(--surface-2)", color: "var(--warm-brown)" }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Extra custom items */}
      <div
        className="rounded-2xl px-5 py-5 mb-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--olive-dark)" }}>
          Anything else?
        </p>
        {data.extraItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {data.extraItems.map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "var(--terracotta)", color: "white" }}
              >
                {item}
                <button onClick={() => removeExtra(i)} style={{ opacity: 0.7 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add an item..."
            value={newExtra}
            onChange={(e) => setNewExtra(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addExtra()}
            className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none border-2 transition-colors"
            style={{ background: "var(--surface-2)", borderColor: newExtra ? "var(--terracotta)" : "var(--border)", color: "var(--chocolate)" }}
          />
          {newExtra.trim() && (
            <button
              onClick={addExtra}
              className="px-4 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: "var(--terracotta)", color: "white" }}
            >
              Add
            </button>
          )}
        </div>
        {saving && <p className="text-xs mt-2" style={{ color: "var(--warm-brown)", opacity: 0.4 }}>Saving...</p>}
      </div>
    </AppShell>
  );
}
