import { useNavigate } from 'react-router-dom'
import { useGroupStore } from '../../store/groupStore'

interface GroupsViewProps {
  onCreateGroup: () => void
  onJoinGroup: () => void
}

// groups view — shows the user's study groups grid with create and join actions.
// extracted into its own component to prevent recreation on every parent render.
function GroupsView({ onCreateGroup, onJoinGroup }: GroupsViewProps) {
  const navigate = useNavigate()
  const { groups, isLoading } = useGroupStore()

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
          onClick={onCreateGroup}
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
          onClick={onJoinGroup}
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
          border: '2px dashed var(--color-border)', background: 'var(--color-surface)',
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
              onClick={onCreateGroup}
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
              onClick={onJoinGroup}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                border: '1px solid var(--color-border)',
                background: 'transparent', color: 'var(--color-text-primary)',
                fontSize: '0.875rem', fontWeight: 600,
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
                background: 'var(--color-surface)', backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--color-border)',
                borderRadius: '16px', padding: '24px', cursor: 'pointer',
                transition: 'all 150ms', position: 'relative', overflow: 'hidden',
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
                  marginBottom: '16px', lineHeight: 1.5, overflow: 'hidden',
                  textOverflow: 'ellipsis', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                } as React.CSSProperties}>
                  {group.description}
                </p>
              )}
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                fontSize: '0.75rem', fontWeight: 600,
                color: roleColour(group.role), background: roleBg(group.role),
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
}

export default GroupsView