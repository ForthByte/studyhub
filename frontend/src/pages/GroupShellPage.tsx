import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useGroupStore } from '../store/groupStore'
import { useChatStore } from '../store/chatStore'
import ThemeToggle from '../components/ThemeToggle'
import ChatPanel from '../components/chat/ChatPanel'

function GroupShellPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { activeGroup, groups, fetchGroup, fetchGroups } = useGroupStore()
  const {
    channels,
    activeChannel,
    fetchChannels,
    setActiveChannel,
    disconnectFromChannel,
  } = useChatStore()

  useEffect(() => {
    if (!id || id === 'undefined') return

    fetchGroup(id)
    fetchGroups()

    // small delay to avoid React strict mode double-invoke closing the socket
    const timeout = setTimeout(() => {
      fetchChannels(id)
    }, 50)

    return () => {
      clearTimeout(timeout)
      disconnectFromChannel()
    }
  }, [id])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const currentGroup = groups.find((g) => g.id === id)
  const userRole = currentGroup?.role ?? 'member'

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
        width: '260px', minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px', position: 'fixed',
        left: 0, top: 0, bottom: 0, zIndex: 40,
        background: 'var(--color-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--color-border)',
      }}>

        {/* back button */}
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
        <div style={{ padding: '8px 12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
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

        {/* channels section */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 12px', marginBottom: '4px',
          }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
            }}>
              Channels
            </span>
            {(userRole === 'owner' || userRole === 'admin') && (
              <button
                style={{
                  width: '20px', height: '20px', borderRadius: '4px',
                  border: 'none', background: 'transparent',
                  color: 'var(--color-text-muted)', cursor: 'pointer',
                  fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 150ms',
                }}
                title="Add channel"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-surface-raised)'
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-muted)'
                }}
              >
                +
              </button>
            )}
          </div>

          {/* channel list */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
            {channels.map((channel) => {
              const isActive = activeChannel?.id === channel.id
              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '7px 12px', borderRadius: '8px', border: 'none',
                    cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 150ms',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))'
                      : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: isActive ? 600 : 400,
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
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>#</span>
                  {channel.name}
                  {channel.is_default && (
                    <span style={{
                      marginLeft: 'auto', fontSize: '0.65rem',
                      color: 'var(--color-text-muted)',
                      background: 'var(--color-surface-raised)',
                      padding: '1px 5px', borderRadius: '4px',
                    }}>
                      default
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* other features — coming soon */}
          <div style={{ marginTop: '16px' }}>
            <div style={{
              fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              padding: '0 12px', marginBottom: '4px',
            }}>
              Coming soon
            </div>
            {[
              { icon: '📝', label: 'Notes' },
              { icon: '✅', label: 'Tasks' },
              { icon: '🃏', label: 'Flashcards' },
              { icon: '📁', label: 'Files' },
              { icon: '⏳', label: 'Exam Countdown' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '7px 12px', borderRadius: '8px',
                  color: 'var(--color-text-muted)', fontSize: '0.875rem',
                  opacity: 0.5,
                }}
              >
                <span>{item.icon}</span>
                {item.label}
                <span style={{
                  marginLeft: 'auto', fontSize: '0.65rem',
                  background: 'var(--color-surface-raised)',
                  padding: '1px 5px', borderRadius: '4px',
                }}>
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* settings link */}
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
              marginTop: '8px', marginBottom: '8px',
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
        position: 'relative', zIndex: 1,
        height: '100vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {activeChannel ? (
          <ChatPanel />
        ) : (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Select a channel
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
              Choose a channel from the sidebar to start chatting.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default GroupShellPage