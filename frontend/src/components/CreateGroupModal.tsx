import { useState } from 'react'
import { useGroupStore } from '../store/groupStore'
import { useNavigate } from 'react-router-dom'

interface CreateGroupModalProps {
  onClose: () => void
}

// modal for creating a new study group.
// on success navigates directly into the new group.
function CreateGroupModal({ onClose }: CreateGroupModalProps) {
  const navigate = useNavigate()
  const createGroup = useGroupStore((state) => state.createGroup)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const group = await createGroup(name, description, isPrivate)
      onClose()
      navigate(`/groups/${group.id}`)
    } catch {
      setError('Failed to create group. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface-raised)',
    color: 'var(--color-text-primary)',
    fontSize: '0.9375rem',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--color-primary)'
    e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.12)'
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--color-border)'
    e.target.style.boxShadow = 'none'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
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
        maxWidth: '480px',
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
              Create a study group
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Invite your classmates with a code after creating.
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
              <label style={labelStyle}>Group name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CS Finals 2025"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label style={labelStyle}>Description <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this group for?"
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'none',
                  lineHeight: 1.6,
                } as React.CSSProperties}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* private toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-raised)',
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                  Private group
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Only people with the invite code can join
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 200ms',
                  background: isPrivate
                    ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
                    : 'var(--color-border)',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: isPrivate ? '23px' : '3px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'white',
                  transition: 'left 200ms',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
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
                disabled={isSubmitting}
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
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1,
                  boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.3)'
                }}
              >
                {isSubmitting ? 'Creating...' : 'Create group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default CreateGroupModal