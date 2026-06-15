import React, { useState, useMemo } from 'react';
// TODO (Dev): Substituir mock por hooks reais
// import { useQuery } from '@tanstack/react-query';
// import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

// ============================================================
// 📌 HOOKS & SCHEMAS — Identificados para integração futura
// ============================================================
// useQuery(['balancete', grupoId, dataReferencia],
//   () => api.relatorios.balancete(grupoId, dataReferencia),
//   { enabled: !!grupoId && !!dataReferencia }
// )
//
// Zod Schema para validação dos filtros:
// const balanceteFiltroSchema = z.object({
//   grupoId: z.number().positive('Selecione um grupo'),
//   dataReferencia: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
// });
// ============================================================

// ========================
// 📊 DADOS MOCK ESTÁTICOS
// ========================
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

// ========================
// 🎨 COMPONENTE PRINCIPAL
// ========================
export const RelatorioBalancetePage = () => {
  const { triggerToast } = useToast();
  const [grupoId, setGrupoId] = useState('');
  const [dataReferencia, setDataReferencia] = useState('2026-06-13');

  // --- Dados agrupados por tipo COSIF ---
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

  // --- Verificação de quadratura ---
  const quadratura = useMemo(() => {
    const totalAtivo = agrupado.ATIVO?.totalDebito - agrupado.ATIVO?.totalCredito;
    const totalPassivo = agrupado.PASSIVO?.totalCredito - agrupado.PASSIVO?.totalDebito;
    const totalResultado = agrupado.RESULTADO?.totalCredito - agrupado.RESULTADO?.totalDebito;
    const diferenca = totalAtivo - (totalPassivo + totalResultado);
    return {
      totalAtivo,
      totalPassivo,
      totalResultado,
      diferenca,
      equilibrado: Math.abs(diferenca) < 0.01,
    };
  }, [agrupado]);

  const formatCurrency = (val) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleExportCSV = () => {
    // TODO (Dev): Implementar exportação real via blob download
    triggerToast('📥 Exportação CSV do Balancete iniciada.', 'info');
  };

  const getTipoLabel = (tipo) => {
    const labels = { ATIVO: '📗 ATIVO', PASSIVO: '📕 PASSIVO', RESULTADO: '📘 RESULTADO' };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo) => {
    const colors = { ATIVO: 'var(--success)', PASSIVO: 'var(--danger)', RESULTADO: 'var(--info)' };
    return colors[tipo] || 'var(--text-main)';
  };

  return (
    <div className="view-container animate-fade-in">
      {/* ===== HEADER ===== */}
      <div className="header-panel">
        <div className="header-title">
          <h2>📄 Balancete — Documento 4110</h2>
          <p>Demonstração de Recursos de Grupos de Consórcio — BCB</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={handleExportCSV} aria-label="Exportar balancete em CSV">
            📥 Exportar CSV
          </button>
        </div>
      </div>

      {/* ===== FILTROS ===== */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="select-grupo">Grupo</label>
            <select
              id="select-grupo"
              value={grupoId}
              onChange={(e) => setGrupoId(e.target.value)}
              aria-label="Selecionar grupo para o balancete"
            >
              <option value="">Selecione um grupo...</option>
              {MOCK_GRUPOS.map((g) => (
                <option key={g.id} value={g.id}>{g.codigo}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="input-data-ref">Data de Referência</label>
            <input
              id="input-data-ref"
              type="date"
              value={dataReferencia}
              onChange={(e) => setDataReferencia(e.target.value)}
              aria-label="Data de referência do balancete"
            />
          </div>
        </div>
      </div>

      {/* ===== VERIFICAÇÃO DE QUADRATURA ===== */}
      {quadratura.equilibrado ? (
        <div style={{
          background: 'var(--success-bg)',
          border: '1px solid var(--success-border)',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.88rem',
          fontWeight: 600,
          color: 'var(--success)',
        }}>
          <span>✅</span>
          <span>Quadratura verificada — Ativo = Passivo + Resultado (diferença: {formatCurrency(quadratura.diferenca)})</span>
        </div>
      ) : (
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.88rem',
          fontWeight: 600,
          color: 'var(--danger)',
        }}
          role="alert"
        >
          <span>⛔</span>
          <span>
            ALERTA DE QUADRATURA — Diferença de {formatCurrency(Math.abs(quadratura.diferenca))} detectada!
            (Ativo: {formatCurrency(quadratura.totalAtivo)} ≠ Passivo + Resultado: {formatCurrency(quadratura.totalPassivo + quadratura.totalResultado)})
          </span>
        </div>
      )}

      {/* ===== KPIs DE RESUMO ===== */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
        <div className="glass-panel kpi-card">
          <div className="kpi-icon">📗</div>
          <div className="kpi-info">
            <p>Total Ativo</p>
            <h3 style={{ color: 'var(--success)' }}>{formatCurrency(quadratura.totalAtivo)}</h3>
          </div>
        </div>
        <div className="glass-panel kpi-card">
          <div className="kpi-icon">📕</div>
          <div className="kpi-info">
            <p>Total Passivo</p>
            <h3 style={{ color: 'var(--danger)' }}>{formatCurrency(quadratura.totalPassivo)}</h3>
          </div>
        </div>
        <div className="glass-panel kpi-card">
          <div className="kpi-icon">📘</div>
          <div className="kpi-info">
            <p>Total Resultado</p>
            <h3 style={{ color: 'var(--info)' }}>{formatCurrency(quadratura.totalResultado)}</h3>
          </div>
        </div>
      </div>

      {/* ===== TABELA AGRUPADA POR TIPO COSIF ===== */}
      {['ATIVO', 'PASSIVO', 'RESULTADO'].map((tipo) => (
        <div key={tipo} className="table-container" style={{ marginBottom: '24px' }}>
          {/* Header do grupo */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <span style={{
              fontFamily: 'var(--font-title)',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: getTipoColor(tipo),
            }}>
              {getTipoLabel(tipo)}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {agrupado[tipo].contas.length} conta(s)
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Código COSIF</th>
                <th>Descrição</th>
                <th>Natureza</th>
                <th style={{ textAlign: 'right' }}>Saldo Débito</th>
                <th style={{ textAlign: 'right' }}>Saldo Crédito</th>
                <th style={{ textAlign: 'right' }}>Saldo Líquido</th>
              </tr>
            </thead>
            <tbody>
              {agrupado[tipo].contas.map((conta) => (
                <tr key={conta.codigoContabil}>
                  <td>
                    <span className="monospace" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {conta.codigoContabil}
                    </span>
                  </td>
                  <td>{conta.descricao}</td>
                  <td>
                    <span className={`badge ${conta.natureza === 'DEVEDORA' ? 'badge-danger' : 'badge-success'}`}>
                      {conta.natureza}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-title)', fontWeight: 600 }}>
                    {conta.saldoDebito > 0 ? formatCurrency(conta.saldoDebito) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-title)', fontWeight: 600 }}>
                    {conta.saldoCredito > 0 ? formatCurrency(conta.saldoCredito) : '—'}
                  </td>
                  <td style={{
                    textAlign: 'right',
                    fontFamily: 'var(--font-title)',
                    fontWeight: 700,
                    color: conta.natureza === 'DEVEDORA' ? 'var(--success)' : 'var(--danger)',
                  }}>
                    {formatCurrency(Math.abs(conta.saldoDebito - conta.saldoCredito))}
                  </td>
                </tr>
              ))}
              {/* Linha de subtotal */}
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                <td colSpan={3} style={{ fontWeight: 700, fontFamily: 'var(--font-title)', color: getTipoColor(tipo) }}>
                  SUBTOTAL {tipo}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-title)' }}>
                  {agrupado[tipo].totalDebito > 0 ? formatCurrency(agrupado[tipo].totalDebito) : '—'}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-title)' }}>
                  {agrupado[tipo].totalCredito > 0 ? formatCurrency(agrupado[tipo].totalCredito) : '—'}
                </td>
                <td style={{
                  textAlign: 'right',
                  fontWeight: 800,
                  fontFamily: 'var(--font-title)',
                  fontSize: '1.05rem',
                  color: getTipoColor(tipo),
                }}>
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
