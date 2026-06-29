import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useGroupStore } from '../store/groupStore'
import ThemeToggle from '../components/ThemeToggle'

// group shell page — the main container for a study group.
// houses the group sidebar and will render chat, notes, tasks etc. via nested routes later.
function GroupShellPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { activeGroup, groups, fetchGroup, fetchGroups, fetchMembers } = useGroupStore()

  // fetch group data and user's groups on mount
  useEffect(() => {
      if (id && id !== 'undefined') {
        fetchGroup(id)
        fetchGroups()
        fetchMembers(id)
      }
    }, [id])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // find the current user's role in this group
  const currentGroup = groups.find((g) => g.id === id)
  const userRole = currentGroup?.role ?? 'member'

  const navItems = [
    { id: 'chat', icon: '💬', label: 'Chat', path: '' },
    { id: 'notes', icon: '📝', label: 'Notes', path: '/notes' },
    { id: 'tasks', icon: '✅', label: 'Tasks', path: '/tasks' },
    { id: 'flashcards', icon: '🃏', label: 'Flashcards', path: '/flashcards' },
    { id: 'files', icon: '📁', label: 'Files', path: '/files' },
    { id: 'exams', icon: '⏳', label: 'Exam Countdown', path: '/exams' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)', position: 'relative' }}>

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
        left: 0, top: 0, bottom: 0,
        zIndex: 40,
        background: 'var(--color-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--color-border)',
      }}>

        {/* back to dashboard */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', borderRadius: '8px', border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--color-text-muted)', fontSize: '0.875rem',
            fontFamily: 'var(--font-sans)', marginBottom: '8px',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-surface-raised)'
            e.currentTarget.style.color = 'var(--color-text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--color-text-muted)'
          }}
        >
          ← All groups
        </button>

        {/* group name */}
        <div style={{ padding: '8px 12px', marginBottom: '24px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.125rem', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
            }}>
              👥
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '1rem', fontWeight: 700,
                color: 'var(--color-text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {activeGroup?.name ?? currentGroup?.name ?? 'Loading...'}
              </div>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600,
                color: userRole === 'owner' ? '#4F46E5' : userRole === 'admin' ? '#7C3AED' : 'var(--color-text-muted)',
                background: userRole === 'owner' ? 'rgba(79,70,229,0.1)' : userRole === 'admin' ? 'rgba(124,58,237,0.1)' : 'var(--color-surface-raised)',
                padding: '2px 8px', borderRadius: '999px',
                textTransform: 'capitalize',
              }}>
                {userRole}
              </span>
            </div>
          </div>

          {/* invite code */}
          {activeGroup?.invite_code && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 10px', borderRadius: '8px',
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              marginTop: '8px',
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Code:</span>
              <span style={{
                fontSize: '0.8125rem', fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-primary)',
                letterSpacing: '0.08em',
              }}>
                {activeGroup.invite_code}
              </span>
            </div>
          )}
        </div>

        {/* nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = item.id === 'chat' // default active for now
            return (
              <button
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '10px', border: 'none',
                  cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left',
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 150ms',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))'
                    : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderLeft: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  opacity: item.id === 'chat' ? 1 : 0.5, // only chat is active for now
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
                {item.id !== 'chat' && (
                  <span style={{
                    marginLeft: 'auto', fontSize: '0.7rem',
                    color: 'var(--color-text-muted)',
                    background: 'var(--color-surface-raised)',
                    padding: '2px 6px', borderRadius: '4px',
                  }}>
                    Soon
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* settings link — admin/owner only */}
        {(userRole === 'owner' || userRole === 'admin') && (
          <Link
            to={`/groups/${id}/settings`}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem', fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 150ms',
              marginBottom: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-raised)'
              e.currentTarget.style.borderColor = 'rgba(79,70,229,0.3)'
              e.currentTarget.style.color = 'var(--color-text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
          >
            ⚙️ Group settings
          </Link>
        )}

        {/* user section */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.875rem', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '10px',
                border: '1px solid var(--color-border)', background: 'transparent',
                color: 'var(--color-text-secondary)', fontSize: '0.875rem',
                fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer',
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
        marginLeft: '260px', flex: 1,
        padding: '40px 48px',
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Chat coming soon
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', maxWidth: '360px' }}>
            Real-time group chat is being built right now. Check back soon.
          </p>
        </div>
      </main>
    </div>
  )
}

export default GroupShellPage