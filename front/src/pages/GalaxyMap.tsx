import { PLANETS, unlockedPlanets } from '../domain/planets'
import { getTaskMeta } from '../domain/taskTypes'
import { useAppState } from '../state/AppStateContext'

export function GalaxyMap() {
  const { sessions, totalCompletedFocusMinutes } = useAppState()
  const completedSessions = sessions.filter((session) => session.outcome === 'completed')
  const unlocked = new Set(
    unlockedPlanets(totalCompletedFocusMinutes).map((planet) => planet.id),
  )
  const totalHours = (totalCompletedFocusMinutes / 60).toFixed(1)

  return (
    <section className="page map-page">
      <header className="page-header">
        <p className="eyebrow">Galaxy Map</p>
        <h1>집중 기록이 우주 지도를 확장합니다.</h1>
        <p>완료한 작업 별과 누적 집중 시간에 따라 실제 행성 탐사가 해금됩니다.</p>
      </header>

      <div className="map-summary">
        <div>
          <span>누적 집중</span>
          <strong>{totalHours}h</strong>
        </div>
        <div>
          <span>탐사 완료 별</span>
          <strong>{completedSessions.length}</strong>
        </div>
        <div>
          <span>해금 행성</span>
          <strong>{unlocked.size}</strong>
        </div>
      </div>

      <div className="map-grid">
        <section className="map-panel star-map">
          <div className="section-heading">
            <span>Stars</span>
            <div>
              <h2>완료한 작업 별</h2>
              <p>최근 완료한 미션이 항로 위에 별로 표시됩니다.</p>
            </div>
          </div>

          <div className="star-field">
            {completedSessions.slice(0, 12).map((session, index) => (
              <article
                className="mission-star"
                key={session.id}
                style={{
                  left: `${10 + ((index * 17) % 78)}%`,
                  top: `${16 + ((index * 23) % 66)}%`,
                }}
              >
                <span aria-hidden />
                <strong>{session.starName}</strong>
                <small>{getTaskMeta(session.taskType).labelKo}</small>
              </article>
            ))}
            {completedSessions.length === 0 && (
              <p className="empty-copy">완료한 집중 세션이 아직 없습니다.</p>
            )}
          </div>
        </section>

        <section className="map-panel">
          <div className="section-heading">
            <span>Planets</span>
            <div>
              <h2>행성 해금</h2>
              <p>누적 집중 시간이 늘어나면 더 먼 행성이 열립니다.</p>
            </div>
          </div>

          <div className="planet-grid">
            {PLANETS.map((planet) => {
              const isUnlocked = unlocked.has(planet.id)
              const remaining = Math.max(0, planet.requiredMinutes - totalCompletedFocusMinutes)
              return (
                <article
                  className={`planet-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                  key={planet.id}
                >
                  <span className="planet-dot" aria-hidden />
                  <strong>{planet.nameKo}</strong>
                  <small>{planet.nameEn}</small>
                  <p>
                    {isUnlocked
                      ? '탐사 가능'
                      : `${Math.ceil(remaining / 60)}시간 더 집중하면 해금`}
                  </p>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </section>
  )
}
