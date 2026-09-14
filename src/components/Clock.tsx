"use client"

import { useEffect, useState, useCallback } from "react"
import {
  buildCalendarGrid,
  DAYS,
  monthName,
  today,
} from "@/lib/calendar"

export default function Clock() {
  const [now, setNow] = useState<Date>(() => new Date())
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Date | null>(null)
  const [viewMonth, setViewMonth] = useState<Date>(() => today())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => String(n).padStart(2, "0")
  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())
  const seconds = pad(now.getSeconds())

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  })

  const prevMonth = useCallback(() => {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  }, [])

  const nextMonth = useCallback(() => {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
  }, [])

  const cells =
    typeof window === "undefined"
      ? []
      : buildCalendarGrid(
          viewMonth.getFullYear(),
          viewMonth.getMonth(),
          selected ?? today()
        )

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center gap-4 sm:gap-6"
        aria-label="Open calendar"
      >
        <div className="flex flex-col items-start leading-none">
          <div className="mono text-4xl font-bold tracking-tight text-sky-300 sm:text-5xl">
            {hours}
            <span className="mx-0.5 animate-pulse text-sky-500/70">:</span>
            {minutes}
            <span className="mx-0.5 animate-pulse text-sky-500/70">:</span>
            {seconds}
          </div>
        </div>
        <div className="flex flex-col items-start text-sm text-slate-400">
          <span className={`font-medium ${open ? "text-sky-300" : "text-slate-300"} transition group-hover:text-sky-300`}>
            {dateLabel}
          </span>
          <span className="text-xs text-slate-500">
            {now.toLocaleDateString("en-GB", { timeZoneName: "short" }).split(", ").at(-1)}{" "}
            · Tap to open calendar
          </span>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm animate-fade-in sm:items-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="card w-full max-w-md p-5 animate-pop-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700/50 hover:text-slate-200"
              aria-label="Close calendar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-lg">
                {monthName(viewMonth.getMonth())} {viewMonth.getFullYear()}
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={prevMonth}
                  className="rounded-lg bg-slate-700/40 p-2 text-slate-300 transition hover:bg-slate-700/80"
                  aria-label="Previous month"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={nextMonth}
                  className="rounded-lg bg-slate-700/40 p-2 text-slate-300 transition hover:bg-slate-700/80"
                  aria-label="Next month"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {DAYS.map((d) => (
                <div key={d} className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {d}
                </div>
              ))}
              {cells.map((cell, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(cell.date)}
                  className={[
                    "flex h-9 items-center justify-center rounded-lg text-sm transition",
                    cell.isCurrentMonth ? "text-slate-200" : "text-slate-600",
                    cell.isToday && !cell.isSelected
                      ? "ring-1 ring-sky-400/60 bg-sky-400/10 font-semibold text-sky-300"
                      : "hover:bg-slate-700/40",
                    cell.isSelected
                      ? "bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/30"
                      : ""
                  ].join(" ")}
                >
                  {cell.day}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-700/40 pt-3 text-sm">
              <span className="text-slate-400">
                {selected
                  ? selected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
                  : "Select a date"}
              </span>
              <button
                onClick={() => {
                  setSelected(today())
                  setViewMonth(today())
                }}
                className="rounded-lg bg-slate-700/40 px-3 py-1.5 text-xs font-medium text-sky-300 transition hover:bg-slate-700/80"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}