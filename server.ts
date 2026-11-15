import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import helmet from 'helmet';
import { createApiRouter } from './src/server/routes.ts';
import { seedDatabase } from './src/server/seed.ts';

async function bootstrap() {
  await seedDatabase();

  const app = express();
  const isProd = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT || 3000);

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      frameguard: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: isProd
            ? ["'self'", "'unsafe-inline'"]
            : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'", 'ws:', 'wss:'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: [
            "'self'",
            'https://aistudio.google.com',
            'https://*.google.com',
            'https://*.usercontent.goog',
          ],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // Serve uploaded images safely with nosniff
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use(
    '/uploads',
    express.static(uploadsPath, {
      maxAge: '365d',
      immutable: true,
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    })
  );

  // Serve generated portfolio image assets in both dev and production
  const assetsImagesPath = path.resolve(process.cwd(), 'src', 'assets', 'images');
  if (fs.existsSync(assetsImagesPath)) {
    app.use(
      '/src/assets/images',
      express.static(assetsImagesPath, {
        maxAge: '365d',
        immutable: true,
        setHeaders: (res) => {
          res.setHeader('X-Content-Type-Options', 'nosniff');
        },
      })
    );
  }

  // API endpoints
  app.use('/api', createApiRouter());

  // Dynamic sitemap without exposing private routes
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl =
      process.env.APP_URL?.trim() || `${req.protocol}://${req.get('host')}`;
    const cleanBase = baseUrl.replace(/\/+$/, '');
    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${cleanBase}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
    );
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '7d',
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
