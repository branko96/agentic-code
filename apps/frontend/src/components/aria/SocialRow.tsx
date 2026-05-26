interface SocialProvider {
  name: string;
  onClick: () => void;
}

interface SocialRowProps {
  providers: SocialProvider[];
  label?: string;
  className?: string;
}

export function SocialRow({ providers, label = 'Or continue with', className }: SocialRowProps) {
  return (
    <div className={`rounded-lg border border-surface-border bg-surface p-4 ${className || ''}`}>
      <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <div className="flex flex-col gap-2">
        {providers.map((provider) => (
          <button
            key={provider.name}
            type="button"
            onClick={provider.onClick}
            className="w-full rounded-lg bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-border"
          >
            {provider.name}
          </button>
        ))}
      </div>
    </div>
  );
}
