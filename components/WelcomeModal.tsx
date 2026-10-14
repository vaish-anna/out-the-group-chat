"use client";
import { useState } from "react";

const SLIDES = [
  {
    title: "Out the group chat.",
    body: "Turn \"we should really go somewhere\" into an actual trip — without the 47-message thread.",
    detail: "Your crew's travel plans, all in one place.",
  },
  {
    title: "Find the overlap.",
    body: "Add your dream destinations and set when you're free. We'll find where your plans match your friends'.",
    detail: "No more asking 12 people when they're available.",
  },
  {
    title: "Plan together, for real.",
    body: "Vote on where to stay, when to go, what to do. Everyone's in the same room — even if they're not.",
    detail: "Decisions get made. Trips get booked.",
  },
];

export default function WelcomeModal({ onDone }: { onDone: () => void }) {
  const [slide, setSlide] = useState(0);
  const isLast = slide === SLIDES.length - 1;
  const current = SLIDES[slide];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full flex flex-col"
        style={{ maxWidth: "420px", background: "var(--cream)", borderRadius: "24px", overflow: "hidden" }}
      >
        {/* Progress bar */}
        <div className="flex gap-1.5 px-6 pt-6">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ background: i <= slide ? "var(--terracotta)" : "var(--border)" }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pt-8 pb-6 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--terracotta)" }}>
            {slide + 1} of {SLIDES.length}
          </p>
          <h2 className="text-2xl font-black leading-tight" style={{ color: "var(--chocolate)" }}>
            {current.title}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--warm-brown)" }}>
            {current.body}
          </p>
          <p className="text-xs font-semibold mt-1" style={{ color: "var(--olive-dark)" }}>
            {current.detail}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={isLast ? onDone : () => setSlide((s) => s + 1)}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={{ background: "var(--terracotta)", color: "white" }}
          >
            {isLast ? "Get started" : "Next"}
          </button>
          {!isLast && (
            <button
              onClick={onDone}
              className="px-5 rounded-2xl text-sm font-semibold"
              style={{ background: "var(--surface-2)", color: "var(--warm-brown)", border: "1px solid var(--border)" }}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
