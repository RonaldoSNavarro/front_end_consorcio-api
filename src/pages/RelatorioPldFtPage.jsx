import React, { useState, useMemo } from 'react';
import { useToast } from '../context/ToastContext';
import { ShieldAlert, Download, Search, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pldFtFiltroSchema } from '../schemas/relatoriosSchema';
import { usePldFtQuery } from '../hooks/useRelatorios';

const ITEMS_PER_PAGE = 20;

export const RelatorioPldFtPage = () => {
  const { triggerToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  const { register, watch, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(pldFtFiltroSchema),
    mode: 'onChange',
    defaultValues: {
      dataInicio: '2026-05-15',
      dataFim: '2026-06-19'
    }
  });

  const dataInicio = watch('dataInicio');
  const dataFim = watch('dataFim');

  const { data: relatorioData = [], isLoading, isError } = usePldFtQuery(dataInicio, dataFim, {
    enabled: isValid && !!dataInicio && !!dataFim
  });

  const totalItems = relatorioData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return relatorioData.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, relatorioData]);

  const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (dateStr) => { 
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };
  const handleExportCSV = () => triggerToast('Exportação CSV do relatório PLD/FT iniciada.', 'info');

  const getRiskBadge = (valor) => {
    // Regra local para inferir risco apenas para exibição
    if (valor >= 100000) return { className: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30', label: 'ALTO' };
    return { className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30', label: 'MÉDIO' };
  };

  const riskCounts = useMemo(() => relatorioData.reduce((acc, item) => { 
    const riskLabel = item.valorOferta >= 100000 ? 'ALTO' : 'MEDIO';
    acc[riskLabel] = (acc[riskLabel] || 0) + 1; 
    return acc; 
  }, {}), [relatorioData]);

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-brand-500" /> Relatório PLD/FT
          </h2>
          <p className="text-sm text-slate-400 mt-1">Monitoramento de Operações Atípicas e Lavagem de Dinheiro</p>
        </div>
        <button className="btn btn-outline flex items-center gap-2" onClick={handleExportCSV}>
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* FILTROS */}
      <div className="glass-panel p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="form-group">
          <label htmlFor="pld-data-inicio">Período Início *</label>
          <input id="pld-data-inicio" type="date" {...register('dataInicio')} className={errors.dataInicio ? 'border-rose-500' : ''} />
          {errors.dataInicio && <span className="text-xs text-rose-500 mt-1">{errors.dataInicio.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="pld-data-fim">Período Fim *</label>
          <input id="pld-data-fim" type="date" {...register('dataFim')} className={errors.dataFim ? 'border-rose-500' : ''} />
          {errors.dataFim && <span className="text-xs text-rose-500 mt-1">{errors.dataFim.message}</span>}
        </div>
        <div className="pt-7">
          {!isValid && (
            <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" /> Ajuste o período
            </div>
          )}
          {isValid && (
            <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Período válido
            </div>
          )}
        </div>
      </div>

      {/* KPIs DE RISCO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <Search className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total de Alertas</p>
            <h3 className="font-title text-2xl font-bold text-slate-700 dark:text-slate-300">{totalItems}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center border border-amber-100 dark:border-amber-500/30">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Risco Médio (&lt; 100k)</p>
            <h3 className="font-title text-2xl font-bold text-amber-600 dark:text-amber-400">{riskCounts.MEDIO || 0}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/20 flex items-center justify-center border border-rose-100 dark:border-rose-500/30">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Risco Alto (&ge; 100k)</p>
            <h3 className="font-title text-2xl font-bold text-rose-600 dark:text-rose-400">{riskCounts.ALTO || 0}</h3>
          </div>
        </div>
      </div>

      {/* TABELA PLD/FT */}
      <div className="glass-panel table-container min-h-[300px]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
          <span className="font-title font-bold text-base flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <AlertTriangle className="w-5 h-5 text-slate-400" /> Alertas Detectados
          </span>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-brand-500" />}
        </div>

        {isError && (
          <div className="p-8 text-center text-rose-500">
            <p>Falha ao carregar o relatório PLD/FT. Tente novamente.</p>
          </div>
        )}

        {!isLoading && !isError && paginatedData.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <ShieldAlert className="w-12 h-12 mx-auto text-emerald-400 mb-3 opacity-50" />
            <p className="text-lg font-semibold">Nenhum alerta detectado no período</p>
            <p className="text-sm mt-1">Todas as operações estão dentro dos limites normais.</p>
          </div>
        )}

        {!isLoading && !isError && paginatedData.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Nome Consorciado</th>
                    <th>CPF/CNPJ</th>
                    <th className="text-right">Valor Oferta</th>
                    <th>Tipo Lance</th>
                    <th>Data Oferta</th>
                    <th>Grupo</th>
                    <th className="text-center">Cota</th>
                    <th className="text-center">Nível de Risco</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item) => {
                    const risk = getRiskBadge(item.valorOferta);
                    return (
                      <tr key={item.lanceId}>
                        <td className="font-bold text-slate-800 dark:text-slate-200">{item.nomeConsorciado}</td>
                        <td className="font-mono text-xs text-slate-500 dark:text-slate-400">{item.cpfCnpj}</td>
                        <td className="text-right font-title font-bold text-amber-600 dark:text-amber-400">{formatCurrency(item.valorOferta)}</td>
                        <td><span className={`badge ${item.tipoLance === 'LIVRE' ? 'badge-info' : 'badge-warning'}`}>{item.tipoLance}</span></td>
                        <td className="text-xs text-slate-600 dark:text-slate-400">{formatDate(item.dataOferta)}</td>
                        <td className="font-title font-bold text-brand-600 dark:text-brand-400">{item.codigoGrupo}</td>
                        <td className="text-center font-title font-bold text-slate-700 dark:text-slate-300">#{item.cotaId}</td>
                        <td className="text-center">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${risk.className}`}>
                            {risk.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINAÇÃO */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
              <span className="text-xs text-slate-500 font-medium">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems} registros
              </span>
              <div className="flex gap-2">
                <button className="btn btn-outline py-1 px-3 !text-xs flex items-center gap-1" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="w-3 h-3" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} className={`btn py-1 px-3 !text-xs ${page === currentPage ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCurrentPage(page)}>
                    {page}
                  </button>
                ))}
                <button className="btn btn-outline py-1 px-3 !text-xs flex items-center gap-1" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

