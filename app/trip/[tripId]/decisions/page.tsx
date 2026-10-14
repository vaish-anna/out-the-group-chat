"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  subscribeToDecisions,
  subscribeToTrip,
  createDecision,
  voteOnOption,
  finalizeOption,
} from "@/lib/trips";
import { Decision, DecisionOption, Trip } from "@/types";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { nanoid } from "nanoid";

const CATEGORIES: Decision["category"][] = [
  "destination", "dates", "transport", "accommodation", "activity",
];

function VoteBar({ option, uid, decisionId, tripId, isOrganizer, decisionFinalized }: {
  option: DecisionOption; uid: string; decisionId: string;
  tripId: string; isOrganizer: boolean; decisionFinalized: boolean;
}) {
  const myVote = option.thumbsUp.includes(uid) ? "up" : option.thumbsDown.includes(uid) ? "down" : null;

  async function handleVote(v: "up" | "down") {
    if (decisionFinalized) return;
    await voteOnOption(tripId, decisionId, option, uid, myVote === v ? "remove" : v);
  }

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
      style={{
        background: option.isFinalized ? "var(--olive-dark)" : "var(--surface-2)",
        border: `1px solid ${option.isFinalized ? "var(--olive-dark)" : "var(--border)"}`,
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: option.isFinalized ? "white" : "var(--chocolate)" }}>
          {option.isFinalized ? "Decided: " : ""}{option.label}
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs font-semibold" style={{ color: option.isFinalized ? "rgba(255,255,255,0.65)" : "var(--olive-dark)" }}>
            {option.thumbsUp.length} up
          </span>
          <span className="text-xs font-semibold" style={{ color: option.isFinalized ? "rgba(255,255,255,0.45)" : "var(--warm-brown)", opacity: 0.65 }}>
            {option.thumbsDown.length} down
          </span>
        </div>
      </div>

      {!decisionFinalized && (
        <div className="flex gap-2">
          <button
            onClick={() => handleVote("up")}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-90"
            style={{
              background: myVote === "up" ? "var(--olive-dark)" : "var(--surface)",
              color: myVote === "up" ? "white" : "var(--chocolate)",
              border: "1px solid var(--border)",
            }}
          >
            Yes
          </button>
          <button
            onClick={() => handleVote("down")}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-90"
            style={{
              background: myVote === "down" ? "var(--burgundy)" : "var(--surface)",
              color: myVote === "down" ? "white" : "var(--chocolate)",
              border: "1px solid var(--border)",
            }}
          >
            No
          </button>
        </div>
      )}

      {isOrganizer && !decisionFinalized && (
        <button
          onClick={() => finalizeOption(tripId, decisionId, option.id)}
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
          style={{ background: "var(--terracotta)", color: "white" }}
        >
          Pick
        </button>
      )}
    </div>
  );
}

function DecisionCard({ decision, uid, tripId, isOrganizer }: {
  decision: Decision; uid: string; tripId: string; isOrganizer: boolean;
}) {
  const [newOption, setNewOption] = useState("");
  const [adding, setAdding] = useState(false);
  const isFinalized = !!decision.finalizedOptionId;

  async function addOption() {
    if (!newOption.trim()) return;
    const option: DecisionOption = {
      id: nanoid(6),
      label: newOption.trim(),
      thumbsUp: [],
      thumbsDown: [],
      isFinalized: false,
    };
    const { doc, updateDoc, getDoc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");
    const ref = doc(db, "trips", tripId, "decisions", decision.id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { options: [...(snap.data().options ?? []), option] });
    }
    setNewOption(""); setAdding(false);
  }

  return (
    <div
      className="rounded-2xl px-5 py-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-bold text-base" style={{ color: "var(--chocolate)" }}>{decision.title}</p>
          <p className="text-xs capitalize mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>{decision.category}</p>
        </div>
        {isFinalized && (
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
            style={{ background: "var(--olive-light)", color: "var(--olive-dark)" }}
          >
            Decided
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {decision.options.map((opt) => (
          <VoteBar
            key={opt.id}
            option={opt}
            uid={uid}
            decisionId={decision.id}
            tripId={tripId}
            isOrganizer={isOrganizer}
            decisionFinalized={isFinalized}
          />
        ))}
      </div>

      {!isFinalized && (
        <div className="mt-3">
          {adding ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add an option..."
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addOption()}
                autoFocus
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none border-2 transition-colors"
                style={{ background: "var(--surface-2)", borderColor: newOption ? "var(--terracotta)" : "var(--border)", color: "var(--chocolate)" }}
              />
              <button onClick={addOption} className="text-sm font-bold" style={{ color: "var(--terracotta)" }}>Add</button>
              <button onClick={() => setAdding(false)} className="text-sm" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="text-xs font-semibold"
              style={{ color: "var(--terracotta)" }}
            >
              + Add option
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DecisionsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Decision["category"]>("destination");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!tripId) return;
    const u1 = subscribeToDecisions(tripId, setDecisions);
    const u2 = subscribeToTrip(tripId, setTrip);
    return () => { u1(); u2(); };
  }, [tripId]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  async function handleCreate() {
    if (!newTitle.trim() || !tripId) return;
    setCreating(true);
    await createDecision(tripId, { category: newCategory, title: newTitle.trim(), options: [] });
    setNewTitle(""); setShowNew(false); setCreating(false);
  }

  const isOrganizer = user?.uid === trip?.organizerId;

  if (loading || !trip) {
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
          <h1 className="text-3xl font-black" style={{ color: "var(--chocolate)" }}>Decision board</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>{trip.name}</p>
        </div>
      </div>

      {decisions.length === 0 && !showNew && (
        <div className="py-12 text-center" style={{ color: "var(--warm-brown)", opacity: 0.4 }}>
          <p className="text-sm font-medium">No decisions yet.</p>
          <p className="text-xs mt-1">Add one to start voting with your crew.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {decisions.map((d) => (
          <DecisionCard key={d.id} decision={d} uid={user!.uid} tripId={tripId} isOrganizer={isOrganizer} />
        ))}
      </div>

      {showNew ? (
        <div
          className="rounded-2xl px-5 py-5 mt-4 flex flex-col gap-3"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--olive-dark)" }}>New decision</p>
          <input
            type="text"
            placeholder="e.g. Where should we stay?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            className="px-4 py-3 rounded-xl text-sm outline-none border-2 transition-colors"
            style={{ background: "var(--surface-2)", borderColor: newTitle ? "var(--terracotta)" : "var(--border)", color: "var(--chocolate)" }}
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                style={{
                  background: newCategory === cat ? "var(--olive-dark)" : "var(--surface-2)",
                  color: newCategory === cat ? "white" : "var(--chocolate)",
                  border: `1px solid ${newCategory === cat ? "var(--olive-dark)" : "var(--border)"}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || creating}
              className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-40 transition-all"
              style={{ background: "var(--terracotta)", color: "white" }}
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button onClick={() => setShowNew(false)} className="px-4 text-sm font-semibold" style={{ color: "var(--warm-brown)" }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full mt-4 py-4 rounded-2xl text-sm font-semibold transition-all"
          style={{ background: "var(--surface-2)", color: "var(--warm-brown)", border: "2px dashed var(--border)" }}
        >
          + Add a decision
        </button>
      )}
    </AppShell>
  );
}
