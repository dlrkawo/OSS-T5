import { useAppState } from '../state/AppStateContext'

export function SettingsPage() {
  const { demoShortSessions, resetAll, setDemoShortSessions } = useAppState()

  return (
    <section className="page settings-page">
      <header className="page-header">
        <p className="eyebrow">Settings</p>
        <h1>발표 데모와 실제 사용 흐름을 조정합니다.</h1>
        <p>브라우저 저장소 기반 설정입니다. 백엔드 없이도 현재 FE 흐름을 확인할 수 있습니다.</p>
      </header>

      <div className="settings-list">
        <label className="settings-item">
          <div>
            <strong>Demo Short Sessions</strong>
            <p>발표 시 긴 시간을 기다리지 않도록 1분을 2초로 압축합니다.</p>
          </div>
          <input
            checked={demoShortSessions}
            onChange={(event) => setDemoShortSessions(event.target.checked)}
            type="checkbox"
          />
        </label>

        <div className="settings-item">
          <div>
            <strong>Reset Mission Data</strong>
            <p>localStorage에 저장된 미션 기록과 설정을 초기화합니다.</p>
          </div>
          <button className="danger-button" onClick={resetAll} type="button">
            초기화
          </button>
        </div>
      </div>
    </section>
  )
}
