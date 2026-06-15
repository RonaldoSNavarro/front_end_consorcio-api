import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Confetti } from './components/Confetti'; // O componente atual

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

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita requests desnecessários ao BCB
      retry: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route path="/grupos" element={<GruposPage />} />
                  <Route path="/cotas" element={<CotasPage />} />
                  <Route path="/assembleias" element={<AssembleiasPage />} />
                  <Route path="/lances-pendentes" element={<LancesPendentesPage />} />
                  <Route path="/reembolsos-excluidos" element={<ReembolsosExcluidosPage />} />
                  <Route path="/financeiro" element={<FinanceiroPage />} />
                  
                  {/* Relatório de Estatísticas (Doc 2080) - Aberto para todos os perfis */}
                  <Route path="/relatorios/estatisticas" element={<RelatorioEstatisticasPage />} />
                  
                  {/* Relatórios do BCB exclusivos para ADMIN e DIRETOR */}
                  <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'DIRETOR']} />}>
                    <Route path="/relatorios/balancete" element={<RelatorioBalancetePage />} />
                    <Route path="/relatorios/pld-ft" element={<RelatorioPldFtPage />} />
                  </Route>

                  {/* Encerramento de Grupo exclusivo para ADMIN */}
                  <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
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
    </QueryClientProvider>
  );
}
