import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { z } from 'zod';
import db from './db.ts';
import { sendContactNotification } from './mailer.ts';
import {
  type AdminSessionRequest,
  SESSION_COOKIE_NAME,
  createRateLimiter,
  detectImageExtension,
  ensureCsrfToken,
  getCookieOptions,
  getJwtSecret,
  hashIp,
  requireAdminAuth,
  rotateCsrfToken,
  sanitizeMultiline,
  sanitizeSingleLine,
  sanitizeUrl,
  verifyCsrf,
} from './security.ts';
import { DEFAULT_SITE_CONTENT } from './seed.ts';
import type { Project, SiteContent } from '../types/portfolio.ts';

const DUMMY_BCRYPT_HASH = '$2b$12$dukaIG1Hch4H5ChBwej2yuDSRWJY1KuFe/cBHFv.V6AJ7x/Otk1W2';

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB max
    files: 1,
  },
});

const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: 'Too many sign-in attempts. Please wait 15 minutes before trying again.',
});

const contactRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many messages sent recently. Please wait a few minutes and try again.',
});

function loadSiteContent(): SiteContent {
  const rows = db.prepare('SELECT key, value_json FROM site_content').all() as Array<{
    key: string;
    value_json: string;
  }>;

  const result: SiteContent = structuredClone(DEFAULT_SITE_CONTENT);
  for (const row of rows) {
    if (row.key in result) {
      try {
        (result as unknown as Record<string, unknown>)[row.key] = JSON.parse(row.value_json);
      } catch {
        // Keep default if stored JSON is malformed
      }
    }
  }
  return result;
}

interface ProjectRow {
  id: number;
  title: string;
  slug: string;
  category: 'Automation' | 'Ads' | 'Design';
  description: string;
  tools_used_json: string;
  cover_image: string;
  gallery_json: string;
  live_link: string;
  published: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function mapProjectRow(row: ProjectRow): Project {
  let toolsUsed: string[] = [];
  let gallery: string[] = [];
  try {
    const parsedTools = JSON.parse(row.tools_used_json);
    if (Array.isArray(parsedTools)) toolsUsed = parsedTools.map(String);
  } catch {
    toolsUsed = [];
  }
  try {
    const parsedGallery = JSON.parse(row.gallery_json);
    if (Array.isArray(parsedGallery)) gallery = parsedGallery.map(String);
  } catch {
    gallery = [];
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    description: row.description,
    toolsUsed,
    coverImage: row.cover_image,
    gallery,
    liveLink: row.live_link,
    published: Boolean(row.published),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function makeUniqueSlug(baseTitle: string, excludeId?: number): string {
  const base =
    baseTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'project';

  let candidate = base;
  let counter = 1;
  while (true) {
    const existing = excludeId
      ? (db
          .prepare('SELECT id FROM projects WHERE slug = ? AND id != ?')
          .get(candidate, excludeId) as { id: number } | undefined)
      : (db.prepare('SELECT id FROM projects WHERE slug = ?').get(candidate) as
          | { id: number }
          | undefined);
    if (!existing) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(160),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters.').max(180),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.').max(4000),
  website: z.string().optional(), // honeypot
  formRenderedAt: z.number().optional(),
});

const loginSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(200),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters.')
    .max(200),
});

const projectInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  category: z.enum(['Automation', 'Ads', 'Design']),
  description: z.string().trim().min(10).max(4000),
  toolsUsed: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  coverImage: z.string().trim().max(500).default(''),
  gallery: z.array(z.string().trim().max(500)).max(12).default([]),
  liveLink: z.string().trim().max(500).default(''),
  published: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(10000).optional(),
});

