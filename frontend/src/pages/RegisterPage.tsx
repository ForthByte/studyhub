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

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <>
      {/* animated background orbs */}
      <div className="orb-container">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* theme toggle */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div className="auth-bg">
        <div className="auth-card glass-card">

          {/* header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '8px' }}>
              <span className="brand-gradient">Study Hub</span>
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
              Create your account
            </p>
          </div>

          {/* error banner */}
          {error && (
            <div className="banner-error" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="label">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="coolstudent42"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="label">Confirm password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ marginTop: '4px' }}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* login link */}
          <p style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
          }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default RegisterPage