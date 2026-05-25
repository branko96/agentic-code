interface AIOrbProps {
  loading?: boolean;
}

export default function AIOrb({ loading = false }: AIOrbProps) {
  const CYAN = '#22d3ee';

  // Generate tick marks for outer ring: 60 ticks, every 5th longer
  const outerTicks = Array.from({ length: 60 }, (_, i) => {
    const isFifth = (i + 1) % 5 === 0;
    return {
      rotation: (i / 60) * 360,
      length: isFifth ? 12 : 6,
      width: isFifth ? 1.5 : 0.75,
    };
  });

  // Generate tick marks for mid ring: 30 ticks, every 3rd extends
  const midTicks = Array.from({ length: 30 }, (_, i) => {
    const isThird = (i + 1) % 3 === 0;
    return {
      rotation: (i / 30) * 360,
      length: isThird ? 10 : 5,
      width: isThird ? 1.25 : 0.6,
    };
  });

  const orbitSpeed = loading ? 'animate-aria-spin-fast' : 'animate-aria-spin-slow';

  return (
    <div className="relative w-44 h-44 rounded-full bg-aria-bg/60 flex items-center justify-center"
      style={{ boxShadow: `0 0 24px ${CYAN}33, 0 0 48px ${CYAN}1a` }}
    >
      {/* 1. Outer Ring */}
      <div className="absolute inset-0 animate-aria-spin-slow">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {outerTicks.map((tick, i) => (
            <g key={i} transform={`rotate(${tick.rotation} 100 100)`}>
              <line
                x1="100" y1="10"
                x2="100" y2={10 + tick.length}
                stroke={CYAN}
                strokeWidth={tick.width}
                strokeOpacity={tick.length > 6 ? 0.6 : 0.35}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* 2. Mid Ring */}
      <div className="absolute inset-[15%] animate-aria-spin-rev">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {midTicks.map((tick, i) => (
            <g key={i} transform={`rotate(${tick.rotation} 100 100)`}>
              <line
                x1="100" y1="10"
                x2="100" y2={10 + tick.length}
                stroke={CYAN}
                strokeWidth={tick.width}
                strokeOpacity={tick.length > 5 ? 0.5 : 0.3}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* 3. Core */}
      <div className="absolute inset-[28%]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <radialGradient id="orbCoreGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={CYAN} stopOpacity="0.9" />
              <stop offset="40%" stopColor={CYAN} stopOpacity="0.5" />
              <stop offset="100%" stopColor={CYAN} stopOpacity="0.05" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="50" fill="url(#orbCoreGradient)" />
          {/* Specular highlight */}
          <ellipse
            cx="38" cy="38"
            rx="18" ry="14"
            fill="white"
            opacity="0.12"
            transform="rotate(-20 38 38)"
          />
        </svg>
      </div>

      {/* 4. Equator Ring */}
      <div className="absolute inset-[22%]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <ellipse
            cx="50" cy="50"
            rx="38" ry="12"
            fill="none"
            stroke={CYAN}
            strokeWidth="0.75"
            strokeOpacity="0.4"
            transform="rotate(-12 50 50)"
          />
        </svg>
      </div>

      {/* 5. Satellites */}
      <div className={`absolute inset-[-5%] ${orbitSpeed}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Satellite 1 */}
          <g transform="rotate(-30 100 100)">
            <circle cx="100" cy="8" r="2.5" fill={CYAN} opacity="0.8" />
          </g>
          {/* Satellite 2 */}
          <g transform="rotate(90 100 100)">
            <circle cx="100" cy="6" r="2" fill={CYAN} opacity="0.7" />
          </g>
          {/* Satellite 3 */}
          <g transform="rotate(210 100 100)">
            <circle cx="100" cy="10" r="3" fill={CYAN} opacity="0.85" />
            {/* Tiny dot trail */}
            <circle cx="100" cy="14" r="1" fill={CYAN} opacity="0.3" />
          </g>
        </svg>
      </div>
    </div>
  );
}
