import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const DashboardPage = () => {
  const { triggerToast } = useToast();

  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const cls = await api.clientes.listar(0, 100);
      const clientesList = cls.content || cls;
      const totalClientes = Array.isArray(clientesList) 
        ? clientesList.filter(c => c.statusCliente !== 'INATIVO').length 
        : 0;

      const gps = await api.grupos.listar();
      const gruposList = gps.content || gps;
      const verifiedGpsList = Array.isArray(gruposList) ? gruposList : [];

      let arrecadacaoTotal = 0;
      await Promise.all(
        verifiedGpsList.map(async (g) => {
          try {
            const fin = await api.grupos.obterFinanceiro(g.id);
            const fdata = fin.data || fin;
            arrecadacaoTotal += (fdata.fundoComumArrecadado || 0);
          } catch (e) {}
        })
      );

      const cts = await api.cotas.listar();
      const cotasList = cts.content || cts;
      const totalCotas = Array.isArray(cotasList) 
        ? cotasList.filter(c => c.status === 'ATIVA' || c.status === 'CONTEMPLADA').length 
        : 0;

      return {
        clientes: totalClientes,
        grupos: verifiedGpsList.length,
        cotas: totalCotas,
        arrecadacao: arrecadacaoTotal
      };
    }
  });

  React.useEffect(() => {
    if (isError && error) {
      triggerToast("Erro ao carregar dashboard: " + error.message, "danger");
    }
  }, [isError, error, triggerToast]);

  const statsData = stats || {
    clientes: 0,
    grupos: 0,
    cotas: 0,
    arrecadacao: 0
  };

  return (
    <div className="view-container animate-fade-in">
      <div className="header-title mb-4">
        <h2>📊 Dashboard Operacional</h2>
        <p>Visão Geral do Consórcio</p>
      </div>

      {isLoading ? (
        <div style={{ color: '#fff' }}>Carregando métricas...</div>
      ) : (
        <div className="kpi-grid">
          <div className="glass-panel kpi-card">
            <div className="kpi-icon money">💰</div>
            <div className="kpi-info">
              <p>Arrecadação Fundo Comum</p>
              <h3>R$ {statsData.arrecadacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              <span className="kpi-trend success">Caixa líquido dos grupos</span>
            </div>
          </div>

          <div className="glass-panel kpi-card">
            <div className="kpi-icon active-users">👥</div>
            <div className="kpi-info">
              <p>Clientes Ativos</p>
              <h3>{statsData.clientes}</h3>
              <span className="kpi-trend info">Consorciados validados</span>
            </div>
          </div>

          <div className="glass-panel kpi-card">
            <div className="kpi-icon growth">📈</div>
            <div className="kpi-info">
              <p>Grupos em Andamento</p>
              <h3>{statsData.grupos}</h3>
              <span className="kpi-trend">Grupos constituídos</span>
            </div>
          </div>

          <div className="glass-panel kpi-card">
            <div className="kpi-icon config">🎫</div>
            <div className="kpi-info">
              <p>Cotas Emitidas</p>
              <h3>{statsData.cotas}</h3>
              <span className="kpi-trend success">Cotas ativas ou contempladas</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
