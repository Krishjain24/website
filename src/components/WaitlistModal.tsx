import React, { useState } from 'react';
import { store } from '../services/orbitStore';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
  onSuccess?: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [builderRole, setBuilderRole] = useState<'frontend' | 'backend' | 'fullstack' | 'teams' | 'other'>('fullstack');
  const [company, setCompany] = useState('');
  const [useCase, setUseCase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
    position?: number;
    emailDispatched?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setStatus(null);

    const cleanEmail = email.toLowerCase().trim();
    if (!store.validateEmail(cleanEmail)) {
      setValidationError('Please enter a valid work email address with a domain (e.g. name@company.com).');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const entry = await store.joinWaitlist({
        email: cleanEmail,
        full_name: fullName.trim() || null,
        builder_role: builderRole,
        company: company.trim() || null,
        use_case: useCase.trim() || null,
      });

      setStatus({
        type: 'success',
        message: `You're in! Queue position #${entry.queue_position || '1'} reserved.`,
        position: entry.queue_position,
        emailDispatched: cleanEmail,
      });
      setEmail('');
      setFullName('');
      setCompany('');
      setUseCase('');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setStatus({
        type: 'error',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`orbit-modal-overlay ${isOpen ? 'is-active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-waitlist-title"
    >
      <div className="orbit-modal">
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        <div className="modal-header">
          <span className="eyebrow" style={{ color: 'var(--violet)' }}>
            EARLY ACCESS
          </span>
          <h3 id="modal-waitlist-title">Join the Orbit Waitlist</h3>
          <p>Get prioritized access to the agent-first workspace as we open new builder cohorts.</p>
        </div>
        <form className="orbit-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="wl-email">Work Email *</label>
            <input
              type="email"
              id="wl-email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="name@company.com"
              required
            />
            {validationError && (
              <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                {validationError}
              </span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="wl-name">Full Name</label>
            <input
              type="text"
              id="wl-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ada Lovelace"
            />
          </div>
          <div className="form-field">
            <label htmlFor="wl-role">Builder Role</label>
            <select
              id="wl-role"
              value={builderRole}
              onChange={(e) => setBuilderRole(e.target.value as 'frontend' | 'backend' | 'fullstack' | 'teams' | 'other')}
            >
              <option value="frontend">Frontend Developer</option>
              <option value="backend">Backend Architect / Engineer</option>
              <option value="fullstack">Full Stack Builder</option>
              <option value="teams">Engineering / Product Team</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="wl-company">Company / Organization</label>
            <input
              type="text"
              id="wl-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Corp or Independent"
            />
          </div>
          <div className="form-field">
            <label htmlFor="wl-use-case">Primary Project or Goal</label>
            <input
              type="text"
              id="wl-use-case"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="Building next-gen storefronts with AI agents..."
            />
          </div>
          <button type="submit" className="form-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Reserving spot...' : 'Reserve Your Spot'} <span>↗</span>
          </button>
          {status && (
            <div className={`form-status ${status.type}`} style={{ textAlign: 'left', padding: '14px' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: '14px' }}>{status.message}</p>
              {status.type === 'success' && (
                <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '6px', padding: '8px 10px', fontSize: '12px', marginTop: '8px' }}>
                  <p style={{ margin: '0 0 4px', color: '#15803d', fontWeight: 600 }}>
                    📬 Automated Gmail Confirmation Dispatched:
                  </p>
                  <p style={{ margin: 0, color: '#334155' }}>
                    Confirmation email sent to <strong>{status.emailDispatched}</strong> from <code>team@orbit.dev</code>. Once our administrators review your application, you will receive an acceptance token or cohort update directly.
                  </p>
                </div>
              )}
              {status.type === 'success' && onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  style={{
                    marginTop: '10px',
                    background: 'var(--ink)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 14px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  View entry in Admin Dashboard ◈
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
