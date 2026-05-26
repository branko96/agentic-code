const ICON_CLASSES = 'h-4 w-4';

export function EyeOpenIcon() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={ICON_CLASSES}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </g>
    </svg>
  );
}

export function EyeClosedIcon() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={ICON_CLASSES}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </g>
    </svg>
  );
}

export function SpinnerIcon() {
  return (
    <svg className="animate-spin" fill="none" aria-hidden="true" width={16} height={16} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={ICON_CLASSES}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </g>
    </svg>
  );
}

export function XMarkIcon() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={ICON_CLASSES}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </g>
    </svg>
  );
}

export function EnvelopeIcon() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={ICON_CLASSES}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4L12 13 2 4" />
      </g>
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={ICON_CLASSES}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 018 0v4" />
      </g>
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={ICON_CLASSES}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </g>
    </svg>
  );
}

export function KeyIcon() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={ICON_CLASSES}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="15" r="4" />
        <path d="M10.85 12.15L19 4" />
        <line x1="18" y1="5" x2="15" y2="8" />
        <line x1="15" y1="5" x2="11.85" y2="8.15" />
      </g>
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={ICON_CLASSES}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
      </g>
    </svg>
  );
}

export function FingerprintIcon() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={ICON_CLASSES}>
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12a10 10 0 0 1 20 0" />
        <path d="M6 12a6 6 0 0 1 12 0" />
        <path d="M10 12a2 2 0 0 1 4 0" />
        <path d="M2.5 17.5a15 15 0 0 1 19 0" />
        <path d="M21.5 17.5a15 15 0 0 0-19 0" />
        <path d="M4.5 21.5a20 20 0 0 1 15 0" />
        <path d="M19.5 21.5a20 20 0 0 0-15 0" />
        <path d="M7 22a25 25 0 0 1 10 0" />
      </g>
    </svg>
  );
}
