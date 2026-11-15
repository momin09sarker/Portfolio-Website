import { useState, type MouseEvent } from 'react';
import { ArrowUpRight, Layers } from 'lucide-react';
import type { Project } from '../types/portfolio';

interface ProjectCardProps {
  project: Project;
  index: number;
  onSelect: (project: Project) => void;
}

export function ProjectCard({ project, index, onSelect }: ProjectCardProps) {
  const [imgError, setImgError] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 5, ry: x * 5 });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const indexLabel = String(index + 1).padStart(2, '0');

  return (
    <article
      data-cursor="expand"
      className="group flex flex-col border border-[#121212]/15 bg-[#EAE7DF] transition-colors duration-200 hover:border-[#121212]/40"
    >
      <button
        type="button"
        onClick={() => onSelect(project)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="flex h-full w-full flex-col text-left cursor-pointer"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#18181B]">
          {project.coverImage && !imgError ? (
            <img
              src={project.coverImage}
              alt={project.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#1C1C20] p-6 text-[#F4F2ED]/60">
              <Layers className="h-7 w-7 stroke-[1.25] text-[#E85D26]" />
              <span className="text-xs font-medium tracking-wide">{project.category}</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between gap-5 p-6">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3 text-xs font-medium text-[#121212]/65">
              <span className="font-mono tabular-nums">
                {indexLabel} <span aria-hidden="true">·</span> {project.category}
              </span>
              <ArrowUpRight className="h-4 w-4 stroke-[1.5] text-[#121212]/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#E85D26]" />
            </div>

            <h3 className="font-display text-xl font-bold leading-snug tracking-tight text-[#121212] text-balance">
              {project.title}
            </h3>

            <p className="line-clamp-3 text-sm leading-relaxed text-[#121212]/75">
              {project.description}
            </p>
          </div>

          {project.toolsUsed.length > 0 && (
            <div className="border-t border-[#121212]/10 pt-3.5 text-xs text-[#121212]/65">
              {project.toolsUsed.slice(0, 4).join(' · ')}
            </div>
          )}
        </div>
      </button>
    </article>
  );
}
