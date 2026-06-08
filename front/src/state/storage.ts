import type { PersistedState, SessionRecord } from '../domain/types'

export const STORAGE_KEY = 'focus-orbit-state-v1'

const emptyState = (): PersistedState => ({
  version: 1,
  sessions: [],
  totalCompletedFocusMinutes: 0,
  demoShortSessions: false,
})

export function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    if (parsed.version !== 1) return emptyState()
    return {
      version: 1,
      sessions: Array.isArray(parsed.sessions)
        ? (parsed.sessions as SessionRecord[])
        : [],
      totalCompletedFocusMinutes:
        typeof parsed.totalCompletedFocusMinutes === 'number'
          ? parsed.totalCompletedFocusMinutes
          : 0,
      demoShortSessions: Boolean(parsed.demoShortSessions),
    }
  } catch {
    return emptyState()
  }
}

export function savePersisted(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearPersisted(): void {
  localStorage.removeItem(STORAGE_KEY)
}
