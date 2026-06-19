import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Gavel, Info, Check, X, AlertTriangle, CalendarDays, Loader2, Inbox } from 'lucide-react';

const MOCK_LANCES_PENDENTES = [
  { id: 1045, cotaId: 302, numeroCota: "045", grupoCodigo: "GRP-08", clienteNome: "Ronaldo S. Navarro", clienteCpfCnpj: "123.456.789-00", valorOferta: 25000.00, percentualOferta: 25.00, tipoLance: "LIVRE", dataApuracao: "2026-06-08T19:00:00Z", prazoLimiteIntegralizacao: "2026-06-12T23:59:59Z", diasRestantes: 4, status: "PENDENTE_INTEGRALIZACAO" },
  { id: 1046, cotaId: 112, numeroCota: "112", grupoCodigo: "GRP-08", clienteNome: "Acme Incorporadora Ltda", clienteCpfCnpj: "99.888.777/0001-99", valorOferta: 75000.00, percentualOferta: 37.50, tipoLance: "LIVRE", dataApuracao: "2026-06-08T19:00:00Z", prazoLimiteIntegralizacao: "2026-06-12T23:59:59Z", diasRestantes: 4, status: "PENDENTE_INTEGRALIZACAO" },
  { id: 1049, cotaId: 54, numeroCota: "054", grupoCodigo: "GRP-12", clienteNome: "Mariana Costa Silva", clienteCpfCnpj: "456.789.123-11", valorOferta: 15500.00, percentualOferta: 15.50, tipoLance: "LIVRE", dataApuracao: "2026-06-05T19:00:00Z", prazoLimiteIntegralizacao: "2026-06-09T23:59:59Z", diasRestantes: 1, status: "PENDENTE_INTEGRALIZACAO" }
];

