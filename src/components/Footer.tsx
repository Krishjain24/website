import React, { useState } from 'react';
import { store } from '../services/orbitStore';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenQuickStart?: () => void;
  onOpenPlatformDemo?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenQuickStart, onOpenPlatformDemo }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string; emailSent?: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();
    if (!store.validateEmail(cleanEmail)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid work email address (e.g. name@company.com).',
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      await store.subscribeNewsletter(cleanEmail, 'landing_footer');
      setStatus({
        type: 'success',
        message: `✓ Subscribed successfully! A welcome confirmation dispatch was automatically delivered to ${cleanEmail}.`,
        emailSent: cleanEmail,
      });
      setEmail('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not subscribe. Please try again.';
      setStatus({
        type: 'error',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="site-footer" id="footer">
      <div className="shell">
        <div className="footer-newsletter-box">
          <div className="newsletter-info">
            <h4>Stay ahead with Orbit engineering updates</h4>
            <p>Get bi-weekly architecture deep-dives, agent orchestration templates, and cohort release announcements.</p>
          </div>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status) setStatus(null);
              }}
              placeholder="Enter your work email"
              required
              aria-label="Work email for newsletter"
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {status && (
            <div
              style={{
                width: '100%',
                fontSize: '13px',
                marginTop: '10px',
                color: status.type === 'success' ? '#10b981' : '#ef4444',
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              {status.message}
            </div>
          )}
        </div>
      </div>

      <div className="shell footer-columns-grid">
        <div className="footer-col brand-col">
          <a className="brand footer-brand" href="#top" aria-label="Orbit home">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 36 36" fill="none" width="32" height="32" style={{ maxWidth: '32px', maxHeight: '32px' }}>
                <circle cx="18" cy="18" r="12.5" stroke="currentColor" strokeWidth="1.7" />
                <ellipse cx="18" cy="18" rx="16" ry="6.3" transform="rotate(-34 18 18)" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="29.4" cy="8.2" r="2.6" fill="currentColor" />
              </svg>
            </span>
            <span>orbit</span>
          </a>
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
            The agent-first development workspace. Plan, execute, and verify software systems with autonomous AI orchestrations.
          </p>
        </div>

        <div className="footer-col">
          <h5>Workspace</h5>
          <nav aria-label="Workspace links">
            {onOpenPlatformDemo && (
              <button
                type="button"
                onClick={onOpenPlatformDemo}
                className="footer-nav-btn"
              >
                Platform Sandbox ↗
              </button>
            )}
            <a href="#workflow">How it works</a>
            <a href="#for-builders">Persona architecture</a>
            {onOpenQuickStart && (
              <button
                type="button"
                onClick={onOpenQuickStart}
                className="footer-nav-btn"
                style={{ color: '#10b981' }}
              >
                1-Click Launchers ⚡
              </button>
            )}
          </nav>
        </div>

        <div className="footer-col">
          <h5>Architecture</h5>
          <nav aria-label="Architecture links">
            <a href="#workflow">Outcome Synthesis</a>
            <a href="#workflow">Branch Isolation</a>
            <a href="#workflow">Headless Verification</a>
            <a href="#for-builders">Full-Stack Sync</a>
          </nav>
        </div>

        <div className="footer-col developer-col">
          <h5>Developer & Admin Tools</h5>
          <nav aria-label="Developer links">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="footer-admin-link"
              id="btn-footer-admin-login"
            >
              <span>◈</span> Admin Login
            </button>
            <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
              Internal access for waitlist review, approval dispatches, and SQLite database controls.
            </p>
            {onOpenQuickStart && (
              <button
                type="button"
                onClick={onOpenQuickStart}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '11px',
                  padding: '4px 0',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                Download start.bat / start.sh
              </button>
            )}
          </nav>
        </div>
      </div>

      <div className="shell footer-bottom">
        <span>© 2026 Orbit Studio • All Rights Reserved</span>
        <span>
          Built for what’s next <i>✳</i>
        </span>
      </div>
    </footer>
  );
};
