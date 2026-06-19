import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Undo2, Info, Calculator, Scale, AlertTriangle, Inbox, Check, X } from 'lucide-react';

const MOCK_REEMBOLSOS = [
  { id: 801, cotaNumero: "078", grupoCodigo: "GRP-03", clienteNome: "Juliana Mendes Ramos", clienteCpfCnpj: "402.193.847-12", percentualFundoComumPago: 40.00, valorHistoricoPago: 18000.00, valorBemReferenciaAGO: 60000.00, dataContemplacaoAGO: "2026-06-08", numeroAssembleiaAGO: "AGO-35", status: "PENDENTE_PROCESSAMENTO" },
  { id: 802, cotaNumero: "142", grupoCodigo: "GRP-03", clienteNome: "Auto Posto Aliança Ltda", clienteCpfCnpj: "12.345.678/0001-00", percentualFundoComumPago: 15.50, valorHistoricoPago: 9300.00, valorBemReferenciaAGO: 65000.00, dataContemplacaoAGO: "2026-06-08", numeroAssembleiaAGO: "AGO-35", status: "PENDENTE_PROCESSAMENTO" },
  { id: 805, cotaNumero: "219", grupoCodigo: "GRP-05", clienteNome: "Marcos Paulo Ferreira", clienteCpfCnpj: "089.432.111-50", percentualFundoComumPago: 70.00, valorHistoricoPago: 70000.00, valorBemReferenciaAGO: 110000.00, dataContemplacaoAGO: "2026-06-02", numeroAssembleiaAGO: "AGO-24", status: "PENDENTE_PROCESSAMENTO" }
];

