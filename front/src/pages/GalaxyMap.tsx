import { useMemo, useState } from 'react'
import { GalaxyVoyageScene, type VoyagePlanet } from '../components/GalaxyVoyageScene'
import { PLANETS, unlockedPlanets } from '../domain/planets'
import { getTaskMeta } from '../domain/taskTypes'
import { useAppState } from '../state/AppStateContext'

const DEMO_UNLOCK_MINUTES = 900

export function GalaxyMap() {
  const { sessions, totalCompletedFocusMinutes, reduceVisualEffects } = useAppState()
  const [demoMode, setDemoMode] = useState(false)
  const [isVoyaging, setIsVoyaging] = useState(false)
  const completedSessions = sessions.filter((session) => session.outcome === 'completed')
  const displayCompletedMinutes = demoMode
    ? Math.max(totalCompletedFocusMinutes, DEMO_UNLOCK_MINUTES)
    : totalCompletedFocusMinutes
  const unlocked = useMemo(
    () => new Set(unlockedPlanets(displayCompletedMinutes).map((planet) => planet.id)),
    [displayCompletedMinutes],
  )
  const planets = useMemo<VoyagePlanet[]>(
    () =>
      PLANETS.map((planet) => ({
        ...planet,
        unlocked: unlocked.has(planet.id),
      })),
    [unlocked],
  )
  const totalHours = (totalCompletedFocusMinutes / 60).toFixed(1)
  const displayHours = (displayCompletedMinutes / 60).toFixed(1)

  return (
    <section className="page map-page">
      <header className="page-header map-header">
        <div>
          <p className="eyebrow">은하 지도</p>
          <h1>집중 기록으로 행성을 해금하고 항로를 넓힙니다.</h1>
          <p>
            완료한 집중 시간에 따라 행성이 열리고, 항해 보기에서 우주선을 따라
            해금된 행성들을 지나갈 수 있습니다.
          </p>
        </div>
        <div className="map-header-actions">
          <button
            className={`secondary-button compact${demoMode ? ' active' : ''}`}
            onClick={() => setDemoMode((current) => !current)}
            type="button"
          >
            {demoMode ? '시연 모드 켜짐' : '시연 모드'}
          </button>
          <button
            className="primary-button compact"
            onClick={() => setIsVoyaging((current) => !current)}
            type="button"
          >
            {isVoyaging ? '항해 정지' : '항해 보기'}
          </button>
        </div>
      </header>

      <div className="map-summary">
        <div>
          <span>실제 누적 집중</span>
          <strong>{totalHours}h</strong>
        </div>
        <div>
          <span>{demoMode ? '시연 기준 시간' : '해금 기준 시간'}</span>
          <strong>{displayHours}h</strong>
        </div>
        <div>
          <span>해금 행성</span>
          <strong>{unlocked.size}/{PLANETS.length}</strong>
        </div>
      </div>

      <div className="map-grid">
        <section className="galaxy-voyage-stage">
          <GalaxyVoyageScene
            completedMinutes={displayCompletedMinutes}
            isVoyaging={isVoyaging}
            planets={planets}
            reduceMotion={reduceVisualEffects}
          />
          <div className="voyage-hud">
            <span>{isVoyaging ? '항해 중' : '항로 대기'}</span>
            <strong>
              {demoMode
                ? '시연 모드로 목성까지 해금된 장면을 보여줍니다.'
                : '완료 기록이 쌓일수록 더 먼 행성이 밝아집니다.'}
            </strong>
          </div>
        </section>

        <aside className="map-panel voyage-sidebar">
          <div className="section-heading">
            <span>Planets</span>
            <div>
              <h2>행성 해금</h2>
              <p>누적 집중 시간에 따라 항로의 다음 행성이 열립니다.</p>
            </div>
          </div>

          <div className="planet-grid">
            {planets.map((planet) => {
              const remaining = Math.max(0, planet.requiredMinutes - displayCompletedMinutes)
              return (
                <article
                  className={`planet-card ${planet.unlocked ? 'unlocked' : 'locked'}`}
                  key={planet.id}
                >
                  <span className="planet-dot" aria-hidden />
                  <strong>{planet.nameKo}</strong>
                  <small>{planet.nameEn}</small>
                  <p>
                    {planet.unlocked
                      ? '항해 가능'
                      : `${Math.ceil(remaining / 60)}시간 더 집중하면 해금`}
                  </p>
                </article>
              )
            })}
          </div>

          <div className="recent-stars">
            <div className="section-heading compact-heading">
              <span>Stars</span>
              <div>
                <h2>최근 완료 미션</h2>
              </div>
            </div>
            {completedSessions.slice(0, 4).map((session) => (
              <article className="recent-star-item" key={session.id}>
                <strong>{session.starName}</strong>
                <small>{getTaskMeta(session.taskType).labelKo}</small>
              </article>
            ))}
            {completedSessions.length === 0 && (
              <p className="empty-copy">아직 완료한 집중 세션이 없습니다.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
