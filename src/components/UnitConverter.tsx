"use client"

import { useMemo, useState } from "react"
import { UNIT, convert } from "@/lib/units"

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—"
  const abs = Math.abs(n)
  if (abs >= 1e15 || (abs < 1e-9 && abs !== 0)) return n.toExponential(4)
  return n.toLocaleString("en-IN", {
    maximumFractionDigits: 6
  })
}

export default function UnitConverter() {
  const [value, setValue] = useState("1")
  const [fromId, setFromId] = useState("decimal")
  const [toId, setToId] = useState("sqft")

  const valueNum = useMemo(() => {
    const n = parseFloat(value)
    return Number.isFinite(n) ? n : 0
  }, [value])

  const result = useMemo(() => {
    try {
      return convert(valueNum, fromId, toId)
    } catch {
      return null
    }
  }, [valueNum, fromId, toId])

  const allUnits = useMemo(() => {
    try {
      return UNIT.map((u) => ({ unit: u, value: convert(valueNum, fromId, u.id) }))
    } catch {
      return []
    }
  }, [valueNum, fromId])

  const fromUnit = UNIT.find((u) => u.id === fromId)
  const toUnit = UNIT.find((u) => u.id === toId)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="card p-5">
        <h3 className="card-title mb-1 text-base">Unit &amp; Land Area Converter</h3>
        <p className="mb-4 text-xs text-slate-500">
          Regional land units included: 1 Decimal = 436 sq ft, 1 Bigha = 27225 sq ft.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-400">From value</span>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2.5 text-lg text-slate-100 focus:border-sky-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-400">From unit</span>
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 focus:border-sky-500"
            >
              {UNIT.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
          <div className="mono shrink-0 text-2xl font-bold text-emerald-300">{fmt(valueNum)}</div>
          <button
            onClick={() => {
              setFromId((f) => {
                setToId(f)
                return toId
              })
            }}
            className="rounded-lg bg-slate-700/50 px-3 py-2 text-slate-300 transition hover:bg-slate-600/50"
            aria-label="Swap units"
          >
            ⇄
          </button>
          <div className="text-sm text-slate-500">{fromUnit?.label.split(" (")[0]}</div>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-medium text-slate-400">To unit</span>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="w-full rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 focus:border-sky-500"
          >
            {UNIT.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-center">
          <div className="text-xs uppercase tracking-wide text-emerald-300/80">Result</div>
          <div className="mono mt-1 flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold text-emerald-300">
              {result !== null ? fmt(result) : "Value"}
            </span>
            <span className="text-sm text-slate-400">{toUnit?.label.split(" (")[0]}</span>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="card-title mb-3 text-base">
          {fmt(valueNum)} {fromUnit?.label.split(" (")[0]} in all units
        </h3>
        <div className="overflow-hidden rounded-lg border border-slate-700/40">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {allUnits.map(({ unit, value: v }) => (
                <tr
                  key={unit.id}
                  className={`border-t border-slate-700/30 ${
                    unit.id === toId ? "bg-sky-500/10" : ""
                  }`}
                >
                  <td className="px-3 py-2 text-slate-300">{unit.label}</td>
                  <td className="mono px-3 py-2 text-right font-semibold text-sky-300">{fmt(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Reference: 1 Decimal = 436 sq ft · 1 Acre = 43,560 sq ft · 1 Hectare = 107,639 sq ft · 1 Bigha = 27,225 sq ft
        </div>
      </div>

      <div className="card p-5">
        <h3 className="card-title mb-3 text-base">Quick lookups</h3>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          {[
            ["Decimal → sq ft", "1 Decimal = 436 sq ft"],
            ["Acre → sq ft", "1 Acre = 43,560 sq ft"],
            ["Hectare → Acre", "1 Ha = 2.471 Acres"],
            ["Bigha → sq ft", "1 Bigha = 27,225 sq ft"],
            ["sq m → sq ft", "1 sq m = 10.764 sq ft"],
            ["Bigha → Acre", "1 Bigha = 0.625 Acre"]
          ].map(([title, sub]) => (
            <div key={title} className="rounded-lg bg-slate-800/50 px-3 py-2.5">
              <div className="text-xs text-slate-500">{title}</div>
              <div className="mono text-sky-300">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}