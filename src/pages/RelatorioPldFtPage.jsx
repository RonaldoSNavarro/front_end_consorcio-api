import React, { useState, useMemo } from 'react';
// TODO (Dev): Substituir mock por hooks reais
// import { useQuery } from '@tanstack/react-query';
// import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

// ============================================================
// 📌 HOOKS & SCHEMAS — Identificados para integração futura
// ============================================================
// useQuery(['pld-ft', dataInicio, dataFim, page],
//   () => api.relatorios.pldFt({ dataInicio, dataFim, page, size: 20 }),
//   { enabled: !!dataInicio && !!dataFim, keepPreviousData: true }
// )
//
// Zod Schema para validação dos filtros:
// const pldFtFiltroSchema = z.object({
//   dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
//   dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
// }).refine(data => {
//   const inicio = new Date(data.dataInicio);
//   const fim = new Date(data.dataFim);
//   const diffDays = (fim - inicio) / (1000 * 60 * 60 * 24);
//   return diffDays >= 0 && diffDays <= 90;
// }, {
//   message: 'O período máximo permitido é de 90 dias',
//   path: ['dataFim'],
// });
// ============================================================

// ========================
// 📊 DADOS MOCK ESTÁTICOS
// ========================
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
  // Página 2 mock
  { id: 11, nomeCliente: 'Ana Clara Ferreira', cpfCnpj: '111.222.333-44', valor: 62000.00, tipoLance: 'LIVRE', dataOperacao: '2026-05-30', grupoCodigo: 'GRP-2025-001', numeroCota: 20, status: 'PAGO', percentualCredito: 41.33, nivelRisco: 'BAIXO' },
  { id: 12, nomeCliente: 'Lucas Daniel Vieira', cpfCnpj: '555.666.777-88', valor: 180000.00, tipoLance: 'LIVRE', dataOperacao: '2026-05-28', grupoCodigo: 'GRP-2024-001', numeroCota: 7, status: 'PAGO', percentualCredito: 100.00, nivelRisco: 'ALTO' },
];

const ITEMS_PER_PAGE = 20;

