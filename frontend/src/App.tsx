import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import GroupShellPage from './pages/GroupShellPage'
import GroupSettingsPage from './pages/GroupSettingsPage'
import DMPage from './pages/DMPage'
import { usePresenceStore } from './store/presenceStore.ts'

// root application component — sets up the router and triggers session
// rehydration on startup so returning users are automatically logged back in.
function App() {
  const rehydrate = useAuthStore((state) => state.rehydrate)

  // attempt to restore the user session from the httpOnly refresh token
  // cookie as soon as the app mounts.
  useEffect(() => {
    rehydrate().then(() => {
      usePresenceStore.getState().startHeartbeat()
    })
  }, [rehydrate])

  return (
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/groups/:id" element={
          <ProtectedRoute><GroupShellPage /></ProtectedRoute>
        } />
        <Route path="/groups/:id/settings" element={
          <ProtectedRoute><GroupSettingsPage /></ProtectedRoute>
        } />
        <Route path="/dm/:userId" element={
          <ProtectedRoute><DMPage /></ProtectedRoute>
        } />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App