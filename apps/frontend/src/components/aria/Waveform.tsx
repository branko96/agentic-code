const HEIGHT_PROFILE = [
  0.3, 0.5, 0.4, 0.6, 0.45, 0.7, 0.55, 0.8, 0.65, 0.85,
  0.7, 0.9, 0.75, 0.95, 0.8, 0.9, 0.75, 0.85, 0.7, 0.8,
  0.65, 0.9, 0.75, 1.0, 0.85, 1.0, 0.9, 0.85, 0.75, 0.8,
  0.7, 0.75, 0.6, 0.65, 0.55, 0.6, 0.5, 0.55, 0.45, 0.5,
];

export default function Waveform() {
  return (
    <div className="bg-black/30 border border-aria-accent/10 rounded-lg p-3">
      <div className="flex items-end gap-px h-12">
        {HEIGHT_PROFILE.map((value, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-cyan-400 to-transparent animate-aria-wave"
            style={{
              height: `${value * 100}%`,
              animationDelay: `${i * 60}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
