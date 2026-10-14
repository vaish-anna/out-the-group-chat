"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  subscribeToProfile,
  subscribeToNotifications,
  getFollowingProfiles,
  markNotificationRead,
  updateProfile,
  updateTravelPlans,
  checkAndCreateOverlaps,
} from "@/lib/users";
import { subscribeToUserTrips, createTrip } from "@/lib/trips";
import { UserProfile, OverlapNotification, Destination, Season, TravelMonth, TravelPlan } from "@/types";
import Avatar from "@/components/Avatar";
import AppShell from "@/components/AppShell";
import TravelTimeline from "@/components/TravelTimeline";
import InlineBucketList from "@/components/InlineBucketList";
import InlineAvailability from "@/components/InlineAvailability";
import WelcomeModal from "@/components/WelcomeModal";
import Tour from "@/components/Tour";
import Link from "next/link";
import { Trip } from "@/types";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<OverlapNotification[]>([]);
  const [feed, setFeed] = useState<UserProfile[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    try {
      if (!localStorage.getItem("otgc_welcome_seen")) {
        setShowWelcome(true);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    function handleReplayTour() { setShowTour(true); }
    window.addEventListener("otgc:replay-tour", handleReplayTour);
    return () => window.removeEventListener("otgc:replay-tour", handleReplayTour);
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub  = subscribeToProfile(user.uid, setProfile);
    const unsubN = subscribeToNotifications(user.uid, setNotifications);
    const unsubT = subscribeToUserTrips(user.uid, setTrips);
    getFollowingProfiles(user.uid).then(setFeed);
    return () => { unsub(); unsubN(); unsubT(); };
  }, [user]);

  const unread = notifications.filter((n) => !n.read);

  function handleWelcomeDone() {
    try { localStorage.setItem("otgc_welcome_seen", "1"); } catch {}
    setShowWelcome(false);
    try {
      if (!localStorage.getItem("otgc_tour_seen")) setShowTour(true);
    } catch {}
  }

  function handleTourDone() {
    try { localStorage.setItem("otgc_tour_seen", "1"); } catch {}
    setShowTour(false);
  }

  function replayTour() {
    setShowTour(true);
  }

  async function handleNewTrip() {
    if (!user || !newTripName.trim()) return;
    const tripId = await createTrip(newTripName.trim(), user.uid, user.displayName ?? "You");
    setNewTripName("");
    setShowNewTripModal(false);
    router.push(`/trip/${tripId}`);
  }

  // Travel plans handlers
  async function handleAddPlan(plan: TravelPlan) {
    if (!profile || !user) return;
    const updated = [...(profile.travelPlans ?? []), plan];
    await updateTravelPlans(user.uid, updated);
  }

  async function handleRemovePlan(id: string) {
    if (!profile || !user) return;
    const updated = (profile.travelPlans ?? []).filter((p) => p.id !== id);
    await updateTravelPlans(user.uid, updated);
  }

  // Inline bucket list save
  async function handleSaveWishlist(updated: Destination[]) {
    if (!user) return;
    await updateProfile(user.uid, { wishlist: updated });
  }

  // Inline availability save
  async function handleSaveAvailability(seasons: Season[], months: TravelMonth[]) {
    if (!profile || !user) return;
    const updated: UserProfile = {
      ...profile,
      availability: { ...profile.availability, seasons, months },
    };
    await updateProfile(user.uid, { availability: updated.availability });
    await checkAndCreateOverlaps(updated);
    setEditingAvailability(false);
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--terracotta)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const hasAvailability = profile.availability.seasons.length > 0 || profile.availability.months.length > 0;

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--terracotta)" }}>
            Good to see you
          </p>
          <h1 className="text-3xl font-black" style={{ color: "var(--chocolate)" }}>
            {profile.displayName.split(" ")[0]}
          </h1>
        </div>
        {unread.length > 0 && (
          <Link href="/notifications" className="relative">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm" style={{ background: "var(--olive-dark)", color: "white" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {unread.length} new overlap{unread.length > 1 ? "s" : ""}
            </div>
          </Link>
        )}
      </div>

      {/* Travel Timeline (always visible) */}
      <div data-tour="timeline">
      <TravelTimeline
        plans={profile.travelPlans ?? []}
        onAdd={handleAddPlan}
        onRemove={handleRemovePlan}
      />
      </div>

      {/* Overlap alerts */}
      {unread.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--olive-dark)" }}>
            Overlap found
          </h2>
          <div className="flex flex-col gap-3">
            {unread.slice(0, 3).map((n) => (
              <div key={n.id} className="rounded-2xl px-5 py-5" style={{ background: "var(--olive-dark)" }}>
                <p className="font-bold text-base text-white">{n.friendNames.join(", ")}</p>
                <p className="text-sm mt-1 text-white opacity-75">
                  You both want to visit{" "}
                  {n.sharedDestinations.map((d) => d.name).join(", ")}
                  {n.overlapSeasons && n.overlapSeasons.length > 0
                    ? ` — both free in ${n.overlapSeasons.join(", ")}`
                    : ""}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => markNotificationRead(user!.uid, n.id)}
                    className="text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
                    style={{ background: "var(--terracotta)", color: "white" }}
                  >
                    Start planning
                  </button>
                  <button
                    onClick={() => markNotificationRead(user!.uid, n.id)}
                    className="text-sm font-semibold px-4 py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bucket list */}
      <section className="mb-8" data-tour="bucket-list">
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--olive-dark)" }}>
            Your bucket list
          </h2>
        </div>
        <InlineBucketList wishlist={profile.wishlist} onSave={handleSaveWishlist} />
      </section>

      {/* Availability */}
      <section className="mb-8" data-tour="availability">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--olive-dark)" }}>
            Your availability
          </h2>
          {hasAvailability && (
            <button
              onClick={() => setEditingAvailability(true)}
              className="text-xs font-semibold"
              style={{ color: "var(--terracotta)" }}
            >
              Edit
            </button>
          )}
        </div>

        {(!hasAvailability || editingAvailability) ? (
          <InlineAvailability onSave={handleSaveAvailability} />
        ) : (
          <div className="rounded-2xl px-5 py-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex flex-wrap gap-2">
              {profile.availability.seasons.map((s) => (
                <span key={s} className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize" style={{ background: "var(--powder)", color: "var(--slate)" }}>
                  {s}
                </span>
              ))}
              {profile.availability.months.map((m) => (
                <span key={m} className="text-xs font-semibold px-3 py-1.5 rounded-full uppercase" style={{ background: "var(--surface-2)", color: "var(--warm-brown)" }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Active trips */}
      <section className="mb-8" data-tour="trips">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--olive-dark)" }}>
            Continue planning
          </h2>
          <button
            onClick={() => setShowNewTripModal(true)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
            style={{ background: "var(--terracotta)", color: "white" }}
          >
            + New trip
          </button>
        </div>
        {trips.length === 0 ? (
          <button
            onClick={() => setShowNewTripModal(true)}
            className="w-full rounded-2xl px-5 py-5 text-sm font-medium text-center transition-all"
            style={{ background: "var(--surface-2)", color: "var(--warm-brown)", border: "2px dashed var(--border)" }}
          >
            Start planning a trip
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trip/${trip.id}/availability`}
                className="flex items-center justify-between rounded-2xl px-5 py-4 transition-all hover:opacity-90"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--chocolate)" }}>{trip.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>
                    {trip.participantUids.length} {trip.participantUids.length === 1 ? "person" : "people"}
                    {trip.destination ? ` · ${trip.destination.name}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                    style={{
                      background: trip.status === "decided" ? "var(--olive-light)" : "var(--powder)",
                      color: trip.status === "decided" ? "var(--olive-dark)" : "var(--slate)",
                    }}
                  >
                    {trip.status}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--border)" }}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Friends feed */}
      <section data-tour="friends">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--olive-dark)" }}>
            Friends
          </h2>
          <Link href="/friends" className="text-xs font-semibold" style={{ color: "var(--terracotta)" }}>
            Find more
          </Link>
        </div>
        {feed.length === 0 ? (
          <Link
            href="/friends"
            className="block rounded-2xl px-5 py-5 text-sm font-medium text-center"
            style={{ background: "var(--surface-2)", color: "var(--warm-brown)", border: "2px dashed var(--border)" }}
          >
            Find friends who are already here
          </Link>
        ) : (
          <div className="flex flex-col gap-3">
            {feed.map((friend) => (
              <Link
                key={friend.uid}
                href={`/profile/${friend.uid}`}
                className="flex items-start gap-4 rounded-2xl px-5 py-4 transition-all hover:opacity-90"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <Avatar name={friend.displayName} photoURL={friend.photoURL} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: "var(--chocolate)" }}>{friend.displayName}</p>
                  {friend.wishlist.length > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--warm-brown)", opacity: 0.7 }}>
                      Wants to visit: {friend.wishlist.slice(0, 4).map((d) => d.name).join(", ")}
                    </p>
                  )}
                  {(friend.availability.seasons.length > 0 || friend.availability.months.length > 0) && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {friend.availability.seasons.slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: "var(--powder)", color: "var(--slate)" }}>
                          {s}
                        </span>
                      ))}
                      {friend.availability.months.slice(0, 4).map((m) => (
                        <span key={m} className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase" style={{ background: "var(--surface-2)", color: "var(--warm-brown)" }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {showWelcome && <WelcomeModal onDone={handleWelcomeDone} />}
      {showTour && <Tour onDone={handleTourDone} />}

      {/* New trip modal */}
      {showNewTripModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowNewTripModal(false); setNewTripName(""); } }}
        >
          <div
            className="w-full rounded-2xl px-6 py-6 flex flex-col gap-4"
            style={{ maxWidth: "480px", background: "var(--cream)" }}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--olive-dark)" }}>New trip</p>
              <p className="text-xs" style={{ color: "var(--warm-brown)", opacity: 0.55 }}>What do you want to call this trip?</p>
            </div>
            <input
              type="text"
              placeholder="e.g. Tokyo spring break"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNewTrip()}
              autoFocus
              className="px-4 py-3 rounded-xl text-sm outline-none border-2 transition-colors"
              style={{
                background: "var(--surface-2)",
                borderColor: newTripName ? "var(--terracotta)" : "var(--border)",
                color: "var(--chocolate)",
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleNewTrip}
                disabled={!newTripName.trim()}
                className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-40 transition-all active:scale-95"
                style={{ background: "var(--terracotta)", color: "white" }}
              >
                Create trip
              </button>
              <button
                onClick={() => { setShowNewTripModal(false); setNewTripName(""); }}
                className="px-5 rounded-xl font-semibold text-sm"
                style={{ background: "var(--surface-2)", color: "var(--warm-brown)", border: "1px solid var(--border)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
