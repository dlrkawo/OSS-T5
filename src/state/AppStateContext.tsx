import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ActiveMission, PersistedState, SessionRecord } from '../domain/types'
import { clearPersisted, loadPersisted, savePersisted, STORAGE_KEY } from './storage'

interface AppStateValue {
  sessions: SessionRecord[]
  totalCompletedFocusMinutes: number
  demoShortSessions: boolean
  activeMission: ActiveMission | null
  setDemoShortSessions: (value: boolean) => void
  startMission: (mission: ActiveMission) => void
  updateActiveMission: (mission: ActiveMission | null) => void
  recordCompletedFocus: (mission: ActiveMission, pauseCount: number) => void
  recordAbortedFocus: (mission: ActiveMission, pauseCount: number) => void
  resetAll: () => void
}

const AppStateCtx = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<PersistedState>(() => loadPersisted())
  const [activeMission, setActiveMission] = useState<ActiveMission | null>(null)

  useEffect(() => {
    savePersisted(persisted)
  }, [persisted])

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

  const recordSession = useCallback(
    (mission: ActiveMission, pauseCount: number, outcome: SessionRecord['outcome']) => {
      const record: SessionRecord = {
        id: crypto.randomUUID(),
        at: Date.now(),
        cycleId: mission.cycleId,
        cycleIndex: mission.currentCycle,
        totalCycles: mission.totalCycles,
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
    },
    [],
  )

  const recordCompletedFocus = useCallback(
    (mission: ActiveMission, pauseCount: number) => {
      recordSession(mission, pauseCount, 'completed')
    },
    [recordSession],
  )

  const recordAbortedFocus = useCallback(
    (mission: ActiveMission, pauseCount: number) => {
      recordSession(mission, pauseCount, 'aborted')
    },
    [recordSession],
  )

  const setDemoShortSessions = useCallback((value: boolean) => {
    setPersisted((previous) => ({ ...previous, demoShortSessions: value }))
  }, [])

  const resetAll = useCallback(() => {
    clearPersisted()
    setPersisted(loadPersisted())
    setActiveMission(null)
  }, [])

  const value = useMemo<AppStateValue>(
    () => ({
      sessions: persisted.sessions,
      totalCompletedFocusMinutes: persisted.totalCompletedFocusMinutes,
      demoShortSessions: persisted.demoShortSessions,
      activeMission,
      setDemoShortSessions,
      startMission,
      updateActiveMission,
      recordCompletedFocus,
      recordAbortedFocus,
      resetAll,
    }),
    [
      activeMission,
      persisted.demoShortSessions,
      persisted.sessions,
      persisted.totalCompletedFocusMinutes,
      recordAbortedFocus,
      recordCompletedFocus,
      resetAll,
      setDemoShortSessions,
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
