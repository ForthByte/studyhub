import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useGroupStore } from '../store/groupStore'
import ThemeToggle from '../components/ThemeToggle'
import CreateGroupModal from '../components/CreateGroupModal'
import JoinGroupModal from '../components/JoinGroupModal'

type NavId = 'dashboard' | 'groups' | 'tasks' | 'chat' | 'flashcards' | 'notes' | 'exams'

function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { groups, isLoading, fetchGroups } = useGroupStore()

  const [activeNav, setActiveNav] = useState<NavId>('dashboard')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems: { id: NavId; icon: string; label: string }[] = [
    { id: 'dashboard', icon: '⚡', label: 'Dashboard' },
    { id: 'groups', icon: '👥', label: 'Study Groups' },
    { id: 'tasks', icon: '✅', label: 'Task Board' },
    { id: 'chat', icon: '💬', label: 'Group Chat' },
    { id: 'flashcards', icon: '🃏', label: 'Flashcards' },
    { id: 'notes', icon: '📝', label: 'Shared Notes' },
    { id: 'exams', icon: '⏳', label: 'Exam Countdown' },
  ]

  const roleColour = (role: string) => {
    if (role === 'owner') return '#4F46E5'
    if (role === 'admin') return '#7C3AED'
    return 'var(--color-text-muted)'
  }

  const roleBg = (role: string) => {
    if (role === 'owner') return 'rgba(79,70,229,0.1)'
    if (role === 'admin') return 'rgba(124,58,237,0.1)'
    return 'var(--color-surface-raised)'
  }

  // ── CONTENT VIEWS ──────────────────────────────────────────────────────────

  const DashboardView = () => (
    <div>
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '8px' }}>
          Overview
        </p>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Welcome back, {user?.username} 👋
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
          {groups.length > 0
            ? `You're in ${groups.length} study group${groups.length > 1 ? 's' : ''}.`
            : 'Create or join a study group to get started.'}
        </p>
      </div>

      {/* quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Study groups', value: groups.length, icon: '👥', color: '#4F46E5' },
          { label: 'Tasks due', value: 0, icon: '✅', color: '#059669' },
          { label: 'Cards due today', value: 0, icon: '🃏', color: '#7C3AED' },
          { label: 'Upcoming exams', value: 0, icon: '⏳', color: '#D97706' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'var(--color-surface)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px', padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.25rem' }}>{stat.icon}</span>
              <span style={{
                fontSize: '1.75rem', fontWeight: 800,
                color: stat.color,
              }}>
                {stat.value}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* coming soon features */}
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        Coming soon
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {[
          { icon: '💬', label: 'Real-time Chat', desc: 'Message your group instantly. No lag, no refresh — powered by WebSockets.', gradient: 'linear-gradient(135deg, #2563EB, #4F46E5)' },
          { icon: '✅', label: 'Task Board', desc: 'Kanban-style task tracking. Drag cards between To Do, In Progress and Done.', gradient: 'linear-gradient(135deg, #059669, #0891B2)' },
          { icon: '🃏', label: 'Flashcards', desc: 'Build decks and study with spaced repetition. SM-2 algorithm built in.', gradient: 'linear-gradient(135deg, #7C3AED, #DB2777)' },
          { icon: '📝', label: 'Shared Notes', desc: "Rich-text notes your whole group can edit. See who's typing in real time.", gradient: 'linear-gradient(135deg, #D97706, #DC2626)' },
          { icon: '🤖', label: 'AI Study Sets', desc: 'Generate flashcards and quizzes from your notes using AI. Study smarter.', gradient: 'linear-gradient(135deg, #4F46E5, #0891B2)' },
          { icon: '⏳', label: 'Exam Countdown', desc: 'Add upcoming exams and watch the countdown. Colour coded by urgency.', gradient: 'linear-gradient(135deg, #0891B2, #059669)' },
        ].map((feature) => (
          <div
            key={feature.label}
            style={{
              background: 'var(--color-surface)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px', padding: '28px',
              transition: 'all 150ms', cursor: 'default',
              position: 'relative', overflow: 'hidden',
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
            <div style={{
              position: 'absolute', top: '-30px', right: '-30px',
              width: '100px', height: '100px', borderRadius: '50%',
              background: feature.gradient, opacity: 0.06,
              filter: 'blur(20px)', pointerEvents: 'none',
            }} />
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: feature.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.375rem', marginBottom: '18px',
              boxShadow: '0 4px 12px rgba(79,70,229,0.2)',
            }}>
              {feature.icon}
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              {feature.label}
            </h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              {feature.desc}
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)',
              background: 'rgba(79,70,229,0.08)', padding: '4px 10px',
              borderRadius: '999px', border: '1px solid rgba(79,70,229,0.12)',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--color-primary)',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              In development
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  const GroupsView = () => (
    <div>
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '8px' }}>
          Study Groups
        </p>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Your groups
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
          {groups.length > 0
            ? `You're a member of ${groups.length} group${groups.length > 1 ? 's' : ''}.`
            : 'Create or join a study group to get started.'}
        </p>
      </div>

      {/* action buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            color: '#ffffff', fontSize: '0.9rem', fontWeight: 600,
            fontFamily: 'var(--font-sans)', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
            transition: 'all 150ms', display: 'flex', alignItems: 'center', gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.3)'
          }}
        >
          + Create group
        </button>
        <button
          onClick={() => setShowJoinModal(true)}
          style={{
            padding: '10px 20px', borderRadius: '10px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)', fontSize: '0.9rem', fontWeight: 600,
            fontFamily: 'var(--font-sans)', cursor: 'pointer',
            transition: 'all 150ms', display: 'flex', alignItems: 'center', gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(79,70,229,0.3)'
            e.currentTarget.style.background = 'var(--color-surface-raised)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)'
            e.currentTarget.style.background = 'var(--color-surface)'
          }}
        >
          🔗 Join group
        </button>
      </div>

      {/* groups grid */}
      {isLoading ? (
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading groups...</div>
      ) : groups.length === 0 ? (
        <div style={{
          padding: '48px 32px', borderRadius: '20px', textAlign: 'center',
          border: '2px dashed var(--color-border)',
          background: 'var(--color-surface)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>👥</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            No groups yet
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            Create a group and invite your classmates, or join one with an invite code.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: '#ffffff', fontSize: '0.875rem', fontWeight: 600,
                fontFamily: 'var(--font-sans)', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
              }}
            >
              + Create group
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: 600,
                fontFamily: 'var(--font-sans)', cursor: 'pointer',
              }}
            >
              🔗 Join group
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`)}
              style={{
                background: 'var(--color-surface)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px', padding: '24px',
                cursor: 'pointer', transition: 'all 150ms',
                position: 'relative', overflow: 'hidden',
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
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                opacity: 0.06, filter: 'blur(16px)', pointerEvents: 'none',
              }} />
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(79,70,229,0.2)',
              }}>
                👥
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                {group.name}
              </h3>
              {group.description && (
                <p style={{
                  fontSize: '0.8375rem', color: 'var(--color-text-secondary)',
                  marginBottom: '16px', lineHeight: 1.5,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                } as React.CSSProperties}>
                  {group.description}
                </p>
              )}
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                fontSize: '0.75rem', fontWeight: 600,
                color: roleColour(group.role),
                background: roleBg(group.role),
                padding: '3px 10px', borderRadius: '999px',
                border: `1px solid ${roleColour(group.role)}22`,
                textTransform: 'capitalize',
              }}>
                {group.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

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
        marginTop: '24px',
        display: 'inline-flex', alignItems: 'center', gap: '6px',
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
      case 'dashboard': return <DashboardView />
      case 'groups': return <GroupsView />
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
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 150ms',
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