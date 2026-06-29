import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useGroupStore } from '../store/groupStore'
import { useFriendStore } from '../store/friendStore'
import ThemeToggle from '../components/ThemeToggle'
import CreateGroupModal from '../components/CreateGroupModal'
import JoinGroupModal from '../components/JoinGroupModal'
import DashboardView from '../components/dashboard/DashboardView'
import GroupsView from '../components/dashboard/GroupsView'
import FriendsView from '../components/dashboard/FriendsView'

type NavId = 'dashboard' | 'groups' | 'friends' | 'tasks' | 'chat' | 'flashcards' | 'notes' | 'exams'

function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { fetchGroups } = useGroupStore()
  const { incomingRequests, fetchFriends, fetchIncomingRequests } = useFriendStore()

  const [activeNav, setActiveNav] = useState<NavId>('dashboard')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    fetchGroups()
    fetchFriends()
    fetchIncomingRequests()

    // poll every 10 seconds to pick up friend request acceptances
    const interval = setInterval(() => {
      fetchFriends()
      fetchIncomingRequests()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems: { id: NavId; icon: string; label: string }[] = [
    { id: 'dashboard', icon: '⚡', label: 'Dashboard' },
    { id: 'groups', icon: '👥', label: 'Study Groups' },
    { id: 'friends', icon: '🤝', label: 'Friends' },
    { id: 'tasks', icon: '✅', label: 'Task Board' },
    { id: 'chat', icon: '💬', label: 'Group Chat' },
    { id: 'flashcards', icon: '🃏', label: 'Flashcards' },
    { id: 'notes', icon: '📝', label: 'Shared Notes' },
    { id: 'exams', icon: '⏳', label: 'Exam Countdown' },
  ]

  const ComingSoonView = ({ icon, label }: { icon: string; label: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>{icon}</div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
        {label}
      </h2>
      <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', maxWidth: '360px', lineHeight: 1.6 }}>
        This feature is being built right now. Check back soon.
      </p>
      <span style={{
        marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px',
        fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)',
        background: 'rgba(79,70,229,0.08)', padding: '6px 14px',
        borderRadius: '999px', border: '1px solid rgba(79,70,229,0.12)',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', animation: 'pulse 2s ease-in-out infinite' }} />
        In development
      </span>
    </div>
  )

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard': return <DashboardView username={user?.username ?? ''} />
      case 'groups': return <GroupsView onCreateGroup={() => setShowCreateModal(true)} onJoinGroup={() => setShowJoinModal(true)} />
      case 'friends': return <FriendsView />
      case 'tasks': return <ComingSoonView icon="✅" label="Task Board" />
      case 'chat': return <ComingSoonView icon="💬" label="Group Chat" />
      case 'flashcards': return <ComingSoonView icon="🃏" label="Flashcards" />
      case 'notes': return <ComingSoonView icon="📝" label="Shared Notes" />
      case 'exams': return <ComingSoonView icon="⏳" label="Exam Countdown" />
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)', position: 'relative' }}>

      {/* orbs */}
      <div className="orb-container">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* modals */}
      {showCreateModal && <CreateGroupModal onClose={() => setShowCreateModal(false)} />}
      {showJoinModal && <JoinGroupModal onClose={() => setShowJoinModal(false)} />}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: '260px', minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px', position: 'fixed',
        left: 0, top: 0, bottom: 0, zIndex: 40,
        background: 'var(--color-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--color-border)',
      }}>

        {/* brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', marginBottom: '32px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.125rem', boxShadow: '0 4px 12px rgba(79,70,229,0.35)', flexShrink: 0,
          }}>
            📚
          </div>
          <span style={{ fontSize: '1.0625rem', fontWeight: 700 }}>
            <span className="brand-gradient">Study Hub</span>
          </span>
        </div>

        {/* nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '10px', border: 'none',
                  cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left',
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'var(--font-sans)', transition: 'all 150ms',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))'
                    : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderLeft: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
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
                {item.id === 'friends' && incomingRequests.length > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: 'var(--color-primary)',
                    color: 'white', fontSize: '0.7rem', fontWeight: 700,
                    padding: '2px 6px', borderRadius: '999px',
                    minWidth: '18px', textAlign: 'center',
                  }}>
                    {incomingRequests.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

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
      <main style={{ marginLeft: '260px', flex: 1, padding: '40px 48px', position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {renderContent()}
      </main>
    </div>
  )
}

export default DashboardPage