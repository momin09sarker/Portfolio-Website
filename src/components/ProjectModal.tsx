import { useEffect, useState } from 'react';
import { ExternalLink, Layers, X } from 'lucide-react';
import type { Project } from '../types/portfolio';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeImage, setActiveImage] = useState<string>('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (project) {
      setActiveImage(project.coverImage || project.gallery[0] || '');
      setImgError(false);
    }
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const images = Array.from(
    new Set([project.coverImage, ...project.gallery].filter(Boolean))
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-[#F4F2ED]/15 bg-[#161618] text-[#F4F2ED]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#F4F2ED]/10 bg-[#161618]/95 px-6 py-4">
          <span className="text-xs font-medium text-[#F4F2ED]/65">
            {project.category} <span aria-hidden="true">·</span> Case Study
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="inline-flex h-10 w-10 items-center justify-center border border-[#F4F2ED]/15 text-[#F4F2ED]/80 transition-colors hover:border-[#E85D26] hover:text-[#F4F2ED] cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[1.5]" />
          </button>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="aspect-[16/10] w-full overflow-hidden border border-[#F4F2ED]/10 bg-[#1C1C20]">
            {activeImage && !imgError ? (
              <img
                src={activeImage}
                alt={project.title}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[#F4F2ED]/60">
                <Layers className="h-8 w-8 stroke-[1.25] text-[#E85D26]" />
                <span className="text-sm">{project.title}</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {images.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  type="button"
                  onClick={() => {
                    setActiveImage(src);
                    setImgError(false);
                  }}
                  className={`h-16 w-24 overflow-hidden border transition-colors cursor-pointer ${
                    activeImage === src
                      ? 'border-[#E85D26]'
                      : 'border-[#F4F2ED]/15 opacity-65 hover:opacity-100'
                  }`}
                >
                  <img
                    src={src}
                    alt={`${project.title} preview ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <h2
              id="project-modal-title"
              className="font-display text-2xl font-bold tracking-tight text-[#F4F2ED] sm:text-3xl text-balance"
            >
              {project.title}
            </h2>

            <p className="whitespace-pre-line text-base leading-relaxed text-[#F4F2ED]/80">
              {project.description}
            </p>
          </div>

          {project.toolsUsed.length > 0 && (
            <div className="border-t border-[#F4F2ED]/10 pt-5">
              <div className="text-xs font-medium text-[#F4F2ED]/50">Tools &amp; Stack</div>
              <div className="mt-1.5 text-sm text-[#F4F2ED]/90">
                {project.toolsUsed.join(' · ')}
              </div>
            </div>
          )}

          {project.liveLink && (
            <div className="flex items-center justify-end border-t border-[#F4F2ED]/10 pt-5">
              <a
                href={project.liveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#E85D26] px-5 py-2.5 text-sm font-semibold text-[#121212] transition-colors hover:bg-[#F26E38]"
              >
                <span>View Live Reference</span>
                <ExternalLink className="h-4 w-4 stroke-[1.5]" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
