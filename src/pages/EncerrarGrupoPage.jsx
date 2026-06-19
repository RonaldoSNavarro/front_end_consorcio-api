import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Lock, FileText, Clock, DollarSign, AlertTriangle, CheckCircle2, X } from 'lucide-react';

const MOCK_GRUPO = { id: 1, codigo: 'GRP-2024-001', status: 'EM_ANDAMENTO', valorCredito: 150000.00, prazoMeses: 60, taxaAdministracao: 15.0, fundoReserva: 3.0, totalCotas: 50, cotasAtivas: 42, cotasContempladas: 35, cotasCanceladas: 8 };
const MOCK_PRAZO_LEGAL = { dataUltimaAGO: '2026-04-15', prazoMaximoEncerramento: '2026-08-13', diasRestantes: 61, diasTotais: 120 };
const MOCK_SALDOS = { fundoComum: { saldo: 245380.50, contaCosif: '2.1.2.10.10-6', descricao: 'Fundo Comum de Grupos' }, fundoReserva: { saldo: 18450.00, contaCosif: '2.1.2.10.20-3', descricao: 'Fundo de Reserva de Grupos' } };
const MOCK_RESUMO_PDD = { parcelasBaixadas: 23, valorTotalPDD: 34520.00, contaDebitoCosif: '1.6.1.10.00-5', contaDebitoDescricao: 'Provisão para Devedores Duvidosos (PDD)', contaCreditoCosif: '2.1.2.10.10-6', contaCreditoDescricao: 'Fundo Comum de Grupos', valorRNP: 5200.00, contaRNPCosif: '2.4.9.99.00-7', contaRNPDescricao: 'Recursos Não Procurados (RNP)' };

export const EncerrarGrupoPage = () => {
  const { id } = useParams();
  const { triggerToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [isEncerrado, setIsEncerrado] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!id) return <Navigate to="/grupos" replace />;

  const getPrazoIndicator = (diasRestantes) => {
    if (diasRestantes > 60) return { color: 'text-emerald-500', bg: 'bg-emerald-500', badge: 'badge-success', label: 'DENTRO DO PRAZO' };
    if (diasRestantes > 30) return { color: 'text-amber-500', bg: 'bg-amber-500', badge: 'badge-warning', label: 'ATENÇÃO' };
    return { color: 'text-rose-500', bg: 'bg-rose-500', badge: 'badge-danger', label: 'URGENTE' };
  };

  const prazoIndicator = getPrazoIndicator(MOCK_PRAZO_LEGAL.diasRestantes);
  const progressPercent = ((MOCK_PRAZO_LEGAL.diasTotais - MOCK_PRAZO_LEGAL.diasRestantes) / MOCK_PRAZO_LEGAL.diasTotais) * 100;

  const handleEncerrar = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowModal(false);
      setIsEncerrado(true);
      triggerToast('Grupo encerrado com sucesso. Lançamentos PDD e RNP registrados.', 'success');
    }, 1500);
  };

  const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (dateStr) => { const [y, m, d] = dateStr.split('-'); return `${d}/${m}/${y}`; };

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
              <span className="font-title font-bold text-brand-600 dark:text-brand-400">{MOCK_GRUPO.codigo}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Status Atual</span>
              <span className={`badge ${MOCK_GRUPO.status === 'EM_ANDAMENTO' ? 'badge-warning' : 'badge-success'}`}>{MOCK_GRUPO.status.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Crédito</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(MOCK_GRUPO.valorCredito)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Prazo</span>
              <span className="font-medium text-slate-900 dark:text-white">{MOCK_GRUPO.prazoMeses} meses</span>
            </div>
            <div className="flex gap-4 pt-1">
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center border border-slate-200 dark:border-slate-700/50">
                <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Cotas</span>
                <span className="font-bold text-slate-900 dark:text-white">{MOCK_GRUPO.totalCotas}</span>
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center border border-slate-200 dark:border-slate-700/50">
                <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Ativas</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{MOCK_GRUPO.cotasAtivas}</span>
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-center border border-slate-200 dark:border-slate-700/50">
                <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Canc.</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{MOCK_GRUPO.cotasCanceladas}</span>
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
              <span className="font-medium text-slate-900 dark:text-white">{formatDate(MOCK_PRAZO_LEGAL.dataUltimaAGO)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500 dark:text-slate-400">Prazo Máximo (120 dias)</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatDate(MOCK_PRAZO_LEGAL.prazoMaximoEncerramento)}</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-slate-500 dark:text-slate-400">Dias Restantes</span>
              <div className="flex items-center gap-3">
                <span className={`font-title text-2xl font-bold ${prazoIndicator.color}`}>{MOCK_PRAZO_LEGAL.diasRestantes}</span>
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
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-500">{MOCK_SALDOS.fundoComum.contaCosif}</span>
            </div>
            <div className="font-title text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(MOCK_SALDOS.fundoComum.saldo)}</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400/70 mt-1">{MOCK_SALDOS.fundoComum.descricao}</div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400/80 uppercase tracking-wider">Fundo de Reserva (FR)</span>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-500">{MOCK_SALDOS.fundoReserva.contaCosif}</span>
            </div>
            <div className="font-title text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(MOCK_SALDOS.fundoReserva.saldo)}</div>
            <div className="text-xs text-blue-700 dark:text-blue-400/70 mt-1">{MOCK_SALDOS.fundoReserva.descricao}</div>
          </div>
        </div>
      </div>

      {/* CARD PÓS-ENCERRAMENTO: Resumo PDD */}
      {isEncerrado && (
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
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lançamentos contábeis gerados automaticamente no encerramento</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Parcelas Baixadas</span>
              <span className="font-title text-2xl font-bold text-rose-600 dark:text-rose-400 block">{MOCK_RESUMO_PDD.parcelasBaixadas}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">parcelas inadimplentes</span>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Valor Total PDD</span>
              <span className="font-title text-xl font-bold text-amber-600 dark:text-amber-400 block">{formatCurrency(MOCK_RESUMO_PDD.valorTotalPDD)}</span>
              <div className="text-[10px] font-mono text-slate-500 mt-2">D: {MOCK_RESUMO_PDD.contaDebitoCosif}<br />C: {MOCK_RESUMO_PDD.contaCreditoCosif}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <span className="block text-xs text-slate-500 dark:text-slate-400 mb-2">Lançamento Contábil</span>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">DÉBITO</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{MOCK_RESUMO_PDD.contaDebitoDescricao}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">CRÉDITO</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{MOCK_RESUMO_PDD.contaCreditoDescricao}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <span className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Recursos Não Procurados</span>
              <span className="font-title text-xl font-bold text-brand-600 dark:text-brand-400 block">{formatCurrency(MOCK_RESUMO_PDD.valorRNP)}</span>
              <div className="text-[10px] font-mono text-slate-500 mt-2">{MOCK_RESUMO_PDD.contaRNPCosif}</div>
              <span className="text-[10px] text-slate-500">{MOCK_RESUMO_PDD.contaRNPDescricao}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => !isProcessing && setShowModal(false)}>
          <div className="w-full max-w-lg mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
              <h3 className="font-title text-xl font-bold text-rose-600 dark:text-rose-400">Confirmar Encerramento de Grupo</h3>
            </div>

            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 mb-6 text-sm text-rose-900 dark:text-rose-200">
              <p className="font-semibold mb-2">Atenção: Esta ação é irreversível e executará:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Baixa de {MOCK_RESUMO_PDD.parcelasBaixadas} parcelas inadimplentes para PDD</li>
                <li>Transferência de {formatCurrency(MOCK_RESUMO_PDD.valorRNP)} para conta RNP</li>
                <li>Mudança de status do grupo para <strong>ENCERRADO</strong></li>
                <li>Lançamentos contábeis automáticos no Ledger COSIF</li>
              </ul>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Grupo</span>
                <span className="font-bold text-brand-600 dark:text-brand-400">{MOCK_GRUPO.codigo}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Prazo Legal Restante</span>
                <span className={`font-bold ${prazoIndicator.color}`}>{MOCK_PRAZO_LEGAL.diasRestantes} dias</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button className="btn btn-outline" onClick={() => setShowModal(false)} disabled={isProcessing}>Cancelar</button>
              <button className="btn btn-danger flex items-center gap-2" onClick={handleEncerrar} disabled={isProcessing}>
                <Lock className="w-4 h-4" /> {isProcessing ? 'Processando...' : 'Confirmar Encerramento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
