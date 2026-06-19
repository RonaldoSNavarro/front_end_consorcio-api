import React, { useState, useMemo } from 'react';
import { useToast } from '../context/ToastContext';
import { FileText, Download, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const MOCK_GRUPOS = [
  { id: 1, codigo: 'GRP-2024-001' },
  { id: 2, codigo: 'GRP-2024-002' },
  { id: 3, codigo: 'GRP-2025-001' },
];

const MOCK_BALANCETE = [
  // ATIVO
  { codigoContabil: '1.1.1.10.00-2', descricao: 'Bancos - Recursos de Grupos', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoDebito: 245380.50, saldoCredito: 0 },
  { codigoContabil: '1.1.2.10.00-9', descricao: 'Aplicações Financeiras Vinculadas', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoDebito: 85000.00, saldoCredito: 0 },
  { codigoContabil: '1.3.1.10.00-0', descricao: 'Parcelas a Receber de Consorciados', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoDebito: 120450.00, saldoCredito: 0 },
  { codigoContabil: '1.6.1.10.00-5', descricao: 'Provisão para Devedores Duvidosos (PDD)', tipo: 'ATIVO', natureza: 'DEVEDORA', saldoDebito: 0, saldoCredito: 34520.00 },
  // PASSIVO
  { codigoContabil: '2.1.2.10.10-6', descricao: 'Fundo Comum de Grupos', tipo: 'PASSIVO', natureza: 'CREDORA', saldoDebito: 0, saldoCredito: 198450.50 },
  { codigoContabil: '2.1.2.10.20-3', descricao: 'Fundo de Reserva de Grupos', tipo: 'PASSIVO', natureza: 'CREDORA', saldoDebito: 0, saldoCredito: 18450.00 },
  { codigoContabil: '2.1.2.10.30-2', descricao: 'Taxa de Administração a Repassar', tipo: 'PASSIVO', natureza: 'CREDORA', saldoDebito: 0, saldoCredito: 42380.00 },
  { codigoContabil: '2.1.2.20.10-3', descricao: 'Recursos de Excluídos a Devolver', tipo: 'PASSIVO', natureza: 'CREDORA', saldoDebito: 0, saldoCredito: 15200.00 },
  { codigoContabil: '2.1.2.30.10-0', descricao: 'Créditos a Liberar (Contemplados)', tipo: 'PASSIVO', natureza: 'CREDORA', saldoDebito: 0, saldoCredito: 78500.00 },
  // RESULTADO
  { codigoContabil: '7.1.1.10.00-4', descricao: 'Receita de Taxa de Administração', tipo: 'RESULTADO', natureza: 'CREDORA', saldoDebito: 0, saldoCredito: 62830.00 },
  { codigoContabil: '8.1.1.10.00-7', descricao: 'Despesas com Provisão de PDD', tipo: 'RESULTADO', natureza: 'DEVEDORA', saldoDebito: 34520.00, saldoCredito: 0 },
];

export const RelatorioBalancetePage = () => {
  const { triggerToast } = useToast();
  const [grupoId, setGrupoId] = useState('');
  const [dataReferencia, setDataReferencia] = useState('2026-06-13');

  const agrupado = useMemo(() => {
    const tipos = ['ATIVO', 'PASSIVO', 'RESULTADO'];
    const result = {};
    tipos.forEach((tipo) => {
      const contas = MOCK_BALANCETE.filter((c) => c.tipo === tipo);
      const totalDebito = contas.reduce((sum, c) => sum + c.saldoDebito, 0);
      const totalCredito = contas.reduce((sum, c) => sum + c.saldoCredito, 0);
      result[tipo] = { contas, totalDebito, totalCredito };
    });
    return result;
  }, []);

  const quadratura = useMemo(() => {
    const totalAtivo = agrupado.ATIVO?.totalDebito - agrupado.ATIVO?.totalCredito;
    const totalPassivo = agrupado.PASSIVO?.totalCredito - agrupado.PASSIVO?.totalDebito;
    const totalResultado = agrupado.RESULTADO?.totalCredito - agrupado.RESULTADO?.totalDebito;
    const diferenca = totalAtivo - (totalPassivo + totalResultado);
    return { totalAtivo, totalPassivo, totalResultado, diferenca, equilibrado: Math.abs(diferenca) < 0.01 };
  }, [agrupado]);

  const formatCurrency = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const handleExportCSV = () => triggerToast('Exportação CSV do Balancete iniciada.', 'info');

  const getTipoLabel = (tipo) => {
    const labels = { ATIVO: 'Ativo', PASSIVO: 'Passivo', RESULTADO: 'Resultado' };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo) => {
    const colors = { ATIVO: 'text-emerald-600 dark:text-emerald-400', PASSIVO: 'text-rose-600 dark:text-rose-400', RESULTADO: 'text-blue-600 dark:text-blue-400' };
    return colors[tipo] || 'text-slate-900 dark:text-slate-100';
  };

  const getTipoIcon = (tipo) => {
    if (tipo === 'ATIVO') return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    if (tipo === 'PASSIVO') return <TrendingDown className="w-5 h-5 text-rose-500" />;
    return <Activity className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-brand-500" /> Balancete — Documento 4110
          </h2>
          <p className="text-sm text-slate-400 mt-1">Demonstração de Recursos de Grupos de Consórcio — BCB</p>
        </div>
        <button className="btn btn-outline flex items-center gap-2" onClick={handleExportCSV}>
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* FILTROS */}
      <div className="glass-panel p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="select-grupo">Grupo</label>
          <select id="select-grupo" value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
            <option value="">Selecione um grupo...</option>
            {MOCK_GRUPOS.map((g) => <option key={g.id} value={g.id}>{g.codigo}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="input-data-ref">Data de Referência</label>
          <input id="input-data-ref" type="date" value={dataReferencia} onChange={(e) => setDataReferencia(e.target.value)} />
        </div>
      </div>

      {/* VERIFICAÇÃO DE QUADRATURA */}
      {quadratura.equilibrado ? (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-sm flex gap-3 items-center font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Quadratura verificada — Ativo = Passivo + Resultado (Diferença: {formatCurrency(quadratura.diferenca)})</span>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-sm flex gap-3 items-center font-semibold text-rose-700 dark:text-rose-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>ALERTA DE QUADRATURA — Diferença de {formatCurrency(Math.abs(quadratura.diferenca))} detectada! (Ativo: {formatCurrency(quadratura.totalAtivo)} ≠ Passivo + Resultado: {formatCurrency(quadratura.totalPassivo + quadratura.totalResultado)})</span>
        </div>
      )}

      {/* KPIs DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/30">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Ativo</p>
            <h3 className="font-title text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(quadratura.totalAtivo)}</h3>
          </div>
        </div>
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/20 flex items-center justify-center border border-rose-100 dark:border-rose-500/30">
            <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Passivo</p>
            <h3 className="font-title text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(quadratura.totalPassivo)}</h3>
          </div>
        </div>
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center border border-blue-100 dark:border-blue-500/30">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Resultado</p>
            <h3 className="font-title text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(quadratura.totalResultado)}</h3>
          </div>
        </div>
      </div>

      {/* TABELA AGRUPADA POR TIPO COSIF */}
      {['ATIVO', 'PASSIVO', 'RESULTADO'].map((tipo) => (
        <div key={tipo} className="glass-panel table-container">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
            <span className={`font-title font-bold text-base flex items-center gap-2 ${getTipoColor(tipo)}`}>
              {getTipoIcon(tipo)} {getTipoLabel(tipo)}
            </span>
            <span className="text-xs font-semibold text-slate-500">{agrupado[tipo].contas.length} conta(s)</span>
          </div>

          <table className="w-full">
            <thead>
              <tr>
                <th>Código COSIF</th>
                <th>Descrição</th>
                <th className="text-center">Natureza</th>
                <th className="text-right">Saldo Débito</th>
                <th className="text-right">Saldo Crédito</th>
                <th className="text-right">Saldo Líquido</th>
              </tr>
            </thead>
            <tbody>
              {agrupado[tipo].contas.map((conta) => (
                <tr key={conta.codigoContabil}>
                  <td>
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded">
                      {conta.codigoContabil}
                    </span>
                  </td>
                  <td className="font-medium text-slate-700 dark:text-slate-300">{conta.descricao}</td>
                  <td className="text-center">
                    <span className={`badge ${conta.natureza === 'DEVEDORA' ? 'badge-danger' : 'badge-success'}`}>
                      {conta.natureza}
                    </span>
                  </td>
                  <td className="text-right font-mono text-slate-600 dark:text-slate-400">
                    {conta.saldoDebito > 0 ? formatCurrency(conta.saldoDebito) : '—'}
                  </td>
                  <td className="text-right font-mono text-slate-600 dark:text-slate-400">
                    {conta.saldoCredito > 0 ? formatCurrency(conta.saldoCredito) : '—'}
                  </td>
                  <td className={`text-right font-mono font-bold ${conta.natureza === 'DEVEDORA' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {formatCurrency(Math.abs(conta.saldoDebito - conta.saldoCredito))}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <td colSpan={3} className={`font-title font-bold uppercase tracking-wider text-xs ${getTipoColor(tipo)}`}>
                  SUBTOTAL {tipo}
                </td>
                <td className="text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                  {agrupado[tipo].totalDebito > 0 ? formatCurrency(agrupado[tipo].totalDebito) : '—'}
                </td>
                <td className="text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                  {agrupado[tipo].totalCredito > 0 ? formatCurrency(agrupado[tipo].totalCredito) : '—'}
                </td>
                <td className={`text-right font-mono font-bold text-lg ${getTipoColor(tipo)}`}>
                  {formatCurrency(Math.abs(agrupado[tipo].totalDebito - agrupado[tipo].totalCredito))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};
