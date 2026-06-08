import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { pickTrivia } from '../data/trivia'
import { effectiveCountdownSeconds, formatClock } from '../domain/timerUtils'
import type { ActiveMission } from '../domain/types'
import { useAppState } from '../state/AppStateContext'

interface RestRouteState {
  breakMin: number
  completedCycle: number
  isLongBreak: boolean
  nextMission: ActiveMission | null
  taskName: string
  totalCycles: number
}

export function RestStation() {
  const location = useLocation()
  const restState = location.state as RestRouteState | null
  const breakMin = restState?.breakMin ?? 5
  const { demoShortSessions } = useAppState()

  return (
    <RestStationRunner
      key={`${breakMin}-${restState?.completedCycle ?? 0}-${demoShortSessions}`}
      breakMin={breakMin}
      restState={restState}
    />
  )
}

function RestStationRunner({
  breakMin,
  restState,
}: {
  breakMin: number
  restState: RestRouteState | null
}) {
  const navigate = useNavigate()
  const { demoShortSessions, updateActiveMission } = useAppState()
  const totalSeconds = useMemo(
    () => effectiveCountdownSeconds(breakMin, demoShortSessions),
    [breakMin, demoShortSessions],
  )
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const trivia = pickTrivia(restState?.completedCycle ?? 0)

  const finishRest = useCallback(() => {
    if (restState?.nextMission) {
      updateActiveMission(restState.nextMission)
      navigate('/timer')
      return
    }

    updateActiveMission(null)
    navigate('/map')
  }, [navigate, restState, updateActiveMission])

  useEffect(() => {
    if (secondsLeft <= 0) {
      finishRest()
      return
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [finishRest, secondsLeft])

  useEffect(() => {
    document.title = `${formatClock(secondsLeft)} | Rest Station`
    return () => {
      document.title = 'Focus Orbit'
    }
  }, [secondsLeft])

  return (
    <section className="page rest-page">
      <header className="page-header">
        <p className="eyebrow">Rest Station</p>
        <h1>{restState?.isLongBreak ? '긴 휴식 정거장에 도착했습니다.' : '연료 충전 중입니다.'}</h1>
        <p>
          {restState?.taskName ?? 'Mission'} 집중 세션이 기록되었습니다. 다음 탐사를
          위해 잠시 쉬어갑니다.
        </p>
      </header>

      <div className="rest-card">
        <span className="station-ring" aria-hidden />
        <div className="timer-readout">
          <span>
            {restState?.completedCycle ?? 1}/{restState?.totalCycles ?? 1} Orbit Complete
          </span>
          <strong>{formatClock(secondsLeft)}</strong>
          <p>{trivia}</p>
        </div>

        <div className="control-row">
          <button className="primary-button compact" onClick={finishRest} type="button">
            {restState?.nextMission ? '다음 집중 시작' : '우주 지도 보기'}
          </button>
          <button className="secondary-button" onClick={() => navigate('/log')} type="button">
            Mission Log
          </button>
        </div>
      </div>
    </section>
  )
}
