import { getTaskMeta } from '../domain/taskTypes'
import { useAppState } from '../state/AppStateContext'

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function MissionLog() {
  const { sessions } = useAppState()

  return (
    <section className="page log-page">
      <header className="page-header">
        <p className="eyebrow">Mission Log</p>
        <h1>작업 기록이 다음 루틴 추천의 근거가 됩니다.</h1>
        <p>완료율, 중단, 일시정지 기록을 남겨 작업 유형별 루틴을 조정합니다.</p>
      </header>

      <div className="log-table">
        <div className="log-row log-head">
          <span>별 이름</span>
          <span>유형</span>
          <span>Orbit</span>
          <span>결과</span>
          <span>시간</span>
        </div>

        {sessions.map((session) => (
          <div className="log-row" key={session.id}>
            <strong>{session.starName}</strong>
            <span>{getTaskMeta(session.taskType).labelKo}</span>
            <span>
              {session.cycleIndex}/{session.totalCycles}
            </span>
            <span className={session.outcome === 'completed' ? 'success-text' : 'danger-text'}>
              {session.outcome === 'completed' ? '완료' : '중단'}
            </span>
            <span>{dateFormatter.format(session.at)}</span>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="log-empty">
            <strong>아직 기록된 미션이 없습니다.</strong>
            <p>첫 집중 세션을 완료하면 이곳에 별 기록이 생성됩니다.</p>
          </div>
        )}
      </div>
    </section>
  )
}
