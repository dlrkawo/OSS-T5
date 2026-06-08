import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MissionPreset } from '../domain/types'
import {
  fetchRecommendation,
  type ApiRecommendation,
} from '../services/api'
import { useAppState } from '../state/AppStateContext'

const DEFAULT_FOCUS_MIN = 25
const DEFAULT_BREAK_MIN = 5

export function MissionSetup() {
  const navigate = useNavigate()
  const { addMissionPreset, missionPresets, startMission } = useAppState()
  const [selectedPreset, setSelectedPreset] = useState<MissionPreset | null>(null)
  const [isCreating, setIsCreating] = useState(missionPresets.length === 0)
  const [taskName, setTaskName] = useState('')
  const [focusMin, setFocusMin] = useState(DEFAULT_FOCUS_MIN)
  const [breakMin, setBreakMin] = useState(DEFAULT_BREAK_MIN)
  const [totalCycles, setTotalCycles] = useState(4)
  const [recommendation, setRecommendation] = useState<ApiRecommendation | null>(null)
  const [recommendationError, setRecommendationError] = useState(false)

  const selectedTaskType = selectedPreset?.id
  const isRecommendationApplied =
    recommendation !== null &&
    focusMin === recommendation.focusMinutes &&
    breakMin === recommendation.breakMinutes

  useEffect(() => {
    if (!selectedTaskType || isCreating) {
      return
    }

    let cancelled = false

    void fetchRecommendation(selectedTaskType)
      .then((nextRecommendation) => {
        if (!cancelled) setRecommendation(nextRecommendation)
      })
      .catch(() => {
        if (cancelled) return
        setRecommendation(null)
        setRecommendationError(true)
      })

    return () => {
      cancelled = true
    }
  }, [isCreating, selectedTaskType])

  const openCreateForm = () => {
    setSelectedPreset(null)
    setIsCreating(true)
    setTaskName('')
    setFocusMin(DEFAULT_FOCUS_MIN)
    setBreakMin(DEFAULT_BREAK_MIN)
    setRecommendation(null)
    setRecommendationError(false)
  }

  const selectPreset = (preset: MissionPreset) => {
    setSelectedPreset(preset)
    setIsCreating(false)
    setTaskName(preset.name)
    setFocusMin(preset.focusMin)
    setBreakMin(preset.breakMin)
    setRecommendation(null)
    setRecommendationError(false)
  }

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = taskName.trim()
    if (!name) return

    const preset = addMissionPreset({
      name,
      focusMin,
      breakMin,
    })

    selectPreset(preset)
  }

  const handleStartMission = () => {
    if (!selectedPreset) return

    startMission({
      cycleId: crypto.randomUUID(),
      taskName: selectedPreset.name,
      taskType: selectedPreset.id,
      plannedFocusMin: focusMin,
      plannedBreakMin: breakMin,
      totalCycles,
      currentCycle: 1,
    })
    navigate('/timer')
  }

  const handleApplyRecommendation = () => {
    if (!recommendation) return
    setFocusMin(recommendation.focusMinutes)
    setBreakMin(recommendation.breakMinutes)
  }

  return (
    <section className="page setup-page">
      <header className="page-header">
        <p className="eyebrow">Mission Setup</p>
        <h1>저장한 작업을 선택해 집중 미션을 시작합니다.</h1>
        <p>
          작업을 직접 추가하고 집중/휴식 시간을 저장한 뒤, 저장된 작업을 선택해
          반복 Orbit 세션을 시작합니다.
        </p>
      </header>

      <div className="setup-layout">
        <div className="setup-card">
          <div className="section-heading task-heading">
            <div className="section-heading-copy">
              <span>01</span>
              <div>
                <h2>작업 유형</h2>
                <p>자주 쓰는 작업과 시간을 저장합니다.</p>
              </div>
            </div>
            <button
              className={`secondary-button add-task-action${isCreating ? ' active' : ''}`}
              onClick={openCreateForm}
              type="button"
            >
              + 추가
            </button>
          </div>

          <div className="task-grid">
            {missionPresets.map((preset) => (
              <button
                className={`task-option${selectedPreset?.id === preset.id ? ' selected' : ''}`}
                key={preset.id}
                onClick={() => selectPreset(preset)}
                type="button"
              >
                <strong>{preset.name}</strong>
                <span>Custom Mission</span>
                <small>
                  {preset.focusMin}분 집중 / {preset.breakMin}분 휴식
                </small>
              </button>
            ))}
          </div>
        </div>

        <form className="setup-card" onSubmit={handleSave}>
          <div className="section-heading">
            <span>02</span>
            <div>
              <h2>미션 설정</h2>
              <p>
                {isCreating
                  ? '작업 이름과 시간을 설정한 뒤 저장합니다.'
                  : '저장된 작업을 확인하고 목표 Orbit 수를 정합니다.'}
              </p>
            </div>
          </div>

          <div className="form-grid">
            <label className="field wide">
              <span>작업 이름</span>
              <input
                disabled={!isCreating}
                value={taskName}
                onChange={(event) => setTaskName(event.target.value)}
                placeholder="예: React 과제"
              />
            </label>

            <label className="field">
              <span>집중 시간</span>
              <input
                disabled={!isCreating}
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
                disabled={!isCreating}
                min={3}
                max={30}
                onChange={(event) => setBreakMin(Number(event.target.value))}
                type="number"
                value={breakMin}
              />
            </label>

            {!isCreating && (
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
            )}
          </div>

          <div className="mission-preview">
            <span>{isCreating ? 'New Custom Mission' : 'Selected Mission'}</span>
            <strong>
              {taskName.trim() || '새 작업'} · {focusMin}분 집중 / {breakMin}분 휴식
            </strong>
            <p>
              {isCreating
                ? '저장 후 왼쪽 작업 목록에서 선택하면 미션을 시작할 수 있습니다.'
                : `총 ${totalCycles}회 Orbit으로 반복 진행됩니다.`}
            </p>
          </div>

          {!isCreating && (
            <div className="recommendation-panel">
              <div className="recommendation-header">
                <div>
                  <span>Adaptive routine</span>
                  <strong>
                    {recommendation
                      ? `${recommendation.focusMinutes} min focus / ${recommendation.breakMinutes} min break`
                      : recommendationError
                        ? 'Mission Log unavailable'
                        : 'Reading Mission Log'}
                  </strong>
                </div>
                <button
                  className="secondary-button recommendation-action"
                  disabled={!recommendation || isRecommendationApplied}
                  onClick={handleApplyRecommendation}
                  type="button"
                >
                  {isRecommendationApplied ? 'Applied' : 'Apply'}
                </button>
              </div>

              {recommendation ? (
                <>
                  <div className="recommendation-metrics">
                    <div>
                      <span>Score</span>
                      <strong>{recommendation.focusScore}</strong>
                    </div>
                    <div>
                      <span>Recent</span>
                      <strong>{recommendation.recentSessionCount}</strong>
                    </div>
                    <div>
                      <span>Complete</span>
                      <strong>{Math.round(recommendation.completionRate * 100)}%</strong>
                    </div>
                  </div>
                  <p className="recommendation-reason">{recommendation.reasons.at(-1)}</p>
                </>
              ) : (
                <p className="recommendation-reason">
                  {recommendationError
                    ? 'Backend recommendation is offline, so the saved rhythm stays selected.'
                    : 'Select a mission to load recent-session guidance.'}
                </p>
              )}
            </div>
          )}

          {isCreating ? (
            <button className="primary-button" disabled={!taskName.trim()} type="submit">
              저장
            </button>
          ) : (
            <button className="primary-button" onClick={handleStartMission} type="button">
              미션 시작
            </button>
          )}
        </form>
      </div>
    </section>
  )
}
