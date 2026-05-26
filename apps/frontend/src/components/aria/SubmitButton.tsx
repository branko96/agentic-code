import React from 'react';
import { ArrowRightIcon, CheckIcon, SpinnerIcon } from './icons';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingLabel?: string;
  children: React.ReactNode;
}

export const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
  ({ isLoading, isSuccess, loadingLabel = 'Verificando', children, className, disabled, type = 'submit', ...props }, ref) => {
    const isBusy = isLoading || isSuccess;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isBusy}
        aria-busy={isLoading || undefined}
        className={`flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/50 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
        {...props}
      >
        {isLoading ? (
          <>
            <SpinnerIcon />
            {loadingLabel}
            <span
              className="inline-flex overflow-hidden [&>span]:animate-[loading-dots_1.4s_infinite] [&>span:nth-child(2)]:animate-[loading-dots_1.4s_0.2s_infinite] [&>span:nth-child(3)]:animate-[loading-dots_1.4s_0.4s_infinite]"
              aria-hidden="true"
            >
              <span className="opacity-0">.</span>
              <span className="opacity-0">.</span>
              <span className="opacity-0">.</span>
            </span>
          </>
        ) : isSuccess ? (
          <>
            <CheckIcon />
            Acceso concedido
          </>
        ) : (
          <>
            {children}
            <ArrowRightIcon />
          </>
        )}
      </button>
    );
  },
);

SubmitButton.displayName = 'SubmitButton';
