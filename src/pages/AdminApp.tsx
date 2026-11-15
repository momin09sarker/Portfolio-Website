import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ExternalLink,
  FileText,
  FolderKanban,
  Inbox,
  Lock,
  LogOut,
  Shield,
} from 'lucide-react';
import { AccountTab } from '../components/admin/AccountTab';
import { ContentEditorTab } from '../components/admin/ContentEditorTab';
import { MessagesInboxTab } from '../components/admin/MessagesInboxTab';
import { ProjectsManagerTab } from '../components/admin/ProjectsManagerTab';
import {
  adminLogin,
  adminLogout,
  fetchAdminContent,
  fetchAdminProjects,
  fetchAdminSession,
} from '../lib/api';
import type { Project, SiteContent } from '../types/portfolio';

type AdminTab = 'content' | 'projects' | 'messages' | 'account';

export default function AdminApp() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [sessionUser, setSessionUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const loadDashboardData = async () => {
    const [contentData, projectData] = await Promise.all([
      fetchAdminContent(),
      fetchAdminProjects(),
    ]);
    setSiteContent(contentData);
    setProjects(projectData);
  };

  useEffect(() => {
    document.title = 'Portfolio Console';
    fetchAdminSession()
      .then(async (res) => {
        setSessionUser(res.user.username);
        await loadDashboardData();
      })
      .catch(() => {
        setSessionUser(null);
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await adminLogin({ username, password });
      setSessionUser(res.user.username);
      setPassword('');
      await loadDashboardData();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setSessionUser(null);
    setSiteContent(null);
    setProjects([]);
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] text-sm text-[#F4F2ED]/60">
        Verifying session...
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] px-6 text-[#F4F2ED]">
        <div className="w-full max-w-md border border-[#F4F2ED]/15 bg-[#161618] p-8">
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[#E85D26]">
              <Lock className="h-3.5 w-3.5" />
              <span>Private Console</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#F4F2ED]">
              Administrator Sign In
            </h1>
            <p className="text-sm text-[#F4F2ED]/60">
              Enter your credentials to manage portfolio content, projects, and inquiries.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-medium text-[#F4F2ED]/75"
              >
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2.5 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium text-[#F4F2ED]/75"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2.5 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
              />
            </div>

            {loginError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-[#E85D26] px-5 py-3 text-sm font-semibold text-[#121212] transition-colors hover:bg-[#F26E38] disabled:opacity-60 cursor-pointer"
            >
              {loggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#F4F2ED]">
      <header className="border-b border-[#F4F2ED]/10 bg-[#161618]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-lg font-bold text-[#F4F2ED]">
              Portfolio Console
            </span>

            <nav aria-label="Admin sections" className="flex flex-wrap items-center gap-1">
              {[
                { id: 'content', label: 'Site Content', icon: FileText },
                { id: 'projects', label: 'Projects', icon: FolderKanban },
                { id: 'messages', label: 'Messages', icon: Inbox },
                { id: 'account', label: 'Account', icon: Shield },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as AdminTab)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#E85D26] text-[#121212]'
                        : 'text-[#F4F2ED]/70 hover:text-[#F4F2ED]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 stroke-[1.75]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border border-[#F4F2ED]/15 px-3 py-1.5 text-xs text-[#F4F2ED]/80 hover:border-[#F4F2ED]/40"
            >
              <span>Public Site</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 border border-[#F4F2ED]/15 px-3 py-1.5 text-xs text-[#F4F2ED]/80 hover:border-[#E85D26] cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-10">
        {activeTab === 'content' && siteContent && (
          <ContentEditorTab
            initialContent={siteContent}
            onSaved={(updated) => setSiteContent(updated)}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsManagerTab
            projects={projects}
            onProjectsChange={setProjects}
          />
        )}

        {activeTab === 'messages' && <MessagesInboxTab />}

        {activeTab === 'account' && (
          <AccountTab username={sessionUser} onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
}
