"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  subscribeToProfile,
  updateProfile,
  followUser,
  unfollowUser,
  isFollowing,
  subscribeToFollowing,
  subscribeToFollowers,
  checkAndCreateOverlaps,
} from "@/lib/users";
import { UserProfile, Season, TravelMonth, FollowRelation } from "@/types";
import { REGION_GRADIENT, DESTINATION_VIBE } from "@/data/destinations";
import Avatar from "@/components/Avatar";
import InlineBucketList from "@/components/InlineBucketList";
import InlineAvailability from "@/components/InlineAvailability";
import AppShell from "@/components/AppShell";
import Link from "next/link";

const SEASON_COLORS: Record<Season, string> = {
  spring: "#6B7A35",
  summer: "#C4541D",
  fall:   "#B87200",
  winter: "#2E5FA8",
};

export default function ProfilePage() {
  const { uid: paramUid } = useParams<{ uid: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const isMe = paramUid === "me" || paramUid === user?.uid;
  const targetUid = isMe ? user?.uid : paramUid;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [following, setFollowing] = useState(false);
  const [followingList, setFollowingList] = useState<FollowRelation[]>([]);
  const [followersList, setFollowersList] = useState<FollowRelation[]>([]);
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bucket" | "availability">("bucket");
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!targetUid) return;
    const unsub = subscribeToProfile(targetUid, setProfile);
    if (!isMe && user) {
      subscribeToProfile(user.uid, setMyProfile);
      isFollowing(user.uid, targetUid).then(setFollowing);
    }
    if (isMe && user) {
      subscribeToFollowing(user.uid, setFollowingList);
      subscribeToFollowers(user.uid, setFollowersList);
    }
    return unsub;
  }, [targetUid, isMe, user]);

  async function handleSaveWishlist(updated: NonNullable<typeof profile>["wishlist"]) {
    if (!targetUid) return;
    await updateProfile(targetUid, { wishlist: updated });
  }

  async function handleSaveAvailability(seasons: Season[], months: TravelMonth[]) {
    if (!targetUid || !profile) return;
    const updated: UserProfile = {
      ...profile,
      availability: { ...profile.availability, seasons, months },
    };
    await updateProfile(targetUid, { availability: updated.availability });
    await checkAndCreateOverlaps(updated);
    setEditingAvailability(false);
  }

  async function handleSaveBio() {
    if (!targetUid) return;
    setSavingProfile(true);
    await updateProfile(targetUid, { bio: bioInput.trim() });
    setSavingProfile(false);
    setEditingProfile(false);
  }

  function startEditingProfile() {
    setBioInput(profile?.bio ?? "");
    setEditingProfile(true);
  }

  async function handleFollow() {
    if (!user || !profile || !myProfile) return;
    if (following) {
      await unfollowUser(user.uid, profile.uid);
      setFollowing(false);
    } else {
      await followUser(user.uid, myProfile, profile.uid, profile);
      setFollowing(true);
    }
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--terracotta)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  // Past trips (travelPlans with end date in the past) become "stories"
  const today = new Date().toISOString().slice(0, 10);
  const pastTrips = (profile.travelPlans ?? []).filter((p) => p.endDate < today);
  const selectedStory = activeStory ? pastTrips.find((p) => p.id === activeStory) : null;

  const hasAvailability =
    profile.availability.seasons.length > 0 || profile.availability.months.length > 0;

  return (
    <AppShell>
      {/* Instagram-style profile header */}
      <div className="mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div
              className="rounded-full p-0.5"
              style={{
                background: profile.wishlist.length > 0
                  ? "linear-gradient(135deg, var(--terracotta), var(--olive-dark))"
                  : "var(--border)",
              }}
            >
              <div style={{ background: "var(--cream)", borderRadius: "9999px", padding: "2px" }}>
                <Avatar name={profile.displayName} photoURL={profile.photoURL} size={80} />
              </div>
            </div>
          </div>

          {/* Name + stats */}
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-xl font-black" style={{ color: "var(--chocolate)" }}>
                {profile.displayName}
              </h1>
              {!isMe && (
                <button
                  onClick={handleFollow}
                  className="font-bold px-4 py-1.5 rounded-lg text-sm transition-all active:scale-95"
                  style={{
                    background: following ? "var(--surface-2)" : "var(--terracotta)",
                    color: following ? "var(--warm-brown)" : "white",
                    border: following ? "1px solid var(--border)" : "none",
                  }}
                >
                  {following ? "Following" : "Follow"}
                </button>
              )}
              {isMe && (
                <button
                  onClick={editingProfile ? () => setEditingProfile(false) : startEditingProfile}
                  className="font-semibold px-4 py-1.5 rounded-lg text-sm"
                  style={{ background: "var(--surface-2)", color: "var(--warm-brown)", border: "1px solid var(--border)" }}
                >
                  {editingProfile ? "Cancel" : "Edit profile"}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-base font-black" style={{ color: "var(--chocolate)" }}>{profile.wishlist.length}</p>
                <p className="text-xs" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>places</p>
              </div>
              <div className="text-center">
                <p className="text-base font-black" style={{ color: "var(--chocolate)" }}>{pastTrips.length}</p>
                <p className="text-xs" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>trips</p>
              </div>
              {isMe && (
                <>
                  <div className="text-center">
                    <p className="text-base font-black" style={{ color: "var(--chocolate)" }}>{followingList.length}</p>
                    <p className="text-xs" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>following</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-black" style={{ color: "var(--chocolate)" }}>{followersList.length}</p>
                    <p className="text-xs" style={{ color: "var(--warm-brown)", opacity: 0.6 }}>followers</p>
                  </div>
                </>
              )}
            </div>

            {editingProfile ? (
              <div className="mt-3 flex flex-col gap-2">
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Write a short bio..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none border-2 resize-none transition-colors"
                  style={{
                    background: "var(--surface-2)",
                    borderColor: bioInput ? "var(--terracotta)" : "var(--border)",
                    color: "var(--chocolate)",
                  }}
                />
                <button
                  onClick={handleSaveBio}
                  disabled={savingProfile}
                  className="self-start text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50 transition-all active:scale-95"
                  style={{ background: "var(--terracotta)", color: "white" }}
                >
                  {savingProfile ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <p className="text-sm mt-3" style={{ color: profile.bio ? "var(--warm-brown)" : "var(--warm-brown)", opacity: profile.bio ? 1 : 0.4 }}>
                {profile.bio || (isMe ? "Add a bio..." : "")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stories — past trips */}
      {pastTrips.length > 0 && (
        <div className="mb-6">
          <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {pastTrips.map((trip) => {
              const isActive = activeStory === trip.id;
              return (
                <button
                  key={trip.id}
                  onClick={() => setActiveStory(isActive ? null : trip.id)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0"
                >
                  <div
                    className="rounded-full flex items-center justify-center font-black text-white text-sm"
                    style={{
                      width: "60px",
                      height: "60px",
                      background: isActive
                        ? "var(--terracotta)"
                        : "linear-gradient(135deg, var(--olive-dark), var(--slate))",
                      border: isActive ? "3px solid var(--terracotta)" : "3px solid transparent",
                      outline: isActive ? "3px solid var(--cream)" : "none",
                      outlineOffset: "2px",
                    }}
                  >
                    {trip.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-semibold max-w-[60px] truncate" style={{ color: "var(--warm-brown)" }}>
                    {trip.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Story detail panel */}
          {selectedStory && (
            <div
              className="mt-3 rounded-2xl px-5 py-4"
              style={{ background: "var(--olive-dark)", border: "1px solid var(--border)" }}
            >
              <p className="font-black text-white text-lg">{selectedStory.name}</p>
              <p className="text-sm text-white mt-1" style={{ opacity: 0.65 }}>
                {selectedStory.startDate} — {selectedStory.endDate}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)", marginBottom: "20px" }} />

      {/* Tabs */}
      <div className="flex gap-0 mb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => setActiveTab("bucket")}
          className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all"
          style={{
            color: activeTab === "bucket" ? "var(--chocolate)" : "var(--warm-brown)",
            borderBottom: activeTab === "bucket" ? "2px solid var(--chocolate)" : "2px solid transparent",
            marginBottom: "-1px",
          }}
        >
          Bucket list
        </button>
        <button
          onClick={() => setActiveTab("availability")}
          className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all"
          style={{
            color: activeTab === "availability" ? "var(--chocolate)" : "var(--warm-brown)",
            borderBottom: activeTab === "availability" ? "2px solid var(--chocolate)" : "2px solid transparent",
            marginBottom: "-1px",
          }}
        >
          Availability
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "bucket" && (
        <div>
          {isMe ? (
            <InlineBucketList wishlist={profile.wishlist} onSave={handleSaveWishlist} />
          ) : profile.wishlist.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: "var(--warm-brown)", opacity: 0.4 }}>
              No destinations yet
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {profile.wishlist.map((d) => {
                const gradient = REGION_GRADIENT[d.region] ?? REGION_GRADIENT["Europe"];
                const vibe = DESTINATION_VIBE[d.id];
                return (
                  <div key={d.id} className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                    <div className="flex flex-col justify-end px-4 pt-4 pb-3" style={{ background: gradient, minHeight: "70px" }}>
                      <p className="font-black text-white text-base leading-tight" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>{d.name}</p>
                      <p className="text-xs font-semibold text-white mt-0.5" style={{ opacity: 0.75 }}>{d.country}</p>
                    </div>
                    <div className="px-4 py-3" style={{ background: "var(--surface)" }}>
                      <div className="flex items-center justify-between">
                        {vibe && <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--terracotta)" }}>{vibe}</span>}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto" style={{ background: "var(--surface-2)", color: "var(--warm-brown)" }}>{d.region}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "availability" && (
        <div>
          {isMe && (
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setEditingAvailability(!editingAvailability)}
                className="text-xs font-semibold"
                style={{ color: "var(--terracotta)" }}
              >
                {editingAvailability ? "Cancel" : "Edit"}
              </button>
            </div>
          )}

          {(isMe && (!hasAvailability || editingAvailability)) ? (
            <InlineAvailability onSave={handleSaveAvailability} />
          ) : !hasAvailability ? (
            <p className="text-sm text-center py-10" style={{ color: "var(--warm-brown)", opacity: 0.4 }}>
              No availability set yet
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {profile.availability.seasons.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>Seasons</p>
                  <div className="grid grid-cols-2 gap-2">
                    {profile.availability.seasons.map((s) => (
                      <div
                        key={s}
                        className="rounded-xl px-4 py-3 font-bold text-sm capitalize"
                        style={{
                          background: SEASON_COLORS[s] + "22",
                          color: SEASON_COLORS[s],
                          border: `1px solid ${SEASON_COLORS[s]}44`,
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {profile.availability.months.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>Months</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.availability.months.map((m) => (
                      <span
                        key={m}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full uppercase"
                        style={{ background: "var(--powder)", color: "var(--slate)" }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
