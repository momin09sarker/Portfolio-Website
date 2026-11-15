# MD Abdul Momin Sarker — Portfolio & Admin Console

Full-stack personal portfolio website for **MD Abdul Momin Sarker**, Digital Marketing & Automation Specialist from Gaibandha, Bangladesh.

## Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Three.js (lazy-loaded 3D automation workflow visualization), GSAP + ScrollTrigger, Lenis smooth scroll
- **Backend**: Node.js + Express (`server.ts`)
- **Database**: Embedded SQLite (`better-sqlite3` at `data/portfolio.db`) with parameterized queries, plus PostgreSQL schema (`db/schema.postgres.sql`) for cloud Postgres deployments
- **Security**:
  - `httpOnly`, `sameSite=lax`, `secure` (over HTTPS) JWT session cookies
  - Double-submit CSRF token validation (`x-csrf-token` matching `httpOnly` CSRF cookie)
  - `bcryptjs` password hashing (cost factor 12)
  - Sliding-window IP rate limiting + database-backed account lockout after 5 failed login attempts
  - Honeypot field + minimum render-time check + Zod validation & sanitization on contact form
  - Image upload MIME + binary magic-byte validation (`JPEG`, `PNG`, `WebP`, max 3 MB)
  - `helmet` CSP, HSTS, `X-Content-Type-Options: nosniff`, and strict referrer policy

## Local Setup

1. Copy `.env.example` to `.env` and set a strong `JWT_SECRET` (at least 32 characters).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server (Express API + Vite SSR/HMR on port 3000):
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Database & Seeding

- On first startup, `src/server/seed.ts` automatically creates all SQLite tables (`site_content`, `projects`, `messages`, `admin_users`), populates initial portfolio copy and starter projects, and seeds the initial admin user using a bcrypt hash.
- Optional environment overrides `ADMIN_INITIAL_USERNAME` and `ADMIN_INITIAL_PASSWORD` are read only when `admin_users` is empty.
- Change the admin password immediately after first login inside `/admin` -> **Account**.
- For PostgreSQL (Neon / Supabase), apply `db/schema.postgres.sql` to your instance.

## Optional Email Notifications

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `CONTACT_NOTIFY_EMAIL` in your server `.env` to receive an email notification whenever a visitor submits the **Get in Touch** form.

## Deployment Guide

### Option A: Railway / Render / Fly.io (Node + Persistent Disk)
1. Deploy the repository as a Node web service (`npm run build` as build command, `npm start` as start command).
2. Mount a persistent volume at `/app/data` and `/app/uploads` so SQLite data and uploaded images persist across deploys.
3. Configure environment variables (`NODE_ENV=production`, `PORT=3000`, `APP_URL`, `JWT_SECRET`, and optional SMTP vars).

### Option B: Vercel / Serverless + Managed PostgreSQL (Neon / Supabase)
1. Provision a PostgreSQL database on Neon or Supabase and run `db/schema.postgres.sql`.
2. Replace `src/server/db.ts` queries with `pg` (`Pool` using `process.env.DATABASE_URL`) and store uploaded images in S3/Cloudinary/Supabase Storage instead of local disk (`uploads/`).
3. Configure `JWT_SECRET` and `DATABASE_URL` in Vercel Project Environment Variables.

### Option C: GitHub Pages (Static Frontend Only)
1. `vite.config.ts` uses `base: './'` for production builds so assets load cleanly under `https://<username>.github.io/<repo-name>/`.
2. Enable **Settings → Pages → Source: GitHub Actions** in your repository; the included `.github/workflows/deploy.yml` builds `dist/`, creates `404.html`, and deploys automatically on push to `main`.
3. Note: GitHub Pages serves static files only; dynamic `/admin` editing, SQLite storage, and server-side contact delivery require running the Express backend (Option A or B).

