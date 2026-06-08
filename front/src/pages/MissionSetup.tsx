import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { recommendRoutine } from '../domain/adaptation'
import { getTaskMeta, TASK_TYPES } from '../domain/taskTypes'
import type { TaskType } from '../domain/types'
import { useAppState } from '../state/AppStateContext'

export function MissionSetup() {
  const navigate = useNavigate()
  const { sessions, startMission } = useAppState()
  const [taskName, setTaskName] = useState('')
  const [taskType, setTaskType] = useState<TaskType>('coding')
  const recommendation = useMemo(
    () => recommendRoutine(taskType, sessions),
    [sessions, taskType],
  )
  const [focusMin, setFocusMin] = useState(recommendation.focusMin)
  const [breakMin, setBreakMin] = useState(recommendation.breakMin)
  const [totalCycles, setTotalCycles] = useState(4)

  const selectedMeta = getTaskMeta(taskType)

  const handleTaskTypeChange = (nextTaskType: TaskType) => {
    const nextRecommendation = recommendRoutine(nextTaskType, sessions)
    setTaskType(nextTaskType)
    setFocusMin(nextRecommendation.focusMin)
    setBreakMin(nextRecommendation.breakMin)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    startMission({
      cycleId: crypto.randomUUID(),
      taskName: taskName.trim() || `${selectedMeta.labelKo} Mission`,
      taskType,
      plannedFocusMin: focusMin,
      plannedBreakMin: breakMin,
      totalCycles,
      currentCycle: 1,
    })
    navigate('/timer')
  }

  return (
    <section className="page setup-page">
      <header className="page-header">
        <p className="eyebrow">Mission Setup</p>
        <h1>작업을 하나의 별 미션으로 시작합니다.</h1>
        <p>
          작업 유형과 이전 Mission Log를 기준으로 집중/휴식 루틴을 추천하고,
          완료된 세션은 개인 우주 지도에 기록됩니다.
        </p>
      </header>

      <form className="setup-layout" onSubmit={handleSubmit}>
        <div className="setup-card">
          <div className="section-heading">
            <span>01</span>
            <div>
              <h2>작업 유형</h2>
              <p>선택한 유형에 따라 기본 루틴과 우주 미션 성격이 달라집니다.</p>
            </div>
          </div>

          <div className="task-grid">
            {TASK_TYPES.map((task) => (
              <button
                className={`task-option${task.type === taskType ? ' selected' : ''}`}
                key={task.type}
                onClick={() => handleTaskTypeChange(task.type)}
                type="button"
              >
                <strong>{task.labelKo}</strong>
                <span>{task.missionLabel}</span>
                <small>
                  {task.defaultFocusMin}분 집중 / {task.defaultBreakMin}분 휴식
                </small>
              </button>
            ))}
          </div>
        </div>

        <div className="setup-card">
          <div className="section-heading">
            <span>02</span>
            <div>
              <h2>미션 설정</h2>
              <p>추천값을 그대로 쓰거나 오늘의 컨디션에 맞게 조정합니다.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="field wide">
              <span>작업 이름</span>
              <input
                value={taskName}
                onChange={(event) => setTaskName(event.target.value)}
                placeholder="예: React 과제"
              />
            </label>

            <label className="field">
              <span>집중 시간</span>
              <input
                min={5}
                max={90}
                onChange={(event) => setFocusMin(Number(event.target.value))}
                type="number"
                value={focusMin}
              />
            </label>

            <label className="field">
              <span>휴식 시간</span>
              <input
                min={3}
                max={30}
                onChange={(event) => setBreakMin(Number(event.target.value))}
                type="number"
                value={breakMin}
              />
            </label>

            <label className="field">
              <span>목표 Orbit</span>
              <input
                min={1}
                max={8}
                onChange={(event) => setTotalCycles(Number(event.target.value))}
                type="number"
                value={totalCycles}
              />
            </label>
          </div>

          <div className="mission-preview">
            <span>{selectedMeta.missionLabel}</span>
            <strong>
              {focusMin}분 집중, {breakMin}분 휴식, 총 {totalCycles}회 반복
            </strong>
            <p>
              완료 시 {taskName.trim() || selectedMeta.labelKo} Star가 Mission Log에
              저장됩니다.
            </p>
          </div>

          <button className="primary-button" type="submit">
            미션 시작
          </button>
        </div>
      </form>
    </section>
  )
}
