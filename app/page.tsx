"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createTrip } from "@/lib/trips";
import { useAuth } from "@/hooks/useAuth";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import Avatar from "@/components/Avatar";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tripName, setTripName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  async function handleCreate() {
    if (!user || !tripName.trim()) return;
    setCreating(true);
    const tripId = await createTrip(tripName.trim(), user.uid, user.displayName ?? "Organizer");
    router.push(`/trip/${tripId}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="text-center">
          <div className="text-5xl mb-3">✈️</div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Out the Group Chat
          </h1>
          <p className="mt-2 text-gray-500 text-sm leading-relaxed">
            Plan trips with your crew — dates, decisions, no drama.
          </p>
        </div>

        {!user ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <GoogleSignInButton />
            <p className="text-xs text-gray-400 text-center">
              Sign in to create or join a trip
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 w-full">
              <Avatar
                name={user.displayName ?? "You"}
                photoURL={user.photoURL ?? undefined}
                size={36}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {user.displayName}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => signOut(auth)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Sign out
              </button>
            </div>

            {!showCreate ? (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-2xl text-base shadow-md active:scale-95 transition-all"
              >
                + Create a trip
              </button>
            ) : (
              <div className="w-full flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Name your trip (e.g. Barcelona 🇪🇸)"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  autoFocus
                  className="w-full border-2 border-violet-200 focus:border-violet-500 outline-none rounded-2xl px-4 py-3 text-base font-medium bg-white placeholder-gray-300 transition-colors"
                />
                <button
                  onClick={handleCreate}
                  disabled={!tripName.trim() || creating}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-base shadow-md active:scale-95 transition-all"
                >
                  {creating ? "Creating…" : "Let's go →"}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-sm text-gray-400 hover:text-gray-600 text-center"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
