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
import Link from "next/link";
import { nanoid } from "nanoid";

const CATEGORIES: Decision["category"][] = [
  "destination",
  "dates",
  "transport",
  "accommodation",
  "activity",
];

const CATEGORY_EMOJI: Record<Decision["category"], string> = {
  destination: "🌍",
  dates: "📅",
  transport: "✈️",
  accommodation: "🏨",
  activity: "🎯",
};

function VoteBar({ option, uid, decisionId, tripId, isOrganizer, decisionFinalized }: {
  option: DecisionOption;
  uid: string;
  decisionId: string;
  tripId: string;
  isOrganizer: boolean;
  decisionFinalized: boolean;
}) {
  const myVote = option.thumbsUp.includes(uid)
    ? "up"
    : option.thumbsDown.includes(uid)
    ? "down"
    : null;

  async function handleVote(v: "up" | "down") {
    if (decisionFinalized) return;
    if (myVote === v) {
      await voteOnOption(tripId, decisionId, option, uid, "remove");
    } else {
      await voteOnOption(tripId, decisionId, option, uid, v);
    }
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-3 border transition-all ${
        option.isFinalized
          ? "bg-emerald-50 border-emerald-300"
          : "bg-gray-50 border-gray-100"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${option.isFinalized ? "text-emerald-800" : "text-gray-800"}`}>
          {option.isFinalized && "✓ "}{option.label}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-emerald-600">👍 {option.thumbsUp.length}</span>
          <span className="text-xs text-red-400">👎 {option.thumbsDown.length}</span>
        </div>
      </div>
      {!decisionFinalized && (
        <div className="flex gap-2">
          <button
            onClick={() => handleVote("up")}
            className={`text-lg transition-transform active:scale-90 ${myVote === "up" ? "opacity-100" : "opacity-40 hover:opacity-80"}`}
          >
            👍
          </button>
          <button
            onClick={() => handleVote("down")}
            className={`text-lg transition-transform active:scale-90 ${myVote === "down" ? "opacity-100" : "opacity-40 hover:opacity-80"}`}
          >
            👎
          </button>
        </div>
      )}
      {isOrganizer && !decisionFinalized && (
        <button
          onClick={() => finalizeOption(tripId, decisionId, option.id)}
          className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg ml-1"
        >
          Pick
        </button>
      )}
    </div>
  );
}

function DecisionCard({
  decision,
  uid,
  tripId,
  isOrganizer,
}: {
  decision: Decision;
  uid: string;
  tripId: string;
  isOrganizer: boolean;
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
    setNewOption("");
    setAdding(false);
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{CATEGORY_EMOJI[decision.category]}</span>
          <div>
            <p className="font-bold text-gray-900 text-sm">{decision.title}</p>
            <p className="text-xs text-gray-400 capitalize">{decision.category}</p>
          </div>
        </div>
        {isFinalized && (
          <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
            Decided ✓
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
                placeholder="Add option…"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addOption()}
                autoFocus
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-400"
              />
              <button onClick={addOption} className="text-sm font-bold text-violet-600">
                Add
              </button>
              <button onClick={() => setAdding(false)} className="text-sm text-gray-400">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="text-xs text-violet-500 font-semibold hover:text-violet-700"
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
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  async function handleCreate() {
    if (!newTitle.trim() || !tripId) return;
    setCreating(true);
    await createDecision(tripId, {
      category: newCategory,
      title: newTitle.trim(),
      options: [],
    });
    setNewTitle("");
    setShowNew(false);
    setCreating(false);
  }

  const isOrganizer = user?.uid === trip?.organizerId;

  if (loading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen px-5 py-8 max-w-md mx-auto flex flex-col gap-5 pb-24">
      <div className="flex items-center gap-3">
        <Link href={`/trip/${tripId}`} className="text-gray-400 hover:text-gray-600 text-xl">
          ←
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-900">Decision board</h1>
          <p className="text-xs text-gray-400">{trip.name}</p>
        </div>
      </div>

      {decisions.length === 0 && !showNew && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🤔</div>
          <p className="text-sm font-medium">No decisions yet.</p>
          <p className="text-xs mt-1">Add one to start voting with your crew.</p>
        </div>
      )}

      {decisions.map((d) => (
        <DecisionCard
          key={d.id}
          decision={d}
          uid={user!.uid}
          tripId={tripId}
          isOrganizer={isOrganizer}
        />
      ))}

      {showNew ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-violet-200 flex flex-col gap-3">
          <h2 className="font-bold text-gray-800 text-sm">New decision</h2>
          <input
            type="text"
            placeholder="e.g. Where should we stay?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-400"
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  newCategory === cat
                    ? "bg-violet-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {CATEGORY_EMOJI[cat]} {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || creating}
              className="flex-1 bg-violet-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm"
            >
              {creating ? "Creating…" : "Create"}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full border-2 border-dashed border-gray-200 hover:border-violet-300 text-gray-400 hover:text-violet-500 font-semibold py-4 rounded-2xl text-sm transition-all"
        >
          + Add a decision
        </button>
      )}
    </main>
  );
}
