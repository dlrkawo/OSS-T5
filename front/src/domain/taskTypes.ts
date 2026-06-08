import type { TaskType } from './types'

export interface TaskTypeMeta {
  type: TaskType
  labelKo: string
  missionLabel: string
  defaultFocusMin: number
  defaultBreakMin: number
}

export const TASK_TYPES: TaskTypeMeta[] = []

const byType = Object.fromEntries(TASK_TYPES.map((item) => [item.type, item])) as Record<
  TaskType,
  TaskTypeMeta
>

export function getTaskMeta(type: TaskType): TaskTypeMeta {
  return (
    byType[type] ?? {
      type,
      labelKo: '사용자 설정',
      missionLabel: 'Custom Mission',
      defaultFocusMin: 25,
      defaultBreakMin: 5,
    }
  )
}

export function getDefaultRoutine(taskType: TaskType) {
  const meta = getTaskMeta(taskType)
  return { focusMin: meta.defaultFocusMin, breakMin: meta.defaultBreakMin }
}
