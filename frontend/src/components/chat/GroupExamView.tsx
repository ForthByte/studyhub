import { useEffect, useState } from 'react'
import { useExamStore } from '../../store/examStore'

interface GroupExamViewProps {
  groupId: string
  userRole: string
}

function getTimeRemaining(examDate: string) {
  const now = new Date()
  const target = new Date(examDate)
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { days, hours, minutes, diff }
}

function getUrgencyColour(diff: number) {
  const days = diff / (1000 * 60 * 60 * 24)
  if (days <= 3) return { color: '#DC2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.2)' }
  if (days <= 14) return { color: '#D97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.2)' }
  return { color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.2)' }
}

// group exam view — shows exams for a specific group.
// admins and owners can add exams visible to all members.
function GroupExamView({ groupId, userRole }: GroupExamViewProps) {
  const { groupExams, fetchGroupExams, createGroupExam, deleteExam } = useExamStore()

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [examDate, setExamDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, setTick] = useState(0)

  const canManage = userRole === 'owner' || userRole === 'admin'

  useEffect(() => {
    fetchGroupExams(groupId)
  }, [groupId])

  // update countdowns every minute
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await createGroupExam(groupId, name, subject || null, examDate)
      setName('')
      setSubject('')
      setExamDate('')
      setShowForm(false)
    } catch {
      setError('Failed to create exam. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const upcomingExams = groupExams.filter((e) => getTimeRemaining(e.exam_date) !== null)
  const pastExams = groupExams.filter((e) => getTimeRemaining(e.exam_date) === null)

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface-raised)',
    color: 'var(--color-text-primary)',
    fontSize: '0.9375rem',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
  }

  return (
    <div style={{ padding: '40px 48px', overflowY: 'auto', height: '100%' }}>

      {/* header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '6px' }}>
            Exam Countdown
          </p>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            Group Exams
          </h2>
        </div>

        {canManage && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              color: '#ffffff', fontSize: '0.9rem', fontWeight: 600,
              fontFamily: 'var(--font-sans)', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
              transition: 'all 150ms',
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
            {showForm ? '✕ Cancel' : '+ Add exam'}
          </button>
        )}
      </div>

      {/* add exam form */}
      {showForm && canManage && (
        <div style={{
          background: 'var(--color-surface)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--color-border)', borderRadius: '16px',
          padding: '28px', marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '20px' }}>
            Add a group exam
          </h3>

          {error && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '10px', background: 'var(--color-error-bg)', border: '1px solid rgba(220,38,38,0.15)', color: 'var(--color-error)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Exam name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Algorithms Final"
                style={inputStyle}
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
              <label style={labelStyle}>Subject <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science"
                style={inputStyle}
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
              <label style={labelStyle}>Exam date & time</label>
              <input
                type="datetime-local"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                style={inputStyle}
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
                padding: '11px 20px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: '#ffffff', fontSize: '0.9375rem', fontWeight: 600,
                fontFamily: 'var(--font-sans)', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
              }}
            >
              {isSubmitting ? 'Adding...' : 'Add exam'}
            </button>
          </form>
        </div>
      )}

      {/* upcoming exams */}
      {upcomingExams.length === 0 && !showForm ? (
        <div style={{
          padding: '48px 32px', borderRadius: '20px', textAlign: 'center',
          border: '2px dashed var(--color-border)', background: 'var(--color-surface)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⏳</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            No upcoming exams
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            {canManage ? 'Add an exam for your group using the button above.' : 'No exams have been added by your group admins yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {upcomingExams.map((exam) => {
            const remaining = getTimeRemaining(exam.exam_date)!
            const urgency = getUrgencyColour(remaining.diff)
            return (
              <div
                key={exam.id}
                style={{
                  background: 'var(--color-surface)', backdropFilter: 'blur(12px)',
                  border: `1px solid ${urgency.border}`,
                  borderRadius: '16px', padding: '24px',
                  display: 'flex', alignItems: 'center', gap: '24px',
                }}
              >
                {/* countdown */}
                <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                  {[
                    { value: remaining.days, label: 'days' },
                    { value: remaining.hours, label: 'hrs' },
                    { value: remaining.minutes, label: 'min' },
                  ].map((unit) => (
                    <div key={unit.label} style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '2rem', fontWeight: 800, color: urgency.color,
                        lineHeight: 1, fontFamily: 'var(--font-mono)',
                        background: urgency.bg, padding: '8px 12px',
                        borderRadius: '10px', minWidth: '56px',
                      }}>
                        {String(unit.value).padStart(2, '0')}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {unit.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* details */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                    {exam.name}
                  </h3>
                  {exam.subject && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                      {exam.subject}
                    </p>
                  )}
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    {new Date(exam.exam_date).toLocaleDateString('en-GB', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* urgency badge */}
                <div style={{
                  padding: '4px 12px', borderRadius: '999px',
                  background: urgency.bg, border: `1px solid ${urgency.border}`,
                  color: urgency.color, fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
                }}>
                  {remaining.days <= 3 ? '🔴 Soon' : remaining.days <= 14 ? '🟡 Coming up' : '🟢 Scheduled'}
                </div>

                {/* delete — admin/owner only */}
                {canManage && (
                  <button
                    onClick={() => deleteExam(exam.id)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      border: '1px solid var(--color-border)', background: 'transparent',
                      color: 'var(--color-text-muted)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all 150ms', fontSize: '1rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(220,38,38,0.08)'
                      e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)'
                      e.currentTarget.style.color = 'var(--color-error)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                      e.currentTarget.style.color = 'var(--color-text-muted)'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* past exams */}
      {pastExams.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
            Past exams
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pastExams.map((exam) => (
              <div key={exam.id} style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: '12px', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.6,
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    {exam.name}
                  </h3>
                  {exam.subject && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {exam.subject}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Completed</span>
                {canManage && (
                  <button
                    onClick={() => deleteExam(exam.id)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      border: '1px solid var(--color-border)', background: 'transparent',
                      color: 'var(--color-text-muted)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 150ms', fontSize: '0.875rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(220,38,38,0.08)'
                      e.currentTarget.style.color = 'var(--color-error)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--color-text-muted)'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupExamView