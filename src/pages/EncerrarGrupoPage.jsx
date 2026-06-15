import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
// TODO (Dev): Substituir mock por hooks reais
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

// ============================================================
// 📌 HOOKS & SCHEMAS — Identificados para integração futura
// ============================================================
// useQuery(['grupo-encerramento', id], () => api.grupos.obterEncerramento(id))
// useMutation(() => api.grupos.encerrar(id), {
//   onSuccess: () => queryClient.invalidateQueries(['grupos']),
// })
//
// Zod Schema para validação do grupo antes do encerramento:
// const encerrarGrupoSchema = z.object({
//   grupoId: z.number().positive(),
//   confirmarEncerramento: z.literal(true, { errorMap: () => ({ message: 'Confirmação obrigatória' }) }),
// });
// ============================================================

// ========================
// 📊 DADOS MOCK ESTÁTICOS
// ========================
const MOCK_GRUPO = {
  id: 1,
  codigo: 'GRP-2024-001',
  status: 'EM_ANDAMENTO',
  valorCredito: 150000.00,
  prazoMeses: 60,
  taxaAdministracao: 15.0,
  fundoReserva: 3.0,
  totalCotas: 50,
  cotasAtivas: 42,
  cotasContempladas: 35,
  cotasCanceladas: 8,
};

const MOCK_PRAZO_LEGAL = {
  dataUltimaAGO: '2026-04-15',
  prazoMaximoEncerramento: '2026-08-13', // 120 dias após última AGO
  diasRestantes: 61,
  diasTotais: 120,
};

const MOCK_SALDOS = {
  fundoComum: {
    saldo: 245380.50,
    contaCosif: '2.1.2.10.10-6',
    descricao: 'Fundo Comum de Grupos',
  },
  fundoReserva: {
    saldo: 18450.00,
    contaCosif: '2.1.2.10.20-3',
    descricao: 'Fundo de Reserva de Grupos',
  },
};

const MOCK_RESUMO_PDD = {
  parcelasBaixadas: 23,
  valorTotalPDD: 34520.00,
  contaDebitoCosif: '1.6.1.10.00-5',
  contaDebitoDescricao: 'Provisão para Devedores Duvidosos (PDD)',
  contaCreditoCosif: '2.1.2.10.10-6',
  contaCreditoDescricao: 'Fundo Comum de Grupos',
  valorRNP: 5200.00,
  contaRNPCosif: '2.4.9.99.00-7',
  contaRNPDescricao: 'Recursos Não Procurados (RNP)',
};

