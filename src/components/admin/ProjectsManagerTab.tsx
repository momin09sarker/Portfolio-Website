import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  createAdminProject,
  deleteAdminProject,
  reorderAdminProjects,
  updateAdminProject,
  uploadAdminImage,
} from '../../lib/api';
import type { Project, ProjectCategory } from '../../types/portfolio';

interface ProjectsManagerTabProps {
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
}

interface ProjectDraft {
  id?: number;
  title: string;
  category: ProjectCategory;
  description: string;
  toolsText: string;
  coverImage: string;
  gallery: string[];
  liveLink: string;
  published: boolean;
}

const EMPTY_DRAFT: ProjectDraft = {
  title: '',
  category: 'Automation',
  description: '',
  toolsText: '',
  coverImage: '',
  gallery: [],
  liveLink: '',
  published: true,
};

export function ProjectsManagerTab({
  projects,
  onProjectsChange,
}: ProjectsManagerTabProps) {
  const [editing, setEditing] = useState<ProjectDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const openEdit = (p: Project) => {
    setEditing({
      id: p.id,
      title: p.title,
      category: p.category,
      description: p.description,
      toolsText: p.toolsUsed.join(', '),
      coverImage: p.coverImage,
      gallery: p.gallery,
      liveLink: p.liveLink,
      published: p.published,
    });
    setStatusMsg(null);
  };

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploadingCover(true);
    setStatusMsg(null);
    try {
      const url = await uploadAdminImage(file);
      setEditing({ ...editing, coverImage: url });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Cover upload failed.',
      });
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploadingGallery(true);
    setStatusMsg(null);
    try {
      const url = await uploadAdminImage(file);
      setEditing({ ...editing, gallery: [...editing.gallery, url] });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gallery upload failed.',
      });
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setSaving(true);
    setStatusMsg(null);
    const payload = {
      title: editing.title.trim(),
      category: editing.category,
      description: editing.description.trim(),
      toolsUsed: editing.toolsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      coverImage: editing.coverImage.trim(),
      gallery: editing.gallery.filter(Boolean),
      liveLink: editing.liveLink.trim(),
      published: editing.published,
    };

    try {
      if (editing.id) {
        const updated = await updateAdminProject(editing.id, payload);
        onProjectsChange(projects.map((p) => (p.id === updated.id ? updated : p)));
        setStatusMsg({ type: 'success', text: 'Project updated.' });
      } else {
        const created = await createAdminProject(payload);
        onProjectsChange([...projects, created]);
        setStatusMsg({ type: 'success', text: 'Project created.' });
      }
      setEditing(null);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save project.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setStatusMsg(null);
    try {
      await deleteAdminProject(id);
      onProjectsChange(projects.filter((p) => p.id !== id));
      setStatusMsg({ type: 'success', text: 'Project deleted.' });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete project.',
      });
    }
  };

  const handleTogglePublished = async (p: Project) => {
    setStatusMsg(null);
    try {
      const updated = await updateAdminProject(p.id, {
        title: p.title,
        category: p.category,
        description: p.description,
        toolsUsed: p.toolsUsed,
        coverImage: p.coverImage,
        gallery: p.gallery,
        liveLink: p.liveLink,
        published: !p.published,
        sortOrder: p.sortOrder,
      });
      onProjectsChange(projects.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update status.',
      });
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const reordered = [...projects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    onProjectsChange(reordered);
    try {
      const updated = await reorderAdminProjects(reordered.map((p) => p.id));
      onProjectsChange(updated);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to reorder projects.',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F4F2ED]/10 pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#F4F2ED]">Projects Manager</h2>
          <p className="mt-1 text-sm text-[#F4F2ED]/60">
            Add, edit, reorder, and publish case studies across Automation, Ads, and Design.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing({ ...EMPTY_DRAFT });
            setStatusMsg(null);
          }}
          className="inline-flex items-center gap-2 bg-[#E85D26] px-5 py-2.5 text-sm font-semibold text-[#121212] transition-colors hover:bg-[#F26E38] cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[1.75]" />
          <span>New Project</span>
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

      {editing && (
        <form
          onSubmit={handleSave}
          className="space-y-5 border border-[#E85D26]/40 bg-[#161618] p-6"
        >
          <div className="flex items-center justify-between border-b border-[#F4F2ED]/10 pb-4">
            <h3 className="font-display text-xl font-bold text-[#F4F2ED]">
              {editing.id ? 'Edit Project' : 'Create Project'}
            </h3>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Cancel editing"
              className="text-[#F4F2ED]/60 hover:text-[#F4F2ED] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#F4F2ED]/70">Project Title</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={160}
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F4F2ED]/70">Category</label>
              <select
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value as ProjectCategory })
                }
                className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
              >
                <option value="Automation">Automation</option>
                <option value="Ads">Ads</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#F4F2ED]/70">Description</label>
              <textarea
                rows={4}
                required
                minLength={10}
                maxLength={4000}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F4F2ED]/70">
                Tools Used (comma-separated)
              </label>
              <input
                type="text"
                placeholder="n8n, Webhooks, Google Sheets"
                value={editing.toolsText}
                onChange={(e) => setEditing({ ...editing, toolsText: e.target.value })}
                className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F4F2ED]/70">
                Live Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={editing.liveLink}
                onChange={(e) => setEditing({ ...editing, liveLink: e.target.value })}
                className="mt-1.5 w-full border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#F4F2ED]/70">
                Cover Image (URL or Upload)
              </label>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={editing.coverImage}
                  onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })}
                  placeholder="/uploads/..."
                  className="min-w-[220px] flex-1 border border-[#F4F2ED]/15 bg-[#121212] px-3.5 py-2 text-sm text-[#F4F2ED]"
                />
                <label className="inline-flex items-center gap-2 border border-[#F4F2ED]/20 bg-[#121212] px-4 py-2 text-xs font-semibold text-[#F4F2ED] hover:border-[#E85D26] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{uploadingCover ? 'Uploading...' : 'Upload Cover'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                  />
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#F4F2ED]/70">
                  Gallery Images
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E85D26] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{uploadingGallery ? 'Uploading...' : 'Add Gallery Image'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                  />
                </label>
              </div>

              {editing.gallery.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-3">
                  {editing.gallery.map((imgUrl, idx) => (
                    <div
                      key={`${imgUrl}-${idx}`}
                      className="relative h-20 w-28 border border-[#F4F2ED]/15 bg-[#121212]"
                    >
                      <img
                        src={imgUrl}
                        alt={`Gallery ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        aria-label="Remove gallery image"
                        onClick={() =>
                          setEditing({
                            ...editing,
                            gallery: editing.gallery.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-black/80 text-white hover:text-[#E85D26] cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="inline-flex items-center gap-2.5 text-sm text-[#F4F2ED] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                  className="h-4 w-4 accent-[#E85D26]"
                />
                <span>Published on public portfolio</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#F4F2ED]/10 pt-4">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="border border-[#F4F2ED]/20 px-4 py-2 text-sm text-[#F4F2ED]/80 hover:text-[#F4F2ED] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#E85D26] px-5 py-2 text-sm font-semibold text-[#121212] hover:bg-[#F26E38] disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="border border-[#F4F2ED]/10 bg-[#161618] p-12 text-center text-sm text-[#F4F2ED]/60">
          No projects yet. Click &ldquo;New Project&rdquo; above to add your first case study.
        </div>
      ) : (
        <div className="divide-y divide-[#F4F2ED]/10 border border-[#F4F2ED]/10 bg-[#161618]">
          {projects.map((p, idx) => (
            <div
              key={p.id}
              className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-4">
                <div className="h-16 w-24 shrink-0 overflow-hidden border border-[#F4F2ED]/10 bg-[#121212]">
                  {p.coverImage && (
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-[#F4F2ED]/55">
                    <span className="font-mono tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>{' '}
                    <span aria-hidden="true">·</span> {p.category}{' '}
                    <span aria-hidden="true">·</span>{' '}
                    <span className={p.published ? 'text-emerald-400' : 'text-amber-300'}>
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h4 className="font-display text-lg font-bold text-[#F4F2ED]">{p.title}</h4>
                  <div className="text-xs text-[#F4F2ED]/50">
                    {p.toolsUsed.join(' · ')}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMove(idx, -1)}
                  disabled={idx === 0}
                  aria-label={`Move ${p.title} up`}
                  className="inline-flex h-9 w-9 items-center justify-center border border-[#F4F2ED]/15 text-[#F4F2ED]/70 hover:border-[#F4F2ED]/40 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(idx, 1)}
                  disabled={idx === projects.length - 1}
                  aria-label={`Move ${p.title} down`}
                  className="inline-flex h-9 w-9 items-center justify-center border border-[#F4F2ED]/15 text-[#F4F2ED]/70 hover:border-[#F4F2ED]/40 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePublished(p)}
                  title={p.published ? 'Move to Draft' : 'Publish'}
                  className="inline-flex h-9 items-center gap-1.5 border border-[#F4F2ED]/15 px-3 text-xs text-[#F4F2ED]/80 hover:border-[#E85D26] cursor-pointer"
                >
                  {p.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{p.published ? 'Unpublish' : 'Publish'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="inline-flex h-9 items-center gap-1.5 border border-[#F4F2ED]/15 px-3 text-xs text-[#F4F2ED]/80 hover:border-[#E85D26] cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  aria-label={`Delete ${p.title}`}
                  className="inline-flex h-9 w-9 items-center justify-center border border-[#F4F2ED]/15 text-[#F4F2ED]/60 hover:border-red-500/50 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
