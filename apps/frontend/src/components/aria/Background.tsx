export default function Background() {
  return (
    <>
      {/* Layer 1: Radial Gradient */}
      <div
        className="fixed inset-0 -z-50"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(var(--aria-accent-rgb), 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Layer 2: Grid Overlay */}
      <div
        className="fixed inset-0 -z-40 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(var(--aria-accent-rgb), 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--aria-accent-rgb), 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at 50% 0%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 30%, transparent 70%)',
        }}
      />

      {/* Layer 3: Sweep Line */}
      <div
        className="fixed inset-0 -z-30 pointer-events-none animate-aria-sweep opacity-20"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(var(--aria-accent-rgb), 0.3) 50%, transparent 100%)',
          backgroundSize: '200% 200%',
        }}
      />

      {/* Layer 4: Noise SVG */}
      <div className="fixed inset-0 -z-20 pointer-events-none opacity-[0.04]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="aria-noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#aria-noise)" />
        </svg>
      </div>
    </>
  );
}
