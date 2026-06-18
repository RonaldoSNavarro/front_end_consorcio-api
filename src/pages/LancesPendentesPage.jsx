import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LancesIcon, InfoIcon, CheckIcon, CrossIcon, AlertIcon, CalendarIcon } from '../components/ui/Icons';

/**
 * ℹ️ NOTA DE DESIGN UI/UX:
 * Este componente representa a tela de gestão do backoffice para Integralização de Lances (ADR 004).
 * Rotas e Permissões de Acesso:
 * - ROTA PROTEGIDA: Exige perfil OPERADOR ou ADMIN (verificado via JWT Security no backend).
 * 
 * Integração de Dados (TanStack Query):
 * - GET /api/lances/pendentes-integralizacao -> Gerenciado por useQuery(['lancesPendentes'])
 * - POST /api/lances/{id}/confirmar-integralizacao -> useMutation
 * - POST /api/lances/{id}/cancelar -> useMutation
 * 
 * Validação de Formulários (React Hook Form + Zod):
 * - O formulário de confirmação de integralização (dentro do modal) é gerenciado por React Hook Form 
 *   e validado contra o Schema Zod `integralizacaoSchema` (descrito abaixo).
 */

// Exemplo do Schema Zod para validação que será integrado pelo Dev:
/*
const integralizacaoSchema = z.object({
  formaPagamento: z.enum(['PIX', 'TED', 'DEPOSITO_IDENTIFICADO'], {
    required_error: "Selecione o meio de pagamento utilizado."
  }),
  codigoAutenticacao: z.string().min(6, "O código de autenticação/comprovante deve ter pelo menos 6 caracteres."),
  dataIntegralizacao: z.string().refine(val => new Date(val) <= new Date(), {
    message: "A data de integralização não pode ser futura."
  }),
  valorPago: z.number().positive("O valor deve ser maior que zero.")
});
*/

// Dados Mockados Estáticos de Exemplo para Visualização Visual e Apresentação
const MOCK_LANCES_PENDENTES = [
  {
    id: 1045,
    cotaId: 302,
    numeroCota: "045",
    grupoCodigo: "GRP-08",
    clienteNome: "Ronaldo S. Navarro",
    clienteCpfCnpj: "123.456.789-00",
    valorOferta: 25000.00,
    percentualOferta: 25.00, // 25% do saldo devedor
    tipoLance: "LIVRE",
    dataApuracao: "2026-06-08T19:00:00Z",
    prazoLimiteIntegralizacao: "2026-06-12T23:59:59Z", // 4 dias úteis restantes
    diasRestantes: 4,
    status: "PENDENTE_INTEGRALIZACAO"
  },
  {
    id: 1046,
    cotaId: 112,
    numeroCota: "112",
    grupoCodigo: "GRP-08",
    clienteNome: "Acme Incorporadora Ltda",
    clienteCpfCnpj: "99.888.777/0001-99",
    valorOferta: 75000.00,
    percentualOferta: 37.50,
    tipoLance: "LIVRE",
    dataApuracao: "2026-06-08T19:00:00Z",
    prazoLimiteIntegralizacao: "2026-06-12T23:59:59Z",
    diasRestantes: 4,
    status: "PENDENTE_INTEGRALIZACAO"
  },
  {
    id: 1049,
    cotaId: 54,
    numeroCota: "054",
    grupoCodigo: "GRP-12",
    clienteNome: "Mariana Costa Silva",
    clienteCpfCnpj: "456.789.123-11",
    valorOferta: 15500.00,
    percentualOferta: 15.50,
    tipoLance: "LIVRE",
    dataApuracao: "2026-06-05T19:00:00Z",
    prazoLimiteIntegralizacao: "2026-06-09T23:59:59Z", // Vence amanhã/hoje
    diasRestantes: 1,
    status: "PENDENTE_INTEGRALIZACAO"
  }
];

