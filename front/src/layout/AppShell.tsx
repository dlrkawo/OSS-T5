import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: '미션 설정', end: true },
  { to: '/timer', label: '집중 타이머' },
  { to: '/rest', label: '휴식 공간' },
  { to: '/map', label: '은하 지도' },
  { to: '/log', label: '미션 기록' },
  { to: '/settings', label: '설정' },
] as const

function getNavClass({ isActive }: { isActive: boolean }) {
  return `app-nav-link${isActive ? ' active' : ''}`
}

export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <NavLink to="/" className="app-brand">
          <span className="brand-orbit" aria-hidden />
          <span>Focus Orbit</span>
        </NavLink>

        <nav className="app-nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={getNavClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
