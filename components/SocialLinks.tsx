import { buildSocialUrl } from '@/lib/constants';

interface SocialLinksProps {
  instagram?: string | null;
  facebook?: string | null;
  linktree?: string | null;
  paginaWeb?: string | null;
  className?: string;
}

const iconButtonClass =
  'flex items-center justify-center w-10 h-10 rounded-full bg-white border border-border shadow-sm text-primary hover:text-brand hover:border-brand transition-colors';

/** Row of social-link icon buttons — renders nothing if none are set. */
export default function SocialLinks({ instagram, facebook, linktree, paginaWeb, className = '' }: SocialLinksProps) {
  if (!instagram && !facebook && !linktree && !paginaWeb) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {instagram && (
        <a
          href={buildSocialUrl('instagram', instagram)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className={iconButtonClass}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </a>
      )}
      {facebook && (
        <a
          href={buildSocialUrl('facebook', facebook)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className={iconButtonClass}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l.5-4H15V7a1 1 0 011-1h2z" />
          </svg>
        </a>
      )}
      {linktree && (
        <a
          href={buildSocialUrl('linktree', linktree)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Linktree"
          className={iconButtonClass}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7h3a5 5 0 010 10h-3m-6 0H6a5 5 0 010-10h3" />
            <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round" />
          </svg>
        </a>
      )}
      {paginaWeb && (
        <a
          href={buildSocialUrl('paginaWeb', paginaWeb)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Página web"
          className={iconButtonClass}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
          </svg>
        </a>
      )}
    </div>
  );
}
