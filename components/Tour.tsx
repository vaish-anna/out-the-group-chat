"use client";
import { useEffect, useState, useCallback } from "react";

const STEPS = [
  {
    target: "[data-tour='timeline']",
    title: "Your travel timeline",
    body: "Add upcoming trips to see them on a visual timeline. Your crew can see when you're away.",
    position: "bottom" as const,
  },
  {
    target: "[data-tour='bucket-list']",
    title: "Bucket list",
    body: "Add destinations you want to visit. We'll match you with friends who want to go to the same places.",
    position: "bottom" as const,
  },
  {
    target: "[data-tour='availability']",
    title: "Your availability",
    body: "Tell us when you're free — by season or month. This is how we find overlaps with your friends.",
    position: "bottom" as const,
  },
  {
    target: "[data-tour='trips']",
    title: "Active trips",
    body: "Start a new trip or continue planning one. Invite your crew and vote on the details together.",
    position: "bottom" as const,
  },
  {
    target: "[data-tour='friends']",
    title: "Friends",
    body: "Follow friends to see their bucket lists and availability. When plans align, you'll get a notification.",
    position: "top" as const,
  },
];

type Rect = { top: number; left: number; width: number; height: number };

function useElementRect(selector: string, step: number) {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    function measure() {
      const el = document.querySelector(selector);
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }

    // Scroll element into view first, then measure after scroll settles
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Measure immediately and again after scroll animation
      measure();
      const t = setTimeout(measure, 400);
      return () => clearTimeout(t);
    }
    measure();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, step]);

  // Keep rect updated on scroll/resize
  useEffect(() => {
    function update() {
      const el = document.querySelector(selector);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [selector]);

  return rect;
}

function TooltipBox({
  step,
  index,
  total,
  onNext,
  onPrev,
  onSkip,
}: {
  step: (typeof STEPS)[0];
  index: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const rect = useElementRect(step.target, index);
  const TOOLTIP_W = 300;
  const GAP = 10;

  // All positions are viewport-relative (fixed positioning)
  let tooltipTop = 0;
  let tooltipLeft = 0;

  if (rect) {
    if (step.position === "bottom") {
      tooltipTop = rect.top + rect.height + GAP;
      tooltipLeft = rect.left + rect.width / 2 - TOOLTIP_W / 2;
    } else {
      tooltipTop = rect.top - 180 - GAP;
      tooltipLeft = rect.left + rect.width / 2 - TOOLTIP_W / 2;
    }
    // Clamp horizontally
    tooltipLeft = Math.max(12, Math.min(tooltipLeft, window.innerWidth - TOOLTIP_W - 12));
    // Clamp vertically — if it would go off bottom, flip to above
    if (tooltipTop + 180 > window.innerHeight - 12) {
      tooltipTop = rect.top - 180 - GAP;
    }
    if (tooltipTop < 12) tooltipTop = rect.top + rect.height + GAP;
  }

  const isLast = index === total - 1;

  if (!rect) return null;

  return (
    <>
      {/* Dark overlay with cutout around target */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 998,
          background: `rgba(0,0,0,0.5)`,
          // Use box-shadow to create spotlight cutout
          boxShadow: `0 0 0 9999px rgba(0,0,0,0.5)`,
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          borderRadius: 16,
          boxSizing: "content-box",
          // Reset the spread so only outside is dark
          outline: "9999px solid rgba(0,0,0,0.5)",
          outlineOffset: "0px",
        }}
      />
      {/* Invisible full-screen click-to-skip layer */}
      <div
        className="fixed inset-0 pointer-events-auto"
        style={{ zIndex: 997 }}
        onClick={onSkip}
      />

      {/* Tooltip */}
      <div
        className="fixed pointer-events-auto flex flex-col gap-3 rounded-2xl px-5 py-4"
        style={{
          zIndex: 999,
          top: tooltipTop,
          left: tooltipLeft,
          width: TOOLTIP_W,
          background: "var(--cream)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex gap-1">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: i === index ? 20 : 6,
                    background: i === index ? "var(--terracotta)" : "var(--border)",
                  }}
                />
              ))}
            </div>
            <button
              onClick={onSkip}
              className="text-xs font-semibold"
              style={{ color: "var(--warm-brown)", opacity: 0.45 }}
            >
              End tour
            </button>
          </div>
          <p className="font-black text-sm mt-2" style={{ color: "var(--chocolate)" }}>{step.title}</p>
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
    <TooltipBox
      step={STEPS[step]}
      index={step}
      total={STEPS.length}
      onNext={next}
      onPrev={prev}
      onSkip={onDone}
    />
  );
}
