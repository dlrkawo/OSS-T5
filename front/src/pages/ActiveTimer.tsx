import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SpaceOrbitScene } from '../components/SpaceOrbitScene'
import { notifyTimerEvent } from '../domain/alerts'
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
    desktopNotification,
    minimalMode,
    reduceVisualEffects,
    recordAbortedFocus,
    recordCompletedFocus,
    setMinimalMode,
    setReduceVisualEffects,
    showBrowserTitleTimer,
    soundAlert,
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
    const isFinalCycle = mission.currentCycle >= mission.totalCycles
    const isLongBreak = isFinalCycle || mission.currentCycle % 4 === 0
    recordCompletedFocus(mission, pauseCount, isLongBreak)
    const nextMission = isFinalCycle
      ? null
      : {
          ...mission,
          currentCycle: mission.currentCycle + 1,
        }
    const breakMin = isLongBreak
      ? Math.max(15, mission.plannedBreakMin * 3)
      : mission.plannedBreakMin

    notifyTimerEvent(
      '집중 세션 완료',
      isLongBreak ? '긴 휴식 정거장으로 이동합니다.' : '짧은 휴식 후 다음 Orbit이 이어집니다.',
      { desktopNotification, soundAlert },
    )

    updateActiveMission(null)
    navigate('/rest', {
      state: {
        breakMin,
        isLongBreak,
        nextMission,
        taskName: mission.taskName,
        totalCycles: mission.totalCycles,
        completedCycle: mission.currentCycle,
      },
    })
  }, [
    desktopNotification,
    mission,
    navigate,
    pauseCount,
    recordCompletedFocus,
    soundAlert,
    updateActiveMission,
  ])

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
    if (!showBrowserTitleTimer) {
      document.title = 'Focus Orbit'
      return
    }

    document.title = `${formatClock(secondsLeft)} | ${mission.taskName}`
    return () => {
      document.title = 'Focus Orbit'
    }
  }, [mission.taskName, secondsLeft, showBrowserTitleTimer])

  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0
  const progressPercent = Math.round(progress * 100)
  const totalProgressPercent = Math.round(
    ((mission.currentCycle - 1 + progress) / mission.totalCycles) * 100,
  )

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
      <div
        className={`timer-board${minimalMode ? ' minimal' : ''}${
          reduceVisualEffects ? ' reduced-effects' : ''
        }`}
      >
        <header className="timer-header">
          <p className="eyebrow">Active Timer</p>
          <div className="timer-header-actions">
            <button
              aria-pressed={minimalMode}
              className={`mode-toggle${minimalMode ? ' active' : ''}`}
              onClick={() => setMinimalMode(!minimalMode)}
              type="button"
            >
              Minimal {minimalMode ? 'ON' : 'OFF'}
            </button>
            <button
              aria-pressed={reduceVisualEffects}
              className={`mode-toggle${reduceVisualEffects ? ' active' : ''}`}
              onClick={() => setReduceVisualEffects(!reduceVisualEffects)}
              type="button"
            >
              Reduce FX {reduceVisualEffects ? 'ON' : 'OFF'}
            </button>
            <div className="orbit-status">
              Orbit {mission.currentCycle}/{mission.totalCycles}
            </div>
          </div>
        </header>

        {!minimalMode && <SpaceOrbitScene progress={progress} reduceMotion={reduceVisualEffects} />}

        <div className="timer-readout">
          <strong>{formatClock(secondsLeft)}</strong>
        </div>

        <div className="timer-progress-panel">
          <div className="progress-unit">
            <div className="progress-meta">
              <span>현재 Orbit</span>
              <strong>{progressPercent}%</strong>
            </div>
            <div className="progress-track" aria-label="Mission progress">
              <span className="progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="progress-unit">
            <div className="progress-meta">
              <span>전체 미션</span>
              <strong>{totalProgressPercent}%</strong>
            </div>
            <div className="progress-track total-progress-track" aria-label="Total mission progress">
              <span
                className="progress-bar total-progress-bar"
                style={{ width: `${totalProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="pause-telemetry">일시정지 {pauseCount}회</div>
        </div>

        <div className="control-row">
          <button
            aria-label={isPaused ? '재개' : '일시정지'}
            className="secondary-button icon-button"
            onClick={handlePause}
            title={isPaused ? '재개' : '일시정지'}
            type="button"
          >
            <span aria-hidden>{isPaused ? '▶' : 'Ⅱ'}</span>
          </button>
          <button
            aria-label="완료 처리"
            className="primary-button compact icon-button"
            onClick={completeFocus}
            title="완료 처리"
            type="button"
          >
            <span aria-hidden>✓</span>
          </button>
          <button
            aria-label="중단"
            className="danger-button icon-button"
            onClick={handleAbort}
            title="중단"
            type="button"
          >
            <span aria-hidden>×</span>
          </button>
        </div>
      </div>
    </section>
  )
}
