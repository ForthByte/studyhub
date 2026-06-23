import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from '../components/ThemeToggle'

function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
    }}>

      {/* orbs */}
      <div className="orb-container">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* theme toggle */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100 }}>
        <ThemeToggle />
      </div>

      {/* ── INNER WRAPPER — centres and constrains the two panels ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1100px',
        padding: '40px 40px',
        gap: '60px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* ── LEFT PANEL ── */}
        <div
          className="hidden-mobile"
          style={{
            flex: '1 1 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* logo mark */}
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            marginBottom: '48px',
            boxShadow: '0 8px 32px rgba(79,70,229,0.35)',
          }}>
            📚
          </div>

          {/* headline */}
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '24px',
            letterSpacing: '-0.03em',
            color: 'var(--color-text-primary)',
          }}>
            Study smarter,<br />
            <span className="brand-gradient">together.</span>
          </h1>

          <p style={{
            fontSize: '1.125rem',
            lineHeight: 1.7,
            color: 'var(--color-text-secondary)',
            maxWidth: '420px',
            marginBottom: '48px',
          }}>
            Shared notes, real-time chat, flashcards and task boards — everything your study group needs in one place.
          </p>

          {/* feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['👥 Study Groups', '💬 Real-time Chat', '🃏 Flashcards', '✅ Task Boards', '📝 Shared Notes'].map((f) => (
              <span key={f} style={{
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                backdropFilter: 'blur(12px)',
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex: '0 0 420px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div className="glass-card" style={{ padding: '48px 44px' }}>

            {/* header */}
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                marginBottom: '8px',
                letterSpacing: '-0.02em',
                color: 'var(--color-text-primary)',
              }}>
                Welcome back
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                Sign in to your Study Hub account
              </p>
            </div>

            {/* error */}
            {error && (
              <div style={{
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'var(--color-error-bg)',
                border: '1px solid rgba(220,38,38,0.15)',
                color: 'var(--color-error)',
                fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            {/* form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '8px',
                }}>
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-raised)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.9375rem',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
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
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                  }}>
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-raised)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.9375rem',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
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
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  color: '#ffffff',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1,
                  boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
                  transition: 'opacity 150ms, transform 150ms, box-shadow 150ms',
                  marginTop: '4px',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.45)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.35)'
                }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>

            {/* divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '24px 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                New to Study Hub?
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>

            <Link
              to="/register"
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-raised)',
                color: 'var(--color-text-primary)',
                fontSize: '0.9375rem',
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                textAlign: 'center',
                textDecoration: 'none',
                transition: 'border-color 150ms, background 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(79,70,229,0.3)'
                e.currentTarget.style.background = 'var(--color-surface-solid)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.background = 'var(--color-surface-raised)'
              }}
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage