import { createContext, useContext } from 'react'

// Shared "adaptive brain" of the app: any screen can read the sensors' state
// (errors, contrast mode, logs) and report events to it.
export const AdaptiveContext = createContext(null)

// Small helper hook so screens write `useAdaptive()` instead of useContext(...)
export function useAdaptive() {
  const ctx = useContext(AdaptiveContext)
  if (!ctx) {
    throw new Error('useAdaptive must be used inside <AdaptiveProvider>')
  }
  return ctx
}
