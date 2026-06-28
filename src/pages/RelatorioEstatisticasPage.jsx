import React from 'react';
import { useToast } from '../context/ToastContext';
import { BarChart3, Download, UserPlus, UserMinus, Tags, Trophy, Calendar, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { estatisticasFiltroSchema } from '../schemas/relatoriosSchema';
import { useEstatisticasQuery } from '../hooks/useRelatorios';

// Idealmente os grupos viriam de uma query `useGrupos()`
const MOCK_GRUPOS = [
  { id: 1, codigo: 'GRP-AUTO-002' },
  { id: 2, codigo: 'GRP-IMOVEL-010' },
  { id: 3, codigo: 'GRP-MOTO-005' },
];

export const RelatorioEstatisticasPage = () => {
  const { triggerToast } = useToast();

  const { register, watch, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(estatisticasFiltroSchema),
    mode: 'onChange',
    defaultValues: {
      grupoId: '',
      dataInicio: '2026-01-01',
      dataFim: '2026-06-13'
    }
  });

  const grupoId = watch('grupoId');
  const dataInicio = watch('dataInicio');
  const dataFim = watch('dataFim');

  const { data: estatisticasData, isLoading, isError } = useEstatisticasQuery(grupoId, dataInicio, dataFim, {
    enabled: isValid && !!grupoId && !!dataInicio && !!dataFim
  });

  const formatCurrency = (val) => val ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
  
  const handleExportCSV = () => {
    if (!grupoId) return;
    const url = `http://localhost:8080/api/relatorios/estatisticas/${grupoId}/csv?dataInicio=${dataInicio}&dataFim=${dataFim}`;
    window.open(url, '_blank');
    triggerToast('Download do CSV das Estatísticas iniciado.', 'info');
  };

  const resumo = estatisticasData?.resumo || {
    totalAdesoes: 0,
    totalExclusoes: 0,
    totalLances: 0,
    totalContemplados: 0,
  };

  const detalhes = estatisticasData?.detalhesMensais || [];

  const totais = detalhes.reduce((acc, d) => ({
    adesoes: acc.adesoes + (d.adesoes || 0),
    exclusoes: acc.exclusoes + (d.exclusoes || 0),
    lancesLivres: acc.lancesLivres + (d.lancesLivres || 0),
    lancesEmbutidos: acc.lancesEmbutidos + (d.lancesEmbutidos || 0),
    contemplacoesLance: acc.contemplacoesLance + (d.contemplacoesLance || 0),
    contemplacoesSorteio: acc.contemplacoesSorteio + (d.contemplacoesSorteio || 0),
    valorTotalLances: acc.valorTotalLances + (d.valorTotalLances || 0),
  }), { adesoes: 0, exclusoes: 0, lancesLivres: 0, lancesEmbutidos: 0, contemplacoesLance: 0, contemplacoesSorteio: 0, valorTotalLances: 0 });

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-brand-500" /> Estatísticas — Documento 2080
          </h2>
          <p className="text-sm text-slate-400 mt-1">Informações Estatísticas do Consórcio — BCB</p>
        </div>
        <button className="btn btn-outline flex items-center gap-2" onClick={handleExportCSV}>
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* FILTROS */}
      <div className="glass-panel p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="form-group">
          <label htmlFor="select-grupo-est">Grupo *</label>
          <select id="select-grupo-est" {...register('grupoId')} className={errors.grupoId ? 'border-rose-500' : ''}>
            <option value="">Selecione um grupo...</option>
            {MOCK_GRUPOS.map((g) => <option key={g.id} value={g.id}>{g.codigo}</option>)}
          </select>
          {errors.grupoId && <span className="text-xs text-rose-500 mt-1">{errors.grupoId.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="input-data-inicio">Data Início *</label>
          <input id="input-data-inicio" type="date" {...register('dataInicio')} className={errors.dataInicio ? 'border-rose-500' : ''} />
          {errors.dataInicio && <span className="text-xs text-rose-500 mt-1">{errors.dataInicio.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="input-data-fim">Data Fim *</label>
          <input id="input-data-fim" type="date" {...register('dataFim')} className={errors.dataFim ? 'border-rose-500' : ''} />
          {errors.dataFim && <span className="text-xs text-rose-500 mt-1">{errors.dataFim.message}</span>}
        </div>
      </div>

      {!grupoId ? (
        <div className="p-12 text-center text-slate-500 glass-panel">
          <BarChart3 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-lg font-semibold">Selecione um grupo e o período</p>
          <p className="text-sm mt-1">O relatório exibirá as estatísticas mensais e acumuladas.</p>
        </div>
      ) : isLoading ? (
        <div className="p-12 flex justify-center items-center glass-panel">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-rose-500 glass-panel">
          <p>Falha ao carregar as estatísticas. Tente novamente.</p>
        </div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/30">
                <UserPlus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Adesões</p>
                <h3 className="font-title text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resumo.totalAdesoes}</h3>
                <span className="text-[10px] uppercase font-bold text-emerald-500 dark:text-emerald-400/80">novos consorciados</span>
              </div>
            </div>

            <div className="glass-panel p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/20 flex items-center justify-center border border-rose-100 dark:border-rose-500/30">
                <UserMinus className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Exclusões</p>
                <h3 className="font-title text-2xl font-bold text-rose-600 dark:text-rose-400">{resumo.totalExclusoes}</h3>
                <span className="text-[10px] uppercase font-bold text-rose-500 dark:text-rose-400/80">cancelamentos</span>
              </div>
            </div>

            <div className="glass-panel p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center border border-amber-100 dark:border-amber-500/30">
                <Tags className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Lances</p>
                <h3 className="font-title text-2xl font-bold text-amber-600 dark:text-amber-400">{resumo.totalLances}</h3>
                <span className="text-[10px] uppercase font-bold text-amber-500 dark:text-amber-400/80">livres + embutidos</span>
              </div>
            </div>

            <div className="glass-panel p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center border border-blue-100 dark:border-blue-500/30">
                <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Contemplações</p>
                <h3 className="font-title text-2xl font-bold text-blue-600 dark:text-blue-400">{resumo.totalContemplados}</h3>
                <span className="text-[10px] uppercase font-bold text-blue-500 dark:text-blue-400/80">cotas contempladas</span>
              </div>
            </div>
          </div>

          {/* GRÁFICOS */}
          {detalhes.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel p-6">
                <h3 className="font-title font-bold text-base text-slate-800 dark:text-slate-200 mb-6">Adesões vs Exclusões</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={detalhes}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                      <XAxis dataKey="mesAno" tick={{fontSize: 10}} tickMargin={10} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="adesoes" name="Adesões" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="exclusoes" name="Exclusões" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel p-6">
                <h3 className="font-title font-bold text-base text-slate-800 dark:text-slate-200 mb-6">Evolução do Valor Total de Lances</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={detalhes}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                      <XAxis dataKey="mesAno" tick={{fontSize: 10}} tickMargin={10} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Line type="monotone" dataKey="valorTotalLances" name="Valor Lances" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TABELA DETALHADA */}
          <div className="glass-panel table-container">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
              <span className="font-title font-bold text-base flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Calendar className="w-5 h-5 text-slate-400" /> Detalhamento Mensal
              </span>
              <span className="text-xs font-semibold text-slate-500">{detalhes.length} mese(s) no período</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Mês/Ano</th>
                    <th className="text-center">Adesões</th>
                    <th className="text-center">Exclusões</th>
                    <th className="text-center">Lances Livres</th>
                    <th className="text-center">Lances Embutidos</th>
                    <th className="text-center">Contempl. Lance</th>
                    <th className="text-center">Contempl. Sorteio</th>
                    <th className="text-right">Valor Total Lances</th>
                    <th className="text-right">Valor Médio Lance</th>
                  </tr>
                </thead>
                <tbody>
                  {detalhes.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center text-slate-400 py-4">Nenhum dado encontrado para o período selecionado</td>
                    </tr>
                  ) : (
                    detalhes.map((d) => (
                      <tr key={d.mesAno}>
                        <td className="font-title font-bold text-slate-700 dark:text-slate-300">{d.mesAno}</td>
                        <td className="text-center font-semibold text-emerald-600 dark:text-emerald-400">+{d.adesoes}</td>
                        <td className={`text-center font-semibold ${d.exclusoes > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>
                          {d.exclusoes > 0 ? `-${d.exclusoes}` : '0'}
                        </td>
                        <td className="text-center font-medium text-slate-600 dark:text-slate-400">{d.lancesLivres}</td>
                        <td className="text-center font-medium text-slate-600 dark:text-slate-400">{d.lancesEmbutidos}</td>
                        <td className="text-center font-semibold text-amber-600 dark:text-amber-400">{d.contemplacoesLance}</td>
                        <td className="text-center font-semibold text-blue-600 dark:text-blue-400">{d.contemplacoesSorteio}</td>
                        <td className="text-right font-title font-bold text-slate-700 dark:text-slate-300">{formatCurrency(d.valorTotalLances)}</td>
                        <td className="text-right font-mono text-xs text-slate-500">{formatCurrency(d.valorMedioLance)}</td>
                      </tr>
                    ))
                  )}
                  
                  {detalhes.length > 0 && (
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-t-2 border-slate-200 dark:border-slate-700">
                      <td className="font-title font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">TOTAL PERÍODO</td>
                      <td className="text-center font-bold text-emerald-600 dark:text-emerald-400">+{totais.adesoes}</td>
                      <td className="text-center font-bold text-rose-600 dark:text-rose-400">-{totais.exclusoes}</td>
                      <td className="text-center font-bold text-slate-700 dark:text-slate-300">{totais.lancesLivres}</td>
                      <td className="text-center font-bold text-slate-700 dark:text-slate-300">{totais.lancesEmbutidos}</td>
                      <td className="text-center font-bold text-amber-600 dark:text-amber-400">{totais.contemplacoesLance}</td>
                      <td className="text-center font-bold text-blue-600 dark:text-blue-400">{totais.contemplacoesSorteio}</td>
                      <td className="text-right font-title font-bold text-lg text-amber-600 dark:text-amber-400">{formatCurrency(totais.valorTotalLances)}</td>
                      <td className="text-right font-mono font-bold text-xs text-slate-500">
                        {formatCurrency(totais.lancesLivres + totais.lancesEmbutidos > 0 ? totais.valorTotalLances / (totais.lancesLivres + totais.lancesEmbutidos) : 0)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