const siteContentSchema = z.object({
  hero: z.object({
    name: z.string().trim().min(1).max(120),
    title: z.string().trim().min(1).max(160),
    valueStatement: z.string().trim().min(1).max(360),
    primaryCtaLabel: z.string().trim().min(1).max(40),
    secondaryCtaLabel: z.string().trim().min(1).max(40),
    metrics: z
      .array(
        z.object({
          label: z.string().trim().min(1).max(60),
          value: z.string().trim().min(1).max(60),
        })
      )
      .max(6),
  }),
  about: z.object({
    headline: z.string().trim().min(1).max(240),
    summary: z.string().trim().min(1).max(1600),
    extendedBio: z.string().trim().max(1600),
    location: z.string().trim().min(1).max(120),
    experienceYears: z.string().trim().min(1).max(80),
    profileImage: z.string().trim().max(500),
  }),
  skills: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(60),
        name: z.string().trim().min(1).max(80),
        category: z.string().trim().min(1).max(60),
        detail: z.string().trim().max(200),
        level: z.number().int().min(1).max(100),
      })
    )
    .max(24),
  services: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(60),
        number: z.string().trim().min(1).max(12),
        title: z.string().trim().min(1).max(100),
        description: z.string().trim().min(1).max(600),
        deliverables: z.array(z.string().trim().min(1).max(80)).max(8),
      })
    )
    .max(12),
  experience: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(60),
        role: z.string().trim().min(1).max(140),
        organization: z.string().trim().min(1).max(140),
        period: z.string().trim().min(1).max(80),
        location: z.string().trim().max(120),
        summary: z.string().trim().max(800),
      })
    )
    .max(12),
  education: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(60),
        degree: z.string().trim().min(1).max(140),
        institution: z.string().trim().min(1).max(160),
        status: z.string().trim().max(80),
        location: z.string().trim().max(120),
      })
    )
    .max(10),
  certifications: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(60),
        title: z.string().trim().min(1).max(140),
        issuer: z.string().trim().max(140),
        level: z.string().trim().max(60),
      })
    )
    .max(20),
  languages: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(60),
        name: z.string().trim().min(1).max(60),
        proficiency: z.string().trim().min(1).max(60),
      })
    )
    .max(10),
  contact: z.object({
    email: z.string().trim().email().max(160),
    phone: z.string().trim().max(40),
    location: z.string().trim().min(1).max(120),
    fiverrUrl: z.string().trim().max(300),
    fiverrLabel: z.string().trim().max(120),
    availability: z.string().trim().max(240),
    socialLinks: z
      .array(
        z.object({
          id: z.string().trim().min(1).max(60),
          platform: z.string().trim().min(1).max(60),
          label: z.string().trim().min(1).max(80),
          url: z.string().trim().max(300),
        })
      )
      .max(10),
  }),
  seo: z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(260),
  }),
});

