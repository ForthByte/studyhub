import { useGroupStore } from '../../store/groupStore'
import { useFriendStore } from '../../store/friendStore'

// dashboard view — personal overview with stats and coming soon features grid.
// extracted into its own component to prevent recreation on every parent render.
function DashboardView({ username }: { username: string }) {
  const { groups } = useGroupStore()
  const { friends } = useFriendStore()

  const features = [
    { icon: '💬', label: 'Real-time Chat', desc: 'Message your group instantly. No lag, no refresh — powered by WebSockets.', gradient: 'linear-gradient(135deg, #2563EB, #4F46E5)' },
    { icon: '✅', label: 'Task Board', desc: 'Kanban-style task tracking. Drag cards between To Do, In Progress and Done.', gradient: 'linear-gradient(135deg, #059669, #0891B2)' },
    { icon: '🃏', label: 'Flashcards', desc: 'Build decks and study with spaced repetition. SM-2 algorithm built in.', gradient: 'linear-gradient(135deg, #7C3AED, #DB2777)' },
    { icon: '📝', label: 'Shared Notes', desc: "Rich-text notes your whole group can edit. See who's typing in real time.", gradient: 'linear-gradient(135deg, #D97706, #DC2626)' },
    { icon: '🤖', label: 'AI Study Sets', desc: 'Generate flashcards and quizzes from your notes using AI. Study smarter.', gradient: 'linear-gradient(135deg, #4F46E5, #0891B2)' },
    { icon: '⏳', label: 'Exam Countdown', desc: 'Add upcoming exams and watch the countdown. Colour coded by urgency.', gradient: 'linear-gradient(135deg, #0891B2, #059669)' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '8px' }}>
          Overview
        </p>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Welcome back, {username} 👋
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
          {groups.length > 0
            ? `You're in ${groups.length} study group${groups.length > 1 ? 's' : ''}.`
            : 'Create or join a study group to get started.'}
        </p>
      </div>

      {/* quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Study groups', value: groups.length, icon: '👥', color: '#4F46E5' },
          { label: 'Friends', value: friends.length, icon: '🤝', color: '#059669' },
          { label: 'Cards due today', value: 0, icon: '🃏', color: '#7C3AED' },
          { label: 'Upcoming exams', value: 0, icon: '⏳', color: '#D97706' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'var(--color-surface)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.25rem' }}>{stat.icon}</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color }}>
                {stat.value}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* coming soon features */}
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
        Coming soon
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {features.map((feature) => (
          <div
            key={feature.label}
            style={{
              background: 'var(--color-surface)', backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--color-border)',
              borderRadius: '20px', padding: '28px', transition: 'all 150ms',
              cursor: 'default', position: 'relative', overflow: 'hidden',
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
              position: 'absolute', top: '-30px', right: '-30px',
              width: '100px', height: '100px', borderRadius: '50%',
              background: feature.gradient, opacity: 0.06,
              filter: 'blur(20px)', pointerEvents: 'none',
            }} />
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: feature.gradient, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.375rem', marginBottom: '18px',
              boxShadow: '0 4px 12px rgba(79,70,229,0.2)',
            }}>
              {feature.icon}
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              {feature.label}
            </h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              {feature.desc}
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)',
              background: 'rgba(79,70,229,0.08)', padding: '4px 10px',
              borderRadius: '999px', border: '1px solid rgba(79,70,229,0.12)',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--color-primary)',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              In development
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardView