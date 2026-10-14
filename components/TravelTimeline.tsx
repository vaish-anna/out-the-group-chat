"use client";
import { useState } from "react";
import { TravelPlan } from "@/types";
import { nanoid } from "nanoid";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const BAR_COLORS = [
  "#C4541D", "#4A5C28", "#6B8FA8", "#7A1A2A", "#7A3E1A", "#6B7A35",
];

function toDate(s: string) {
  return new Date(s + "T00:00:00");
}

interface Props {
  plans: TravelPlan[];
  onAdd: (plan: TravelPlan) => void;
  onRemove: (id: string) => void;
}

export default function TravelTimeline({ plans, onAdd, onRemove }: Props) {
  const today = new Date();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Show from start of current month, 9 months out
  const rangeStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const rangeEnd   = new Date(today.getFullYear(), today.getMonth() + 9, 0);
  const totalMs    = rangeEnd.getTime() - rangeStart.getTime();

  function pct(date: Date) {
    const clamped = Math.max(rangeStart.getTime(), Math.min(rangeEnd.getTime(), date.getTime()));
    return ((clamped - rangeStart.getTime()) / totalMs) * 100;
  }

  // Build month header columns
  const months: { label: string; left: number; width: number }[] = [];
  let cur = new Date(rangeStart);
  while (cur <= rangeEnd) {
    const mStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
    const mEnd   = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    const left   = pct(mStart);
    const right  = pct(new Date(Math.min(mEnd.getTime(), rangeEnd.getTime())));
    months.push({
      label: MONTH_LABELS[cur.getMonth()] + (cur.getMonth() === 0 ? " " + cur.getFullYear() : ""),
      left,
      width: right - left,
    });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }

  const todayPct = pct(today);

  function handleAdd() {
    if (!name.trim() || !startDate || !endDate) return;
    onAdd({ id: nanoid(6), name: name.trim(), startDate, endDate });
    setName(""); setStartDate(""); setEndDate(""); setShowForm(false);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden mb-8"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--olive-dark)" }}>
          Travel Timeline
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: showForm ? "var(--surface-2)" : "var(--terracotta)", color: showForm ? "var(--chocolate)" : "white" }}
        >
          {showForm ? "Cancel" : "+ Add trip"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div
          className="px-5 py-4 flex items-end gap-3"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}
        >
          <div className="flex-1">
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--warm-brown)" }}>Trip name</label>
            <input
              type="text"
              placeholder="e.g. Portugal"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 rounded-xl text-sm outline-none border-2 transition-colors"
              style={{ background: "white", borderColor: name ? "var(--terracotta)" : "var(--border)", color: "var(--chocolate)" }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--warm-brown)" }}>Start</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none border-2 transition-colors"
              style={{ background: "white", borderColor: startDate ? "var(--terracotta)" : "var(--border)", color: "var(--chocolate)" }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--warm-brown)" }}>End</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none border-2 transition-colors"
              style={{ background: "white", borderColor: endDate ? "var(--terracotta)" : "var(--border)", color: "var(--chocolate)" }}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!name.trim() || !startDate || !endDate}
            className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: "var(--terracotta)", color: "white" }}
          >
            Add
          </button>
        </div>
      )}

      {/* Timeline grid */}
      <div className="px-5 pt-3 pb-4">
        {/* Month headers */}
        <div className="relative h-6 mb-2" style={{ marginLeft: "160px" }}>
          {months.map((m, i) => (
            <div
              key={i}
              className="absolute text-xs font-semibold"
              style={{
                left: `${m.left}%`,
                width: `${m.width}%`,
                color: "var(--warm-brown)",
                opacity: 0.55,
                fontSize: "10px",
                letterSpacing: "0.05em",
                paddingLeft: "4px",
                whiteSpace: "nowrap",
              }}
            >
              {m.label}
            </div>
          ))}
        </div>

        {/* Month dividers + today line background layer */}
        <div className="relative" style={{ marginLeft: "160px", height: `${Math.max(plans.length, 1) * 36 + 8}px` }}>
          {/* Month gridlines */}
          {months.map((m, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0"
              style={{ left: `${m.left}%`, width: "1px", background: "var(--border)", opacity: 0.6 }}
            />
          ))}
          {/* Today line */}
          <div
            className="absolute top-0 bottom-0 z-10"
            style={{ left: `${todayPct}%`, width: "2px", background: "var(--terracotta)", borderRadius: "2px" }}
          />
        </div>

        {/* Rows */}
        {plans.length === 0 ? (
          <div
            className="text-xs text-center py-4"
            style={{ color: "var(--warm-brown)", opacity: 0.45, marginLeft: "160px" }}
          >
            Add your upcoming trips to see them here
          </div>
        ) : (
          <div className="relative" style={{ marginTop: "-" + `${Math.max(plans.length, 1) * 36 + 8}px` }}>
            {plans.map((plan, i) => {
              const s = toDate(plan.startDate);
              const e = toDate(plan.endDate);
              if (e < rangeStart || s > rangeEnd) return null;
              const left  = pct(s);
              const right = pct(e);
              const color = BAR_COLORS[i % BAR_COLORS.length];

              return (
                <div key={plan.id} className="flex items-center" style={{ height: "36px" }}>
                  {/* Label */}
                  <div
                    className="flex items-center gap-2 shrink-0"
                    style={{ width: "160px", paddingRight: "16px" }}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                    <span
                      className="text-xs font-semibold truncate"
                      style={{ color: "var(--chocolate)" }}
                    >
                      {plan.name}
                    </span>
                  </div>
                  {/* Bar area */}
                  <div className="flex-1 relative" style={{ height: "36px" }}>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 rounded-full flex items-center px-2 group cursor-pointer"
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(right - left, 1.5)}%`,
                        height: "22px",
                        background: color,
                        opacity: 0.88,
                        minWidth: "6px",
                      }}
                      title={`${plan.startDate} → ${plan.endDate}`}
                    >
                      <span className="text-white text-[9px] font-bold truncate">
                        {right - left > 6 ? plan.name : ""}
                      </span>
                      <button
                        onClick={() => onRemove(plan.id)}
                        className="ml-auto text-white opacity-0 group-hover:opacity-70 text-xs leading-none"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
