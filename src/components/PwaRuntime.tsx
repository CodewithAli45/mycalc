"use client"

import { useEffect, useState, useCallback, useSyncExternalStore } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const subscribeOnline = (cb: () => void) => {
  window.addEventListener("online", cb)
  window.addEventListener("offline", cb)
  return () => {
    window.removeEventListener("online", cb)
    window.removeEventListener("offline", cb)
  }
}

const getOnlineSnapshot = () => navigator.onLine
const getOnlineServerSnapshot = () => true

export default function PwaRuntime() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const online = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getOnlineServerSnapshot
  )

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }
  }, [])

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstallPrompt(null)
      setInstalled(true)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === "accepted") {
      setInstallPrompt(null)
      setInstalled(true)
    }
  }, [installPrompt])

  if (online === null) return null

  if (!installPrompt) {
    return (
      <div
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          online
            ? "bg-emerald-500/10 text-emerald-300"
            : "bg-amber-500/20 text-amber-200"
        }`}
        role="status"
      >
        <span
          className={`h-2 w-2 rounded-full ${online ? "bg-emerald-400" : "bg-amber-400"}`}
        />
        <span className="hidden sm:inline">{online ? "Online" : "Offline"}</span>
        {installed && <span className="ml-1 hidden sm:inline">· Installed</span>}
      </div>
    )
  }

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-4 right-4 z-50 animate-fade-in rounded-full border border-sky-400/40 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-200 backdrop-blur-md transition hover:bg-sky-500/30"
    >
      Install app
    </button>
  )
}