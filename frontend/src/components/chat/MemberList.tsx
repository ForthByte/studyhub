import { usePresenceStore } from '../../store/presenceStore'
import type { GroupMember } from '../../store/groupStore'

interface MemberListProps {
  members: GroupMember[]
}

// member list panel — shows group members split into online and offline sections.
// displayed on the right side of the group chat, Discord style.
function MemberList({ members }: MemberListProps) {
  const { isOnline } = usePresenceStore()

  const onlineMembers = members.filter((m) => isOnline(m.user_id))
  const offlineMembers = members.filter((m) => !isOnline(m.user_id))

  const roleColour = (role: string) => {
    if (role === 'owner') return '#4F46E5'
    if (role === 'admin') return '#7C3AED'
    return 'var(--color-text-muted)'
  }

  const MemberRow = ({ member }: { member: GroupMember }) => {
    const online = isOnline(member.user_id)
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '6px 8px', borderRadius: '8px',
        transition: 'background 150ms', cursor: 'default',
      }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-raised)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        {/* avatar with online dot */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: online
              ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
              : 'var(--color-surface-raised)',
            border: online ? 'none' : '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700,
            color: online ? 'white' : 'var(--color-text-muted)',
            opacity: online ? 1 : 0.6,
          }}>
            {member.username[0].toUpperCase()}
          </div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '10px', height: '10px', borderRadius: '50%',
            background: online ? '#059669' : 'var(--color-text-muted)',
            border: '2px solid var(--color-surface)',
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.875rem', fontWeight: 500,
            color: online ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            opacity: online ? 1 : 0.7,
          }}>
            {member.username}
          </div>
          <div style={{
            fontSize: '0.7rem', fontWeight: 600,
            color: roleColour(member.role),
            textTransform: 'capitalize',
          }}>
            {member.role}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '220px',
      minHeight: '100vh',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 12px',
      background: 'var(--color-surface)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderLeft: '1px solid var(--color-border)',
      overflowY: 'auto',
    }}>

      {/* online members */}
      {onlineMembers.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            fontSize: '0.7rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--color-text-muted)', marginBottom: '8px',
            padding: '0 8px',
          }}>
            Online — {onlineMembers.length}
          </p>
          {onlineMembers.map((member) => (
            <MemberRow key={member.user_id} member={member} />
          ))}
        </div>
      )}

      {/* offline members */}
      {offlineMembers.length > 0 && (
        <div>
          <p style={{
            fontSize: '0.7rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--color-text-muted)', marginBottom: '8px',
            padding: '0 8px',
          }}>
            Offline — {offlineMembers.length}
          </p>
          {offlineMembers.map((member) => (
            <MemberRow key={member.user_id} member={member} />
          ))}
        </div>
      )}

      {members.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: '0.875rem' }}>No members</p>
        </div>
      )}
    </div>
  )
}

export default MemberList