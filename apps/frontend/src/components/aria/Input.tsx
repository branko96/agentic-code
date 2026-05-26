import React from 'react';
import { Field } from './Field';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, rightSlot, className, id, ...props }, ref) => {
    return (
      <Field label={label} error={error} hint={hint} id={id || props.id}>
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id || props.id}
            className={`h-10 sm:h-11 w-full rounded-lg bg-surface text-foreground text-sm outline-none transition placeholder:text-muted/50 ${
              icon ? 'pl-9' : 'pl-3'
            } ${rightSlot ? 'pr-10' : 'pr-3'} focus:ring-2 focus:ring-[#22d3ee]/30 focus:border-[#22d3ee] ${
              error ? 'ring-2 ring-red-400/30 border-red-400 focus:ring-red-400/50 focus:border-red-400' : ''
            } ${className || ''}`}
            {...props}
          />
          {rightSlot && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightSlot}
            </span>
          )}
        </div>
      </Field>
    );
  },
);
Input.displayName = 'Input';