export const ReembolsosExcluidosPage = () => {
  const { triggerToast } = useToast();
  const [selectedReembolso, setSelectedReembolso] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  
  const [simulatedState, setSimulatedState] = useState({ isLoading: false, isError: false, isEmpty: false, data: MOCK_REEMBOLSOS });

  const calcularValoresReembolso = (item) => {
    if (!item) return { valorBruto: 0, multa: 0, valorLiquido: 0 };
    const valorBruto = (item.percentualFundoComumPago / 100) * item.valorBemReferenciaAGO;
    const multa = valorBruto * 0.10;
    const valorLiquido = valorBruto - multa;
    return { valorBruto, multa, valorLiquido };
  };

  const handlePayClick = (reembolso) => { setSelectedReembolso(reembolso); setShowPayModal(true); };
  const handleCalculationClick = (reembolso) => { setSelectedReembolso(reembolso); setShowCalculationModal(true); };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const { valorLiquido } = calcularValoresReembolso(selectedReembolso);
    triggerToast(`Reembolso da Cota ${selectedReembolso.cotaNumero} processado com sucesso! Lançamento COSIF: R$ ${valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} liquidado.`, "success");
    setSimulatedState(prev => ({ ...prev, data: prev.data.filter(r => r.id !== selectedReembolso.id) }));
    setShowPayModal(false); setSelectedReembolso(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Undo2 className="w-7 h-7 text-amber-500" /> Restituições a Excluídos
          </h2>
          <p className="text-sm text-slate-400 mt-1">Cálculo e processamento de reembolsos de cotas canceladas sorteadas na AGO (ADR 005).</p>
        </div>

        {/* CONTROLES MOCK */}
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700/50 text-xs">
          <button onClick={() => setSimulatedState(p => ({ ...p, isLoading: !p.isLoading }))} className={`px-2 py-1 rounded transition-colors ${simulatedState.isLoading ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>Toggle Loading</button>
          <button onClick={() => setSimulatedState(p => ({ ...p, isError: !p.isError }))} className={`px-2 py-1 rounded transition-colors ${simulatedState.isError ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>Toggle Error</button>
          <button onClick={() => setSimulatedState(p => ({ ...p, isEmpty: !p.isEmpty }))} className={`px-2 py-1 rounded transition-colors ${simulatedState.isEmpty ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>Toggle Empty</button>
        </div>
      </div>

      {/* COMPLIANCE ALERT */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-sm flex gap-3 items-start">
        <Scale className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-amber-700 dark:text-amber-300">
          <strong className="block mb-1">Nota de Compliance (Art. 30 da Lei 11.795/08):</strong>
          O reembolso baseia-se no percentual amortizado aplicado sobre o valor atualizado do bem <strong>vigente na data da assembleia</strong>, deduzida a multa de 10%. Proibida a devolução com base em valores nominais sem reajuste.
        </div>
      </div>

      {/* ESTADO: LOADING */}
      {simulatedState.isLoading && (
        <div className="glass-panel p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700/50 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700/30 rounded"></div>)}
          </div>
          <p className="text-center text-xs text-slate-500">Obtendo devoluções pendentes da API...</p>
        </div>
      )}

      {/* ESTADO: ERRO */}
      {simulatedState.isError && !simulatedState.isLoading && (
        <div className="border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/25 p-6 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-lg font-title font-bold text-rose-600 dark:text-rose-400">Erro ao Carregar Reembolsos</h3>
          <p className="text-rose-700 dark:text-slate-400 text-sm max-w-md mx-auto">Não foi possível carregar as cotas canceladas. Tente novamente.</p>
          <button onClick={() => triggerToast("Tentando refetch...", "info")} className="btn btn-primary bg-rose-600 hover:bg-rose-500 !border-none">Query Refetch</button>
        </div>
      )}

      {/* ESTADO: VAZIO */}
      {simulatedState.isEmpty && !simulatedState.isLoading && !simulatedState.isError && (
        <div className="glass-panel p-10 text-center flex flex-col items-center justify-center space-y-4 border-dashed border-2">
          <Inbox className="w-16 h-16 text-slate-300 dark:text-slate-600" />
          <div>
            <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white">Nenhum Reembolso Pendente</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-1">Todas as cotas canceladas contempladas na AGO já foram processadas ou pagas.</p>
          </div>
        </div>
      )}

      {/* LISTAGEM */}
      {!simulatedState.isLoading && !simulatedState.isError && !simulatedState.isEmpty && (
        <div className="glass-panel table-container">
          <table>
            <thead>
              <tr><th>COTA / CLIENTE</th><th>AGO APURAÇÃO</th><th>VALOR BEM (AGO)</th><th>% PAGO</th><th className="text-right">HISTÓRICO PAGO</th><th className="text-right">LÍQUIDO A REEMBOLSAR</th><th className="text-center">AÇÕES</th></tr>
            </thead>
            <tbody>
              {simulatedState.data.map(item => {
                const { valorLiquido } = calcularValoresReembolso(item);
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="font-bold text-slate-900 dark:text-white">{item.grupoCodigo} / Cota {item.cotaNumero}</div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.clienteNome}</div>
                      <div className="text-[10px] font-mono text-slate-500">{item.clienteCpfCnpj}</div>
                    </td>
                    <td>
                      <div className="text-xs font-bold text-brand-600 dark:text-brand-400">{item.numeroAssembleiaAGO}</div>
                      <div className="text-[10px] text-slate-500">{new Date(item.dataContemplacaoAGO).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="text-slate-700 dark:text-slate-300">R$ {item.valorBemReferenciaAGO.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: `${item.percentualFundoComumPago}%` }}></div>
                        </div>
                        <span className="font-semibold text-xs text-amber-600 dark:text-amber-500">{item.percentualFundoComumPago}%</span>
                      </div>
                    </td>
                    <td className="text-right font-mono text-xs text-slate-500">R$ {item.valorHistoricoPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">R$ {valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleCalculationClick(item)} className="btn btn-outline btn-xs flex items-center gap-1" title="Visualizar Memória de Cálculo detalhada">
                          <Calculator className="w-3.5 h-3.5" /> Memória
                        </button>
                        <button onClick={() => handlePayClick(item)} className="btn btn-primary btn-xs !bg-amber-500 hover:!bg-amber-600 !text-slate-900 !border-none flex items-center gap-1" title="Processar quitação bancária">
                          <Undo2 className="w-3.5 h-3.5" /> Pagar Reembolso
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-3 text-slate-500 text-xs flex justify-between bg-slate-50 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-800">
            <span>Listando {simulatedState.data.length} cotas pendentes.</span>
            <span>Total a restituir: R$ {simulatedState.data.reduce((acc, curr) => acc + calcularValoresReembolso(curr).valorLiquido, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {/* MODAL 1: MEMÓRIA DE CÁLCULO */}
      {showCalculationModal && selectedReembolso && (() => {
        const { valorBruto, multa, valorLiquido } = calcularValoresReembolso(selectedReembolso);
        const diferenca = valorLiquido - selectedReembolso.valorHistoricoPago;
        const isDiferencaPositiva = diferenca > 0;
        
        return (
          <div className="modal-backdrop" onClick={() => { setShowCalculationModal(false); setSelectedReembolso(null); }}>
            <div className="w-full max-w-lg mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-lg font-title font-bold text-brand-600 dark:text-brand-400 flex items-center gap-2">
                  <Calculator className="w-5 h-5" /> Memória de Cálculo
                </h3>
                <button onClick={() => { setShowCalculationModal(false); setSelectedReembolso(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div>Cota: <strong className="text-slate-900 dark:text-white">{selectedReembolso.grupoCodigo} / {selectedReembolso.cotaNumero}</strong></div>
                    <div>Cliente: <strong className="text-slate-900 dark:text-white">{selectedReembolso.clienteNome}</strong></div>
                    <div>AGO Contemplação: <strong className="text-slate-900 dark:text-white">{selectedReembolso.numeroAssembleiaAGO}</strong></div>
                    <div>Data AGO: <strong className="text-slate-900 dark:text-white">{new Date(selectedReembolso.dataContemplacaoAGO).toLocaleDateString('pt-BR')}</strong></div>
                  </div>
                </div>

                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 py-1.5">
                    <span>1. Valor do Bem (Data AGO)</span>
                    <strong className="text-slate-900 dark:text-white">R$ {selectedReembolso.valorBemReferenciaAGO.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 py-1.5">
                    <span>2. % Fundo Comum Pago</span>
                    <strong className="text-amber-600 dark:text-amber-500">{selectedReembolso.percentualFundoComumPago.toFixed(2)}%</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 py-2 bg-slate-50 dark:bg-slate-800/30 px-2 rounded">
                    <span className="text-xs font-semibold">3. Valor Bruto (1 × 2)</span>
                    <strong className="text-slate-900 dark:text-white">R$ {valorBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50 py-1.5 text-rose-600 dark:text-rose-400">
                    <span>4. Multa Rescisória (10% s/ Bruto)</span>
                    <strong>- R$ {multa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-emerald-50 dark:bg-emerald-500/10 px-2 rounded text-base border border-emerald-100 dark:border-emerald-500/20">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">5. Saldo Líquido a Restituir</span>
                    <strong className="font-mono text-emerald-700 dark:text-emerald-400">R$ {valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-xs border border-slate-200 dark:border-slate-700/50 space-y-1">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Valor Histórico Nominal Pago:</span>
                    <span>R$ {selectedReembolso.valorHistoricoPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Diferença pelo Reajuste Legal (Art. 30):</span>
                    <span className={`font-semibold ${isDiferencaPositiva ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isDiferencaPositiva ? '+' : '-'} R$ {Math.abs(diferenca).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 items-start text-[11px] text-slate-500 p-2 bg-slate-50 dark:bg-transparent rounded">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div><strong>Auditoria COSIF:</strong> O ledger registrará a baixa cobrindo o débito no Fundo Comum do grupo.</div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
                <button onClick={() => { setShowCalculationModal(false); setSelectedReembolso(null); }} className="btn btn-outline">Fechar Memória</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: FORMULÁRIO DE PAGAMENTO */}
      {showPayModal && selectedReembolso && (() => {
        const { valorLiquido } = calcularValoresReembolso(selectedReembolso);
        return (
          <div className="modal-backdrop" onClick={() => { setShowPayModal(false); setSelectedReembolso(null); }}>
            <div className="w-full max-w-lg mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                <h3 className="text-lg font-title font-bold text-amber-600 dark:text-amber-500 flex items-center gap-2">
                  <Undo2 className="w-5 h-5" /> Quitar Devolução
                </h3>
                <button onClick={() => { setShowPayModal(false); setSelectedReembolso(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 text-xs mb-4 grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                <div>Cota: <span className="font-semibold text-slate-900 dark:text-white">{selectedReembolso.grupoCodigo} / {selectedReembolso.cotaNumero}</span></div>
                <div>Cliente: <span className="font-semibold text-slate-900 dark:text-white">{selectedReembolso.clienteNome}</span></div>
                <div className="col-span-2 text-sm">Total Líquido: <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">R$ {valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Forma de Restituição *</label>
                    <select required defaultValue="PIX"><option value="PIX">PIX</option><option value="TED">TED Bancária</option></select>
                  </div>
                  <div className="form-group">
                    <label>Tipo de Conta *</label>
                    <select required defaultValue="CORRENTE"><option value="CORRENTE">Conta Corrente</option><option value="POUPANCA">Conta Poupança</option></select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 form-group">
                    <label>Banco (Código/Nome) *</label>
                    <input type="text" required placeholder="EX: 341 - Itaú Unibanco" />
                  </div>
                  <div className="form-group">
                    <label>Agência *</label>
                    <input type="text" required placeholder="EX: 0910" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Número da Conta *</label>
                    <input type="text" required placeholder="EX: 28472-1" />
                  </div>
                  <div className="form-group">
                    <label>Chave PIX</label>
                    <input type="text" placeholder="Opcional" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Termo de Quitação *</label>
                  <div className="flex gap-2">
                    <input type="text" required defaultValue="https://storage.consorcio.com/termos.pdf" className="font-mono text-xs" />
                    <button type="button" onClick={() => triggerToast("Upload emulado!", "info")} className="btn btn-outline py-1 px-3 !text-xs">Anexar</button>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-[10px] text-amber-700 dark:text-amber-400 flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div><strong>Alerta COSIF:</strong> O ledger efetuará partidas dobradas automáticas, debitando a conta de passivo <strong>Excluídos a Restituir</strong> e creditando a <strong>Disponibilidades Bancárias</strong>.</div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button type="button" onClick={() => { setShowPayModal(false); setSelectedReembolso(null); }} className="btn btn-outline">Voltar</button>
                  <button type="submit" className="btn btn-primary !bg-amber-500 hover:!bg-amber-600 !text-slate-900 !border-none">Efetuar Quitação</button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
