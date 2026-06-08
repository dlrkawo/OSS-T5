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

function recommendationReasonKo(reason?: string): string {
  if (!reason) return '최근 기록을 바탕으로 추천 루틴을 계산했습니다.'
  if (reason.startsWith('Base preset for')) return '작업 유형의 기본 루틴을 기준으로 계산했습니다.'
  if (reason === 'Custom mission preset') return '사용자 설정 미션의 기록을 기준으로 계산했습니다.'
  if (reason === 'No mission log yet, so the default rhythm is used') {
    return '아직 기록이 없어 기본 루틴을 사용합니다.'
  }
  if (reason === 'Recent completion rate is low, so focus is shortened') {
    return '최근 완료율이 낮아 집중 시간을 줄였습니다.'
  }
  if (reason === 'Recent pause count is high, so break time is increased') {
    return '최근 일시정지가 많아 휴식 시간을 늘렸습니다.'
  }
  if (reason === 'Recent sessions are stable, so focus is extended slightly') {
    return '최근 세션이 안정적이라 집중 시간을 조금 늘렸습니다.'
  }
  if (reason === 'Recent pattern is balanced, so the base rhythm is kept') {
    return '최근 패턴이 안정적이라 현재 루틴을 유지합니다.'
  }
  return reason
}

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
        <p className="eyebrow">미션 설정</p>
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
                <span>사용자 설정 미션</span>
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
            <span>{isCreating ? '새 미션' : '선택한 미션'}</span>
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
                  <span>추천 루틴</span>
                  <strong>
                    {recommendation
                      ? `${recommendation.focusMinutes}분 집중 / ${recommendation.breakMinutes}분 휴식`
                      : recommendationError
                        ? '추천을 불러올 수 없음'
                        : '기록 확인 중'}
                  </strong>
                </div>
                <button
                  className="secondary-button recommendation-action"
                  disabled={!recommendation || isRecommendationApplied}
                  onClick={handleApplyRecommendation}
                  type="button"
                >
                  {isRecommendationApplied ? '적용됨' : '적용'}
                </button>
              </div>

              {recommendation ? (
                <>
                  <div className="recommendation-metrics">
                    <div>
                      <span>집중 점수</span>
                      <strong>{recommendation.focusScore}</strong>
                    </div>
                    <div>
                      <span>최근 기록</span>
                      <strong>{recommendation.recentSessionCount}</strong>
                    </div>
                    <div>
                      <span>완료율</span>
                      <strong>{Math.round(recommendation.completionRate * 100)}%</strong>
                    </div>
                  </div>
                  <p className="recommendation-reason">
                    {recommendationReasonKo(recommendation.reasons.at(-1))}
                  </p>
                </>
              ) : (
                <p className="recommendation-reason">
                  {recommendationError
                    ? '추천 서버에 연결할 수 없어 저장된 루틴을 그대로 사용합니다.'
                    : '미션을 선택하면 최근 기록을 바탕으로 추천을 불러옵니다.'}
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
