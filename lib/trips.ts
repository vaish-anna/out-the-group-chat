import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { Trip, Member, Decision, DecisionOption } from "@/types";
import { nanoid } from "nanoid";

// Trip-specific availability (separate from user profile Availability)
export interface TripAvailability {
  uid: string;
  dateRanges: { start: string; end: string }[];
  vibes: string[];
  budgetRange: { min: number; max: number };
}

// ── Trips ──────────────────────────────────────────────────────────────────

export async function createTrip(
  name: string,
  organizerId: string,
  organizerName: string
): Promise<string> {
  const tripId = nanoid(10);
  const inviteCode = nanoid(8);
  const trip: Trip = {
    id: tripId,
    name,
    organizerId,
    organizerName,
    status: "planning",
    inviteCode,
    createdAt: Date.now(),
    participantUids: [organizerId],
  };
  await setDoc(doc(db, "trips", tripId), trip);
  // Add organizer as first member
  await setDoc(doc(db, "trips", tripId, "members", organizerId), {
    uid: organizerId,
    displayName: organizerName,
    photoURL: "",
    joinedAt: Date.now(),
    hasSubmittedPrefs: false,
  });
  return tripId;
}

export async function getTripByInviteCode(inviteCode: string): Promise<Trip | null> {
  const q = query(collection(db, "trips"), where("inviteCode", "==", inviteCode));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Trip;
}

export async function getTrip(tripId: string): Promise<Trip | null> {
  const snap = await getDoc(doc(db, "trips", tripId));
  return snap.exists() ? (snap.data() as Trip) : null;
}

export function subscribeToTrip(tripId: string, cb: (trip: Trip) => void) {
  return onSnapshot(doc(db, "trips", tripId), (snap) => {
    if (snap.exists()) cb(snap.data() as Trip);
  });
}

// ── Members ────────────────────────────────────────────────────────────────

export async function joinTrip(
  tripId: string,
  uid: string,
  displayName: string,
  photoURL: string
) {
  const { arrayUnion } = await import("firebase/firestore");
  await setDoc(doc(db, "trips", tripId, "members", uid), {
    uid,
    displayName,
    photoURL,
    joinedAt: Date.now(),
    hasSubmittedPrefs: false,
  });
  await updateDoc(doc(db, "trips", tripId), {
    participantUids: arrayUnion(uid),
  });
}

export function subscribeToMembers(tripId: string, cb: (members: Member[]) => void) {
  return onSnapshot(collection(db, "trips", tripId, "members"), (snap) => {
    cb(snap.docs.map((d) => d.data() as Member));
  });
}

// ── Availability ───────────────────────────────────────────────────────────

export async function submitAvailability(tripId: string, avail: TripAvailability) {
  await setDoc(doc(db, "trips", tripId, "availability", avail.uid), avail);
  await updateDoc(doc(db, "trips", tripId, "members", avail.uid), {
    hasSubmittedPrefs: true,
  });
}

export function subscribeToAvailability(
  tripId: string,
  cb: (avails: TripAvailability[]) => void
) {
  return onSnapshot(collection(db, "trips", tripId, "availability"), (snap) => {
    cb(snap.docs.map((d) => d.data() as TripAvailability));
  });
}

// ── Decisions ──────────────────────────────────────────────────────────────

export async function createDecision(
  tripId: string,
  decision: Omit<Decision, "id">
): Promise<string> {
  const id = nanoid(8);
  await setDoc(doc(db, "trips", tripId, "decisions", id), { ...decision, id });
  return id;
}

export async function voteOnOption(
  tripId: string,
  decisionId: string,
  option: DecisionOption,
  uid: string,
  vote: "up" | "down" | "remove"
) {
  const ref = doc(db, "trips", tripId, "decisions", decisionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const decision = snap.data() as Decision;
  const options = decision.options.map((o) => {
    if (o.id !== option.id) return o;
    let thumbsUp = o.thumbsUp.filter((id) => id !== uid);
    let thumbsDown = o.thumbsDown.filter((id) => id !== uid);
    if (vote === "up") thumbsUp = [...thumbsUp, uid];
    if (vote === "down") thumbsDown = [...thumbsDown, uid];
    return { ...o, thumbsUp, thumbsDown };
  });
  await updateDoc(ref, { options });
}

export async function finalizeOption(
  tripId: string,
  decisionId: string,
  optionId: string
) {
  const ref = doc(db, "trips", tripId, "decisions", decisionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const decision = snap.data() as Decision;
  const options = decision.options.map((o) => ({
    ...o,
    isFinalized: o.id === optionId,
  }));
  await updateDoc(ref, { options, finalizedOptionId: optionId });
}

export function subscribeToUserTrips(uid: string, cb: (trips: Trip[]) => void) {
  return onSnapshot(
    query(collection(db, "trips"), where("participantUids", "array-contains", uid)),
    (snap) => {
      const trips = snap.docs
        .map((d) => d.data() as Trip)
        .filter((t) => t.status !== "done" && t.status !== "completed")
        .sort((a, b) => b.createdAt - a.createdAt);
      cb(trips);
    }
  );
}

export function subscribeToDecisions(
  tripId: string,
  cb: (decisions: Decision[]) => void
) {
  return onSnapshot(collection(db, "trips", tripId, "decisions"), (snap) => {
    cb(snap.docs.map((d) => d.data() as Decision));
  });
}
