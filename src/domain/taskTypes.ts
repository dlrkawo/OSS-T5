import type { TaskType } from './types'

export interface TaskTypeMeta {
  type: TaskType
  labelKo: string
  missionLabel: string
  defaultFocusMin: number
  defaultBreakMin: number
}

export const TASK_TYPES: TaskTypeMeta[] = [
  {
    type: 'coding',
    labelKo: '코딩',
    missionLabel: 'Deep Space Mission',
    defaultFocusMin: 40,
    defaultBreakMin: 10,
  },
  {
    type: 'memorization',
    labelKo: '암기',
    missionLabel: 'Short Orbit Mission',
    defaultFocusMin: 20,
    defaultBreakMin: 5,
  },
  {
    type: 'writing',
    labelKo: '글쓰기',
    missionLabel: 'Creative Mission',
    defaultFocusMin: 30,
    defaultBreakMin: 7,
  },
  {
    type: 'exam',
    labelKo: '시험공부',
    missionLabel: 'Standard Mission',
    defaultFocusMin: 25,
    defaultBreakMin: 5,
  },
]

const byType = Object.fromEntries(TASK_TYPES.map((item) => [item.type, item])) as Record<
  TaskType,
  TaskTypeMeta
>

export function getTaskMeta(type: TaskType): TaskTypeMeta {
  return byType[type]
}

export function getDefaultRoutine(taskType: TaskType) {
  const meta = getTaskMeta(taskType)
  return { focusMin: meta.defaultFocusMin, breakMin: meta.defaultBreakMin }
}
