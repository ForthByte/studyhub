import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFriendStore } from '../../store/friendStore'
import { usePresenceStore } from '../../store/presenceStore'

// DMs view — shows all friends as DM conversations with online status.
// accessible directly from the dashboard sidebar without going through friends list.
function DMsView() {
  const navigate = useNavigate()
  const { friends, fetchFriends } = useFriendStore()
  const { fetchStatus, isOnline } = usePresenceStore()

  useEffect(() => {
    fetchFriends()
  }, [])

  useEffect(() => {
    if (friends.length === 0) return
    const ids = friends.map((f) => f.user_id)
    fetchStatus(ids)
    const interval = setInterval(() => fetchStatus(ids), 30000)
    return () => clearInterval(interval)
  }, [friends])

  return (
    <div>
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '8px' }}>
          Direct Messages
        </p>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Messages
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
          {friends.length > 0 ? `${friends.length} conversation${friends.length > 1 ? 's' : ''}` : 'Add friends to start messaging.'}
        </p>
      </div>

      {friends.length === 0 ? (
        <div style={{
          padding: '48px 32px', borderRadius: '20px', textAlign: 'center',
          border: '2px dashed var(--color-border)', background: 'var(--color-surface)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>💬</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            No conversations yet
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            Add friends first then you can message them directly.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {friends.map((friend) => {
            const online = isOnline(friend.user_id)
            return (
              <div
                key={friend.user_id}
                onClick={() => navigate(`/dm/${friend.user_id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px 20px', borderRadius: '14px',
                  background: 'var(--color-surface)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer', transition: 'all 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(79,70,229,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                {/* avatar with online dot */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #059669, #0891B2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.125rem', fontWeight: 700, color: 'white',
                  }}>
                    {friend.username[0].toUpperCase()}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 1, right: 1,
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: online ? '#059669' : 'var(--color-text-muted)',
                    border: '2px solid var(--color-surface)',
                  }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    {friend.username}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: online ? '#059669' : 'var(--color-text-muted)' }}>
                    {online ? '● Online' : '○ Offline'}
                  </div>
                </div>

                {/* message button */}
                <div style={{
                  padding: '6px 14px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  color: '#ffffff', fontSize: '0.8125rem', fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
                }}>
                  Message →
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DMsView