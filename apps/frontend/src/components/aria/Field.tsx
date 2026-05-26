import { XMarkIcon } from './icons';

interface FieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  id?: string;
  className?: string;
}

export function Field({ label, children, error, hint, id, className }: FieldProps) {
  return (
    <label htmlFor={id} className={`group flex flex-col gap-1.5 ${className || ''}`}>
      <span className="label-row flex items-center justify-between opacity-70 transition-opacity group-focus-within:opacity-100">
        <span className="font-mono text-[10px] uppercase tracking-wider text-aria-accent">{label}</span>
      </span>
      {children}
      {error && (
        <span className="flex items-center gap-1 font-mono text-[10px] text-red-400" role="alert">
          <XMarkIcon />{error}
        </span>
      )}
      {!error && hint && (
        <span className="font-mono text-[10px] text-aria-accent/50">{hint}</span>
      )}
    </label>
  );
}
