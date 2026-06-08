import type { SessionRecord } from '../domain/types'

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080/api'

const USER_ID = 'demo-user'

export interface ApiSettings {
  demoShortTimer: boolean
  minimalMode: boolean
  reduceVisualEffects: boolean
  soundAlert: boolean
  desktopNotification: boolean
  showTimerInTitle: boolean
}

interface ApiSession {
  id: number
  taskName: string
  taskType: string
  plannedFocusMinutes: number
  plannedBreakMinutes: number
  cycleId: string | null
  cycleIndex: number | null
  totalCycles: number | null
  longBreak: boolean
  outcome: 'completed' | 'aborted'
  pauseCount: number
  startedAt: string | null
  createdAt: string
}

export interface SessionCreatePayload {
  taskName: string
  taskType: string
  plannedFocusMinutes: number
  plannedBreakMinutes: number
  cycleId: string
  cycleIndex: number
  totalCycles: number
  longBreak: boolean
  outcome: 'completed' | 'aborted'
  pauseCount: number
  startedAt: string
  endedAt: string
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Focus Orbit API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function fetchSettings(): Promise<ApiSettings> {
  return request<ApiSettings>(`/settings?userId=${encodeURIComponent(USER_ID)}`)
}

export function patchSettings(settings: Partial<ApiSettings>): Promise<ApiSettings> {
  return request<ApiSettings>(`/settings?userId=${encodeURIComponent(USER_ID)}`, {
    method: 'PATCH',
    body: JSON.stringify(settings),
  })
}

export function fetchSessions(): Promise<SessionRecord[]> {
  return request<ApiSession[]>(`/sessions?userId=${encodeURIComponent(USER_ID)}`).then((sessions) =>
    sessions.map(toSessionRecord),
  )
}

export function createSession(payload: SessionCreatePayload): Promise<SessionRecord> {
  return request<ApiSession>('/sessions', {
    method: 'POST',
    body: JSON.stringify({
      userId: USER_ID,
      ...payload,
    }),
  }).then(toSessionRecord)
}

function toSessionRecord(session: ApiSession): SessionRecord {
  const at = Date.parse(session.startedAt ?? session.createdAt)

  return {
    id: String(session.id),
    at: Number.isNaN(at) ? Date.now() : at,
    cycleId: session.cycleId ?? 'api-cycle',
    cycleIndex: session.cycleIndex ?? 1,
    totalCycles: session.totalCycles ?? 1,
    isLongBreak: session.longBreak,
    taskName: session.taskName,
    taskType: session.taskType,
    plannedFocusMin: session.plannedFocusMinutes,
    plannedBreakMin: session.plannedBreakMinutes,
    outcome: session.outcome,
    pauseCount: session.pauseCount,
    starName: `${session.taskName} Star`,
  }
}
