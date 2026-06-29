import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useFriendStore } from '../store/friendStore'
import { useDMStore } from '../store/dmStore'
import ThemeToggle from '../components/ThemeToggle'
import DMPanel from '../components/dm/DMPanel'

// DM page — renders a direct message conversation with another user.
// connects to the DM WebSocket on mount and disconnects on unmount.
function DMPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { friends, fetchFriends } = useFriendStore()
  const { connectToDM, disconnectFromDM } = useDMStore()

  useEffect(() => {
    fetchFriends()
  }, [])

  useEffect(() => {
    if (!userId) return

    // small delay to avoid React strict mode double-invoke closing the socket
    const timeout = setTimeout(() => {
      connectToDM(userId)
    }, 50)

    return () => {
      clearTimeout(timeout)
      disconnectFromDM()
    }
  }, [userId])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // find the other user's details from the friends list
  const otherUser = friends.find((f) => f.user_id === userId)
  const otherUsername = otherUser?.username ?? 'Unknown'

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
          ← Back
        </button>

        {/* dm header */}
        <div style={{ padding: '8px 12px', marginBottom: '24px' }}>
          <p style={{
            fontSize: '0.7rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--color-text-muted)', marginBottom: '8px',
          }}>
            Direct Messages
          </p>

          {/* friends list in sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {friends.map((friend) => {
              const isActive = friend.user_id === userId
              return (
                <button
                  key={friend.user_id}
                  onClick={() => navigate(`/dm/${friend.user_id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: '8px', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 150ms',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))'
                      : 'transparent',
                    borderLeft: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--color-surface-raised)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {/* avatar */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #059669, #0891B2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>
                    {friend.username[0].toUpperCase()}
                  </div>
                  <span style={{
                    fontSize: '0.9rem', fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {friend.username}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* spacer */}
        <div style={{ flex: 1 }} />

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
        {userId ? (
          <DMPanel
            otherUserId={userId}
            otherUsername={otherUsername}
          />
        ) : (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Select a conversation
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
              Choose a friend from the sidebar to start chatting.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default DMPage