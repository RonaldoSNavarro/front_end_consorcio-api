import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Building2, LayoutDashboard, Users, Grid3X3, CircleHelp, 
  CalendarDays, ArrowUpDown, DollarSign, Clock,
  FileText, BarChart3, Shield, ShieldAlert, LogOut, Sun, Moon, X,
  ShoppingCart, Tag, Dice5
} from 'lucide-react';

const navLinks = [
  { to: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/grupos', label: 'Grupos Adm', icon: Grid3X3 },
  { to: '/cotas', label: 'Cotas', icon: CircleHelp },
  { to: '/assembleias', label: 'Assembleias AGO', icon: CalendarDays },
  { to: '/loteria-federal', label: 'Loteria Federal', icon: Dice5 },
  { to: '/lances-pendentes', label: 'Integralizar Lances', icon: ArrowUpDown },
  { to: '/reembolsos-excluidos', label: 'Reembolso Excluídos', icon: DollarSign },
  { to: '/financeiro', label: 'Amortização / Parcelas', icon: Clock },
];

const vendaLinks = [
  { to: '/vendas/proposta', label: 'Nova Proposta', icon: ShoppingCart },
  { to: '/vendas/tipos', label: 'Tipos de Venda', icon: Tag, roles: ['ADMIN', 'GERENTE'] },
];

const reportLinks = [
  { to: '/relatorios/balancete', label: 'Balancete (4110)', icon: FileText, roles: ['ADMIN', 'AUDITOR'] },
  { to: '/relatorios/estatisticas', label: 'Estatísticas (2080)', icon: BarChart3 },
  { to: '/relatorios/pld-ft', label: 'Monitoramento PLD/FT', icon: Shield, roles: ['ADMIN', 'AUDITOR'] },
  { to: '/compliance/alertas', label: 'Listas Restritivas (PLD)', icon: ShieldAlert, roles: ['ADMIN', 'COMPLIANCE'] },
];

export const Sidebar = ({ onClose }) => {
  const { user, isMockMode, toggleMockMode, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const linkClass = ({ isActive }) => 
    `nav-item ${isActive ? 'active' : ''}`;

  return (
    <aside className="w-[270px] h-screen flex flex-col bg-white dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-700/40 overflow-hidden transition-colors duration-300">
      {/* Header / Brand */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-title text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Consórcio API
              </h1>
              <p className="text-[0.65rem] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-medium">
                Painel Administrativo
              </p>
            </div>
          </div>
          {/* Close button - mobile only */}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 lg:hidden transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
            <Icon className="w-[18px] h-[18px] shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Vendas Section */}
        <div className="pt-5 pb-2 px-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/50" />
            <span className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
              Vendas
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/50" />
          </div>
        </div>

        {vendaLinks.map(({ to, label, icon: Icon, roles }) => {
          if (roles && !roles.includes(user?.role)) return null;
          return (
            <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span>{label}</span>
            </NavLink>
          );
        })}

        {/* Relatórios BCB Section */}
        <div className="pt-5 pb-2 px-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/50" />
            <span className="text-[0.65rem] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
              Relatórios BCB
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/50" />
          </div>
        </div>

        {reportLinks.map(({ to, label, icon: Icon, roles }) => {
          if (roles && !roles.includes(user?.role)) return null;
          return (
            <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 space-y-3 border-t border-slate-200 dark:border-slate-700/40">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg
                     bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-slate-700/50
                     hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all duration-200 group"
          aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
        >
          <div className="flex items-center gap-2.5">
            {isDark ? (
              <Moon className="w-4 h-4 text-brand-400" />
            ) : (
              <Sun className="w-4 h-4 text-brand-600" />
            )}
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {isDark ? 'Tema Escuro' : 'Tema Claro'}
            </span>
          </div>
          <div className={`w-8 h-[18px] rounded-full flex items-center transition-colors duration-300 ${isDark ? 'bg-brand-500 justify-end' : 'bg-slate-300 justify-start'}`}>
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm mx-0.5 transition-all duration-300" />
          </div>
        </button>

        {/* Mock Mode Toggle */}
        <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <span className={`status-dot ${isMockMode ? 'mock' : 'real'}`} />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {isMockMode ? 'Simulado (Browser)' : 'API Spring (Live)'}
            </span>
          </div>
          <button onClick={toggleMockMode} className="btn btn-outline btn-sm btn-block">
            Alternar Modo
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-700/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-white font-title font-bold text-xs shadow-md">
            {user?.nome ? user.nome.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
              {user?.nome || 'Ronaldo Navarro'}
            </h4>
            <p className="text-[0.65rem] text-slate-400 dark:text-slate-500">
              {user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'AUDITOR' ? 'Auditor' : user?.role === 'COMPLIANCE' ? 'Compliance' : 'Operador'}
            </p>
          </div>
          <button 
            onClick={logout} 
            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors group"
            title="Sair do painel"
            aria-label="Sair do painel"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
          </button>
        </div>
      </div>
    </aside>
  );
};
