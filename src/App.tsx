import './App.css'

const sessionQueue = [
  { label: 'Orbit 1', state: 'active' },
  { label: 'Rest', state: 'ready' },
  { label: 'Orbit 2', state: 'locked' },
  { label: 'Rest', state: 'locked' },
]

const logPreview = [
  { name: 'React 과제', result: '완료', time: '40m' },
  { name: '자료 조사', result: '중단', time: '18m' },
  { name: '발표 대본', result: '완료', time: '30m' },
]

function App() {
  return (
    <main className="timer-app">
      <aside className="sidebar" aria-label="Mission navigation">
        <a className="brand" href="/" aria-label="Focus Orbit">
          <span className="brand-orbit" aria-hidden="true" />
          <span>Focus Orbit</span>
        </a>

        <nav className="side-nav">
          <a className="active" href="#timer">
            Timer
          </a>
          <a href="#mission">Mission</a>
          <a href="#log">Log</a>
          <a href="#settings">Settings</a>
        </nav>

        <section className="mini-panel" aria-labelledby="today-score">
          <p id="today-score">오늘의 집중 상태</p>
          <strong>Clear Orbit</strong>
          <span>완료율 72% · 일시정지 평균 1.4회</span>
        </section>
      </aside>

      <section className="timer-workspace" id="timer">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">ACTIVE MISSION</p>
            <h1>React 과제 집중</h1>
          </div>
          <div className="header-actions" aria-label="Timer view options">
            <button type="button">Minimal</button>
            <button type="button">Notify</button>
          </div>
        </header>

        <div className="timer-layout">
          <section className="timer-board" aria-label="Pomodoro timer">
            <div className="phase-tabs" aria-label="Timer phase">
              <button className="selected" type="button">
                Focus
              </button>
              <button type="button">Break</button>
              <button type="button">Long Break</button>
            </div>

            <div className="orbit-stage" aria-hidden="true">
              <span className="orbit-line orbit-line-wide" />
              <span className="orbit-line orbit-line-mid" />
              <span className="orbit-line orbit-line-small" />
              <span className="orbit-point" />
            </div>

            <div className="timer-readout" aria-label="Remaining focus time">
              39:42
            </div>
            <p className="session-label">Orbit 1 / 4 · Coding Deep Work</p>

            <div className="control-row" aria-label="Timer controls">
              <button className="control-button primary" type="button" aria-label="Start">
                ▶
              </button>
              <button className="control-button" type="button" aria-label="Pause">
                ‖
              </button>
              <button className="control-button" type="button" aria-label="Reset">
                ↺
              </button>
              <button className="control-button danger" type="button" aria-label="Stop">
                ■
              </button>
            </div>

            <div className="progress-block">
              <div className="progress-label">
                <span>Focus Fuel</span>
                <span>28%</span>
              </div>
              <div className="progress-track">
                <span />
              </div>
            </div>
          </section>

          <aside className="mission-panel" id="mission" aria-label="Mission settings">
            <section className="panel-card">
              <div className="panel-heading">
                <p>Mission Setup</p>
                <span>추천 루틴</span>
              </div>
              <label>
                작업 이름
                <input value="React 과제" readOnly />
              </label>
              <label>
                작업 유형
                <select value="coding" disabled>
                  <option value="coding">코딩</option>
                </select>
              </label>
              <div className="time-grid">
                <label>
                  집중
                  <input value="40분" readOnly />
                </label>
                <label>
                  휴식
                  <input value="10분" readOnly />
                </label>
              </div>
            </section>

            <section className="panel-card">
              <div className="panel-heading">
                <p>Session Queue</p>
                <span>4 Pomodoro</span>
              </div>
              <ol className="queue-list">
                {sessionQueue.map((item) => (
                  <li className={item.state} key={`${item.label}-${item.state}`}>
                    <span>{item.label}</span>
                    <strong>{item.state}</strong>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>

        <footer className="bottom-grid">
          <section className="panel-card" id="log">
            <div className="panel-heading">
              <p>Mission Log</p>
              <span>최근 기록</span>
            </div>
            <div className="log-list">
              {logPreview.map((item) => (
                <div className="log-item" key={item.name}>
                  <span>{item.name}</span>
                  <strong>{item.result}</strong>
                  <em>{item.time}</em>
                </div>
              ))}
            </div>
          </section>

          <section className="panel-card" id="settings">
            <div className="panel-heading">
              <p>Settings</p>
              <span>집중 중 표시</span>
            </div>
            <div className="toggle-list">
              <label>
                <input type="checkbox" defaultChecked />
                Show timer in browser title
              </label>
              <label>
                <input type="checkbox" defaultChecked />
                Desktop notification
              </label>
              <label>
                <input type="checkbox" />
                Reduce visual effects
              </label>
            </div>
          </section>
        </footer>
      </section>
    </main>
  )
}

export default App
