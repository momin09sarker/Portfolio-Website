export interface HeroMetric {
  label: string;
  value: string;
}

export interface HeroContent {
  name: string;
  title: string;
  valueStatement: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  metrics: HeroMetric[];
}

export interface AboutContent {
  headline: string;
  summary: string;
  extendedBio: string;
  location: string;
  experienceYears: string;
  profileImage: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  detail: string;
  level: number;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  deliverables: string[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  period: string;
  location: string;
  summary: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  status: string;
  location: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  level: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  proficiency: string;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  label: string;
  url: string;
}

export interface ContactContent {
  email: string;
  phone: string;
  location: string;
  fiverrUrl: string;
  fiverrLabel: string;
  availability: string;
  socialLinks: SocialLinkItem[];
}

export interface SeoContent {
  title: string;
  description: string;
}

export interface SiteContent {
  hero: HeroContent;
  about: AboutContent;
  skills: SkillItem[];
  services: ServiceItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  contact: ContactContent;
  seo: SeoContent;
}

export type ProjectCategory = 'Automation' | 'Ads' | 'Design';

export interface Project {
  id: number;
  title: string;
  slug: string;
  category: ProjectCategory;
  description: string;
  toolsUsed: string[];
  coverImage: string;
  gallery: string[];
  liveLink: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
