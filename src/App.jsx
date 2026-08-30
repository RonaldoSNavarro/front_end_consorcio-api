import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Confetti } from './components/Confetti';
import { LoadingFallback } from './components/ui/LoadingFallback';

// Dynamic imports (Code Splitting - MELHORIA-006)
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ClientesPage = lazy(() => import('./pages/ClientesPage').then(m => ({ default: m.ClientesPage })));
const GruposPage = lazy(() => import('./pages/GruposPage').then(m => ({ default: m.GruposPage })));
const CotasPage = lazy(() => import('./pages/CotasPage').then(m => ({ default: m.CotasPage })));
const AssembleiasPage = lazy(() => import('./pages/AssembleiasPage').then(m => ({ default: m.AssembleiasPage })));
const FinanceiroPage = lazy(() => import('./pages/FinanceiroPage').then(m => ({ default: m.FinanceiroPage })));
const LancesPendentesPage = lazy(() => import('./pages/LancesPendentesPage').then(m => ({ default: m.LancesPendentesPage })));
const ReembolsosExcluidosPage = lazy(() => import('./pages/ReembolsosExcluidosPage').then(m => ({ default: m.ReembolsosExcluidosPage })));
const EncerrarGrupoPage = lazy(() => import('./pages/EncerrarGrupoPage').then(m => ({ default: m.EncerrarGrupoPage })));
const RelatorioBalancetePage = lazy(() => import('./pages/RelatorioBalancetePage').then(m => ({ default: m.RelatorioBalancetePage })));
const RelatorioEstatisticasPage = lazy(() => import('./pages/RelatorioEstatisticasPage').then(m => ({ default: m.RelatorioEstatisticasPage })));
const RelatorioPldFtPage = lazy(() => import('./pages/RelatorioPldFtPage').then(m => ({ default: m.RelatorioPldFtPage })));
const CompliancePainelPage = lazy(() => import('./pages/CompliancePainelPage').then(m => ({ default: m.CompliancePainelPage })));
const TiposDeVendaPage = lazy(() => import('./pages/TiposDeVendaPage').then(m => ({ default: m.TiposDeVendaPage })));
const VendaPropostaPage = lazy(() => import('./pages/VendaPropostaPage').then(m => ({ default: m.VendaPropostaPage })));
const LoteriaFederalPage = lazy(() => import('./pages/LoteriaFederalPage').then(m => ({ default: m.LoteriaFederalPage })));
const MfaSettingsPage = lazy(() => import('./pages/MfaSettingsPage').then(m => ({ default: m.MfaSettingsPage })));
const PerfisPage = lazy(() => import('./pages/PerfisPage').then(m => ({ default: m.PerfisPage })));
const UsuariosPage = lazy(() => import('./pages/UsuariosPage').then(m => ({ default: m.UsuariosPage })));
const CredenciamentoLancesPage = lazy(() => import('./pages/CredenciamentoLancesPage').then(m => ({ default: m.CredenciamentoLancesPage })));
const CotaDetalhePage = lazy(() => import('./pages/CotaDetalhePage').then(m => ({ default: m.CotaDetalhePage })));
const AnaliseRiscoPage = lazy(() => import('./pages/AnaliseRiscoPage').then(m => ({ default: m.AnaliseRiscoPage })));
const BensReferenciaPage = lazy(() => import('./pages/BensReferenciaPage').then(m => ({ default: m.BensReferenciaPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de cache padrão (MELHORIA-046)
      gcTime: 1000 * 60 * 15,   // 15 minutos de garbage collection
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
              <Suspense fallback={<LoadingFallback />}>
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
                      
                      {/* Relatórios do BCB / Estatísticas (Protegidos) */}
                      <Route element={<ProtectedRoute allowedAuthorities={['VIEW_RELATORIOS', 'ROLE_ADMIN']} />}>
                        <Route path="/relatorios/estatisticas" element={<RelatorioEstatisticasPage />} />
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
              </Suspense>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}