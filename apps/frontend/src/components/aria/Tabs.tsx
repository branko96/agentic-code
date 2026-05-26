export type TabId = 'login' | 'register';

interface TabsProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
  tabs?: readonly { id: TabId; label: string }[];
}

const DEFAULT_TABS = [
  { id: 'login' as const, label: 'Iniciar sesión' },
  { id: 'register' as const, label: 'Crear cuenta' },
];

export default function Tabs({ activeTab, onChange, tabs = DEFAULT_TABS }: TabsProps) {
  return (
    <div style={{ position: 'relative' }} className="grid grid-cols-2 rounded-lg bg-surface-border/10 p-1">
      <div
        className="absolute inset-y-1 left-1 right-auto w-[calc(50%-4px)] rounded-md bg-surface-elevated shadow-sm transition-transform duration-200 ease-out"
        style={{
          transform:
            activeTab === 'register'
              ? 'translateX(calc(100% + 8px))'
              : 'translateX(0)',
        }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`relative z-10 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            activeTab === tab.id
              ? 'text-foreground'
              : 'text-muted hover:text-foreground'
          }`}
          aria-selected={activeTab === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
