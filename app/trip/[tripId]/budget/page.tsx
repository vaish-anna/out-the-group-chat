"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToTrip, subscribeToMembers, submitBudget, subscribeToBudgets, TripBudget } from "@/lib/trips";
import { Trip, Member } from "@/types";
import { DESTINATION_COSTS } from "@/data/destinations";
import Avatar from "@/components/Avatar";
import AppShell from "@/components/AppShell";
import Link from "next/link";

export default function BudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [budgets, setBudgets] = useState<TripBudget[]>([]);
  const [myBudget, setMyBudget] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tripId) return;
    const u1 = subscribeToTrip(tripId, setTrip);
    const u2 = subscribeToMembers(tripId, setMembers);
    const u3 = subscribeToBudgets(tripId, (b) => {
      setBudgets(b);
      const mine = b.find((x) => x.uid === user?.uid);
      if (mine) setMyBudget(String(mine.maxBudget));
    });
    return () => { u1(); u2(); u3(); };
  }, [tripId, user?.uid]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  async function handleSave() {
    if (!user || !tripId || !myBudget) return;
    setSaving(true);
    const me = members.find((m) => m.uid === user.uid);
    await submitBudget(tripId, {
      uid: user.uid,
      displayName: me?.displayName ?? user.displayName ?? "",
      maxBudget: Number(myBudget),
      updatedAt: Date.now(),
    });
    setSaving(false);
  }

  if (loading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--terracotta)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const costs = trip.destination ? DESTINATION_COSTS[trip.destination.id] : null;
  const submitted = budgets.length;
  const values = budgets.map((b) => b.maxBudget).filter(Boolean);
  const minBudget = values.length ? Math.min(...values) : null;
  const maxBudget = values.length ? Math.max(...values) : null;
  const avgBudget = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;

  return (
    <AppShell>
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/trip/${tripId}`} className="text-sm font-semibold" style={{ color: "var(--terracotta)" }}>
          Back
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <div>
          <h1 className="text-3xl font-black" style={{ color: "var(--chocolate)" }}>Group budget</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>{trip.name}</p>
        </div>
      </div>

      {/* Destination cost baseline */}
      {costs && (
        <div
          className="rounded-2xl px-5 py-5 mb-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--olive-dark)" }}>
            What to expect in {trip.destination?.name}
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl px-4 py-3" style={{ background: "var(--surface-2)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>Avg meal (mid-range)</p>
              <p className="text-2xl font-black" style={{ color: "var(--chocolate)" }}>~${costs.meal}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>per person</p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ background: "var(--surface-2)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>Avg hotel per night</p>
              <p className="text-2xl font-black" style={{ color: "var(--chocolate)" }}>~${costs.hotel}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>3-star, mid-range</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--warm-brown)", opacity: 0.65 }}>{costs.note}</p>
        </div>
      )}

      {/* Group summary */}
      {submitted > 0 && (
        <div
          className="rounded-2xl px-5 py-5 mb-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--olive-dark)" }}>
            Group range ({submitted} of {members.length} submitted)
          </p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Lowest", value: minBudget },
              { label: "Average", value: avgBudget },
              { label: "Highest", value: maxBudget },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl px-3 py-3 text-center" style={{ background: "var(--surface-2)" }}>
                <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>{label}</p>
                <p className="text-xl font-black" style={{ color: "var(--chocolate)" }}>${value?.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {budgets.map((b) => {
              const member = members.find((m) => m.uid === b.uid);
              return (
                <div key={b.uid} className="flex items-center gap-3">
                  <Avatar name={b.displayName} photoURL={member?.photoURL} size={28} />
                  <span className="text-sm flex-1" style={{ color: "var(--chocolate)" }}>{b.displayName}</span>
                  <span className="text-sm font-bold" style={{ color: "var(--terracotta)" }}>${b.maxBudget.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My budget input */}
      <div
        className="rounded-2xl px-5 py-5 mb-24"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--olive-dark)" }}>
          Your max budget
        </p>
        <p className="text-xs mb-4" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>Total trip budget per person, all in (flights, accommodation, food, activities)</p>
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <span className="text-lg font-semibold" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>$</span>
          <input
            type="number"
            value={myBudget}
            onChange={(e) => setMyBudget(e.target.value)}
            placeholder="e.g. 2500"
            className="flex-1 bg-transparent text-xl font-black outline-none"
            style={{ color: "var(--chocolate)" }}
          />
        </div>
      </div>

      {/* Sticky save */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 md:px-6" style={{ background: "var(--cream)", borderTop: "1px solid var(--border)" }}>
        <div className="md:ml-[240px]" style={{ maxWidth: "720px" }}>
          <button
            onClick={handleSave}
            disabled={!myBudget || saving}
            className="w-full font-bold py-4 rounded-2xl text-base transition-all active:scale-95 disabled:opacity-40"
            style={{ background: "var(--terracotta)", color: "white" }}
          >
            {saving ? "Saving..." : "Save my budget"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
