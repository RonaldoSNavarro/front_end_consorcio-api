import React, { useMemo } from 'react';
import { useToast } from '../context/ToastContext';
import { FileText, Download, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Activity, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { balanceteFiltroSchema } from '../schemas/relatoriosSchema';
import { useBalanceteQuery } from '../hooks/useRelatorios';

// Idealmente os grupos viriam de uma query `useGrupos()`, mas mantemos mock local para este exemplo focado no relatório
const MOCK_GRUPOS = [
  { id: 1, codigo: 'GRP-AUTO-002' },
  { id: 2, codigo: 'GRP-IMOVEL-010' },
  { id: 3, codigo: 'GRP-MOTO-005' },
];

export const RelatorioBalancetePage = () => {
  const { triggerToast } = useToast();

  const { register, watch, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(balanceteFiltroSchema),
    mode: 'onChange',
    defaultValues: {
      grupoId: '',
      dataReferencia: '2026-06-13'
    }
  });

  const grupoId = watch('grupoId');
  const dataReferencia = watch('dataReferencia');

  const { data: balanceteData, isLoading, isError } = useBalanceteQuery(grupoId, dataReferencia, {
    enabled: isValid && !!grupoId
  });

  const contasNormalizadas = useMemo(() => {
    if (!balanceteData?.contas) return [];
    
    return balanceteData.contas.map(conta => {
      // Infere ATIVO, PASSIVO ou RESULTADO baseado no primeiro dígito da conta COSIF
      let tipo = 'RESULTADO';
      if (conta.codigoCosif.startsWith('1')) tipo = 'ATIVO';
      if (conta.codigoCosif.startsWith('2')) tipo = 'PASSIVO';

      const saldoDebito = conta.natureza === 'DEVEDORA' ? conta.saldo : 0;
      const saldoCredito = conta.natureza === 'CREDORA' ? conta.saldo : 0;

      return {
        ...conta,
        tipo,
        saldoDebito,
        saldoCredito
      };
    });
  }, [balanceteData]);

  const agrupado = useMemo(() => {
    const tipos = ['ATIVO', 'PASSIVO', 'RESULTADO'];
    const result = {};
    tipos.forEach((tipo) => {
      const contas = contasNormalizadas.filter((c) => c.tipo === tipo);
      const totalDebito = contas.reduce((sum, c) => sum + c.saldoDebito, 0);
      const totalCredito = contas.reduce((sum, c) => sum + c.saldoCredito, 0);
      result[tipo] = { contas, totalDebito, totalCredito };
    });
    return result;
  }, [contasNormalizadas]);

  const quadratura = useMemo(() => {
    const totalAtivo = agrupado.ATIVO?.totalDebito - agrupado.ATIVO?.totalCredito;
    const totalPassivo = agrupado.PASSIVO?.totalCredito - agrupado.PASSIVO?.totalDebito;
    const totalResultado = agrupado.RESULTADO?.totalCredito - agrupado.RESULTADO?.totalDebito;
    const diferenca = totalAtivo - (totalPassivo + totalResultado);
    return { 
      totalAtivo: totalAtivo || 0, 
      totalPassivo: totalPassivo || 0, 
      totalResultado: totalResultado || 0, 
      diferenca: diferenca || 0, 
      equilibrado: Math.abs(diferenca || 0) < 0.01 
    };
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
          <label htmlFor="select-grupo">Grupo *</label>
          <select id="select-grupo" {...register('grupoId')} className={errors.grupoId ? 'border-rose-500' : ''}>
            <option value="">Selecione um grupo...</option>
            {MOCK_GRUPOS.map((g) => <option key={g.id} value={g.id}>{g.codigo}</option>)}
          </select>
          {errors.grupoId && <span className="text-xs text-rose-500 mt-1">{errors.grupoId.message}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="input-data-ref">Data de Referência</label>
          <input id="input-data-ref" type="date" {...register('dataReferencia')} />
        </div>
      </div>

      {!grupoId ? (
        <div className="p-12 text-center text-slate-500 glass-panel">
          <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-lg font-semibold">Selecione um grupo</p>
          <p className="text-sm mt-1">O balancete é gerado individualmente por grupo de consórcio.</p>
        </div>
      ) : isLoading ? (
        <div className="p-12 flex justify-center items-center glass-panel">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-rose-500 glass-panel">
          <p>Falha ao gerar o balancete. Tente novamente.</p>
        </div>
      ) : (
        <>
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

          {/* GRÁFICO DE ROSCA */}
          {(quadratura.totalAtivo > 0 || quadratura.totalPassivo > 0 || quadratura.totalResultado > 0) && (
            <div className="glass-panel p-6">
              <h3 className="font-title font-bold text-base text-slate-800 dark:text-slate-200 mb-6 flex items-center justify-center">
                Distribuição Contábil
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Ativo', value: quadratura.totalAtivo, color: '#10b981' },
                        { name: 'Passivo', value: quadratura.totalPassivo, color: '#f43f5e' },
                        { name: 'Resultado', value: quadratura.totalResultado, color: '#3b82f6' }
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {
                        [
                          { name: 'Ativo', value: quadratura.totalAtivo, color: '#10b981' },
                          { name: 'Passivo', value: quadratura.totalPassivo, color: '#f43f5e' },
                          { name: 'Resultado', value: quadratura.totalResultado, color: '#3b82f6' }
                        ].filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                        ))
                      }
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

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
                  {agrupado[tipo].contas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-slate-400 py-4">Nenhuma conta com saldo neste agrupamento</td>
                    </tr>
                  ) : (
                    agrupado[tipo].contas.map((conta) => (
                      <tr key={conta.codigoCosif}>
                        <td>
                          <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded">
                            {conta.codigoCosif}
                          </span>
                        </td>
                        <td className="font-medium text-slate-700 dark:text-slate-300">{conta.nome}</td>
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
                    ))
                  )}
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
        </>
      )}
    </div>
  );
};
