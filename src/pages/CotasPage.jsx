import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CotaForm } from '../components/forms/CotaForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Plus, XCircle, Calculator, X } from 'lucide-react';
import { TableSkeleton } from '../components/ui/Skeleton';

const cotaStatusBadge = (status) => {
  const map = { 'ATIVA': 'badge-success', 'CONTEMPLADA': 'badge-info', 'CANCELADA': 'badge-danger', 'ENCERRADA': 'badge-neutral' };
  return map[status] || 'badge-neutral';
};

export const CotasPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [cotaCancelarId, setCotaCancelarId] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);

  const { data: cotasData, isLoading, error } = useQuery({
    queryKey: ['cotas'],
    queryFn: () => api.cotas.listar()
  });

  const cotas = cotasData?.content || cotasData || [];

  const cancelarMutation = useMutation({
    mutationFn: (id) => api.cotas.cancelar(id),
    onSuccess: () => {
      triggerToast("Cota Cancelada logicamente e parcelas excluídas.", "warning");
      queryClient.invalidateQueries({ queryKey: ['cotas'] });
      setCotaCancelarId(null);
    },
    onError: (err) => {
      triggerToast(err.message, "danger");
      setCotaCancelarId(null);
    }
  });

  const reembolsarMutation = useMutation({
    mutationFn: (id) => api.cotas.reembolsar(id),
    onSuccess: (res) => {
      setSimulationResult(res);
      triggerToast("Cálculo de reembolso gerado com sucesso!", "success");
      queryClient.invalidateQueries({ queryKey: ['cotas'] });
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  if (error) return <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">Erro: {error.message}</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Emissão & Venda de Cotas</h2>
          <p className="text-sm text-slate-400 mt-1">Vinculação de Clientes a Grupos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Emitir Nova Cota
        </button>
      </div>

      {isLoading ? (
        <div className="animate-fade-in">
          <TableSkeleton rows={5} columns={5} />
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Nº da Cota</th><th>Cliente ID</th><th>Grupo ID</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {Array.isArray(cotas) && cotas.map(c => (
                <tr key={c.id}>
                  <td className="font-semibold text-slate-900 dark:text-white">Cota {c.numeroCota}</td>
                  <td className="text-sm">Ref: {c.clienteId}</td>
                  <td className="text-sm">Grupo: {c.grupoId}</td>
                  <td><span className={`badge ${cotaStatusBadge(c.status)}`}>{c.status}</span></td>
                  <td>
                    <div className="flex gap-1.5">
                      {c.status !== 'CANCELADA' && c.status !== 'ENCERRADA' && (
                        <button className="btn btn-danger btn-xs" onClick={() => setCotaCancelarId(c.id)}>
                          <XCircle className="w-3.5 h-3.5" /> Cancelar
                        </button>
                      )}
                      {c.status === 'CANCELADA' && (
                        <button className="btn btn-outline btn-xs" onClick={() => reembolsarMutation.mutate(c.id)}>
                          <Calculator className="w-3.5 h-3.5" /> Simular Devolução
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <CotaForm onClose={() => setShowModal(false)} />}

      <ConfirmDialog
        isOpen={cotaCancelarId !== null}
        title="Cancelar Cota Consorcial?"
        message="Atenção: Ao cancelar esta cota, as parcelas pendentes futuras serão excluídas de projeções conforme regra BCB."
        type="danger"
        confirmText="Confirmar"
        cancelText="Voltar"
        onConfirm={() => cancelarMutation.mutate(cotaCancelarId)}
        onCancel={() => setCotaCancelarId(null)}
      />

      {simulationResult && (
        <div className="modal-backdrop" onClick={() => setSimulationResult(null)}>
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white">Simulador de Devoluções Rescisórias</h3>
                <p className="text-xs text-slate-400 mt-1">Conformidade com Circular BCB</p>
              </div>
              <button onClick={() => setSimulationResult(null)} className="btn-ghost p-2 rounded-lg" aria-label="Fechar"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-3 my-5">
              <div className="flex justify-between pb-3 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-sm text-slate-400">Cota</span>
                <strong className="text-sm text-slate-900 dark:text-white">nº {simulationResult.numeroCota}</strong>
              </div>
              <div className="flex justify-between pb-3 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-sm text-slate-400">Total Pago ao Fundo Comum</span>
                <strong className="text-sm text-slate-900 dark:text-white">R$ {simulationResult.totalPagoFundoComum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="flex justify-between pb-3 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-sm text-rose-500">Retenção Penal Rescisória (10%)</span>
                <strong className="text-sm text-rose-500">R$ {simulationResult.multaRescisoria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="flex justify-between pt-2 text-base">
                <span className="font-semibold text-slate-900 dark:text-white">Valor Líquido a Reembolsar</span>
                <strong className="text-brand-500">R$ {simulationResult.valorLiquidoAReembolsar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button className="btn btn-primary" onClick={() => setSimulationResult(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
