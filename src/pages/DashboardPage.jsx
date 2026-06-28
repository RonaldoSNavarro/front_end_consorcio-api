import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Banknote, Users, TrendingUp, Hash, BarChart3, Activity, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton, CardSkeleton } from '../components/ui/Skeleton';

const KPICard = ({ icon: Icon, label, value, trend, color, subValue, staggerClass }) => (
  <div className={`glass-panel flex items-center gap-4 p-5 hover:-translate-y-1.5 transition-all duration-300 animate-stagger-fade-in opacity-0 fill-mode-forwards ${staggerClass}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[0.7rem] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">{label}</p>
      <h3 className="font-title text-2xl font-bold text-slate-900 dark:text-white mt-0.5 truncate tracking-tight">{value}</h3>
      {trend && <span className="text-[0.65rem] font-bold text-emerald-500 uppercase tracking-wide">{trend}</span>}
      {subValue && <span className="text-[0.65rem] text-slate-400 uppercase tracking-wide">{subValue}</span>}
    </div>
  </div>
);

const GrupoBar = ({ grupo, financeiro }) => {
  const total = financeiro?.totalFundoComumArrecadado || 0;
  const saldo = financeiro?.saldoDisponivelFundoComum || 0;
  const liberado = financeiro?.totalCreditosLiberados || 0;
  const maxVal = total > 0 ? total : 1;
  const pctSaldo = Math.min((saldo / maxVal) * 100, 100);
  const pctLiberado = Math.min((liberado / maxVal) * 100, 100);
  const statusColor = grupo.status === 'EM_ANDAMENTO' ? 'bg-emerald-500' : grupo.status === 'EM_FORMACAO' ? 'bg-amber-500' : 'bg-slate-400';

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor}`} />
          <span className="font-mono font-bold text-sm text-slate-700 dark:text-slate-300 truncate">{grupo.codigo}</span>
        </div>
        <span className="text-xs font-semibold text-slate-500 shrink-0">
          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className="relative h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-emerald-200 dark:bg-emerald-500/30 rounded-full transition-all duration-700" style={{ width: `${pctSaldo}%` }} />
        <div className="absolute inset-y-0 left-0 bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${Math.min(pctSaldo, pctLiberado)}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>Saldo FC: R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
        <span>Liberado: R$ {liberado.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
      </div>
    </div>
  );
};

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
      const gruposFinanceiro = [];
      await Promise.all(
        verifiedGpsList.map(async (g) => {
          try {
            const fin = await api.grupos.obterFinanceiro(g.id);
            const fdata = fin.data || fin;
            // FIX: campo correto é totalFundoComumArrecadado
            arrecadacaoTotal += (fdata.totalFundoComumArrecadado || 0);
            gruposFinanceiro.push({ grupo: g, financeiro: fdata });
          } catch (e) {
            gruposFinanceiro.push({ grupo: g, financeiro: null });
          }
        })
      );

      const cts = await api.cotas.listar();
      const cotasList = cts.content || cts;
      const totalCotas = Array.isArray(cotasList)
        ? cotasList.filter(c => c.status === 'ATIVA' || c.status === 'CONTEMPLADA').length
        : 0;

      const gruposAtivos = verifiedGpsList.filter(g => g.status === 'EM_ANDAMENTO').length;
      const gruposFormacao = verifiedGpsList.filter(g => g.status === 'EM_FORMACAO').length;

      return {
        clientes: totalClientes,
        grupos: verifiedGpsList.length,
        gruposAtivos,
        gruposFormacao,
        cotas: totalCotas,
        arrecadacao: arrecadacaoTotal,
        gruposFinanceiro,
      };
    }
  });

  React.useEffect(() => {
    if (isError && error) {
      triggerToast('Erro ao carregar dashboard: ' + error.message, 'danger');
    }
  }, [isError, error, triggerToast]);

  const s = stats || { clientes: 0, grupos: 0, gruposAtivos: 0, gruposFormacao: 0, cotas: 0, arrecadacao: 0, gruposFinanceiro: [] };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Activity className="w-7 h-7 text-brand-500" /> Dashboard Operacional
        </h2>
        <p className="text-sm text-slate-400 mt-1">Visão Geral do Consórcio — dados em tempo real</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard
          icon={Banknote}
          label="Arrecadação Fundo Comum"
          value={`R$ ${s.arrecadacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend="Soma de todos os grupos"
          color="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          staggerClass="animate-stagger-1"
        />
        <KPICard
          icon={Users}
          label="Clientes Ativos"
          value={s.clientes}
          trend="Consorciados validados"
          color="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400"
          staggerClass="animate-stagger-2"
        />
        <KPICard
          icon={TrendingUp}
          label="Grupos em Andamento"
          value={s.gruposAtivos}
          subValue={`${s.gruposFormacao} em formação`}
          color="bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/20 text-brand-600 dark:text-brand-400"
          staggerClass="animate-stagger-3"
        />
        <KPICard
          icon={Hash}
          label="Cotas Emitidas"
          value={s.cotas}
          trend="Ativas ou contempladas"
          color="bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-400"
          staggerClass="animate-stagger-4"
        />
      </div>

      {/* Grupos Financeiro Grid */}
      {s.gruposFinanceiro.length > 0 && (
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-title font-bold text-base text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-500" /> Fundo Comum por Grupo
            </h3>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Em Andamento</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Em Formação</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> Encerrado</span>
            </div>
          </div>
          
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.gruposFinanceiro.map(g => ({
                name: g.grupo.codigo,
                Arrecadado: g.financeiro?.totalFundoComumArrecadado || 0,
                Liberado: g.financeiro?.totalCreditosLiberados || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 10}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="Arrecadado" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Liberado" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {s.gruposFinanceiro.map(({ grupo, financeiro }) => (
              <GrupoBar key={grupo.id} grupo={grupo} financeiro={financeiro} />
            ))}
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="font-title font-bold text-base text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500" /> Resumo de Saúde
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Total de Grupos</span>
              <span className="font-bold text-slate-800 dark:text-white">{s.grupos}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Grupos Ativos</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.gruposAtivos}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Em Formação</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{s.gruposFormacao}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Total de Cotas</span>
              <span className="font-bold text-slate-800 dark:text-white">{s.cotas}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="font-title font-bold text-base text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-brand-500" /> Acesso Rápido
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Cadastrar novo cliente', href: '/clientes', color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Criar novo grupo de consórcio', href: '/grupos', color: 'text-brand-600 dark:text-brand-400' },
              { label: 'Emitir cotas para um grupo', href: '/cotas', color: 'text-violet-600 dark:text-violet-400' },
              { label: 'Agendar assembleia ordinária', href: '/assembleias', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Painel de Compliance PLD/FT', href: '/compliance/alertas', color: 'text-amber-600 dark:text-amber-400' },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${item.color} font-medium`}
              >
                <span className="w-1 h-1 rounded-full bg-current inline-block" />
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
