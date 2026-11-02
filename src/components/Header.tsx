import React, { useState } from 'react';

interface HeaderProps {
  onOpenWaitlist: () => void;
  onOpenAdmin: () => void;
  onOpenPlatformDemo: () => void;
  onOpenQuickStart?: () => void;
  isAdminView?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWaitlist,
  onOpenPlatformDemo,
  onOpenQuickStart,
  isAdminView,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            if (isAdminView) {
              e.preventDefault();
              window.history.pushState(null, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }}
          aria-label="Orbit home"
        >
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none" width="32" height="32" style={{ maxWidth: '32px', maxHeight: '32px' }}>
              <circle cx="18" cy="18" r="12.5" stroke="currentColor" strokeWidth="1.7" />
              <ellipse cx="18" cy="18" rx="16" ry="6.3" transform="rotate(-34 18 18)" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="29.4" cy="8.2" r="2.6" fill="currentColor" />
            </svg>
          </span>
          <span>orbit</span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
        </button>

        <nav className={`main-navigation ${isOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {!isAdminView ? (
            <>
              <button
                type="button"
                className="nav-link"
                onClick={() => {
                  setIsOpen(false);
                  onOpenPlatformDemo();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'inherit',
                  padding: 0,
                  fontSize: '13px',
                }}
              >
                Platform Sandbox ↗
              </button>
              <a href="#workflow" onClick={() => setIsOpen(false)}>
                How it works
              </a>
              <a href="#for-builders" onClick={() => setIsOpen(false)}>
                For builders
              </a>
              {onOpenQuickStart && (
                <button
                  type="button"
                  className="nav-link"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenQuickStart();
                  }}
                  style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Start on Win / Mac ⚡
                </button>
              )}
              <button
                type="button"
                className="nav-cta btn-open-waitlist"
                onClick={() => {
                  setIsOpen(false);
                  onOpenWaitlist();
                }}
              >
                Get started <span aria-hidden="true">↗</span>
              </button>
            </>
          ) : (
            <>
              <a
                href="/"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  window.history.pushState(null, '', '/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                ← Back to Website
              </a>
              <button
                type="button"
                className="nav-cta btn-open-waitlist"
                onClick={() => {
                  setIsOpen(false);
                  onOpenWaitlist();
                }}
              >
                Join Waitlist <span aria-hidden="true">↗</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