// ========================
// 🎨 COMPONENTE PRINCIPAL
// ========================
export const EncerrarGrupoPage = () => {
  const { id } = useParams();
  const { triggerToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [isEncerrado, setIsEncerrado] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!id) return <Navigate to="/grupos" replace />;

  // --- Cálculo do indicador de prazo ---
  const getPrazoIndicator = (diasRestantes) => {
    if (diasRestantes > 60) return { color: 'var(--success)', label: 'DENTRO DO PRAZO', className: 'badge-success' };
    if (diasRestantes > 30) return { color: 'var(--warning)', label: 'ATENÇÃO', className: 'badge-warning' };
    return { color: 'var(--danger)', label: 'URGENTE', className: 'badge-danger' };
  };

  const prazoIndicator = getPrazoIndicator(MOCK_PRAZO_LEGAL.diasRestantes);
  const progressPercent = ((MOCK_PRAZO_LEGAL.diasTotais - MOCK_PRAZO_LEGAL.diasRestantes) / MOCK_PRAZO_LEGAL.diasTotais) * 100;

  // --- Mock do encerramento ---
  const handleEncerrar = () => {
    setIsProcessing(true);
    // TODO (Dev): Substituir por useMutation real
    setTimeout(() => {
      setIsProcessing(false);
      setShowModal(false);
      setIsEncerrado(true);
      triggerToast('✅ Grupo encerrado com sucesso. Lançamentos PDD e RNP registrados.', 'success');
    }, 1500);
  };

  const formatCurrency = (val) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="view-container animate-fade-in">
      {/* ===== HEADER ===== */}
      <div className="header-panel">
        <div className="header-title">
          <h2>🔒 Encerramento de Grupo</h2>
          <p>Processo formal de encerramento contábil — ADR 006 / BCB 120 dias</p>
        </div>
        <div className="header-actions">
          {!isEncerrado && (
            <button
              className="btn btn-danger"
              onClick={() => setShowModal(true)}
              aria-label="Abrir modal de confirmação de encerramento"
            >
              🔒 Encerrar Grupo
            </button>
          )}
        </div>
      </div>

      {/* ===== GRID PRINCIPAL - 3 CARDS ===== */}
      <div className="encerrar-cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '30px' }}>

        {/* CARD 1: Pré-Encerramento */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '1.4rem' }}>📋</span>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: 700 }}>Pré-Encerramento</h3>
          </div>
          <div className="encerrar-field-grid">
            <div className="encerrar-field">
              <span className="lbl">Código</span>
              <span className="val" style={{ color: 'var(--primary)', fontFamily: 'var(--font-title)', fontWeight: 700 }}>{MOCK_GRUPO.codigo}</span>
            </div>
            <div className="encerrar-field">
              <span className="lbl">Status Atual</span>
              <span className={`badge ${MOCK_GRUPO.status === 'EM_ANDAMENTO' ? 'badge-warning' : 'badge-success'}`}>
                {MOCK_GRUPO.status.replace('_', ' ')}
              </span>
            </div>
            <div className="encerrar-field">
              <span className="lbl">Crédito</span>
              <span className="val">{formatCurrency(MOCK_GRUPO.valorCredito)}</span>
            </div>
            <div className="encerrar-field">
              <span className="lbl">Prazo</span>
              <span className="val">{MOCK_GRUPO.prazoMeses} meses</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="encerrar-field" style={{ flex: 1 }}>
                <span className="lbl">Total Cotas</span>
                <span className="val">{MOCK_GRUPO.totalCotas}</span>
              </div>
              <div className="encerrar-field" style={{ flex: 1 }}>
                <span className="lbl">Ativas</span>
                <span className="val" style={{ color: 'var(--success)' }}>{MOCK_GRUPO.cotasAtivas}</span>
              </div>
              <div className="encerrar-field" style={{ flex: 1 }}>
                <span className="lbl">Canceladas</span>
                <span className="val" style={{ color: 'var(--danger)' }}>{MOCK_GRUPO.cotasCanceladas}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Análise de Prazo Legal */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '1.4rem' }}>⏱️</span>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: 700 }}>Análise de Prazo Legal</h3>
          </div>
          <div className="encerrar-field-grid">
            <div className="encerrar-field">
              <span className="lbl">Última AGO</span>
              <span className="val">{formatDate(MOCK_PRAZO_LEGAL.dataUltimaAGO)}</span>
            </div>
            <div className="encerrar-field">
              <span className="lbl">Prazo Máximo (120 dias)</span>
              <span className="val">{formatDate(MOCK_PRAZO_LEGAL.prazoMaximoEncerramento)}</span>
            </div>
            <div className="encerrar-field">
              <span className="lbl">Dias Restantes</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="val" style={{ color: prazoIndicator.color, fontSize: '1.6rem', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
                  {MOCK_PRAZO_LEGAL.diasRestantes}
                </span>
                <span className={`badge ${prazoIndicator.className}`}>
                  {prazoIndicator.label}
                </span>
              </div>
            </div>
            {/* Barra de progresso */}
            <div style={{ marginTop: '8px' }}>
              <div style={{
                width: '100%',
                height: '8px',
                borderRadius: '99px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    borderRadius: '99px',
                    background: `linear-gradient(90deg, var(--success), ${prazoIndicator.color})`,
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${Math.round(progressPercent)}% do prazo legal consumido`}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Última AGO</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{Math.round(progressPercent)}% consumido</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>120 dias</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Saldos Atuais */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '1.4rem' }}>💰</span>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: 700 }}>Saldos Atuais</h3>
          </div>

          {/* Fundo Comum */}
          <div className="saldo-card" style={{
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            padding: '18px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Fundo Comum (FC)
              </span>
              <span className="monospace" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {MOCK_SALDOS.fundoComum.contaCosif}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
              {formatCurrency(MOCK_SALDOS.fundoComum.saldo)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {MOCK_SALDOS.fundoComum.descricao}
            </div>
          </div>

          {/* Fundo de Reserva */}
          <div className="saldo-card" style={{
            background: 'rgba(59, 130, 246, 0.06)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Fundo de Reserva (FR)
              </span>
              <span className="monospace" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {MOCK_SALDOS.fundoReserva.contaCosif}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--info)' }}>
              {formatCurrency(MOCK_SALDOS.fundoReserva.saldo)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {MOCK_SALDOS.fundoReserva.descricao}
            </div>
          </div>
        </div>
      </div>

      {/* ===== CARD PÓS-ENCERRAMENTO: Resumo PDD ===== */}
      {isEncerrado && (
        <div className="glass-panel animate-fade-in" style={{ padding: '30px', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '1.5rem' }}>📊</span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--warning)' }}>
                Resumo PDD — Provisão de Devedores Duvidosos
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Lançamentos contábeis gerados automaticamente no encerramento
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {/* Parcelas Baixadas */}
            <div className="encerrar-resumo-metric">
              <span className="lbl">Parcelas Baixadas</span>
              <span className="val" style={{ fontFamily: 'var(--font-title)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)' }}>
                {MOCK_RESUMO_PDD.parcelasBaixadas}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>parcelas inadimplentes</span>
            </div>

            {/* Valor PDD */}
            <div className="encerrar-resumo-metric">
              <span className="lbl">Valor Total PDD</span>
              <span className="val" style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--warning)' }}>
                {formatCurrency(MOCK_RESUMO_PDD.valorTotalPDD)}
              </span>
              <div className="monospace" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                D: {MOCK_RESUMO_PDD.contaDebitoCosif}<br />
                C: {MOCK_RESUMO_PDD.contaCreditoCosif}
              </div>
            </div>

            {/* Contas COSIF */}
            <div className="encerrar-resumo-metric">
              <span className="lbl">Lançamento Contábil</span>
              <div style={{ marginTop: '6px' }}>
                <div style={{ fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span className="statement-badge-debito">DÉBITO</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    {MOCK_RESUMO_PDD.contaDebitoDescricao}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem' }}>
                  <span className="statement-badge-credito">CRÉDITO</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    {MOCK_RESUMO_PDD.contaCreditoDescricao}
                  </span>
                </div>
              </div>
            </div>

            {/* Valor RNP */}
            <div className="encerrar-resumo-metric">
              <span className="lbl">Recursos Não Procurados</span>
              <span className="val" style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--secondary)' }}>
                {formatCurrency(MOCK_RESUMO_PDD.valorRNP)}
              </span>
              <div className="monospace" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {MOCK_RESUMO_PDD.contaRNPCosif}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {MOCK_RESUMO_PDD.contaRNPDescricao}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DE CONFIRMAÇÃO GLASSMORPHISM ===== */}
      {showModal && (
        <div
          className="modal-backdrop"
          onClick={() => !isProcessing && setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-encerrar-titulo"
        >
          <div
            className="glass-panel modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>⚠️</span>
              <h3 id="modal-encerrar-titulo" style={{ fontFamily: 'var(--font-title)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--danger)' }}>
                Confirmar Encerramento de Grupo
              </h3>
            </div>

            <div style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              lineHeight: '1.6',
              color: 'var(--text-main)',
            }}>
              <p><strong>Atenção:</strong> Esta ação é <strong>irreversível</strong> e executará:</p>
              <ul style={{ marginTop: '10px', marginLeft: '16px' }}>
                <li>Baixa de {MOCK_RESUMO_PDD.parcelasBaixadas} parcelas inadimplentes para PDD</li>
                <li>Transferência de {formatCurrency(MOCK_RESUMO_PDD.valorRNP)} para conta RNP</li>
                <li>Mudança de status do grupo para <strong>ENCERRADO</strong></li>
                <li>Lançamentos contábeis automáticos no Ledger COSIF</li>
              </ul>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              marginBottom: '6px',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Grupo</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{MOCK_GRUPO.codigo}</span>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Prazo Legal Restante</span>
              <span style={{ fontWeight: 700, color: prazoIndicator.color }}>{MOCK_PRAZO_LEGAL.diasRestantes} dias</span>
            </div>

            <div className="modal-buttons" style={{ marginTop: '28px' }}>
              <button
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleEncerrar}
                disabled={isProcessing}
                aria-label="Confirmar encerramento definitivo do grupo"
              >
                {isProcessing ? '⏳ Processando...' : '🔒 Confirmar Encerramento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
