import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// dashboard page — the main landing page for authenticated users.
// currently a placeholder that confirms auth is working end to end.
// will be expanded with study groups, tasks, chat and flashcards.
function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* top navigation bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600">Study Hub</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Signed in as <span className="font-medium text-gray-900">{user?.username}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* main content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-gray-500">
            Study groups, tasks, chat and flashcards are coming soon.
          </p>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage