import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'

// root application component — sets up the router and triggers session
// rehydration on startup so returning users are automatically logged back in.
function App() {
  const rehydrate = useAuthStore((state) => state.rehydrate)

  // attempt to restore the user session from the httpOnly refresh token
  // cookie as soon as the app mounts. isLoading stays true until this completes
  // so ProtectedRoute doesn't flash the login page for authenticated users.
  useEffect(() => {
    rehydrate()
  }, [rehydrate])

  return (
    <BrowserRouter>
      <Routes>
        {/* public routes — accessible without authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* protected routes — redirect to /login if not authenticated */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* catch-all — redirect any unknown route to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App