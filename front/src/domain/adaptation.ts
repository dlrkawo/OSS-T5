import type { SessionRecord, TaskType } from './types'
import { getDefaultRoutine } from './taskTypes'

export function recommendRoutine(
  taskType: TaskType,
  sessions: SessionRecord[],
): { focusMin: number; breakMin: number } {
  const base = getDefaultRoutine(taskType)
  const recent = sessions
    .filter((session) => session.taskType === taskType)
    .sort((a, b) => b.at - a.at)
    .slice(0, 5)

  if (recent.length < 2) return base

  const completed = recent.filter((session) => session.outcome === 'completed').length
  const completionRate = completed / recent.length
  const averagePause =
    recent.reduce((sum, session) => sum + session.pauseCount, 0) / recent.length
  const abortedOften = recent.filter((session) => session.outcome === 'aborted').length >= 2

  if (completionRate >= 0.6 && averagePause <= 2 && !abortedOften) {
    return base
  }

  const focusMin = Math.max(10, base.focusMin - 5)
  const breakRatio = base.breakMin / base.focusMin
  return {
    focusMin,
    breakMin: Math.max(5, Math.round(focusMin * breakRatio)),
  }
}
