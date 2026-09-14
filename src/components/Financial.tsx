"use client"

import { useMemo, useState } from "react"
import {
  calculateEMI,
  calculateSimpleInterest,
  calculateCompoundInterest,
  type CompoundFrequency
} from "@/lib/finance"

function fmt(n: number, currency = "₹"): string {
  const hasDecimals = Math.abs(n - Math.round(n)) > 0.005
  return `${currency}${n.toLocaleString("en-IN", {
    maximumFractionDigits: hasDecimals ? 2 : 0
  })}`
}

function PieChart({
  principal,
  interest
}: {
  principal: number
  interest: number
}) {
  const total = principal + interest
  if (total <= 0) return null
  const pFrac = principal / total

  const R = 11
  const r = 7.5
  const CX = 25
  const CY = 25

  const donut = (start: number, frac: number, fill: string, stroke: string, key: string) => {
    if (frac <= 0) return null
    const end = start + frac * Math.PI * 2
    const large = frac > 0.5 ? 1 : 0
    const outerStartX = CX + R * Math.cos(start)
    const outerStartY = CY + R * Math.sin(start)
    const outerEndX = CX + R * Math.cos(end)
    const outerEndY = CY + R * Math.sin(end)
    const innerEndX = CX + r * Math.cos(end)
    const innerEndY = CY + r * Math.sin(end)
    return (
      <path
        key={key}
        d={`M ${outerStartX} ${outerStartY} A ${R} ${R} 0 ${large} 1 ${outerEndX} ${outerEndY} L ${innerEndX} ${innerEndY} A ${r} ${r} 0 ${large} 0 ${outerStartX} ${outerStartY} Z`}
        fill={fill}
        stroke={stroke}
        strokeWidth={0.25}
      />
    )
  }

  const label = (frac: number, start: number, text: string, dark: boolean) => {
    const mid = start + frac * Math.PI
    const radius = (R + r) / 2
    return (
      <text
        x={CX + radius * Math.cos(mid)}
        y={CY + radius * Math.sin(mid)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="3.2"
        fontWeight="700"
        fill={dark ? "#0b0f17" : "#f1f5f9"}
      >
        {text}
      </text>
    )
  }

  const pRad = pFrac * Math.PI * 2
  const enough = (frac: number) => frac > 0.14

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <svg viewBox="0 0 50 50" className="h-44 w-44 shrink-0">
        {donut(0, pFrac, "rgba(56,189,248,0.9)", "#38bdf8", "principal")}
        {donut(pRad, 1 - pFrac, "rgba(167,139,250,0.9)", "#a78bfa", "interest")}
        {enough(pFrac) &&
          label(pFrac, 0, pFrac >= 0.45 ? "Principal" : `${Math.round(pFrac * 100)}%`, pFrac > 0.5)}
        {enough(1 - pFrac) &&
          label(1 - pFrac, pRad, 1 - pFrac >= 0.45 ? "Interest" : `${Math.round((1 - pFrac) * 100)}%`, 1 - pFrac > 0.5)}
      </svg>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-sky-400" />
          <span className="text-slate-300">Principal</span>
          <span className="mono ml-auto font-semibold text-slate-100">{fmt(principal)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-violet-400" />
          <span className="text-slate-300">Interest</span>
          <span className="mono ml-auto font-semibold text-slate-100">{fmt(interest)}</span>
        </div>
      </div>
    </div>
  )
}

type Tab = "emi" | "simple" | "compound"

export default function Financial() {
  const [tab, setTab] = useState<Tab>("emi")

  const [p, setP] = useState("500000")
  const [rate, setRate] = useState("8.5")
  const [years, setYears] = useState("3")
  const [months, setMonths] = useState("0")

  const [sp, setSp] = useState("100000")
  const [sr, setSr] = useState("6")
  const [st, setSt] = useState("2")

  const [cp, setCp] = useState("100000")
  const [cr, setCr] = useState("6")
  const [ct, setCt] = useState("2")
  const [freq, setFreq] = useState<CompoundFrequency>(12)

  const tenureMonths = useMemo(() => {
    const y = parseInt(years, 10) || 0
    const m = parseInt(months, 10) || 0
    return y * 12 + m
  }, [years, months])

  const loan = useMemo(() => {
    const principal = parseFloat(p)
    const annualRate = parseFloat(rate)
    if (!(principal > 0) || !(annualRate >= 0) || !(tenureMonths > 0)) return null
    try {
      return calculateEMI({ principal, annualRate, tenureMonths })
    } catch {
      return null
    }
  }, [p, rate, tenureMonths])

  const simple = useMemo(() => {
    const principal = parseFloat(sp)
    const rateVal = parseFloat(sr)
    const time = parseFloat(st)
    if (!(principal > 0) || !(rateVal >= 0) || !(time > 0)) return null
    return calculateSimpleInterest({ principal, rate: rateVal, timeYears: time })
  }, [sp, sr, st])

  const compound = useMemo(() => {
    const principal = parseFloat(cp)
    const rateVal = parseFloat(cr)
    const time = parseFloat(ct)
    if (!(principal > 0) || !(rateVal >= 0) || !(time > 0)) return null
    return calculateCompoundInterest({
      principal,
      rate: rateVal,
      timeYears: time,
      frequency: freq
    })
  }, [cp, cr, ct, freq])

  const input = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    suffix: string
  ) => (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-400">{label}</span>
      <div className="flex items-center rounded-lg border border-slate-700/60 bg-slate-900/60 focus-within:border-sky-500">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-transparent px-3 py-2 text-sm text-slate-100"
        />
        <span className="pr-3 text-xs text-slate-500">{suffix}</span>
      </div>
    </label>
  )

  const tabs: { id: Tab; label: string }[] = [
    { id: "emi", label: "Loan / EMI" },
    { id: "simple", label: "Simple Interest" },
    { id: "compound", label: "Compound Interest" }
  ]

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 flex gap-1 rounded-xl bg-slate-800/60 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-sky-500/20 text-sky-300 shadow-inner"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "emi" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-5">
            <h3 className="card-title mb-1 text-base">Loan / EMI</h3>
            <p className="mb-4 text-xs text-slate-500">
              Monthly EMI, interest cost and full amortization.
            </p>
            <div className="space-y-3">
              {input("Loan amount", p, setP, "₹")}
              <div className="grid grid-cols-2 gap-3">
                {input("Years", years, setYears, "yr")}
                {input("Months", months, setMonths, "mo")}
              </div>
              {input("Annual interest rate", rate, setRate, "% p.a.")}
            </div>

            {loan && (
              <div className="mt-5 space-y-2 border-t border-slate-700/40 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly EMI</span>
                  <span className="mono text-lg font-bold text-emerald-300">{fmt(loan.emi)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total interest</span>
                  <span className="mono font-semibold text-violet-300">{fmt(loan.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total payable</span>
                  <span className="mono font-semibold text-sky-300">{fmt(loan.totalPayment)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Amount financed</span>
                  <span className="mono text-slate-300">{fmt(loan.principal)}</span>
                </div>
              </div>
            )}
          </div>

          {loan && (
            <div className="card flex flex-col p-5">
              <h3 className="card-title mb-4 text-base">Breakdown</h3>
              <PieChart principal={loan.principal} interest={loan.totalInterest} />
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-700/40 pt-4 text-center">
                <div>
                  <div className="font-mono text-sm font-bold text-sky-300">{(loan.principal / loan.totalPayment) * 100 >= 0 ? ((loan.principal / loan.totalPayment) * 100).toFixed(1) : "0"}%</div>
                  <div className="text-[11px] text-slate-500">Principal</div>
                </div>
                <div>
                  <div className="font-mono text-sm font-bold text-violet-300">{((loan.totalInterest / loan.totalPayment) * 100).toFixed(1)}%</div>
                  <div className="text-[11px] text-slate-500">Interest</div>
                </div>
                <div>
                  <div className="font-mono text-sm font-bold text-slate-200">{loan.tenureMonths}</div>
                  <div className="text-[11px] text-slate-500">Months</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {loan && tab === "emi" && (
        <div className="card mt-4 p-5">
          <h3 className="card-title mb-3 text-base">
            Amortization Schedule <span className="text-xs font-normal text-slate-500">({loan.amortization.length} months)</span>
          </h3>
          <div className="max-h-80 overflow-auto rounded-lg border border-slate-700/40">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-800 text-left text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">EMI</th>
                  <th className="px-3 py-2">Principal</th>
                  <th className="px-3 py-2">Interest</th>
                  <th className="px-3 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {loan.amortization.map((row) => (
                  <tr key={row.month} className="border-t border-slate-700/30 text-slate-300">
                    <td className="px-3 py-1.5 text-slate-500">{row.month}</td>
                    <td className="mono px-3 py-1.5">{fmt(loan.emi)}</td>
                    <td className="mono px-3 py-1.5 text-sky-300">{fmt(row.principal)}</td>
                    <td className="mono px-3 py-1.5 text-violet-300">{fmt(row.interest)}</td>
                    <td className="mono px-3 py-1.5 text-right text-slate-400">{fmt(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(tab === "simple" || tab === "compound") && (
        <div className="grid gap-4 lg:grid-cols-2">
          {tab === "simple" && (
            <div className="card p-5">
              <h3 className="card-title mb-1 text-base">Simple Interest</h3>
              <p className="mb-4 text-xs text-slate-500">SI = P × R × T / 100</p>
              <div className="space-y-3">
                {input("Principal", sp, setSp, "₹")}
                {input("Annual rate", sr, setSr, "% p.a.")}
                {input("Time", st, setSt, "years")}
              </div>
              {simple && (
                <div className="mt-5 space-y-2 border-t border-slate-700/40 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interest earned</span>
                    <span className="mono font-semibold text-emerald-300">{fmt(simple.interest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Maturity amount</span>
                    <span className="mono font-semibold text-sky-300">{fmt(simple.total)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "compound" && (
            <div className="card p-5">
              <h3 className="card-title mb-1 text-base">Compound Interest</h3>
              <p className="mb-4 text-xs text-slate-500">A = P(1 + r/n)^(n·t)</p>
              <div className="space-y-3">
                {input("Principal", cp, setCp, "₹")}
                {input("Annual rate", cr, setCr, "% p.a.")}
                {input("Time", ct, setCt, "years")}
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-400">Compounding frequency</span>
                  <select
                    value={freq}
                    onChange={(e) => setFreq(Number(e.target.value) as CompoundFrequency)}
                    className="w-full rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
                  >
                    <option value={12}>Monthly (12)</option>
                    <option value={4}>Quarterly (4)</option>
                    <option value={2}>Half-yearly (2)</option>
                    <option value={1}>Annually (1)</option>
                    <option value={6}>Bi-monthly (6)</option>
                  </select>
                </label>
              </div>
              {compound && (
                <div className="mt-5 space-y-2 border-t border-slate-700/40 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interest earned</span>
                    <span className="mono font-semibold text-emerald-300">{fmt(compound.interest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Maturity amount</span>
                    <span className="mono font-semibold text-sky-300">{fmt(compound.total)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "simple" && simple && (
            <div className="card flex flex-col justify-center p-5">
              <h3 className="card-title mb-4 text-base">Comparison</h3>
              <PieChart principal={simple.principal} interest={simple.interest} />
            </div>
          )}
          {tab === "compound" && compound && (
            <div className="card flex flex-col justify-center p-5">
              <h3 className="card-title mb-4 text-base">Comparison</h3>
              <PieChart principal={compound.principal} interest={compound.interest} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}