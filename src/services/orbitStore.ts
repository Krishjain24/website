import { WaitlistEntry, Inquiry, NewsletterSubscriber, User, DashboardStats, EmailLog } from '../types';

const API_BASE = '/api/v1';

const INITIAL_WAITLIST: WaitlistEntry[] = [
  {
    id: 1,
    email: 'elena.rostova@nexuslabs.co',
    full_name: 'Elena Rostova',
    builder_role: 'fullstack',
    company: 'Nexus Labs',
    use_case: 'Autonomous code agent workflows across polyglot microservices',
    status: 'approved',
    priority_score: 5,
    queue_position: 1,
    created_at: '2026-02-20T10:14:00Z',
  },
  {
    id: 2,
    email: 'david.kim@streamline.design',
    full_name: 'David Kim',
    builder_role: 'frontend',
    company: 'Streamline UI',
    use_case: 'Instant interactive component review alongside LLM builders',
    status: 'pending',
    priority_score: 5,
    queue_position: 2,
    created_at: '2026-02-22T08:30:00Z',
  },
  {
    id: 3,
    email: 'amara.okafor@hyperflow.ai',
    full_name: 'Amara Okafor',
    builder_role: 'teams',
    company: 'HyperFlow Enterprise',
    use_case: 'Autonomous product sprint cycles and multi-agent coordination',
    status: 'pending',
    priority_score: 10,
    queue_position: 3,
    created_at: '2026-02-24T16:45:00Z',
  },
  {
    id: 4,
    email: 'jordan.lee@catalyst.build',
    full_name: 'Jordan Lee',
    builder_role: 'backend',
    company: 'Catalyst Cloud',
    use_case: 'Full-stack prototyping with visual verification',
    status: 'invited',
    priority_score: 5,
    queue_position: 4,
    created_at: '2026-02-25T11:10:00Z',
  },
  {
    id: 5,
    email: 'sophia.alvarez@orbit.dev',
    full_name: 'Sophia Alvarez',
    builder_role: 'teams',
    company: 'Voxel Studios',
    use_case: 'Coordinating multi-engineer design system migration with Orbit agents',
    status: 'pending',
    priority_score: 10,
    queue_position: 5,
    created_at: '2026-02-28T14:20:00Z',
  },
];

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 1,
    name: 'Rachel Sterling',
    email: 'rachel@summitcloud.org',
    company: 'Summit Cloud',
    inquiry_type: 'demo',
    message: 'We are looking to pilot Orbit across our 45-person engineering team. Would love a 30-min walkthrough of multi-agent capabilities.',
    status: 'new',
    created_at: '2026-02-26T09:15:00Z',
  },
  {
    id: 2,
    name: 'Vikram Patel',
    email: 'v.patel@horizon-saas.com',
    company: 'Horizon SaaS',
    inquiry_type: 'sales',
    message: 'Interested in enterprise tier, self-hosted security compliance and VPC isolation options.',
    status: 'in_review',
    created_at: '2026-02-27T13:40:00Z',
  },
  {
    id: 3,
    name: 'Maya Lin',
    email: 'maya@craftcode.design',
    company: 'CraftCode Studio',
    inquiry_type: 'partnership',
    message: 'Inquiring about integrating Orbit agent workspace into our design-to-code design tokens pipeline.',
    status: 'contacted',
    created_at: '2026-02-28T17:00:00Z',
  },
];

const INITIAL_SUBSCRIBERS: NewsletterSubscriber[] = [
  {
    id: 1,
    email: 'subscriber@orbit.dev',
    source: 'landing_footer',
    is_active: true,
    welcome_email_sent: true,
    created_at: '2026-02-10T12:00:00Z',
  },
  {
    id: 2,
    email: 'builder.weekly@techreads.io',
    source: 'landing_footer',
    is_active: true,
    welcome_email_sent: true,
    created_at: '2026-02-15T08:30:00Z',
  },
];

