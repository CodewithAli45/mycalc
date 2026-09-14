"use client"

import { useCallback, useMemo, useState } from "react"
import { evaluate, formatNumber } from "@/lib/calc"
import { useLocalStorage } from "@/lib/useLocalStorage"

const ANS_KEY = "edash-ans"

function toDisplay(expr: string): string {
  return expr
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/-/g, "−")
    .replace(/([0-9a-zA-Z])\^/g, "$1^")
}

function stripTrailingOperator(expr: string): string {
  return expr.replace(/(\s*[+*/−-]$)/, "")
}

export default function Scientific() {
  const [expr, setExpr] = useState("")
  const [cursor, setCursor] = useState(0)
  const [deg, setDeg] = useState(true)
  const [secondary, setSecondary] = useState(false)
  const [ans, setAns] = useLocalStorage<string | null>(ANS_KEY, null)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const insertText = useCallback(
    (text: string) => {
      setError(null)
      setResult(null)
      const next = expr.slice(0, cursor) + text + expr.slice(cursor)
      setExpr(next)
      setCursor(cursor + text.length)
    },
    [expr, cursor]
  )

  const evaluateExpr = useCallback(() => {
    if (expr.trim() === "") return
    const clean = stripTrailingOperator(expr)
    if (clean.trim() === "") return
    try {
      const value = evaluate(clean, deg)
      if (!Number.isFinite(value)) {
        setError("Cannot divide by zero")
        return
      }
      const formatted = formatNumber(value)
      setResult(formatted)
      setExpr(formatted)
      setCursor(formatted.length)
      setError(null)
      setAns(formatted)
    } catch {
      setError("Invalid expression")
    }
  }, [expr, deg, setAns])

  const live = useMemo(() => {
    if (expr.trim() === "" || error) return null
    try {
      const value = evaluate(expr, deg)
      if (!Number.isFinite(value)) return null
      return toDisplay(expr) + " = " + formatNumber(value)
    } catch {
      return null
    }
  }, [expr, deg, error])

  const trig = (name: string) => {
    insertText(`${name}(`)
  }

  const pressDigit = (d: string) => {
    if (d === "." && /\.[0-9]*$/.test(expr.slice(0, cursor).split(/[+*/-\s]/).pop() ?? "")) return
    insertText(d)
  }

  const negate = () => {
    const before = expr.slice(0, cursor)
    const after = expr.slice(cursor)
    const m = before.match(/([0-9.]+)$/)
    if (!m) {
      insertText("(-")
      return
    }
    const num = m[1]
    const start = before.length - num.length
    const head = before.slice(0, start)
    const negated = num.startsWith("-") ? num.slice(1) : `-${num}`
    const next = head + negated + after
    setExpr(next)
    setCursor(start + negated.length)
    setError(null)
    setResult(null)
  }

  const backspace = () => {
    if (cursor <= 0) return
    const next = expr.slice(0, cursor - 1) + expr.slice(cursor)
    setExpr(next)
    setCursor(cursor - 1)
    setError(null)
  }

  const clearAll = () => {
    setExpr("")
    setCursor(0)
    setResult(null)
    setError(null)
  }

  const btn = (label: string, onPress: () => void, cls: string) => (
    <button
      onClick={onPress}
      className={`btn rounded-xl py-3 text-lg font-semibold ${cls}`}
    >
      {label}
    </button>
  )

  const fn = (
    primary: string,
    secondaryLabel: string,
    primaryAction: () => void,
    secondaryAction: () => void,
    cls: string
  ) =>
    btn(
      secondary ? secondaryLabel : primary,
      secondary ? secondaryAction : primaryAction,
      cls
    )

return (
    <div className="mx-auto w-full max-w-sm lg:max-w-3xl">
      <div className="card p-4">
        <div className="mb-1 flex h-6 items-end justify-end">
          <span className="mono truncate text-xs text-slate-500">{live ?? "\u00a0"}</span>
        </div>
        <div className="mb-3 flex h-24 items-end justify-end overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3 lg:h-32">
          <span className="mono w-full truncate text-right text-5xl font-bold leading-none text-slate-100">
            {error ? (
              <span className="text-red-400">{error}</span>
            ) : (
              toDisplay(expr) || "0"
            )}
          </span>
        </div>

        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-400">Angle:</span>
            <div className="flex rounded-lg bg-slate-800 p-0.5">
              <button
                onClick={() => setDeg(true)}
                className={`rounded-md px-3 py-1 transition ${deg ? "bg-sky-500 font-semibold text-slate-950" : "text-slate-400 hover:text-slate-200"}`}
              >
                DEG
              </button>
              <button
                onClick={() => setDeg(false)}
                className={`rounded-md px-3 py-1 transition ${!deg ? "bg-sky-500 font-semibold text-slate-950" : "text-slate-400 hover:text-slate-200"}`}
              >
                RAD
              </button>
            </div>
          </div>
          <button onClick={() => setSecondary((s) => !s)} className="rounded-md border border-violet-400/40 px-3 py-1 text-violet-300 transition hover:bg-violet-500/10">
            2nd
          </button>
        </div>

        <div className="mb-3 grid grid-cols-5 gap-2">
            <button className="btn rounded-xl bg-violet-600 py-3 text-lg font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-500" onClick={() => setSecondary((s) => !s)}>
              2nd
            </button>
            <button className="btn rounded-xl bg-slate-600/70 py-3 text-lg font-semibold text-slate-100 hover:bg-slate-500/70" onClick={() => insertText("π")}>
              π
            </button>
            <button className="btn rounded-xl bg-slate-600/70 py-3 text-lg font-semibold text-slate-100 hover:bg-slate-500/70" onClick={() => insertText("e")}>
              e
            </button>
            <button className="btn rounded-xl bg-red-500/90 py-3 text-lg font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-red-500" onClick={clearAll}>
              AC
            </button>
            <button className="btn rounded-xl bg-amber-500/90 py-3 text-lg font-semibold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-500" onClick={backspace}>
              ⌫
            </button>
          </div>

        <div className="grid grid-cols-5 gap-2">
          {fn("sin", "asin", () => trig("sin"), () => trig("asin"), "bg-slate-600/70 text-slate-100 hover:bg-slate-500/70")}
          {fn("cos", "acos", () => trig("cos"), () => trig("acos"), "bg-slate-600/70 text-slate-100 hover:bg-slate-500/70")}
          {fn("tan", "atan", () => trig("tan"), () => trig("atan"), "bg-slate-600/70 text-slate-100 hover:bg-slate-500/70")}
          {btn("x²", () => insertText("^2"), "bg-slate-600/70 text-slate-100 hover:bg-slate-500/70")}
          {btn("xʸ", () => insertText("^"), "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-500/20")}

          {fn("ln", "log₂", () => trig("ln"), () => insertText("logb("), "bg-slate-600/70 text-slate-100 hover:bg-slate-500/70")}
          {fn("log", "10ˣ", () => trig("log"), () => insertText("10^"), "bg-slate-600/70 text-slate-100 hover:bg-slate-500/70")}
          {btn("√", () => insertText("sqrt("), "bg-slate-600/70 text-slate-100 hover:bg-slate-500/70")}
          {btn("eˣ", () => insertText("exp("), "bg-slate-600/70 text-slate-100 hover:bg-slate-500/70")}
          {btn("x!", () => insertText("!"), "bg-slate-600/70 text-slate-100 hover:bg-slate-500/70")}

          {btn("7", () => pressDigit("7"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("8", () => pressDigit("8"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("9", () => pressDigit("9"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("÷", () => insertText("/"), "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-500/20")}
          {btn("±", negate, "bg-slate-600/70 text-slate-100 hover:bg-slate-500/70")}

          {btn("4", () => pressDigit("4"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("5", () => pressDigit("5"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("6", () => pressDigit("6"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("×", () => insertText("*"), "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-500/20")}
          {btn("(", () => insertText("("), "bg-slate-600/70 text-slate-100 hover:bg-slate-500/70")}

          {btn("1", () => pressDigit("1"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("2", () => pressDigit("2"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("3", () => pressDigit("3"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("−", () => insertText("-"), "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-500/20")}
          {btn(")", () => insertText(")"), "bg-slate-600/70 text-slate-100 hover:bg-slate-500/70")}

          {btn("0", () => pressDigit("0"), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn(".", () => pressDigit("."), "bg-slate-700/70 text-slate-100 hover:bg-slate-600/70")}
          {btn("ANS", () => insertText(ans ?? "0"), "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20")}
          {btn("+", () => insertText("+"), "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-500/20")}
          {btn("=", evaluateExpr, "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20")}
        </div>

        {result !== null && (
          <div className="mt-3 text-right text-xs text-slate-500">
            ANS saved: <span className="mono text-sky-400">{result}</span>
          </div>
        )}
      </div>
    </div>
  )
}