export const LancesPendentesPage = () => {
  const { triggerToast } = useToast();
  const [selectedLance, setSelectedLance] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelLanceId, setCancelLanceId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [simulatedState, setSimulatedState] = useState({ isLoading: false, isError: false, isEmpty: false, data: MOCK_LANCES_PENDENTES });

  const handleConfirmClick = (lance) => { setSelectedLance(lance); setShowConfirmModal(true); };
  const handleCancelClick = (id) => { setCancelLanceId(id); setShowCancelModal(true); };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    triggerToast(`Lance #${selectedLance.id} integralizado com sucesso! Lançamento Contábil no COSIF. Cota enviada para análise de crédito.`, "success");
    setSimulatedState(prev => ({ ...prev, data: prev.data.filter(l => l.id !== selectedLance.id) }));
    setShowConfirmModal(false); setSelectedLance(null);
  };

  const handleCancelSubmit = (e) => {
    e.preventDefault();
    triggerToast(`Lance #${cancelLanceId} cancelado. Contemplação revogada. Próximo classificado convocado.`, "warning");
    setSimulatedState(prev => ({ ...prev, data: prev.data.filter(l => l.id !== cancelLanceId) }));
    setShowCancelModal(false); setCancelLanceId(null);
  };

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

        {/* CONTROLES DE SIMULAÇÃO */}
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700/50 text-xs">
          <button onClick={() => setSimulatedState(p => ({ ...p, isLoading: !p.isLoading }))} className={`px-2 py-1 rounded transition-colors ${simulatedState.isLoading ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>Toggle Loading</button>
          <button onClick={() => setSimulatedState(p => ({ ...p, isError: !p.isError }))} className={`px-2 py-1 rounded transition-colors ${simulatedState.isError ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>Toggle Error</button>
          <button onClick={() => setSimulatedState(p => ({ ...p, isEmpty: !p.isEmpty }))} className={`px-2 py-1 rounded transition-colors ${simulatedState.isEmpty ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>Toggle Empty</button>
        </div>
      </div>

      {/* BANNER INFORMATIVO */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 text-sm flex gap-3 items-start">
        <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-blue-700 dark:text-blue-300">
          <strong className="block mb-1">Regra de Segurança de Fluxo de Caixa (ADR 004):</strong>
          Para resguardar a integridade financeira do grupo de consórcio contra lances inadimplentes (lances fantasma), as contemplações de lance livre iniciam sob o status <code className="text-brand-600 dark:text-brand-400 font-mono">PENDENTE_INTEGRALIZACAO</code>. O cliente dispõe de <strong>2 a 5 dias úteis</strong> para integralizar o valor do lance livre no caixa do grupo.
        </div>
      </div>

      {/* ESTADO: CARREGANDO */}
      {simulatedState.isLoading && (
        <div className="glass-panel p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700/50 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700/30 rounded"></div>)}
          </div>
          <p className="text-center text-xs text-slate-500">TanStack Query: Obtendo listagem...</p>
        </div>
      )}

      {/* ESTADO: ERRO */}
      {simulatedState.isError && !simulatedState.isLoading && (
        <div className="border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/25 p-6 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-lg font-title font-bold text-rose-600 dark:text-rose-400">Falha ao Consultar Lances Pendentes</h3>
          <p className="text-rose-700 dark:text-slate-400 text-sm max-w-md mx-auto">Houve uma falha ao conectar com o serviço de apuração financeira.</p>
          <button onClick={() => triggerToast("Refetching data da API...", "info")} className="btn btn-primary bg-rose-600 hover:bg-rose-500 !border-none">Tentar Novamente</button>
        </div>
      )}

      {/* ESTADO: LISTA VAZIA */}
      {simulatedState.isEmpty && !simulatedState.isLoading && !simulatedState.isError && (
        <div className="glass-panel p-10 text-center flex flex-col items-center justify-center space-y-4 border-dashed border-2">
          <Inbox className="w-16 h-16 text-slate-300 dark:text-slate-600" />
          <div>
            <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white">Caixa de Entrada Vazia</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-1">Não existem lances no status <code className="text-brand-500 font-mono text-xs">PENDENTE_INTEGRALIZACAO</code> aguardando conferência.</p>
          </div>
        </div>
      )}

      {/* LISTAGEM */}
      {!simulatedState.isLoading && !simulatedState.isError && !simulatedState.isEmpty && (
        <div className="glass-panel table-container">
          <table>
            <thead>
              <tr><th>LANCE ID</th><th>GRUPO / COTA</th><th>CLIENTE / CPF-CNPJ</th><th className="text-right">VALOR DO LANCE</th><th>CLASSIFICAÇÃO</th><th>PRAZO LIMITE</th><th className="text-center">AÇÕES</th></tr>
            </thead>
            <tbody>
              {simulatedState.data.map(lance => {
                const isUrgent = lance.diasRestantes <= 1;
                return (
                  <tr key={lance.id}>
                    <td className="font-mono text-xs text-brand-600 dark:text-brand-400">#{lance.id}</td>
                    <td>
                      <div className="font-bold text-slate-900 dark:text-white">{lance.grupoCodigo}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Cota {lance.numeroCota}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{lance.clienteNome}</div>
                      <div className="text-xs font-mono text-slate-500">{lance.clienteCpfCnpj}</div>
                    </td>
                    <td className="text-right font-semibold text-slate-900 dark:text-white">
                      R$ {lance.valorOferta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <span className="block text-xs font-normal text-slate-500">{lance.percentualOferta}% do devedor</span>
                    </td>
                    <td><span className="badge badge-info">{lance.tipoLance} - VENCEDOR</span></td>
                    <td>
                      <span className={`badge ${isUrgent ? 'badge-danger' : 'badge-warning'} flex items-center gap-1`}>
                        <CalendarDays className="w-3 h-3" /> {lance.diasRestantes} dia(s) útil(eis)
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleConfirmClick(lance)} className="btn btn-outline btn-xs !text-emerald-600 dark:!text-emerald-400 !border-emerald-200 dark:!border-emerald-500/30 hover:!bg-emerald-50 dark:hover:!bg-emerald-500/10 flex items-center gap-1" title="Confirmar pagamento em caixa do lance livre">
                          <Check className="w-3.5 h-3.5" /> Confirmar
                        </button>
                        <button onClick={() => handleCancelClick(lance.id)} className="btn btn-outline btn-xs !text-rose-600 dark:!text-rose-400 !border-rose-200 dark:!border-rose-500/30 hover:!bg-rose-50 dark:hover:!bg-rose-500/10 flex items-center gap-1" title="Cancelar Lance Livre e convocar próximo suplente">
                          <X className="w-3.5 h-3.5" /> Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-3 text-slate-500 text-xs flex justify-between bg-slate-50 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-800">
            <span>Listando {simulatedState.data.length} lance(s) pendente(s).</span>
            <span>Total pendente: R$ {simulatedState.data.reduce((acc, curr) => acc + curr.valorOferta, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO */}
      {showConfirmModal && selectedLance && (
        <div className="modal-backdrop" onClick={() => { setShowConfirmModal(false); setSelectedLance(null); }}>
          <div className="w-full max-w-lg mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-title font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Check className="w-5 h-5" /> Confirmar Integralização
              </h3>
              <button onClick={() => { setShowConfirmModal(false); setSelectedLance(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 text-xs mb-4">
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                <div>Grupo / Cota: <span className="font-semibold text-slate-900 dark:text-white">{selectedLance.grupoCodigo} / {selectedLance.numeroCota}</span></div>
                <div>Cliente: <span className="font-semibold text-slate-900 dark:text-white">{selectedLance.clienteNome}</span></div>
                <div>Valor Oferta: <span className="font-semibold text-slate-900 dark:text-white">R$ {selectedLance.valorOferta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                <div>Tipo Lance: <span className="font-semibold text-slate-900 dark:text-white">{selectedLance.tipoLance}</span></div>
              </div>
            </div>

            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div className="form-group">
                <label>Meio de Pagamento Contábil *</label>
                <select required defaultValue="PIX">
                  <option value="PIX">PIX (Chave Recebimento Grupo)</option>
                  <option value="TED">TED Bancária</option>
                  <option value="DEPOSITO_IDENTIFICADO">Depósito Identificado (Ledger Caixa)</option>
                </select>
                <span className="text-slate-500 text-[10px] block mt-1">Reverterá 100% para o Fundo Comum do grupo de consórcio.</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Data de Integralização *</label>
                  <input type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label>Valor Integralizado (R$) *</label>
                  <input type="number" step="0.01" required defaultValue={selectedLance.valorOferta} />
                </div>
              </div>
              <div className="form-group">
                <label>Código de Autenticação / Comprovante *</label>
                <input type="text" required placeholder="EX: PIX937492817349BCB" className="font-mono" />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-400 flex gap-2 items-start">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div><strong>Impacto Contábil COSIF:</strong> Ao confirmar, o sistema gerará um lançamento de partida dobrada debitando a conta de <strong>Disponibilidades do Grupo</strong> e creditando a conta de passivo <strong>Créditos de Consórcios a Liberar (2.1.2.30.10-0)</strong>.</div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => { setShowConfirmModal(false); setSelectedLance(null); }} className="btn btn-outline">Voltar</button>
                <button type="submit" className="btn btn-primary !bg-emerald-600 hover:!bg-emerald-500 !border-none">Efetuar Integralização</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CANCELAMENTO */}
      {showCancelModal && cancelLanceId && (
        <div className="modal-backdrop" onClick={() => { setShowCancelModal(false); setCancelLanceId(null); }}>
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-title font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Cancelar Contemplação
              </h3>
              <button onClick={() => { setShowCancelModal(false); setCancelLanceId(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300 text-sm">Você está prestes a cancelar a contemplação do Lance <strong className="text-brand-600 dark:text-brand-400">#{cancelLanceId}</strong> por falta de integralização.</p>

              <div className="form-group">
                <label>Motivo do Cancelamento *</label>
                <select required defaultValue="PRAZO_EXPIRADO">
                  <option value="PRAZO_EXPIRADO">Decurso de prazo (2 a 5 dias úteis sem pagamento)</option>
                  <option value="SOLICITACAO_CLIENTE">Desistência formalizada pelo consorciado</option>
                  <option value="FRAUDE_DOCUMENTAL">Fraude ou erro no processamento da assembleia</option>
                </select>
              </div>
              <div className="form-group">
                <label>Justificativa Detalhada (Mín. 15 caracteres) *</label>
                <textarea required rows="3" minLength="15" placeholder="Justifique o cancelamento para constar no relatório..."></textarea>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg text-xs text-rose-700 dark:text-rose-400 flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div><strong>Aviso legal:</strong> Esta ação é definitiva na assembleia vigente. O lance será marcado como desclassificado e o motor notificará o suplente.</div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => { setShowCancelModal(false); setCancelLanceId(null); }} className="btn btn-outline">Voltar</button>
                <button type="submit" className="btn btn-primary !bg-rose-600 hover:!bg-rose-500 !border-none">Confirmar Cancelamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
