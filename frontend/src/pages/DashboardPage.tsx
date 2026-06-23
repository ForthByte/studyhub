import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from '../components/ThemeToggle'

function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [activeNav, setActiveNav] = useState('dashboard')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { id: 'dashboard', icon: '⚡', label: 'Dashboard' },
    { id: 'groups', icon: '👥', label: 'Study Groups' },
    { id: 'tasks', icon: '✅', label: 'Task Board' },
    { id: 'chat', icon: '💬', label: 'Group Chat' },
    { id: 'flashcards', icon: '🃏', label: 'Flashcards' },
    { id: 'notes', icon: '📝', label: 'Shared Notes' },
    { id: 'exams', icon: '⏳', label: 'Exam Countdown' },
  ]

  const features = [
    {
      icon: '👥',
      label: 'Study Groups',
      desc: 'Create a group, share an invite code and collaborate with your classmates.',
      gradient: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
      status: 'Coming soon',
    },
    {
      icon: '💬',
      label: 'Real-time Chat',
      desc: 'Message your group instantly. No lag, no refresh — powered by WebSockets.',
      gradient: 'linear-gradient(135deg, #2563EB, #4F46E5)',
      status: 'Coming soon',
    },
    {
      icon: '✅',
      label: 'Task Board',
      desc: 'Kanban-style task tracking. Drag cards between To Do, In Progress and Done.',
      gradient: 'linear-gradient(135deg, #059669, #0891B2)',
      status: 'Coming soon',
    },
    {
      icon: '🃏',
      label: 'Flashcards',
      desc: 'Build decks and study with spaced repetition. SM-2 algorithm built in.',
      gradient: 'linear-gradient(135deg, #7C3AED, #DB2777)',
      status: 'Coming soon',
    },
    {
      icon: '📝',
      label: 'Shared Notes',
      desc: 'Rich-text notes your whole group can edit. See who\'s typing in real time.',
      gradient: 'linear-gradient(135deg, #D97706, #DC2626)',
      status: 'Coming soon',
    },
    {
      icon: '⏳',
      label: 'Exam Countdown',
      desc: 'Add upcoming exams and watch the countdown. Colour coded by urgency.',
      gradient: 'linear-gradient(135deg, #0891B2, #059669)',
      status: 'Coming soon',
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--color-bg)',
      position: 'relative',
    }}>

      {/* orbs */}
      <div className="orb-container">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: '260px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 40,
        background: 'var(--color-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--color-border)',
      }}>

        {/* brand */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 12px',
          marginBottom: '32px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.125rem',
            boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
            flexShrink: 0,
          }}>
            📚
          </div>
          <span style={{
            fontSize: '1.0625rem',
            fontWeight: 700,
          }}>
            <span className="brand-gradient">Study Hub</span>
          </span>
        </div>

        {/* nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'var(--font-sans)',
                  textAlign: 'left',
                  transition: 'all 150ms',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))'
                    : 'transparent',
                  color: isActive
                    ? 'var(--color-primary)'
                    : 'var(--color-text-secondary)',
                  borderLeft: isActive
                    ? '2px solid var(--color-primary)'
                    : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--color-surface-raised)'
                    e.currentTarget.style.color = 'var(--color-text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                  }
                }}
              >
                <span style={{ fontSize: '1.0625rem' }}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* user section */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {/* user pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
          }}>
            {/* avatar */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.username}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.email}
              </div>
            </div>
          </div>

          {/* theme + logout row */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(220,38,38,0.06)'
                e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)'
                e.currentTarget.style.color = 'var(--color-error)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{
        marginLeft: '260px',
        flex: 1,
        padding: '40px 48px',
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
      }}>

        {/* page header */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-primary)',
            marginBottom: '8px',
          }}>
            Overview
          </p>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--color-text-primary)',
            marginBottom: '8px',
          }}>
            Welcome back, {user?.username} 👋
          </h1>
          <p style={{
            fontSize: '1rem',
            color: 'var(--color-text-secondary)',
          }}>
            Here's what's coming to Study Hub. Features are being built right now.
          </p>
        </div>

        {/* feature grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {features.map((feature) => (
            <div
              key={feature.label}
              style={{
                background: 'var(--color-surface)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '28px',
                transition: 'all 150ms',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(79,70,229,0.15)'
                e.currentTarget.style.borderColor = 'rgba(79,70,229,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'var(--color-border)'
              }}
            >
              {/* subtle corner glow */}
              <div style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: feature.gradient,
                opacity: 0.06,
                filter: 'blur(20px)',
                pointerEvents: 'none',
              }} />

              {/* icon */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: feature.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.375rem',
                marginBottom: '18px',
                boxShadow: '0 4px 12px rgba(79,70,229,0.2)',
              }}>
                {feature.icon}
              </div>

              <h3 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                marginBottom: '8px',
              }}>
                {feature.label}
              </h3>

              <p style={{
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--color-text-secondary)',
                marginBottom: '20px',
              }}>
                {feature.desc}
              </p>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                background: 'rgba(79,70,229,0.08)',
                padding: '4px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(79,70,229,0.12)',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
                In development
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default DashboardPage