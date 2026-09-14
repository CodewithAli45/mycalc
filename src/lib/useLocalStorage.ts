import { useCallback, useSyncExternalStore } from "react"

const stores = new Map<string, Set<() => void>>()
const rawCache = new Map<string, string | null>()
const parsedCache = new Map<string, unknown>()

function listeners(key: string): Set<() => void> {
  let set = stores.get(key)
  if (!set) {
    set = new Set()
    stores.set(key, set)
  }
  return set
}

function readSnapshot<T>(key: string, initial: T): T {
  if (typeof window === "undefined") return initial
  const raw = window.localStorage.getItem(key)
  if (rawCache.get(key) === raw) return (parsedCache.get(key) ?? initial) as T
  rawCache.set(key, raw)
  let value: T = initial
  try {
    value = raw === null ? initial : (JSON.parse(raw) as T)
  } catch {
    value = initial
  }
  parsedCache.set(key, value)
  return value
}

export function useLocalStorage<T>(key: string, initial: T) {
  const subscribe = useCallback((cb: () => void) => {
    listeners(key).add(cb)
    return () => listeners(key).delete(cb)
  }, [key])

  const getSnapshot = useCallback(() => readSnapshot<T>(key, initial), [key, initial])
  const getServerSnapshot = useCallback(() => initial, [initial])

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      if (typeof window === "undefined") return
      const nextValue =
        typeof next === "function" ? (next as (prev: T) => T)(readSnapshot<T>(key, initial)) : next
      window.localStorage.setItem(key, JSON.stringify(nextValue))
      rawCache.delete(key)
      parsedCache.set(key, nextValue)
      listeners(key).forEach((cb) => cb())
    },
    [key, initial]
  )

  return [value, setValue] as const
}