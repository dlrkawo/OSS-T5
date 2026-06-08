export type TaskType = 'coding' | 'memorization' | 'writing' | 'exam'

export type SessionOutcome = 'completed' | 'aborted'

export interface ActiveMission {
  cycleId: string
  taskName: string
  taskType: TaskType
  plannedFocusMin: number
  plannedBreakMin: number
  totalCycles: number
  currentCycle: number
}

export interface SessionRecord {
  id: string
  at: number
  cycleId: string
  cycleIndex: number
  totalCycles: number
  taskName: string
  taskType: TaskType
  plannedFocusMin: number
  plannedBreakMin: number
  outcome: SessionOutcome
  pauseCount: number
  starName: string
}

export interface PersistedState {
  version: 1
  sessions: SessionRecord[]
  totalCompletedFocusMinutes: number
  demoShortSessions: boolean
}
