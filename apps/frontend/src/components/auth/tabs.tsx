type Tab = 'login' | 'register';

type TabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="grid grid-cols-2 rounded-lg bg-surface-border/10 p-1">
      <button
        type="button"
        onClick={() => onTabChange('login')}
        className={`rounded-md px-4 py-2 text-sm font-medium transition ${
          activeTab === 'login'
            ? 'bg-surface-elevated text-primary shadow-sm'
            : 'text-muted hover:text-foreground'
        }`}
      >
        Iniciar sesion
      </button>
      <button
        type="button"
        onClick={() => onTabChange('register')}
        className={`rounded-md px-4 py-2 text-sm font-medium transition ${
          activeTab === 'register'
            ? 'bg-surface-elevated text-primary shadow-sm'
            : 'text-muted hover:text-foreground'
        }`}
      >
        Crear cuenta
      </button>
    </div>
  );
}
