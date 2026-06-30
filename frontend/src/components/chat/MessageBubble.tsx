import { useAuthStore } from '../../store/authStore'
import type {Message} from '../../store/chatStore'

interface MessageBubbleProps {
  message: Message
  showAvatar: boolean // false if the previous message was from the same user
}

// individual chat message bubble.
// groups consecutive messages from the same user to reduce visual noise,
// only showing the avatar and username on the first message in a group.
function MessageBubble({ message, showAvatar }: MessageBubbleProps) {
  const { user } = useAuthStore()
  const isOwn = message.user_id === user?.id

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isOwn ? 'flex-end' : 'flex-start',
      marginBottom: showAvatar ? '16px' : '4px',
      paddingLeft: isOwn ? '48px' : '0',
      paddingRight: isOwn ? '0' : '48px',
    }}>

      {/* username + timestamp — only shown on first message in a group */}
      {showAvatar && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px',
          flexDirection: isOwn ? 'row-reverse' : 'row',
        }}>
          {/* avatar */}
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: isOwn
              ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
              : 'linear-gradient(135deg, #059669, #0891B2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
          }}>
            {(message.username ?? '?')[0].toUpperCase()}
          </div>

          {/* name and time */}
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}>
            {isOwn ? 'You' : message.username ?? 'Unknown'}
          </span>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
          }}>
            {formatTime(message.created_at)}
          </span>
        </div>
      )}

      {/* message bubble */}
      <div style={{
        maxWidth: '100%',
        padding: '10px 14px',
        borderRadius: showAvatar
          ? isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px'
          : '16px',
        background: isOwn
          ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
          : 'var(--color-surface-raised)',
        border: isOwn ? 'none' : '1px solid var(--color-border)',
        color: isOwn ? '#ffffff' : 'var(--color-text-primary)',
        fontSize: '0.9375rem',
        lineHeight: 1.5,
        wordBreak: 'break-word',
        boxShadow: isOwn
          ? '0 2px 8px rgba(79,70,229,0.25)'
          : '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {message.content}
      </div>

      {/* timestamp for non-first messages in a group */}
      {!showAvatar && (
        <span style={{
          fontSize: '0.6875rem',
          color: 'var(--color-text-muted)',
          marginTop: '2px',
          opacity: 0,
          transition: 'opacity 150ms',
        }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
        >
          {formatTime(message.created_at)}
        </span>
      )}
    </div>
  )
}

export default MessageBubble