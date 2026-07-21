import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export const AnaliseRiscoPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPropostaId, setSelectedPropostaId] = useState('');
  const [justificativa, setJustificativa] = useState('');

  const { data: propostasData, isLoading } = useQuery({
    queryKey: ['propostas-pendentes-risco'],
    queryFn: () => api.vendas.listarPendentesRisco()
  });

  const propostas = propostasData?.content || propostasData || [];

  const analisarMutation = useMutation({
    mutationFn: ({ id, aprovada, justificativa }) => api.vendas.analisarRisco(id, aprovada, justificativa),
    onSuccess: () => {
      triggerToast("Análise de risco concluída com sucesso!", "success");
      queryClient.invalidateQueries({ queryKey: ['propostas-pendentes-risco'] });
      setModalOpen(false);
      setJustificativa('');
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const handleAprovar = (id) => {
    if (confirm("Confirmar aprovação de risco desta proposta?")) {
      analisarMutation.mutate({ id, aprovada: true });
    }
  };

  const handleReprovarClick = (id) => {
    setSelectedPropostaId(id);
    setJustificativa('');
    setModalOpen(true);
  };

  const handleReprovarSubmit = (e) => {
    e.preventDefault();
    if (!justificativa.trim()) {
      triggerToast("A justificativa é obrigatória para reprovação.", "warning");
      return;
    }
    analisarMutation.mutate({ id: selectedPropostaId, aprovada: false, justificativa });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-7 h-7 text-brand-500" /> Análise de Risco e Compliance
        </h2>
        <p className="text-sm text-slate-400 mt-1">Aprovação ou Reprovação de Propostas baseada em análise de crédito e listas restritivas.</p>
      </div>

      <div className="glass-panel p-5">
        <h3 className="text-base font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-4">
          Propostas Pendentes de Análise
        </h3>

        {isLoading ? (
          <p className="text-slate-400 text-sm text-center py-8">Carregando propostas...</p>
        ) : propostas.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Nenhuma proposta pendente de análise de risco no momento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Nº Proposta</th>
                  <th>Cliente</th>
                  <th>Valor Solicitado</th>
                  <th>Alertas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {propostas.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold text-slate-900 dark:text-white">#{p.numeroProposta}</td>
                    <td>{p.cliente?.nome || p.clienteNome || 'Cliente não informado'}</td>
                    <td className="font-mono text-sm">
                      R$ {p.valorCreditoSolicitado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {p.alertas && p.alertas.length > 0 ? (
                          p.alertas.map((a, i) => (
                            <span key={i} className="badge badge-danger text-[0.65rem]">
                              {a.tipo} - {a.descricao}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs italic">Sem alertas</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAprovar(p.id)}
                          disabled={analisarMutation.isPending}
                          className="btn btn-outline btn-xs !text-emerald-600 dark:!text-emerald-400 !border-emerald-200 dark:!border-emerald-500/30 hover:!bg-emerald-50 dark:hover:!bg-emerald-500/10 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" /> Aprovar
                        </button>
                        <button
                          onClick={() => handleReprovarClick(p.id)}
                          disabled={analisarMutation.isPending}
                          className="btn btn-outline btn-xs !text-rose-600 dark:!text-rose-400 !border-rose-200 dark:!border-rose-500/30 hover:!bg-rose-50 dark:hover:!bg-rose-500/10 flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Reprovar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">Reprovar Proposta</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="sr-only">Fechar</span>
                &times;
              </button>
            </div>
            <form onSubmit={handleReprovarSubmit} className="space-y-4">
              <div className="form-group">
                <label htmlFor="justificativa">Justificativa da Reprovação *</label>
                <textarea
                  id="justificativa"
                  rows="4"
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Descreva o motivo da reprovação..."
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline" disabled={analisarMutation.isPending}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-danger" disabled={analisarMutation.isPending}>
                  Confirmar Reprovação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
