import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Gavel, Info, Check, X, AlertTriangle, CalendarDays, Loader2, Inbox, RefreshCw } from 'lucide-react';
import { TableSkeleton } from '../components/ui/Skeleton';

export const LancesPendentesPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLance, setSelectedLance] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelLanceId, setCancelLanceId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('PRAZO_EXPIRADO');
  const [justificativaCancelamento, setJustificativaCancelamento] = useState('');

  const { data: lancesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['lancesIntegralizacao'],
    queryFn: () => api.contemplacoes.listarPendentesIntegralizacao(),
    refetchInterval: 30000,
  });

  const lances = Array.isArray(lancesData) ? lancesData : (lancesData?.content || []);

  const integralizarMutation = useMutation({
    mutationFn: (id) => api.contemplacoes.confirmarIntegralizacao(id),
    onSuccess: () => {
      triggerToast('Lance integralizado com sucesso! Cota enviada para análise de crédito.', 'success');
      queryClient.invalidateQueries({ queryKey: ['lancesIntegralizacao'] });
      setShowConfirmModal(false);
      setSelectedLance(null);
    },
    onError: (err) => triggerToast(err.message, 'danger'),
  });

  const cancelarMutation = useMutation({
    mutationFn: ({ id, motivo, justificativa }) => api.contemplacoes.cancelar(id, motivo, justificativa),
    onSuccess: () => {
      triggerToast('Contemplação cancelada com sucesso! Lance desclassificado e cota ativa.', 'success');
      queryClient.invalidateQueries({ queryKey: ['lancesIntegralizacao'] });
      setShowCancelModal(false);
      setCancelLanceId(null);
      setJustificativaCancelamento('');
    },
    onError: (err) => triggerToast(err.message, 'danger'),
  });

  const pagarBemMutation = useMutation({
    mutationFn: (id) => api.contemplacoes.pagarBem(id),
    onSuccess: () => {
      triggerToast('Pagamento do bem registrado com sucesso! Crédito liberado para fornecedor/consorciado.', 'success');
      queryClient.invalidateQueries({ queryKey: ['lancesIntegralizacao'] });
    },
    onError: (err) => triggerToast(err.message, 'danger'),
  });

  const handleConfirmClick = (lance) => { setSelectedLance(lance); setShowConfirmModal(true); };
  const handleCancelClick = (id) => { setCancelLanceId(id); setShowCancelModal(true); };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (selectedLance) {
      integralizarMutation.mutate(selectedLance.id);
    }
  };

  const handleCancelSubmit = (e) => {
    e.preventDefault();
    if (cancelLanceId) {
      if (!justificativaCancelamento || justificativaCancelamento.length < 15) {
        triggerToast('A justificativa deve conter no mínimo 15 caracteres.', 'warning');
        return;
      }
      cancelarMutation.mutate({ id: cancelLanceId, motivo: motivoCancelamento, justificativa: justificativaCancelamento });
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDENTE_INTEGRALIZACAO': return <span className="badge bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30">Pendente de Lance</span>;
      case 'AGUARDANDO_ANALISE': return <span className="badge badge-warning">Em Análise de Crédito</span>;
      case 'APROVADO': return <span className="badge badge-success">Crédito Aprovado</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const formatCurrency = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="animate-fade-in space-y-6">

      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Gavel className="w-7 h-7 text-brand-500" /> Integralização de Lances
          </h2>
          <p className="text-sm text-slate-400 mt-1">Validação de caixa e confirmação de lances <code className="text-brand-500 font-mono">PENDENTE_INTEGRALIZACAO</code>.</p>
        </div>
        <button className="btn btn-outline flex items-center gap-2" onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Atualizar
        </button>
      </div>

      {/* BANNER INFORMATIVO */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 text-sm flex gap-3 items-start">
        <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-blue-700 dark:text-blue-300">
          <strong className="block mb-1">Regra de Segurança de Fluxo de Caixa (ADR 004):</strong>
          Para resguardar a integridade financeira do grupo, contemplações de lance livre iniciam sob o status <code className="text-brand-600 dark:text-brand-400 font-mono">PENDENTE_INTEGRALIZACAO</code>. O cliente dispõe de <strong>2 a 5 dias úteis</strong> para integralizar o valor do lance livre.
        </div>
      </div>

      {/* ESTADO: CARREGANDO */}
      {isLoading && (
        <div className="animate-fade-in">
          <TableSkeleton rows={5} columns={8} />
        </div>
      )}

      {/* ESTADO: ERRO */}
      {isError && !isLoading && (
        <div className="border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/25 p-6 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-lg font-title font-bold text-rose-600 dark:text-rose-400">Falha ao Consultar Lances Pendentes</h3>
          <p className="text-rose-700 dark:text-slate-400 text-sm max-w-md mx-auto">Houve uma falha ao conectar com o serviço de apuração financeira.</p>
          <button onClick={() => refetch()} className="btn btn-primary bg-rose-600 hover:bg-rose-500 !border-none">Tentar Novamente</button>
        </div>
      )}

      {/* ESTADO: LISTA VAZIA */}
      {!isLoading && !isError && lances.length === 0 && (
        <div className="glass-panel p-10 text-center flex flex-col items-center justify-center space-y-4 border-dashed border-2">
          <Inbox className="w-16 h-16 text-slate-300 dark:text-slate-600" />
          <div>
            <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white">Caixa de Entrada Vazia</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-1">Não existem lances com status <code className="text-brand-500 font-mono text-xs">PENDENTE_INTEGRALIZACAO</code> aguardando conferência.</p>
          </div>
        </div>
      )}

      {/* LISTAGEM */}
      {!isLoading && !isError && lances.length > 0 && (
        <div className="glass-panel table-container">
          <table>
            <thead>
              <tr>
                <th>CONTEMPLAÇÃO ID</th>
                <th>GRUPO / COTA</th>
                <th>CLIENTE</th>
                <th className="text-right">VALOR DO LANCE</th>
                <th>TIPO</th>
                <th>STATUS</th>
                <th>DATA APURAÇÃO</th>
                <th className="text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {lances.map(lance => (
                <tr key={lance.id}>
                  <td className="font-mono text-xs text-brand-600 dark:text-brand-400">#{lance.id}</td>
                  <td>
                    <div className="font-bold text-slate-900 dark:text-white">{lance.codigoGrupo || `Cota #${lance.cotaId}`}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Cota #{lance.cotaId}</div>
                  </td>
                  <td>
                    <div className="font-semibold text-slate-700 dark:text-slate-300">{lance.nomeCliente || '—'}</div>
                    <div className="text-xs font-mono text-slate-500">{lance.cpfCnpjCliente || ''}</div>
                  </td>
                  <td className="text-right font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(lance.valorLance || lance.valorOferta)}
                  </td>
                  <td><span className="badge badge-info">{lance.tipoContemplacao || 'LANCE_LIVRE'}</span></td>
                  <td>{getStatusBadge(lance.statusCota)}</td>
                  <td className="text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {lance.dataContemplacao ? new Date(lance.dataContemplacao).toLocaleDateString('pt-BR') : '—'}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-center gap-2">
                      {lance.statusCota === 'PENDENTE_INTEGRALIZACAO' && (
                        <>
                          <button
                            onClick={() => handleConfirmClick(lance)}
                            className="btn btn-outline btn-xs !text-emerald-600 dark:!text-emerald-400 !border-emerald-200 dark:!border-emerald-500/30 hover:!bg-emerald-50 dark:hover:!bg-emerald-500/10 flex items-center gap-1"
                            title="Confirmar integralização do lance"
                            disabled={integralizarMutation.isPending}
                          >
                            <Check className="w-3.5 h-3.5" /> Confirmar
                          </button>
                          <button
                            onClick={() => handleCancelClick(lance.id)}
                            className="btn btn-outline btn-xs !text-rose-600 dark:!text-rose-400 !border-rose-200 dark:!border-rose-500/30 hover:!bg-rose-50 dark:hover:!bg-rose-500/10 flex items-center gap-1"
                            title="Cancelar contemplação"
                          >
                            <X className="w-3.5 h-3.5" /> Cancelar
                          </button>
                        </>
                      )}
                      {lance.statusCota === 'APROVADO' && lance.valorCreditoLiberado > 0 && (
                        <button
                          onClick={() => pagarBemMutation.mutate(lance.id)}
                          className="btn btn-primary btn-xs flex items-center gap-1"
                          title="Realizar pagamento do bem e faturamento"
                          disabled={pagarBemMutation.isPending}
                        >
                          {pagarBemMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Pagar Bem
                        </button>
                      )}
                      {lance.statusCota === 'AGUARDANDO_ANALISE' && (
                        <span className="text-[10px] text-slate-400">Aguardando Avaliação</span>
                      )}
                      {lance.valorCreditoLiberado === 0 && lance.statusCota === 'APROVADO' && (
                        <span className="text-[10px] text-emerald-500 font-bold">Bem Quitado</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 text-slate-500 text-xs flex justify-between bg-slate-50 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-800">
            <span>Listando {lances.length} lance(s) pendente(s) de integralização.</span>
            <span>Total pendente: {formatCurrency(lances.reduce((acc, l) => acc + (l.valorLance || l.valorOferta || 0), 0))}</span>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO */}
      {showConfirmModal && selectedLance && (
        <div className="modal-backdrop" onClick={() => { setShowConfirmModal(false); setSelectedLance(null); }}>
          <div className="w-full max-w-lg mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-title font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Check className="w-5 h-5" /> Confirmar Integralização
              </h3>
              <button onClick={() => { setShowConfirmModal(false); setSelectedLance(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 text-xs mb-4">
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                <div>Contemplação: <span className="font-semibold text-slate-900 dark:text-white">#{selectedLance.id}</span></div>
                <div>Cota: <span className="font-semibold text-slate-900 dark:text-white">#{selectedLance.cotaId}</span></div>
                <div>Valor Lance: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(selectedLance.valorLance || selectedLance.valorOferta)}</span></div>
                <div>Tipo: <span className="font-semibold text-slate-900 dark:text-white">{selectedLance.tipoContemplacao || 'LANCE_LIVRE'}</span></div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-400 flex gap-2 items-start mb-4">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div><strong>Impacto Contábil COSIF:</strong> O sistema gerará lançamento de partida dobrada debitando Disponibilidades do Grupo e creditando Créditos de Consórcios a Liberar.</div>
            </div>

            <form onSubmit={handleConfirmSubmit}>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowConfirmModal(false); setSelectedLance(null); }} className="btn btn-outline" disabled={integralizarMutation.isPending}>Voltar</button>
                <button type="submit" className="btn btn-primary !bg-emerald-600 hover:!bg-emerald-500 !border-none" disabled={integralizarMutation.isPending}>
                  {integralizarMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {integralizarMutation.isPending ? 'Processando...' : 'Confirmar Integralização'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CANCELAMENTO */}
      {showCancelModal && cancelLanceId && (
        <div className="modal-backdrop" onClick={() => { setShowCancelModal(false); setCancelLanceId(null); }}>
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-title font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Cancelar Contemplação
              </h3>
              <button onClick={() => { setShowCancelModal(false); setCancelLanceId(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300 text-sm">Você está prestes a cancelar a contemplação <strong className="text-brand-600 dark:text-brand-400">#{cancelLanceId}</strong> por falta de integralização.</p>
              <div className="form-group">
                <label>Motivo do Cancelamento *</label>
                <select required value={motivoCancelamento} onChange={e => setMotivoCancelamento(e.target.value)}>
                  <option value="PRAZO_EXPIRADO">Decurso de prazo (2 a 5 dias úteis sem pagamento)</option>
                  <option value="SOLICITACAO_CLIENTE">Desistência formalizada pelo consorciado</option>
                  <option value="FRAUDE_DOCUMENTAL">Fraude ou erro no processamento</option>
                </select>
              </div>
              <div className="form-group">
                <label>Justificativa Detalhada (Mín. 15 caracteres) *</label>
                <textarea required rows="3" minLength="15" value={justificativaCancelamento} onChange={e => setJustificativaCancelamento(e.target.value)} placeholder="Justifique o cancelamento..."></textarea>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg text-xs text-rose-700 dark:text-rose-400 flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div><strong>Aviso:</strong> Esta ação é definitiva. O lance será desclassificado.</div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowCancelModal(false); setCancelLanceId(null); }} className="btn btn-outline" disabled={cancelarMutation.isPending}>Voltar</button>
                <button type="submit" className="btn btn-primary !bg-rose-600 hover:!bg-rose-500 !border-none" disabled={cancelarMutation.isPending}>
                  {cancelarMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {cancelarMutation.isPending ? 'Processando...' : 'Confirmar Cancelamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
