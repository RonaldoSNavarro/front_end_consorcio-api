import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { TrendingUp, X, Loader2, Calculator, CheckCircle, BarChart3 } from 'lucide-react';

export const IndicesEconomicosModal = ({ onClose }) => {
  const { triggerToast } = useToast();
  const [tipoIndice, setTipoIndice] = useState('INCC');
  const [valorSimulacao, setValorSimulacao] = useState('100000');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const { data: historico12m = [], isLoading: loadingHist, error: errHist } = useQuery({
    queryKey: ['indicesBACEN', tipoIndice],
    queryFn: () => api.indices.obterUltimos12Meses(tipoIndice)
  });

  const { data: simulacao, isLoading: loadingSim } = useQuery({
    queryKey: ['simulacaoBACEN', tipoIndice, valorSimulacao],
    queryFn: () => api.indices.simularReajuste(tipoIndice, valorSimulacao),
    enabled: !!valorSimulacao && !isNaN(parseFloat(valorSimulacao)) && parseFloat(valorSimulacao) > 0
  });

  const modalContent = (
    <div className="modal-backdrop flex items-center justify-center p-4 sm:p-6 z-[9999]" onClick={onClose}>
      <div 
        className="w-full max-w-3xl mx-auto p-5 sm:p-6 rounded-2xl animate-scale-up
                   bg-white dark:bg-slate-800 
                   border border-slate-200 dark:border-slate-700/60
                   shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-500" />
              Índices Econômicos BACEN (SGS Oficial)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Séries históricas e cálculo acumulado 12M do Banco Central para reajustes de consórcio</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg" aria-label="Fechar"><X className="w-4 h-4" /></button>
        </div>

        {/* Abas dos Índices */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl mb-6">
          {[
            { id: 'INCC', label: 'INCC-M (Imóveis - FGV)', serie: '192' },
            { id: 'IPCA', label: 'IPCA (Serviços/Móveis - IBGE)', serie: '433' },
            { id: 'IGP_M', label: 'IGP-M (Geral/FGV)', serie: '189' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${tipoIndice === tab.id ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setTipoIndice(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Card de Resumo Acumulado */}
        {simulacao && (
          <div className="p-4 mb-6 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-brand-500/10 dark:to-indigo-500/10 border border-brand-200 dark:border-brand-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-brand-800 dark:text-brand-300 uppercase tracking-wider">
                Variação Acumulada nos Últimos 12 Meses ({tipoIndice})
              </div>
              <div className="text-2xl font-mono font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                {simulacao.percentualAcumulado12Meses >= 0 ? `+${simulacao.percentualAcumulado12Meses}%` : `${simulacao.percentualAcumulado12Meses}%`}
              </div>
              <div className="text-[0.7rem] text-slate-500 mt-1">Fator Multiplicador: {simulacao.fatorReajuste}</div>
            </div>
            <div className="w-full sm:w-auto bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-right">
              <div className="text-xs text-slate-400">Simulação de Crédito:</div>
              <div className="text-sm font-mono text-slate-500 line-through">R$ {Number(simulacao.valorOriginal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">R$ {Number(simulacao.novoValorCalculado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        )}

        {/* Input de Simulação */}
        <div className="form-group mb-6">
          <label htmlFor="sim-valor" className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-brand-500" /> Simular Valor de Crédito (R$)
          </label>
          <input
            id="sim-valor"
            type="number"
            step="0.01"
            className="font-mono text-sm"
            value={valorSimulacao}
            onChange={(e) => setValorSimulacao(e.target.value)}
            placeholder="Ex: 100000"
          />
        </div>

        {/* Tabela dos Últimos 12 Meses */}
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-brand-500" /> Série Mensal dos Últimos 12 Meses (BACEN)
        </h4>

        {loadingHist ? (
          <div className="space-y-2 py-4">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />)}</div>
        ) : errHist ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 text-rose-600 text-xs">
            Erro ao carregar dados da API do BACEN: {errHist.message}
          </div>
        ) : (
          <div className="table-container max-h-60 overflow-y-auto">
            <table>
              <thead>
                <tr>
                  <th className="text-left">Mês / Ano</th>
                  <th className="text-right">Variação Mensal (%)</th>
                  <th className="text-center">Tipo de Índice</th>
                </tr>
              </thead>
              <tbody>
                {historico12m.map((h, idx) => (
                  <tr key={idx}>
                    <td className="text-left font-mono text-xs text-slate-700 dark:text-slate-200">
                      {h.dataReferencia ? new Date(h.dataReferencia).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }) : '—'}
                    </td>
                    <td className={`text-right font-mono text-xs font-bold ${Number(h.valorPercentual) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                      {Number(h.valorPercentual) >= 0 ? `+${h.valorPercentual}%` : `${h.valorPercentual}%`}
                    </td>
                    <td className="text-center font-mono text-xs text-slate-400">{h.tipoIndice}</td>
                  </tr>
                ))}
                {historico12m.length === 0 && (
                  <tr><td colSpan="3" className="text-center py-6 text-slate-400">Nenhum dado retornado para este índice.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-6">
          <button type="button" className="btn btn-outline" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
