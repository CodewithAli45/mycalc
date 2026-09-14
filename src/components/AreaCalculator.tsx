"use client"

import { useMemo, useState } from "react"
import {
  addMeasurements,
  subtractMeasurements,
  calculateArea,
  formatMeasurement,
  toTotalInches,
  type Measurement
} from "@/lib/area"

function MeasurementInput({
  label,
  value,
  onChange
}: {
  label: string
  value: Measurement
  onChange: (m: Measurement) => void
}) {
  const setFeet = (v: string) =>
    onChange({ ...value, feet: v === "" ? 0 : Number(v) })
  const setInches = (v: string) =>
    onChange({ ...value, inches: v === "" ? 0 : Number(v) })

  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-xs font-medium text-slate-400">{label}</span>
      <div className="relative flex-1">
        <input
          type="number"
          value={value.feet || ""}
          onChange={(e) => setFeet(e.target.value)}
          placeholder="0"
          className="w-full rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 pr-8 text-sm focus:border-sky-500"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">&apos;</span>
      </div>
      <div className="relative flex-1">
        <input
          type="number"
          value={value.inches || ""}
          onChange={(e) => setInches(e.target.value)}
          placeholder="0"
          className="w-full rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 pr-8 text-sm focus:border-sky-500"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">&quot;</span>
      </div>
    </div>
  )
}

function ResultRow({
  label,
  value,
  strong = false
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`mono font-semibold ${strong ? "text-lg text-emerald-300" : "text-sky-300"}`}>
        {value}
      </span>
    </div>
  )
}

export default function AreaCalculator() {
  const [a, setA] = useState<Measurement>({ feet: 25, inches: 8 })
  const [b, setB] = useState<Measurement>({ feet: 14, inches: 7 })
  const [operator, setOperator] = useState<"add" | "sub">("add")

  const [len, setLen] = useState<Measurement>({ feet: 12, inches: 0 })
  const [bre, setBre] = useState<Measurement>({ feet: 10, inches: 0 })

  const arithResult = useMemo(() => {
    const r = operator === "add" ? addMeasurements(a, b) : subtractMeasurements(a, b)
    return { measurement: r, totalInches: toTotalInches(r) }
  }, [a, b, operator])

  const area = useMemo(() => calculateArea(len, bre), [len, bre])

  const swap = () => {
    const tmp = a
    setA(b)
    setB(tmp)
  }

  const inputCard = (title: string, measure: Measurement, set: (m: Measurement) => void, name: string) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        <span className="mono text-xs text-slate-500">
          {formatMeasurement(measure)} · {toTotalInches(measure)}&quot;
        </span>
      </div>
      <MeasurementInput label={name} value={measure} onChange={set} />
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="card p-5">
        <h3 className="card-title mb-1 text-base">Feet-Inches Arithmetic</h3>
        <p className="mb-4 text-xs text-slate-500">
          Add or subtract lengths expressed in feet and inches.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {inputCard("Measurement A", a, setA, "A")}
          {inputCard("Measurement B", b, setB, "B")}
        </div>

        <div className="my-4 flex items-center gap-2">
          <button
            onClick={() => setOperator("add")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              operator === "add"
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
            }`}
          >
            +
          </button>
          <button
            onClick={() => setOperator("sub")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              operator === "sub"
                ? "bg-violet-500 text-slate-950"
                : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
            }`}
          >
            −
          </button>
          <button
            onClick={swap}
            className="rounded-lg bg-slate-700/50 px-3 py-2 text-slate-300 transition hover:bg-slate-600/50"
            aria-label="Swap inputs"
          >
            ⇄
          </button>
        </div>

        <div className="rounded-xl border border-slate-700/40 bg-slate-900/50 px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
              {formatMeasurement(a)} {operator === "add" ? "+" : "−"} {formatMeasurement(b)}
            </span>
            <span className="mono text-sm text-slate-500">=</span>
          </div>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
            <div className="mono text-4xl font-bold tracking-tight text-emerald-300">
              {formatMeasurement(arithResult.measurement)}
            </div>
            <div className="mono text-lg font-semibold text-sky-300">
              {arithResult.totalInches}&quot; total
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="card-title mb-1 text-base">Area: Length × Breadth</h3>
        <p className="mb-4 text-xs text-slate-500">
          Enter dimensions in feet and inches. Output is given in sq ft and sq m.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {inputCard("Length", len, setLen, "L")}
          {inputCard("Breadth", bre, setBre, "B")}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3">
            <div className="text-xs text-sky-300/80">Area</div>
            <div className="mono mt-0.5 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-sky-300">
                {area.sqft.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-400">sq ft</span>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3">
            <div className="text-xs text-emerald-300/80">Area</div>
            <div className="mono mt-0.5 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-emerald-300">
                {area.sqm.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-400">sq m</span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-700/40 pt-3">
          <ResultRow label={`${formatMeasurement(len)} × ${formatMeasurement(bre)}`} value="" />
          <ResultRow label="Square feet" value={`${area.sqft.toLocaleString("en-IN", { maximumFractionDigits: 4 })} sq ft`} strong />
          <ResultRow label="Square meters" value={`${area.sqm.toLocaleString("en-IN", { maximumFractionDigits: 4 })} sq m`} strong />
        </div>
      </div>
    </div>
  )
}