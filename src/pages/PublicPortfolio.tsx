import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin, User } from 'lucide-react';
import profileImg from '../assets/images/profile_abdul_momin_1794639129858.jpg';
import projectAutomationImg from '../assets/images/project_n8n_automation_1794639130724.jpg';
import projectAdsImg from '../assets/images/project_meta_ads_analytics_1794639131682.jpg';
import projectDesignImg from '../assets/images/project_brand_identity_design_1794639131650.jpg';
import { ContactSection } from '../components/ContactSection';
import { CursorFollower } from '../components/CursorFollower';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Navbar } from '../components/Navbar';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectModal } from '../components/ProjectModal';
import { fetchPublicProjects, fetchPublicSiteContent } from '../lib/api';
import type { Project, ProjectCategory, SiteContent } from '../types/portfolio';

gsap.registerPlugin(ScrollTrigger);

const HeroWorkflow3D = lazy(() => import('../components/HeroWorkflow3D'));

const CATEGORIES: Array<'All' | ProjectCategory> = ['All', 'Automation', 'Ads', 'Design'];

const FALLBACK_CONTENT: SiteContent = {
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
    profileImage: profileImg,
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

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Lead Capture to CRM & WhatsApp Notification Pipeline',
    slug: 'lead-capture-crm-n8n-pipeline',
    category: 'Automation',
    description:
      'Designed an automated n8n workflow that receives Meta Lead Ads and website webhook payloads, validates and deduplicates contacts in Google Sheets, routes qualified leads to CRM stages, and dispatches instant summary notifications.',
    toolsUsed: ['n8n', 'Webhooks', 'Google Sheets', 'REST APIs'],
    coverImage: projectAutomationImg,
    gallery: [projectAutomationImg],
    liveLink: 'https://www.fiverr.com/abdulmomin15',
    published: true,
    sortOrder: 1,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 2,
    title: 'Meta Ads Conversion Funnel for Regional E-Commerce',
    slug: 'meta-ads-conversion-funnel-ecommerce',
    category: 'Ads',
    description:
      'Structured a full-funnel Facebook and Instagram advertising architecture separating cold prospecting from warm retargeting audiences, paired with fresh static and carousel creative testing.',
    toolsUsed: ['Facebook Ads', 'Instagram Ads', 'Meta Pixel', 'Campaign Reporting'],
    coverImage: projectAdsImg,
    gallery: [projectAdsImg],
    liveLink: 'https://www.fiverr.com/abdulmomin15',
    published: true,
    sortOrder: 2,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 3,
    title: 'Minimalist Brand Identity & Ad Creative System',
    slug: 'minimalist-brand-identity-creative-system',
    category: 'Design',
    description:
      'Crafted a cohesive visual identity, print stationery layout, and modular social media ad template kit balancing high-contrast typography with clean grid geometry.',
    toolsUsed: ['Adobe Illustrator', 'Adobe Photoshop', 'Brand Grid Systems'],
    coverImage: projectDesignImg,
    gallery: [projectDesignImg],
    liveLink: 'https://www.fiverr.com/abdulmomin15',
    published: true,
    sortOrder: 3,
    createdAt: '',
    updatedAt: '',
  },
];

