import type { MissionPreset, PersistedState, SessionRecord } from '../domain/types'

export const STORAGE_KEY = 'focus-orbit-state-v1'

const emptyState = (): PersistedState => ({
  version: 1,
  missionPresets: [],
  sessions: [],
  totalCompletedFocusMinutes: 0,
  demoShortSessions: false,
  desktopNotification: true,
  minimalMode: false,
  reduceVisualEffects: false,
  showBrowserTitleTimer: true,
  soundAlert: true,
})

function normalizeMissionPresets(presets: unknown): MissionPreset[] {
  if (!Array.isArray(presets)) return []

  return (presets as Partial<MissionPreset>[])
    .filter((preset) => typeof preset.name === 'string' && preset.name.trim().length > 0)
    .map((preset) => ({
      id: typeof preset.id === 'string' ? preset.id : crypto.randomUUID(),
      name: preset.name?.trim() || 'Mission',
      focusMin: typeof preset.focusMin === 'number' ? preset.focusMin : 25,
      breakMin: typeof preset.breakMin === 'number' ? preset.breakMin : 5,
      createdAt: typeof preset.createdAt === 'number' ? preset.createdAt : Date.now(),
    }))
}

function normalizeSessions(sessions: unknown): SessionRecord[] {
  if (!Array.isArray(sessions)) return []

  return (sessions as Partial<SessionRecord>[]).filter(Boolean).map((session) => ({
    id: typeof session.id === 'string' ? session.id : crypto.randomUUID(),
    at: typeof session.at === 'number' ? session.at : Date.now(),
    cycleId: typeof session.cycleId === 'string' ? session.cycleId : 'legacy-cycle',
    cycleIndex: typeof session.cycleIndex === 'number' ? session.cycleIndex : 1,
    totalCycles: typeof session.totalCycles === 'number' ? session.totalCycles : 1,
    isLongBreak: Boolean(session.isLongBreak),
    taskName: typeof session.taskName === 'string' ? session.taskName : 'Mission',
    taskType: session.taskType ?? 'coding',
    plannedFocusMin:
      typeof session.plannedFocusMin === 'number' ? session.plannedFocusMin : 25,
    plannedBreakMin:
      typeof session.plannedBreakMin === 'number' ? session.plannedBreakMin : 5,
    outcome: session.outcome === 'aborted' ? 'aborted' : 'completed',
    pauseCount: typeof session.pauseCount === 'number' ? session.pauseCount : 0,
    starName: typeof session.starName === 'string' ? session.starName : 'Mission Star',
  }))
}

export function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    if (parsed.version !== 1) return emptyState()
    return {
      version: 1,
      missionPresets: normalizeMissionPresets(parsed.missionPresets),
      sessions: normalizeSessions(parsed.sessions),
      totalCompletedFocusMinutes:
        typeof parsed.totalCompletedFocusMinutes === 'number'
          ? parsed.totalCompletedFocusMinutes
          : 0,
      demoShortSessions: Boolean(parsed.demoShortSessions),
      desktopNotification: true,
      minimalMode: Boolean(parsed.minimalMode),
      reduceVisualEffects: Boolean(parsed.reduceVisualEffects),
      showBrowserTitleTimer: true,
      soundAlert: true,
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
