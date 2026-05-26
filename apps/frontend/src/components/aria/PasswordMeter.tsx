export function strengthOf(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const COLORS = { 1: '#f87171', 2: '#fbbf24', 3: '#34d399', 4: '#22d3ee' } as const;
const LABELS = { 1: 'Débil', 2: 'Media', 3: 'Fuerte', 4: 'Muy fuerte' } as const;

export function PasswordMeter({ password }: { password: string }) {
  if (!password) return null;

  const score = strengthOf(password);
  const displayScore = Math.min(score, 4);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-200"
            style={{
              backgroundColor:
                i <= displayScore
                  ? COLORS[displayScore as keyof typeof COLORS]
                  : 'rgba(255, 255, 255, 0.1)',
            }}
          />
        ))}
      </div>
      {displayScore > 0 && (
        <p className="mt-1 font-mono text-[10px] text-aria-accent/50">
          {LABELS[displayScore as keyof typeof LABELS]}
        </p>
      )}
    </div>
  );
}