export default function PublicPortfolio() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const projectRailRef = useRef<HTMLDivElement>(null);

  const [content, setContent] = useState<SiteContent>(FALLBACK_CONTENT);
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'All' | ProjectCategory>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [portraitError, setPortraitError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([fetchPublicSiteContent(), fetchPublicProjects()])
      .then(([siteData, projectData]) => {
        if (!active) return;
        if (siteData && siteData.hero && siteData.about && siteData.contact && siteData.seo) {
          setContent(siteData);
        }
        if (Array.isArray(projectData)) {
          setProjects(projectData);
        }
      })
      .catch(() => {
        // Retain bundled fallback data on static hosts such as GitHub Pages
      })
      .finally(() => {
        if (active) setLoadingProjects(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Sync dynamic SEO title & meta description from database
  useEffect(() => {
    if (content?.seo?.title) {
      document.title = content.seo.title;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && content?.seo?.description) {
      metaDesc.setAttribute('content', content.seo.description);
    }
  }, [content?.seo]);

  // Lenis smooth scroll + GSAP ScrollTrigger choreography
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let lenis: Lenis | null = null;
    let tickerCallback: ((time: number) => void) | null = null;
    let ctx: gsap.Context | null = null;
    let safetyTimer = 0;

    try {
      lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      lenis.on('scroll', ScrollTrigger.update);
      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);

      ctx = gsap.context(() => {
        // Subtle split-line hero motion without trapping opacity at 0
        gsap.fromTo(
          '[data-hero-line]',
          { y: 18, opacity: 0.25 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.07,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          }
        );

        // Section slide-up reveals without risking invisible sections in iframes
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 18 },
            {
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              clearProps: 'transform',
              scrollTrigger: {
                trigger: el,
                start: 'top 95%',
                once: true,
              },
            }
          );
        });
      }, rootRef);

      safetyTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 250);
    } catch {
      // Fallback gracefully to native scrolling if animation init fails
    }

    return () => {
      window.clearTimeout(safetyTimer);
      ctx?.revert();
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Animated skill bars & counters once skills load from DB
  useEffect(() => {
    if (content.skills.length === 0) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let ctx: gsap.Context | null = null;
    try {
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-skill-bar]').forEach((bar) => {
          const level = Number(bar.dataset.level || 0) / 100;
          gsap.fromTo(
            bar,
            { scaleX: 0 },
            {
              scaleX: level,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: bar,
                start: 'top 95%',
                once: true,
              },
            }
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-skill-counter]').forEach((counter) => {
          const target = Number(counter.dataset.target || 0);
          const state = { val: 0 };
          gsap.to(state, {
            val: target,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: counter,
              start: 'top 95%',
              once: true,
            },
            onUpdate: () => {
              counter.textContent = `${Math.round(state.val)}%`;
            },
          });
        });

        ScrollTrigger.refresh();
      }, rootRef);
    } catch {
      // Retain default rendered skill bars
    }

    return () => ctx?.revert();
  }, [content.skills]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  // Subtle horizontal scroll scrub effect on desktop project rail
  useEffect(() => {
    const rail = projectRailRef.current;
    if (!rail || filteredProjects.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 1024) return;

    let ctx: gsap.Context | null = null;
    try {
      ctx = gsap.context(() => {
        gsap.fromTo(
          rail,
          { x: 24 },
          {
            x: -24,
            ease: 'none',
            scrollTrigger: {
              trigger: '#projects',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          }
        );
      }, rootRef);
    } catch {
      // Retain static horizontal rail
    }

    return () => ctx?.revert();
  }, [filteredProjects]);

  const scrollToSection = (id: string) => {
    if (id === 'top') {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const target = document.getElementById(id);
    if (!target) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -72 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollProjectsRail = (direction: 'prev' | 'next') => {
    const rail = projectRailRef.current;
    if (!rail) return;
    const distance = Math.max(320, rail.clientWidth * 0.65);
    rail.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth',
    });
  };

  const titleWords = content.hero.title.split(' ');
  const firstLine = titleWords.slice(0, 2).join(' ');
  const secondLine = titleWords.slice(2).join(' ');

  return (
    <div ref={rootRef} id="top" className="min-h-screen bg-[#121212] text-[#F4F2ED]">
      <CursorFollower />
      <Navbar onNavigate={scrollToSection} />

      <main>
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden bg-[#121212] pt-12 pb-16 sm:pt-16 lg:pt-20 lg:pb-24">
          <div className="mx-auto max-w-[1200px] px-6">
            <div className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="flex flex-col justify-between gap-8 py-2 lg:col-span-6">
                <div className="space-y-6">
                  <p
                    data-hero-line
                    className="font-mono text-xs font-medium tracking-[0.14em] text-[#E85D26]"
                  >
                    {content.hero.name}
                  </p>

                  <h1 className="font-display text-4xl font-bold leading-[1.04] tracking-tight text-[#F4F2ED] sm:text-5xl lg:text-[3.65rem] text-balance">
                    <span data-hero-line className="block">
                      {firstLine}
                    </span>
                    {secondLine && (
                      <span data-hero-line className="block text-[#F4F2ED]/85">
                        {secondLine}
                      </span>
                    )}
                  </h1>

                  <p
                    data-hero-line
                    className="max-w-xl text-base leading-relaxed text-[#F4F2ED]/75 sm:text-lg"
                  >
                    {content.hero.valueStatement}
                  </p>
                </div>

                <div data-hero-line className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => scrollToSection('projects')}
                    className="inline-flex min-h-[44px] items-center gap-2 bg-[#E85D26] px-6 py-3 text-sm font-semibold text-[#121212] transition-colors duration-150 hover:bg-[#F26E38] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>{content.hero.primaryCtaLabel}</span>
                    <ArrowRight className="h-4 w-4 stroke-[1.75]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('contact')}
                    className="inline-flex min-h-[44px] items-center gap-2 border border-[#F4F2ED]/25 bg-transparent px-6 py-3 text-sm font-semibold text-[#F4F2ED] transition-colors duration-150 hover:border-[#F4F2ED] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>{content.hero.secondaryCtaLabel}</span>
                  </button>
                </div>
              </div>

              <div className="h-[340px] sm:h-[420px] lg:col-span-6 lg:h-full lg:min-h-[460px]">
                <ErrorBoundary
                  fallback={
                    <div className="flex h-full w-full items-center justify-center border border-[#F4F2ED]/10 bg-[#141416] text-xs text-[#F4F2ED]/50">
                      Automation Workflow Architecture
                    </div>
                  }
                >
                  <Suspense
                    fallback={
                      <div className="flex h-full w-full items-center justify-center border border-[#F4F2ED]/10 bg-[#141416] text-xs text-[#F4F2ED]/50">
                        Loading interactive workflow scene...
                      </div>
                    }
                  >
                    <HeroWorkflow3D />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>

            {/* 4-Column Metric Strip below Hero Split */}
            {content.hero.metrics.length > 0 && (
              <div className="mt-14 grid grid-cols-2 gap-6 border-t border-[#F4F2ED]/10 pt-8 md:grid-cols-4">
                {content.hero.metrics.map((metric, idx) => (
                  <div key={`${metric.label}-${idx}`} className="space-y-1">
                    <div className="text-xs text-[#F4F2ED]/50">{metric.label}</div>
                    <div className="font-display text-lg font-semibold tracking-tight text-[#F4F2ED] tabular-nums sm:text-xl">
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 2. ABOUT SECTION (Off-White Editorial Contrast) */}
        <section id="about" className="bg-[#F4F2ED] py-24 text-[#121212]">
          <div className="mx-auto max-w-[1200px] px-6">
            <div data-reveal className="grid items-stretch gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <div className="relative aspect-[3/4] w-full overflow-hidden border border-[#121212]/15 bg-[#18181B] lg:h-full">
                  {content.about.profileImage && !portraitError ? (
                    <img
                      src={content.about.profileImage}
                      alt="Portrait of MD Abdul Momin Sarker"
                      referrerPolicy="no-referrer"
                      onError={() => setPortraitError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[#F4F2ED]/60">
                      <User className="h-10 w-10 stroke-[1.25] text-[#E85D26]" />
                      <span className="text-xs font-medium">MD Abdul Momin Sarker</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-8 lg:col-span-7">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#E85D26]">
                    <span>About</span>
                    <span aria-hidden="true" className="text-[#121212]/30">
                      /
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#121212]/70">
                      <MapPin className="h-3.5 w-3.5 stroke-[1.75] text-[#E85D26]" />
                      {content.about.location}
                    </span>
                  </div>

                  <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-[#121212] sm:text-4xl text-balance">
                    {content.about.headline}
                  </h2>

                  <p className="max-w-2xl text-base leading-relaxed text-[#121212]/80 sm:text-lg">
                    {content.about.summary}
                  </p>

                  {content.about.extendedBio && (
                    <p className="max-w-2xl text-base leading-relaxed text-[#121212]/70">
                      {content.about.extendedBio}
                    </p>
                  )}
                </div>

                <div className="grid gap-6 border-t border-[#121212]/15 pt-8 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium text-[#121212]/55">Experience</div>
                    <div className="mt-1 font-display text-lg font-bold text-[#121212]">
                      {content.about.experienceYears}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#121212]/55">Focus Areas</div>
                    <div className="mt-1 font-display text-lg font-bold text-[#121212]">
                      n8n Automation · Meta Ads · Graphic Design
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SKILLS SECTION */}
        <section id="skills" className="border-t border-[#F4F2ED]/10 bg-[#121212] py-24 text-[#F4F2ED]">
          <div className="mx-auto max-w-[1200px] px-6">
            <div data-reveal className="mb-14 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="space-y-3">
                <p className="text-sm font-medium text-[#E85D26]">Capabilities &amp; Skills</p>
                <h2 className="font-display text-3xl font-bold tracking-tight text-[#F4F2ED] sm:text-4xl text-balance">
                  Technical automation meets performance marketing and craft.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-[#F4F2ED]/65">
                A balanced skill set built across workflow orchestration, paid social execution, and certified design fundamentals.
              </p>
            </div>

            <div data-reveal className="grid gap-6 md:grid-cols-2">
              {content.skills.map((skill, idx) => (
                <div
                  key={skill.id}
                  className="border border-[#F4F2ED]/10 bg-[#161618] p-6"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-[#F4F2ED]/50">
                        {String(idx + 1).padStart(2, '0')} <span aria-hidden="true">·</span> {skill.category}
                      </div>
                      <h3 className="font-display text-xl font-bold text-[#F4F2ED]">
                        {skill.name}
                      </h3>
                    </div>

                    <span
                      data-skill-counter
                      data-target={skill.level}
                      className="font-mono text-lg font-medium text-[#E85D26] tabular-nums"
                    >
                      {skill.level}%
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-[#F4F2ED]/70">{skill.detail}</p>

                  <div className="mt-5 h-1.5 w-full overflow-hidden bg-[#F4F2ED]/10">
                    <div
                      data-skill-bar
                      data-level={skill.level}
                      className="h-full origin-left bg-[#E85D26]"
                      style={{ transform: `scaleX(${skill.level / 100})` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. SERVICES SECTION */}
        <section id="services" className="border-t border-[#F4F2ED]/10 bg-[#161618] py-24 text-[#F4F2ED]">
          <div className="mx-auto max-w-[1200px] px-6">
            <div data-reveal className="mb-14 space-y-3">
              <p className="text-sm font-medium text-[#E85D26]">Services</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#F4F2ED] sm:text-4xl text-balance">
                Structured systems designed to reduce friction and grow reach.
              </h2>
            </div>

            <div data-reveal className="grid gap-6 md:grid-cols-2">
              {content.services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col justify-between gap-6 border border-[#F4F2ED]/10 bg-[#121212] p-7 transition-colors duration-200 hover:border-[#E85D26]/50"
                >
                  <div className="space-y-4">
                    <div className="font-mono text-sm font-medium text-[#E85D26] tabular-nums">
                      {service.number}
                    </div>
                    <h3 className="font-display text-2xl font-bold tracking-tight text-[#F4F2ED]">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#F4F2ED]/75 sm:text-base">
                      {service.description}
                    </p>
                  </div>

                  {service.deliverables.length > 0 && (
                    <div className="border-t border-[#F4F2ED]/10 pt-4 text-xs text-[#F4F2ED]/60">
                      {service.deliverables.join(' · ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. PROJECTS SHOWCASE (Off-White Surface + Category Filter + Horizontal Scroll) */}
        <section id="projects" className="bg-[#F4F2ED] py-24 text-[#121212]">
          <div className="mx-auto max-w-[1200px] px-6">
            <div
              data-reveal
              className="mb-10 flex flex-col justify-between gap-6 border-b border-[#121212]/15 pb-8 lg:flex-row lg:items-end"
            >
              <div className="space-y-3">
                <p className="text-sm font-medium text-[#E85D26]">Selected Work</p>
                <h2 className="font-display text-3xl font-bold tracking-tight text-[#121212] sm:text-4xl text-balance">
                  Automation builds, ad systems, and visual design projects.
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div
                  role="tablist"
                  aria-label="Filter projects by category"
                  className="inline-flex items-center gap-1 border border-[#121212]/15 bg-[#EAE7DF] p-1"
                >
                  {CATEGORIES.map((category) => {
                    const active = activeCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveCategory(category)}
                        className={`px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-[#121212] text-[#F4F2ED]'
                            : 'text-[#121212]/70 hover:text-[#121212]'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

                {filteredProjects.length > 1 && (
                  <div className="hidden items-center gap-1.5 sm:flex">
                    <button
                      type="button"
                      onClick={() => scrollProjectsRail('prev')}
                      aria-label="Scroll projects left"
                      className="inline-flex h-10 w-10 items-center justify-center border border-[#121212]/20 text-[#121212] transition-colors hover:border-[#121212] cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4 stroke-[1.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollProjectsRail('next')}
                      aria-label="Scroll projects right"
                      className="inline-flex h-10 w-10 items-center justify-center border border-[#121212]/20 text-[#121212] transition-colors hover:border-[#121212] cursor-pointer"
                    >
                      <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {loadingProjects ? (
              <div className="grid gap-6 md:grid-cols-3">
                {[0, 1, 2].map((skeleton) => (
                  <div
                    key={skeleton}
                    className="h-96 animate-pulse border border-[#121212]/10 bg-[#EAE7DF]"
                  />
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="border border-[#121212]/15 bg-[#EAE7DF] px-8 py-16 text-center">
                <p className="font-display text-2xl font-bold text-[#121212]">
                  Projects coming soon
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-[#121212]/70">
                  {activeCategory === 'All'
                    ? 'New case studies are currently being documented. Reach out directly to discuss recent automation or marketing work.'
                    : `No published projects in the ${activeCategory} category yet.`}
                </p>
              </div>
            ) : (
              <div
                ref={projectRailRef}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 lg:overflow-x-auto"
              >
                {filteredProjects.map((project, idx) => (
                  <div
                    key={project.id}
                    className="w-[86vw] shrink-0 snap-start sm:w-[420px] lg:w-[376px]"
                  >
                    <ProjectCard
                      project={project}
                      index={idx}
                      onSelect={setSelectedProject}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 6, 7, 8. EXPERIENCE, EDUCATION, CERTIFICATIONS & LANGUAGES */}
        <section
          id="credentials"
          className="border-t border-[#F4F2ED]/10 bg-[#121212] py-24 text-[#F4F2ED]"
        >
          <div className="mx-auto max-w-[1200px] px-6">
            <div data-reveal className="mb-14 space-y-3">
              <p className="text-sm font-medium text-[#E85D26]">Background &amp; Credentials</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#F4F2ED] sm:text-4xl text-balance">
                Experience, education, certifications, and languages.
              </h2>
            </div>

            <div data-reveal className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Left Column: Experience & Education */}
              <div className="space-y-12 lg:col-span-7">
                <div className="space-y-6">
                  <h3 className="border-b border-[#F4F2ED]/10 pb-3 text-sm font-semibold tracking-wide text-[#F4F2ED]/60">
                    Experience
                  </h3>
                  <div className="space-y-6">
                    {content.experience.map((exp) => (
                      <div key={exp.id} className="space-y-2">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h4 className="font-display text-xl font-bold text-[#F4F2ED]">
                            {exp.role}
                          </h4>
                          <span className="font-mono text-xs text-[#E85D26] tabular-nums">
                            {exp.period}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-[#F4F2ED]/65">
                          {exp.organization} <span aria-hidden="true">·</span> {exp.location}
                        </div>
                        <p className="text-sm leading-relaxed text-[#F4F2ED]/75">
                          {exp.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="border-b border-[#F4F2ED]/10 pb-3 text-sm font-semibold tracking-wide text-[#F4F2ED]/60">
                    Education
                  </h3>
                  <div className="space-y-5">
                    {content.education.map((edu) => (
                      <div key={edu.id} className="space-y-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h4 className="font-display text-xl font-bold text-[#F4F2ED]">
                            {edu.degree}
                          </h4>
                          <span className="font-mono text-xs text-[#F4F2ED]/60">
                            {edu.status}
                          </span>
                        </div>
                        <div className="text-sm text-[#F4F2ED]/75">
                          {edu.institution} <span aria-hidden="true">·</span> {edu.location}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Certifications & Languages */}
              <div className="space-y-12 lg:col-span-5">
                <div className="space-y-5">
                  <h3 className="border-b border-[#F4F2ED]/10 pb-3 text-sm font-semibold tracking-wide text-[#F4F2ED]/60">
                    Certifications
                  </h3>
                  <ul className="divide-y divide-[#F4F2ED]/10">
                    {content.certifications.map((cert) => (
                      <li key={cert.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-display text-base font-semibold text-[#F4F2ED]">
                            {cert.title}
                          </span>
                          <span className="font-mono text-xs text-[#E85D26] shrink-0">
                            {cert.level}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-[#F4F2ED]/55">{cert.issuer}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-5">
                  <h3 className="border-b border-[#F4F2ED]/10 pb-3 text-sm font-semibold tracking-wide text-[#F4F2ED]/60">
                    Languages
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {content.languages.map((lang) => (
                      <div
                        key={lang.id}
                        className="border border-[#F4F2ED]/10 bg-[#161618] p-4"
                      >
                        <div className="font-display text-lg font-bold text-[#F4F2ED]">
                          {lang.name}
                        </div>
                        <div className="mt-1 text-xs text-[#F4F2ED]/65">{lang.proficiency}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. CONTACT SECTION */}
        <ContactSection contact={content.contact} />
      </main>

      {/* 10. MINIMAL FOOTER (NO /admin link, NO telemetry) */}
      <footer className="border-t border-[#F4F2ED]/10 bg-[#121212] py-8 text-xs text-[#F4F2ED]/55">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 px-6 sm:flex-row sm:items-center">
          <div>
            &copy; {new Date().getFullYear()} {content.hero.name}. {content.contact.location}.
          </div>
          <div className="flex items-center gap-6">
            {content.contact.fiverrUrl && (
              <a
                href={content.contact.fiverrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#F4F2ED]/75 transition-colors hover:text-[#E85D26]"
              >
                <span>Fiverr</span>
                <ArrowUpRight className="h-3.5 w-3.5 stroke-[1.5]" />
              </a>
            )}
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('top');
              }}
              className="text-[#F4F2ED]/75 transition-colors hover:text-[#F4F2ED]"
            >
              Back to top
            </a>
          </div>
        </div>
      </footer>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
