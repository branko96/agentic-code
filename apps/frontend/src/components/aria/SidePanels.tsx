import AIOrb from './AIOrb';
import BootLog from './BootLog';
import Waveform from './Waveform';
import Corners from './Corners';

interface LeftPanelProps {
  loading?: boolean;
}

export function LeftPanel({ loading = false }: LeftPanelProps) {
  return (
    <div className="hidden lg:flex flex-col items-center gap-6 w-72">
      <AIOrb loading={loading} />

      {/* Metric cards */}
      <div className="w-full space-y-3">
        {/* Row 1: 2-column */}
        <div className="grid grid-cols-2 gap-3">
          <Corners>
            <div className="bg-black/30 rounded-md px-2 py-1.5 text-center">
              <div className="font-mono text-[10px] text-aria-accent/50 uppercase tracking-wider">
                Operadores
              </div>
              <div className="font-mono text-sm text-cyan-400">4 ACTIVE</div>
            </div>
          </Corners>
          <Corners>
            <div className="bg-black/30 rounded-md px-2 py-1.5 text-center">
              <div className="font-mono text-[10px] text-aria-accent/50 uppercase tracking-wider">
                Uptime
              </div>
              <div className="font-mono text-sm text-cyan-400">127H</div>
            </div>
          </Corners>
        </div>

        {/* Row 2: Full-width */}
        <Corners>
          <div className="bg-black/30 rounded-md px-2 py-1.5 text-center">
            <div className="font-mono text-[10px] text-aria-accent/50 uppercase tracking-wider">
              Nodos
            </div>
            <div className="font-mono text-sm text-cyan-400">12 ONLINE</div>
          </div>
        </Corners>
      </div>
    </div>
  );
}

export function RightPanel() {
  return (
    <div className="hidden lg:flex flex-col gap-4 w-72">
      <BootLog />
      <Waveform />

      {/* Telemetry cards */}
      <div className="grid grid-cols-3 gap-2">
        <Corners>
          <div className="bg-black/30 rounded-md px-1 py-1 text-center">
            <div className="font-mono text-[10px] text-aria-accent/50 uppercase tracking-wider">
              Latencia
            </div>
            <div className="font-mono text-sm text-cyan-400">4.2MS</div>
          </div>
        </Corners>
        <Corners>
          <div className="bg-black/30 rounded-md px-1 py-1 text-center">
            <div className="font-mono text-[10px] text-aria-accent/50 uppercase tracking-wider">
              Paquetes
            </div>
            <div className="font-mono text-sm text-cyan-400">12.4K</div>
          </div>
        </Corners>
        <Corners>
          <div className="bg-black/30 rounded-md px-1 py-1 text-center">
            <div className="font-mono text-[10px] text-aria-accent/50 uppercase tracking-wider">
              Seguridad
            </div>
            <div className="font-mono text-sm text-cyan-400">AES</div>
          </div>
        </Corners>
      </div>

      {/* Security disclaimer */}
      <div className="font-mono text-[10px] text-aria-accent/30 text-center">
        ENCRYPTED CHANNEL // AES-256-GCM
      </div>
    </div>
  );
}
