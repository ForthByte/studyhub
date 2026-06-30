import type {TypingUser} from '../../store/chatStore'

interface TypingIndicatorProps {
  typingUsers: TypingUser[]
}

// displays an animated typing indicator showing which users are currently typing.
// shows up to 3 names before switching to "X people are typing..."
function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  const getText = () => {
    if (typingUsers.length === 1) return `${typingUsers[0].username} is typing`
    if (typingUsers.length === 2) return `${typingUsers[0].username} and ${typingUsers[1].username} are typing`
    if (typingUsers.length === 3) return `${typingUsers[0].username}, ${typingUsers[1].username} and ${typingUsers[2].username} are typing`
    return `${typingUsers.length} people are typing`
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 0 8px 0',
    }}>
      {/* animated dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              animation: 'typing-bounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <span style={{
        fontSize: '0.8125rem',
        color: 'var(--color-text-muted)',
        fontStyle: 'italic',
      }}>
        {getText()}
      </span>
    </div>
  )
}

export default TypingIndicator