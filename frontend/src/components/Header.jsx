import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Phone, Globe, ChevronDown, Menu, X,
  Languages, Check, User, AlertTriangle, ExternalLink,
  ShieldAlert, Bell, LogOut, Copy, FileText, ArrowRight,
  ShieldCheck, Lock, Smartphone, CheckCircle2
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function Header() {
  const { currentLang, setLanguage, t, languages } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  
  // Interactive Modal / Dropdown States
  const [langOpen, setLangOpen] = useState(false)
  const [helplineModalOpen, setHelplineModalOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [copiedHelpline, setCopiedHelpline] = useState(false)
  const [alertsEnabled, setAlertsEnabled] = useState(true)

  const navLinks = [
    { path: '/', label: t.nav.home },
    { path: '/verify', label: t.nav.verify },
    { path: '/history', label: t.nav.history },
    { path: '/learn', label: t.nav.learn },
    { path: '/report', label: t.nav.report },
  ]

  const langRef = useRef(null)
  const profileRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Trigger floating toast
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Scroll listener
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close overlays on route change
  useEffect(() => {
    setMobileOpen(false)
    setLangOpen(false)
    setProfileOpen(false)
    setHelplineModalOpen(false)
  }, [location.pathname])

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Language selection handler
  const handleSelectLanguage = (lang) => {
    setLanguage(lang.code)
    setLangOpen(false)
    showToast(`Language switched: ${lang.label} (${lang.sub})`)
  }

  // Copy 1930
  const handleCopy1930 = () => {
    navigator.clipboard.writeText('1930')
    setCopiedHelpline(true)
    showToast('National Cyber Helpline "1930" copied!')
    setTimeout(() => setCopiedHelpline(false), 2000)
  }

  const toggleMobile = useCallback(() => setMobileOpen(p => !p), [])

  const currentLangObj = languages.find(l => l.code === currentLang) || languages[0]

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 100,
          background: scrolled
            ? 'rgba(255,255,255,0.96)'
            : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${scrolled ? 'rgba(196,197,215,0.6)' : 'rgba(196,197,215,0.3)'}`,
          boxShadow: scrolled ? 'var(--shadow-header)' : 'none',
          transition: 'box-shadow 0.3s, border-color 0.3s',
        }}
      >
        <div
          style={{
            height: 72,
            maxWidth: 1440,
            margin: '0 auto',
            padding: '0 var(--margin)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-md)',
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #1f4fd8, #0f1f54)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(31, 79, 216, 0.25)',
              flexShrink: 0
            }}>
              <Shield size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="logo-title" style={{ color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Sangyan Shield
              </span>
              <span className="logo-slogan" style={{ color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
                {t.slogan || 'संज्ञान शील्ड • Verify Before You Pay'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }} className="desktop-nav">
            {navLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className="text-label-lg"
                style={({ isActive }) => ({
                  padding: 'var(--space-sm) 0',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                  fontWeight: isActive ? 700 : 600,
                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  transition: 'color 0.2s, border-color 0.2s',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none'
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            
            {/* 1. LANGUAGE BUTTON & DROPDOWN */}
            <div ref={langRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setLangOpen(prev => !prev)}
                className="text-label-md lang-header-btn"
                aria-label="Switch Language"
                aria-expanded={langOpen}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 10px', borderRadius: 'var(--radius-full)',
                  background: langOpen ? 'var(--color-primary-fixed)' : 'var(--color-surface-container-low)',
                  color: langOpen ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                  border: `1px solid ${langOpen ? 'var(--color-primary)' : 'transparent'}`,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  fontSize: 12,
                }}
              >
                <Languages size={15} />
                <span className="lang-full-label">{currentLangObj.label} / EN</span>
                <span className="lang-compact-label">{currentLangObj.code.toUpperCase()}</span>
                <ChevronDown size={13} className="lang-chevron" style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: 230,
                      maxWidth: 'calc(100vw - 32px)',
                      background: '#ffffff',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: '0 12px 32px rgba(15, 31, 84, 0.14)',
                      border: '1px solid var(--color-outline-variant)',
                      padding: 8,
                      zIndex: 110,
                    }}
                  >
                    <div style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, color: 'var(--color-outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Select Language / भाषा चुनें
                    </div>
                    <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                      {languages.map((lang) => {
                        const isSelected = currentLang === lang.code
                        return (
                          <div
                            key={lang.code}
                            onClick={() => handleSelectLanguage(lang)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              background: isSelected ? 'var(--color-primary-fixed)' : 'transparent',
                              color: isSelected ? 'var(--color-primary)' : 'var(--color-on-surface)',
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: isSelected ? 700 : 500,
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'var(--color-surface-container-low)'
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'transparent'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{lang.label}</span>
                              <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>{lang.sub}</span>
                            </div>
                            {isSelected && <Check size={16} color="var(--color-primary)" />}
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. EMERGENCY 1930 HELPLINE BUTTON */}
            <button
              type="button"
              onClick={() => setHelplineModalOpen(true)}
              className="text-label-md helpline-btn"
              aria-label="National Cyber Fraud Helpline 1930"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 'var(--radius-full)',
                background: 'var(--color-error-container)',
                color: 'var(--color-on-error-container)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.15)',
                fontSize: 12,
                flexShrink: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Phone size={14} style={{ color: 'var(--color-error)' }} />
              <span>1930</span>
            </button>

            {/* 3. PROFILE BUTTON & DROPDOWN */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setProfileOpen(prev => !prev)}
                className="profile-section"
                aria-expanded={profileOpen}
                aria-label="User Profile"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '3px 6px', borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  background: profileOpen ? 'var(--color-surface-container-high)' : 'transparent',
                  transition: 'background 0.2s',
                  userSelect: 'none'
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1f4fd8, #4e5b93)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ffffff', fontWeight: 700, fontSize: 12,
                  boxShadow: '0 2px 6px rgba(15, 31, 84, 0.2)',
                  position: 'relative',
                  flexShrink: 0
                }}>
                  RK
                  <span style={{
                    position: 'absolute', bottom: -1, right: -1,
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#16a34a', border: '2px solid #ffffff'
                  }} />
                </div>
                <span className="text-label-md profile-name" style={{ color: 'var(--color-on-surface)', fontWeight: 600, fontSize: 13 }}>
                  Rajesh K.
                </span>
                <ChevronDown size={14} className="profile-chevron" style={{ color: 'var(--color-on-surface-variant)', transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: 290,
                      background: '#ffffff',
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: '0 16px 36px rgba(15, 31, 84, 0.18)',
                      border: '1px solid var(--color-outline-variant)',
                      padding: 'var(--space-md)',
                      zIndex: 110,
                    }}
                  >
                    {/* User Card */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-surface-container-high)' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1f4fd8, #0f1f54)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#ffffff', fontWeight: 700, fontSize: 16
                      }}>
                        RK
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Rajesh Kumar
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                          rajesh.k@nic.in
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, padding: '2px 6px', background: 'var(--risk-safe-bg)', borderRadius: 9999 }}>
                          <ShieldCheck size={11} color="var(--risk-safe-text)" />
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--risk-safe-text)' }}>Aadhaar & DigiLocker Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Profile Nav Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 0', borderBottom: '1px solid var(--color-surface-container-high)' }}>
                      <div
                        onClick={() => {
                          setProfileOpen(false)
                          navigate('/history')
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13,
                          color: 'var(--color-on-surface)', fontWeight: 500, transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-container-low)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <FileText size={16} color="var(--color-primary)" />
                        <span>My Verification History</span>
                      </div>

                      <div
                        onClick={() => {
                          setProfileOpen(false)
                          navigate('/report')
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13,
                          color: 'var(--color-on-surface)', fontWeight: 500, transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-container-low)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <ShieldAlert size={16} color="var(--color-error)" />
                        <span>Reported Frauds & FIR Drafts</span>
                      </div>

                      <div
                        onClick={() => {
                          setAlertsEnabled(p => !p)
                          showToast(`Threat Alerts ${!alertsEnabled ? 'Enabled' : 'Disabled'}`)
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13,
                          color: 'var(--color-on-surface)', fontWeight: 500, transition: 'background 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-container-low)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Bell size={16} color="var(--color-secondary)" />
                          <span>SMS & UPI Alert Push</span>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 9999,
                          background: alertsEnabled ? 'var(--risk-safe-bg)' : 'var(--color-surface-container-high)',
                          color: alertsEnabled ? 'var(--risk-safe-text)' : 'var(--color-outline)'
                        }}>
                          {alertsEnabled ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>

                    {/* Sign out */}
                    <div
                      onClick={() => {
                        setProfileOpen(false)
                        showToast('Logged out of verified session')
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                        marginTop: 4, borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        fontSize: 13, color: 'var(--color-error)', fontWeight: 600, transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--risk-danger-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} />
                      <span>Sign Out / Switch Identity</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="mobile-menu-btn"
              onClick={toggleMobile}
              style={{
                display: 'none', width: 40, height: 40,
                alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-container-low)',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* 4. EMERGENCY 1930 ACTION MODAL */}
      <AnimatePresence>
        {helplineModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--margin)',
              background: 'rgba(11, 19, 43, 0.7)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={() => setHelplineModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 540,
                background: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 25px 50px -12px rgba(11, 19, 43, 0.35)',
                overflow: 'hidden',
                border: '1px solid var(--color-outline-variant)'
              }}
            >
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #0b132b 0%, #1f4fd8 100%)',
                color: '#ffffff',
                padding: 'var(--space-lg) var(--space-xl)',
                position: 'relative'
              }}>
                <button
                  onClick={() => setHelplineModalOpen(false)}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'rgba(255,255,255,0.15)', border: 'none',
                    color: '#ffffff', width: 32, height: 32, borderRadius: '50%',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'rgba(220, 38, 38, 0.85)', borderRadius: 9999, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                  <AlertTriangle size={13} />
                  CIVIC EMERGENCY PROTOCOL (I4C)
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '2px 0 6px', color: '#ffffff' }}>
                  National Cyber Crime Helpline: 1930
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: '#dce1ff', lineHeight: 1.4 }}>
                  Operated by Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs.
                </p>
              </div>

              {/* Modal Body */}
              <div style={{ padding: 'var(--space-xl)' }}>
                {/* Golden hour notice */}
                <div style={{
                  display: 'flex', gap: 12, padding: 'var(--space-md)',
                  background: 'var(--risk-caution-bg)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--risk-caution-border)', marginBottom: 'var(--space-lg)'
                }}>
                  <AlertTriangle size={20} color="var(--risk-caution-text)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--risk-caution-text)' }}>
                      Act in the "Golden Hour" (First 2 Hours)
                    </div>
                    <div style={{ fontSize: 13, color: '#78350f', marginTop: 2 }}>
                      Calling 1930 immediately enables automated fund-freezing across beneficiary banks and UPI handles before scammers can siphon funds through mule accounts.
                    </div>
                  </div>
                </div>

                {/* Steps checklist */}
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-outline)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Keep These Ready for the Operator:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      '12-digit UPI UTR number or Bank SMS transaction ID',
                      'Exact amount defrauded and the suspect\'s UPI ID / Phone number',
                      'Your bank account / debit card number used in the transaction'
                    ].map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-on-surface)' }}>
                        <CheckCircle2 size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Dial Action */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                  <a
                    href="tel:1930"
                    className="btn btn-primary"
                    style={{
                      flex: '1 1 200px',
                      background: '#dc2626',
                      color: '#ffffff',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 20px',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      fontSize: 15,
                      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)'
                    }}
                  >
                    <Phone size={18} /> Call 1930 Now (Toll Free)
                  </a>

                  <button
                    type="button"
                    onClick={handleCopy1930}
                    className="btn btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface-container-low)',
                      border: '1px solid var(--color-outline-variant)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: 13
                    }}
                  >
                    {copiedHelpline ? <Check size={16} color="var(--color-primary)" /> : <Copy size={16} />}
                    {copiedHelpline ? 'Copied' : 'Copy Number'}
                  </button>
                </div>

                {/* Secondary navigation to report / cybercrime.gov.in */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-surface-container-high)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setHelplineModalOpen(false)
                      navigate('/report')
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    Prepare FIR Evidence Dossier <ArrowRight size={14} />
                  </button>

                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--color-on-surface-variant)',
                      fontSize: 13,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    Official Portal (MHA) <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. FLOATING INTERACTION TOAST */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            style={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              zIndex: 300,
              background: '#0b132b',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.01em',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <ShieldCheck size={16} color="#7ffc97" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="mobile-nav-overlay"
            style={{
              position: 'fixed', top: 72, left: 0, right: 0, bottom: 0,
              zIndex: 99, background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(12px)', padding: 'var(--margin)',
              display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
            }}
          >
            {/* Mobile User Card */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', background: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-outline-variant)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1f4fd8, #0f1f54)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ffffff', fontWeight: 700, fontSize: 14
                }}>
                  RK
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-on-surface)' }}>Rajesh Kumar</div>
                  <div style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>rajesh.k@nic.in • Verified</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    navigate('/history')
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: 11, borderRadius: 'var(--radius-sm)' }}
                >
                  History
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    navigate('/report')
                  }}
                  className="btn btn-primary"
                  style={{ padding: '6px 10px', fontSize: 11, borderRadius: 'var(--radius-sm)' }}
                >
                  Reports
                </button>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: '8px 0' }}>
              {navLinks.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className="text-label-lg"
                  style={({ isActive }) => ({
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface)',
                    background: isActive ? 'var(--color-primary-fixed)' : 'transparent',
                    fontWeight: isActive ? 700 : 600,
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  })}
                >
                  <span>{link.label}</span>
                  <ArrowRight size={14} style={{ opacity: 0.5 }} />
                </NavLink>
              ))}
            </div>

            {/* Quick Language Selection Chips in Mobile Menu */}
            <div style={{ padding: '8px 0', borderTop: '1px solid var(--color-surface-container-high)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-outline)', textTransform: 'uppercase', marginBottom: 8 }}>
                Language / भाषा:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${currentLang === lang.code ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                      background: currentLang === lang.code ? 'var(--color-primary-fixed)' : 'transparent',
                      color: currentLang === lang.code ? 'var(--color-primary)' : 'var(--color-on-surface)',
                      fontSize: 12,
                      fontWeight: currentLang === lang.code ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency 1930 Button */}
            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--color-surface-container-high)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <button
                onClick={() => {
                  setMobileOpen(false)
                  setHelplineModalOpen(true)
                }}
                className="btn btn-primary"
                style={{ width: '100%', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 14 }}
              >
                <Phone size={18} />
                Emergency 1930 Hotline
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-menu-btn { display: none !important; }
        .profile-name { display: inline !important; }
        .profile-chevron { display: inline !important; }
        .lang-full-label { display: inline !important; }
        .lang-compact-label { display: none !important; }
        .logo-title { font-size: 18px; }
        .logo-slogan { font-size: 11px; white-space: nowrap; }

        @media (max-width: 1199px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }

        @media (max-width: 768px) {
          .profile-name { display: none !important; }
          .profile-chevron { display: none !important; }
          .lang-full-label { display: none !important; }
          .lang-compact-label { display: inline !important; }
          .logo-title { font-size: 16px; }
          .logo-slogan { font-size: 10px; }
          .slogan-en { display: none; }
          .slogan-dot { display: none; }
        }

        @media (max-width: 480px) {
          .logo-title { font-size: 15px; }
          .logo-slogan { font-size: 9.5px; }
          .helpline-btn span { display: none; }
          .lang-chevron { display: none; }
        }

        @media (max-width: 360px) {
          .logo-slogan { display: none; }
        }
      `}</style>
    </>
  )
}
