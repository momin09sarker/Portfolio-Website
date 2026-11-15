import type { ContactMessage, Project, SiteContent } from '../types/portfolio';

let cachedCsrfToken: string | null = null;

export async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (cachedCsrfToken && !forceRefresh) {
    return cachedCsrfToken;
  }
  const res = await fetch('/api/csrf', { credentials: 'same-origin' });
  if (!res.ok) {
    throw new Error('Failed to initialize security token.');
  }
  const data = (await res.json()) as { csrfToken: string };
  cachedCsrfToken = data.csrfToken;
  return cachedCsrfToken;
}

export function setCsrfToken(token?: string): void {
  if (token) {
    cachedCsrfToken = token;
  }
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers);

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = await getCsrfToken();
    headers.set('x-csrf-token', token);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  if (res.status === 403 && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const refreshed = await getCsrfToken(true);
    headers.set('x-csrf-token', refreshed);
    res = await fetch(url, {
      ...options,
      headers,
      credentials: 'same-origin',
    });
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new Error(payload?.error || `Request failed (${res.status})`);
  }

  if (!isJson || payload === null) {
    throw new Error('Expected JSON response from API.');
  }

  if (payload?.csrfToken) {
    cachedCsrfToken = payload.csrfToken;
  }

  return payload as T;
}

export async function fetchPublicSiteContent(): Promise<SiteContent> {
  return apiFetch<SiteContent>('/api/public/site');
}

export async function fetchPublicProjects(category?: string): Promise<Project[]> {
  const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
  const data = await apiFetch<{ projects: Project[] }>(`/api/public/projects${query}`);
  return data.projects;
}

export async function submitContactMessage(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
  formRenderedAt: number;
}): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// --- Admin API Helpers (loaded dynamically only by /admin route) ---

export async function fetchAdminSession(): Promise<{
  authenticated: boolean;
  user: { id?: number; username: string };
}> {
  return apiFetch('/api/auth/me');
}

export async function adminLogin(credentials: {
  username: string;
  password: string;
}): Promise<{ ok: boolean; user: { username: string } }> {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function adminLogout(): Promise<void> {
  await apiFetch('/api/auth/logout', { method: 'POST' });
}

export async function adminChangePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean }> {
  return apiFetch('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminContent(): Promise<SiteContent> {
  return apiFetch('/api/admin/content');
}

export async function updateAdminContent(content: SiteContent): Promise<SiteContent> {
  return apiFetch('/api/admin/content', {
    method: 'PUT',
    body: JSON.stringify(content),
  });
}

export async function fetchAdminProjects(): Promise<Project[]> {
  const data = await apiFetch<{ projects: Project[] }>('/api/admin/projects');
  return data.projects;
}

export async function createAdminProject(project: {
  title: string;
  category: 'Automation' | 'Ads' | 'Design';
  description: string;
  toolsUsed: string[];
  coverImage: string;
  gallery: string[];
  liveLink: string;
  published: boolean;
}): Promise<Project> {
  const data = await apiFetch<{ project: Project }>('/api/admin/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  });
  return data.project;
}

export async function updateAdminProject(
  id: number,
  project: {
    title: string;
    category: 'Automation' | 'Ads' | 'Design';
    description: string;
    toolsUsed: string[];
    coverImage: string;
    gallery: string[];
    liveLink: string;
    published: boolean;
    sortOrder?: number;
  }
): Promise<Project> {
  const data = await apiFetch<{ project: Project }>(`/api/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(project),
  });
  return data.project;
}

export async function deleteAdminProject(id: number): Promise<void> {
  await apiFetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
}

export async function reorderAdminProjects(orderedIds: number[]): Promise<Project[]> {
  const data = await apiFetch<{ projects: Project[] }>('/api/admin/projects/reorder', {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  });
  return data.projects;
}

export async function fetchAdminMessages(params?: {
  search?: string;
  filter?: 'all' | 'unread' | 'read';
}): Promise<ContactMessage[]> {
  const q = new URLSearchParams();
  if (params?.search) q.set('search', params.search);
  if (params?.filter) q.set('filter', params.filter);
  const qs = q.toString() ? `?${q.toString()}` : '';
  const data = await apiFetch<{ messages: ContactMessage[] }>(`/api/admin/messages${qs}`);
  return data.messages;
}

export async function toggleMessageRead(id: number, isRead: boolean): Promise<void> {
  await apiFetch(`/api/admin/messages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isRead }),
  });
}

export async function deleteAdminMessage(id: number): Promise<void> {
  await apiFetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
}

export async function uploadAdminImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const data = await apiFetch<{ url: string }>('/api/admin/upload', {
    method: 'POST',
    body: formData,
  });
  return data.url;
}
