export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-8 items-center justify-between border-t border-aria-accent/20 bg-aria-bg/80 px-4 backdrop-blur-sm sm:px-6">
      {/* Section 1: Copyright */}
      <span className="font-mono text-[10px] text-aria-accent/30">
        &copy; 2026 ARIA SYSTEMS &middot; TODOS LOS DERECHOS RESERVADOS
      </span>

      {/* Section 2: Compliance Badges */}
      <div className="hidden items-center gap-3 sm:flex">
        <span className="font-mono text-[10px] text-aria-accent/40">ISO 27001</span>
        <span className="font-mono text-[10px] text-aria-accent/20">&middot;</span>
        <span className="font-mono text-[10px] text-aria-accent/40">SOC 2 Type II</span>
        <span className="font-mono text-[10px] text-aria-accent/20">&middot;</span>
        <span className="font-mono text-[10px] text-aria-accent/40">GDPR</span>
      </div>

      {/* Section 3: Status Dots */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-aria-accent animate-aria-pulse-dot" />
          <span className="font-mono text-[10px] text-aria-accent/40">NUCLEO</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-aria-success animate-aria-pulse-dot" />
          <span className="font-mono text-[10px] text-aria-accent/40">RED</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-aria-warning animate-aria-pulse-dot" />
          <span className="font-mono text-[10px] text-aria-accent/40">ENLACE</span>
        </div>
      </div>
    </footer>
  );
}
