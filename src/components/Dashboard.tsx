"use client"

import { useCallback, useSyncExternalStore } from "react"
import Clock from "@/components/Clock"
import Calculator from "@/components/Calculator"
import Scientific from "@/components/Scientific"
import Financial from "@/components/Financial"
import AreaCalculator from "@/components/AreaCalculator"
import UnitConverter from "@/components/UnitConverter"

type TabId = "basic" | "scientific" | "finance" | "area" | "converter"

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "basic", label: "Basic", icon: "M9 7h6M9 11h6M9 15h4M9 19h2M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" },
  { id: "scientific", label: "Scientific", icon: "M4 11a7 7 0 0114 0v1M12 5v6l3 3M12 5l-3 3M4 11v6a2 2 0 002 2h2M16 11l3 3M16 11v6M12 17v2M4 17v-2M12 13l-3 3M12 13l3 3" },
  { id: "finance", label: "Finance", icon: "M2 12h3l2 7 4-14 3 9h8M2 12h20" },
  { id: "area", label: "Area", icon: "M3 12l9-9 9 9M5 10v10a2 2 0 002 2h4v-6M15 22h2a2 2 0 002-2V10M12 3v18" },
  { id: "converter", label: "Converter", icon: "M4 5h10a3 3 0 013 3v9M17 17l4-5h-8M4 5l-4 5h8M17 8h.01M4 19h10M4 15h6" }
]

const NAV_EVENT = "edash:nav"

function tabFromUrl(): TabId {
  if (typeof window === "undefined") return "basic"
  const t = new URLSearchParams(window.location.search).get("tab")
  return TABS.some((tab) => tab.id === t) ? (t as TabId) : "basic"
}

export default function Dashboard() {
  const subscribe = useCallback((cb: () => void) => {
    const onPop = () => cb()
    window.addEventListener("popstate", onPop)
    window.addEventListener(NAV_EVENT, onPop)
    return () => {
      window.removeEventListener("popstate", onPop)
      window.removeEventListener(NAV_EVENT, onPop)
    }
  }, [])

  const tab = useSyncExternalStore(subscribe, tabFromUrl, () => "basic" as TabId)

  const go = (t: TabId) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("tab", t)
      window.history.replaceState(null, "", url.toString())
      window.dispatchEvent(new CustomEvent(NAV_EVENT))
    }
  }

  const render = () => {
    switch (tab) {
      case "basic":
        return <Calculator />
      case "scientific":
        return <Scientific />
      case "finance":
        return <Financial />
      case "area":
        return <AreaCalculator />
      case "converter":
        return <UnitConverter />
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-700/40 bg-[var(--bg-0)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <Clock />
          <div className="text-[11px] text-slate-500">Calculator Suite</div>
        </div>
        <nav className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => go(t.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30"
                    : "text-slate-400 hover:bg-slate-700/30 hover:text-slate-200"
                }`}
                aria-current={tab === t.id ? "page" : undefined}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <path d={t.icon} />
                </svg>
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div key={tab} className="animate-fade-in">
          {render()}
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-slate-600 sm:px-6">
        Engineered dashboard — calculators, finance and civil tools. Installable,
        offline-ready PWA.
      </footer>
    </div>
  )
}