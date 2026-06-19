import React, { useState, useMemo } from 'react';
import { useToast } from '../context/ToastContext';
import { ShieldAlert, Download, Search, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

const MOCK_PLD_DATA = [
  { id: 1, nomeCliente: 'Carlos Alberto Mendes', cpfCnpj: '123.456.789-01', valor: 85000.00, tipoLance: 'LIVRE', dataOperacao: '2026-06-10', grupoCodigo: 'GRP-2024-001', numeroCota: 12, status: 'PAGO', percentualCredito: 56.67, nivelRisco: 'MEDIO' },
  { id: 2, nomeCliente: 'Fernanda Costa Silva', cpfCnpj: '987.654.321-09', valor: 150000.00, tipoLance: 'LIVRE', dataOperacao: '2026-06-09', grupoCodigo: 'GRP-2024-001', numeroCota: 5, status: 'PAGO', percentualCredito: 100.00, nivelRisco: 'ALTO' },
  { id: 3, nomeCliente: 'Empresa XYZ Ltda.', cpfCnpj: '12.345.678/0001-90', valor: 250000.00, tipoLance: 'LIVRE', dataOperacao: '2026-06-08', grupoCodigo: 'GRP-2024-002', numeroCota: 3, status: 'PAGO', percentualCredito: 100.00, nivelRisco: 'CRITICO' },
  { id: 4, nomeCliente: 'Roberto de Souza', cpfCnpj: '456.789.123-45', valor: 52000.00, tipoLance: 'EMBUTIDO', dataOperacao: '2026-06-07', grupoCodigo: 'GRP-2024-001', numeroCota: 22, status: 'PAGO', percentualCredito: 34.67, nivelRisco: 'BAIXO' },
  { id: 5, nomeCliente: 'Maria Joaquina Alves', cpfCnpj: '321.654.987-65', valor: 95000.00, tipoLance: 'LIVRE', dataOperacao: '2026-06-06', grupoCodigo: 'GRP-2025-001', numeroCota: 8, status: 'PENDENTE', percentualCredito: 63.33, nivelRisco: 'MEDIO' },
  { id: 6, nomeCliente: 'Global Corp S.A.', cpfCnpj: '98.765.432/0001-10', valor: 380000.00, tipoLance: 'LIVRE', dataOperacao: '2026-06-05', grupoCodigo: 'GRP-2024-002', numeroCota: 1, status: 'PAGO', percentualCredito: 100.00, nivelRisco: 'CRITICO' },
  { id: 7, nomeCliente: 'Antônio Pereira Lima', cpfCnpj: '654.321.987-12', valor: 68000.00, tipoLance: 'EMBUTIDO', dataOperacao: '2026-06-04', grupoCodigo: 'GRP-2024-001', numeroCota: 18, status: 'PAGO', percentualCredito: 45.33, nivelRisco: 'BAIXO' },
  { id: 8, nomeCliente: 'Juliana Martins Rocha', cpfCnpj: '789.012.345-67', valor: 125000.00, tipoLance: 'LIVRE', dataOperacao: '2026-06-03', grupoCodigo: 'GRP-2025-001', numeroCota: 15, status: 'PAGO', percentualCredito: 83.33, nivelRisco: 'ALTO' },
  { id: 9, nomeCliente: 'Pedro Henrique Neves', cpfCnpj: '234.567.890-12', valor: 55000.00, tipoLance: 'LIVRE', dataOperacao: '2026-06-02', grupoCodigo: 'GRP-2024-001', numeroCota: 30, status: 'PAGO', percentualCredito: 36.67, nivelRisco: 'MEDIO' },
  { id: 10, nomeCliente: 'Marcelo Augusto Reis', cpfCnpj: '567.890.123-34', valor: 72000.00, tipoLance: 'EMBUTIDO', dataOperacao: '2026-06-01', grupoCodigo: 'GRP-2024-002', numeroCota: 9, status: 'PENDENTE', percentualCredito: 48.00, nivelRisco: 'BAIXO' },
  { id: 11, nomeCliente: 'Ana Clara Ferreira', cpfCnpj: '111.222.333-44', valor: 62000.00, tipoLance: 'LIVRE', dataOperacao: '2026-05-30', grupoCodigo: 'GRP-2025-001', numeroCota: 20, status: 'PAGO', percentualCredito: 41.33, nivelRisco: 'BAIXO' },
  { id: 12, nomeCliente: 'Lucas Daniel Vieira', cpfCnpj: '555.666.777-88', valor: 180000.00, tipoLance: 'LIVRE', dataOperacao: '2026-05-28', grupoCodigo: 'GRP-2024-001', numeroCota: 7, status: 'PAGO', percentualCredito: 100.00, nivelRisco: 'ALTO' },
];

const ITEMS_PER_PAGE = 20;

export const RelatorioPldFtPage = () => {
  const { triggerToast } = useToast();
  const [dataInicio, setDataInicio] = useState('2026-05-15');
  const [dataFim, setDataFim] = useState('2026-06-13');
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = MOCK_PLD_DATA.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return MOCK_PLD_DATA.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage]);

  const periodoValido = useMemo(() => {
    if (!dataInicio || !dataFim) return false;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffDays = (fim - inicio) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 90;
  }, [dataInicio, dataFim]);

  const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (dateStr) => { const [y, m, d] = dateStr.split('-'); return `${d}/${m}/${y}`; };
  const handleExportCSV = () => triggerToast('Exportação CSV do relatório PLD/FT iniciada.', 'info');

  const getRiskBadge = (nivel) => {
    const config = {
      BAIXO: { className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30', label: 'BAIXO' },
      MEDIO: { className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30', label: 'MÉDIO' },
      ALTO: { className: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30', label: 'ALTO' },
      CRITICO: { className: 'bg-slate-900 text-rose-500 border border-rose-500/50 dark:bg-black', label: 'CRÍTICO' },
    };
    return config[nivel] || config.BAIXO;
  };

  const riskCounts = useMemo(() => MOCK_PLD_DATA.reduce((acc, item) => { acc[item.nivelRisco] = (acc[item.nivelRisco] || 0) + 1; return acc; }, {}), []);

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-brand-500" /> Relatório PLD/FT
          </h2>
          <p className="text-sm text-slate-400 mt-1">Prevenção à Lavagem de Dinheiro e Financiamento do Terrorismo</p>
        </div>
        <button className="btn btn-outline flex items-center gap-2" onClick={handleExportCSV}>
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* FILTROS */}
      <div className="glass-panel p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="form-group">
          <label htmlFor="pld-data-inicio">Período Início *</label>
          <input id="pld-data-inicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="pld-data-fim">Período Fim *</label>
          <input id="pld-data-fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} required />
        </div>
        <div className="pb-1">
          {!periodoValido && dataInicio && dataFim && (
            <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" /> Período máximo: 90 dias
            </div>
          )}
          {periodoValido && (
            <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Período válido
            </div>
          )}
        </div>
      </div>

      {/* KPIs DE RISCO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/30">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Risco Baixo</p>
            <h3 className="font-title text-2xl font-bold text-emerald-600 dark:text-emerald-400">{riskCounts.BAIXO || 0}</h3>
          </div>
        </div>
        
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center border border-amber-100 dark:border-amber-500/30">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Risco Médio</p>
            <h3 className="font-title text-2xl font-bold text-amber-600 dark:text-amber-400">{riskCounts.MEDIO || 0}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/20 flex items-center justify-center border border-rose-100 dark:border-rose-500/30">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Risco Alto</p>
            <h3 className="font-title text-2xl font-bold text-rose-600 dark:text-rose-400">{riskCounts.ALTO || 0}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-4 bg-slate-900/5 dark:bg-black/20 border-slate-300 dark:border-slate-700">
          <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-black flex items-center justify-center border border-rose-500/50 shadow-[0_0_10px_rgba(225,29,72,0.3)]">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-400">Risco Crítico</p>
            <h3 className="font-title text-2xl font-bold text-rose-600">{riskCounts.CRITICO || 0}</h3>
          </div>
        </div>
      </div>

      {/* TABELA PLD/FT */}
      <div className="glass-panel table-container">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
          <span className="font-title font-bold text-base flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Search className="w-5 h-5 text-slate-400" /> Operações Monitoradas
          </span>
          <span className="text-xs font-semibold text-slate-500">{totalItems} registro(s) — Lances ≥ R$ 50.000,00</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF/CNPJ</th>
                <th className="text-right">Valor</th>
                <th>Tipo Lance</th>
                <th>Data</th>
                <th>Grupo</th>
                <th className="text-center">Cota</th>
                <th>Status</th>
                <th className="text-right">% Crédito</th>
                <th className="text-center">Nível de Risco</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => {
                const risk = getRiskBadge(item.nivelRisco);
                return (
                  <tr key={item.id}>
                    <td className="font-bold text-slate-800 dark:text-slate-200">{item.nomeCliente}</td>
                    <td className="font-mono text-xs text-slate-500 dark:text-slate-400">{item.cpfCnpj}</td>
                    <td className="text-right font-title font-bold text-amber-600 dark:text-amber-400">{formatCurrency(item.valor)}</td>
                    <td><span className={`badge ${item.tipoLance === 'LIVRE' ? 'badge-info' : 'badge-warning'}`}>{item.tipoLance}</span></td>
                    <td className="text-xs text-slate-600 dark:text-slate-400">{formatDate(item.dataOperacao)}</td>
                    <td className="font-title font-bold text-brand-600 dark:text-brand-400">{item.grupoCodigo}</td>
                    <td className="text-center font-title font-bold text-slate-700 dark:text-slate-300">#{item.numeroCota}</td>
                    <td><span className={`badge ${item.status === 'PAGO' ? 'badge-success' : 'badge-warning'}`}>{item.status}</span></td>
                    <td className="text-right font-semibold">
                      <span className={item.percentualCredito >= 80 ? 'text-rose-500' : item.percentualCredito >= 50 ? 'text-amber-500' : 'text-slate-600 dark:text-slate-400'}>
                        {item.percentualCredito.toFixed(2)}%
                      </span>
                    </td>
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
              <ChevronLeft className="w-3 h-3" /> Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} className={`btn py-1 px-3 !text-xs ${page === currentPage ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCurrentPage(page)}>
                {page}
              </button>
            ))}
            <button className="btn btn-outline py-1 px-3 !text-xs flex items-center gap-1" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Próxima <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