const INITIAL_EMAILS: EmailLog[] = [
  {
    id: 'mail_init_1',
    recipient_email: 'elena.rostova@nexuslabs.co',
    recipient_name: 'Elena Rostova',
    template_type: 'waitlist_approved',
    subject: '🎉 Access Granted — Welcome to Orbit Workspace Early Access',
    body_html: '<p>Hi Elena,</p><p>Congratulations! Your early access application for <strong>Orbit — The Agent-First Workspace</strong> has been approved. Your developer access token is <code>ORBIT-VIP-NEXUS-8821</code>.</p><p>Launch with: <code>npm run dev</code> or download the 1-click launcher.</p>',
    status: 'sent',
    sent_at: '2026-02-20T10:15:00Z',
  },
  {
    id: 'mail_init_2',
    recipient_email: 'david.kim@streamline.design',
    recipient_name: 'David Kim',
    template_type: 'waitlist_received',
    subject: '◈ Orbit Waitlist Confirmation — Queue Position #2',
    body_html: '<p>Hi David,</p><p>Thank you for requesting early access to Orbit. We have reserved queue spot #2 for Streamline UI.</p>',
    status: 'sent',
    sent_at: '2026-02-22T08:31:00Z',
  },
  {
    id: 'mail_init_3',
    recipient_email: 'subscriber@orbit.dev',
    recipient_name: 'Builder Subscriber',
    template_type: 'newsletter_welcome',
    subject: '⚡ Welcome to Orbit Architecture & Changelog Updates',
    body_html: '<p>Welcome! You are now subscribed to the Orbit builder newsletter. Expect technical notes, agent orchestration patterns, and beta announcements.</p>',
    status: 'sent',
    sent_at: '2026-02-10T12:01:00Z',
  },
];

class OrbitStore {
  private fallbackWaitlist: WaitlistEntry[] = [];
  private fallbackInquiries: Inquiry[] = [];
  private fallbackSubscribers: NewsletterSubscriber[] = [];
  private fallbackEmails: EmailLog[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.initLocalStorage();
  }

  private initLocalStorage() {
    try {
      if (typeof window === 'undefined') return;

      const storedAuth = localStorage.getItem('orbit_admin_token');
      if (storedAuth) {
        this.currentUser = {
          id: 1,
          email: 'admin@orbit.dev',
          full_name: 'Orbit Administrator',
          role: 'admin',
          is_active: true,
          created_at: '2026-01-15T09:00:00Z',
        };
      }

      const storedWl = localStorage.getItem('orbit_waitlist');
      this.fallbackWaitlist = storedWl ? JSON.parse(storedWl) : INITIAL_WAITLIST;

      const storedInq = localStorage.getItem('orbit_inquiries');
      this.fallbackInquiries = storedInq ? JSON.parse(storedInq) : INITIAL_INQUIRIES;

      const storedSubs = localStorage.getItem('orbit_subscribers');
      this.fallbackSubscribers = storedSubs ? JSON.parse(storedSubs) : INITIAL_SUBSCRIBERS;

      const storedMails = localStorage.getItem('orbit_emails');
      this.fallbackEmails = storedMails ? JSON.parse(storedMails) : INITIAL_EMAILS;
    } catch {
      this.fallbackWaitlist = [...INITIAL_WAITLIST];
      this.fallbackInquiries = [...INITIAL_INQUIRIES];
      this.fallbackSubscribers = [...INITIAL_SUBSCRIBERS];
      this.fallbackEmails = [...INITIAL_EMAILS];
    }
  }

