import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Banknote, Users, TrendingUp, CircleHelp } from 'lucide-react';

const KPICard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="glass-panel flex items-center gap-4 p-5 hover:-translate-y-1 transition-all duration-300">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[0.7rem] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">{label}</p>
      <h3 className="font-title text-xl font-bold text-slate-900 dark:text-white mt-0.5 truncate">{value}</h3>
      {trend && <span className="text-xs font-semibold text-emerald-500">{trend}</span>}
    </div>
  </div>
);

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

  const statsData = stats || { clientes: 0, grupos: 0, cotas: 0, arrecadacao: 0 };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Dashboard Operacional
        </h2>
        <p className="text-sm text-slate-400 mt-1">Visão Geral do Consórcio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard 
          icon={Banknote}
          label="Arrecadação Fundo Comum"
          value={`R$ ${statsData.arrecadacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend="Caixa líquido dos grupos"
          color="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          icon={Users}
          label="Clientes Ativos"
          value={statsData.clientes}
          trend="Consorciados validados"
          color="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          icon={TrendingUp}
          label="Grupos em Andamento"
          value={statsData.grupos}
          color="bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/20 text-brand-600 dark:text-brand-400"
        />
        <KPICard 
          icon={CircleHelp}
          label="Cotas Emitidas"
          value={statsData.cotas}
          trend="Cotas ativas ou contempladas"
          color="bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-400"
        />
      </div>
    </div>
  );
};
