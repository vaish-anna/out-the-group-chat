"use client";
import { useEffect, useState, useCallback } from "react";

export interface TourStep {
  target: string; // CSS selector
  title: string;
  body: string;
  position?: "top" | "bottom" | "left" | "right";
}

const STEPS: TourStep[] = [
  {
    target: "[data-tour='timeline']",
    title: "Your travel timeline",
    body: "Add upcoming trips here to see them on a visual timeline. Your crew can see when you're away.",
    position: "bottom",
  },
  {
    target: "[data-tour='bucket-list']",
    title: "Bucket list",
    body: "Add destinations you want to visit. We'll match you with friends who want to go to the same places.",
    position: "bottom",
  },
  {
    target: "[data-tour='availability']",
    title: "Your availability",
    body: "Tell us when you're free — by season or month. This is how we find overlaps with your friends.",
    position: "top",
  },
  {
    target: "[data-tour='trips']",
    title: "Active trips",
    body: "Start a new trip or continue planning one. Invite your crew and vote on the details together.",
    position: "top",
  },
  {
    target: "[data-tour='friends']",
    title: "Friends",
    body: "Follow friends to see their bucket lists and availability. When plans align, you'll get a notification.",
    position: "top",
  },
];

function getRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector);
  return el ? el.getBoundingClientRect() : null;
}

function TooltipBox({
  step,
  index,
  total,
  onNext,
  onPrev,
  onSkip,
}: {
  step: TourStep;
  index: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    function update() {
      setRect(getRect(step.target));
      setScrollY(window.scrollY);
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [step.target]);

  useEffect(() => {
    const el = document.querySelector(step.target);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [step.target]);

  const TOOLTIP_W = 280;
  const TOOLTIP_H = 160;
  const MARGIN = 12;

  let top = 0;
  let left = 0;

  if (rect) {
    const absTop = rect.top + scrollY;
    const pos = step.position ?? "bottom";

    if (pos === "bottom") {
      top = absTop + rect.height + MARGIN;
      left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
    } else if (pos === "top") {
      top = absTop - TOOLTIP_H - MARGIN;
      left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
    } else if (pos === "right") {
      top = absTop + rect.height / 2 - TOOLTIP_H / 2;
      left = rect.right + MARGIN;
    } else {
      top = absTop + rect.height / 2 - TOOLTIP_H / 2;
      left = rect.left - TOOLTIP_W - MARGIN;
    }

    // Clamp to viewport width
    left = Math.max(12, Math.min(left, window.innerWidth - TOOLTIP_W - 12));
  }

  const isLast = index === total - 1;

  return (
    <>
      {/* Spotlight overlay */}
      {rect && (
        <div
          className="fixed inset-0 z-40 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse ${rect.width + 32}px ${rect.height + 32}px at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, transparent 0%, rgba(0,0,0,0.55) 100%)`,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute z-50 rounded-2xl px-5 py-4 flex flex-col gap-3"
        style={{
          top,
          left,
          width: TOOLTIP_W,
          background: "var(--cream)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          border: "1px solid var(--border)",
        }}
      >
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--terracotta)" }}>
              {index + 1} / {total}
            </p>
            <button onClick={onSkip} className="text-xs font-semibold" style={{ color: "var(--warm-brown)", opacity: 0.5 }}>
              End tour
            </button>
          </div>
          <p className="font-black text-base" style={{ color: "var(--chocolate)" }}>{step.title}</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--warm-brown)" }}>{step.body}</p>
        </div>

        <div className="flex gap-2">
          {index > 0 && (
            <button
              onClick={onPrev}
              className="px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "var(--surface-2)", color: "var(--warm-brown)", border: "1px solid var(--border)" }}
            >
              Back
            </button>
          )}
          <button
            onClick={isLast ? onSkip : onNext}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ background: "var(--terracotta)", color: "white" }}
          >
            {isLast ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function Tour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  const next = useCallback(() => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else onDone();
  }, [step, onDone]);

  const prev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div className="pointer-events-auto absolute inset-0" style={{ zIndex: 40 }}>
        <TooltipBox
          step={STEPS[step]}
          index={step}
          total={STEPS.length}
          onNext={next}
          onPrev={prev}
          onSkip={onDone}
        />
      </div>
    </div>
  );
}
