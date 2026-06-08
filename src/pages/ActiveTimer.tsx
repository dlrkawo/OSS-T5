import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTaskMeta } from '../domain/taskTypes'
import { effectiveCountdownSeconds, formatClock } from '../domain/timerUtils'
import type { ActiveMission } from '../domain/types'
import { useAppState } from '../state/AppStateContext'

export function ActiveTimer() {
  const navigate = useNavigate()
  const appState = useAppState()
  const { activeMission, demoShortSessions } = appState

  if (!activeMission) {
    return (
      <section className="page empty-state">
        <p className="eyebrow">Active Timer</p>
        <h1>진행 중인 미션이 없습니다.</h1>
        <button className="primary-button compact" onClick={() => navigate('/')} type="button">
          미션 설정으로 이동
        </button>
      </section>
    )
  }

  return (
    <ActiveTimerRunner
      key={`${activeMission.cycleId}-${activeMission.currentCycle}-${demoShortSessions}`}
      mission={activeMission}
    />
  )
}

function ActiveTimerRunner({ mission }: { mission: ActiveMission }) {
  const navigate = useNavigate()
  const {
    demoShortSessions,
    recordAbortedFocus,
    recordCompletedFocus,
    updateActiveMission,
  } = useAppState()
  const totalSeconds = useMemo(
    () => effectiveCountdownSeconds(mission.plannedFocusMin, demoShortSessions),
    [demoShortSessions, mission.plannedFocusMin],
  )
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [isPaused, setIsPaused] = useState(false)
  const [pauseCount, setPauseCount] = useState(0)

  const completeFocus = useCallback(() => {
    recordCompletedFocus(mission, pauseCount)
    const isFinalCycle = mission.currentCycle >= mission.totalCycles
    const nextMission = isFinalCycle
      ? null
      : {
          ...mission,
          currentCycle: mission.currentCycle + 1,
        }
    const breakMin = isFinalCycle
      ? Math.max(15, mission.plannedBreakMin * 3)
      : mission.plannedBreakMin

    updateActiveMission(null)
    navigate('/rest', {
      state: {
        breakMin,
        isLongBreak: isFinalCycle,
        nextMission,
        taskName: mission.taskName,
        totalCycles: mission.totalCycles,
        completedCycle: mission.currentCycle,
      },
    })
  }, [mission, navigate, pauseCount, recordCompletedFocus, updateActiveMission])

  useEffect(() => {
    if (isPaused) return
    if (secondsLeft <= 0) {
      completeFocus()
      return
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [completeFocus, isPaused, secondsLeft])

  useEffect(() => {
    document.title = `${formatClock(secondsLeft)} | ${mission.taskName}`
    return () => {
      document.title = 'Focus Orbit'
    }
  }, [mission.taskName, secondsLeft])

  const meta = getTaskMeta(mission.taskType)
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0
  const progressPercent = Math.round(progress * 100)

  const handlePause = () => {
    setIsPaused((current) => {
      if (!current) setPauseCount((count) => count + 1)
      return !current
    })
  }

  const handleAbort = () => {
    recordAbortedFocus(mission, pauseCount)
    updateActiveMission(null)
    navigate('/log')
  }

  return (
    <section className="page timer-page">
      <header className="timer-header">
        <div>
          <p className="eyebrow">Active Timer</p>
          <h1>{mission.taskName}</h1>
        </div>
        <div className="orbit-status">
          Orbit {mission.currentCycle}/{mission.totalCycles}
        </div>
      </header>

      <div className="timer-board">
        <div className="space-route" aria-hidden>
          <span className="route-line" />
          <span className="route-star route-star-start" />
          <span className="target-star" />
          <span className="nebula nebula-left" />
          <span className="nebula nebula-right" />
          <span className="route-ship" style={{ left: `calc(10% + ${progress * 72}%)` }} />
        </div>

        <div className="timer-readout">
          <span>{meta.missionLabel}</span>
          <strong>{formatClock(secondsLeft)}</strong>
          <p>
            {progressPercent}% 항로 진행 중 · 일시정지 {pauseCount}회
          </p>
        </div>

        <div className="progress-track" aria-label="Mission progress">
          <span className="progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="control-row">
          <button className="secondary-button" onClick={handlePause} type="button">
            {isPaused ? '재개' : '일시정지'}
          </button>
          <button className="primary-button compact" onClick={completeFocus} type="button">
            완료 처리
          </button>
          <button className="danger-button" onClick={handleAbort} type="button">
            중단
          </button>
        </div>
      </div>
    </section>
  )
}
