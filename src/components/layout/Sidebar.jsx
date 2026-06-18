import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LogoIcon, DashboardIcon, ClientesIcon, GruposIcon, CotasIcon, 
  AssembleiasIcon, LancesIcon, ReembolsoIcon, FinanceiroIcon,
  BalanceteIcon, EstatisticasIcon, PldIcon, LogoutIcon
} from '../ui/Icons';

export const Sidebar = () => {
  const { user, isMockMode, toggleMockMode, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <LogoIcon />
        <div>
          <h1>Consórcio API</h1>
          <p>Painel Administrativo</p>
        </div>
      </div>

      <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, overflowY: 'auto' }}>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <DashboardIcon /> Visão Geral
        </NavLink>
        <NavLink to="/clientes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ClientesIcon /> Clientes
        </NavLink>
        <NavLink to="/grupos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <GruposIcon /> Grupos Adm
        </NavLink>
        <NavLink to="/cotas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CotasIcon /> Cotas
        </NavLink>
        <NavLink to="/assembleias" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <AssembleiasIcon /> Assembleias AGO
        </NavLink>
        <NavLink to="/lances-pendentes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LancesIcon /> Integralizar Lances
        </NavLink>
        <NavLink to="/reembolsos-excluidos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ReembolsoIcon /> Reembolso Excluídos
        </NavLink>
        <NavLink to="/financeiro" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FinanceiroIcon /> Amortização / Parcelas
        </NavLink>

        {/* Seção Relatórios BCB */}
        <div style={{ 
          padding: '20px 16px 8px 16px', 
          fontSize: '0.68rem', 
          color: 'rgba(255,255,255,0.35)', 
          textTransform: 'uppercase', 
          fontWeight: 700, 
          letterSpacing: '0.08em', 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginTop: '10px'
        }}>
          Relatórios BCB
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'DIRETOR') && (
          <NavLink to="/relatorios/balancete" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BalanceteIcon /> Balancete (4110)
          </NavLink>
        )}

        <NavLink to="/relatorios/estatisticas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <EstatisticasIcon /> Estatísticas (2080)
        </NavLink>

        {(user?.role === 'ADMIN' || user?.role === 'DIRETOR') && (
          <NavLink to="/relatorios/pld-ft" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <PldIcon /> Monitoramento PLD/FT
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', marginTop: '15px' }}>
        <div className="mode-toggle-card">
          <div className="mode-info">
            <span className={`status-dot ${isMockMode ? 'mock' : 'real'}`}></span>
            <span>{isMockMode ? "Simulado (Browser)" : "API Spring (Live)"}</span>
          </div>
          <button onClick={toggleMockMode} className="btn btn-sm btn-outline btn-block">
            Alternar Modo
          </button>
        </div>

        <div className="user-profile">
          <div className="user-avatar">{user?.nome ? user.nome.substring(0, 2).toUpperCase() : "US"}</div>
          <div className="user-details">
            <h4>{user?.nome || "Ronaldo Navarro"}</h4>
            <p>{user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'DIRETOR' ? 'Diretor' : 'Operador'}</p>
          </div>
          <button onClick={logout} className="btn-logout" title="Sair do painel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
};
