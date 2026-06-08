import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  ActiveMission,
  MissionPreset,
  PersistedState,
  SessionRecord,
} from '../domain/types'
import {
  createSession,
  fetchSessions,
  fetchSettings,
  patchSettings,
  type ApiSettings,
} from '../services/api'
import { clearPersisted, loadPersisted, savePersisted, STORAGE_KEY } from './storage'

interface AppStateValue {
  sessions: SessionRecord[]
  missionPresets: MissionPreset[]
  totalCompletedFocusMinutes: number
  demoShortSessions: boolean
  desktopNotification: boolean
  minimalMode: boolean
  reduceVisualEffects: boolean
  showBrowserTitleTimer: boolean
  soundAlert: boolean
  activeMission: ActiveMission | null
  addMissionPreset: (preset: Omit<MissionPreset, 'id' | 'createdAt'>) => MissionPreset
  setDesktopNotification: (value: boolean) => void
  setDemoShortSessions: (value: boolean) => void
  setMinimalMode: (value: boolean) => void
  setReduceVisualEffects: (value: boolean) => void
  setShowBrowserTitleTimer: (value: boolean) => void
  setSoundAlert: (value: boolean) => void
  startMission: (mission: ActiveMission) => void
  updateActiveMission: (mission: ActiveMission | null) => void
  recordCompletedFocus: (
    mission: ActiveMission,
    pauseCount: number,
    isLongBreak: boolean,
  ) => void
  recordAbortedFocus: (mission: ActiveMission, pauseCount: number) => void
  resetAll: () => void
}

const AppStateCtx = createContext<AppStateValue | null>(null)

function totalCompletedMinutes(sessions: SessionRecord[]) {
  return sessions
    .filter((session) => session.outcome === 'completed')
    .reduce((sum, session) => sum + session.plannedFocusMin, 0)
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<PersistedState>(() => loadPersisted())
  const [activeMission, setActiveMission] = useState<ActiveMission | null>(null)

  useEffect(() => {
    savePersisted(persisted)
  }, [persisted])

  useEffect(() => {
    let cancelled = false

    void fetchSettings()
      .then((settings) => {
        if (cancelled) return
        setPersisted((previous) => ({
          ...previous,
          demoShortSessions: settings.demoShortTimer,
          desktopNotification: true,
          minimalMode: settings.minimalMode,
          reduceVisualEffects: settings.reduceVisualEffects,
          showBrowserTitleTimer: true,
          soundAlert: true,
        }))
        void patchSettings({
          desktopNotification: true,
          showTimerInTitle: true,
          soundAlert: true,
        }).catch(() => undefined)
      })
      .catch(() => undefined)

    void fetchSessions()
      .then((sessions) => {
        if (cancelled) return
        setPersisted((previous) => ({
          ...previous,
          sessions,
          totalCompletedFocusMinutes: totalCompletedMinutes(sessions),
        }))
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return
      try {
        const next = JSON.parse(event.newValue) as PersistedState
        if (next.version === 1) setPersisted(next)
      } catch {
        // Ignore invalid external localStorage writes.
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const startMission = useCallback((mission: ActiveMission) => {
    setActiveMission(mission)
  }, [])

  const updateActiveMission = useCallback((mission: ActiveMission | null) => {
    setActiveMission(mission)
  }, [])

  const addMissionPreset = useCallback(
    (preset: Omit<MissionPreset, 'id' | 'createdAt'>) => {
      const nextPreset: MissionPreset = {
        id: crypto.randomUUID(),
        name: preset.name.trim(),
        focusMin: preset.focusMin,
        breakMin: preset.breakMin,
        createdAt: Date.now(),
      }

      setPersisted((previous) => ({
        ...previous,
        missionPresets: [nextPreset, ...previous.missionPresets],
      }))

      return nextPreset
    },
    [],
  )

  const syncSettings = useCallback((settings: Partial<ApiSettings>) => {
    void patchSettings(settings).catch(() => undefined)
  }, [])

  const recordSession = useCallback(
    (
      mission: ActiveMission,
      pauseCount: number,
      outcome: SessionRecord['outcome'],
      isLongBreak: boolean,
    ) => {
      const record: SessionRecord = {
        id: crypto.randomUUID(),
        at: Date.now(),
        cycleId: mission.cycleId,
        cycleIndex: mission.currentCycle,
        totalCycles: mission.totalCycles,
        isLongBreak,
        taskName: mission.taskName,
        taskType: mission.taskType,
        plannedFocusMin: mission.plannedFocusMin,
        plannedBreakMin: mission.plannedBreakMin,
        outcome,
        pauseCount,
        starName: `${mission.taskName} Star`,
      }

      setPersisted((previous) => ({
        ...previous,
        sessions: [record, ...previous.sessions],
        totalCompletedFocusMinutes:
          outcome === 'completed'
            ? previous.totalCompletedFocusMinutes + mission.plannedFocusMin
            : previous.totalCompletedFocusMinutes,
      }))

      const endedAt = new Date(record.at).toISOString()
      const startedAt = new Date(record.at - mission.plannedFocusMin * 60_000).toISOString()
      void createSession({
        taskName: mission.taskName,
        taskType: mission.taskType,
        plannedFocusMinutes: mission.plannedFocusMin,
        plannedBreakMinutes: mission.plannedBreakMin,
        cycleId: mission.cycleId,
        cycleIndex: mission.currentCycle,
        totalCycles: mission.totalCycles,
        longBreak: isLongBreak,
        outcome,
        pauseCount,
        startedAt,
        endedAt,
      }).catch(() => undefined)
    },
    [],
  )

  const recordCompletedFocus = useCallback(
    (mission: ActiveMission, pauseCount: number, isLongBreak: boolean) => {
      recordSession(mission, pauseCount, 'completed', isLongBreak)
    },
    [recordSession],
  )

  const recordAbortedFocus = useCallback(
    (mission: ActiveMission, pauseCount: number) => {
      recordSession(mission, pauseCount, 'aborted', false)
    },
    [recordSession],
  )

  const setDesktopNotification = useCallback(() => {
    setPersisted((previous) => ({ ...previous, desktopNotification: true }))
    syncSettings({ desktopNotification: true })
  }, [syncSettings])

  const setDemoShortSessions = useCallback((value: boolean) => {
    setPersisted((previous) => ({ ...previous, demoShortSessions: value }))
    syncSettings({ demoShortTimer: value })
  }, [syncSettings])

  const setMinimalMode = useCallback((value: boolean) => {
    setPersisted((previous) => ({ ...previous, minimalMode: value }))
    syncSettings({ minimalMode: value })
  }, [syncSettings])

  const setReduceVisualEffects = useCallback((value: boolean) => {
    setPersisted((previous) => ({ ...previous, reduceVisualEffects: value }))
    syncSettings({ reduceVisualEffects: value })
  }, [syncSettings])

  const setShowBrowserTitleTimer = useCallback(() => {
    setPersisted((previous) => ({ ...previous, showBrowserTitleTimer: true }))
    syncSettings({ showTimerInTitle: true })
  }, [syncSettings])

  const setSoundAlert = useCallback(() => {
    setPersisted((previous) => ({ ...previous, soundAlert: true }))
    syncSettings({ soundAlert: true })
  }, [syncSettings])

  const resetAll = useCallback(() => {
    clearPersisted()
    setPersisted(loadPersisted())
    setActiveMission(null)
  }, [])

  const value = useMemo<AppStateValue>(
    () => ({
      sessions: persisted.sessions,
      missionPresets: persisted.missionPresets,
      totalCompletedFocusMinutes: persisted.totalCompletedFocusMinutes,
      demoShortSessions: persisted.demoShortSessions,
      desktopNotification: true,
      minimalMode: persisted.minimalMode,
      reduceVisualEffects: persisted.reduceVisualEffects,
      showBrowserTitleTimer: true,
      soundAlert: true,
      activeMission,
      addMissionPreset,
      setDesktopNotification,
      setDemoShortSessions,
      setMinimalMode,
      setReduceVisualEffects,
      setShowBrowserTitleTimer,
      setSoundAlert,
      startMission,
      updateActiveMission,
      recordCompletedFocus,
      recordAbortedFocus,
      resetAll,
    }),
    [
      activeMission,
      addMissionPreset,
      persisted.demoShortSessions,
      persisted.missionPresets,
      persisted.minimalMode,
      persisted.reduceVisualEffects,
      persisted.sessions,
      persisted.totalCompletedFocusMinutes,
      recordAbortedFocus,
      recordCompletedFocus,
      resetAll,
      setDesktopNotification,
      setDemoShortSessions,
      setMinimalMode,
      setReduceVisualEffects,
      setShowBrowserTitleTimer,
      setSoundAlert,
      startMission,
      updateActiveMission,
    ],
  )

  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppState(): AppStateValue {
  const context = useContext(AppStateCtx)
  if (!context) throw new Error('useAppState must be used inside AppStateProvider')
  return context
}
