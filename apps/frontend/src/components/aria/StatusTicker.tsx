'use client';

const ITEMS = [
  'MONITOREO ACTIVO',
  'NUCLEO CUANTICO · NOMINAL',
  'LATENCIA · 4.2 MS',
  'UPTIME · 127H 33M',
  'ENLACE ESTABLECIDO',
  'Q-STATE · VERDE',
] as const;

export default function StatusTicker() {
  return (
    <div className="overflow-hidden whitespace-nowrap border-b border-t border-aria-accent/15 bg-aria-accent-soft/70 py-1">
      <div className="animate-aria-marquee inline-flex gap-6">
        {[...ITEMS, ...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="font-mono text-xs text-aria-accent/70">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
