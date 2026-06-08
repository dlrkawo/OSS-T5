import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Mission Setup', end: true },
  { to: '/timer', label: 'Active Timer' },
  { to: '/rest', label: 'Rest Station' },
  { to: '/map', label: 'Galaxy Map' },
  { to: '/log', label: 'Mission Log' },
  { to: '/settings', label: 'Settings' },
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