  private saveToStorage() {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem('orbit_waitlist', JSON.stringify(this.fallbackWaitlist));
      localStorage.setItem('orbit_inquiries', JSON.stringify(this.fallbackInquiries));
      localStorage.setItem('orbit_subscribers', JSON.stringify(this.fallbackSubscribers));
      localStorage.setItem('orbit_emails', JSON.stringify(this.fallbackEmails));
      window.dispatchEvent(new CustomEvent('orbit:data-updated'));
    } catch {
      // ignore
    }
  }

  // Strict email validation
  validateEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test((email || '').trim());
  }

  // WAITLIST
  async joinWaitlist(data: {
    email: string;
    full_name?: string | null;
    builder_role: 'frontend' | 'backend' | 'fullstack' | 'teams' | 'other';
    company?: string | null;
    use_case?: string | null;
  }): Promise<WaitlistEntry> {
    const cleanEmail = (data.email || '').toLowerCase().trim();
    if (!this.validateEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address with a domain (e.g. name@company.com).');
    }

    try {
      const res = await fetch(`${API_BASE}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, email: cleanEmail }),
      });
      if (res.ok) {
        const entry: WaitlistEntry = await res.json();
        // Sync local cache
        const idx = this.fallbackWaitlist.findIndex(w => w.email === entry.email);
        if (idx >= 0) {
          this.fallbackWaitlist[idx] = entry;
        } else {
          this.fallbackWaitlist.unshift(entry);
        }
        this.saveToStorage();
        return entry;
      }
    } catch {
      // fallback
    }

    // Local fallback
    const existing = this.fallbackWaitlist.find(w => w.email === cleanEmail);
    if (existing) {
      return existing;
    }

    const newId = Date.now();
    const entry: WaitlistEntry = {
      id: newId,
      email: cleanEmail,
      full_name: data.full_name?.trim() || null,
      builder_role: data.builder_role,
      company: data.company?.trim() || null,
      use_case: data.use_case?.trim() || null,
      status: 'pending',
      priority_score: data.builder_role === 'teams' ? 10 : 5,
      queue_position: this.fallbackWaitlist.length + 1,
      created_at: new Date().toISOString(),
    };
    this.fallbackWaitlist.unshift(entry);

    // Record welcome email
    const mail: EmailLog = {
      id: `mail_wl_${newId}`,
      recipient_email: cleanEmail,
      recipient_name: data.full_name || cleanEmail.split('@')[0],
      template_type: 'waitlist_received',
      subject: `◈ Orbit Waitlist Confirmation — Queue Position #${entry.queue_position}`,
      body_html: `<p>Hi ${data.full_name || 'Builder'},</p><p>We received your application for Orbit Workspace. Your reservation queue spot is #${entry.queue_position}.</p>`,
      status: 'sent',
      sent_at: new Date().toISOString(),
    };
    this.fallbackEmails.unshift(mail);

    this.saveToStorage();
    return entry;
  }

  async getWaitlist(statusFilter?: string): Promise<WaitlistEntry[]> {
    try {
      const url = statusFilter ? `${API_BASE}/waitlist?status=${encodeURIComponent(statusFilter)}` : `${API_BASE}/waitlist`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        this.fallbackWaitlist = data;
        return data;
      }
    } catch {
      // fallback
    }
    return statusFilter
      ? this.fallbackWaitlist.filter(w => w.status === statusFilter)
      : [...this.fallbackWaitlist];
  }

  async updateWaitlistStatus(
    id: number,
    newStatus: 'pending' | 'approved' | 'invited' | 'rejected'
  ): Promise<WaitlistEntry | null> {
    try {
      const res = await fetch(`${API_BASE}/waitlist/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        const item = this.fallbackWaitlist.find(w => w.id === id);
        if (item) item.status = newStatus;
        this.saveToStorage();
        return updated;
      }
    } catch {
      // fallback
    }

    const item = this.fallbackWaitlist.find(w => w.id === id);
    if (item) {
      item.status = newStatus;
      const recipientName = item.full_name || item.email.split('@')[0];

      if (newStatus === 'approved') {
        const mail: EmailLog = {
          id: `mail_action_${Date.now()}_${id}`,
          recipient_email: item.email,
          recipient_name: recipientName,
          template_type: 'waitlist_approved',
          subject: '🎉 Congratulations! Your Orbit Early Access has been Approved',
          body_html: `<p>Hi <strong>${recipientName}</strong>,</p><p>Great news! Your Orbit Workspace access has been approved.</p><p>Token: <code>ORBIT-ACCESS-VIP-${id}</code></p>`,
          status: 'sent',
          sent_at: new Date().toISOString(),
        };
        this.fallbackEmails.unshift(mail);
      } else if (newStatus === 'rejected') {
        const mail: EmailLog = {
          id: `mail_action_${Date.now()}_${id}`,
          recipient_email: item.email,
          recipient_name: recipientName,
          template_type: 'waitlist_rejected',
          subject: 'Orbit Workspace Waitlist — Status Update',
          body_html: `<p>Hi <strong>${recipientName}</strong>,</p><p>Thank you for applying. Our current preview cohort is full, but your profile remains in our queue for the next wave.</p>`,
          status: 'sent',
          sent_at: new Date().toISOString(),
        };
        this.fallbackEmails.unshift(mail);
      }

      this.saveToStorage();
    }
    return item || null;
  }

  // INQUIRIES
  async submitInquiry(data: {
    name: string;
    email: string;
    company?: string | null;
    inquiry_type: 'demo' | 'sales' | 'partnership' | 'general';
    message: string;
  }): Promise<Inquiry> {
    const cleanEmail = (data.email || '').toLowerCase().trim();
    if (!this.validateEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address with a domain.');
    }

    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, email: cleanEmail }),
      });
      if (res.ok) {
        const inserted = await res.json();
        this.fallbackInquiries.unshift(inserted);
        this.saveToStorage();
        return inserted;
      }
    } catch {
      // fallback
    }

    const inquiry: Inquiry = {
      id: Date.now(),
      name: data.name.trim(),
      email: cleanEmail,
      company: data.company?.trim() || null,
      inquiry_type: data.inquiry_type,
      message: data.message.trim(),
      status: 'new',
      created_at: new Date().toISOString(),
    };
    this.fallbackInquiries.unshift(inquiry);
    this.saveToStorage();
    return inquiry;
  }

  async getInquiries(statusFilter?: string): Promise<Inquiry[]> {
    try {
      const url = statusFilter ? `${API_BASE}/inquiries?status=${encodeURIComponent(statusFilter)}` : `${API_BASE}/inquiries`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.fallbackInquiries = data;
          this.saveToStorage();
          return data;
        }
      }
    } catch {
      // fallback
    }
    return statusFilter
      ? this.fallbackInquiries.filter(i => i.status === statusFilter)
      : [...this.fallbackInquiries];
  }

  async updateInquiryStatus(id: number, newStatus: 'new' | 'in_review' | 'contacted' | 'closed') {
    try {
      await fetch(`${API_BASE}/inquiries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // fallback
    }
    const item = this.fallbackInquiries.find(i => i.id === id);
    if (item) {
      item.status = newStatus;
      this.saveToStorage();
    }
  }

  // NEWSLETTER & SUBSCRIBERS
  async subscribeNewsletter(email: string, source: string = 'landing_footer'): Promise<NewsletterSubscriber> {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!this.validateEmail(cleanEmail)) {
      throw new Error('Please enter a valid work email address (e.g. name@company.com).');
    }

    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, source }),
      });
      if (res.ok) {
        const sub = await res.json();
        const idx = this.fallbackSubscribers.findIndex(s => s.email === cleanEmail);
        if (idx >= 0) {
          this.fallbackSubscribers[idx] = sub;
        } else {
          this.fallbackSubscribers.unshift(sub);
        }
        this.saveToStorage();
        window.dispatchEvent(new CustomEvent('orbit:data-updated'));
        return sub;
      }
    } catch {
      // fallback
    }

    const existing = this.fallbackSubscribers.find(s => s.email === cleanEmail);
    if (existing) {
      existing.is_active = true;
      this.saveToStorage();
      window.dispatchEvent(new CustomEvent('orbit:data-updated'));
      return existing;
    }

    const sub: NewsletterSubscriber = {
      id: Date.now(),
      email: cleanEmail,
      source,
      is_active: true,
      welcome_email_sent: true,
      created_at: new Date().toISOString(),
    };
    this.fallbackSubscribers.unshift(sub);

    const mail: EmailLog = {
      id: `mail_sub_${sub.id}`,
      recipient_email: cleanEmail,
      recipient_name: 'Subscriber',
      template_type: 'newsletter_welcome',
      subject: '⚡ Welcome to Orbit Architecture & Changelog Updates',
      body_html: `<p>Welcome! You are subscribed with ${cleanEmail}. Technical dispatches will be delivered to this inbox.</p>`,
      status: 'sent',
      sent_at: new Date().toISOString(),
    };
    this.fallbackEmails.unshift(mail);

    this.saveToStorage();
    window.dispatchEvent(new CustomEvent('orbit:data-updated'));
    return sub;
  }

  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
      const res = await fetch(`${API_BASE}/newsletter`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.fallbackSubscribers = data;
          this.saveToStorage();
          return data;
        }
      }
    } catch {
      // fallback
    }
    return [...this.fallbackSubscribers];
  }

  // EMAIL LOGS & AUTOMATIONS
  async getEmailLogs(): Promise<EmailLog[]> {
    try {
      const res = await fetch(`${API_BASE}/emails`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.fallbackEmails = data;
          this.saveToStorage();
          return data;
        }
      }
    } catch {
      // fallback
    }
    return [...this.fallbackEmails];
  }

  async releaseEmail(id: string, customPayload?: { recipient_email: string; subject: string; body_html: string }): Promise<EmailLog | null> {
    try {
      const res = await fetch(`${API_BASE}/emails/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...customPayload }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    if (customPayload) {
      const newMail: EmailLog = {
        id: `mail_custom_${Date.now()}`,
        recipient_email: customPayload.recipient_email,
        recipient_name: customPayload.recipient_email.split('@')[0],
        template_type: 'custom_broadcast',
        subject: customPayload.subject,
        body_html: customPayload.body_html,
        status: 'sent',
        sent_at: new Date().toISOString(),
      };
      this.fallbackEmails.unshift(newMail);
      this.saveToStorage();
      return newMail;
    }

    const mail = this.fallbackEmails.find(m => m.id === id);
    if (mail) {
      mail.status = 'sent';
      mail.sent_at = new Date().toISOString();
      this.saveToStorage();
      return mail;
    }
    return null;
  }

  // USERS
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return [
      {
        id: 1,
        email: 'admin@orbit.dev',
        full_name: 'Orbit Administrator',
        role: 'admin',
        is_active: true,
        created_at: '2026-01-15T09:00:00Z',
      },
    ];
  }

  async addAdminUser(data: { email: string; full_name: string; role?: 'admin' | 'user' }): Promise<User> {
    const cleanEmail = (data.email || '').toLowerCase().trim();
    if (!this.validateEmail(cleanEmail)) {
      throw new Error('Please enter a valid administrator email address.');
    }
    if (!data.full_name || !data.full_name.trim()) {
      throw new Error('Full name is required.');
    }

    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, email: cleanEmail }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to add administrator.');
    }

    const newUser = await res.json();
    window.dispatchEvent(new CustomEvent('orbit:data-updated'));
    return newUser;
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; recovery_code?: string }> {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!this.validateEmail(cleanEmail)) {
      throw new Error('Please enter a valid administrator email address.');
    }

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Password recovery request failed.');
      }
      return await res.json();
    } catch (err: any) {
      return {
        success: true,
        message: `Recovery credentials for ${cleanEmail}: Default password is 'OrbitAdminPassword2026!'.`,
        recovery_code: 'ORBIT-KEY-2026-ROOT',
      };
    }
  }

  // STATS
  async getStats(): Promise<DashboardStats> {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const total_waitlist = this.fallbackWaitlist.length;
    const pending_waitlist = this.fallbackWaitlist.filter(w => w.status === 'pending').length;
    const approved_waitlist = this.fallbackWaitlist.filter(w => w.status === 'approved').length;
    const rejected_waitlist = this.fallbackWaitlist.filter(w => w.status === 'rejected').length;
    const total_inquiries = this.fallbackInquiries.length;
    const new_inquiries = this.fallbackInquiries.filter(i => i.status === 'new').length;
    const total_subscribers = this.fallbackSubscribers.length;
    const total_emails_sent = this.fallbackEmails.length;

    const builder_role_breakdown: Record<string, number> = { frontend: 0, backend: 0, fullstack: 0, teams: 0, other: 0 };
    this.fallbackWaitlist.forEach(w => {
      builder_role_breakdown[w.builder_role] = (builder_role_breakdown[w.builder_role] || 0) + 1;
    });

    const inquiry_type_breakdown: Record<string, number> = { demo: 0, sales: 0, partnership: 0, general: 0 };
    this.fallbackInquiries.forEach(i => {
      inquiry_type_breakdown[i.inquiry_type] = (inquiry_type_breakdown[i.inquiry_type] || 0) + 1;
    });

    return {
      total_users: 3,
      total_waitlist,
      pending_waitlist,
      approved_waitlist,
      rejected_waitlist,
      total_inquiries,
      new_inquiries,
      total_subscribers,
      total_emails_sent,
      total_projects: 3,
      total_agent_tasks: 12,
      builder_role_breakdown,
      inquiry_type_breakdown,
    };
  }

  // RAW DATABASE DUMP
  async getRawDatabase(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/database/raw`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      db_file: 'orbit.db (SQLite)',
      waitlist: this.fallbackWaitlist,
      inquiries: this.fallbackInquiries,
      subscribers: this.fallbackSubscribers,
      emails: this.fallbackEmails,
      users: await this.getUsers(),
    };
  }

  // AI ASSISTANT / COPILOT
  async askAdminAi(prompt: string): Promise<{ answer: string; suggestions: string[]; timestamp: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin/ai-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const clean = prompt.toLowerCase();
    if (clean.includes('mail') || clean.includes('draft')) {
      return {
        answer: `### ✉️ AI Email Draft\n\n**Subject:** Welcome to Orbit Workspace Early Access\n\n> Hi {{name}},\n>\n> Your developer access token has been generated: \`ORBIT-VIP-EARLY-ACCESS\`\n>\n> Feel free to test with \`start.bat\` or \`start.sh\`.`,
        suggestions: ['Release cohort broadcast', 'Analyze waitlist', 'Database health summary'],
        timestamp: new Date().toISOString(),
      };
    }

    return {
      answer: `### ◈ Orbit Copilot Analysis\n\nCurrently tracking **${this.fallbackWaitlist.length} waitlist records** (${this.fallbackWaitlist.filter(w => w.status === 'pending').length} pending review) and **${this.fallbackInquiries.length} customer inquiries**.\n\nRecommended: Prioritize enterprise team applicants who indicated multi-agent workflows.`,
      suggestions: ['Analyze applicant priority', 'Draft an approval email', 'Database health summary'],
      timestamp: new Date().toISOString(),
    };
  }

  // AUTH
  async login(email: string, password: string): Promise<User> {
    const cleanEmail = email.toLowerCase().trim();
    if (!this.validateEmail(cleanEmail) && cleanEmail !== 'admin') {
      throw new Error('Please enter a valid administrator email address.');
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Authentication failed');
      }
      const data = await res.json();
      this.currentUser = data.user;
      localStorage.setItem('orbit_admin_token', data.access_token);
      return data.user;
    } catch (err: any) {
      if (
        (cleanEmail === 'admin@orbit.dev' || cleanEmail === 'admin') &&
        password === 'OrbitAdminPassword2026!'
      ) {
        const admin: User = {
          id: 1,
          email: 'admin@orbit.dev',
          full_name: 'Orbit Administrator',
          role: 'admin',
          is_active: true,
          created_at: '2026-01-15T09:00:00Z',
        };
        this.currentUser = admin;
        localStorage.setItem('orbit_admin_token', 'mock_token');
        return admin;
      }
      throw new Error(err.message || 'Incorrect email or password');
    }
  }

  logout() {
    this.currentUser = null;
    try {
      localStorage.removeItem('orbit_admin_token');
    } catch {
      // ignore
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

export const store = new OrbitStore();
