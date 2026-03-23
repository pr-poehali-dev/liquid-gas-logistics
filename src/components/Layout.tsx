import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

const navItems = [
  { id: 'registry', label: 'Реестр отгрузок', icon: 'List' },
  { id: 'new-shipment', label: 'Новая отгрузка', icon: 'PlusCircle' },
  { id: 'reports', label: 'Отчёты и статистика', icon: 'BarChart3' },
  { id: 'directories', label: 'Справочники', icon: 'BookOpen' },
  { id: 'certificates', label: 'Сертификаты', icon: 'ShieldCheck' },
];

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-200"
        style={{
          width: collapsed ? 56 : 240,
          background: 'hsl(var(--sidebar-background))',
          borderRight: '1px solid hsl(var(--sidebar-border))',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 py-4 border-b border-sidebar-border" style={{ minHeight: 56 }}>
          <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(var(--sidebar-primary))' }}>
            <Icon name="Truck" size={15} className="text-white" />
          </div>
          {!collapsed && (
            <div className="animate-slide-in overflow-hidden">
              <div className="text-xs font-bold text-white leading-tight tracking-wide">АЗОТСЕРВИС</div>
              <div className="text-[10px] text-sidebar-foreground/60 leading-tight">Управление отгрузками</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
          >
            <Icon name={collapsed ? 'ChevronsRight' : 'ChevronsLeft'} size={14} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`sidebar-link ${currentPage === item.id ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon name={item.icon as never} size={16} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-sidebar-border">
          {!collapsed && (
            <div className="text-[10px] text-sidebar-foreground/40 font-mono-nums">
              ПП РФ №2200 от 21.12.2020
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white border-b border-border flex items-center px-6 gap-4 flex-shrink-0">
          <h1 className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">
            {navItems.find(n => n.id === currentPage)?.label || 'Система управления отгрузками'}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-xs font-mono-nums text-muted-foreground">
              {new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
