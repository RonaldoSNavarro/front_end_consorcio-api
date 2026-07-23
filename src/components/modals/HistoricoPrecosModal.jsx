import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { History, X, AlertCircle } from 'lucide-react';

export const HistoricoPrecosModal = ({ bem, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const { data: historico = [], isLoading, error } = useQuery({
    queryKey: ['historicoBens', bem?.id],
    queryFn: () => api.bens.obterHistorico(bem.id),
    enabled: !!bem?.id
  });

  const origemBadge = (origem) => {
    switch (origem) {
      case 'FIPE':
        return <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">FIPE Official</span>;
      case 'INCC':
        return <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">INCC / IGPM</span>;
      case 'CADASTRO_INICIAL':
        return <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">Cadastro Inicial</span>;
      default:
        return <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-700/50">Manual</span>;
    }
  };

  const modalContent = (
    <div className="modal-backdrop flex items-center justify-center p-4 sm:p-6 z-[9999]" onClick={onClose}>
      <div 
        className="w-full max-w-2xl mx-auto p-5 sm:p-6 rounded-2xl animate-scale-up
                   bg-white dark:bg-slate-800 
                   border border-slate-200 dark:border-slate-700/60
                   shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-brand-500" />
              Histórico de Reajustes e Valores
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{bem?.descricao}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg" aria-label="Fechar"><X className="w-4 h-4" /></button>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-4">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 text-rose-600 text-xs flex gap-2 items-center">
            <AlertCircle className="w-4 h-4 shrink-0" /> Erro ao carregar histórico: {error.message}
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="text-left">Data do Reajuste</th>
                  <th className="text-right">Valor Anterior</th>
                  <th className="text-right">Novo Valor</th>
                  <th className="text-center">Origem</th>
                  <th className="text-center">Código FIPE</th>
                </tr>
              </thead>
              <tbody>
                {historico.map(h => (
                  <tr key={h.id}>
                    <td className="text-left font-mono text-xs text-slate-600 dark:text-slate-300">
                      {h.dataAtualizacao ? new Date(h.dataAtualizacao).toLocaleString('pt-BR') : '—'}
                    </td>
                    <td className="text-right font-mono text-xs text-slate-400">
                      {h.valorAnterior ? `R$ ${Number(h.valorAnterior).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="text-right font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {Number(h.valorNovo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-center">{origemBadge(h.origemReajuste)}</td>
                    <td className="text-center font-mono text-xs text-slate-500">{h.codigoFipe || '—'}</td>
                  </tr>
                ))}
                {historico.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-6 text-slate-400 text-sm">Nenhum histórico registrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-4">
          <button type="button" className="btn btn-outline" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
