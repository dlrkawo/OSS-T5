import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppShell } from './layout/AppShell'
import { ActiveTimer } from './pages/ActiveTimer'
import { GalaxyMap } from './pages/GalaxyMap'
import { MissionLog } from './pages/MissionLog'
import { MissionSetup } from './pages/MissionSetup'
import { RestStation } from './pages/RestStation'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<MissionSetup />} />
        <Route path="timer" element={<ActiveTimer />} />
        <Route path="rest" element={<RestStation />} />
        <Route path="map" element={<GalaxyMap />} />
        <Route path="log" element={<MissionLog />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
