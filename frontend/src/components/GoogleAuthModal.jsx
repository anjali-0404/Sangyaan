import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Shield, Check, ArrowRight } from 'lucide-react'
import { useAuth, PRESET_GOOGLE_ACCOUNTS } from '../context/AuthContext'

export default function GoogleAuthModal() {
  const { isGoogleModalOpen, closeGoogleModal, loginWithGoogle, loginWithCustomGoogle, user } = useAuth()
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customEmail, setCustomEmail] = useState('')
  const [customName, setCustomName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isGoogleModalOpen) return null

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    if (!customEmail || !customEmail.includes('@')) {
      setErrorMsg('Please enter a valid Google email address (e.g. name@gmail.com)')
      return
    }
    setErrorMsg('')
    loginWithCustomGoogle(customEmail, customName || customEmail.split('@')[0])
    setCustomEmail('')
    setCustomName('')
    setShowCustomInput(false)
  }

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
          background: 'rgba(11, 19, 43, 0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
        onClick={closeGoogleModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 440,
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 25px 50px -12px rgba(15, 31, 84, 0.35)',
            border: '1px solid #dadce0',
            overflow: 'hidden',
            fontFamily: 'Roboto, Inter, -apple-system, sans-serif'
          }}
        >
          {/* Header */}
          <div style={{ padding: '24px 24px 16px', position: 'relative', textAlign: 'center' }}>
            <button
              type="button"
              onClick={closeGoogleModal}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'transparent',
                border: 'none',
                color: '#5f6368',
                cursor: 'pointer',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f4'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X size={18} />
            </button>

            {/* Google G Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <svg width="32" height="32" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.15z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.21v3.15C3.25 21.43 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.21C.44 8.12 0 9.99 0 12s.44 3.88 1.21 5.42l4.11-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.57 1.21 6.58l4.11 3.15c.94-2.83 3.58-4.98 6.68-4.98z" />
              </svg>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#202124', margin: '0 0 6px' }}>
              Sign in with Google
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#5f6368', margin: 0 }}>
              to continue to <strong style={{ color: '#0037b1' }}>Sangyan Shield</strong>
            </p>
          </div>

          <div style={{ height: 1, background: '#dadce0', margin: '0 24px' }} />

          {/* Account Picker */}
          <div style={{ padding: '16px 24px 20px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#5f6368', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {showCustomInput ? 'Enter your Google Account' : 'Choose an account'}
            </div>

            {!showCustomInput ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PRESET_GOOGLE_ACCOUNTS.map((account) => {
                  const isCurrent = user?.email === account.email

                  return (
                    <div
                      key={account.id}
                      onClick={() => loginWithGoogle(account)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: isCurrent ? '1.5px solid #1a73e8' : '1px solid #e8eaed',
                        background: isCurrent ? '#f1f6fd' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = '#f8f9fa'
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: account.avatarColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: 14
                        }}>
                          {account.initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#202124' }}>
                            {account.name}
                          </div>
                          <div style={{ fontSize: 12, color: '#5f6368' }}>
                            {account.email}
                          </div>
                        </div>
                      </div>
                      {isCurrent ? (
                        <span style={{ fontSize: 11, color: '#1a73e8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Check size={14} /> Active
                        </span>
                      ) : (
                        <ArrowRight size={14} color="#80868b" />
                      )}
                    </div>
                  )
                })}

                {/* Option to use another Google account */}
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed #dadce0',
                    background: '#ffffff',
                    color: '#1a73e8',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    marginTop: 6,
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#f1f3f4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#5f6368'
                  }}>
                    <UserPlus size={18} />
                  </div>
                  <span>Use another Google account</span>
                </button>
              </div>
            ) : (
              /* Custom Account Form */
              <form onSubmit={handleCustomSubmit}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3c4043', marginBottom: 4 }}>
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #dadce0',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3c4043', marginBottom: 4 }}>
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Anjali Sharma"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #dadce0',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {errorMsg && (
                  <div style={{ color: '#d93025', fontSize: 12, marginBottom: 12 }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(false)
                      setErrorMsg('')
                    }}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      border: '1px solid #dadce0',
                      borderRadius: 6,
                      color: '#5f6368',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 20px',
                      background: '#1a73e8',
                      border: 'none',
                      borderRadius: 6,
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Privacy & Zero-Trust Notice */}
            <div style={{
              marginTop: 18,
              paddingTop: 12,
              borderTop: '1px solid #f1f3f4',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              color: '#5f6368',
              lineHeight: 1.4
            }}>
              <Shield size={16} color="#34a853" style={{ flexShrink: 0 }} />
              <span>
                To continue, Google shares your name & email with Sangyan Shield. 100% zero-server storage policy.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