// ========================
// 🎨 COMPONENTE PRINCIPAL
// ========================
export const RelatorioPldFtPage = () => {
  const { triggerToast } = useToast();
  const [dataInicio, setDataInicio] = useState('2026-05-15');
  const [dataFim, setDataFim] = useState('2026-06-13');
  const [currentPage, setCurrentPage] = useState(1);

  // Paginação mock
  const totalItems = MOCK_PLD_DATA.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return MOCK_PLD_DATA.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage]);

  // Validação de período (max 90 dias)
  const periodoValido = useMemo(() => {
    if (!dataInicio || !dataFim) return false;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffDays = (fim - inicio) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 90;
  }, [dataInicio, dataFim]);

  const formatCurrency = (val) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const handleExportCSV = () => {
    // TODO (Dev): Implementar exportação real via blob download
    triggerToast('📥 Exportação CSV do relatório PLD/FT iniciada.', 'info');
  };

  // --- Badge de Risco ---
  const getRiskBadge = (nivel) => {
    const config = {
      BAIXO: { emoji: '🟢', className: 'badge-success', label: 'BAIXO' },
      MEDIO: { emoji: '🟡', className: 'badge-warning', label: 'MÉDIO' },
      ALTO: { emoji: '🔴', className: 'badge-danger', label: 'ALTO' },
      CRITICO: { emoji: '⚫', className: 'badge-critico', label: 'CRÍTICO' },
    };
    return config[nivel] || config.BAIXO;
  };

  // --- Contadores por nível de risco ---
  const riskCounts = useMemo(() => {
    return MOCK_PLD_DATA.reduce((acc, item) => {
      acc[item.nivelRisco] = (acc[item.nivelRisco] || 0) + 1;
      return acc;
    }, {});
  }, []);

  return (
    <div className="view-container animate-fade-in">
      {/* ===== HEADER ===== */}
      <div className="header-panel">
        <div className="header-title">
          <h2>🔍 Relatório PLD/FT</h2>
          <p>Prevenção à Lavagem de Dinheiro e Financiamento do Terrorismo</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={handleExportCSV} aria-label="Exportar PLD/FT em CSV">
            📥 Exportar CSV
          </button>
        </div>
      </div>

      {/* ===== FILTROS ===== */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="pld-data-inicio">Período Início *</label>
            <input
              id="pld-data-inicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              aria-label="Data início do período PLD/FT"
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="pld-data-fim">Período Fim *</label>
            <input
              id="pld-data-fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              aria-label="Data fim do período PLD/FT"
              required
            />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingBottom: '4px' }}>
            {!periodoValido && dataInicio && dataFim && (
              <div style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.8rem',
                color: 'var(--danger)',
                fontWeight: 600,
                width: '100%',
              }}
                role="alert"
              >
                ⚠️ Período máximo: 90 dias
              </div>
            )}
            {periodoValido && (
              <div style={{
                background: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.8rem',
                color: 'var(--success)',
                fontWeight: 600,
                width: '100%',
              }}>
                ✅ Período válido
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== KPIs DE RISCO ===== */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--success-bg)', borderColor: 'var(--success-border)' }}>🟢</div>
          <div className="kpi-info">
            <p>Risco Baixo</p>
            <h3 style={{ color: 'var(--success)' }}>{riskCounts.BAIXO || 0}</h3>
          </div>
        </div>
        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}>🟡</div>
          <div className="kpi-info">
            <p>Risco Médio</p>
            <h3 style={{ color: 'var(--warning)' }}>{riskCounts.MEDIO || 0}</h3>
          </div>
        </div>
        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger-border)' }}>🔴</div>
          <div className="kpi-info">
            <p>Risco Alto</p>
            <h3 style={{ color: 'var(--danger)' }}>{riskCounts.ALTO || 0}</h3>
          </div>
        </div>
        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{
            background: 'rgba(30, 30, 30, 0.4)',
            borderColor: 'rgba(120, 120, 120, 0.3)',
          }}>⚫</div>
          <div className="kpi-info">
            <p>Risco Crítico</p>
            <h3 style={{ color: '#ef4444' }}>{riskCounts.CRITICO || 0}</h3>
          </div>
        </div>
      </div>

      {/* ===== TABELA PLD/FT ===== */}
      <div className="table-container">
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 700, fontSize: '0.95rem' }}>
            🔍 Operações Monitoradas
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {totalItems} registro(s) — Lances ≥ R$ 50.000,00
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF/CNPJ</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th>Tipo Lance</th>
                <th>Data</th>
                <th>Grupo</th>
                <th style={{ textAlign: 'center' }}>Cota</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>% Crédito</th>
                <th style={{ textAlign: 'center' }}>Nível de Risco</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => {
                const risk = getRiskBadge(item.nivelRisco);
                return (
                  <tr key={item.id}>
                    <td>
                      <span className="name-bold">{item.nomeCliente}</span>
                    </td>
                    <td>
                      <span className="monospace" style={{ fontSize: '0.85rem' }}>{item.cpfCnpj}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-title)', fontWeight: 700, color: 'var(--warning)' }}>
                      {formatCurrency(item.valor)}
                    </td>
                    <td>
                      <span className={`badge ${item.tipoLance === 'LIVRE' ? 'badge-info' : 'badge-warning'}`}>
                        {item.tipoLance}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.88rem' }}>{formatDate(item.dataOperacao)}</td>
                    <td>
                      <span style={{ color: 'var(--primary)', fontWeight: 600, fontFamily: 'var(--font-title)' }}>
                        {item.grupoCodigo}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-title)' }}>
                      #{item.numeroCota}
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'PAGO' ? 'badge-success' : 'badge-warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      <span style={{
                        color: item.percentualCredito >= 80 ? 'var(--danger)' : item.percentualCredito >= 50 ? 'var(--warning)' : 'var(--text-main)',
                      }}>
                        {item.percentualCredito.toFixed(2)}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className={`badge ${risk.className}`}
                        style={item.nivelRisco === 'CRITICO' ? {
                          backgroundColor: 'rgba(30, 30, 30, 0.6)',
                          borderColor: 'rgba(239, 68, 68, 0.5)',
                          color: '#ef4444',
                        } : {}}
                      >
                        {risk.emoji} {risk.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ===== PAGINAÇÃO ===== */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems} registros
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-xs btn-outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              ← Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`btn btn-xs ${page === currentPage ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCurrentPage(page)}
                aria-label={`Ir para página ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
            <button
              className="btn btn-xs btn-outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Próxima página"
            >
              Próxima →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
