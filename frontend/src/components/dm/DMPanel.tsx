import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useDMStore } from '../../store/dmStore'
import MessageBubble from '../chat/MessageBubble'
import TypingIndicator from '../chat/TypingIndicator'
import type {Message} from "../../store/chatStore.ts";

interface DMPanelProps {
  otherUserId: string
  otherUsername: string
}

// direct message panel — renders the DM conversation between the current user
// and another user. reuses the same message bubble and typing indicator
// components as the group chat for visual consistency.
function DMPanel({ otherUsername }: DMPanelProps) {
  const { user } = useAuthStore()
  const {
    messages,
    typingUsers,
    isConnected,
    isConnecting,
    sendMessage,
    sendTyping,
    sendStopTyping,
  } = useDMStore()

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

    if (isTyping) {
      sendStopTyping()
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)

    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true)
      sendTyping()
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        sendStopTyping()
        setIsTyping(false)
      }
    }, 2000)

    if (e.target.value.length === 0 && isTyping) {
      sendStopTyping()
      setIsTyping(false)
    }
  }

  const shouldShowAvatar = (index: number) => {
    if (index === 0) return true
    return messages[index].user_id !== messages[index - 1].user_id
  }

  const otherTypingUsers = typingUsers.filter((u: { user_id: string }) => u.user_id !== user?.id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* avatar */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669, #0891B2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.875rem', fontWeight: 700, color: 'white',
          }}>
            {otherUsername[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {otherUsername}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Direct message
            </div>
          </div>
        </div>

        {/* connection status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '0.8125rem', color: 'var(--color-text-muted)',
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: isConnected ? '#059669' : 'var(--color-text-muted)',
          }} />
          {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
        </div>
      </div>

      {/* messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '24px',
        display: 'flex', flexDirection: 'column',
      }}>
        {messages.length === 0 && !isConnecting ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', color: 'var(--color-text-muted)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>👋</div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              Start a conversation
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Send {otherUsername} a message to get started.
            </p>
          </div>
        ) : (
          messages.map((message: Message, index: number) => (
            <MessageBubble
              key={message.id}
              message={message}
              showAvatar={shouldShowAvatar(index)}
            />
          ))
        )}

        {otherTypingUsers.length > 0 && (
          <TypingIndicator typingUsers={otherTypingUsers} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* input */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: '12px',
          padding: '12px 16px', borderRadius: '14px',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface-raised)',
        }}>
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? `Message ${otherUsername}` : 'Connecting...'}
            disabled={!isConnected}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              outline: 'none', resize: 'none',
              color: 'var(--color-text-primary)',
              fontSize: '0.9375rem', fontFamily: 'var(--font-sans)',
              lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${target.scrollHeight}px`
            }}
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || input.trim().length === 0}
            style={{
              width: '36px', height: '36px', borderRadius: '10px', border: 'none',
              background: input.trim().length > 0 && isConnected
                ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                : 'var(--color-border)',
              color: '#ffffff', cursor: input.trim().length > 0 && isConnected ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 150ms',
              boxShadow: input.trim().length > 0 && isConnected ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
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

export default DMPanel