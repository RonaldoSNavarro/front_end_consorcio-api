import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Wallet, Scale, CircleDot, AlertTriangle } from 'lucide-react';

export const FinanceiroPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCotaId, setSelectedCotaId] = useState('');
  const [dataPagamentoInput, setDataPagamentoInput] = useState(new Date().toISOString().split('T')[0]);

  // Queries
  const { data: cotasData } = useQuery({ queryKey: ['cotas'], queryFn: () => api.cotas.listar() });
  const cotas = cotasData?.content || cotasData || [];

  const { data: parcelasData } = useQuery({
    queryKey: ['parcelas-cota', selectedCotaId],
    queryFn: () => api.parcelas.listarPorCota(selectedCotaId),
    enabled: !!selectedCotaId
  });
  const parcelas = parcelasData?.content || parcelasData || [];

  const { data: inadimplenciaData } = useQuery({
    queryKey: ['inadimplencia-cota', selectedCotaId],
    queryFn: () => api.parcelas.obterInadimplenciaCota(selectedCotaId),
    enabled: !!selectedCotaId
  });
  const inadimplencia = inadimplenciaData?.data || inadimplenciaData || null;

  // Mutations
  const pagarMutation = useMutation({
    mutationFn: ({ id, dataPagamento }) => api.parcelas.pagar(id, dataPagamento),
    onSuccess: () => {
      triggerToast("Pagamento de parcela baixado com sucesso!", "success");
      queryClient.invalidateQueries({ queryKey: ['parcelas-cota', selectedCotaId] });
      queryClient.invalidateQueries({ queryKey: ['inadimplencia-cota', selectedCotaId] });
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const estornarMutation = useMutation({
    mutationFn: (id) => api.parcelas.estornar(id),
    onSuccess: () => {
      triggerToast("Pagamento de parcela estornado com sucesso!", "warning");
      queryClient.invalidateQueries({ queryKey: ['parcelas-cota', selectedCotaId] });
      queryClient.invalidateQueries({ queryKey: ['inadimplencia-cota', selectedCotaId] });
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const handlePagarParcela = (parcelaId) => {
    if (!dataPagamentoInput) { triggerToast("Selecione a data do pagamento.", "warning"); return; }
    pagarMutation.mutate({ id: parcelaId, dataPagamento: dataPagamentoInput });
  };

  const handleEstornarParcela = (parcelaId) => {
    if (confirm("Confirmar estorno deste pagamento? O valor será retirado do fundo de caixa do grupo.")) {
      estornarMutation.mutate(parcelaId);
    }
  };

  const activeCota = cotas.find(c => c.id === Number(selectedCotaId));

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Wallet className="w-7 h-7 text-brand-500" /> Financeiro e Caixa
        </h2>
        <p className="text-sm text-slate-400 mt-1">Operações de Baixa de Parcelas e Estorno Contábil de Cotas.</p>
      </div>

      {/* Banner de Conformidade */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 text-sm flex gap-3 items-start">
        <Scale className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-blue-700 dark:text-blue-300">
          <strong className="block mb-1">Regras de Contabilidade de Grupos (ADR 002):</strong>
          Cada baixa de parcela ou estorno efetua automaticamente lançamentos contábeis de partidas dobradas sob a estrutura do plano de contas <strong>COSIF (BACEN)</strong>.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Coluna Esquerda: Seletor de Cota & Inadimplência */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-base font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 flex items-center gap-2">
              <CircleDot className="w-4 h-4 text-brand-500" /> Cota Consorcial
            </h3>
            <div className="form-group">
              <label htmlFor="select-cota">Selecione a Cota *</label>
              <select id="select-cota" value={selectedCotaId} onChange={(e) => setSelectedCotaId(e.target.value)}>
                <option value="">Selecione uma cota...</option>
                {cotas.map(c => <option key={c.id} value={c.id}>Cota #{c.numeroCota} (Status: {c.status})</option>)}
              </select>
            </div>
            
            {activeCota && (
                <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-lg border border-slate-200 dark:border-slate-700/40 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <div><strong>Status Cota:</strong> <span className={`badge ${activeCota.status === 'ATIVA' ? 'badge-success' : activeCota.status === 'CANCELADA' || activeCota.status === 'EXCLUIDA' ? 'badge-danger' : activeCota.status === 'EM_EXECUCAO' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'badge-neutral'}`}>{activeCota.status}</span></div>
                  <div><strong>Grupo ID:</strong> #{activeCota.grupoId}</div>
                </div>
              )}
          </div>

          {/* Card de Inadimplência */}
          {selectedCotaId && inadimplencia && inadimplencia.quantidadeParcelasAtrasadas > 0 && (
            <div className="border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 p-5 rounded-2xl space-y-3 shadow-sm animate-pulse">
              <h4 className="text-rose-600 dark:text-rose-400 font-bold font-title flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" /> Cota em Atraso
              </h4>
              <div className="text-xs space-y-1 text-rose-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Parcelas Atrasadas:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{inadimplencia.quantidadeParcelasAtrasadas}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Saldo Devedor Nominal:</span>
                  <span>R$ {inadimplencia.saldoDevedorNominal?.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Multa Acumulada (2%):</span>
                  <span>R$ {inadimplencia.multaAcumulada?.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Juros Mora:</span>
                  <span>R$ {inadimplencia.jurosMoraAcumulado?.toLocaleString('pt-BR')}</span>
                </div>
                <hr className="border-rose-200 dark:border-rose-500/20 my-2" />
                <div className="flex justify-between font-bold text-sm text-rose-900 dark:text-white">
                  <span>Total para Quitação:</span>
                  <span>R$ {inadimplencia.valorTotalParaQuitacao?.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita: Lista de Parcelas */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-5">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-4 gap-2">
              <h3 className="text-base font-title font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-brand-500" /> Carnê / Lista de Parcelas da Cota
              </h3>
              
              {selectedCotaId && (
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <label htmlFor="dataPagamento">Data Efetiva de Pagamento:</label>
                  <input 
                    id="dataPagamento" type="date" value={dataPagamentoInput} onChange={(e) => setDataPagamentoInput(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1 text-slate-900 dark:text-white focus:ring-brand-500"
                  />
                </div>
              )}
            </div>

            {!selectedCotaId ? (
              <p className="text-slate-400 text-sm text-center py-8">Selecione uma cota para visualizar suas parcelas.</p>
            ) : parcelas.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Nenhuma parcela gerada para esta cota.</p>
            ) : (
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Nº</th><th>Valor FC</th><th>Valor Taxa</th><th>Valor FR</th><th>Encargos (M/J)</th><th>Vencimento</th><th>Pagamento</th><th>Valor Pago</th><th>Status</th><th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parcelas.map(p => (
                      <tr key={p.id} className={p.status === 'ATRASADA' ? 'bg-rose-50 dark:bg-rose-500/5' : ''}>
                        <td className="font-semibold text-slate-900 dark:text-white">#{p.numeroParcela}</td>
                        <td className="font-mono text-xs">R$ {p.valorFundoComum?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="font-mono text-xs">R$ {p.valorTaxaAdm?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || p.valorTaxaAdministracao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="font-mono text-xs">R$ {p.valorFundoReserva?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="font-mono text-xs text-rose-600 dark:text-rose-400">
                          {(p.valorMulta > 0 || p.valorJuros > 0) ? `R$ ${(p.valorMulta + p.valorJuros).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--'}
                        </td>
                        <td>{new Date((p.vencimento || p.dataVencimento) + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                        <td>{(p.pagamento || p.dataPagamento) ? new Date((p.pagamento || p.dataPagamento) + 'T12:00:00').toLocaleDateString('pt-BR') : '--'}</td>
                        <td className="font-mono text-xs">R$ {p.valorPago ? p.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</td>
                        <td><span className={`badge ${p.status === 'PAGA' ? 'badge-success' : p.status === 'ATRASADA' ? 'badge-danger' : 'badge-neutral'}`}>{p.status}</span></td>
                        <td>
                          {p.status !== 'PAGA' && p.status !== 'BAIXADA' ? (
                            <button className="btn btn-outline btn-xs !text-emerald-600 dark:!text-emerald-400 !border-emerald-200 dark:!border-emerald-500/30 hover:!bg-emerald-50 dark:hover:!bg-emerald-500/10" onClick={() => handlePagarParcela(p.id)} disabled={pagarMutation.isPending}>Baixar</button>
                          ) : p.status === 'PAGA' ? (
                            <button className="btn btn-outline btn-xs !text-rose-600 dark:!text-rose-400 !border-rose-200 dark:!border-rose-500/30 hover:!bg-rose-50 dark:hover:!bg-rose-500/10" onClick={() => handleEstornarParcela(p.id)} disabled={estornarMutation.isPending}>Estornar</button>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Baixada (PDD)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
