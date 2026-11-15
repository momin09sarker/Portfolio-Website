import bcrypt from 'bcryptjs';
import db from './db.ts';
import type { SiteContent } from '../types/portfolio.ts';

const INITIAL_ADMIN_USERNAME = process.env.ADMIN_INITIAL_USERNAME?.trim() || 'abdulmomin';
const INITIAL_ADMIN_HASH =
  '$2b$12$dukaIG1Hch4H5ChBwej2yuDSRWJY1KuFe/cBHFv.V6AJ7x/Otk1W2';

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    name: 'MD ABDUL MOMIN SARKER',
    title: 'Digital Marketing & Automation Specialist',
    valueStatement:
      'Building n8n automation workflows, Meta advertising systems, and clean visual identities that save hours every week.',
    primaryCtaLabel: 'View Work',
    secondaryCtaLabel: 'Get in Touch',
    metrics: [
      { label: 'Freelance Practice', value: '1+ Year' },
      { label: 'Core Automation', value: 'n8n & Webhooks' },
      { label: 'Paid Acquisition', value: 'Facebook & IG Ads' },
      { label: 'Based In', value: 'Gaibandha, BD' },
    ],
  },
  about: {
    headline: 'Eliminating repetitive manual work while sharpening brand presence.',
    summary:
      'With over a year of hands-on freelance experience, I partner with businesses and founders to connect scattered tools using n8n workflow automation, run structured Facebook and Instagram ad campaigns, and craft cohesive visual assets rooted in formal graphic design training.',
    extendedBio:
      'Operating from Gaibandha, Bangladesh, I bridge technical workflow logic with performance marketing and clean visual design—ensuring your lead capture, reporting, and creative pipelines run reliably without manual bottlenecks.',
    location: 'Gaibandha, Bangladesh',
    experienceYears: '1 Year Freelance Experience',
    profileImage: '/src/assets/images/profile_abdul_momin_1794639129858.jpg',
  },
  skills: [
    {
      id: 'skill-automation',
      name: 'Automation',
      category: 'Systems',
      detail: 'n8n, Webhook Orchestration, API Integrations, CRM Sync',
      level: 92,
    },
    {
      id: 'skill-ads',
      name: 'Digital Advertising',
      category: 'Growth',
      detail: 'Facebook Ads, Instagram Ads, Pixel & Conversion Tracking',
      level: 88,
    },
    {
      id: 'skill-design',
      name: 'Graphic Design',
      category: 'Visual',
      detail: 'Brand Identity, Social Creatives, Ad Layouts, Print Systems',
      level: 86,
    },
    {
      id: 'skill-marketing',
      name: 'Digital Marketing',
      category: 'Strategy',
      detail: 'Lead Funnels, Content Planning, Audience Research',
      level: 85,
    },
    {
      id: 'skill-office',
      name: 'Computer Office Applications',
      category: 'Operations',
      detail: 'Spreadsheets, Structured Reporting, Client Documentation',
      level: 94,
    },
  ],
  services: [
    {
      id: 'srv-n8n',
      number: '01.',
      title: 'n8n Workflow Automation',
      description:
        'Custom multi-step workflows connecting web forms, Google Sheets, CRMs, email notifications, and social channels so leads and operations move automatically.',
      deliverables: ['Webhook & API pipelines', 'Lead routing & alerts', 'Automated reporting'],
    },
    {
      id: 'srv-ads',
      number: '02.',
      title: 'Social Media Advertising',
      description:
        'Structured Facebook and Instagram ad campaigns built around clear audience testing, creative iteration, and measurable cost-per-result tracking.',
      deliverables: ['Meta Ads Manager setup', 'Audience & funnel testing', 'Performance audits'],
    },
    {
      id: 'srv-design',
      number: '03.',
      title: 'Graphic Design',
      description:
        'Clean, purposeful brand visuals, social campaign graphics, and high-contrast ad creatives informed by certified Level 3 graphic design craft.',
      deliverables: ['Ad creative systems', 'Brand & social kits', 'Print-ready layouts'],
    },
    {
      id: 'srv-marketing',
      number: '04.',
      title: 'Digital Marketing Support',
      description:
        'End-to-end execution support combining campaign coordination, spreadsheet tracking, landing page alignment, and ongoing channel optimization.',
      deliverables: ['Campaign coordination', 'Analytics & sheets', 'Ongoing optimization'],
    },
  ],
  experience: [
    {
      id: 'exp-1',
      role: 'Freelance Digital Marketing & Automation Specialist',
      organization: 'Independent Practice · Fiverr & Direct Clients',
      period: '1 Year — Present',
      location: 'Gaibandha, Bangladesh (Remote)',
      summary:
        'Delivering n8n workflow automations, Facebook & Instagram ad management, and graphic design systems for international and local clients.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'Honours (Final Year)',
      institution: 'Gaibandha Government College',
      status: 'Final Year Candidate',
      location: 'Gaibandha, Bangladesh',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      title: 'Graphic Design Level 3',
      issuer: 'National Skill Standard Certification',
      level: 'Level 3',
    },
    {
      id: 'cert-2',
      title: 'Graphic Design for Freelancing Level 3',
      issuer: 'National Skill Standard Certification',
      level: 'Level 3',
    },
    {
      id: 'cert-3',
      title: 'Computer Office Application',
      issuer: 'Certified Technical Training',
      level: 'Certified',
    },
    {
      id: 'cert-4',
      title: 'Digital Marketing',
      issuer: 'Professional Marketing Certification',
      level: 'Certified',
    },
  ],
  languages: [
    { id: 'lang-bn', name: 'Bangla', proficiency: 'Native' },
    { id: 'lang-en', name: 'English', proficiency: 'Fluent' },
  ],
  contact: {
    email: 'momin09sarker@gmail.com',
    phone: '',
    location: 'Gaibandha, Bangladesh',
    fiverrUrl: 'https://www.fiverr.com/abdulmomin15',
    fiverrLabel: 'fiverr.com/abdulmomin15',
    availability: 'Available for freelance projects and ongoing automation retainers.',
    socialLinks: [
      {
        id: 'soc-fiverr',
        platform: 'Fiverr',
        label: 'Fiverr Profile',
        url: 'https://www.fiverr.com/abdulmomin15',
      },
      {
        id: 'soc-linkedin',
        platform: 'LinkedIn',
        label: 'LinkedIn',
        url: 'https://www.linkedin.com',
      },
      {
        id: 'soc-facebook',
        platform: 'Facebook',
        label: 'Facebook',
        url: 'https://www.facebook.com',
      },
    ],
  },
  seo: {
    title: 'MD Abdul Momin Sarker – Digital Marketing & Automation Specialist',
    description:
      'Portfolio of MD Abdul Momin Sarker: n8n workflow automation, Facebook and Instagram Ads, graphic design, and digital marketing from Gaibandha, Bangladesh.',
  },
};

