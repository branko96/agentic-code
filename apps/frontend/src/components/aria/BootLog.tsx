const LOG_LINES = [
  { status: 'OK', message: 'System initialized',          highlight: false },
  { status: 'OK', message: 'Memory check passed',         highlight: false },
  { status: 'OK', message: 'Network link established',    highlight: false },
  { status: 'OK', message: 'Security handshake complete', highlight: false },
  { status: '>>', message: 'Awaiting authentication...',  highlight: true  },
] as const;

export default function BootLog() {
  return (
    <div className="bg-black/30 border border-aria-accent/10 rounded-lg p-3 font-mono text-xs">
      {LOG_LINES.map((line, i) => {
        const isLast = i === LOG_LINES.length - 1;
        return (
          <div key={i} className="flex gap-2 leading-relaxed">
            <span className={line.highlight ? 'text-cyan-400' : 'text-green-400'}>
              [ {line.status} ]
            </span>
            <span className={line.highlight ? 'text-cyan-400' : 'text-white/80'}>
              {line.message}
            </span>
            {isLast && (
              <span className="animate-aria-blink text-cyan-400">_</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
