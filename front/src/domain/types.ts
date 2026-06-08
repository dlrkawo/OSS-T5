export type TaskType = string

export type SessionOutcome = 'completed' | 'aborted'

export interface MissionPreset {
  id: string
  name: string
  focusMin: number
  breakMin: number
  createdAt: number
}

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
  isLongBreak: boolean
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
  missionPresets: MissionPreset[]
  sessions: SessionRecord[]
  totalCompletedFocusMinutes: number
  demoShortSessions: boolean
  desktopNotification: boolean
  minimalMode: boolean
  reduceVisualEffects: boolean
  showBrowserTitleTimer: boolean
  soundAlert: boolean
}
