import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGroupStore } from '../store/groupStore'

interface JoinGroupModalProps {
  onClose: () => void
}

// modal for joining an existing study group via invite code.
// on success navigates directly into the joined group.
function JoinGroupModal({ onClose }: JoinGroupModalProps) {
  const navigate = useNavigate()
  const { joinGroup } = useGroupStore()

  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await joinGroup(inviteCode.trim().toUpperCase())
      // find the group we just joined and navigate into it
      const joined = useGroupStore.getState().groups.find(
        (g) => g.invite_code === inviteCode.trim().toUpperCase()
      )
      onClose()
      if (joined) navigate(`/groups/${joined.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid invite code. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
        }}
      />

      {/* modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 101,
        width: '100%',
        maxWidth: '440px',
        padding: '0 16px',
      }}>
        <div className="glass-card" style={{ padding: '40px' }}>

          {/* header */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontSize: '1.375rem',
              fontWeight: 700,
              marginBottom: '6px',
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
            }}>
              Join a study group
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Enter the invite code shared by your group owner.
            </p>
          </div>

          {/* error */}
          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'var(--color-error-bg)',
              border: '1px solid rgba(220,38,38,0.15)',
              color: 'var(--color-error)',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                marginBottom: '6px',
              }}>
                Invite code
              </label>
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123XY"
                maxLength={12}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-raised)',
                  color: 'var(--color-text-primary)',
                  fontSize: '1.125rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.1em',
                  outline: 'none',
                  textTransform: 'uppercase',
                  transition: 'border-color 150ms, box-shadow 150ms',
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
              <p style={{
                marginTop: '6px',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
              }}>
                Codes are not case sensitive
              </p>
            </div>

            {/* actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '11px 20px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-surface-raised)'
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || inviteCode.trim().length === 0}
                style={{
                  flex: 1,
                  padding: '11px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  color: '#ffffff',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  cursor: isSubmitting || inviteCode.trim().length === 0 ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || inviteCode.trim().length === 0 ? 0.6 : 1,
                  boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && inviteCode.trim().length > 0) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.3)'
                }}
              >
                {isSubmitting ? 'Joining...' : 'Join group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default JoinGroupModal