import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CotaForm } from '../components/forms/CotaForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const CotasPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [cotaCancelarId, setCotaCancelarId] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);

  const { data: cotasData, isLoading, error } = useQuery({
    queryKey: ['cotas'],
    queryFn: () => api.cotas.listar()
  });

  const cotas = cotasData?.content || cotasData || [];

  const cancelarMutation = useMutation({
    mutationFn: (id) => api.cotas.cancelar(id),
    onSuccess: () => {
      triggerToast("Cota Cancelada logicamente e parcelas excluídas.", "warning");
      queryClient.invalidateQueries({ queryKey: ['cotas'] });
      setCotaCancelarId(null);
    },
    onError: (err) => {
      triggerToast(err.message, "danger");
      setCotaCancelarId(null);
    }
  });

  const reembolsarMutation = useMutation({
    mutationFn: (id) => api.cotas.reembolsar(id),
    onSuccess: (res) => {
      setSimulationResult(res);
      triggerToast("Cálculo de reembolso gerado com sucesso!", "success");
      queryClient.invalidateQueries({ queryKey: ['cotas'] });
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const handleCancelarCota = (id) => {
    setCotaCancelarId(id);
  };

  const handleReembolsarCota = (id) => {
    reembolsarMutation.mutate(id);
  };

  if (error) return <div style={{ color: '#ff6b6b' }}>Erro: {error.message}</div>;

  return (
    <div className="view-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mb-4">
        <div className="header-title">
          <h2>🎫 Emissão & Venda de Cotas</h2>
          <p>Vinculação de Clientes a Grupos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Emitir Nova Cota
        </button>
      </div>

      {isLoading ? (
        <div style={{ color: '#fff' }}>Carregando cotas...</div>
      ) : (
        <div className="glass-panel table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº da Cota</th>
                <th>Cliente ID</th>
                <th>Grupo ID</th>
                <th>Status da Cota</th>
                <th>Ações e Baixas</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(cotas) && cotas.map(c => (
                <tr key={c.id}>
                  <td><strong>Cota {c.numeroCota}</strong></td>
                  <td>Ref: {c.clienteId}</td>
                  <td>Grupo: {c.grupoId}</td>
                  <td>
                    <span className={`badge badge-${c.status?.toLowerCase() || 'ativa'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {c.status !== 'CANCELADA' && c.status !== 'ENCERRADA' && (
                      <button className="btn-sm btn-danger" onClick={() => handleCancelarCota(c.id)}>
                        Cancelar
                      </button>
                    )}
                    {c.status === 'CANCELADA' && (
                      <button className="btn-sm btn-outline" onClick={() => handleReembolsarCota(c.id)}>
                        Simular Devolução
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CotaForm onClose={() => setShowModal(false)} />
      )}

      <ConfirmDialog
        isOpen={cotaCancelarId !== null}
        title="Cancelar Cota Consorcial?"
        message="Atenção: Ao cancelar esta cota, as parcelas pendentes futuras serão excluídas de projeções conforme regra BCB."
        type="danger"
        confirmText="Confirmar"
        cancelText="Voltar"
        onConfirm={() => cancelarMutation.mutate(cotaCancelarId)}
        onCancel={() => setCotaCancelarId(null)}
      />

      {simulationResult && (
        <div className="modal-backdrop animate-fade-in" style={{ zIndex: 1000 }} onClick={() => setSimulationResult(null)}>
          <div className="modal-card glass-panel" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="header-title mb-4">
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600 }}>Simulador de Devoluções Rescisórias</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Conformidade com Circular BCB</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: '#f3f4f6', margin: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Cota</span>
                <strong>nº {simulationResult.numeroCota}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: '#9ca3af' }}>Total Pago ao Fundo Comum</span>
                <strong>R$ {simulationResult.totalPagoFundoComum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ color: '#ef4444' }}>Retenção Penal Rescisória (10%)</span>
                <strong style={{ color: '#ef4444' }}>R$ {simulationResult.multaRescisoria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontSize: '1.1rem' }}>
                <span style={{ fontWeight: 600 }}>Valor Líquido a Reembolsar</span>
                <strong style={{ color: '#F59E0B' }}>R$ {simulationResult.valorLiquidoAReembolsar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={() => setSimulationResult(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
