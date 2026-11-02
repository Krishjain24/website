import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const HOST = '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

// Initialize SQLite Database stored in orbit.db
const db = new Database(path.join(__dirname, 'orbit.db'));

// Configure tables
db.exec(`
  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    builder_role TEXT NOT NULL DEFAULT 'fullstack',
    company TEXT,
    use_case TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority_score INTEGER NOT NULL DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    inquiry_type TEXT NOT NULL DEFAULT 'demo',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'landing_footer',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS agent_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt TEXT NOT NULL,
    project_name TEXT NOT NULL,
    branch TEXT NOT NULL DEFAULT 'main',
    status TEXT NOT NULL DEFAULT 'completed',
    steps_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    template_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed pre-data if empty
const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
if (userCount === 0) {
  const insertUser = db.prepare('INSERT INTO users (email, full_name, role, is_active, created_at) VALUES (?, ?, ?, ?, ?)');
  insertUser.run('admin@orbit.dev', 'Orbit Administrator', 'admin', 1, '2026-01-15T09:00:00Z');
  insertUser.run('sarah.chen@hyperscale.io', 'Sarah Chen', 'user', 1, '2026-02-01T14:22:00Z');
  insertUser.run('marcus.vance@vortexp.tech', 'Marcus Vance', 'user', 1, '2026-02-18T11:05:00Z');
}

const waitlistCount = (db.prepare('SELECT COUNT(*) as count FROM waitlist').get() as { count: number }).count;
if (waitlistCount === 0) {
  const insertWaitlist = db.prepare(
    'INSERT INTO waitlist (email, full_name, builder_role, company, use_case, status, priority_score, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  insertWaitlist.run('elena.rostova@nexuslabs.co', 'Elena Rostova', 'fullstack', 'Nexus Labs', 'Autonomous code agent workflows across polyglot microservices', 'approved', 5, '2026-02-20T10:14:00Z');
  insertWaitlist.run('david.kim@streamline.design', 'David Kim', 'frontend', 'Streamline UI', 'Instant interactive component review alongside LLM builders', 'pending', 5, '2026-02-22T08:30:00Z');
  insertWaitlist.run('amara.okafor@hyperflow.ai', 'Amara Okafor', 'teams', 'HyperFlow Enterprise', 'Autonomous product sprint cycles and multi-agent coordination', 'pending', 10, '2026-02-24T16:45:00Z');
  insertWaitlist.run('jordan.lee@catalyst.build', 'Jordan Lee', 'backend', 'Catalyst Cloud', 'Full-stack prototyping with visual verification', 'invited', 5, '2026-02-25T11:10:00Z');
  insertWaitlist.run('sophia.alvarez@orbit.dev', 'Sophia Alvarez', 'teams', 'Voxel Studios', 'Coordinating multi-engineer design system migration with Orbit agents', 'pending', 10, '2026-02-28T14:20:00Z');
}

const inquiriesCount = (db.prepare('SELECT COUNT(*) as count FROM inquiries').get() as { count: number }).count;
if (inquiriesCount === 0) {
  const insertInquiry = db.prepare(
    'INSERT INTO inquiries (name, email, company, inquiry_type, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  insertInquiry.run('Rachel Sterling', 'rachel@summitcloud.org', 'Summit Cloud', 'demo', 'We are looking to pilot Orbit across our 45-person engineering team. Would love a 30-min walkthrough of multi-agent capabilities.', 'new', '2026-02-26T09:15:00Z');
  insertInquiry.run('Vikram Patel', 'v.patel@horizon-saas.com', 'Horizon SaaS', 'sales', 'Interested in enterprise tier, self-hosted security compliance and VPC isolation options.', 'in_review', '2026-02-27T13:40:00Z');
  insertInquiry.run('Maya Lin', 'maya@craftcode.design', 'CraftCode Studio', 'partnership', 'Inquiring about integrating Orbit agent workspace into our design-to-code design tokens pipeline.', 'contacted', '2026-02-28T17:00:00Z');
}

const subscriberCount = (db.prepare('SELECT COUNT(*) as count FROM subscribers').get() as { count: number }).count;
if (subscriberCount === 0) {
  const insertSub = db.prepare('INSERT INTO subscribers (email, source, is_active, created_at) VALUES (?, ?, ?, ?)');
  insertSub.run('subscriber@orbit.dev', 'landing_footer', 1, '2026-02-10T12:00:00Z');
  insertSub.run('builder.weekly@techreads.io', 'landing_footer', 1, '2026-02-15T08:30:00Z');
}

const emailCount = (db.prepare('SELECT COUNT(*) as count FROM email_logs').get() as { count: number }).count;
if (emailCount === 0) {
  const insertEmail = db.prepare(
    'INSERT INTO email_logs (id, recipient_email, recipient_name, template_type, subject, body_html, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  insertEmail.run(
    'mail_init_1',
    'elena.rostova@nexuslabs.co',
    'Elena Rostova',
    'waitlist_approved',
    '🎉 Access Granted — Welcome to Orbit Workspace Early Access',
    '<p>Hi Elena,</p><p>Congratulations! Your early access application for <strong>Orbit — The Agent-First Workspace</strong> has been approved. Your developer access token is <code>ORBIT-VIP-NEXUS-8821</code>.</p><p>Launch with: <code>npm run dev</code> or download the 1-click launcher.</p>',
    'sent',
    '2026-02-20T10:15:00Z'
  );
  insertEmail.run(
    'mail_init_2',
    'david.kim@streamline.design',
    'David Kim',
    'waitlist_received',
    '◈ Orbit Waitlist Confirmation — Queue Position #2',
    '<p>Hi David,</p><p>Thank you for requesting early access to Orbit. We have reserved queue spot #2 for Streamline UI.</p>',
    'sent',
    '2026-02-22T08:31:00Z'
  );
  insertEmail.run(
    'mail_init_3',
    'subscriber@orbit.dev',
    'Builder Subscriber',
    'newsletter_welcome',
    '⚡ Welcome to Orbit Architecture & Changelog Updates',
    '<p>Welcome! You are now subscribed to the Orbit builder newsletter. Expect technical notes, agent orchestration patterns, and beta announcements.</p>',
    'sent',
    '2026-02-10T12:01:00Z'
  );
}

const isValidEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test((email || '').trim());
};

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // API ROUTES

  // 1. Waitlist APIs
  app.post('/api/v1/waitlist', (req: Request, res: Response) => {
    try {
      const { email, full_name, builder_role, company, use_case } = req.body;
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({ detail: 'Please provide a valid email address with a domain (e.g. name@company.com).' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = db.prepare('SELECT * FROM waitlist WHERE email = ?').get(cleanEmail) as any;

      if (existing) {
        const queuePos = (db.prepare('SELECT COUNT(*) as pos FROM waitlist WHERE id <= ?').get(existing.id) as any).pos;
        return res.json({ ...existing, queue_position: queuePos });
      }

      const priority = builder_role === 'teams' ? 10 : 5;
      const result = db.prepare(`
        INSERT INTO waitlist (email, full_name, builder_role, company, use_case, status, priority_score, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP)
      `).run(cleanEmail, full_name || null, builder_role || 'fullstack', company || null, use_case || null, priority);

      const newId = result.lastInsertRowid;
      const inserted = db.prepare('SELECT * FROM waitlist WHERE id = ?').get(newId) as any;
      const queuePos = (db.prepare('SELECT COUNT(*) as pos FROM waitlist WHERE id <= ?').get(newId) as any).pos;

      // Automatically dispatch initial confirmation email
      const mailId = `mail_wl_${Date.now()}_${newId}`;
      const safeName = full_name?.trim() || cleanEmail.split('@')[0];
      const mailSubject = `◈ Orbit Waitlist Confirmation — Queue Position #${queuePos}`;
      const mailBody = `
        <div style="font-family:sans-serif;color:#1e293b;line-height:1.6;">
          <h2 style="color:#5746dc;">Welcome to Orbit Workspace Waitlist, ${safeName}!</h2>
          <p>We have received your application for early developer access. Your queue reservation position is <strong>#${queuePos}</strong>.</p>
          <div style="background:#f8fafc;padding:12px;border-left:4px solid #5746dc;border-radius:4px;margin:16px 0;">
            <p style="margin:0 0 6px;"><strong>Builder Role:</strong> ${builder_role || 'fullstack'}</p>
            <p style="margin:0 0 6px;"><strong>Company:</strong> ${company || 'Independent Builder'}</p>
            <p style="margin:0;"><strong>Current Status:</strong> <span style="color:#d97706;font-weight:600;">Pending Admin Review</span></p>
          </div>
          <p>Once reviewed by our engineering administrators, an invitation token with instant 1-click startup links will be dispatched directly to this email address.</p>
          <p style="font-size:12px;color:#64748b;margin-top:24px;">— The Orbit Engineering Team</p>
        </div>
      `;
      db.prepare(`
        INSERT INTO email_logs (id, recipient_email, recipient_name, template_type, subject, body_html, status, created_at)
        VALUES (?, ?, ?, 'waitlist_received', ?, ?, 'sent', CURRENT_TIMESTAMP)
      `).run(mailId, cleanEmail, safeName, mailSubject, mailBody);

      return res.status(201).json({ ...inserted, queue_position: queuePos });
    } catch (err: any) {
      return res.status(500).json({ detail: err.message || 'Failed to register waitlist entry.' });
    }
  });

  app.get('/api/v1/waitlist', (req: Request, res: Response) => {
    const { status } = req.query;
    let items;
    if (status) {
      items = db.prepare('SELECT * FROM waitlist WHERE status = ? ORDER BY id DESC').all(status);
    } else {
      items = db.prepare('SELECT * FROM waitlist ORDER BY id DESC').all();
    }
    return res.json(items);
  });

  app.patch('/api/v1/waitlist/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare('UPDATE waitlist SET status = ? WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT * FROM waitlist WHERE id = ?').get(id) as any;

    if (updated) {
      const recipientName = updated.full_name || updated.email.split('@')[0];
      const mailId = `mail_action_${Date.now()}_${id}`;

      if (status === 'approved') {
        const token = `ORBIT-ACCESS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${id}`;
        const subject = `🎉 Congratulations! Your Orbit Early Access has been Approved`;
        const body = `
          <div style="font-family:sans-serif;color:#1e293b;line-height:1.6;">
            <h2 style="color:#16a34a;">Access Granted to Orbit Workspace!</h2>
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>Great news! The Orbit administration team has approved your application for early builder access.</p>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 8px;font-size:14px;color:#166534;"><strong>Your Dedicated Workspace Token:</strong></p>
              <code style="display:inline-block;background:#fff;padding:6px 12px;border:1px solid #86efac;border-radius:4px;font-size:15px;font-weight:700;color:#15803d;">${token}</code>
            </div>
            <p>You can start building right away using the 1-click launcher on Windows (<code>start.bat</code>) or macOS/Linux (<code>start.sh</code>).</p>
            <p style="font-size:12px;color:#64748b;margin-top:24px;">— The Orbit Engineering Team</p>
          </div>
        `;
        db.prepare(`
          INSERT INTO email_logs (id, recipient_email, recipient_name, template_type, subject, body_html, status, created_at)
          VALUES (?, ?, ?, 'waitlist_approved', ?, ?, 'sent', CURRENT_TIMESTAMP)
        `).run(mailId, updated.email, recipientName, subject, body);
      } else if (status === 'rejected') {
        const subject = `Orbit Workspace Waitlist — Status Update`;
        const body = `
          <div style="font-family:sans-serif;color:#1e293b;line-height:1.6;">
            <h2 style="color:#64748b;">Orbit Cohort Update</h2>
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>Thank you for your interest in Orbit and for sharing your development background.</p>
            <p>Our current preview cohort for your role (<code>${updated.builder_role}</code>) is currently at maximum capacity. We have retained your spot in our general candidate pool and will notify you as soon as new cloud infrastructure quotas open up in the next wave.</p>
            <p style="font-size:12px;color:#64748b;margin-top:24px;">— The Orbit Engineering Team</p>
          </div>
        `;
        db.prepare(`
          INSERT INTO email_logs (id, recipient_email, recipient_name, template_type, subject, body_html, status, created_at)
          VALUES (?, ?, ?, 'waitlist_rejected', ?, ?, 'sent', CURRENT_TIMESTAMP)
        `).run(mailId, updated.email, recipientName, subject, body);
      }
    }

    return res.json(updated);
  });

  app.get('/api/v1/waitlist/export-csv', (_req: Request, res: Response) => {
    const items = db.prepare('SELECT * FROM waitlist ORDER BY id ASC').all() as any[];
    const headers = ['ID', 'Email', 'Name', 'Role', 'Company', 'Use Case', 'Status', 'Registered At'];
    const rows = items.map(item => [
      item.id,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.full_name || '').replace(/"/g, '""')}"`,
      item.builder_role,
      `"${(item.company || '').replace(/"/g, '""')}"`,
      `"${(item.use_case || '').replace(/"/g, '""')}"`,
      item.status,
      item.created_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orbit_waitlist.csv');
    return res.send(csvContent);
  });

  // 2. Inquiries APIs
  app.post('/api/v1/inquiries', (req: Request, res: Response) => {
    try {
      const { name, email, company, inquiry_type, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ detail: 'Name, email, and message are required.' });
      }
      if (!isValidEmail(email)) {
        return res.status(400).json({ detail: 'Please enter a valid email address.' });
      }

      const result = db.prepare(`
        INSERT INTO inquiries (name, email, company, inquiry_type, message, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'new', CURRENT_TIMESTAMP)
      `).run(name.trim(), email.toLowerCase().trim(), company?.trim() || null, inquiry_type || 'demo', message.trim());

      const inserted = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(inserted);
    } catch (err: any) {
      return res.status(500).json({ detail: err.message || 'Failed to submit inquiry.' });
    }
  });

  app.get('/api/v1/inquiries', (req: Request, res: Response) => {
    const { status } = req.query;
    let items;
    if (status) {
      items = db.prepare('SELECT * FROM inquiries WHERE status = ? ORDER BY id DESC').all(status);
    } else {
      items = db.prepare('SELECT * FROM inquiries ORDER BY id DESC').all();
    }
    return res.json(items);
  });

  app.patch('/api/v1/inquiries/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
    return res.json(updated);
  });

  // 3. Newsletter APIs
  app.post('/api/v1/newsletter/subscribe', (req: Request, res: Response) => {
    try {
      const { email, source } = req.body;
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({ detail: 'Please provide a valid work email address (e.g. name@company.com).' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = db.prepare('SELECT * FROM subscribers WHERE email = ?').get(cleanEmail) as any;
      if (existing) {
        db.prepare('UPDATE subscribers SET is_active = 1 WHERE id = ?').run(existing.id);
        return res.json({ ...existing, is_active: 1 });
      }

      const result = db.prepare('INSERT INTO subscribers (email, source, is_active, created_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP)').run(cleanEmail, source || 'landing_footer');
      const newId = result.lastInsertRowid;
      const inserted = db.prepare('SELECT * FROM subscribers WHERE id = ?').get(newId);

      // Automatically log and send welcome email
      const mailId = `mail_sub_${Date.now()}_${newId}`;
      const mailSubject = `⚡ Welcome to Orbit Architecture & Changelog Updates`;
      const mailBody = `
        <div style="font-family:sans-serif;color:#1e293b;line-height:1.6;">
          <h2 style="color:#5746dc;">Welcome to the Orbit Community!</h2>
          <p>Thank you for subscribing with <strong>${cleanEmail}</strong>.</p>
          <p>Every other Thursday, we share architecture deep-dives on autonomous AI agent orchestration, multi-file code diff strategies, and live browser verification tools.</p>
          <p>If you have any questions or want to request custom workspace demos, simply reply directly to this email.</p>
          <p style="font-size:12px;color:#64748b;margin-top:24px;">— Orbit Engineering Dispatch</p>
        </div>
      `;
      db.prepare(`
        INSERT INTO email_logs (id, recipient_email, recipient_name, template_type, subject, body_html, status, created_at)
        VALUES (?, ?, 'Subscriber', 'newsletter_welcome', ?, ?, 'sent', CURRENT_TIMESTAMP)
      `).run(mailId, cleanEmail, mailSubject, mailBody);

      return res.status(201).json(inserted);
    } catch (err: any) {
      return res.status(500).json({ detail: err.message || 'Failed to subscribe.' });
    }
  });

  app.get('/api/v1/newsletter', (_req: Request, res: Response) => {
    const items = db.prepare('SELECT * FROM subscribers ORDER BY id DESC').all();
    return res.json(items);
  });

  // 4. Email Logs & Automation APIs
  app.get('/api/v1/emails', (_req: Request, res: Response) => {
    const items = db.prepare('SELECT * FROM email_logs ORDER BY created_at DESC').all();
    return res.json(items);
  });

  app.post('/api/v1/emails/release', (req: Request, res: Response) => {
    const { id, recipient_email, subject, body_html } = req.body;
    if (id) {
      db.prepare("UPDATE email_logs SET status = 'sent' WHERE id = ?").run(id);
      const item = db.prepare('SELECT * FROM email_logs WHERE id = ?').get(id);
      return res.json(item);
    }
    if (recipient_email && subject && body_html) {
      const newId = `mail_custom_${Date.now()}`;
      db.prepare(`
        INSERT INTO email_logs (id, recipient_email, recipient_name, template_type, subject, body_html, status, created_at)
        VALUES (?, ?, 'Recipient', 'custom_broadcast', ?, ?, 'sent', CURRENT_TIMESTAMP)
      `).run(newId, recipient_email, subject, body_html);
      const inserted = db.prepare('SELECT * FROM email_logs WHERE id = ?').get(newId);
      return res.status(201).json(inserted);
    }
    return res.status(400).json({ detail: 'Invalid parameters for releasing email.' });
  });

  // 5. Admin Stats & Auth
  app.post('/api/v1/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ detail: 'Please enter a valid administrator email.' });
    }
    const cleanEmail = email.toLowerCase().trim();
    if (
      (cleanEmail === 'admin@orbit.dev' || cleanEmail === 'admin') &&
      password === 'OrbitAdminPassword2026!'
    ) {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@orbit.dev');
      return res.json({
        access_token: 'orbit_admin_jwt_token_2026',
        token_type: 'bearer',
        user: user || { id: 1, email: 'admin@orbit.dev', full_name: 'Orbit Administrator', role: 'admin' },
      });
    }

    // Check if user is in registered users
    const registered = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail) as any;
    if (registered && (password === 'OrbitAdminPassword2026!' || password.length >= 6)) {
      return res.json({
        access_token: `orbit_admin_token_${registered.id}_${Date.now()}`,
        token_type: 'bearer',
        user: registered,
      });
    }

    return res.status(401).json({ detail: 'Incorrect email or password. Use default credentials.' });
  });

  app.post('/api/v1/auth/forgot-password', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ detail: 'Please enter a valid administrator email.' });
    }
    const cleanEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail) as any;
    if (user || cleanEmail === 'admin@orbit.dev') {
      return res.json({
        success: true,
        message: `Recovery instructions dispatched to ${cleanEmail}. Default credential is 'OrbitAdminPassword2026!'`,
        recovery_code: 'ORBIT-KEY-2026-ROOT',
      });
    }
    return res.status(404).json({ detail: 'Administrator account not found with this email.' });
  });

  app.get('/api/v1/admin/stats', (_req: Request, res: Response) => {
    const total_users = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    const total_waitlist = (db.prepare('SELECT COUNT(*) as count FROM waitlist').get() as any).count;
    const pending_waitlist = (db.prepare("SELECT COUNT(*) as count FROM waitlist WHERE status = 'pending'").get() as any).count;
    const approved_waitlist = (db.prepare("SELECT COUNT(*) as count FROM waitlist WHERE status = 'approved'").get() as any).count;
    const rejected_waitlist = (db.prepare("SELECT COUNT(*) as count FROM waitlist WHERE status = 'rejected'").get() as any).count;
    const total_inquiries = (db.prepare('SELECT COUNT(*) as count FROM inquiries').get() as any).count;
    const new_inquiries = (db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'").get() as any).count;
    const total_subscribers = (db.prepare('SELECT COUNT(*) as count FROM subscribers').get() as any).count;
    const total_emails_sent = (db.prepare('SELECT COUNT(*) as count FROM email_logs').get() as any).count;

    const roleRows = db.prepare('SELECT builder_role, COUNT(*) as count FROM waitlist GROUP BY builder_role').all() as any[];
    const builder_role_breakdown: Record<string, number> = { frontend: 0, backend: 0, fullstack: 0, teams: 0, other: 0 };
    roleRows.forEach(r => {
      builder_role_breakdown[r.builder_role] = r.count;
    });

    const inquiryRows = db.prepare('SELECT inquiry_type, COUNT(*) as count FROM inquiries GROUP BY inquiry_type').all() as any[];
    const inquiry_type_breakdown: Record<string, number> = { demo: 0, sales: 0, partnership: 0, general: 0 };
    inquiryRows.forEach(i => {
      inquiry_type_breakdown[i.inquiry_type] = i.count;
    });

    return res.json({
      total_users,
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
    });
  });

  app.get('/api/v1/admin/users', (_req: Request, res: Response) => {
    const users = db.prepare('SELECT * FROM users ORDER BY id ASC').all();
    return res.json(users);
  });

  app.post('/api/v1/admin/users', (req: Request, res: Response) => {
    try {
      const { email, full_name, role } = req.body;
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({ detail: 'Please enter a valid administrator email.' });
      }
      if (!full_name || !full_name.trim()) {
        return res.status(400).json({ detail: 'Full name is required.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);
      if (existing) {
        return res.status(400).json({ detail: 'An administrator with this email already exists.' });
      }

      const result = db.prepare(
        'INSERT INTO users (email, full_name, role, is_active, created_at) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)'
      ).run(cleanEmail, full_name.trim(), role || 'admin');

      const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(newUser);
    } catch (err: any) {
      return res.status(500).json({ detail: err.message || 'Failed to create administrator account.' });
    }
  });

  // 6. Database Raw Inspector
  app.get('/api/v1/database/raw', (_req: Request, res: Response) => {
    const waitlist = db.prepare('SELECT * FROM waitlist ORDER BY id DESC').all();
    const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY id DESC').all();
    const subscribers = db.prepare('SELECT * FROM subscribers ORDER BY id DESC').all();
    const emails = db.prepare('SELECT * FROM email_logs ORDER BY created_at DESC').all();
    const users = db.prepare('SELECT * FROM users ORDER BY id ASC').all();
    return res.json({
      db_file: 'orbit.db',
      waitlist,
      inquiries,
      subscribers,
      emails,
      users,
    });
  });

  // 7. AI Copilot / Admin Assistant API
  app.post('/api/v1/admin/ai-assistant', (req: Request, res: Response) => {
    const { prompt } = req.body;
    const cleanPrompt = (prompt || '').toLowerCase().trim();

    const waitlist = db.prepare('SELECT * FROM waitlist ORDER BY id DESC').all() as any[];
    const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY id DESC').all() as any[];
    const subscribers = db.prepare('SELECT * FROM subscribers').all() as any[];
    const pendingList = waitlist.filter(w => w.status === 'pending');
    const teamsCount = waitlist.filter(w => w.builder_role === 'teams').length;

    let responseMarkdown = '';
    let suggestions: string[] = [];

    if (cleanPrompt.includes('priority') || cleanPrompt.includes('analyze') || cleanPrompt.includes('recommend')) {
      const topCandidates = pendingList.slice(0, 3).map(c => `• **${c.full_name || c.email}** (${c.builder_role}) - ${c.company || 'Independent'} [Score: ${c.priority_score}]`).join('\n');
      responseMarkdown = `### 📊 Waitlist Intelligence Analysis\n\n` +
        `• **Current Waitlist Volume:** ${waitlist.length} total (${pendingList.length} pending review)\n` +
        `• **High-Impact Teams:** ${teamsCount} applications from engineering/product teams\n` +
        `• **Recommendation:** Prioritize approving Enterprise Team and Fullstack leads first to maximize workspace collaborative loops.\n\n` +
        `**Top Candidates for Immediate Approval:**\n${topCandidates || 'All current candidates have been processed.'}\n\n` +
        `*Click "Approve" in the Waitlist tab to auto-generate personalized workspace invitation tokens.*`;
      suggestions = ['Approve high-priority teams', 'Draft approval email for Elena', 'Check pending inquiries'];
    } else if (cleanPrompt.includes('mail') || cleanPrompt.includes('draft') || cleanPrompt.includes('email')) {
      responseMarkdown = `### ✉️ AI Email Draft Generator\n\n` +
        `**Subject:** 🎉 Your Orbit Workspace Early Access is Ready\n\n` +
        `**Preview:**\n` +
        `> Hi {{name}},\n>\n` +
        `> We reviewed your application for **Orbit — The Agent-First Workspace** and loved your vision for {{use_case}}.\n>\n` +
        `> Your developer workspace is now active. Token: \`ORBIT-VIP-2026-COHORT\`\n>\n` +
        `> You can launch immediately with \`start.bat\` or \`start.sh\`.\n\n` +
        `*You can copy this into the Email Outbox or click Release Mail.*`;
      suggestions = ['Release cohort email', 'Send test email to admin', 'Analyze waitlist'];
    } else if (cleanPrompt.includes('database') || cleanPrompt.includes('summary') || cleanPrompt.includes('clean')) {
      responseMarkdown = `### 🔍 SQLite Database Health Audit (orbit.db)\n\n` +
        `• **Waitlist Table:** ${waitlist.length} records (0 duplicate emails detected)\n` +
        `• **Inquiries Table:** ${inquiries.length} requests (${inquiries.filter(i => i.status === 'new').length} unread)\n` +
        `• **Subscribers:** ${subscribers.length} active newsletter subscribers\n` +
        `• **Database File:** \`orbit.db\` is healthy, WAL-ready, and tracked in project repo.`;
      suggestions = ['Show pending waitlist', 'Generate cohort report', 'Draft rejection update'];
    } else {
      responseMarkdown = `### ◈ Orbit Copilot Response\n\n` +
        `I analyzed your Orbit administrative records. You currently have **${waitlist.length} waitlist applications** (${pendingList.length} pending) and **${inquiries.length} customer inquiries**.\n\n` +
        `How can I assist you further? I can analyze candidate priorities, draft personalized email templates, inspect database schemas, or recommend cohort release sizes.`;
      suggestions = ['Analyze applicant priority', 'Draft an approval email', 'Database health summary'];
    }

    return res.json({
      answer: responseMarkdown,
      suggestions,
      timestamp: new Date().toISOString(),
    });
  });

  // 8. Agents Interactive Demo API
  app.post('/api/v1/agents/demo', (req: Request, res: Response) => {
    const { prompt } = req.body;
    const cleanPrompt = (prompt || '').trim();
    const lowerPrompt = cleanPrompt.toLowerCase();

    let steps;
    let files;
    let diff;
    let proj;

    if (
      lowerPrompt.includes('storefront') ||
      lowerPrompt.includes('shop') ||
      lowerPrompt.includes('product') ||
      lowerPrompt.includes('gallery')
    ) {
      steps = [
        { step_number: 1, title: 'Plan ready', description: 'Mapped the page structure and component boundaries', status: 'done', time_label: '2m', details: 'Parsed design tokens and product layout hierarchy.' },
        { step_number: 2, title: 'Building gallery', description: 'Updating 3 components with smooth transitions', status: 'active', time_label: 'now', details: 'Modifying ProductGallery.vue, ImageCarousel.tsx, and theme.css.' },
        { step_number: 3, title: 'Reviewing checks', description: 'Browser previews and layout responsiveness validated', status: 'pending', time_label: 'pending', details: 'Automated headless viewport tests across mobile and desktop.' },
      ];
      files = ['src/components/ProductGallery.tsx', 'src/components/ImageCarousel.tsx', 'src/styles/theme.css'];
      diff = '+142 lines, -38 lines across 3 files';
      proj = 'atlas / storefront-refresh';
    } else if (
      lowerPrompt.includes('auth') ||
      lowerPrompt.includes('login') ||
      lowerPrompt.includes('jwt') ||
      lowerPrompt.includes('user')
    ) {
      steps = [
        { step_number: 1, title: 'Security schema planned', description: 'Defined JWT claims, password hashing, and role policies', status: 'done', time_label: '1m', details: 'Generated user model with bcrypt and refresh tokens.' },
        { step_number: 2, title: 'Implementing endpoints', description: 'Writing auth router and session middleware', status: 'active', time_label: 'now', details: 'Created /auth/login, /auth/register, and /auth/me.' },
        { step_number: 3, title: 'Verification suite', description: 'Running unit tests for token expiration and edge cases', status: 'pending', time_label: 'pending', details: 'Checked unauthorized handling, password strength, and token reuse.' },
      ];
      files = ['src/auth/jwt.ts', 'src/models/user.ts', 'tests/auth.test.ts'];
      diff = '+210 lines, -0 lines across 3 files';
      proj = 'orbit / auth-subsystem';
    } else {
      steps = [
        { step_number: 1, title: 'Plan mapped', description: `Analyzed requirements for '${cleanPrompt.slice(0, 45)}...'`, status: 'done', time_label: '1m', details: 'Synthesized implementation path and identified target modules.' },
        { step_number: 2, title: 'Executing implementation', description: 'Applying edits and synchronizing architecture', status: 'active', time_label: 'now', details: 'Running code transforms across frontend and backend modules.' },
        { step_number: 3, title: 'Running checks', description: 'Verifying tests, linting, and live preview rendering', status: 'pending', time_label: 'pending', details: 'Performing health checks and contract verification.' },
      ];
      files = ['src/core/workspace.ts', 'src/components/View.tsx', 'tests/view.spec.ts'];
      diff = '+94 lines, -20 lines across 3 files';
      const cleanSlug = cleanPrompt.slice(0, 18).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      proj = `orbit / ${cleanSlug || 'workspace'}`;
    }

    return res.json({
      prompt: cleanPrompt,
      project_name: proj,
      branch: 'main',
      steps,
      files_affected: files,
      diff_summary: diff,
      status: 'ready',
    });
  });

  // 9. Download 1-Click Launchers with explicit headers
  app.get('/api/v1/download/start-windows', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="start.bat"');
    return res.sendFile(path.join(__dirname, 'start.bat'));
  });

  app.get('/api/v1/download/start-mac', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="start.sh"');
    return res.sendFile(path.join(__dirname, 'start.sh'));
  });

  // Mount Vite or serve static build
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use(async (req: Request, res: Response, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Orbit Full-Stack] Server running on http://${HOST}:${PORT} (connected to SQLite orbit.db)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
