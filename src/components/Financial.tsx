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
  interest,
  fees = 0
}: {
  principal: number
  interest: number
  fees?: number
}) {
  const total = principal + interest + fees
  if (total <= 0) return null
  const pFrac = principal / total
  const interestFrac = interest / total
  const feesFrac = fees / total

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

  const interestStart = pFrac * Math.PI * 2
  const feesStart = interestStart + interestFrac * Math.PI * 2

  return (
    <div className="flex min-w-0 flex-col items-center gap-4">
      <svg viewBox="0 0 50 50" className="h-36 w-36 shrink-0" role="img" aria-label="Principal and interest breakdown">
        {donut(0, pFrac, "rgba(45,212,191,0.9)", "#2dd4bf", "principal")}
        {donut(interestStart, interestFrac, "rgba(251,191,36,0.95)", "#fbbf24", "interest")}
        {donut(feesStart, feesFrac, "rgba(244,114,182,0.95)", "#f472b6", "fees")}
      </svg>
      <div className="w-full max-w-sm space-y-2 text-sm">
        <div className="grid min-w-0 grid-cols-[auto_1fr_auto] items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-sky-400" aria-hidden="true" />
          <span className="text-slate-300">Principal</span>
          <span className="mono min-w-0 text-right font-semibold text-slate-100 [overflow-wrap:anywhere]">{fmt(principal)}</span>
        </div>
        <div className="grid min-w-0 grid-cols-[auto_1fr_auto] items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-amber-400" aria-hidden="true" />
          <span className="text-slate-300">Interest</span>
          <span className="mono min-w-0 text-right font-semibold text-slate-100 [overflow-wrap:anywhere]">{fmt(interest)}</span>
        </div>
        {fees > 0 && (
          <div className="grid min-w-0 grid-cols-[auto_1fr_auto] items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-pink-400" aria-hidden="true" />
            <span className="text-slate-300">Fees + GST</span>
            <span className="mono min-w-0 text-right font-semibold text-slate-100 [overflow-wrap:anywhere]">{fmt(fees)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

type Tab = "emi" | "simple" | "compound"

export default function Financial() {
  const [tab, setTab] = useState<Tab>("emi")

  const [p, setP] = useState("500000")
  const [rate, setRate] = useState("8.5")
  const [processingFeeRate, setProcessingFeeRate] = useState("2")
  const [gstRate, setGstRate] = useState("18")
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

  const loanCosts = useMemo(() => {
    const principal = parseFloat(p)
    const feeRate = parseFloat(processingFeeRate)
    const taxRate = parseFloat(gstRate)
    if (!(principal > 0) || !(feeRate >= 0) || !(taxRate >= 0)) return null
    const processingFee = principal * feeRate / 100
    const gst = processingFee * taxRate / 100
    return {
      processingFee,
      gst,
      totalFees: processingFee + gst,
      netDisbursed: principal - processingFee - gst
    }
  }, [p, processingFeeRate, gstRate])

  const apr = useMemo(() => {
    if (!loan || !loanCosts || loanCosts.netDisbursed <= 0) return null
    // Solve the monthly discount rate for net proceeds versus the fixed EMI stream.
    let low = 0
    let high = 1
    const pvAt = (monthlyRate: number) => {
      if (monthlyRate === 0) return loan.emi * loan.tenureMonths
      return loan.emi * (1 - Math.pow(1 + monthlyRate, -loan.tenureMonths)) / monthlyRate
    }
    for (let i = 0; i < 80; i++) {
      const mid = (low + high) / 2
      if (pvAt(mid) > loanCosts.netDisbursed) low = mid
      else high = mid
    }
    return (Math.pow(1 + (low + high) / 2, 12) - 1) * 100
  }, [loan, loanCosts])

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
    <div className="mx-auto w-full min-w-0 max-w-2xl">
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-slate-800/60 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`min-w-max flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
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
        <div className="mb-3 flex justify-end print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!loan}
            className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export PDF
          </button>
        </div>
      )}

      {tab === "emi" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card min-w-0 p-4 sm:p-5">
            <h3 className="card-title mb-1 text-base">Loan / EMI</h3>
            <p className="mb-4 text-xs text-slate-500">
              EMI, upfront processing charges and estimated all-in APR.
            </p>
            <div className="space-y-3">
              {input("Loan amount", p, setP, "₹")}
              <div className="grid grid-cols-2 gap-3">
                {input("Years", years, setYears, "yr")}
                {input("Months", months, setMonths, "mo")}
              </div>
              {input("Annual interest rate", rate, setRate, "% p.a.")}
              <div className="grid grid-cols-2 gap-3">
                {input("Processing fee", processingFeeRate, setProcessingFeeRate, "%")}
                {input("GST on fee", gstRate, setGstRate, "%")}
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">Fee and GST are estimated from the loan amount. Enter the rates quoted by your lender.</p>
            </div>

            {loan && (
              <div className="mt-5 space-y-2 border-t border-slate-700/40 pt-4 text-sm">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <span className="text-slate-400">Monthly EMI</span>
                  <span className="mono min-w-0 text-right text-lg font-bold leading-tight text-emerald-300 [overflow-wrap:anywhere]">{fmt(loan.emi)}</span>
                </div>
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <span className="text-slate-400">Total interest</span>
                  <span className="mono min-w-0 text-right font-semibold text-amber-300 [overflow-wrap:anywhere]">{fmt(loan.totalInterest)}</span>
                </div>
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <span className="text-slate-400">Total repayments</span>
                  <span className="mono min-w-0 text-right font-semibold text-sky-300 [overflow-wrap:anywhere]">{fmt(loan.totalPayment)}</span>
                </div>
                {loanCosts && (
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <span className="text-slate-400">Total cost incl. fees</span>
                    <span className="mono min-w-0 text-right font-semibold text-sky-200 [overflow-wrap:anywhere]">{fmt(loan.totalPayment + loanCosts.totalFees)}</span>
                  </div>
                )}
                <div className="flex min-w-0 items-start justify-between gap-3 text-xs">
                  <span className="text-slate-500">Amount financed</span>
                  <span className="mono min-w-0 text-right text-slate-300 [overflow-wrap:anywhere]">{fmt(loan.principal)}</span>
                </div>
                {loanCosts && (
                  <>
                    <div className="flex min-w-0 items-start justify-between gap-3 text-xs">
                      <span className="text-slate-500">Processing fee + GST</span>
                      <span className="mono min-w-0 text-right text-pink-300 [overflow-wrap:anywhere]">{fmt(loanCosts.totalFees)}</span>
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-3 text-xs">
                      <span className="text-slate-500">Net amount received</span>
                      <span className="mono min-w-0 text-right text-slate-300 [overflow-wrap:anywhere]">{fmt(loanCosts.netDisbursed)}</span>
                    </div>
                    {apr !== null && (
                      <div className="flex min-w-0 items-start justify-between gap-3 border-t border-slate-700/40 pt-2">
                        <span className="font-medium text-slate-300">Estimated APR</span>
                        <span className="mono text-right font-bold text-pink-300">{apr.toFixed(2)}% p.a.</span>
                      </div>
                    )}
                    <p className="text-[11px] leading-relaxed text-slate-500">APR annualizes monthly repayments against the amount received, assuming fees are paid upfront.</p>
                  </>
                )}
              </div>
            )}
          </div>

          {loan && (
            <div className="card min-w-0 flex flex-col p-4 sm:p-5">
              <h3 className="card-title mb-4 text-base">Breakdown</h3>
              <PieChart principal={loan.principal} interest={loan.totalInterest} fees={loanCosts?.totalFees ?? 0} />
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-700/40 pt-4 text-center">
                <div>
                  <div className="font-mono text-sm font-bold text-sky-300">{(loan.principal / (loan.totalPayment + (loanCosts?.totalFees ?? 0)) * 100).toFixed(1)}%</div>
                  <div className="text-[11px] text-slate-500">Principal</div>
                </div>
                <div>
                  <div className="font-mono text-sm font-bold text-amber-300">{(loan.totalInterest / (loan.totalPayment + (loanCosts?.totalFees ?? 0)) * 100).toFixed(1)}%</div>
                  <div className="text-[11px] text-slate-500">Interest</div>
                </div>
                <div>
                  <div className="font-mono text-sm font-bold text-pink-300">{((loanCosts?.totalFees ?? 0) / (loan.totalPayment + (loanCosts?.totalFees ?? 0)) * 100).toFixed(1)}%</div>
                  <div className="text-[11px] text-slate-500">Fees</div>
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
          <div className="max-h-80 overflow-auto rounded-lg border border-slate-700/40 [overscroll-behavior:contain]">
            <table className="w-full min-w-[560px] text-sm">
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
                    <td className="mono px-3 py-1.5 text-amber-300">{fmt(row.interest)}</td>
                    <td className="mono px-3 py-1.5 text-right text-slate-400">{fmt(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loan && loanCosts && tab === "emi" && (
        <section id="finance-print-report" aria-label="Printable loan estimate">
          <h1>Loan repayment estimate</h1>
          <p className="print-subtitle">Estimate based on the loan and fee assumptions entered in the calculator.</p>

          <h2>Loan summary</h2>
          <table className="print-summary">
            <thead>
              <tr><th scope="col">Loan detail</th><th scope="col">Value</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row">Loan amount</th><td>{fmt(loan.principal)}</td></tr>
              <tr><th scope="row">Annual interest rate</th><td>{rate}% p.a.</td></tr>
              <tr><th scope="row">Loan term</th><td>{loan.tenureMonths} months</td></tr>
              <tr><th scope="row">Monthly EMI</th><td>{fmt(loan.emi)}</td></tr>
              <tr><th scope="row">Processing fee</th><td>{processingFeeRate}% · {fmt(loanCosts.processingFee)}</td></tr>
              <tr><th scope="row">GST on processing fee</th><td>{gstRate}% · {fmt(loanCosts.gst)}</td></tr>
              <tr><th scope="row">Total upfront fees</th><td>{fmt(loanCosts.totalFees)}</td></tr>
              <tr><th scope="row">Net amount received</th><td>{fmt(loanCosts.netDisbursed)}</td></tr>
              <tr><th scope="row">Total interest</th><td>{fmt(loan.totalInterest)}</td></tr>
              <tr><th scope="row">Total repayments</th><td>{fmt(loan.totalPayment)}</td></tr>
              <tr className="print-total"><th scope="row">Total cost including fees</th><td>{fmt(loan.totalPayment + loanCosts.totalFees)}</td></tr>
              <tr className="print-apr"><th scope="row">Estimated APR</th><td>{apr === null ? "Not available" : `${apr.toFixed(2)}% p.a.`}</td></tr>
            </tbody>
          </table>
          <p className="print-note"><strong>APR assumption:</strong> Estimated by annualizing monthly repayments against the net amount received. Assumes the processing fee and GST are paid upfront; other lender charges are excluded.</p>

          <h2>Amortization schedule</h2>
          <table className="print-amortization">
            <thead>
              <tr><th scope="col">Month</th><th scope="col">EMI (₹)</th><th scope="col">Principal (₹)</th><th scope="col">Interest (₹)</th><th scope="col">Balance (₹)</th></tr>
            </thead>
            <tbody>
              {loan.amortization.map((row) => (
                <tr key={row.month}>
                  <td className="print-month">{row.month}</td>
                  <td>{fmt(loan.emi).replace("₹", "")}</td>
                  <td>{fmt(row.principal).replace("₹", "")}</td>
                  <td>{fmt(row.interest).replace("₹", "")}</td>
                  <td>{fmt(row.balance).replace("₹", "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {(tab === "simple" || tab === "compound") && (
        <div className="grid gap-4 lg:grid-cols-2">
          {tab === "simple" && (
            <div className="card min-w-0 p-4 sm:p-5">
              <h3 className="card-title mb-1 text-base">Simple Interest</h3>
              <p className="mb-4 text-xs text-slate-500">SI = P × R × T / 100</p>
              <div className="space-y-3">
                {input("Principal", sp, setSp, "₹")}
                {input("Annual rate", sr, setSr, "% p.a.")}
                {input("Time", st, setSt, "years")}
              </div>
              {simple && (
                <div className="mt-5 space-y-2 border-t border-slate-700/40 pt-4 text-sm">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <span className="text-slate-400">Interest earned</span>
                    <span className="mono min-w-0 text-right font-semibold text-emerald-300 [overflow-wrap:anywhere]">{fmt(simple.interest)}</span>
                  </div>
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <span className="text-slate-400">Maturity amount</span>
                    <span className="mono min-w-0 text-right font-semibold text-sky-300 [overflow-wrap:anywhere]">{fmt(simple.total)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "compound" && (
            <div className="card min-w-0 p-4 sm:p-5">
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
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <span className="text-slate-400">Interest earned</span>
                    <span className="mono min-w-0 text-right font-semibold text-emerald-300 [overflow-wrap:anywhere]">{fmt(compound.interest)}</span>
                  </div>
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <span className="text-slate-400">Maturity amount</span>
                    <span className="mono min-w-0 text-right font-semibold text-sky-300 [overflow-wrap:anywhere]">{fmt(compound.total)}</span>
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