export const LancesPendentesPage = () => {
  const { triggerToast } = useToast();
  const [selectedLance, setSelectedLance] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelLanceId, setCancelLanceId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Estados de Apresentação de UI simulados
  const [simulatedState, setSimulatedState] = useState({
    isLoading: false,
    isError: false,
    isEmpty: false,
    data: MOCK_LANCES_PENDENTES
  });

  // Simulação de alteração de estado no mock
  const handleConfirmClick = (lance) => {
    setSelectedLance(lance);
    setShowConfirmModal(true);
  };

  const handleCancelClick = (id) => {
    setCancelLanceId(id);
    setShowCancelModal(true);
  };

  // Simulação de confirmação da integralização pelo operador
  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    triggerToast(`Lance #${selectedLance.id} integralizado com sucesso! Lançamento Contábil de Débito/Crédito efetuado no COSIF. Cota #${selectedLance.numeroCota} enviada para análise de crédito.`, "success");
    
    // Atualiza a lista simulada
    setSimulatedState(prev => ({
      ...prev,
      data: prev.data.filter(l => l.id !== selectedLance.id)
    }));
    setShowConfirmModal(false);
    setSelectedLance(null);
  };

  // Simulação de cancelamento do lance
  const handleCancelSubmit = (e) => {
    e.preventDefault();
    triggerToast(`Lance #${cancelLanceId} cancelado. Contemplação revogada. O motor de apuração irá convocar o próximo lance classificado da assembleia na data oportuna.`, "warning");
    
    // Atualiza a lista simulada
    setSimulatedState(prev => ({
      ...prev,
      data: prev.data.filter(l => l.id !== cancelLanceId)
    }));
    setShowCancelModal(false);
    setCancelLanceId(null);
  };

  return (
    <div className="view-container animate-fade-in text-slate-100 font-sans">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="header-title">
          <h2 className="text-2xl font-bold font-title text-amber-500 flex items-center gap-2">
            <LancesIcon size={28} /> Integralização de Lances
          </h2>
          <p className="text-slate-400 text-sm">
            Validação de caixa do backoffice e confirmação de lances livres vencedores no status <code className="text-amber-400 font-mono">PENDENTE_INTEGRALIZACAO</code> (ADR 004).
          </p>
        </div>

        {/* CONTROLES DE SIMULAÇÃO DE ESTADO PARA O DEV */}
        <div className="flex gap-2 bg-slate-800/60 p-2 rounded-lg border border-slate-700/50 text-xs">
          <button 
            onClick={() => setSimulatedState(p => ({ ...p, isLoading: !p.isLoading }))}
            className={`px-2 py-1 rounded ${simulatedState.isLoading ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Toggle Loading
          </button>
          <button 
            onClick={() => setSimulatedState(p => ({ ...p, isError: !p.isError }))}
            className={`px-2 py-1 rounded ${simulatedState.isError ? 'bg-rose-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Toggle Error
          </button>
          <button 
            onClick={() => setSimulatedState(p => ({ ...p, isEmpty: !p.isEmpty }))}
            className={`px-2 py-1 rounded ${simulatedState.isEmpty ? 'bg-amber-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            Toggle Empty
          </button>
        </div>
      </div>

      {/* BANNER INFORMATIVO DE LEI E COMPLIANCE */}
      <div className="mb-6 p-4 rounded-xl border border-blue-500/20 bg-blue-950/20 text-slate-300 text-sm flex gap-3 items-start shadow-md">
        <InfoIcon size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-400 font-semibold block mb-1">Regra de Segurança de Fluxo de Caixa (ADR 004):</strong>
          Para resguardar a integridade financeira do grupo de consórcio contra lances inadimplentes (lances fantasma), as contemplações de lance livre iniciam sob o status <code className="text-amber-400 font-mono">PENDENTE_INTEGRALIZACAO</code>. O cliente dispõe de <strong>2 a 5 dias úteis</strong> para integralizar o valor do lance livre no caixa do grupo. A liberação do crédito só ocorre após a confirmação deste pagamento.
        </div>
      </div>

      {/* ESTADO: CARREGANDO (LOADING SKELETON) */}
      {simulatedState.isLoading && (
        <div className="glass-panel p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-700/50 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-slate-700/30 rounded"></div>
            <div className="h-12 bg-slate-700/30 rounded"></div>
            <div className="h-12 bg-slate-700/30 rounded"></div>
          </div>
          <p className="text-center text-xs text-slate-500">TanStack Query: Obtendo listagem de lances pendentes do backend...</p>
        </div>
      )}

      {/* ESTADO: ERRO (ERROR CARD) */}
      {simulatedState.isError && !simulatedState.isLoading && (
        <div className="border border-rose-500/30 bg-rose-950/25 p-6 rounded-2xl text-center space-y-3">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-lg font-bold text-rose-400">Falha ao Consultar Lances Pendentes</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Houve uma falha ao conectar com o serviço de apuração financeira. Verifique sua conexão ou tente novamente.
          </p>
          <button 
            onClick={() => triggerToast("Refetching data da API...", "info")} 
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Tentar Novamente (Query Refetch)
          </button>
        </div>
      )}

      {/* ESTADO: LISTA VAZIA (EMPTY STATE) */}
      {simulatedState.isEmpty && !simulatedState.isLoading && !simulatedState.isError && (
        <div className="glass-panel p-10 text-center flex flex-col items-center justify-center space-y-4 border-dashed border-slate-700">
          <LancesIcon size={48} className="text-slate-500 opacity-40" />
          <div>
            <h3 className="text-lg font-semibold text-slate-300">Caixa de Entrada Vazia</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-1">
              Não existem lances no status <code className="text-amber-500 font-mono text-xs">PENDENTE_INTEGRALIZACAO</code> aguardando conferência ou liquidação no momento.
            </p>
          </div>
        </div>
      )}

      {/* LISTAGEM DE LANCES PENDENTES */}
      {!simulatedState.isLoading && !simulatedState.isError && !simulatedState.isEmpty && (
        <div className="glass-panel table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>LANCE ID</th>
                <th>GRUPO / COTA</th>
                <th>CLIENTE / CPF-CNPJ</th>
                <th className="text-right">VALOR DO LANCE</th>
                <th>CLASSIFICAÇÃO</th>
                <th>PRAZO LIMITE</th>
                <th className="text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {simulatedState.data.map(lance => {
                const isUrgent = lance.diasRestantes <= 1;
                return (
                  <tr key={lance.id} className="hover:bg-slate-800/20 transition-all border-b border-slate-800/60">
                    <td className="font-mono text-amber-500">#{lance.id}</td>
                    <td>
                      <div className="font-bold text-slate-200">{lance.grupoCodigo}</div>
                      <div className="text-xs text-slate-400">Cota {lance.numeroCota}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-300">{lance.clienteNome}</div>
                      <div className="text-xs text-slate-500 font-mono">{lance.clienteCpfCnpj}</div>
                    </td>
                    <td className="text-right font-semibold text-slate-200">
                      R$ {lance.valorOferta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      <span className="block text-xs font-normal text-slate-500">{lance.percentualOferta}% do devedor</span>
                    </td>
                    <td>
                      <span className="badge badge-info bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                        {lance.tipoLance} - VENCEDOR
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isUrgent ? 'badge-danger bg-rose-500/15 border-rose-500/20 text-rose-400' : 'badge-warning bg-amber-500/15 border-amber-500/20 text-amber-400'} flex items-center gap-1`}>
                        <CalendarIcon size={12} /> {lance.diasRestantes} dia(s) útil(eis)
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-center gap-2 actions-cell">
                        <button
                          onClick={() => handleConfirmClick(lance)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded transition-all flex items-center gap-1 shadow-sm"
                          title="Confirmar pagamento em caixa do lance livre"
                        >
                          <CheckIcon size={12} /> Confirmar Pago
                        </button>
                        <button
                          onClick={() => handleCancelClick(lance.id)}
                          className="px-3 py-1.5 bg-rose-900/40 hover:bg-rose-800 text-rose-300 border border-rose-800/40 font-semibold text-xs rounded transition-all flex items-center gap-1"
                          title="Cancelar Lance Livre e convocar próximo suplente"
                        >
                          <CrossIcon size={12} /> Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-3 text-slate-500 text-xs flex justify-between bg-slate-900/20">
            <span>Listando {simulatedState.data.length} lance(s) pendente(s) de integralização física de caixa.</span>
            <span>Total pendente: R$ {simulatedState.data.reduce((acc, curr) => acc + curr.valorOferta, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE INTEGRALIZAÇÃO (FORMULÁRIO REACT HOOK FORM + ZOD) */}
      {showConfirmModal && selectedLance && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-center p-4 py-8 overflow-y-auto items-start md:items-center">
          <div className="glass-panel max-w-lg w-full p-6 border-slate-700 bg-slate-900/95 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold font-title text-emerald-400 flex items-center gap-2">
                <LancesIcon size={20} /> Confirmar Integralização de Lance
              </h3>
              <button 
                onClick={() => { setShowConfirmModal(false); setSelectedLance(null); }} 
                className="text-slate-400 hover:text-slate-100 flex items-center justify-center p-1 rounded-full hover:bg-slate-800"
              >
                <CrossIcon size={16} />
              </button>
            </div>

            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 text-xs mb-4">
              <div className="grid grid-cols-2 gap-2 text-slate-400">
                <div>Grupo / Cota: <span className="font-semibold text-slate-200">{selectedLance.grupoCodigo} / {selectedLance.numeroCota}</span></div>
                <div>Cliente: <span className="font-semibold text-slate-200">{selectedLance.clienteNome}</span></div>
                <div>Valor Oferta: <span className="font-semibold text-slate-200">R$ {selectedLance.valorOferta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                <div>Tipo Lance: <span className="font-semibold text-slate-200">{selectedLance.tipoLance}</span></div>
              </div>
            </div>

            {/* FORMULÁRIO MOCKADO - INDICA AO DEV QUE SERÁ GERENCIADO PELO REACT-HOOK-FORM */}
            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Meio de Pagamento Contábil *</label>
                <select 
                  required
                  defaultValue="PIX"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded text-sm focus:border-indigo-500 focus:outline-none"
                  // {...register("formaPagamento")}
                >
                  <option value="PIX">PIX (Chave Recebimento Grupo)</option>
                  <option value="TED">TED Bancária</option>
                  <option value="DEPOSITO_IDENTIFICADO">Depósito Identificado (Ledger Caixa)</option>
                </select>
                <span className="text-slate-500 text-[10px] block mt-1">
                  Reverterá 100% para o Fundo Comum do grupo de consórcio.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Data de Integralização *</label>
                  <input 
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded text-sm focus:border-indigo-500"
                    // {...register("dataIntegralizacao")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Valor Integralizado (R$) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    defaultValue={selectedLance.valorOferta}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded text-sm focus:border-indigo-500"
                    // {...register("valorPago")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Código de Autenticação / Comprovante *</label>
                <input 
                  type="text" 
                  required
                  placeholder="EX: PIX937492817349BCB"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded text-sm focus:border-indigo-500 font-mono"
                  // {...register("codigoAutenticacao")}
                />
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-400/90 leading-relaxed flex gap-2 items-start">
                <InfoIcon size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Impacto Contábil COSIF:</strong> Ao confirmar, o sistema gerará um lançamento de partida dobrada debitando a conta de <strong>Disponibilidades do Grupo</strong> e creditando a conta de passivo <strong>Créditos de Consórcios a Liberar (2.1.2.30.10-0)</strong>.
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={() => { setShowConfirmModal(false); setSelectedLance(null); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded"
                >
                  Voltar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow-md"
                >
                  Efetuar Integralização
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CANCELAMENTO COM JUSTIFICATIVA MANDATÓRIA (REACT HOOK FORM + ZOD) */}
      {showCancelModal && cancelLanceId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-center p-4 py-8 overflow-y-auto items-start md:items-center">
          <div className="glass-panel max-w-md w-full p-6 border-slate-700 bg-slate-900/95 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold font-title text-rose-400 flex items-center gap-2">
                <AlertIcon size={20} /> Cancelar Contemplação de Lance
              </h3>
              <button 
                onClick={() => { setShowCancelModal(false); setCancelLanceId(null); }} 
                className="text-slate-400 hover:text-slate-100 flex items-center justify-center p-1 rounded-full hover:bg-slate-800"
              >
                <CrossIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <p className="text-slate-300 text-sm">
                Você está prestes a cancelar a contemplação do Lance <strong className="text-amber-400">#{cancelLanceId}</strong> por falta de integralização.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Motivo do Cancelamento *</label>
                <select 
                  required
                  defaultValue="PRAZO_EXPIRADO"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded text-sm focus:border-rose-500 focus:outline-none"
                >
                  <option value="PRAZO_EXPIRADO">Decurso de prazo (2 a 5 dias úteis sem pagamento)</option>
                  <option value="SOLICITACAO_CLIENTE">Desistência formalizada pelo consorciado</option>
                  <option value="FRAUDE_DOCUMENTAL">Fraude ou erro no processamento da assembleia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Justificativa Detalhada (Mín. 15 caracteres) *</label>
                <textarea 
                  required
                  rows="3"
                  minLength="15"
                  placeholder="Justifique o cancelamento para constar no relatório de auditoria e ata da assembleia..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded text-sm focus:border-rose-500"
                ></textarea>
              </div>

              <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-lg text-[11px] text-rose-400 leading-normal flex gap-2 items-start">
                <AlertIcon size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Aviso legal:</strong> Esta ação é definitiva na assembleia vigente. O lance será marcado como desclassificado e o motor de apuração notificará o suplente da fila de classificação.
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={() => { setShowCancelModal(false); setCancelLanceId(null); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded"
                >
                  Voltar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