const STARTER_PROJECTS = [
  {
    title: 'Lead Capture to CRM & WhatsApp Notification Pipeline',
    slug: 'lead-capture-crm-n8n-pipeline',
    category: 'Automation',
    description:
      'Designed an automated n8n workflow that receives Meta Lead Ads and website webhook payloads, validates and deduplicates contacts in Google Sheets, routes qualified leads to CRM stages, and dispatches instant summary notifications.',
    toolsUsed: ['n8n', 'Webhooks', 'Google Sheets', 'REST APIs'],
    coverImage: '/src/assets/images/project_n8n_automation_1794639130724.jpg',
    gallery: ['/src/assets/images/project_n8n_automation_1794639130724.jpg'],
    liveLink: 'https://www.fiverr.com/abdulmomin15',
    published: 1,
    sortOrder: 1,
  },
  {
    title: 'Meta Ads Conversion Funnel for Regional E-Commerce',
    slug: 'meta-ads-conversion-funnel-ecommerce',
    category: 'Ads',
    description:
      'Structured a full-funnel Facebook and Instagram advertising architecture separating cold prospecting from warm retargeting audiences, paired with fresh static and carousel creative testing.',
    toolsUsed: ['Facebook Ads', 'Instagram Ads', 'Meta Pixel', 'Campaign Reporting'],
    coverImage: '/src/assets/images/project_meta_ads_analytics_1794639131682.jpg',
    gallery: ['/src/assets/images/project_meta_ads_analytics_1794639131682.jpg'],
    liveLink: 'https://www.fiverr.com/abdulmomin15',
    published: 1,
    sortOrder: 2,
  },
  {
    title: 'Minimalist Brand Identity & Ad Creative System',
    slug: 'minimalist-brand-identity-creative-system',
    category: 'Design',
    description:
      'Crafted a cohesive visual identity, print stationery layout, and modular social media ad template kit balancing high-contrast typography with clean grid geometry.',
    toolsUsed: ['Adobe Illustrator', 'Adobe Photoshop', 'Brand Grid Systems'],
    coverImage: '/src/assets/images/project_brand_identity_design_1794639131650.jpg',
    gallery: ['/src/assets/images/project_brand_identity_design_1794639131650.jpg'],
    liveLink: 'https://www.fiverr.com/abdulmomin15',
    published: 1,
    sortOrder: 3,
  },
];

export async function seedDatabase(): Promise<void> {
  // 1. Seed admin user if none exists
  const adminCountRow = db
    .prepare('SELECT COUNT(*) AS cnt FROM admin_users')
    .get() as { cnt: number };

  if (adminCountRow.cnt === 0) {
    const customPassword = process.env.ADMIN_INITIAL_PASSWORD?.trim();
    const passwordHash = customPassword
      ? await bcrypt.hash(customPassword, 12)
      : INITIAL_ADMIN_HASH;

    db.prepare(
      `INSERT INTO admin_users (username, password_hash) VALUES (?, ?)`
    ).run(INITIAL_ADMIN_USERNAME, passwordHash);
  }

  // 2. Seed site_content keys idempotently
  const insertContent = db.prepare(
    `INSERT OR IGNORE INTO site_content (key, value_json) VALUES (?, ?)`
  );

  const entries = Object.entries(DEFAULT_SITE_CONTENT) as Array<
    [keyof SiteContent, SiteContent[keyof SiteContent]]
  >;
  const seedContentTx = db.transaction(() => {
    for (const [key, value] of entries) {
      insertContent.run(key, JSON.stringify(value));
    }
  });
  seedContentTx();

  // 3. Seed starter projects if projects table is empty
  const projectCountRow = db
    .prepare('SELECT COUNT(*) AS cnt FROM projects')
    .get() as { cnt: number };

  if (projectCountRow.cnt === 0) {
    const insertProject = db.prepare(`
      INSERT INTO projects (
        title, slug, category, description, tools_used_json,
        cover_image, gallery_json, live_link, published, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedProjectsTx = db.transaction(() => {
      for (const p of STARTER_PROJECTS) {
        insertProject.run(
          p.title,
          p.slug,
          p.category,
          p.description,
          JSON.stringify(p.toolsUsed),
          p.coverImage,
          JSON.stringify(p.gallery),
          p.liveLink,
          p.published,
          p.sortOrder
        );
      }
    });
    seedProjectsTx();
  }
}
