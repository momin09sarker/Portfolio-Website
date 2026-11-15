import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
}

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'services', label: 'Services' },
  { id: 'projects', label: 'Projects' },
  { id: 'credentials', label: 'Credentials' },
];

export function Navbar({ onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (id: string) => {
    setMobileOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#F4F2ED]/10 bg-[#121212]/95">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-6 py-4">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('top');
          }}
          className="font-display text-lg font-bold tracking-tight text-[#F4F2ED] whitespace-nowrap shrink-0"
        >
          Abdul Momin
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#F4F2ED]/75"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link.id);
              }}
              className="relative py-1 transition-colors duration-150 hover:text-[#F4F2ED] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#E85D26] after:transition-all after:duration-200 hover:after:w-full whitespace-nowrap shrink-0"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('contact')}
            className="hidden sm:inline-flex items-center justify-center bg-[#E85D26] px-4 py-2 text-xs font-semibold tracking-wide text-[#121212] transition-colors duration-150 hover:bg-[#F26E38] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Get in Touch
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 items-center justify-center border border-[#F4F2ED]/15 text-[#F4F2ED] md:hidden cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5 stroke-[1.5]" /> : <Menu className="h-5 w-5 stroke-[1.5]" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#F4F2ED]/10 bg-[#121212] px-6 py-4 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.id);
                }}
                className="flex min-h-[44px] items-center border-b border-[#F4F2ED]/10 text-base font-medium text-[#F4F2ED]/90 hover:text-[#E85D26]"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => handleLinkClick('contact')}
              className="mt-3 flex min-h-[44px] w-full items-center justify-center bg-[#E85D26] px-4 py-2.5 text-sm font-semibold text-[#121212] cursor-pointer"
            >
              Get in Touch
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
