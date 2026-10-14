import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  UserProfile,
  Availability,
  Destination,
  FollowRelation,
  OverlapNotification,
  Season,
  TravelMonth,
} from "@/types";

// ── Profile ────────────────────────────────────────────────────────────────

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function createProfile(profile: UserProfile) {
  await setDoc(doc(db, "users", profile.uid), profile);
  if (profile.phoneNumber) {
    await setDoc(doc(db, "phoneIndex", profile.phoneNumber.replace(/\D/g, "")), {
      uid: profile.uid,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
    });
  }
}

export async function updateProfile(uid: string, updates: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), updates as Record<string, unknown>);
  if (updates.phoneNumber) {
    await setDoc(doc(db, "phoneIndex", updates.phoneNumber.replace(/\D/g, "")), {
      uid,
      displayName: updates.displayName,
      photoURL: updates.photoURL,
    });
  }
}

export function subscribeToProfile(uid: string, cb: (p: UserProfile) => void) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    if (snap.exists()) cb(snap.data() as UserProfile);
  });
}

// ── Social graph ───────────────────────────────────────────────────────────

export async function followUser(myUid: string, myProfile: UserProfile, targetUid: string, targetProfile: UserProfile) {
  const now = Date.now();
  await setDoc(doc(db, "users", myUid, "following", targetUid), {
    uid: targetUid,
    displayName: targetProfile.displayName,
    photoURL: targetProfile.photoURL,
    followedAt: now,
  });
  await setDoc(doc(db, "users", targetUid, "followers", myUid), {
    uid: myUid,
    displayName: myProfile.displayName,
    photoURL: myProfile.photoURL,
    followedAt: now,
  });
}

export async function unfollowUser(myUid: string, targetUid: string) {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "users", myUid, "following", targetUid));
  await deleteDoc(doc(db, "users", targetUid, "followers", myUid));
}

export function subscribeToFollowing(uid: string, cb: (list: FollowRelation[]) => void) {
  return onSnapshot(collection(db, "users", uid, "following"), (snap) => {
    cb(snap.docs.map((d) => d.data() as FollowRelation));
  });
}

export function subscribeToFollowers(uid: string, cb: (list: FollowRelation[]) => void) {
  return onSnapshot(collection(db, "users", uid, "followers"), (snap) => {
    cb(snap.docs.map((d) => d.data() as FollowRelation));
  });
}

export async function isFollowing(myUid: string, targetUid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", myUid, "following", targetUid));
  return snap.exists();
}

// ── Contact matching ───────────────────────────────────────────────────────

export async function findUsersByPhones(phones: string[]): Promise<UserProfile[]> {
  const normalized = phones.map((p) => p.replace(/\D/g, "")).filter((p) => p.length >= 10);
  const results: UserProfile[] = [];
  for (const phone of normalized.slice(0, 30)) {
    const snap = await getDoc(doc(db, "phoneIndex", phone));
    if (snap.exists()) {
      const { uid } = snap.data() as { uid: string };
      const profile = await getProfile(uid);
      if (profile) results.push(profile);
    }
  }
  return results;
}

// ── Overlap detection ──────────────────────────────────────────────────────

function seasonsOverlap(a: Season[], b: Season[]): Season[] {
  return a.filter((s) => b.includes(s));
}

function monthsOverlap(a: TravelMonth[], b: TravelMonth[]): TravelMonth[] {
  return a.filter((m) => b.includes(m));
}

function destinationsOverlap(a: Destination[], b: Destination[]): Destination[] {
  return a.filter((d) => b.some((x) => x.id === d.id));
}

export async function checkAndCreateOverlaps(myProfile: UserProfile) {
  const followingSnap = await getDocs(collection(db, "users", myProfile.uid, "following"));
  const followingUids = followingSnap.docs.map((d) => d.id);

  for (const friendUid of followingUids) {
    const friendProfile = await getProfile(friendUid);
    if (!friendProfile) continue;

    const sharedDest = destinationsOverlap(myProfile.wishlist, friendProfile.wishlist);
    if (!sharedDest.length) continue;

    const overlapSeasons = seasonsOverlap(
      myProfile.availability.seasons,
      friendProfile.availability.seasons
    );
    const overlapMonths = monthsOverlap(
      myProfile.availability.months,
      friendProfile.availability.months
    );

    if (!overlapSeasons.length && !overlapMonths.length) continue;

    const notifId = `${myProfile.uid}_${friendUid}_${Date.now()}`;
    const notif: OverlapNotification = {
      id: notifId,
      type: "overlap",
      friendUids: [friendUid],
      friendNames: [friendProfile.displayName],
      sharedDestinations: sharedDest,
      overlapSeasons,
      overlapMonths,
      createdAt: Date.now(),
      read: false,
    };
    await setDoc(doc(db, "users", myProfile.uid, "notifications", notifId), notif);
  }
}

export function subscribeToNotifications(uid: string, cb: (n: OverlapNotification[]) => void) {
  return onSnapshot(
    collection(db, "users", uid, "notifications"),
    (snap) => {
      const items = snap.docs
        .map((d) => d.data() as OverlapNotification)
        .sort((a, b) => b.createdAt - a.createdAt);
      cb(items);
    }
  );
}

export async function markNotificationRead(uid: string, notifId: string) {
  await updateDoc(doc(db, "users", uid, "notifications", notifId), { read: true });
}

// ── Travel Plans ──────────────────────────────────────────────────────────

export async function updateTravelPlans(uid: string, travelPlans: import("@/types").TravelPlan[]) {
  await updateDoc(doc(db, "users", uid), { travelPlans });
}

// ── Feed ───────────────────────────────────────────────────────────────────

export async function getFollowingProfiles(uid: string): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, "users", uid, "following"));
  const uids = snap.docs.map((d) => d.id);
  const profiles: UserProfile[] = [];
  for (const id of uids) {
    const p = await getProfile(id);
    if (p) profiles.push(p);
  }
  return profiles;
}
