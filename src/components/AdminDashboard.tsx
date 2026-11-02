import React, { useState, useEffect } from 'react';
import { store } from '../services/orbitStore';
import { AgentService } from '../services/agentService';
import { WaitlistEntry, Inquiry, User, DashboardStats, AgentDemoResponse, EmailLog, NewsletterSubscriber } from '../types';

interface AdminDashboardProps {
  onBackToWebsite: () => void;
}

type AdminTab = 'overview' | 'waitlist' | 'inquiries' | 'subscribers' | 'emails' | 'copilot' | 'database' | 'users' | 'agents';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToWebsite }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 3,
    total_waitlist: 5,
    pending_waitlist: 3,
    approved_waitlist: 1,
    rejected_waitlist: 0,
    total_inquiries: 3,
    new_inquiries: 1,
    total_subscribers: 2,
    total_emails_sent: 3,
    total_projects: 3,
    total_agent_tasks: 12,
    builder_role_breakdown: {},
    inquiry_type_breakdown: {},
  });

  // Data states
  const [waitlistFilter, setWaitlistFilter] = useState('');
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState('');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rawDbData, setRawDbData] = useState<any>(null);
  const [activeDbTable, setActiveDbTable] = useState<'waitlist' | 'inquiries' | 'subscribers' | 'emails' | 'users'>('waitlist');

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Email preview modal
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);

  // AI Copilot state
  const [copilotPrompt, setCopilotPrompt] = useState('Analyze my waitlist and recommend which applicants to approve first.');
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);
  const [copilotHistory, setCopilotHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string; suggestions?: string[] }>>([
    {
      role: 'assistant',
      content: `### ◈ Welcome to Orbit AI Copilot\n\nI am connected to your local **SQLite database (orbit.db)**. I can help you:\n\n• **Analyze Waitlist Applications** — evaluate roles, priority scores, and company profiles.\n• **Draft Personalized Emails** — generate custom approval or rejection templates for candidate cohorts.\n• **Database Health Audits** — check for duplicates, inspect table schemas, and predict conversion rates.\n\nClick a suggestion below or type your question:`,
      suggestions: [
        'Analyze applicant priority',
        'Draft approval email for enterprise teams',
        'Database health audit',
      ],
    },
  ]);

  // Agent studio state
  const [agentPrompt, setAgentPrompt] = useState('Add an agent review check before running database migrations.');
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentDemoResponse | null>(null);

  // Forgot password state
  const [isForgotPwOpen, setIsForgotPwOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ success: boolean; message: string; recovery_code?: string } | null>(null);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // Add admin state
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'user'>('admin');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [addAdminError, setAddAdminError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const refreshData = async () => {
    try {
      const [newStats, newWaitlist, newInquiries, newSubs, newMails, newUsers, newRaw] = await Promise.all([
        store.getStats(),
        store.getWaitlist(waitlistFilter),
        store.getInquiries(inquiryFilter),
        store.getNewsletterSubscribers(),
        store.getEmailLogs(),
        store.getUsers(),
        store.getRawDatabase(),
      ]);
      setStats(newStats);
      setWaitlistEntries(newWaitlist);
      setInquiries(newInquiries);
      setSubscribers(newSubs);
      setEmailLogs(newMails);
      setUsers(newUsers);
      setRawDbData(newRaw);
    } catch (e) {
      console.error('Error refreshing admin data:', e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
    const handleDataUpdated = () => {
      refreshData();
    };
    window.addEventListener('orbit:data-updated', handleDataUpdated);
    return () => window.removeEventListener('orbit:data-updated', handleDataUpdated);
  }, [currentUser, waitlistFilter, inquiryFilter]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const user = await store.login(emailInput, passwordInput);
      setCurrentUser(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setLoginError(message);
    }
  };

  // Directly return to the website upon logout
  const handleLogout = () => {
    store.logout();
    setCurrentUser(null);
    onBackToWebsite();
  };

  const handleApproveWaitlist = async (entry: WaitlistEntry) => {
    await store.updateWaitlistStatus(entry.id, 'approved');
    await refreshData();
    showToast(`✓ Approved ${entry.full_name || entry.email}! Access granted email dispatched to applicant's Gmail.`);
  };

  const handleRejectWaitlist = async (entry: WaitlistEntry) => {
    await store.updateWaitlistStatus(entry.id, 'rejected');
    await refreshData();
    showToast(`Cohort update email dispatched to ${entry.email} (Status: rejected).`);
  };

  const handleUpdateInquiryStatus = async (
    id: number,
    status: 'new' | 'in_review' | 'contacted' | 'closed'
  ) => {
    await store.updateInquiryStatus(id, status);
    await refreshData();
    showToast(`✓ Inquiry #${id} marked as ${status}.`);
  };

  const handleReleaseEmail = async (emailId: string) => {
    await store.releaseEmail(emailId);
    await refreshData();
    showToast(`✓ Email #${emailId} released and delivered to Gmail!`);
  };

  const handleSendCopilotQuery = async (queryText?: string) => {
    const text = queryText || copilotPrompt;
    if (!text.trim() || isCopilotThinking) return;

    setIsCopilotThinking(true);
    setCopilotHistory(prev => [...prev, { role: 'user', content: text }]);
    setCopilotPrompt('');

    try {
      const result = await store.askAdminAi(text);
      setCopilotHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: result.answer,
          suggestions: result.suggestions,
        },
      ]);
    } catch {
      setCopilotHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to analyze SQLite database at this moment. Please check server logs.',
        },
      ]);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  const handleRunAgentStudio = () => {
    if (!agentPrompt.trim() || isAgentRunning) return;
    setIsAgentRunning(true);
    setTimeout(() => {
      const res = AgentService.simulateDemo(agentPrompt, 'fullstack');
      setAgentResult(res);
      setIsAgentRunning(false);
    }, 450);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotSubmitting(true);
    try {
      const res = await store.forgotPassword(forgotEmail);
      setForgotStatus(res);
    } catch (err: any) {
      setForgotStatus({
        success: false,
        message: err.message || 'Unable to process recovery right now.',
      });
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminError(null);
    setIsAddingAdmin(true);
    try {
      await store.addAdminUser({
        email: newAdminEmail,
        full_name: newAdminName,
        role: newAdminRole,
      });
      await refreshData();
      showToast(`✓ Admin user '${newAdminEmail}' registered in SQLite successfully!`);
      setIsAddAdminOpen(false);
      setNewAdminEmail('');
      setNewAdminName('');
    } catch (err: any) {
      setAddAdminError(err.message || 'Failed to create administrator account');
    } finally {
      setIsAddingAdmin(false);
    }
  };

  // If not logged in, show Auth overlay
  if (!currentUser) {
    return (
      <div className="auth-overlay">
        <div className="auth-card">
          <div className="brand">
            <span className="brand-mark">◈</span>
            <h2>Admin Login</h2>
          </div>
          <p className="auth-subtitle">
            Developer & Administrative Management Portal for Orbit Workspace
          </p>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="admin-email">Admin Work Email</label>
              <input
                type="email"
                id="admin-email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@orbit.dev"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="admin-password">Password</label>
              <input
                type="password"
                id="admin-password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••••••"
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPwOpen(true);
                  setForgotStatus(null);
                  setForgotEmail(emailInput || 'admin@orbit.dev');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--violet)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Forgot Password?
              </button>
            </div>
            <button type="submit" className="btn btn-primary" id="btn-login" style={{ width: '100%', minHeight: '44px' }}>
              Authenticate as Administrator <span>→</span>
            </button>
            {loginError && <p className="error-text">{loginError}</p>}
          </form>

          <div style={{ marginTop: '16px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '11px', color: '#64748b' }}>
            <strong>Default Credentials:</strong><br />
            Email: <code>admin@orbit.dev</code> • Password: <code>OrbitAdminPassword2026!</code>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onBackToWebsite}>
              ← Back to Live Website
            </button>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {isForgotPwOpen && (
          <div className="orbit-modal-backdrop" onClick={() => setIsForgotPwOpen(false)}>
            <div className="orbit-modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
              <button type="button" className="modal-close-btn" onClick={() => setIsForgotPwOpen(false)}>
                &times;
              </button>
              <div className="modal-header">
                <span className="eyebrow" style={{ color: 'var(--violet)' }}>
                  ACCOUNT SECURITY
                </span>
                <h3>Password Recovery</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  Reset or recover administrator credentials for Orbit Mission Control.
                </p>
              </div>

              {forgotStatus ? (
                <div style={{ padding: '16px 0' }}>
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '12px',
                    color: '#15803d',
                    marginBottom: '14px',
                    lineHeight: 1.5,
                  }}>
                    {forgotStatus.message}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setEmailInput('admin@orbit.dev');
                      setPasswordInput('OrbitAdminPassword2026!');
                      setIsForgotPwOpen(false);
                    }}
                  >
                    Auto-fill Master Credentials & Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} style={{ marginTop: '14px' }}>
                  <div className="input-group">
                    <label htmlFor="recovery-email">Admin Email</label>
                    <input
                      type="email"
                      id="recovery-email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@orbit.dev"
                      required
                    />
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', fontSize: '11px', color: '#64748b', marginBottom: '14px' }}>
                    Need urgent access? Master administrator credentials are initialized by default in <code>orbit.db</code>.
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsForgotPwOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={isForgotSubmitting}>
                      {isForgotSubmitting ? 'Sending...' : 'Send Recovery Dispatch →'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="admin-toast-notice">
          {toastMessage}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">◈</span>
          <span>orbit</span>
          <span className="admin-badge">ADMIN PORTAL</span>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'waitlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('waitlist')}
          >
            Waitlist <span className="badge">{waitlistEntries.length}</span>
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            Inquiries <span className="badge">{inquiries.length}</span>
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'subscribers' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscribers')}
          >
            Subscribers <span className="badge">{subscribers.length}</span>
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'emails' ? 'active' : ''}`}
            onClick={() => setActiveTab('emails')}
          >
            Email Outbox <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>{emailLogs.length}</span>
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'copilot' ? 'active' : ''}`}
            onClick={() => setActiveTab('copilot')}
            style={{ fontWeight: 600, color: 'var(--violet)' }}
          >
            AI Copilot ✳
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            Database (orbit.db)
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Accounts
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveTab('agents')}
          >
            Agent Studio
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="avatar">A</div>
            <div>
              <strong>{currentUser.full_name || 'Administrator'}</strong>
              <small>{currentUser.email}</small>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAddAdminOpen(true)}
              style={{ flex: 1, fontSize: '11px', padding: '6px 8px' }}
            >
              + Add Admin
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
              title="Sign out and return to website"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div>
            <h1>
              {activeTab === 'overview' && 'Mission Overview'}
              {activeTab === 'waitlist' && 'Waitlist Queue & Access Approvals'}
              {activeTab === 'inquiries' && 'Inquiries & Demo Requests'}
              {activeTab === 'subscribers' && 'Newsletter Subscribers (Landing Footer)'}
              {activeTab === 'emails' && 'Automated Email Dispatch & Outbox'}
              {activeTab === 'copilot' && 'Orbit AI Copilot & Database Analyst'}
              {activeTab === 'database' && 'SQLite Database Explorer (orbit.db)'}
              {activeTab === 'users' && 'Registered User Accounts'}
              {activeTab === 'agents' && 'Interactive Agent Studio'}
            </h1>
            <p className="page-subtitle">
              Connected to local SQLite database (<code>orbit.db</code>) • Real-time synchronization
            </p>
          </div>
          <div className="top-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setIsAddAdminOpen(true)}
              className="btn btn-secondary"
            >
              + Add Admin
            </button>
            <button type="button" onClick={onBackToWebsite} className="btn btn-ghost">
              View Website ↗
            </button>
          </div>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-label">TOTAL WAITLIST APPLICANTS</span>
                <strong className="metric-value">{waitlistEntries.length}</strong>
                <span className="metric-trend">{stats.pending_waitlist} pending admin review</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">APPROVED COHORT BUILDERS</span>
                <strong className="metric-value" style={{ color: '#16a34a' }}>
                  {waitlistEntries.filter(w => w.status === 'approved' || w.status === 'invited').length}
                </strong>
                <span className="metric-trend">Tokens dispatched via Gmail</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">CUSTOMER INQUIRIES</span>
                <strong className="metric-value">{inquiries.length}</strong>
                <span className="metric-trend">{stats.new_inquiries} unread requests</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">NEWSLETTER SUBSCRIBERS</span>
                <strong className="metric-value">{subscribers.length}</strong>
                <span className="metric-trend">Collected from landing footer</span>
              </div>
            </div>

            <div className="breakdown-grid">
              <div className="card">
                <h3>Builder Roles Distribution</h3>
                <div className="role-bars">
                  {Object.entries(stats.builder_role_breakdown).map(([role, count]) => {
                    const total = Object.values(stats.builder_role_breakdown).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={role} className="bar-row">
                        <span style={{ width: '90px', textTransform: 'capitalize' }}>{role}</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span style={{ fontWeight: 600 }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card">
                <h3>Inquiry Types Breakdown</h3>
                <div className="role-bars">
                  {Object.entries(stats.inquiry_type_breakdown).map(([type, count]) => {
                    const total = Object.values(stats.inquiry_type_breakdown).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={type} className="bar-row">
                        <span style={{ width: '90px', textTransform: 'capitalize' }}>{type}</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%`, background: 'var(--lime)' }}></div>
                        </div>
                        <span style={{ fontWeight: 600 }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WAITLIST TAB */}
        {activeTab === 'waitlist' && (
          <div className="table-card">
            <div className="table-header">
              <div>
                <h3>Waitlist Applicants ({waitlistEntries.length} registered in SQLite)</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Use <strong>Approve</strong> or <strong>Reject</strong> to grant access and automatically trigger email notifications to the applicant's Gmail.
                </p>
              </div>
              <div className="filters">
                <select
                  value={waitlistFilter}
                  onChange={(e) => setWaitlistFilter(e.target.value)}
                  className="admin-select"
                  style={{ width: 'auto' }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="invited">Invited</option>
                </select>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Queue #</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Company</th>
                    <th>Use Case</th>
                    <th>Status</th>
                    <th>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlistEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px' }}>
                        No waitlist applicants found matching filter.
                      </td>
                    </tr>
                  ) : (
                    waitlistEntries.map((item, index) => (
                      <tr key={item.id}>
                        <td>
                          <strong>#{item.queue_position || index + 1}</strong>
                        </td>
                        <td>
                          <strong>{item.email}</strong>
                        </td>
                        <td>{item.full_name || '—'}</td>
                        <td>
                          <span className="badge" style={{ textTransform: 'capitalize' }}>
                            {item.builder_role}
                          </span>
                        </td>
                        <td>{item.company || 'Independent'}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.use_case || '—'}
                        </td>
                        <td>
                          <span className={`status-pill status-${item.status}`}>{item.status}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{
                                background: item.status === 'approved' ? '#dcfce7' : '#16a34a',
                                color: item.status === 'approved' ? '#166534' : '#fff',
                                border: 'none',
                              }}
                              onClick={() => handleApproveWaitlist(item)}
                            >
                              {item.status === 'approved' ? '✓ Approved' : 'Accept / Approve'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{
                                background: item.status === 'rejected' ? '#fee2e2' : '#f1f5f9',
                                color: item.status === 'rejected' ? '#991b1b' : '#64748b',
                                border: '1px solid #cbd5e1',
                              }}
                              onClick={() => handleRejectWaitlist(item)}
                            >
                              {item.status === 'rejected' ? '✕ Rejected' : 'Reject'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBSCRIBERS TAB */}
        {activeTab === 'subscribers' && (
          <div className="table-card">
            <div className="table-header">
              <div>
                <h3>Landing Page Newsletter Subscribers ({subscribers.length})</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Recorded in real-time whenever a visitor submits their email in the homepage footer.
                </p>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Source</th>
                    <th>Welcome Mail Status</th>
                    <th>Subscribed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px' }}>
                        No newsletter subscribers recorded yet.
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((sub, idx) => (
                      <tr key={sub.id || idx}>
                        <td>#{sub.id || idx + 1}</td>
                        <td>
                          <strong>{sub.email}</strong>
                        </td>
                        <td>
                          <span className="badge">{sub.source || 'landing_footer'}</span>
                        </td>
                        <td>
                          <span className="status-pill status-approved">
                            ✓ Sent to Gmail
                          </span>
                        </td>
                        <td>
                          <small>{new Date(sub.created_at).toLocaleDateString()}</small>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INQUIRIES TAB */}
        {activeTab === 'inquiries' && (
          <div className="table-card">
            <div className="table-header">
              <h3>Customer & Partner Inquiries ({inquiries.length})</h3>
              <select
                value={inquiryFilter}
                onChange={(e) => setInquiryFilter(e.target.value)}
                className="admin-select"
                style={{ width: 'auto' }}
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="in_review">In Review</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Type</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px' }}>
                        No inquiries received yet.
                      </td>
                    </tr>
                  ) : (
                    inquiries.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                        </td>
                        <td>{item.email}</td>
                        <td>{item.company || '—'}</td>
                        <td>
                          <span className="badge" style={{ textTransform: 'uppercase' }}>
                            {item.inquiry_type}
                          </span>
                        </td>
                        <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.message}
                        </td>
                        <td>
                          <span className={`status-pill status-${item.status}`}>{item.status}</span>
                        </td>
                        <td>
                          {item.status === 'new' ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleUpdateInquiryStatus(item.id, 'contacted')}
                            >
                              Mark Contacted
                            </button>
                          ) : (
                            <small style={{ color: 'var(--muted)' }}>{item.status}</small>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EMAIL OUTBOX TAB */}
        {activeTab === 'emails' && (
          <div className="table-card">
            <div className="table-header">
              <div>
                <h3>Automated Email Dispatch Outbox ({emailLogs.length} dispatched)</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Emails triggered automatically for waitlist approvals, rejections, queue confirmations, and newsletter welcome dispatches.
                </p>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Template Type</th>
                    <th>Subject</th>
                    <th>Delivery Status</th>
                    <th>Dispatched</th>
                    <th>Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px' }}>
                        No emails dispatched yet.
                      </td>
                    </tr>
                  ) : (
                    emailLogs.map((mail) => (
                      <tr key={mail.id}>
                        <td>
                          <strong>{mail.recipient_name}</strong>
                          <br />
                          <small style={{ color: '#64748b' }}>{mail.recipient_email}</small>
                        </td>
                        <td>
                          <span className="badge" style={{ textTransform: 'capitalize' }}>
                            {mail.template_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{mail.subject}</td>
                        <td>
                          <span className={`status-pill ${mail.status === 'sent' ? 'status-approved' : 'status-pending'}`}>
                            {mail.status === 'sent' ? '✓ Delivered to Gmail' : 'Scheduled'}
                          </span>
                        </td>
                        <td>
                          <small>{new Date(mail.sent_at || Date.now()).toLocaleString()}</small>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => setSelectedEmail(mail)}
                            >
                              View HTML
                            </button>
                            {mail.status !== 'sent' && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleReleaseEmail(mail.id)}
                              >
                                Release Mail
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI COPILOT TAB */}
        {activeTab === 'copilot' && (
          <div className="card copilot-container">
            <div className="copilot-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="brand-mark" style={{ color: 'var(--violet)' }}>◈</span>
                <div>
                  <h3 style={{ margin: 0 }}>Orbit Copilot — AI Database & Mail Analyst</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Contextual AI assistant operating over your live SQLite tables, waitlist metrics, and email automations.
                  </p>
                </div>
              </div>
            </div>

            <div className="copilot-chat-history">
              {copilotHistory.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.role}`}>
                  <div className="bubble-author">
                    {msg.role === 'assistant' ? 'Orbit Copilot ◈' : 'Admin'}
                  </div>
                  <div
                    className="bubble-content"
                    dangerouslySetInnerHTML={{
                      __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                    }}
                  />
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="copilot-suggestions-row">
                      {msg.suggestions.map((s, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          className="suggestion-chip"
                          onClick={() => handleSendCopilotQuery(s)}
                        >
                          ✦ {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isCopilotThinking && (
                <div className="chat-bubble assistant">
                  <div className="bubble-author">Orbit Copilot ◈</div>
                  <div className="bubble-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Analyzing database records...</span>
                    <i className="sandbox-spinner"></i>
                  </div>
                </div>
              )}
            </div>

            <div className="copilot-input-area">
              <input
                type="text"
                value={copilotPrompt}
                onChange={(e) => setCopilotPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendCopilotQuery();
                  }
                }}
                placeholder="Ask Copilot: e.g. 'Draft an approval email for Elena' or 'Who should I accept first?'..."
                className="copilot-input"
                disabled={isCopilotThinking}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleSendCopilotQuery()}
                disabled={isCopilotThinking}
              >
                Send <span>↑</span>
              </button>
            </div>
          </div>
        )}

        {/* DATABASE (SQLITE) TAB */}
        {activeTab === 'database' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeDbTable === 'waitlist' ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setActiveDbTable('waitlist')}
              >
                Table: waitlist ({rawDbData?.waitlist?.length || waitlistEntries.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeDbTable === 'inquiries' ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setActiveDbTable('inquiries')}
              >
                Table: inquiries ({rawDbData?.inquiries?.length || inquiries.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeDbTable === 'subscribers' ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setActiveDbTable('subscribers')}
              >
                Table: subscribers ({rawDbData?.subscribers?.length || subscribers.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeDbTable === 'emails' ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setActiveDbTable('emails')}
              >
                Table: email_logs ({rawDbData?.emails?.length || emailLogs.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeDbTable === 'users' ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setActiveDbTable('users')}
              >
                Table: users ({rawDbData?.users?.length || users.length})
              </button>
            </div>

            <div className="table-card">
              <div className="table-header">
                <h3>
                  SQLite Table: <span style={{ color: 'var(--violet)' }}>{activeDbTable}</span> in <code>orbit.db</code>
                </h3>
                <small style={{ color: 'var(--muted)' }}>Live SQLite schema & rows</small>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    {activeDbTable === 'waitlist' && (
                      <tr>
                        <th>id</th>
                        <th>email</th>
                        <th>full_name</th>
                        <th>builder_role</th>
                        <th>company</th>
                        <th>status</th>
                        <th>priority_score</th>
                        <th>created_at</th>
                      </tr>
                    )}
                    {activeDbTable === 'inquiries' && (
                      <tr>
                        <th>id</th>
                        <th>name</th>
                        <th>email</th>
                        <th>company</th>
                        <th>inquiry_type</th>
                        <th>message</th>
                        <th>status</th>
                        <th>created_at</th>
                      </tr>
                    )}
                    {activeDbTable === 'subscribers' && (
                      <tr>
                        <th>id</th>
                        <th>email</th>
                        <th>source</th>
                        <th>is_active</th>
                        <th>created_at</th>
                      </tr>
                    )}
                    {activeDbTable === 'emails' && (
                      <tr>
                        <th>id</th>
                        <th>recipient_email</th>
                        <th>template_type</th>
                        <th>subject</th>
                        <th>status</th>
                        <th>sent_at</th>
                      </tr>
                    )}
                    {activeDbTable === 'users' && (
                      <tr>
                        <th>id</th>
                        <th>email</th>
                        <th>full_name</th>
                        <th>role</th>
                        <th>is_active</th>
                        <th>created_at</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {(rawDbData?.[activeDbTable] || []).map((row: any, rIdx: number) => (
                      <tr key={row.id || rIdx}>
                        {Object.keys(row).map((col) => (
                          <td key={col} style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {typeof row[col] === 'boolean'
                              ? String(row[col])
                              : row[col] === null || row[col] === undefined
                              ? 'NULL'
                              : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="table-card">
            <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>Registered Administrative Accounts</h3>
                <small style={{ color: 'var(--muted)' }}>Manage authorized admins and developers</small>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsAddAdminOpen(true)}
              >
                + Add Admin Account
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>
                        <strong>{u.email}</strong>
                      </td>
                      <td>{u.full_name || '—'}</td>
                      <td>
                        <span className="badge" style={{ textTransform: 'uppercase' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${u.is_active ? 'status-approved' : 'status-rejected'}`}>
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <small>{new Date(u.created_at).toLocaleDateString()}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AGENTS TAB */}
        {activeTab === 'agents' && (
          <div className="card">
            <h3>Interactive Agent Studio</h3>
            <p className="auth-subtitle">Simulate and test Orbit multi-agent task execution in real time.</p>
            <div className="agent-tester">
              <input
                type="text"
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                placeholder="Enter an agent goal prompt (e.g. Add dark theme support or Build user authentication)..."
                className="prompt-input"
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRunAgentStudio}
                disabled={isAgentRunning}
              >
                {isAgentRunning ? 'Orchestrating...' : 'Run Agent Plan ✳'}
              </button>
            </div>

            {agentResult && (
              <div className="agent-preview-box">
                <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                  <strong>Project:</strong> {agentResult.project_name} | <strong>Branch:</strong> {agentResult.branch}
                  <br />
                  <strong>Files Affected:</strong> {agentResult.files_affected.join(', ')}
                  <br />
                  <strong>Diff:</strong> {agentResult.diff_summary}
                </div>

                <div>
                  {agentResult.steps.map((step) => (
                    <div key={step.step_number} className="agent-step-item">
                      <div className="step-dot">{step.step_number}</div>
                      <div>
                        <strong>{step.title}</strong> —{' '}
                        <small style={{ color: 'var(--lime)' }}>{step.status.toUpperCase()}</small>
                        <br />
                        <span style={{ fontSize: '13px', color: '#cbd5e1' }}>{step.description}</span>
                        <br />
                        {step.details && <small style={{ color: '#94a3b8' }}>{step.details}</small>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Email Preview Modal */}
      {selectedEmail && (
        <div className="orbit-modal-overlay is-active" onClick={() => setSelectedEmail(null)}>
          <div className="orbit-modal" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setSelectedEmail(null)}>
              &times;
            </button>
            <div className="modal-header">
              <span className="eyebrow" style={{ color: 'var(--violet)' }}>
                DISPATCHED EMAIL PREVIEW
              </span>
              <h3>{selectedEmail.subject}</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                To: <strong>{selectedEmail.recipient_name}</strong> &lt;{selectedEmail.recipient_email}&gt;
              </p>
            </div>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                margin: '16px 0',
                fontSize: '13px',
              }}
              dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedEmail(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {isAddAdminOpen && (
        <div className="orbit-modal-backdrop" onClick={() => setIsAddAdminOpen(false)}>
          <div className="orbit-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setIsAddAdminOpen(false)}>
              &times;
            </button>
            <div className="modal-header">
              <span className="eyebrow" style={{ color: 'var(--violet)' }}>
                ADMINISTRATIVE ACCESS
              </span>
              <h3>Add Administrator</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Register a new administrator or developer account in SQLite database (orbit.db).
              </p>
            </div>

            <form onSubmit={handleCreateAdmin} style={{ marginTop: '16px' }}>
              <div className="input-group">
                <label htmlFor="new-admin-email">Admin Email Address</label>
                <input
                  type="email"
                  id="new-admin-email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="new-admin-name">Full Name</label>
                <input
                  type="text"
                  id="new-admin-name"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="new-admin-role">System Role</label>
                <select
                  id="new-admin-role"
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as any)}
                  className="select"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--line)', background: '#fff' }}
                >
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="user">Developer / Reviewer</option>
                </select>
              </div>

              {addAdminError && <p className="error-text">{addAdminError}</p>}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsAddAdminOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isAddingAdmin}>
                  {isAddingAdmin ? 'Creating...' : 'Register Administrator <span>+</span>'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