export function createApiRouter(): express.Router {
  const router = express.Router();

  // CSRF bootstrap endpoint
  router.get('/csrf', (req, res) => {
    const csrfToken = ensureCsrfToken(req, res);
    res.json({ csrfToken });
  });

  // Public site content (only public fields)
  router.get('/public/site', (req, res) => {
    ensureCsrfToken(req, res);
    const content = loadSiteContent();
    res.json(content);
  });

  // Public published projects only
  router.get('/public/projects', (req, res) => {
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const validCategory = ['Automation', 'Ads', 'Design'].includes(category);

    const rows = validCategory
      ? (db
          .prepare(
            `SELECT * FROM projects WHERE published = 1 AND category = ? ORDER BY sort_order ASC, id DESC`
          )
          .all(category) as ProjectRow[])
      : (db
          .prepare(
            `SELECT * FROM projects WHERE published = 1 ORDER BY sort_order ASC, id DESC`
          )
          .all() as ProjectRow[]);

    res.json({ projects: rows.map(mapProjectRow) });
  });

  // Public contact form (write-only, rate-limited, CSRF + honeypot protected)
  router.post('/contact', contactRateLimiter, verifyCsrf, (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Please check all required fields.',
      });
      return;
    }

    const { website, formRenderedAt } = parsed.data;
    // Honeypot triggered -> silently pretend success without storing spam
    if (website && website.trim().length > 0) {
      res.status(201).json({ ok: true });
      return;
    }

    // Timing bot check (must take at least 1200ms since form mounted)
    if (typeof formRenderedAt === 'number' && Date.now() - formRenderedAt < 1200) {
      res.status(400).json({ error: 'Please take a moment before submitting the form.' });
      return;
    }

    const name = sanitizeSingleLine(parsed.data.name, 120);
    const email = sanitizeSingleLine(parsed.data.email, 160).toLowerCase();
    const subject = sanitizeSingleLine(parsed.data.subject, 180);
    const message = sanitizeMultiline(parsed.data.message, 4000);

    db.prepare(
      `INSERT INTO messages (name, email, subject, message, ip_hash) VALUES (?, ?, ?, ?, ?)`
    ).run(name, email, subject, message, hashIp(req));

    // Fire-and-forget optional email notification if SMTP env vars are set
    void sendContactNotification({ name, email, subject, message }).catch(() => {
      // Do not fail user submission if optional SMTP fails
    });

    res.status(201).json({ ok: true });
  });

  // --- Admin Auth Routes ---

  router.post('/auth/login', loginRateLimiter, verifyCsrf, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    const username = sanitizeSingleLine(parsed.data.username, 80);
    const password = parsed.data.password;

    const userRow = db
      .prepare(
        `SELECT id, username, password_hash, failed_attempts, locked_until FROM admin_users WHERE username = ?`
      )
      .get(username) as
      | {
          id: number;
          username: string;
          password_hash: string;
          failed_attempts: number;
          locked_until: string | null;
        }
      | undefined;

    if (userRow?.locked_until) {
      const lockExpiry = new Date(userRow.locked_until).getTime();
      if (Number.isFinite(lockExpiry) && lockExpiry > Date.now()) {
        const remainingMinutes = Math.max(1, Math.ceil((lockExpiry - Date.now()) / 60000));
        res.status(429).json({
          error: `Account temporarily locked after repeated failures. Try again in ${remainingMinutes} minute(s).`,
        });
        return;
      }
    }

    const hashToCheck = userRow ? userRow.password_hash : DUMMY_BCRYPT_HASH;
    const isMatch = await bcrypt.compare(password, hashToCheck);

    if (!userRow || !isMatch) {
      if (userRow) {
        const nextAttempts = userRow.failed_attempts + 1;
        const shouldLock = nextAttempts >= 5;
        const lockedUntil = shouldLock
          ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
          : null;

        db.prepare(
          `UPDATE admin_users SET failed_attempts = ?, locked_until = ?, updated_at = datetime('now') WHERE id = ?`
        ).run(shouldLock ? 0 : nextAttempts, lockedUntil, userRow.id);

        if (shouldLock) {
          res.status(429).json({
            error: 'Too many failed sign-in attempts. Account locked for 15 minutes.',
          });
          return;
        }
      }

      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    db.prepare(
      `UPDATE admin_users SET failed_attempts = 0, locked_until = NULL, updated_at = datetime('now') WHERE id = ?`
    ).run(userRow.id);

    const token = jwt.sign(
      { sub: String(userRow.id), username: userRow.username },
      getJwtSecret(),
      { algorithm: 'HS256', expiresIn: '8h' }
    );

    res.cookie(SESSION_COOKIE_NAME, token, getCookieOptions(req, 8 * 60 * 60 * 1000));
    const newCsrf = rotateCsrfToken(req, res);

    res.json({
      ok: true,
      csrfToken: newCsrf,
      user: { username: userRow.username },
    });
  });

  router.post('/auth/logout', verifyCsrf, (req, res) => {
    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
    const newCsrf = rotateCsrfToken(req, res);
    res.json({ ok: true, csrfToken: newCsrf });
  });

  router.get('/auth/me', requireAdminAuth, (req: AdminSessionRequest, res) => {
    const csrfToken = ensureCsrfToken(req, res);
    res.json({
      authenticated: true,
      csrfToken,
      user: req.adminUser,
    });
  });

  router.post(
    '/auth/change-password',
    requireAdminAuth,
    verifyCsrf,
    async (req: AdminSessionRequest, res) => {
      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Invalid password payload.',
        });
        return;
      }

      const adminRow = db
        .prepare('SELECT id, password_hash FROM admin_users WHERE id = ?')
        .get(req.adminUser!.id) as { id: number; password_hash: string } | undefined;

      if (!adminRow) {
        res.status(401).json({ error: 'Account not found.' });
        return;
      }

      const validCurrent = await bcrypt.compare(
        parsed.data.currentPassword,
        adminRow.password_hash
      );
      if (!validCurrent) {
        res.status(400).json({ error: 'Current password is incorrect.' });
        return;
      }

      const nextHash = await bcrypt.hash(parsed.data.newPassword, 12);
      db.prepare(
        `UPDATE admin_users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`
      ).run(nextHash, adminRow.id);

      res.json({ ok: true });
    }
  );

  // --- Protected Admin Content Routes ---

  router.get('/admin/content', requireAdminAuth, (_req, res) => {
    res.json(loadSiteContent());
  });

  router.put('/admin/content', requireAdminAuth, verifyCsrf, (req, res) => {
    const parsed = siteContentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid site content payload.',
      });
      return;
    }

    const d = parsed.data;
    const sanitized: SiteContent = {
      hero: {
        name: sanitizeSingleLine(d.hero.name, 120),
        title: sanitizeSingleLine(d.hero.title, 160),
        valueStatement: sanitizeSingleLine(d.hero.valueStatement, 360),
        primaryCtaLabel: sanitizeSingleLine(d.hero.primaryCtaLabel, 40),
        secondaryCtaLabel: sanitizeSingleLine(d.hero.secondaryCtaLabel, 40),
        metrics: d.hero.metrics.map((m) => ({
          label: sanitizeSingleLine(m.label, 60),
          value: sanitizeSingleLine(m.value, 60),
        })),
      },
      about: {
        headline: sanitizeSingleLine(d.about.headline, 240),
        summary: sanitizeMultiline(d.about.summary, 1600),
        extendedBio: sanitizeMultiline(d.about.extendedBio, 1600),
        location: sanitizeSingleLine(d.about.location, 120),
        experienceYears: sanitizeSingleLine(d.about.experienceYears, 80),
        profileImage: sanitizeUrl(d.about.profileImage),
      },
      skills: d.skills.map((s) => ({
        id: sanitizeSingleLine(s.id, 60),
        name: sanitizeSingleLine(s.name, 80),
        category: sanitizeSingleLine(s.category, 60),
        detail: sanitizeSingleLine(s.detail, 200),
        level: s.level,
      })),
      services: d.services.map((srv) => ({
        id: sanitizeSingleLine(srv.id, 60),
        number: sanitizeSingleLine(srv.number, 12),
        title: sanitizeSingleLine(srv.title, 100),
        description: sanitizeMultiline(srv.description, 600),
        deliverables: srv.deliverables.map((item) => sanitizeSingleLine(item, 80)),
      })),
      experience: d.experience.map((exp) => ({
        id: sanitizeSingleLine(exp.id, 60),
        role: sanitizeSingleLine(exp.role, 140),
        organization: sanitizeSingleLine(exp.organization, 140),
        period: sanitizeSingleLine(exp.period, 80),
        location: sanitizeSingleLine(exp.location, 120),
        summary: sanitizeMultiline(exp.summary, 800),
      })),
      education: d.education.map((edu) => ({
        id: sanitizeSingleLine(edu.id, 60),
        degree: sanitizeSingleLine(edu.degree, 140),
        institution: sanitizeSingleLine(edu.institution, 160),
        status: sanitizeSingleLine(edu.status, 80),
        location: sanitizeSingleLine(edu.location, 120),
      })),
      certifications: d.certifications.map((cert) => ({
        id: sanitizeSingleLine(cert.id, 60),
        title: sanitizeSingleLine(cert.title, 140),
        issuer: sanitizeSingleLine(cert.issuer, 140),
        level: sanitizeSingleLine(cert.level, 60),
      })),
      languages: d.languages.map((lang) => ({
        id: sanitizeSingleLine(lang.id, 60),
        name: sanitizeSingleLine(lang.name, 60),
        proficiency: sanitizeSingleLine(lang.proficiency, 60),
      })),
      contact: {
        email: sanitizeSingleLine(d.contact.email, 160),
        phone: sanitizeSingleLine(d.contact.phone, 40),
        location: sanitizeSingleLine(d.contact.location, 120),
        fiverrUrl: sanitizeUrl(d.contact.fiverrUrl),
        fiverrLabel: sanitizeSingleLine(d.contact.fiverrLabel, 120),
        availability: sanitizeSingleLine(d.contact.availability, 240),
        socialLinks: d.contact.socialLinks.map((soc) => ({
          id: sanitizeSingleLine(soc.id, 60),
          platform: sanitizeSingleLine(soc.platform, 60),
          label: sanitizeSingleLine(soc.label, 80),
          url: sanitizeUrl(soc.url),
        })),
      },
      seo: {
        title: sanitizeSingleLine(d.seo.title, 120),
        description: sanitizeSingleLine(d.seo.description, 260),
      },
    };

    const upsert = db.prepare(`
      INSERT INTO site_content (key, value_json, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = datetime('now')
    `);

    const tx = db.transaction(() => {
      for (const [key, value] of Object.entries(sanitized)) {
        upsert.run(key, JSON.stringify(value));
      }
    });
    tx();

    res.json(sanitized);
  });

  // --- Protected Admin Projects Routes ---

  router.get('/admin/projects', requireAdminAuth, (_req, res) => {
    const rows = db
      .prepare('SELECT * FROM projects ORDER BY sort_order ASC, id DESC')
      .all() as ProjectRow[];
    res.json({ projects: rows.map(mapProjectRow) });
  });

  router.post('/admin/projects', requireAdminAuth, verifyCsrf, (req, res) => {
    const parsed = projectInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid project data.',
      });
      return;
    }

    const data = parsed.data;
    const title = sanitizeSingleLine(data.title, 160);
    const slug = makeUniqueSlug(title);
    const description = sanitizeMultiline(data.description, 4000);
    const toolsUsed = data.toolsUsed.map((t) => sanitizeSingleLine(t, 60)).filter(Boolean);
    const coverImage = sanitizeUrl(data.coverImage);
    const gallery = data.gallery.map((g) => sanitizeUrl(g)).filter(Boolean);
    const liveLink = sanitizeUrl(data.liveLink);

    const maxOrderRow = db
      .prepare('SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM projects')
      .get() as { max_order: number };
    const sortOrder = data.sortOrder ?? maxOrderRow.max_order + 1;

    const info = db
      .prepare(
        `INSERT INTO projects (
          title, slug, category, description, tools_used_json,
          cover_image, gallery_json, live_link, published, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        title,
        slug,
        data.category,
        description,
        JSON.stringify(toolsUsed),
        coverImage,
        JSON.stringify(gallery),
        liveLink,
        data.published ? 1 : 0,
        sortOrder
      );

    const created = db
      .prepare('SELECT * FROM projects WHERE id = ?')
      .get(info.lastInsertRowid) as ProjectRow;

    res.status(201).json({ project: mapProjectRow(created) });
  });

  router.put('/admin/projects/:id', requireAdminAuth, verifyCsrf, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid project ID.' });
      return;
    }

    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as
      | ProjectRow
      | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const parsed = projectInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid project data.',
      });
      return;
    }

    const data = parsed.data;
    const title = sanitizeSingleLine(data.title, 160);
    const slug = makeUniqueSlug(title, id);
    const description = sanitizeMultiline(data.description, 4000);
    const toolsUsed = data.toolsUsed.map((t) => sanitizeSingleLine(t, 60)).filter(Boolean);
    const coverImage = sanitizeUrl(data.coverImage);
    const gallery = data.gallery.map((g) => sanitizeUrl(g)).filter(Boolean);
    const liveLink = sanitizeUrl(data.liveLink);
    const sortOrder = data.sortOrder ?? existing.sort_order;

    db.prepare(
      `UPDATE projects
       SET title = ?, slug = ?, category = ?, description = ?, tools_used_json = ?,
           cover_image = ?, gallery_json = ?, live_link = ?, published = ?, sort_order = ?,
           updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      title,
      slug,
      data.category,
      description,
      JSON.stringify(toolsUsed),
      coverImage,
      JSON.stringify(gallery),
      liveLink,
      data.published ? 1 : 0,
      sortOrder,
      id
    );

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow;
    res.json({ project: mapProjectRow(updated) });
  });

  router.delete('/admin/projects/:id', requireAdminAuth, verifyCsrf, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid project ID.' });
      return;
    }

    const info = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    if (info.changes === 0) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    res.json({ ok: true });
  });

  router.post('/admin/projects/reorder', requireAdminAuth, verifyCsrf, (req, res) => {
    const schema = z.object({
      orderedIds: z.array(z.number().int().positive()).max(500),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid reorder payload.' });
      return;
    }

    const updateOrder = db.prepare(
      `UPDATE projects SET sort_order = ?, updated_at = datetime('now') WHERE id = ?`
    );
    const tx = db.transaction(() => {
      parsed.data.orderedIds.forEach((projId, index) => {
        updateOrder.run(index + 1, projId);
      });
    });
    tx();

    const rows = db
      .prepare('SELECT * FROM projects ORDER BY sort_order ASC, id DESC')
      .all() as ProjectRow[];
    res.json({ projects: rows.map(mapProjectRow) });
  });

  // --- Protected Admin Messages Routes ---

  router.get('/admin/messages', requireAdminAuth, (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const filter = typeof req.query.filter === 'string' ? req.query.filter : 'all';

    let sql = `SELECT id, name, email, subject, message, is_read, created_at FROM messages WHERE 1=1`;
    const params: Array<string | number> = [];

    if (filter === 'unread') {
      sql += ` AND is_read = 0`;
    } else if (filter === 'read') {
      sql += ` AND is_read = 1`;
    }

    if (search) {
      sql += ` AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY id DESC LIMIT 200`;

    const rows = db.prepare(sql).all(...params) as Array<{
      id: number;
      name: string;
      email: string;
      subject: string;
      message: string;
      is_read: number;
      created_at: string;
    }>;

    res.json({
      messages: rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        subject: r.subject,
        message: r.message,
        isRead: Boolean(r.is_read),
        createdAt: r.created_at,
      })),
    });
  });

  router.patch('/admin/messages/:id', requireAdminAuth, verifyCsrf, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid message ID.' });
      return;
    }

    const schema = z.object({ isRead: z.boolean() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid status payload.' });
      return;
    }

    const info = db
      .prepare('UPDATE messages SET is_read = ? WHERE id = ?')
      .run(parsed.data.isRead ? 1 : 0, id);

    if (info.changes === 0) {
      res.status(404).json({ error: 'Message not found.' });
      return;
    }

    res.json({ ok: true });
  });

  router.delete('/admin/messages/:id', requireAdminAuth, verifyCsrf, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid message ID.' });
      return;
    }

    const info = db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    if (info.changes === 0) {
      res.status(404).json({ error: 'Message not found.' });
      return;
    }

    res.json({ ok: true });
  });

  // --- Protected Image Upload Endpoint ---

  router.post(
    '/admin/upload',
    requireAdminAuth,
    verifyCsrf,
    (req, res, next) => {
      upload.single('image')(req, res, (err) => {
        if (err) {
          res.status(400).json({
            error:
              err.code === 'LIMIT_FILE_SIZE'
                ? 'Image must be 3 MB or smaller.'
                : 'Failed to process uploaded file.',
          });
          return;
        }
        next();
      });
    },
    (req, res) => {
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided.' });
        return;
      }

      const allowedMimes = new Set(['image/jpeg', 'image/png', 'image/webp']);
      if (!allowedMimes.has(req.file.mimetype)) {
        res.status(400).json({ error: 'Only JPEG, PNG, and WebP images are permitted.' });
        return;
      }

      const detectedExt = detectImageExtension(req.file.buffer);
      if (!detectedExt) {
        res.status(400).json({
          error: 'Invalid image file signature. File content does not match JPEG, PNG, or WebP.',
        });
        return;
      }

      const filename = `${crypto.randomUUID()}.${detectedExt}`;
      const targetPath = path.join(uploadsDir, filename);
      fs.writeFileSync(targetPath, req.file.buffer, { mode: 0o644 });

      res.status(201).json({ url: `/uploads/${filename}` });
    }
  );

  return router;
}
