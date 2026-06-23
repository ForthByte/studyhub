import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

// wraps any route that requires authentication.
// redirects unauthenticated users to /login and shows nothing while the
// session is being rehydrated on initial app load to prevent a flash of
// the login page for users who are already logged in.
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore()

  // rehydrate() is still running — don't render anything yet
  if (isLoading) {
    return null
  }

  // no authenticated user — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute