import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';
import { ReembolsoIcon, InfoIcon, CalculatorIcon, ScaleIcon, CrossIcon, AlertIcon } from '../components/ui/Icons';

/**
 * ℹ️ NOTA DE DESIGN UI/UX:
 * Este componente representa a tela de gestão do backoffice para Processamento de Reembolsos
 * de Cotas Canceladas/Excluídas Contempladas por Sorteio na AGO (ADR 005).
 * 
 * Rotas e Permissões de Acesso:
 * - ROTA PROTEGIDA: Exige perfil GESTOR ou ADMIN para processar pagamentos (gravação), 
 *   e OPERADOR para visualização da listagem e memória de cálculo.
 * 
 * Integração de Dados (TanStack Query):
 * - GET /api/reembolsos/pendentes -> useQuery(['reembolsosPendentes'])
 * - POST /api/reembolsos/{id}/processar-pagamento -> useMutation
 * 
 * Validação de Formulários (React Hook Form + Zod):
 * - O formulário de dados de pagamento de reembolso (dentro do modal) é gerenciado por React Hook Form 
 *   e validado contra o Schema Zod `reembolsoSchema` (descrito abaixo).
 */

// Exemplo do Schema Zod para validação que será integrado pelo Dev:
/*
const reembolsoSchema = z.object({
  bancoCodigo: z.string().min(3, "Código do banco é obrigatório (ex: 341)."),
  agencia: z.string().min(4, "Agência é obrigatória (mín. 4 caracteres)."),
  conta: z.string().min(5, "Conta é obrigatória (mín. 5 caracteres com dígito)."),
  tipoConta: z.enum(['CORRENTE', 'POUPANCA']),
  chavePix: z.string().optional(),
  formaPagamento: z.enum(['PIX', 'TED', 'DOC']),
  comprovanteDocUrl: z.string().url("Faça o upload do termo de quitação assinado pelo cliente.")
});
*/

// Dados Mockados Estáticos de Exemplo para Visualização e Teste Estético
const MOCK_REEMBOLSOS = [
  {
    id: 801,
    cotaNumero: "078",
    grupoCodigo: "GRP-03",
    clienteNome: "Juliana Mendes Ramos",
    clienteCpfCnpj: "402.193.847-12",
    percentualFundoComumPago: 40.00, // Amortizou 40% do Fundo Comum
    valorHistoricoPago: 18000.00, // Valor nominal pago historicamente
    valorBemReferenciaAGO: 60000.00, // Valor atualizado do bem na data da AGO
    dataContemplacaoAGO: "2026-06-08",
    numeroAssembleiaAGO: "AGO-35",
    status: "PENDENTE_PROCESSAMENTO"
  },
  {
    id: 802,
    cotaNumero: "142",
    grupoCodigo: "GRP-03",
    clienteNome: "Auto Posto Aliança Ltda",
    clienteCpfCnpj: "12.345.678/0001-00",
    percentualFundoComumPago: 15.50, // Amortizou 15.5% do Fundo Comum
    valorHistoricoPago: 9300.00,
    valorBemReferenciaAGO: 65000.00,
    dataContemplacaoAGO: "2026-06-08",
    numeroAssembleiaAGO: "AGO-35",
    status: "PENDENTE_PROCESSAMENTO"
  },
  {
    id: 805,
    cotaNumero: "219",
    grupoCodigo: "GRP-05",
    clienteNome: "Marcos Paulo Ferreira",
    clienteCpfCnpj: "089.432.111-50",
    percentualFundoComumPago: 70.00, // Amortizou 70% do Fundo Comum
    valorHistoricoPago: 70000.00,
    valorBemReferenciaAGO: 110000.00,
    dataContemplacaoAGO: "2026-06-02",
    numeroAssembleiaAGO: "AGO-24",
    status: "PENDENTE_PROCESSAMENTO"
  }
];

