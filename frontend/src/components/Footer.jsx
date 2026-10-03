import { Link } from 'react-router-dom'
import { Shield, ExternalLink, Phone } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer style={{ width: '100%', background: 'var(--color-surface-container-lowest)', borderTop: '1px solid rgba(196,197,215,0.4)', marginTop: 'var(--space-xl)' }}>
      {/* Advisory Banner */}
      <div style={{
        background: 'rgba(255,218,214,0.3)', borderBottom: '1px solid rgba(255,218,214,0.6)',
        padding: 'var(--space-sm) var(--margin)',
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-xs)', textAlign: 'center' }}>
          <Shield size={18} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
          <p className="text-label-md" style={{ color: 'var(--color-on-surface)' }}>
            <strong>{t.footer?.advisoryTitle || 'Official Advisory:'}</strong>{' '}
            {t.footer?.advisoryText || 'Sangyan Shield does NOT give investment advice or predict returns. We independently verify identity, credentials, and scam patterns before you transfer money.'}
          </p>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: 'var(--space-xl) var(--margin)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-xl)', paddingBottom: 'var(--space-lg)' }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', textDecoration: 'none' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #1f4fd8, #0f1f54)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(31, 79, 216, 0.25)'
              }}>
                <Shield size={18} color="#fff" />
              </div>
              <span className="text-headline-sm" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Sangyan Shield</span>
            </Link>
            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', maxWidth: 380, lineHeight: 1.6 }}>
              {t.footer?.brandDesc || 'National Civic Fintech AI Verification Shield for India. Real-time protection against UPI scams, fake investment apps, social engineering threats, and fraudulent sender handles.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', paddingTop: 'var(--space-xs)' }}>
              <Shield size={14} style={{ color: 'var(--color-tertiary)' }} />
              <span className="text-label-sm" style={{ color: 'var(--color-tertiary)', fontWeight: 700 }}>
                {t.footer?.confidentialBadge || '100% Confidential • Built for Bharat • Zero Data Selling'}
              </span>
            </div>
          </div>

          {/* Institutional Portals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <span className="text-label-lg" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-xs)', fontWeight: 700 }}>
              {t.footer?.portalsHeading || 'Institutional Portals'}
            </span>
            {[
              { label: 'National Cyber Crime Portal (cybercrime.gov.in)', href: 'https://cybercrime.gov.in' },
              { label: 'National Cyber Helpline: Dial 1930', href: 'tel:1930' },
              { label: 'SEBI SCORES Portal', href: 'https://scores.sebi.gov.in' },
              { label: 'RBI Kehta Hai Advisory', href: 'https://rbikehtahai.rbi.org.in' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="text-body-sm"
                style={{
                  color: 'var(--color-on-surface-variant)',
                  transition: 'color 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                  textDecoration: 'none'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-on-surface-variant)'}
              >
                <span>{link.label}</span>
                {link.href.startsWith('http') && <ExternalLink size={12} />}
              </a>
            ))}
          </div>

          {/* Quick Nav */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <span className="text-label-lg" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-xs)', fontWeight: 700 }}>
              {t.footer?.navHeading || 'Quick Navigation'}
            </span>
            {[
              { label: t.nav?.home || 'Home', to: '/' },
              { label: t.nav?.verify || 'Verify Workspace', to: '/verify' },
              { label: t.nav?.history || 'Audit History', to: '/history' },
              { label: t.nav?.learn || 'Learn (Micro-Lessons)', to: '/learn' },
              { label: t.nav?.report || 'Report Fraud', to: '/report' },
            ].map(link => (
              <Link
                key={link.label}
                to={link.to}
                className="text-body-sm"
                style={{ color: 'var(--color-on-surface-variant)', transition: 'color 0.2s', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-on-surface-variant)'}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '1px solid rgba(196,197,215,0.3)', paddingTop: 'var(--space-md)',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)',
        }}>
          <p className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
            © 2025 Sangyan Shield ({t.slogan?.split('•')[0]?.trim() || 'संज्ञान शील्ड'}). {t.footer?.rights || 'All rights reserved.'}
          </p>
          <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Designed for UPI & Digital Payment Users Across Bharat
          </span>
        </div>
      </div>
    </footer>
  )
}
