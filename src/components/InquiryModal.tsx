import React, { useState } from 'react';
import { store } from '../services/orbitStore';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
  onSuccess?: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [inquiryType, setInquiryType] = useState<'demo' | 'sales' | 'partnership' | 'general'>('demo');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim() || isSubmitting) return;

    if (!store.validateEmail(email)) {
      setStatus({
        type: 'error',
        message: 'Please enter a valid work email address (e.g. name@company.com).',
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      await store.submitInquiry({
        name,
        email,
        company: company.trim() || null,
        inquiry_type: inquiryType,
        message,
      });

      setStatus({
        type: 'success',
        message: "Thank you! We've received your inquiry and recorded it in SQLite (orbit.db).",
      });
      setName('');
      setEmail('');
      setCompany('');
      setMessage('');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Could not send inquiry. Please try again.';
      setStatus({
        type: 'error',
        message: errorMsg,
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
      aria-labelledby="modal-inquiry-title"
    >
      <div className="orbit-modal">
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          &times;
        </button>
        <div className="modal-header">
          <span className="eyebrow" style={{ color: 'var(--violet)' }}>
            ENTERPRISE & TEAMS
          </span>
          <h3 id="modal-inquiry-title">Request a Team Demo</h3>
          <p>Explore how Orbit can accelerate your engineering team's delivery loops.</p>
        </div>
        <form className="orbit-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="inq-name">Your Name *</label>
            <input
              type="text"
              id="inq-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah Connor"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="inq-email">Work Email *</label>
            <input
              type="email"
              id="inq-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@company.com"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="inq-company">Company</label>
            <input
              type="text"
              id="inq-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Skyline Tech"
            />
          </div>
          <div className="form-field">
            <label htmlFor="inq-type">Inquiry Type</label>
            <select
              id="inq-type"
              value={inquiryType}
              onChange={(e) => setInquiryType(e.target.value as 'demo' | 'sales' | 'partnership' | 'general')}
            >
              <option value="demo">Product Demo</option>
              <option value="sales">Sales & Pricing</option>
              <option value="partnership">Partnership</option>
              <option value="general">General Question</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="inq-message">Message / Team Size *</label>
            <textarea
              id="inq-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your team and what you are building..."
              required
            ></textarea>
          </div>
          <button type="submit" className="form-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Inquiry'} <span>→</span>
          </button>
          {status && (
            <div className={`form-status ${status.type}`}>
              <p style={{ margin: 0 }}>{status.message}</p>
              {status.type === 'success' && onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  style={{
                    marginTop: '8px',
                    background: 'var(--ink)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  View inquiries in Mission Control (Admin) ◈
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
