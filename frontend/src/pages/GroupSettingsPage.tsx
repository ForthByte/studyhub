import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useGroupStore } from '../store/groupStore'
import ThemeToggle from '../components/ThemeToggle'

// group settings page — shows invite code, members list and admin controls.
// accessible to group owners and admins only.
function GroupSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const {
    activeGroup, groups, members,
    fetchGroup, fetchGroups, fetchMembers,
    promoteToAdmin, demoteAdmin, leaveGroup, deleteGroup,
  } = useGroupStore()

  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchGroup(id)
      fetchGroups()
      fetchMembers(id)
    }
  }, [id, fetchGroup, fetchGroups, fetchMembers])

  const currentGroup = groups.find((g) => g.id === id)
  const userRole = currentGroup?.role ?? 'member'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // copy invite code to clipboard
  const handleCopyCode = () => {
    if (activeGroup?.invite_code) {
      navigator.clipboard.writeText(activeGroup.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLeave = async () => {
    if (!id) return
    setIsLeaving(true)
    try {
      await leaveGroup(id)
      navigate('/dashboard')
    } catch {
      setError('Failed to leave group.')
      setIsLeaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      await deleteGroup(id)
      navigate('/dashboard')
    } catch {
      setError('Failed to delete group.')
      setIsDeleting(false)
    }
  }

  const handlePromote = async (userId: string) => {
    if (!id) return
    try {
      await promoteToAdmin(id, userId)
    } catch {
      setError('Failed to promote member.')
    }
  }

  const handleDemote = async (userId: string) => {
    if (!id) return
    try {
      await demoteAdmin(id, userId)
    } catch {
      setError('Failed to demote admin.')
    }
  }

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

        {/* back to group */}
        <button
          onClick={() => navigate(`/groups/${id}`)}
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
          ← Back to group
        </button>

        {/* group name */}
        <div style={{ padding: '8px 12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                {activeGroup?.name ?? 'Loading...'}
              </div>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600,
                color: roleColour(userRole),
                background: roleBg(userRole),
                padding: '2px 8px', borderRadius: '999px',
                textTransform: 'capitalize',
              }}>
                {userRole}
              </span>
            </div>
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
        padding: '40px 48px',
        position: 'relative', zIndex: 1,
        minHeight: '100vh', maxWidth: '860px',
      }}>

        {/* header */}
        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '8px' }}>
            Settings
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)' }}>
            {activeGroup?.name ?? 'Group settings'}
          </h1>
        </div>

        {/* error */}
        {error && (
          <div style={{
            marginBottom: '24px', padding: '12px 16px', borderRadius: '12px',
            background: 'var(--color-error-bg)', border: '1px solid rgba(220,38,38,0.15)',
            color: 'var(--color-error)', fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        {/* invite code section */}
        <div style={{
          background: 'var(--color-surface)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--color-border)', borderRadius: '16px',
          padding: '28px', marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            Invite code
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            Share this code with anyone you want to invite to the group.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              flex: 1, padding: '12px 16px', borderRadius: '10px',
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)', fontSize: '1.25rem',
              fontWeight: 600, letterSpacing: '0.15em',
              color: 'var(--color-primary)',
            }}>
              {activeGroup?.invite_code ?? '...'}
            </div>
            <button
              onClick={handleCopyCode}
              style={{
                padding: '12px 20px', borderRadius: '10px',
                background: copied
                  ? 'rgba(5,150,105,0.1)'
                  : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: copied ? '#059669' : '#ffffff',
                fontSize: '0.875rem', fontWeight: 600,
                fontFamily: 'var(--font-sans)', cursor: 'pointer',
                transition: 'all 150ms',
                border: copied ? '1px solid rgba(5,150,105,0.3)' : 'none',
              } as React.CSSProperties}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* members section */}
        <div style={{
          background: 'var(--color-surface)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--color-border)', borderRadius: '16px',
          padding: '28px', marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            Members
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            {members.length} member{members.length !== 1 ? 's' : ''} in this group.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {members.map((member) => (
              <div
                key={member.user_id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '10px',
                  background: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {/* avatar */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem', fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                  {member.username[0].toUpperCase()}
                </div>

                {/* name + role */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {member.username}
                    {member.user_id === user?.id && (
                      <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>(you)</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{member.email}</div>
                </div>

                {/* role badge */}
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600,
                  color: roleColour(member.role),
                  background: roleBg(member.role),
                  padding: '3px 10px', borderRadius: '999px',
                  textTransform: 'capitalize',
                  border: `1px solid ${roleColour(member.role)}22`,
                }}>
                  {member.role}
                </span>

                {/* promote/demote buttons — owner only, not for yourself */}
                {userRole === 'owner' && member.user_id !== user?.id && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {member.role === 'member' && (
                      <button
                        onClick={() => handlePromote(member.user_id)}
                        style={{
                          padding: '5px 12px', borderRadius: '7px', border: 'none',
                          background: 'rgba(79,70,229,0.1)', color: '#4F46E5',
                          fontSize: '0.75rem', fontWeight: 600,
                          fontFamily: 'var(--font-sans)', cursor: 'pointer',
                          transition: 'all 150ms',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(79,70,229,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(79,70,229,0.1)'}
                      >
                        Make admin
                      </button>
                    )}
                    {member.role === 'admin' && (
                      <button
                        onClick={() => handleDemote(member.user_id)}
                        style={{
                          padding: '5px 12px', borderRadius: '7px', border: 'none',
                          background: 'rgba(220,38,38,0.08)', color: 'var(--color-error)',
                          fontSize: '0.75rem', fontWeight: 600,
                          fontFamily: 'var(--font-sans)', cursor: 'pointer',
                          transition: 'all 150ms',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.08)'}
                      >
                        Remove admin
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* danger zone */}
        <div style={{
          background: 'var(--color-surface)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(220,38,38,0.2)', borderRadius: '16px',
          padding: '28px',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-error)', marginBottom: '4px' }}>
            Danger zone
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            These actions are permanent and cannot be undone.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* leave group — not available to owner */}
            {userRole !== 'owner' && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px', borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-raised)',
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    Leave group
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    You will lose access to all group content.
                  </div>
                </div>
                <button
                  onClick={handleLeave}
                  disabled={isLeaving}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    background: 'rgba(220,38,38,0.1)', color: 'var(--color-error)',
                    fontSize: '0.875rem', fontWeight: 600,
                    fontFamily: 'var(--font-sans)', cursor: 'pointer',
                    opacity: isLeaving ? 0.6 : 1, transition: 'all 150ms',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.18)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.1)'}
                >
                  {isLeaving ? 'Leaving...' : 'Leave group'}
                </button>
              </div>
            )}

            {/* delete group — owner only */}
            {userRole === 'owner' && (
              <div style={{
                padding: '16px', borderRadius: '10px',
                border: '1px solid rgba(220,38,38,0.2)',
                background: 'rgba(220,38,38,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: confirmDelete ? '16px' : '0' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-error)', marginBottom: '2px' }}>
                      Delete group
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Permanently deletes the group and all its content for everyone.
                    </div>
                  </div>
                  {!confirmDelete && (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: 'none',
                        background: 'rgba(220,38,38,0.1)', color: 'var(--color-error)',
                        fontSize: '0.875rem', fontWeight: 600,
                        fontFamily: 'var(--font-sans)', cursor: 'pointer',
                        transition: 'all 150ms',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.18)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.1)'}
                    >
                      Delete group
                    </button>
                  )}
                </div>

                {/* confirmation */}
                {confirmDelete && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={{
                        flex: 1, padding: '9px', borderRadius: '8px',
                        border: '1px solid var(--color-border)', background: 'transparent',
                        color: 'var(--color-text-secondary)', fontSize: '0.875rem',
                        fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      style={{
                        flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
                        background: 'var(--color-error)', color: '#ffffff',
                        fontSize: '0.875rem', fontWeight: 600,
                        fontFamily: 'var(--font-sans)', cursor: 'pointer',
                        opacity: isDeleting ? 0.6 : 1,
                      }}
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, delete permanently'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default GroupSettingsPage