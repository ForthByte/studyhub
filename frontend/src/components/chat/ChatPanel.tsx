import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

// main chat panel — renders the message list, typing indicator and input box.
// connects to the active channel via WebSocket on mount and cleans up on unmount.
function ChatPanel() {
  const { user } = useAuthStore()
  const {
    messages,
    typingUsers,
    isConnected,
    isConnecting,
    activeChannel,
    onlineCount,
    sendMessage,
    sendTyping,
    sendStopTyping,
  } = useChatStore()

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const content = input.trim()
    if (!content || !isConnected) return

    sendMessage(content)
    setInput('')

    // clear typing indicator on send
    if (isTyping) {
      sendStopTyping()
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // send on Enter, allow Shift+Enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)

    // send typing indicator
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true)
      sendTyping()
    }

    // clear typing indicator after 2 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        sendStopTyping()
        setIsTyping(false)
      }
    }, 2000)

    // stop typing if input is cleared
    if (e.target.value.length === 0 && isTyping) {
      sendStopTyping()
      setIsTyping(false)
    }
  }

  // determine if a message should show its avatar/username
  // based on whether the previous message was from the same user
  const shouldShowAvatar = (index: number) => {
    if (index === 0) return true
    return messages[index].user_id !== messages[index - 1].user_id
  }

  // filter out typing indicators from the current user
  const otherTypingUsers = typingUsers.filter((u) => u.user_id !== user?.id)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
    }}>

      {/* channel header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--color-surface)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)' }}>#</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {activeChannel?.name ?? 'general'}
          </span>
          {activeChannel?.description && (
            <>
              <div style={{ width: '1px', height: '16px', background: 'var(--color-border)' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {activeChannel.description}
              </span>
            </>
          )}
        </div>

        {/* online count */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted)',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? '#059669' : 'var(--color-text-muted)',
          }} />
          {isConnected ? `${onlineCount} online` : isConnecting ? 'Connecting...' : 'Disconnected'}
        </div>
      </div>

      {/* messages list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {messages.length === 0 && !isConnecting ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💬</div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              No messages yet
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Be the first to say something in #{activeChannel?.name ?? 'general'}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                showAvatar={shouldShowAvatar(index)}
              />
            ))}
          </>
        )}

        {/* typing indicator */}
        {otherTypingUsers.length > 0 && (
          <TypingIndicator typingUsers={otherTypingUsers} />
        )}

        {/* scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* message input */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '14px',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface-raised)',
          transition: 'border-color 150ms',
        }}
          onFocus={() => {}}
        >
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? `Message #${activeChannel?.name ?? 'general'}` : 'Connecting...'}
            disabled={!isConnected}
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              color: 'var(--color-text-primary)',
              fontSize: '0.9375rem',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.5,
              maxHeight: '120px',
              overflowY: 'auto',
            }}
            onInput={(e) => {
              // auto-resize textarea
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${target.scrollHeight}px`
            }}
          />

          {/* send button */}
          <button
            onClick={handleSend}
            disabled={!isConnected || input.trim().length === 0}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              background: input.trim().length > 0 && isConnected
                ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                : 'var(--color-border)',
              color: '#ffffff',
              cursor: input.trim().length > 0 && isConnected ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 150ms',
              boxShadow: input.trim().length > 0 && isConnected
                ? '0 2px 8px rgba(79,70,229,0.3)'
                : 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel