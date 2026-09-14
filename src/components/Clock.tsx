"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  buildCalendarGrid,
  DAYS,
  monthName,
  today
} from "@/lib/calendar"

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Date | null>(null)
  const [viewMonth, setViewMonth] = useState<Date>(() => today())
  const [panelTop, setPanelTop] = useState(0)
  const [yearStr, setYearStr] = useState<string>(() => String(today().getFullYear()))
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const pad = (n: number) => String(n).padStart(2, "0")
  const hours = now ? pad(now.getHours()) : "--"
  const minutes = now ? pad(now.getMinutes()) : "--"
  const seconds = now ? pad(now.getSeconds()) : "--"

  const dateLabel = now
    ? `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`
    : "00-00-0000"

  const openCalendar = useCallback(() => {
    const rect = toggleRef.current?.getBoundingClientRect()
    setPanelTop((rect?.bottom ?? 112) + 8)
    setOpen(true)
  }, [])

  const closeCalendar = useCallback(() => setOpen(false), [])

  const navMonth = useCallback(
    (delta: number) => {
      const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1)
      setViewMonth(next)
      setYearStr(String(next.getFullYear()))
    },
    [viewMonth]
  )

  const navYear = useCallback(
    (delta: number) => {
      const next = new Date(viewMonth.getFullYear() + delta, viewMonth.getMonth(), 1)
      setViewMonth(next)
      setYearStr(String(next.getFullYear()))
    },
    [viewMonth]
  )

  const jumpToYear = useCallback(
    (raw: string) => {
      const y = parseInt(raw, 10)
      if (!Number.isFinite(y) || y < 1 || y > 9999) return
      const next = new Date(y, viewMonth.getMonth(), 1)
      setViewMonth(next)
      setYearStr(String(y))
    },
    [viewMonth]
  )

  const yearOnKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      jumpToYear(e.currentTarget.value)
      e.currentTarget.blur()
    }
  }

  const cells = (
    typeof window === "undefined"
      ? []
      : buildCalendarGrid(
          viewMonth.getFullYear(),
          viewMonth.getMonth(),
          selected ?? today()
        )
  ) as ReturnType<typeof buildCalendarGrid>

  const weekendDay = (d: Date) => d.getDay() === 0 || d.getDay() === 6

  return (
    <>
      <button
        ref={toggleRef}
        onClick={() => (open ? closeCalendar() : openCalendar())}
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
          <span
            className={`mono font-semibold tracking-wide ${
              open ? "text-sky-300" : "text-slate-300"
            } transition group-hover:text-sky-300`}
          >
            {dateLabel}
          </span>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-3 backdrop-blur-sm animate-fade-in"
          onClick={closeCalendar}
          role="dialog"
          aria-modal="true"
          aria-label="Calendar"
        >
          <div
            className="card w-full max-w-xl p-5 animate-pop-in relative overflow-y-auto"
            style={{ maxHeight: `calc(100dvh - ${panelTop + 12}px)`, marginTop: panelTop }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeCalendar}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700/50 hover:text-slate-200"
              aria-label="Close calendar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pr-8">
              <h2 className="card-title text-xl">
                {monthName(viewMonth.getMonth())} {viewMonth.getFullYear()}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navYear(-1)}
                  className="rounded-lg bg-slate-700/40 p-2 text-slate-300 transition hover:bg-slate-700/80"
                  aria-label="Previous year"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12H3M8 7l-5 5 5 5" />
                  </svg>
                </button>
                <button
                  onClick={() => navMonth(-1)}
                  className="rounded-lg bg-slate-700/40 p-2 text-slate-300 transition hover:bg-slate-700/80"
                  aria-label="Previous month"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <input
                  type="number"
                  value={yearStr}
                  min={1}
                  max={9999}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => setYearStr(e.target.value)}
                  onBlur={(e) => jumpToYear(e.target.value)}
                  onKeyDown={yearOnKey}
                  className="w-24 rounded-lg border border-slate-600/60 bg-slate-900/70 px-2 py-1.5 text-center text-sm font-semibold text-slate-100 focus:border-sky-400"
                  aria-label="Jump to year"
                  title="Jump to year"
                />
                <button
                  onClick={() => navMonth(1)}
                  className="rounded-lg bg-slate-700/40 p-2 text-slate-300 transition hover:bg-slate-700/80"
                  aria-label="Next month"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
                <button
                  onClick={() => navYear(1)}
                  className="rounded-lg bg-slate-700/40 p-2 text-slate-300 transition hover:bg-slate-700/80"
                  aria-label="Next year"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 12h18M16 7l5 5-5 5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center">
              {DAYS.map((d, i) => (
                <div
                  key={d}
                  className={`pb-1 text-[11px] font-semibold uppercase tracking-wide ${
                    i === 0 || i === 6 ? "text-violet-400" : "text-slate-500"
                  }`}
                >
                  {d}
                </div>
              ))}
              {cells.map((cell, i) => {
                const isWeekend = weekendDay(cell.date)
                const baseColor = cell.isCurrentMonth
                  ? isWeekend
                    ? "text-violet-300"
                    : "text-slate-100"
                  : isWeekend
                    ? "text-violet-600/60"
                    : "text-slate-600"
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(cell.date)}
                    className={[
                      "flex h-10 items-center justify-center rounded-lg text-sm transition",
                      baseColor,
                      isWeekend && cell.isCurrentMonth && !cell.isSelected
                        ? "bg-violet-400/10 hover:bg-violet-400/25"
                        : "hover:bg-slate-700/40",
                      cell.isToday && !cell.isSelected
                        ? "ring-1 ring-sky-400/70 bg-sky-400/15 font-bold text-sky-300"
                        : "",
                      cell.isSelected
                        ? "bg-sky-500 text-slate-950 font-bold shadow-lg shadow-sky-500/40 ring-1 ring-sky-300/50"
                        : ""
                    ].join(" ")}
                  >
                    {cell.day}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/40 pt-3 text-sm">
              <span className="mono text-slate-300">
                {selected
                  ? `${pad(selected.getDate())}-${pad(selected.getMonth() + 1)}-${selected.getFullYear()}`
                  : "Select a date"}
              </span>
              <button
                onClick={() => {
                  setSelected(today())
                  setViewMonth(today())
                  setYearStr(String(today().getFullYear()))
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