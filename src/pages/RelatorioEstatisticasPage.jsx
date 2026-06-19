import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { BarChart3, Download, UserPlus, UserMinus, Tags, Trophy, Calendar } from 'lucide-react';

const MOCK_GRUPOS = [
  { id: 1, codigo: 'GRP-2024-001' },
  { id: 2, codigo: 'GRP-2024-002' },
  { id: 3, codigo: 'GRP-2025-001' },
];

const MOCK_ESTATISTICAS = {
  resumo: {
    totalAdesoes: 18,
    totalExclusoes: 5,
    totalLances: 42,
    totalContemplados: 12,
  },
  detalhes: [
    { mes: '2026-01', adesoes: 4, exclusoes: 1, lancesLivres: 6, lancesEmbutidos: 3, contemplacoesLance: 2, contemplacesSorteio: 1, valorTotalLances: 185000.00, valorMedioLance: 20555.56 },
    { mes: '2026-02', adesoes: 3, exclusoes: 0, lancesLivres: 5, lancesEmbutidos: 2, contemplacoesLance: 2, contemplacesSorteio: 0, valorTotalLances: 162000.00, valorMedioLance: 23142.86 },
    { mes: '2026-03', adesoes: 2, exclusoes: 1, lancesLivres: 7, lancesEmbutidos: 4, contemplacoesLance: 3, contemplacesSorteio: 1, valorTotalLances: 248500.00, valorMedioLance: 22590.91 },
    { mes: '2026-04', adesoes: 5, exclusoes: 2, lancesLivres: 4, lancesEmbutidos: 3, contemplacoesLance: 1, contemplacesSorteio: 1, valorTotalLances: 136000.00, valorMedioLance: 19428.57 },
    { mes: '2026-05', adesoes: 2, exclusoes: 0, lancesLivres: 3, lancesEmbutidos: 2, contemplacoesLance: 1, contemplacesSorteio: 0, valorTotalLances: 98000.00, valorMedioLance: 19600.00 },
    { mes: '2026-06', adesoes: 2, exclusoes: 1, lancesLivres: 3, lancesEmbutidos: 2, contemplacoesLance: 1, contemplacesSorteio: 0, valorTotalLances: 78500.00, valorMedioLance: 15700.00 },
  ],
};

export const RelatorioEstatisticasPage = () => {
  const { triggerToast } = useToast();
  const [grupoId, setGrupoId] = useState('');
  const [dataInicio, setDataInicio] = useState('2026-01-01');
  const [dataFim, setDataFim] = useState('2026-06-13');

  const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatMes = (mesStr) => {
    const [y, m] = mesStr.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(m) - 1]}/${y}`;
  };

  const handleExportCSV = () => triggerToast('Exportação CSV das Estatísticas iniciada.', 'info');

  const { resumo, detalhes } = MOCK_ESTATISTICAS;

  const totais = detalhes.reduce((acc, d) => ({
    adesoes: acc.adesoes + d.adesoes,
    exclusoes: acc.exclusoes + d.exclusoes,
    lancesLivres: acc.lancesLivres + d.lancesLivres,
    lancesEmbutidos: acc.lancesEmbutidos + d.lancesEmbutidos,
    contemplacoesLance: acc.contemplacoesLance + d.contemplacoesLance,
    contemplacesSorteio: acc.contemplacesSorteio + d.contemplacesSorteio,
    valorTotalLances: acc.valorTotalLances + d.valorTotalLances,
  }), { adesoes: 0, exclusoes: 0, lancesLivres: 0, lancesEmbutidos: 0, contemplacoesLance: 0, contemplacesSorteio: 0, valorTotalLances: 0 });

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
      <div className="glass-panel p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-group">
          <label htmlFor="select-grupo-est">Grupo</label>
          <select id="select-grupo-est" value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
            <option value="">Selecione um grupo...</option>
            {MOCK_GRUPOS.map((g) => <option key={g.id} value={g.id}>{g.codigo}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="input-data-inicio">Data Início</label>
          <input id="input-data-inicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="input-data-fim">Data Fim</label>
          <input id="input-data-fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
      </div>

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

      {/* TABELA DETALHADA */}
      <div className="glass-panel table-container">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
          <span className="font-title font-bold text-base flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Calendar className="w-5 h-5 text-slate-400" /> Detalhamento Mensal
          </span>
          <span className="text-xs font-semibold text-slate-500">{detalhes.length} mese(s) no período</span>
        </div>

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
            {detalhes.map((d) => (
              <tr key={d.mes}>
                <td className="font-title font-bold text-slate-700 dark:text-slate-300">{formatMes(d.mes)}</td>
                <td className="text-center font-semibold text-emerald-600 dark:text-emerald-400">+{d.adesoes}</td>
                <td className={`text-center font-semibold ${d.exclusoes > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {d.exclusoes > 0 ? `-${d.exclusoes}` : '0'}
                </td>
                <td className="text-center font-medium text-slate-600 dark:text-slate-400">{d.lancesLivres}</td>
                <td className="text-center font-medium text-slate-600 dark:text-slate-400">{d.lancesEmbutidos}</td>
                <td className="text-center font-semibold text-amber-600 dark:text-amber-400">{d.contemplacoesLance}</td>
                <td className="text-center font-semibold text-blue-600 dark:text-blue-400">{d.contemplacesSorteio}</td>
                <td className="text-right font-title font-bold text-slate-700 dark:text-slate-300">{formatCurrency(d.valorTotalLances)}</td>
                <td className="text-right font-mono text-xs text-slate-500">{formatCurrency(d.valorMedioLance)}</td>
              </tr>
            ))}
            
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-t-2 border-slate-200 dark:border-slate-700">
              <td className="font-title font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">TOTAL PERÍODO</td>
              <td className="text-center font-bold text-emerald-600 dark:text-emerald-400">+{totais.adesoes}</td>
              <td className="text-center font-bold text-rose-600 dark:text-rose-400">-{totais.exclusoes}</td>
              <td className="text-center font-bold text-slate-700 dark:text-slate-300">{totais.lancesLivres}</td>
              <td className="text-center font-bold text-slate-700 dark:text-slate-300">{totais.lancesEmbutidos}</td>
              <td className="text-center font-bold text-amber-600 dark:text-amber-400">{totais.contemplacoesLance}</td>
              <td className="text-center font-bold text-blue-600 dark:text-blue-400">{totais.contemplacesSorteio}</td>
              <td className="text-right font-title font-bold text-lg text-amber-600 dark:text-amber-400">{formatCurrency(totais.valorTotalLances)}</td>
              <td className="text-right font-mono font-bold text-xs text-slate-500">{formatCurrency(totais.valorTotalLances / (totais.lancesLivres + totais.lancesEmbutidos))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
