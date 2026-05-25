'use client';

import { useEffect, useState } from 'react';

export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-10 items-center justify-between border-b border-aria-accent/20 bg-aria-bg/80 px-4 backdrop-blur-sm sm:px-6">
      {/* Section 1: Brand */}
      <div className="flex items-center gap-2">
        <svg
          className="h-4 w-4 text-aria-accent"
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="2" width="5" height="5" rx="1" />
          <rect x="9" y="2" width="5" height="5" rx="1" />
          <rect x="2" y="9" width="5" height="5" rx="1" />
          <rect x="9" y="9" width="5" height="5" rx="1" />
        </svg>
        <span className="font-mono text-xs font-semibold tracking-wider text-aria-accent">
          ARIA &middot; Admin Console
        </span>
        <span className="hidden font-mono text-[10px] text-aria-accent/40 sm:inline">
          v2.4.1 &middot; build 2847
        </span>
      </div>

      {/* Section 2: Status Indicators */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-aria-success animate-aria-pulse-dot" />
          <span className="font-mono text-[10px] text-aria-accent/60">Sistema en linea</span>
        </div>
        <span className="hidden font-mono text-[10px] text-aria-accent/30 sm:inline">
          Conexion cifrada &middot; TLS 1.3
        </span>
      </div>

      {/* Section 3: Live Clock */}
      <LiveClock />
    </header>
  );
}

function LiveClock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return <span className="font-mono text-xs tabular-nums text-aria-accent">{time}</span>;
}
