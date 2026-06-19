import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ShieldAlert, RefreshCw, AlertTriangle, CheckCircle, Search, Filter, Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

// Modal de Deliberação
const DeliberacaoModal = ({ alerta, onClose }) => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      novoStatus: 'FALSO_POSITIVO',
      justificativa: ''
    }
  });

  const mutation = useMutation({
    mutationFn: (data) => api.compliance.deliberarAlerta(alerta.alertaId, data),
    onSuccess: () => {
      triggerToast('Alerta deliberado com sucesso.', 'success');
      queryClient.invalidateQueries({ queryKey: ['alertasCompliance'] });
      onClose();
    },
    onError: (err) => triggerToast(err.message, 'danger')
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="w-full max-w-lg mx-4 p-6 rounded-2xl animate-scale-up
                   bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60
                   shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-500" />
            Deliberar Alerta #{alerta.alertaId}
          </h3>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 space-y-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <p><strong className="text-slate-800 dark:text-slate-200">Cliente:</strong> {alerta.nomeCliente} ({alerta.cpfCnpj})</p>
          <p><strong className="text-slate-800 dark:text-slate-200">Encontrado na Lista ({alerta.origemLista}):</strong> {alerta.nomeEncontradoLista}</p>
          <p><strong className="text-slate-800 dark:text-slate-200">Score de Similaridade:</strong> {(alerta.scoreSimilaridade * 100).toFixed(0)}%</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label htmlFor="novoStatus">Veredito *</label>
            <select id="novoStatus" {...register('novoStatus', { required: true })}>
              <option value="FALSO_POSITIVO">FALSO POSITIVO (Liberar Cliente)</option>
              <option value="CONFIRMADO">SUSPEITA CONFIRMADA (Bloquear)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="justificativa">Justificativa *</label>
            <textarea 
              id="justificativa" 
              rows="4" 
              {...register('justificativa', { required: "Justificativa é obrigatória", minLength: { value: 10, message: "Mínimo de 10 caracteres." } })}
              placeholder="Descreva a base legal e as evidências para esta deliberação..."
            ></textarea>
            {errors.justificativa && <span className="text-xs text-rose-500 mt-1">{errors.justificativa.message}</span>}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/50">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mutation.isPending ? 'Processando...' : 'Confirmar Deliberação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CompliancePainelPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const [alertaSelecionado, setAlertaSelecionado] = useState(null);

  const [filtroStatus, setFiltroStatus] = useState('PENDENTE_ANALISE');
  const [filtroOrigem, setFiltroOrigem] = useState('');

  const { data: alertasData, isLoading, error } = useQuery({
    queryKey: ['alertasCompliance', filtroStatus, filtroOrigem],
    queryFn: () => api.compliance.listarAlertas(filtroStatus, filtroOrigem)
  });

  const alertas = alertasData?.content || alertasData || [];

  const syncMutation = useMutation({
    mutationFn: () => api.compliance.sincronizar(),
    onSuccess: () => {
      triggerToast('Sincronização iniciada em background com sucesso.', 'success');
      // Força refetch após 2 segundos pra ver se chegou algo
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['alertasCompliance'] });
      }, 2000);
    },
    onError: (err) => triggerToast(err.message, 'danger')
  });

  const handleSincronizar = () => {
    syncMutation.mutate();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDENTE_ANALISE': return <span className="badge badge-warning">Pendente</span>;
      case 'FALSO_POSITIVO': return <span className="badge badge-success">Falso Positivo</span>;
      case 'CONFIRMADO': return <span className="badge badge-danger">Confirmado</span>;
      default: return <span className="badge bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Gestão de Alertas PLD/FT
          </h2>
          <p className="text-sm text-slate-400 mt-1">Listas Restritivas (ONU, OFAC, PEP)</p>
        </div>
        <button 
          className="btn btn-outline" 
          onClick={handleSincronizar}
          disabled={syncMutation.isPending}
        >
          {syncMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Sincronizar Bases
        </button>
      </div>

      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center bg-slate-50/50 dark:bg-slate-900/20 border-b-0 rounded-b-none">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Filtros:</span>
        </div>
        
        <select 
          className="form-input text-sm py-1.5 min-w-[200px]" 
          value={filtroStatus} 
          onChange={e => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os Status</option>
          <option value="PENDENTE_ANALISE">Pendentes de Análise</option>
          <option value="FALSO_POSITIVO">Falsos Positivos</option>
          <option value="CONFIRMADO">Confirmados</option>
        </select>

        <select 
          className="form-input text-sm py-1.5 min-w-[200px]" 
          value={filtroOrigem} 
          onChange={e => setFiltroOrigem(e.target.value)}
        >
          <option value="">Todas as Listas</option>
          <option value="OFAC">OFAC (EUA)</option>
          <option value="ONU">ONU</option>
          <option value="PEP">PEP (Portal Transparência)</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3 mt-0">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          Erro ao carregar alertas: {error.message}
        </div>
      ) : (
        <div className="glass-panel table-container mt-0 rounded-t-none border-t-0">
          <table>
            <thead>
              <tr>
                <th>ID Alerta</th>
                <th>Cliente</th>
                <th>Origem</th>
                <th>Nome na Lista</th>
                <th>Match</th>
                <th>Status</th>
                <th>Data Detecção</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(alertas) && alertas.map(a => (
                <tr key={a.alertaId}>
                  <td className="font-mono text-xs text-slate-400">#{a.alertaId}</td>
                  <td className="font-semibold text-slate-900 dark:text-white">
                    <div>{a.nomeCliente}</div>
                    <div className="font-mono text-[10px] text-slate-400">{a.cpfCnpj}</div>
                  </td>
                  <td><span className="badge bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-bold">{a.origemLista}</span></td>
                  <td className="text-sm font-medium text-amber-700 dark:text-amber-500">{a.nomeEncontradoLista}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${a.scoreSimilaridade >= 0.95 ? 'bg-rose-500' : 'bg-amber-500'}`} 
                          style={{ width: `${a.scoreSimilaridade * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {(a.scoreSimilaridade * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td>{getStatusBadge(a.status)}</td>
                  <td className="text-xs text-slate-500">{new Date(a.dataDeteccao).toLocaleString('pt-BR')}</td>
                  <td>
                    {a.status === 'PENDENTE_ANALISE' && (
                      <button 
                        className="btn btn-primary btn-xs"
                        onClick={() => setAlertaSelecionado(a)}
                      >
                        Deliberar
                      </button>
                    )}
                    {a.status !== 'PENDENTE_ANALISE' && (
                      <span className="text-xs text-slate-400 px-2">Analisado</span>
                    )}
                  </td>
                </tr>
              ))}
              {alertas.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-3 opacity-50" />
                    <p className="text-lg font-semibold">Nenhum alerta encontrado</p>
                    <p className="text-sm mt-1">Sua base de clientes não possui correspondências nestes filtros.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {alertaSelecionado && (
        <DeliberacaoModal 
          alerta={alertaSelecionado} 
          onClose={() => setAlertaSelecionado(null)} 
        />
      )}
    </div>
  );
};
