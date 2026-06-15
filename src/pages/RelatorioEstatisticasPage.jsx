import React, { useState } from 'react';
// TODO (Dev): Substituir mock por hooks reais
// import { useQuery } from '@tanstack/react-query';
// import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

// ============================================================
// 📌 HOOKS & SCHEMAS — Identificados para integração futura
// ============================================================
// useQuery(['estatisticas', grupoId, dataInicio, dataFim],
//   () => api.relatorios.estatisticas(grupoId, dataInicio, dataFim),
//   { enabled: !!grupoId && !!dataInicio && !!dataFim }
// )
//
// Zod Schema para validação dos filtros:
// const estatisticasFiltroSchema = z.object({
//   grupoId: z.number().positive('Selecione um grupo'),
//   dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
//   dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
// }).refine(data => data.dataInicio <= data.dataFim, {
//   message: 'Data início deve ser anterior à data fim',
//   path: ['dataFim'],
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

// ========================
// 🎨 COMPONENTE PRINCIPAL
// ========================
export const RelatorioEstatisticasPage = () => {
  const { triggerToast } = useToast();
  const [grupoId, setGrupoId] = useState('');
  const [dataInicio, setDataInicio] = useState('2026-01-01');
  const [dataFim, setDataFim] = useState('2026-06-13');

  const formatCurrency = (val) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatMes = (mesStr) => {
    const [y, m] = mesStr.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(m) - 1]}/${y}`;
  };

  const handleExportCSV = () => {
    // TODO (Dev): Implementar exportação real via blob download
    triggerToast('📥 Exportação CSV das Estatísticas iniciada.', 'info');
  };

  const { resumo, detalhes } = MOCK_ESTATISTICAS;

  // Totais da tabela
  const totais = detalhes.reduce((acc, d) => ({
    adesoes: acc.adesoes + d.adesoes,
    exclusoes: acc.exclusoes + d.exclusoes,
    lancesLivres: acc.lancesLivres + d.lancesLivres,
    lancesEmbutidos: acc.lancesEmbutidos + d.lancesEmbutidos,
    contemplacoesLance: acc.contemplacoesLance + d.contemplacoesLance,
    contemplacesSorteio: acc.contemplacesSorteio + d.contemplacesSorteio,
    valorTotalLances: acc.valorTotalLances + d.valorTotalLances,
  }), {
    adesoes: 0, exclusoes: 0, lancesLivres: 0, lancesEmbutidos: 0,
    contemplacoesLance: 0, contemplacesSorteio: 0, valorTotalLances: 0,
  });

  return (
    <div className="view-container animate-fade-in">
      {/* ===== HEADER ===== */}
      <div className="header-panel">
        <div className="header-title">
          <h2>📊 Estatísticas — Documento 2080</h2>
          <p>Informações Estatísticas do Consórcio — BCB</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={handleExportCSV} aria-label="Exportar estatísticas em CSV">
            📥 Exportar CSV
          </button>
        </div>
      </div>

      {/* ===== FILTROS ===== */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="select-grupo-est">Grupo</label>
            <select
              id="select-grupo-est"
              value={grupoId}
              onChange={(e) => setGrupoId(e.target.value)}
              aria-label="Selecionar grupo para estatísticas"
            >
              <option value="">Selecione um grupo...</option>
              {MOCK_GRUPOS.map((g) => (
                <option key={g.id} value={g.id}>{g.codigo}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="input-data-inicio">Data Início</label>
            <input
              id="input-data-inicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              aria-label="Data início do período"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="input-data-fim">Data Fim</label>
            <input
              id="input-data-fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              aria-label="Data fim do período"
            />
          </div>
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '28px' }}>
        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--success-bg)', borderColor: 'var(--success-border)' }}>
            <span style={{ fontSize: '1.3rem' }}>📥</span>
          </div>
          <div className="kpi-info">
            <p>Total Adesões</p>
            <h3 style={{ color: 'var(--success)' }}>{resumo.totalAdesoes}</h3>
            <span className="kpi-trend success">novos consorciados</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger-border)' }}>
            <span style={{ fontSize: '1.3rem' }}>📤</span>
          </div>
          <div className="kpi-info">
            <p>Total Exclusões</p>
            <h3 style={{ color: 'var(--danger)' }}>{resumo.totalExclusoes}</h3>
            <span className="kpi-trend" style={{ color: 'var(--danger)' }}>cancelamentos no período</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}>
            <span style={{ fontSize: '1.3rem' }}>🏷️</span>
          </div>
          <div className="kpi-info">
            <p>Total Lances</p>
            <h3 style={{ color: 'var(--warning)' }}>{resumo.totalLances}</h3>
            <span className="kpi-trend warning">livres + embutidos</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--info-bg)', borderColor: 'var(--info-border)' }}>
            <span style={{ fontSize: '1.3rem' }}>🏆</span>
          </div>
          <div className="kpi-info">
            <p>Contemplações</p>
            <h3 style={{ color: 'var(--info)' }}>{resumo.totalContemplados}</h3>
            <span className="kpi-trend info">cotas contempladas</span>
          </div>
        </div>
      </div>

      {/* ===== TABELA DETALHADA ===== */}
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
            📋 Detalhamento Mensal
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {detalhes.length} mese(s) no período
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Mês/Ano</th>
              <th style={{ textAlign: 'center' }}>Adesões</th>
              <th style={{ textAlign: 'center' }}>Exclusões</th>
              <th style={{ textAlign: 'center' }}>Lances Livres</th>
              <th style={{ textAlign: 'center' }}>Lances Embutidos</th>
              <th style={{ textAlign: 'center' }}>Contempl. Lance</th>
              <th style={{ textAlign: 'center' }}>Contempl. Sorteio</th>
              <th style={{ textAlign: 'right' }}>Valor Total Lances</th>
              <th style={{ textAlign: 'right' }}>Valor Médio Lance</th>
            </tr>
          </thead>
          <tbody>
            {detalhes.map((d) => (
              <tr key={d.mes}>
                <td>
                  <span style={{ fontFamily: 'var(--font-title)', fontWeight: 600 }}>
                    {formatMes(d.mes)}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>+{d.adesoes}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ color: d.exclusoes > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {d.exclusoes > 0 ? `-${d.exclusoes}` : '0'}
                  </span>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 500 }}>{d.lancesLivres}</td>
                <td style={{ textAlign: 'center', fontWeight: 500 }}>{d.lancesEmbutidos}</td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{d.contemplacoesLance}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ color: 'var(--info)', fontWeight: 600 }}>{d.contemplacesSorteio}</span>
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-title)', fontWeight: 600 }}>
                  {formatCurrency(d.valorTotalLances)}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {formatCurrency(d.valorMedioLance)}
                </td>
              </tr>
            ))}

            {/* Linha de Totais */}
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              <td style={{ fontWeight: 700, fontFamily: 'var(--font-title)', color: 'var(--text-white)' }}>
                TOTAL PERÍODO
              </td>
              <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--success)' }}>+{totais.adesoes}</td>
              <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--danger)' }}>-{totais.exclusoes}</td>
              <td style={{ textAlign: 'center', fontWeight: 700 }}>{totais.lancesLivres}</td>
              <td style={{ textAlign: 'center', fontWeight: 700 }}>{totais.lancesEmbutidos}</td>
              <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--warning)' }}>{totais.contemplacoesLance}</td>
              <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--info)' }}>{totais.contemplacesSorteio}</td>
              <td style={{ textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-title)', fontSize: '1.05rem', color: 'var(--warning)' }}>
                {formatCurrency(totais.valorTotalLances)}
              </td>
              <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)' }}>
                {formatCurrency(totais.valorTotalLances / (totais.lancesLivres + totais.lancesEmbutidos))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
