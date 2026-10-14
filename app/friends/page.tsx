"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  subscribeToProfile,
  subscribeToFollowing,
  subscribeToFollowers,
  unfollowUser,
} from "@/lib/users";
import { UserProfile, FollowRelation } from "@/types";
import Avatar from "@/components/Avatar";
import AppShell from "@/components/AppShell";
import Link from "next/link";

export default function FriendsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [following, setFollowing] = useState<FollowRelation[]>([]);
  const [followers, setFollowers] = useState<FollowRelation[]>([]);
  const [tab, setTab] = useState<"following" | "followers">("following");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const u1 = subscribeToProfile(user.uid, setProfile);
    const u2 = subscribeToFollowing(user.uid, setFollowing);
    const u3 = subscribeToFollowers(user.uid, setFollowers);
    return () => { u1(); u2(); u3(); };
  }, [user]);

  async function handleUnfollow(targetUid: string) {
    if (!user) return;
    await unfollowUser(user.uid, targetUid);
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--terracotta)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const list = tab === "following" ? following : followers;

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-black" style={{ color: "var(--chocolate)" }}>Friends</h1>
        <p className="text-sm mt-1" style={{ color: "var(--warm-brown)", opacity: 0.7 }}>
          See who you're connected with and find new travel companions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "var(--surface-2)" }}>
        {(["following", "followers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all"
            style={{
              background: tab === t ? "white" : "transparent",
              color: tab === t ? "var(--chocolate)" : "var(--warm-brown)",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {t} <span style={{ opacity: 0.5 }}>({(t === "following" ? following : followers).length})</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="py-16 text-center" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>
          <p className="text-sm font-medium">
            {tab === "following" ? "You're not following anyone yet." : "No followers yet."}
          </p>
          <p className="text-xs mt-1">Share your profile link to connect with other travelers.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((rel) => (
            <div
              key={rel.uid}
              className="flex items-center gap-4 rounded-2xl px-5 py-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <Link href={`/profile/${rel.uid}`}>
                <Avatar name={rel.displayName} photoURL={rel.photoURL} size={44} />
              </Link>
              <Link href={`/profile/${rel.uid}`} className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: "var(--chocolate)" }}>
                  {rel.displayName}
                </p>
              </Link>
              {tab === "following" && (
                <button
                  onClick={() => handleUnfollow(rel.uid)}
                  className="text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-80"
                  style={{ background: "var(--surface-2)", color: "var(--warm-brown)" }}
                >
                  Unfollow
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
