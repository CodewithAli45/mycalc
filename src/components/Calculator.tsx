"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { evaluate, formatNumber } from "@/lib/calc"
import { useLocalStorage } from "@/lib/useLocalStorage"

interface HistoryEntry {
  expr: string
  result: string
}

const ANS_KEY = "edash-ans"
const HISTORY_KEY = "edash-history"

function toDisplay(expr: string): string {
  return expr.replace(/\*/g, "×").replace(/\//g, "÷").replace(/-/g, "−")
}

function stripTrailingOperator(expr: string): string {
  return expr.replace(/(\s*[+*/−-]$)/, "")
}

export default function Calculator() {
  const [expr, setExpr] = useState("")
  const [cursor, setCursor] = useState(0)
  const [ans, setAns] = useLocalStorage<string | null>(ANS_KEY, null)
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(HISTORY_KEY, [])
  const [justEvaluated, setJustEvaluated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateAns = useCallback(
    (value: number) => setAns(formatNumber(value)),
    [setAns]
  )

  const insertText = useCallback(
    (text: string) => {
      setError(null)
      setJustEvaluated(false)
      const next = expr.slice(0, cursor) + text + expr.slice(cursor)
      setExpr(next)
      setCursor(cursor + text.length)
    },
    [expr, cursor]
  )

  const pressDigit = useCallback(
    (d: string) => {
      setError(null)
      if (justEvaluated) {
        setExpr(d)
        setCursor(1)
        setJustEvaluated(false)
        return
      }
      if (d === ".") {
        const left = expr.slice(0, cursor).split(/[+*/-\s]/).pop() ?? ""
        const right = expr.slice(cursor).split(/[+*/-\s]/).shift() ?? ""
        if (left.includes(".") || right.includes(".")) return
      }
      insertText(d)
    },
    [justEvaluated, insertText, expr, cursor]
  )

  const pressOperator = useCallback(
    (op: string) => {
      let base = expr
      let baseCursor = cursor
      if (justEvaluated) {
        base = ans ?? expr
        baseCursor = base.length
        setJustEvaluated(false)
      } else if (base.length > 0 && /[+*/-\s]$/.test(base)) {
        base = base.replace(/[+*/-\s]*$/, "")
        baseCursor = base.length
      }
      if (base === "" && ans) {
        base = ans
        baseCursor = base.length
      }
      const next = base.slice(0, baseCursor) + op + base.slice(baseCursor)
      setExpr(next)
      setCursor(baseCursor + op.length)
      setError(null)
    },
    [expr, cursor, ans, justEvaluated]
  )

  const pressBackspace = useCallback(() => {
    setError(null)
    setJustEvaluated(false)
    if (cursor <= 0) return
    const next = expr.slice(0, cursor - 1) + expr.slice(cursor)
    setExpr(next)
    setCursor(cursor - 1)
  }, [expr, cursor])

  const clearAll = useCallback(() => {
    setExpr("")
    setCursor(0)
    setError(null)
    setJustEvaluated(false)
  }, [])

  const pressEnter = useCallback(() => {
    if (expr.trim() === "") return
    const clean = stripTrailingOperator(expr)
    if (clean.trim() === "") return
    try {
      const value = evaluate(clean)
      if (!Number.isFinite(value)) {
        setError("Cannot divide by zero")
        return
      }
      const formatted = formatNumber(value)
      const entry: HistoryEntry = { expr: toDisplay(clean), result: formatted }
      setHistory((prev) => [entry, ...prev].slice(0, 5))
      updateAns(value)
      setExpr(formatted)
      setCursor(formatted.length)
      setError(null)
      setJustEvaluated(true)
    } catch {
      setError("Invalid expression")
    }
  }, [expr, updateAns, setHistory])

  const pressAns = useCallback(() => {
    if (justEvaluated) {
      if (ans === null) {
        setExpr("")
        setCursor(0)
      } else {
        setExpr(ans)
        setCursor(ans.length)
      }
      setJustEvaluated(false)
      setError(null)
      return
    }
    if (ans === null) return
    insertText(ans)
  }, [ans, insertText, justEvaluated])

  const pressPercent = useCallback(() => {
    if (expr.trim() === "") return
    setError(null)
    setJustEvaluated(false)
    const before = expr.slice(0, cursor)
    const after = expr.slice(cursor)
    const match = before.match(/([0-9.]+)$/)
    if (!match) return
    const num = match[1]
    const insertion = `(${num}/100)`
    const next = before.slice(0, before.length - num.length) + insertion + after
    setExpr(next)
    setCursor(before.length - num.length + insertion.length)
  }, [expr, cursor])

  const livePreview = useMemo(() => {
    if (expr.trim() === "" || error) return null
    try {
      const value = evaluate(stripTrailingOperator(expr))
      if (!Number.isFinite(value)) return null
      return toDisplay(expr) + " = " + formatNumber(value)
    } catch {
      return null
    }
  }, [expr, error])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9.]$/.test(e.key)) pressDigit(e.key)
      else if (e.key === "+") pressOperator("+")
      else if (e.key === "-") pressOperator("-")
      else if (e.key === "*") pressOperator("*")
      else if (e.key === "/") {
        e.preventDefault()
        pressOperator("/")
      }
      else if (e.key === "%") pressPercent()
      else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault()
        pressEnter()
      }
      else if (e.key === "Backspace") pressBackspace()
      else if (e.key.toLowerCase() === "a" || e.key.toLowerCase() === "ans") pressAns()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [pressDigit, pressOperator, pressPercent, pressEnter, pressBackspace, pressAns])

  const btn = (label: string, onPress: () => void, cls: string, wide = false) => (
    <button
      onClick={onPress}
      className={`btn rounded-xl py-4 text-lg font-semibold ${cls} ${wide ? "col-span-2" : ""}`}
    >
      {label}
    </button>
  )

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="card p-4">
        <div className="mb-1 flex h-6 items-end justify-end pr-1">
          <span className="mono truncate text-xs text-slate-500">{livePreview ?? "\u00a0"}</span>
        </div>
        <div className="mb-4 flex h-14 items-center justify-end overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/60 px-4">
          <span className="mono truncate text-right text-3xl font-bold text-slate-100">
            {error ? <span className="text-red-400">{error}</span> : (toDisplay(expr) || "0")}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {btn("AC", clearAll, "bg-red-500/90 text-white hover:bg-red-500 shadow-lg shadow-red-500/20")}
          {btn("⌫", pressBackspace, "bg-amber-500/90 text-slate-950 hover:bg-amber-500 shadow-lg shadow-amber-500/20")}
          {btn("%", pressPercent, "bg-slate-600/70 text-slate-100 hover:bg-slate-500/70")}
          {btn("÷", () => pressOperator("/"), "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-500/20")}

          {btn("7", () => pressDigit("7"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("8", () => pressDigit("8"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("9", () => pressDigit("9"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("×", () => pressOperator("*"), "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-500/20")}

          {btn("4", () => pressDigit("4"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("5", () => pressDigit("5"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("6", () => pressDigit("6"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("−", () => pressOperator("-"), "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-500/20")}

          {btn("1", () => pressDigit("1"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("2", () => pressDigit("2"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("3", () => pressDigit("3"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("+", () => pressOperator("+"), "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-500/20")}

          {btn("ANS", pressAns, "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20")}
          {btn("0", () => pressDigit("0"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn(".", () => pressDigit("."), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("=", pressEnter, "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20")}
        </div>

        {ans !== null && (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              ANS = <span className="mono text-sky-400">{toDisplay(ans)}</span>
            </span>
            <span className="hidden sm:inline">keyboard: 0-9 · + - * / · Enter · Del · A=ANS</span>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="card mt-4 p-4">
          <h3 className="card-title mb-2 text-sm uppercase tracking-wide text-slate-400">
            Recent
          </h3>
          <ul className="space-y-1">
            {history.map((h, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-4 rounded-lg px-2 py-1.5 text-sm transition hover:bg-slate-700/30"
              >
                <span className="truncate text-slate-400">{h.expr}</span>
                <span className="mono shrink-0 font-semibold text-slate-100">{h.result}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}