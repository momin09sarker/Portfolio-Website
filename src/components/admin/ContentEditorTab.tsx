import { useState, type ChangeEvent, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Plus, Save, Trash2, Upload } from 'lucide-react';
import { updateAdminContent, uploadAdminImage } from '../../lib/api';
import type { SiteContent } from '../../types/portfolio';

interface ContentEditorTabProps {
  initialContent: SiteContent;
  onSaved: (updated: SiteContent) => void;
}

export function ContentEditorTab({ initialContent, onSaved }: ContentEditorTabProps) {
  const [form, setForm] = useState<SiteContent>(() => structuredClone(initialContent));
  const [saving, setSaving] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handlePortraitUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPortrait(true);
    setStatusMsg(null);
    try {
      const url = await uploadAdminImage(file);
      setForm((prev) => ({
        ...prev,
        about: { ...prev.about, profileImage: url },
      }));
      setStatusMsg({ type: 'success', text: 'Profile image uploaded. Save changes to publish.' });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Image upload failed.',
      });
    } finally {
      setUploadingPortrait(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      const updated = await updateAdminContent(form);
      setForm(structuredClone(updated));
      onSaved(updated);
      setStatusMsg({ type: 'success', text: 'Site content saved and published.' });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save site content.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F4F2ED]/10 pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#F4F2ED]">Site Content</h2>
          <p className="mt-1 text-sm text-[#F4F2ED]/60">
            Update public portfolio copy, profile imagery, credentials, and SEO metadata.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#E85D26] px-5 py-2.5 text-sm font-semibold text-[#121212] transition-colors hover:bg-[#F26E38] disabled:opacity-60 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Save className="h-4 w-4 stroke-[1.75]" />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {statusMsg && (
        <div
          role={statusMsg.type === 'error' ? 'alert' : 'status'}
          className={`flex items-start gap-2.5 border px-4 py-3 text-sm ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
              : 'border-red-500/40 bg-red-950/30 text-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* SEO Settings */}
      <section className="space-y-4 border border-[#F4F2ED]/10 bg-[#161618] p-6">
        <h3 className="font-display text-lg font-bold text-[#F4F2ED]">SEO &amp; Metadata</h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-xs font-medium text-[#F4F2ED]/70">SEO Title</label>
            <input
              type="text"
              required
              maxLength={120}
              value={form.seo.title}
              onChange={(e) =>
                setForm({ ...form, seo: { ...form.seo, title: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#F4F2ED]/70">
              SEO Meta Description
            </label>
            <textarea
              rows={2}
              required
              maxLength={260}
              value={form.seo.description}
              onChange={(e) =>
                setForm({ ...form, seo: { ...form.seo, description: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="space-y-4 border border-[#F4F2ED]/10 bg-[#161618] p-6">
        <h3 className="font-display text-lg font-bold text-[#F4F2ED]">Hero Section</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-[#F4F2ED]/70">Display Name</label>
            <input
              type="text"
              required
              value={form.hero.name}
              onChange={(e) =>
                setForm({ ...form, hero: { ...form.hero, name: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#F4F2ED]/70">Headline Title</label>
            <input
              type="text"
              required
              value={form.hero.title}
              onChange={(e) =>
                setForm({ ...form, hero: { ...form.hero, title: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#F4F2ED]/70">
              One-Line Value Statement
            </label>
            <input
              type="text"
              required
              value={form.hero.valueStatement}
              onChange={(e) =>
                setForm({ ...form, hero: { ...form.hero, valueStatement: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#F4F2ED]/70">
              Primary Button Label
            </label>
            <input
              type="text"
              required
              value={form.hero.primaryCtaLabel}
              onChange={(e) =>
                setForm({ ...form, hero: { ...form.hero, primaryCtaLabel: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#F4F2ED]/70">
              Secondary Button Label
            </label>
            <input
              type="text"
              required
              value={form.hero.secondaryCtaLabel}
              onChange={(e) =>
                setForm({ ...form, hero: { ...form.hero, secondaryCtaLabel: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* About & Profile Image */}
      <section className="space-y-4 border border-[#F4F2ED]/10 bg-[#161618] p-6">
        <h3 className="font-display text-lg font-bold text-[#F4F2ED]">
          About &amp; Profile Image
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#F4F2ED]/70">About Headline</label>
            <input
              type="text"
              required
              value={form.about.headline}
              onChange={(e) =>
                setForm({ ...form, about: { ...form.about, headline: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#F4F2ED]/70">
              Professional Summary
            </label>
            <textarea
              rows={3}
              required
              value={form.about.summary}
              onChange={(e) =>
                setForm({ ...form, about: { ...form.about, summary: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#F4F2ED]/70">
              Extended Bio
            </label>
            <textarea
              rows={2}
              value={form.about.extendedBio}
              onChange={(e) =>
                setForm({ ...form, about: { ...form.about, extendedBio: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#F4F2ED]/70">Location</label>
            <input
              type="text"
              required
              value={form.about.location}
              onChange={(e) =>
                setForm({ ...form, about: { ...form.about, location: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#F4F2ED]/70">
              Experience Highlight
            </label>
            <input
              type="text"
              required
              value={form.about.experienceYears}
              onChange={(e) =>
                setForm({ ...form, about: { ...form.about, experienceYears: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#F4F2ED]/70">
              Profile Image URL or Upload
            </label>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={form.about.profileImage}
                onChange={(e) =>
                  setForm({ ...form, about: { ...form.about, profileImage: e.target.value } })
                }
                className="min-w-[240px] flex-1 border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED] focus:border-[#E85D26] focus:outline-none"
              />
              <label className="inline-flex items-center gap-2 border border-[#F4F2ED]/20 bg-[#121212] px-4 py-2 text-xs font-semibold text-[#F4F2ED] hover:border-[#E85D26] cursor-pointer">
                <Upload className="h-3.5 w-3.5 stroke-[1.75]" />
                <span>{uploadingPortrait ? 'Uploading...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePortraitUpload}
                  disabled={uploadingPortrait}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-4 border border-[#F4F2ED]/10 bg-[#161618] p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-lg font-bold text-[#F4F2ED]">Skills</h3>
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                skills: [
                  ...form.skills,
                  {
                    id: `skill-${Date.now()}`,
                    name: 'New Skill',
                    category: 'General',
                    detail: '',
                    level: 80,
                  },
                ],
              })
            }
            className="inline-flex items-center gap-1.5 border border-[#F4F2ED]/20 px-3 py-1.5 text-xs font-semibold text-[#F4F2ED] hover:border-[#E85D26] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Skill</span>
          </button>
        </div>

        <div className="space-y-4">
          {form.skills.map((skill, idx) => (
            <div
              key={skill.id}
              className="grid gap-3 border border-[#F4F2ED]/10 bg-[#121212] p-4 sm:grid-cols-12"
            >
              <div className="sm:col-span-3">
                <label className="block text-[11px] text-[#F4F2ED]/50">Skill Name</label>
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => {
                    const next = [...form.skills];
                    next[idx] = { ...skill, name: e.target.value };
                    setForm({ ...form, skills: next });
                  }}
                  className="mt-1 w-full border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-[#F4F2ED]/50">Category</label>
                <input
                  type="text"
                  value={skill.category}
                  onChange={(e) => {
                    const next = [...form.skills];
                    next[idx] = { ...skill, category: e.target.value };
                    setForm({ ...form, skills: next });
                  }}
                  className="mt-1 w-full border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[11px] text-[#F4F2ED]/50">Details</label>
                <input
                  type="text"
                  value={skill.detail}
                  onChange={(e) => {
                    const next = [...form.skills];
                    next[idx] = { ...skill, detail: e.target.value };
                    setForm({ ...form, skills: next });
                  }}
                  className="mt-1 w-full border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-[#F4F2ED]/50">Level %</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={skill.level}
                  onChange={(e) => {
                    const next = [...form.skills];
                    next[idx] = {
                      ...skill,
                      level: Math.min(100, Math.max(1, Number(e.target.value) || 50)),
                    };
                    setForm({ ...form, skills: next });
                  }}
                  className="mt-1 w-full border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 font-mono text-sm text-[#F4F2ED]"
                />
              </div>
              <div className="flex items-end justify-end sm:col-span-1">
                <button
                  type="button"
                  aria-label={`Remove ${skill.name}`}
                  onClick={() =>
                    setForm({
                      ...form,
                      skills: form.skills.filter((_, i) => i !== idx),
                    })
                  }
                  className="inline-flex h-9 w-9 items-center justify-center border border-[#F4F2ED]/15 text-[#F4F2ED]/60 hover:border-red-500/50 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="space-y-4 border border-[#F4F2ED]/10 bg-[#161618] p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-lg font-bold text-[#F4F2ED]">Services</h3>
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                services: [
                  ...form.services,
                  {
                    id: `srv-${Date.now()}`,
                    number: `${String(form.services.length + 1).padStart(2, '0')}.`,
                    title: 'New Service',
                    description: '',
                    deliverables: [],
                  },
                ],
              })
            }
            className="inline-flex items-center gap-1.5 border border-[#F4F2ED]/20 px-3 py-1.5 text-xs font-semibold text-[#F4F2ED] hover:border-[#E85D26] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Service</span>
          </button>
        </div>

        <div className="space-y-4">
          {form.services.map((srv, idx) => (
            <div
              key={srv.id}
              className="space-y-3 border border-[#F4F2ED]/10 bg-[#121212] p-4"
            >
              <div className="grid gap-3 sm:grid-cols-12">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-[#F4F2ED]/50">Index</label>
                  <input
                    type="text"
                    value={srv.number}
                    onChange={(e) => {
                      const next = [...form.services];
                      next[idx] = { ...srv, number: e.target.value };
                      setForm({ ...form, services: next });
                    }}
                    className="mt-1 w-full border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 font-mono text-sm text-[#F4F2ED]"
                  />
                </div>
                <div className="sm:col-span-9">
                  <label className="block text-[11px] text-[#F4F2ED]/50">Service Title</label>
                  <input
                    type="text"
                    value={srv.title}
                    onChange={(e) => {
                      const next = [...form.services];
                      next[idx] = { ...srv, title: e.target.value };
                      setForm({ ...form, services: next });
                    }}
                    className="mt-1 w-full border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
                  />
                </div>
                <div className="flex items-end justify-end sm:col-span-1">
                  <button
                    type="button"
                    aria-label={`Remove ${srv.title}`}
                    onClick={() =>
                      setForm({
                        ...form,
                        services: form.services.filter((_, i) => i !== idx),
                      })
                    }
                    className="inline-flex h-9 w-9 items-center justify-center border border-[#F4F2ED]/15 text-[#F4F2ED]/60 hover:border-red-500/50 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-[#F4F2ED]/50">Description</label>
                <textarea
                  rows={2}
                  value={srv.description}
                  onChange={(e) => {
                    const next = [...form.services];
                    next[idx] = { ...srv, description: e.target.value };
                    setForm({ ...form, services: next });
                  }}
                  className="mt-1 w-full border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#F4F2ED]/50">
                  Deliverables (comma-separated)
                </label>
                <input
                  type="text"
                  value={srv.deliverables.join(', ')}
                  onChange={(e) => {
                    const next = [...form.services];
                    next[idx] = {
                      ...srv,
                      deliverables: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    };
                    setForm({ ...form, services: next });
                  }}
                  className="mt-1 w-full border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience & Education */}
      <section className="space-y-6 border border-[#F4F2ED]/10 bg-[#161618] p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-lg font-bold text-[#F4F2ED]">Experience</h3>
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                experience: [
                  ...form.experience,
                  {
                    id: `exp-${Date.now()}`,
                    role: 'Role Title',
                    organization: '',
                    period: '',
                    location: '',
                    summary: '',
                  },
                ],
              })
            }
            className="inline-flex items-center gap-1.5 border border-[#F4F2ED]/20 px-3 py-1.5 text-xs font-semibold text-[#F4F2ED] hover:border-[#E85D26] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Experience</span>
          </button>
        </div>

        <div className="space-y-4">
          {form.experience.map((exp, idx) => (
            <div key={exp.id} className="space-y-3 border border-[#F4F2ED]/10 bg-[#121212] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Role"
                  value={exp.role}
                  onChange={(e) => {
                    const next = [...form.experience];
                    next[idx] = { ...exp, role: e.target.value };
                    setForm({ ...form, experience: next });
                  }}
                  className="border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
                />
                <input
                  type="text"
                  placeholder="Period"
                  value={exp.period}
                  onChange={(e) => {
                    const next = [...form.experience];
                    next[idx] = { ...exp, period: e.target.value };
                    setForm({ ...form, experience: next });
                  }}
                  className="border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
                />
                <input
                  type="text"
                  placeholder="Organization"
                  value={exp.organization}
                  onChange={(e) => {
                    const next = [...form.experience];
                    next[idx] = { ...exp, organization: e.target.value };
                    setForm({ ...form, experience: next });
                  }}
                  className="border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={exp.location}
                  onChange={(e) => {
                    const next = [...form.experience];
                    next[idx] = { ...exp, location: e.target.value };
                    setForm({ ...form, experience: next });
                  }}
                  className="border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Summary"
                value={exp.summary}
                onChange={(e) => {
                  const next = [...form.experience];
                  next[idx] = { ...exp, summary: e.target.value };
                  setForm({ ...form, experience: next });
                }}
                className="w-full border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      experience: form.experience.filter((_, i) => i !== idx),
                    })
                  }
                  className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove entry
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[#F4F2ED]/10 pt-4">
          <h3 className="font-display text-lg font-bold text-[#F4F2ED]">Education</h3>
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                education: [
                  ...form.education,
                  {
                    id: `edu-${Date.now()}`,
                    degree: 'Degree',
                    institution: '',
                    status: '',
                    location: '',
                  },
                ],
              })
            }
            className="inline-flex items-center gap-1.5 border border-[#F4F2ED]/20 px-3 py-1.5 text-xs font-semibold text-[#F4F2ED] hover:border-[#E85D26] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Education</span>
          </button>
        </div>

        <div className="space-y-4">
          {form.education.map((edu, idx) => (
            <div key={edu.id} className="grid gap-3 border border-[#F4F2ED]/10 bg-[#121212] p-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => {
                  const next = [...form.education];
                  next[idx] = { ...edu, degree: e.target.value };
                  setForm({ ...form, education: next });
                }}
                className="border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
              />
              <input
                type="text"
                placeholder="Status"
                value={edu.status}
                onChange={(e) => {
                  const next = [...form.education];
                  next[idx] = { ...edu, status: e.target.value };
                  setForm({ ...form, education: next });
                }}
                className="border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
              />
              <input
                type="text"
                placeholder="Institution"
                value={edu.institution}
                onChange={(e) => {
                  const next = [...form.education];
                  next[idx] = { ...edu, institution: e.target.value };
                  setForm({ ...form, education: next });
                }}
                className="border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
              />
              <input
                type="text"
                placeholder="Location"
                value={edu.location}
                onChange={(e) => {
                  const next = [...form.education];
                  next[idx] = { ...edu, location: e.target.value };
                  setForm({ ...form, education: next });
                }}
                className="border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED]"
              />
              <div className="flex justify-end sm:col-span-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      education: form.education.filter((_, i) => i !== idx),
                    })
                  }
                  className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Remove entry
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications & Languages */}
      <section className="space-y-6 border border-[#F4F2ED]/10 bg-[#161618] p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-lg font-bold text-[#F4F2ED]">Certifications</h3>
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                certifications: [
                  ...form.certifications,
                  { id: `cert-${Date.now()}`, title: 'New Certificate', issuer: '', level: 'Certified' },
                ],
              })
            }
            className="inline-flex items-center gap-1.5 border border-[#F4F2ED]/20 px-3 py-1.5 text-xs font-semibold text-[#F4F2ED] hover:border-[#E85D26] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Certification</span>
          </button>
        </div>
        <div className="space-y-3">
          {form.certifications.map((cert, idx) => (
            <div key={cert.id} className="grid gap-3 border border-[#F4F2ED]/10 bg-[#121212] p-3 sm:grid-cols-12">
              <input
                type="text"
                placeholder="Title"
                value={cert.title}
                onChange={(e) => {
                  const next = [...form.certifications];
                  next[idx] = { ...cert, title: e.target.value };
                  setForm({ ...form, certifications: next });
                }}
                className="border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED] sm:col-span-5"
              />
              <input
                type="text"
                placeholder="Issuer"
                value={cert.issuer}
                onChange={(e) => {
                  const next = [...form.certifications];
                  next[idx] = { ...cert, issuer: e.target.value };
                  setForm({ ...form, certifications: next });
                }}
                className="border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED] sm:col-span-4"
              />
              <input
                type="text"
                placeholder="Level"
                value={cert.level}
                onChange={(e) => {
                  const next = [...form.certifications];
                  next[idx] = { ...cert, level: e.target.value };
                  setForm({ ...form, certifications: next });
                }}
                className="border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED] sm:col-span-2"
              />
              <button
                type="button"
                aria-label="Remove certification"
                onClick={() =>
                  setForm({
                    ...form,
                    certifications: form.certifications.filter((_, i) => i !== idx),
                  })
                }
                className="inline-flex h-9 w-9 items-center justify-center border border-[#F4F2ED]/15 text-[#F4F2ED]/60 hover:text-red-400 sm:col-span-1 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[#F4F2ED]/10 pt-4">
          <h3 className="font-display text-lg font-bold text-[#F4F2ED]">Languages</h3>
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                languages: [
                  ...form.languages,
                  { id: `lang-${Date.now()}`, name: 'Language', proficiency: 'Conversational' },
                ],
              })
            }
            className="inline-flex items-center gap-1.5 border border-[#F4F2ED]/20 px-3 py-1.5 text-xs font-semibold text-[#F4F2ED] hover:border-[#E85D26] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Language</span>
          </button>
        </div>
        <div className="space-y-3">
          {form.languages.map((lang, idx) => (
            <div key={lang.id} className="grid gap-3 border border-[#F4F2ED]/10 bg-[#121212] p-3 sm:grid-cols-12">
              <input
                type="text"
                placeholder="Language"
                value={lang.name}
                onChange={(e) => {
                  const next = [...form.languages];
                  next[idx] = { ...lang, name: e.target.value };
                  setForm({ ...form, languages: next });
                }}
                className="border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED] sm:col-span-5"
              />
              <input
                type="text"
                placeholder="Proficiency"
                value={lang.proficiency}
                onChange={(e) => {
                  const next = [...form.languages];
                  next[idx] = { ...lang, proficiency: e.target.value };
                  setForm({ ...form, languages: next });
                }}
                className="border border-[#F4F2ED]/15 bg-[#161618] px-3 py-1.5 text-sm text-[#F4F2ED] sm:col-span-6"
              />
              <button
                type="button"
                aria-label="Remove language"
                onClick={() =>
                  setForm({
                    ...form,
                    languages: form.languages.filter((_, i) => i !== idx),
                  })
                }
                className="inline-flex h-9 w-9 items-center justify-center border border-[#F4F2ED]/15 text-[#F4F2ED]/60 hover:text-red-400 sm:col-span-1 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Details & Social Links */}
      <section className="space-y-4 border border-[#F4F2ED]/10 bg-[#161618] p-6">
        <h3 className="font-display text-lg font-bold text-[#F4F2ED]">
          Contact Details &amp; Social Links
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-[#F4F2ED]/70">Public Email</label>
            <input
              type="email"
              required
              value={form.contact.email}
              onChange={(e) =>
                setForm({ ...form, contact: { ...form.contact, email: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#F4F2ED]/70">
              Phone (Optional)
            </label>
            <input
              type="text"
              value={form.contact.phone}
              onChange={(e) =>
                setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#F4F2ED]/70">Fiverr URL</label>
            <input
              type="url"
              value={form.contact.fiverrUrl}
              onChange={(e) =>
                setForm({ ...form, contact: { ...form.contact, fiverrUrl: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#F4F2ED]/70">
              Fiverr Display Label
            </label>
            <input
              type="text"
              value={form.contact.fiverrLabel}
              onChange={(e) =>
                setForm({ ...form, contact: { ...form.contact, fiverrLabel: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#F4F2ED]/70">
              Availability Note
            </label>
            <input
              type="text"
              value={form.contact.availability}
              onChange={(e) =>
                setForm({ ...form, contact: { ...form.contact, availability: e.target.value } })
              }
              className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
            />
          </div>
        </div>

        <div className="space-y-3 border-t border-[#F4F2ED]/10 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#F4F2ED]/70">Social Links</span>
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  contact: {
                    ...form.contact,
                    socialLinks: [
                      ...form.contact.socialLinks,
                      {
                        id: `soc-${Date.now()}`,
                        platform: 'LinkedIn',
                        label: 'LinkedIn',
                        url: 'https://',
                      },
                    ],
                  },
                })
              }
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#E85D26] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Link</span>
            </button>
          </div>
          {form.contact.socialLinks.map((soc, idx) => (
            <div key={soc.id} className="grid gap-3 sm:grid-cols-12">
              <input
                type="text"
                placeholder="Label"
                value={soc.label}
                onChange={(e) => {
                  const next = [...form.contact.socialLinks];
                  next[idx] = { ...soc, label: e.target.value, platform: e.target.value };
                  setForm({
                    ...form,
                    contact: { ...form.contact, socialLinks: next },
                  });
                }}
                className="border border-[#F4F2ED]/15 bg-[#121212] px-3 py-1.5 text-sm text-[#F4F2ED] sm:col-span-4"
              />
              <input
                type="url"
                placeholder="https://..."
                value={soc.url}
                onChange={(e) => {
                  const next = [...form.contact.socialLinks];
                  next[idx] = { ...soc, url: e.target.value };
                  setForm({
                    ...form,
                    contact: { ...form.contact, socialLinks: next },
                  });
                }}
                className="border border-[#F4F2ED]/15 bg-[#121212] px-3 py-1.5 text-sm text-[#F4F2ED] sm:col-span-7"
              />
              <button
                type="button"
                aria-label="Remove social link"
                onClick={() =>
                  setForm({
                    ...form,
                    contact: {
                      ...form.contact,
                      socialLinks: form.contact.socialLinks.filter((_, i) => i !== idx),
                    },
                  })
                }
                className="inline-flex h-9 w-9 items-center justify-center border border-[#F4F2ED]/15 text-[#F4F2ED]/60 hover:text-red-400 sm:col-span-1 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </form>
  );
}
