import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from '../components/ThemeToggle'

// dashboard page — main landing page for authenticated users.
// placeholder that confirms auth is working end to end.
// will be expanded with study groups, tasks, chat and flashcards.
function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const features = [
    {
      icon: '👥',
      label: 'Study Groups',
      desc: 'Create and join groups',
      gradient: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    },
    {
      icon: '✅',
      label: 'Task Board',
      desc: 'Kanban-style task tracking',
      gradient: 'linear-gradient(135deg, #059669, #0891B2)',
    },
    {
      icon: '💬',
      label: 'Group Chat',
      desc: 'Real-time messaging',
      gradient: 'linear-gradient(135deg, #2563EB, #4F46E5)',
    },
    {
      icon: '🃏',
      label: 'Flashcards',
      desc: 'Spaced repetition study',
      gradient: 'linear-gradient(135deg, #7C3AED, #DB2777)',
    },
    {
      icon: '📝',
      label: 'Shared Notes',
      desc: 'Collaborate on notes',
      gradient: 'linear-gradient(135deg, #D97706, #DC2626)',
    },
    {
      icon: '⏳',
      label: 'Exam Countdown',
      desc: 'Track upcoming exams',
      gradient: 'linear-gradient(135deg, #0891B2, #059669)',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', position: 'relative' }}>

      {/* animated background orbs */}
      <div className="orb-container">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* navigation */}
      <nav className="nav" style={{ position: 'relative', zIndex: 50 }}>
        <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>
          <span className="brand-gradient">Study Hub</span>
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Signed in as{' '}
            <span className="mono" style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
              {user?.username}
            </span>
          </span>
          <ThemeToggle />
          <button onClick={handleLogout} className="btn-ghost">
            Sign out
          </button>
        </div>
      </nav>

      {/* main content */}
      <main style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '40px 24px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* hero section */}
        <div className="hero-gradient" style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-primary)',
            marginBottom: '10px',
          }}>
            Dashboard
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px' }}>
            Welcome back, {user?.username} 👋
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
            Everything you need to study smarter with your group — all in one place.
          </p>
        </div>

        {/* section label */}
        <div style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: '14px',
        }}>
          Features
        </div>

        {/* feature grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
        }}>
          {features.map((feature) => (
            <div key={feature.label} className="feature-card">
              {/* icon bubble with gradient */}
              <div
                className="icon-bubble"
                style={{ background: feature.gradient }}
              >
                {feature.icon}
              </div>

              <div style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
              }}>
                {feature.label}
              </div>

              <div style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
                marginBottom: '14px',
              }}>
                {feature.desc}
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--color-primary)',
                background: 'rgba(79, 70, 229, 0.08)',
                padding: '3px 8px',
                borderRadius: '999px',
              }}>
                Coming soon
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default DashboardPage