import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MissionPreset, SessionRecord } from '../domain/types'
import {
  fetchRecommendation,
  type ApiRecommendation,
} from '../services/api'
import { useAppState } from '../state/AppStateContext'

const DEFAULT_FOCUS_MIN = 25
const DEFAULT_BREAK_MIN = 5
const LOCAL_RECOMMENDATION_USER = 'local-mission-log'

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

function buildLocalRecommendation(
  preset: MissionPreset,
  sessions: SessionRecord[],
): ApiRecommendation {
  const recent = sessions
    .filter((session) => session.taskType === preset.id)
    .sort((a, b) => b.at - a.at)
    .slice(0, 5)
  const completedCount = recent.filter((session) => session.outcome === 'completed').length
  const completionRate = recent.length === 0 ? 0 : completedCount / recent.length
  const averagePauseCount =
    recent.length === 0
      ? 0
      : recent.reduce((sum, session) => sum + session.pauseCount, 0) / recent.length
  const reasons = ['Custom mission preset']
  let focusMinutes = preset.focusMin
  let breakMinutes = preset.breakMin

  if (recent.length === 0) {
    reasons.push('No mission log yet, so the default rhythm is used')
  } else if (completionRate < 0.6) {
    focusMinutes = Math.max(15, preset.focusMin - 5)
    breakMinutes = Math.min(30, preset.breakMin + 5)
    reasons.push('Recent completion rate is low, so focus is shortened')
  } else if (averagePauseCount >= 3) {
    focusMinutes = Math.max(15, preset.focusMin - 5)
    breakMinutes = Math.min(30, preset.breakMin + 5)
    reasons.push('Recent pause count is high, so break time is increased')
  } else if (completionRate >= 0.8 && averagePauseCount <= 1 && recent.length >= 3) {
    focusMinutes = Math.min(90, preset.focusMin + 5)
    reasons.push('Recent sessions are stable, so focus is extended slightly')
  } else {
    reasons.push('Recent pattern is balanced, so the base rhythm is kept')
  }

  const pausePenalty = Math.min(30, averagePauseCount * 8)
  const focusScore =
    recent.length === 0 ? 75 : Math.max(0, Math.min(100, Math.round(50 + completionRate * 50 - pausePenalty)))

  return {
    userId: LOCAL_RECOMMENDATION_USER,
    taskType: preset.id,
    focusMinutes,
    breakMinutes,
    focusScore,
    recentSessionCount: recent.length,
    completionRate: Math.round(completionRate * 100) / 100,
    averagePauseCount: Math.round(averagePauseCount * 100) / 100,
    reasons,
  }
}

export function MissionSetup() {
  const navigate = useNavigate()
  const { addMissionPreset, deleteMissionPreset, missionPresets, sessions, startMission } = useAppState()
  const [selectedPreset, setSelectedPreset] = useState<MissionPreset | null>(null)
  const [isCreating, setIsCreating] = useState(missionPresets.length === 0)
  const [taskName, setTaskName] = useState('')
  const [focusMin, setFocusMin] = useState(DEFAULT_FOCUS_MIN)
  const [breakMin, setBreakMin] = useState(DEFAULT_BREAK_MIN)
  const [totalCycles, setTotalCycles] = useState(4)
  const [recommendation, setRecommendation] = useState<ApiRecommendation | null>(null)

  const selectedTaskType = selectedPreset?.id
  const localRecommendation = useMemo(
    () => (selectedPreset ? buildLocalRecommendation(selectedPreset, sessions) : null),
    [selectedPreset, sessions],
  )
  const activeRecommendation = recommendation ?? localRecommendation
  const isRecommendationApplied =
    activeRecommendation !== null &&
    focusMin === activeRecommendation.focusMinutes &&
    breakMin === activeRecommendation.breakMinutes

  useEffect(() => {
    if (!selectedPreset || !selectedTaskType || isCreating) {
      return
    }

    let cancelled = false

    void fetchRecommendation(selectedTaskType)
      .then((nextRecommendation) => {
        if (cancelled) return
        const shouldKeepLocalRecommendation =
          nextRecommendation.recentSessionCount === 0 &&
          (nextRecommendation.focusMinutes !== selectedPreset.focusMin ||
            nextRecommendation.breakMinutes !== selectedPreset.breakMin)

        setRecommendation(shouldKeepLocalRecommendation ? null : nextRecommendation)
      })
      .catch(() => {
        if (!cancelled) setRecommendation(null)
      })

    return () => {
      cancelled = true
    }
  }, [isCreating, selectedPreset, selectedTaskType, sessions])

  const openCreateForm = () => {
    setSelectedPreset(null)
    setIsCreating(true)
    setTaskName('')
    setFocusMin(DEFAULT_FOCUS_MIN)
    setBreakMin(DEFAULT_BREAK_MIN)
    setRecommendation(null)
  }

  const selectPreset = (preset: MissionPreset) => {
    setSelectedPreset(preset)
    setIsCreating(false)
    setTaskName(preset.name)
    setFocusMin(preset.focusMin)
    setBreakMin(preset.breakMin)
    setRecommendation(null)
  }

  const handleDeletePreset = (preset: MissionPreset) => {
    deleteMissionPreset(preset.id)
    if (selectedPreset?.id === preset.id) openCreateForm()
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
    if (!activeRecommendation) return
    setFocusMin(activeRecommendation.focusMinutes)
    setBreakMin(activeRecommendation.breakMinutes)
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
              <div
                className={`task-option${selectedPreset?.id === preset.id ? ' selected' : ''}`}
                key={preset.id}
              >
                <button
                  className="task-select"
                  onClick={() => selectPreset(preset)}
                  type="button"
                >
                  <strong>{preset.name}</strong>
                  <span>사용자 설정 미션</span>
                  <small>
                    {preset.focusMin}분 집중 / {preset.breakMin}분 휴식
                  </small>
                </button>
                <button
                  aria-label={`${preset.name} 삭제`}
                  className="task-delete-button"
                  onClick={() => handleDeletePreset(preset)}
                  title="저장된 작업 삭제"
                  type="button"
                >
                  삭제
                </button>
              </div>
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
                    {activeRecommendation
                      ? `${activeRecommendation.focusMinutes}분 집중 / ${activeRecommendation.breakMinutes}분 휴식`
                      : '기록 확인 중'}
                  </strong>
                </div>
                <button
                  className="secondary-button recommendation-action"
                  disabled={!activeRecommendation || isRecommendationApplied}
                  onClick={handleApplyRecommendation}
                  type="button"
                >
                  {isRecommendationApplied ? '적용됨' : '적용'}
                </button>
              </div>

              {activeRecommendation ? (
                <>
                  <div className="recommendation-metrics">
                    <div>
                      <span>집중 점수</span>
                      <strong>{activeRecommendation.focusScore}</strong>
                    </div>
                    <div>
                      <span>최근 기록</span>
                      <strong>{activeRecommendation.recentSessionCount}</strong>
                    </div>
                    <div>
                      <span>완료율</span>
                      <strong>{Math.round(activeRecommendation.completionRate * 100)}%</strong>
                    </div>
                  </div>
                  <p className="recommendation-reason">
                    {recommendationReasonKo(activeRecommendation.reasons.at(-1))}
                  </p>
                </>
              ) : (
                <p className="recommendation-reason">
                  미션을 선택하면 최근 기록을 바탕으로 추천을 불러옵니다.
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