export const ReembolsosExcluidosPage = () => {
  const { triggerToast } = useToast();
  const [selectedReembolso, setSelectedReembolso] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  
  // Estados de Apresentação de UI simulados para o Dev
  const [simulatedState, setSimulatedState] = useState({
    isLoading: false,
    isError: false,
    isEmpty: false,
    data: MOCK_REEMBOLSOS
  });

  // Funções de Cálculo - Lei 11.795/08 & ADR 005
  const calcularValoresReembolso = (item) => {
    if (!item) return { valorBruto: 0, multa: 0, valorLiquido: 0 };
    
    // Valor Bruto = % Amortizado FC * Valor do Bem na data da AGO
    const valorBruto = (item.percentualFundoComumPago / 100) * item.valorBemReferenciaAGO;
    // Multa penal de 10% rescisória sobre a restituição
    const multa = valorBruto * 0.10;
    // Valor Líquido Final a devolver
    const valorLiquido = valorBruto - multa;
    
    return { valorBruto, multa, valorLiquido };
  };

  const handlePayClick = (reembolso) => {
    setSelectedReembolso(reembolso);
    setShowPayModal(true);
  };

  const handleCalculationClick = (reembolso) => {
    setSelectedReembolso(reembolso);
    setShowCalculationModal(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const { valorLiquido } = calcularValoresReembolso(selectedReembolso);
    
    triggerToast(
      `Reembolso da Cota ${selectedReembolso.cotaNumero} processado com sucesso! ` +
      `Lançamento contábil COSIF efetuado: R$ ${valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} liquidado.`,
      "success"
    );

    // Atualiza a lista simulada
    setSimulatedState(prev => ({
      ...prev,
      data: prev.data.filter(r => r.id !== selectedReembolso.id)
    }));
    setShowPayModal(false);
    setSelectedReembolso(null);
  };

  return (
    <div className="view-container animate-fade-in text-slate-100 font-sans">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="header-title">
          <h2 className="text-2xl font-bold font-title text-amber-500 flex items-center gap-2">
            <ReembolsoIcon size={28} /> Restituições a Excluídos Contemplados
          </h2>
          <p className="text-slate-400 text-sm">
            Cálculo legal e processamento de reembolsos de cotas excluídas/canceladas sorteadas na AGO (ADR 005).
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

      {/* COMPLIANCE ALERT - LEI E ADRS */}
      <div className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-950/15 text-slate-300 text-sm flex gap-3 items-start shadow-md">
        <ScaleIcon size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-400 font-semibold block mb-1">Nota de Compliance Judicial & Regulatório (Art. 30 da Lei 11.795/08):</strong>
          O reembolso de consorciados excluídos/cancelados deve basear-se no percentual amortizado do fundo comum aplicado sobre o valor atualizado do bem de referência <strong>vigente na data da assembleia (AGO) de contemplação por sorteio</strong>, deduzida a multa rescisória de 10% (cláusula penal). É proibida a devolução com base em valores nominais históricos sem reajuste.
        </div>
      </div>

      {/* ESTADO: LOADING SKELETON */}
      {simulatedState.isLoading && (
        <div className="glass-panel p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-700/50 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-slate-700/30 rounded"></div>
            <div className="h-12 bg-slate-700/30 rounded"></div>
            <div className="h-12 bg-slate-700/30 rounded"></div>
          </div>
          <p className="text-center text-xs text-slate-500">Obtendo devoluções pendentes da API...</p>
        </div>
      )}

      {/* ESTADO: ERROR CARD */}
      {simulatedState.isError && !simulatedState.isLoading && (
        <div className="border border-rose-500/30 bg-rose-950/25 p-6 rounded-2xl text-center space-y-3">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-lg font-bold text-rose-400">Erro ao Carregar Lançamentos de Reembolso</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Não foi possível carregar as cotas canceladas contempladas do grupo contábil. Contate a equipe de TI ou tente recarregar.
          </p>
          <button 
            onClick={() => triggerToast("Tentando refetch...", "info")} 
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg"
          >
            Query Refetch
          </button>
        </div>
      )}

      {/* ESTADO: EMPTY STATE */}
      {simulatedState.isEmpty && !simulatedState.isLoading && !simulatedState.isError && (
        <div className="glass-panel p-10 text-center flex flex-col items-center justify-center space-y-4 border-dashed border-slate-700">
          <ReembolsoIcon size={48} className="text-slate-500 opacity-40" />
          <div>
            <h3 className="text-lg font-semibold text-slate-300">Nenhum Reembolso Pendente</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-1">
              Todas as cotas canceladas contempladas no sorteio da AGO já foram processadas ou pagas.
            </p>
          </div>
        </div>
      )}

      {/* TABELA DE REEMBOLSOS */}
      {!simulatedState.isLoading && !simulatedState.isError && !simulatedState.isEmpty && (
        <div className="glass-panel table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>COTA / CLIENTE</th>
                <th>AGO DE APURAÇÃO</th>
                <th>VALOR BEM (AGO)</th>
                <th>% PAGO (FC)</th>
                <th className="text-right">HISTÓRICO PAGO</th>
                <th className="text-right">LÍQUIDO A REEMBOLSAR</th>
                <th className="text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {simulatedState.data.map(item => {
                const { valorLiquido } = calcularValoresReembolso(item);
                return (
                  <tr key={item.id} className="hover:bg-slate-800/20 border-b border-slate-800/60 transition-all">
                    <td>
                      <div className="font-bold text-slate-200">{item.grupoCodigo} / Cota {item.cotaNumero}</div>
                      <div className="text-xs text-slate-400 font-semibold">{item.clienteNome}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.clienteCpfCnpj}</div>
                    </td>
                    <td>
                      <div className="text-xs font-bold text-indigo-400">{item.numeroAssembleiaAGO}</div>
                      <div className="text-[10px] text-slate-500">{new Date(item.dataContemplacaoAGO).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="text-slate-300">
                      R$ {item.valorBemReferenciaAGO.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: `${item.percentualFundoComumPago}%` }}></div>
                        </div>
                        <span className="font-semibold text-xs text-amber-500">{item.percentualFundoComumPago}%</span>
                      </div>
                    </td>
                    <td className="text-right text-slate-400 font-mono text-xs">
                      R$ {item.valorHistoricoPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right text-emerald-400 font-bold font-mono">
                      R$ {valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <div className="flex justify-center gap-2 actions-cell">
                        <button
                          onClick={() => handleCalculationClick(item)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded flex items-center gap-1 border border-slate-700/50"
                          title="Visualizar Memória de Cálculo detalhada"
                        >
                          <CalculatorIcon size={12} /> Memória
                        </button>
                        <button
                          onClick={() => handlePayClick(item)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded flex items-center gap-1 shadow-sm"
                          title="Processar quitação bancária de devolução"
                        >
                          <ReembolsoIcon size={12} /> Pagar Reembolso
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-3 text-slate-500 text-xs flex justify-between bg-slate-900/20">
            <span>Listando {simulatedState.data.length} cotas excluídas com reembolso pendente de liquidação.</span>
            <span>Total a restituir: R$ {simulatedState.data.reduce((acc, curr) => acc + calcularValoresReembolso(curr).valorLiquido, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {/* MODAL 1: MEMÓRIA DE CÁLCULO LEGAL */}
      {showCalculationModal && selectedReembolso && (() => {
        const { valorBruto, multa, valorLiquido } = calcularValoresReembolso(selectedReembolso);
        const diferenca = valorLiquido - selectedReembolso.valorHistoricoPago;
        const isDiferencaPositiva = diferenca > 0;
        
        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-center p-4 py-8 overflow-y-auto items-start md:items-center">
            <div className="glass-panel max-w-lg w-full p-6 border-slate-700 bg-slate-900/95 shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-lg font-bold font-title text-indigo-400 flex items-center gap-2">
                  <CalculatorIcon size={20} /> Memória de Cálculo de Reembolso
                </h3>
                <button 
                  onClick={() => { setShowCalculationModal(false); setSelectedReembolso(null); }} 
                  className="text-slate-400 hover:text-slate-100 flex items-center justify-center p-1 rounded-full hover:bg-slate-800"
                >
                  <CrossIcon size={16} />
                </button>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Cota Excluída: <strong className="text-slate-200">{selectedReembolso.grupoCodigo} / {selectedReembolso.cotaNumero}</strong></div>
                    <div>Cliente: <strong className="text-slate-200">{selectedReembolso.clienteNome}</strong></div>
                    <div>AGO Contemplação: <strong className="text-slate-200">{selectedReembolso.numeroAssembleiaAGO}</strong></div>
                    <div>Data AGO: <strong className="text-slate-200">{new Date(selectedReembolso.dataContemplacaoAGO).toLocaleDateString('pt-BR')}</strong></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-850 py-1">
                    <span>1. Valor do Bem de Referência na Data da AGO</span>
                    <strong className="text-slate-200">R$ {selectedReembolso.valorBemReferenciaAGO.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-850 py-1">
                    <span>2. Percentual de Fundo Comum Pago</span>
                    <strong className="text-amber-500">{selectedReembolso.percentualFundoComumPago.toFixed(2)}%</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-850 py-1 bg-slate-950/30 p-2 rounded">
                    <span className="text-xs font-semibold">3. Valor de Devolução Bruto (Item 1 × Item 2)</span>
                    <strong className="text-slate-100">R$ {valorBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-850 py-1 text-rose-400">
                    <span>4. Multa Penal Rescisória Contratual (10% sobre Bruto)</span>
                    <strong>- R$ {multa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800 py-2 bg-emerald-950/20 p-2 rounded text-base">
                    <span className="font-bold text-emerald-400">5. Saldo Líquido a Restituir (Item 3 - Item 4)</span>
                    <strong className="text-emerald-400 font-mono">R$ {valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>

                {/* COMPARAÇÃO COM HISTÓRICO NOMINAL */}
                <div className="p-3 bg-slate-950/50 rounded-lg text-xs border border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Valor Histórico Nominal Pago (Sem Reajuste):</span>
                    <span>R$ {selectedReembolso.valorHistoricoPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Diferença pelo Reajuste Legal do Bem (Art. 30):</span>
                    <span className={isDiferencaPositiva ? 'text-emerald-400' : 'text-rose-400'}>
                      {isDiferencaPositiva ? '+' : '-'} R$ {Math.abs(diferenca).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 leading-normal flex gap-2 items-start">
                  <InfoIcon size={16} className="text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Regra de Auditoria Fiscal:</strong> O lançamento contábil COSIF registrará a baixa do saldo de devoluções, cobrindo integralmente o débito no Fundo Comum do grupo de consórcio respectivo.
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800 mt-4">
                <button 
                  onClick={() => { setShowCalculationModal(false); setSelectedReembolso(null); }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded shadow-md"
                >
                  Fechar Memória
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: FORMULÁRIO DE PROCESSAMENTO DE REEMBOLSO (REACT HOOK FORM + ZOD) */}
      {showPayModal && selectedReembolso && (() => {
        const { valorLiquido } = calcularValoresReembolso(selectedReembolso);
        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-center p-4 py-8 overflow-y-auto items-start md:items-center">
            <div className="glass-panel max-w-lg w-full p-6 border-slate-700 bg-slate-900/95 shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-lg font-bold font-title text-amber-500 flex items-center gap-2">
                  <ReembolsoIcon size={20} /> Processar Quitação de Devolução (Excluído)
                </h3>
                <button 
                  onClick={() => { setShowPayModal(false); setSelectedReembolso(null); }} 
                  className="text-slate-400 hover:text-slate-100 flex items-center justify-center p-1 rounded-full hover:bg-slate-800"
                >
                  <CrossIcon size={16} />
                </button>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs mb-4 grid grid-cols-2 gap-2 text-slate-400">
                <div>Cota: <span className="text-slate-200 font-semibold">{selectedReembolso.grupoCodigo} / {selectedReembolso.cotaNumero}</span></div>
                <div>Cliente: <span className="text-slate-200 font-semibold">{selectedReembolso.clienteNome}</span></div>
                <div className="col-span-2 text-sm">Total Líquido a Pagar: <span className="text-emerald-400 font-bold font-mono">R$ {valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Forma de Restituição *</label>
                    <select 
                      required
                      defaultValue="PIX"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded text-sm focus:border-amber-500"
                    >
                      <option value="PIX">PIX</option>
                      <option value="TED">TED Bancária</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Tipo de Conta Bancária *</label>
                    <select 
                      required
                      defaultValue="CORRENTE"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded text-sm focus:border-amber-500"
                    >
                      <option value="CORRENTE">Conta Corrente</option>
                      <option value="POUPANCA">Conta Poupança</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Banco (Código/Nome) *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="EX: 341 - Itaú Unibanco"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded text-sm focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Agência Bancária *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="EX: 0910"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded text-sm focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Número da Conta (com dígito) *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="EX: 28472-1"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded text-sm focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Chave PIX (opcional)</label>
                    <input 
                      type="text" 
                      placeholder="CPF, E-mail, Celular ou Aleatória"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded text-sm focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Termo de Quitação Assinado (Simulação de Anexo/Link) *</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required 
                      defaultValue="https://storage.consorcio.com/termos/quitacao-cota-078.pdf"
                      placeholder="URL do documento no Cloud Storage"
                      className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 p-2 rounded text-xs focus:border-amber-500 font-mono"
                    />
                    <button 
                      type="button" 
                      onClick={() => triggerToast("Upload de Termo emulado com sucesso!", "info")}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700"
                    >
                      Anexar
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-lg text-[10px] text-amber-400 leading-normal flex gap-2 items-start">
                  <AlertIcon size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Alerta Contábil (COSIF):</strong> Ao registrar o pagamento, o ledger efetuará partidas dobradas automáticas, debitando a conta de passivo <strong>Excluídos/Cancelados a Restituir (2.1.2.40.20-5)</strong> e creditando a conta de <strong>Disponibilidades Bancárias</strong> correspondente.
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button 
                    type="button"
                    onClick={() => { setShowPayModal(false); setSelectedReembolso(null); }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded shadow-md"
                  >
                    Efetuar Quitação
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
