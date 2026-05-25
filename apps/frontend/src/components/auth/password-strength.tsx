const SEGMENT_COLORS: Record<number, string> = {
  1: '#f87171',
  2: '#fbbf24',
  3: '#34d399',
  4: '#34d399',
};

const LABELS: Record<number, string> = {
  1: 'Debil',
  2: 'Media',
  3: 'Fuerte',
  4: 'Muy fuerte',
};

function getScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

type PasswordStrengthProps = {
  password: string;
};

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const score = getScore(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className="h-2 flex-1 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: segment <= score ? SEGMENT_COLORS[score] : undefined,
            }}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-muted">{LABELS[score]}</p>
    </div>
  );
}
