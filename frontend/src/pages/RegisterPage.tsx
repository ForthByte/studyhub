import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from '../components/ThemeToggle'

function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      await register(email, username, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle = {
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
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--color-primary)'
    e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.12)'
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--color-border)'
    e.target.style.boxShadow = 'none'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: '8px',
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

      {/* ── INNER WRAPPER ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1100px',
        padding: '40px',
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

          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '24px',
            letterSpacing: '-0.03em',
            color: 'var(--color-text-primary)',
          }}>
            Your group's<br />
            <span className="brand-gradient">second brain.</span>
          </h1>

          <p style={{
            fontSize: '1.125rem',
            lineHeight: 1.7,
            color: 'var(--color-text-secondary)',
            maxWidth: '420px',
            marginBottom: '48px',
          }}>
            Join thousands of students who study smarter together. Create a group, invite your friends and get started in seconds.
          </p>

          {/* stats */}
          <div style={{ display: 'flex', gap: '40px' }}>
            {[
              { value: '10k+', label: 'Students' },
              { value: '500+', label: 'Study groups' },
              { value: '100%', label: 'Free to start' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  marginBottom: '4px',
                }}>
                  <span className="brand-gradient">{stat.value}</span>
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                }}>
                  {stat.label}
                </div>
              </div>
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
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                marginBottom: '8px',
                letterSpacing: '-0.02em',
                color: 'var(--color-text-primary)',
              }}>
                Create your account
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                Free forever. No credit card required.
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
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label style={labelStyle}>Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="coolstudent42"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              <div>
                <label style={labelStyle}>Confirm password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
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
                {isSubmitting ? 'Creating account...' : 'Get started free →'}
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
                Already have an account?
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>

            <Link
              to="/login"
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
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage