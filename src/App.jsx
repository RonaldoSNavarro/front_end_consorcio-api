import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Confetti } from './components/Confetti';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientesPage } from './pages/ClientesPage';
import { GruposPage } from './pages/GruposPage';
import { CotasPage } from './pages/CotasPage';
import { AssembleiasPage } from './pages/AssembleiasPage';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { LancesPendentesPage } from './pages/LancesPendentesPage';
import { ReembolsosExcluidosPage } from './pages/ReembolsosExcluidosPage';
import { EncerrarGrupoPage } from './pages/EncerrarGrupoPage';
import { RelatorioBalancetePage } from './pages/RelatorioBalancetePage';
import { RelatorioEstatisticasPage } from './pages/RelatorioEstatisticasPage';
import { RelatorioPldFtPage } from './pages/RelatorioPldFtPage';
import { CompliancePainelPage } from './pages/CompliancePainelPage';
import { TiposDeVendaPage } from './pages/TiposDeVendaPage';
import { VendaPropostaPage } from './pages/VendaPropostaPage';
import { LoteriaFederalPage } from './pages/LoteriaFederalPage';
import { MfaSettingsPage } from './pages/MfaSettingsPage';
import { PerfisPage } from './pages/PerfisPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { CredenciamentoLancesPage } from './pages/CredenciamentoLancesPage';
import { CotaDetalhePage } from './pages/CotaDetalhePage';
import { AnaliseRiscoPage } from './pages/AnaliseRiscoPage';
import { BensReferenciaPage } from './pages/BensReferenciaPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Router>
              <Confetti />
              <Routes>
                {/* Rota Pública Segura */}
                <Route path="/login" element={<LoginPage />} />

                {/* Rotas Privadas e Layout Base */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/configuracoes/mfa" element={<MfaSettingsPage />} />
                    <Route path="/clientes" element={<ClientesPage />} />
                    <Route path="/grupos" element={<GruposPage />} />
                    <Route path="/bens-referencia" element={<BensReferenciaPage />} />
                    <Route path="/cotas" element={<CotasPage />} />
                    <Route path="/cotas/:id" element={<CotaDetalhePage />} />
                    <Route path="/assembleias" element={<AssembleiasPage />} />
                    <Route path="/loteria-federal" element={<LoteriaFederalPage />} />
                    <Route path="/lances-pendentes" element={<LancesPendentesPage />} />
                    <Route path="/credenciamento-lances" element={<CredenciamentoLancesPage />} />
                    <Route path="/reembolsos-excluidos" element={<ReembolsosExcluidosPage />} />
                    <Route path="/financeiro" element={<FinanceiroPage />} />
                    
                    {/* Relatório de Estatísticas (Doc 2080) - Aberto para todos os perfis */}
                    <Route path="/relatorios/estatisticas" element={<RelatorioEstatisticasPage />} />
                    
                    {/* Relatórios do BCB */}
                    <Route element={<ProtectedRoute allowedAuthorities={['VIEW_REPORTS']} />}>
                      <Route path="/relatorios/balancete" element={<RelatorioBalancetePage />} />
                      <Route path="/relatorios/pld-ft" element={<RelatorioPldFtPage />} />
                    </Route>

                    {/* Compliance (Listas Restritivas) */}
                    <Route element={<ProtectedRoute allowedAuthorities={['MANAGE_COMPLIANCE']} />}>
                      <Route path="/compliance/alertas" element={<CompliancePainelPage />} />
                      <Route path="/compliance/analise-risco" element={<AnaliseRiscoPage />} />
                    </Route>

                    {/* Gestão de Acesso */}
                    <Route element={<ProtectedRoute allowedAuthorities={['MANAGE_USERS']} />}>
                      <Route path="/perfis" element={<PerfisPage />} />
                      <Route path="/usuarios" element={<UsuariosPage />} />
                    </Route>

                    {/* Módulo de Vendas */}
                    <Route path="/vendas/proposta" element={<VendaPropostaPage />} />
                    <Route element={<ProtectedRoute allowedAuthorities={['MANAGE_GRUPOS']} />}>
                      <Route path="/vendas/tipos" element={<TiposDeVendaPage />} />
                    </Route>

                    {/* Encerramento de Grupo */}
                    <Route element={<ProtectedRoute allowedAuthorities={['MANAGE_GRUPOS']} />}>
                      <Route path="/grupos/:id/encerrar" element={<EncerrarGrupoPage />} />
                    </Route>
                  </Route>
                </Route>
                
                {/* Fallback Seguro */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
