import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFriendStore } from '../../store/friendStore'

// friends view — shows the friends list, incoming requests and add friend input.
// extracted into its own component to prevent input focus loss caused by
// inner component recreation on every parent render.
function FriendsView() {
  const navigate = useNavigate()
  const {
    friends,
    incomingRequests,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  } = useFriendStore()

  const [friendInput, setFriendInput] = useState('')
  const [friendError, setFriendError] = useState<string | null>(null)
  const [friendSuccess, setFriendSuccess] = useState<string | null>(null)
  const [isSendingRequest, setIsSendingRequest] = useState(false)

  const handleSendFriendRequest = async () => {
    if (!friendInput.trim()) return
    setFriendError(null)
    setFriendSuccess(null)
    setIsSendingRequest(true)
    try {
      await sendFriendRequest(friendInput.trim())
      setFriendSuccess(`Friend request sent to ${friendInput.trim()}!`)
      setFriendInput('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send friend request.'
      const axiosError = err as { response?: { data?: { detail?: string } } }
      setFriendError(axiosError.response?.data?.detail ?? message)
    } finally {
      setIsSendingRequest(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '8px' }}>
          Friends
        </p>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Your friends
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
          {friends.length > 0 ? `${friends.length} friend${friends.length > 1 ? 's' : ''}` : 'Add friends to start direct messaging.'}
        </p>
      </div>

      {/* add friend */}
      <div style={{
        background: 'var(--color-surface)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--color-border)', borderRadius: '16px',
        padding: '24px', marginBottom: '24px',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          Add a friend
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
          Send a friend request by username.
        </p>

        {friendError && (
          <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '10px', background: 'var(--color-error-bg)', border: '1px solid rgba(220,38,38,0.15)', color: 'var(--color-error)', fontSize: '0.875rem' }}>
            {friendError}
          </div>
        )}
        {friendSuccess && (
          <div style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', color: '#059669', fontSize: '0.875rem' }}>
            {friendSuccess}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={friendInput}
            onChange={(e) => setFriendInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendFriendRequest()}
            placeholder="Enter username..."
            style={{
              flex: 1, padding: '10px 14px', borderRadius: '10px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-raised)',
              color: 'var(--color-text-primary)',
              fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)'
              e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.12)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)'
              e.target.style.boxShadow = 'none'
            }}
          />
          <button
            onClick={handleSendFriendRequest}
            disabled={isSendingRequest || friendInput.trim().length === 0}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              color: '#ffffff', fontSize: '0.9rem', fontWeight: 600,
              fontFamily: 'var(--font-sans)', cursor: 'pointer',
              opacity: isSendingRequest || friendInput.trim().length === 0 ? 0.6 : 1,
              boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
            }}
          >
            {isSendingRequest ? 'Sending...' : 'Send request'}
          </button>
        </div>
      </div>

      {/* incoming requests */}
      {incomingRequests.length > 0 && (
        <div style={{
          background: 'var(--color-surface)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--color-border)', borderRadius: '16px',
          padding: '24px', marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Incoming requests ({incomingRequests.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {incomingRequests.map((req) => (
              <div key={req.friendship_id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '10px',
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem', fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                  {req.username[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {req.username}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {req.email}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => acceptRequest(req.friendship_id)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', border: 'none',
                      background: 'rgba(5,150,105,0.1)', color: '#059669',
                      fontSize: '0.8125rem', fontWeight: 600,
                      fontFamily: 'var(--font-sans)', cursor: 'pointer',
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => declineRequest(req.friendship_id)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', border: 'none',
                      background: 'rgba(220,38,38,0.08)', color: 'var(--color-error)',
                      fontSize: '0.8125rem', fontWeight: 600,
                      fontFamily: 'var(--font-sans)', cursor: 'pointer',
                    }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* friends list */}
      <div style={{
        background: 'var(--color-surface)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--color-border)', borderRadius: '16px',
        padding: '24px',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
          Friends {friends.length > 0 && `(${friends.length})`}
        </h3>

        {friends.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤝</div>
            <p style={{ fontSize: '0.9rem' }}>No friends yet — send a request above!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {friends.map((friend) => (
              <div key={friend.user_id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '10px',
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #059669, #0891B2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem', fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                  {friend.username[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {friend.username}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {friend.email}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate(`/dm/${friend.user_id}`)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', border: 'none',
                      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      color: '#ffffff', fontSize: '0.8125rem', fontWeight: 600,
                      fontFamily: 'var(--font-sans)', cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
                    }}
                  >
                    Message
                  </button>
                  <button
                    onClick={() => removeFriend(friend.user_id)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      background: 'transparent', color: 'var(--color-text-muted)',
                      fontSize: '0.8125rem', fontWeight: 600,
                      fontFamily: 'var(--font-sans)', cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FriendsView