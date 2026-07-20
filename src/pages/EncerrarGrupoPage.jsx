import React, { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';
import { Lock, FileText, Clock, DollarSign, AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { TableSkeleton } from '../components/ui/Skeleton';

export const EncerrarGrupoPage = () => {
  const { id } = useParams();
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  
  const [showModal, setShowModal] = useState(false);
  const [encerrarResponse, setEncerrarResponse] = useState(null);

  if (!id) return <Navigate to="/grupos" replace />;

  // 1. Fetch Grupos (para achar o atual)
  const { data: gruposData, isLoading: isLoadingGrupos } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const res = await api.grupos.listar();
      return res.content || [];
    }
  });

  // 2. Fetch Cotas do grupo (para contagem)
  const { data: cotasData, isLoading: isLoadingCotas } = useQuery({
    queryKey: ['cotas', id],
    queryFn: () => api.cotas.listarPorGrupo(id)
  });

  // 3. Fetch Assembleias (para achar a dataUltimaAGO)
  const { data: assembleiasData, isLoading: isLoadingAssembleias } = useQuery({
    queryKey: ['assembleias', id],
    queryFn: async () => {
      const res = await api.assembleias.listarPorGrupo(id);
      return res.content || [];
    }
  });

  // 4. Fetch Financeiro
  const { data: financeiroData, isLoading: isLoadingFinanceiro } = useQuery({
    queryKey: ['grupoFinanceiro', id],
    queryFn: async () => {
      const res = await api.grupos.obterFinanceiro(id);
      return res.data || res;
    }
  });

  // Mutation para Encerrar
  const encerrarMutation = useMutation({
    mutationFn: () => api.grupos.encerrar(id),
    onSuccess: (data) => {
      setEncerrarResponse(data);
      setShowModal(false);
      triggerToast('Grupo encerrado com sucesso. Lançamentos PDD e RNP registrados.', 'success');
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
    onError: (err) => {
      triggerToast(err.message, 'danger');
      setShowModal(false);
    }
  });

  // Computed Properties
  const grupo = useMemo(() => gruposData?.find(g => g.id === Number(id)), [gruposData, id]);
  
  const cotasStats = useMemo(() => {
    if (!cotasData) return { total: 0, ativas: 0, canceladas: 0 };
    return {
      total: cotasData.length,
      ativas: cotasData.filter(c => c.status === 'ATIVA' || c.status === 'CONTEMPLADA').length,
      canceladas: cotasData.filter(c => c.status === 'CANCELADA' || c.status === 'INADIMPLENTE').length,
    };
  }, [cotasData]);

  const prazoLegal = useMemo(() => {
    if (!assembleiasData || assembleiasData.length === 0) {
      return { dataUltimaAGO: null, prazoMaximoEncerramento: null, diasRestantes: 120, diasTotais: 120 };
    }
    // Acha a última AGO
    const agos = assembleiasData.filter(a => a.tipo === 'AGO').sort((a, b) => new Date(b.dataAssembleia) - new Date(a.dataAssembleia));
    const ultimaAGO = agos.length > 0 ? agos[0].dataAssembleia : grupo?.dataInauguracao;
    
    if (!ultimaAGO) return { dataUltimaAGO: null, prazoMaximoEncerramento: null, diasRestantes: 120, diasTotais: 120 };

    const dataAGO = new Date(ultimaAGO);
    const prazoMaximo = new Date(dataAGO);
    prazoMaximo.setDate(prazoMaximo.getDate() + 120);
    
    const hoje = new Date();
    const diffTime = Math.max(0, prazoMaximo - hoje);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      dataUltimaAGO: ultimaAGO,
      prazoMaximoEncerramento: prazoMaximo.toISOString().split('T')[0],
      diasRestantes: diffDays,
      diasTotais: 120
    };
  }, [assembleiasData, grupo]);

  const isLoading = isLoadingGrupos || isLoadingCotas || isLoadingAssembleias || isLoadingFinanceiro;

  if (isLoading) {
    return <div className="p-6"><TableSkeleton rows={4} columns={3} /></div>;
  }

  if (!grupo) {
    return (
      <div className="p-6 text-center text-rose-500">
        <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
        <h3 className="font-bold">Grupo não encontrado</h3>
      </div>
    );
  }

  const isEncerrado = grupo.status === 'ENCERRADO' || encerrarResponse != null;

  const getPrazoIndicator = (diasRestantes) => {
    if (diasRestantes > 60) return { color: 'text-emerald-500', bg: 'bg-emerald-500', badge: 'badge-success', label: 'DENTRO DO PRAZO' };
    if (diasRestantes > 30) return { color: 'text-amber-500', bg: 'bg-amber-500', badge: 'badge-warning', label: 'ATENÇÃO' };
    return { color: 'text-rose-500', bg: 'bg-rose-500', badge: 'badge-danger', label: 'URGENTE' };
  };

  const prazoIndicator = getPrazoIndicator(prazoLegal.diasRestantes);
  const progressPercent = Math.min(100, Math.max(0, ((prazoLegal.diasTotais - prazoLegal.diasRestantes) / prazoLegal.diasTotais) * 100));

  const formatCurrency = (val) => Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (dateStr) => { 
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-'); 
    return `${d}/${m}/${y}`; 
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Lock className="w-7 h-7 text-brand-500" /> Encerramento de Grupo
          </h2>
          <p className="text-sm text-slate-400 mt-1">Processo formal de encerramento contábil — ADR 006 / BCB 120 dias</p>
        </div>
        {!isEncerrado && (
          <button className="btn btn-danger flex items-center gap-2" onClick={() => setShowModal(true)}>
            <Lock className="w-4 h-4" /> Encerrar Grupo
          </button>
        )}
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* CARD 1: Pré-Encerramento */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-5">
            <FileText className="w-5 h-5 text-slate-400" />
            <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">Pré-Encerramento</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Código</span>
              <span className="font-title font-bold text-brand-600 dark:text-brand-400">{grupo.codigo}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Status Atual</span>
              <span className={`badge ${grupo.status === 'EM_ANDAMENTO' ? 'badge-warning' : 'badge-success'}`}>{(isEncerrado ? 'ENCERRADO' : grupo.status).replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Crédito</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(grupo.valorCredito)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Prazo</span>
              <span className="font-medium text-slate-900 dark:text-white">{grupo.prazoMeses} meses</span>
            </div>
            <div className="flex gap-4 pt-1">
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center border border-slate-200 dark:border-slate-700/50">
                <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Cotas</span>
                <span className="font-bold text-slate-900 dark:text-white">{cotasStats.total}</span>
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center border border-slate-200 dark:border-slate-700/50">
                <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Ativas</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{cotasStats.ativas}</span>
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center border border-slate-200 dark:border-slate-700/50">
                <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Canc.</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{cotasStats.canceladas}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Análise de Prazo Legal */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-slate-400" />
            <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">Análise de Prazo Legal</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Última AGO</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatDate(prazoLegal.dataUltimaAGO)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Prazo Máximo (120 dias)</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatDate(prazoLegal.prazoMaximoEncerramento)}</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-slate-500 dark:text-slate-400">Dias Restantes</span>
              <div className="flex items-center gap-3">
                <span className={`font-title text-2xl font-bold ${prazoIndicator.color}`}>{prazoLegal.diasRestantes}</span>
                <span className={`badge ${prazoIndicator.badge}`}>{prazoIndicator.label}</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${prazoIndicator.bg} transition-all duration-500 ease-out`} style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>Início</span>
                <span>{Math.round(progressPercent)}% consumido</span>
                <span>Fim (120d)</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Saldos Atuais */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="w-5 h-5 text-slate-400" />
            <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">Saldos Atuais</h3>
          </div>
          
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400/80 uppercase tracking-wider">Fundo Comum (FC)</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-500">2.1.2.10.10-6</span>
            </div>
            <div className="font-title text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(financeiroData?.saldoDisponivelFundoComum)}</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400/70 mt-1">Fundo Comum de Grupos</div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400/80 uppercase tracking-wider">Fundo de Reserva (FR)</span>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-500">2.1.2.10.20-3</span>
            </div>
            <div className="font-title text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(financeiroData?.saldoDisponivelFundoReserva)}</div>
            <div className="text-xs text-blue-700 dark:text-blue-400/70 mt-1">Fundo de Reserva de Grupos</div>
          </div>
        </div>
      </div>

      {/* CARD PÓS-ENCERRAMENTO: Resumo PDD */}
      {isEncerrado && encerrarResponse && (
        <div className="glass-panel p-6 border-amber-200 dark:border-amber-500/30 animate-fade-in relative overflow-hidden">
          <div className="absolute -top-10 -right-10 text-amber-500/10">
            <CheckCircle2 className="w-40 h-40" />
          </div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-title text-lg font-bold text-amber-600 dark:text-amber-400">Resumo PDD — Provisão de Devedores Duvidosos</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lançamentos contábeis gerados automaticamente no encerramento ({formatDate(encerrarResponse.dataEncerramento)})</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Parcelas Baixadas</span>
              <span className="font-title text-2xl font-bold text-rose-600 dark:text-rose-400 block">{encerrarResponse.totalParcelasBaixadas}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">parcelas inadimplentes</span>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Valor Total PDD</span>
              <span className="font-title text-xl font-bold text-amber-600 dark:text-amber-400 block">{formatCurrency(encerrarResponse.valorTotalPDD)}</span>
              <div className="text-[10px] font-mono text-slate-500 mt-2">D: 3.1.8.10.00-1<br />C: 1.6.9.10.00-5</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <span className="block text-xs text-slate-500 dark:text-slate-400 mb-2">Lançamento Contábil</span>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">DÉBITO</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Provisão PDD</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">CRÉDITO</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Valores a Receber</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Recursos Não Procurados</span>
              <span className="font-title text-xl font-bold text-brand-600 dark:text-brand-400 block">{formatCurrency(encerrarResponse.valorTransferidoRNP)}</span>
              <div className="text-[10px] font-mono text-slate-500 mt-2">2.4.9.99.00-7</div>
              <span className="text-[10px] text-slate-500">Recursos Não Procurados (RNP)</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => !encerrarMutation.isPending && setShowModal(false)}>
          <div className="w-full max-w-lg mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
              <h3 className="font-title text-xl font-bold text-rose-600 dark:text-rose-400">Confirmar Encerramento de Grupo</h3>
            </div>

            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 mb-6 text-sm text-rose-900 dark:text-rose-200">
              <p className="font-semibold mb-2">Atenção: Esta ação é irreversível e executará:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Baixa de parcelas inadimplentes para PDD</li>
                <li>Transferência de valores para conta RNP</li>
                <li>Mudança de status do grupo para <strong>ENCERRADO</strong></li>
                <li>Lançamentos contábeis automáticos no Ledger COSIF</li>
              </ul>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Grupo</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">{grupo.codigo}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Prazo Legal Restante</span>
                <span className={`font-bold ${prazoIndicator.color}`}>{prazoLegal.diasRestantes} dias</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button className="btn btn-outline" onClick={() => setShowModal(false)} disabled={encerrarMutation.isPending}>Cancelar</button>
              <button className="btn btn-danger flex items-center gap-2" onClick={() => encerrarMutation.mutate()} disabled={encerrarMutation.isPending}>
                {encerrarMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} 
                {encerrarMutation.isPending ? 'Processando...' : 'Confirmar Encerramento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
