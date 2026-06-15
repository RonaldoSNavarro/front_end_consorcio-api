import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { GrupoForm } from '../components/forms/GrupoForm';

const GrupoSaldoCell = ({ grupoId }) => {
  const { data: saldo, isLoading, error } = useQuery({
    queryKey: ['grupo', grupoId, 'saldo'],
    queryFn: () => api.grupos.obterSaldo(grupoId)
  });

  if (isLoading) return <span style={{ color: '#9ca3af' }}>...</span>;
  if (error) return <span style={{ color: '#ef4444' }}>Erro</span>;

  const valor = typeof saldo === 'number' ? saldo : Number(saldo || 0);
  return <span>R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
};

export const GruposPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  // States for custom modals
  const [inaugurarGrupoId, setInaugurarGrupoId] = useState(null);
  const [dataInauguracaoInput, setDataInauguracaoInput] = useState('');
  const [reajustarGrupoId, setReajustarGrupoId] = useState(null);
  const [novoValorInput, setNovoValorInput] = useState('');

  const { data: gruposData, isLoading, error } = useQuery({
    queryKey: ['grupos'],
    queryFn: () => api.grupos.listar()
  });

  const grupos = gruposData?.content || gruposData || [];

  const inaugurarMutation = useMutation({
    mutationFn: ({ id, dataA }) => api.grupos.inaugurar(id, dataA),
    onSuccess: () => {
      triggerToast("Grupo Inaugurado com Sucesso! Status: EM_ANDAMENTO.", "success");
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const reajustarMutation = useMutation({
    mutationFn: ({ id, novoValor }) => api.grupos.reajustar(id, novoValor),
    onSuccess: () => {
      triggerToast("Crédito Reajustado e parcelas em aberto alteradas proporcionalmente!", "success");
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const handleInaugurarGrupo = (id) => {
    setDataInauguracaoInput(new Date().toISOString().split('T')[0]);
    setInaugurarGrupoId(id);
  };

  const handleReajusteGrupo = (id, valorAtual) => {
    setNovoValorInput(valorAtual || '');
    setReajustarGrupoId(id);
  };

  if (error) return <div style={{ color: '#ff6b6b' }}>Erro ao carregar grupos: {error.message}</div>;

  return (
    <div className="view-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mb-4">
        <div className="header-title">
          <h2>🏛️ Administração de Grupos Financeiros</h2>
          <p>Configuração e Controle de Caixa</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Novo Grupo
        </button>
      </div>

      {isLoading ? (
        <div style={{ color: '#fff' }}>Carregando grupos...</div>
      ) : (
        <div className="glass-panel table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código BCB</th>
                <th>Status</th>
                <th>Prazo (Meses)</th>
                <th>Crédito Base</th>
                <th>Fundo Comum (Saldo)</th>
                <th>Ações Regulatórias</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(grupos) && grupos.map(g => (
                <tr key={g.id}>
                  <td><strong>{g.codigo}</strong></td>
                  <td>
                    <span className={`badge badge-${g.status?.toLowerCase() || 'em_formacao'}`}>
                      {g.status}
                    </span>
                  </td>
                  <td>{g.prazoMeses}x</td>
                  <td className="money">R$ {g.valorCredito?.toLocaleString('pt-BR')}</td>
                  <td className="money" style={{ color: '#10b981' }}>
                    <GrupoSaldoCell grupoId={g.id} />
                  </td>
                  <td className="actions-cell">
                    {g.status === 'EM_FORMACAO' && (
                      <button className="btn-sm btn-outline" onClick={() => handleInaugurarGrupo(g.id)}>
                        🚀 Inaugurar
                      </button>
                    )}
                    {g.status === 'EM_ANDAMENTO' && (
                      <>
                        <button className="btn-sm btn-outline" onClick={() => handleReajusteGrupo(g.id, g.valorCredito)} title="Reajuste INCC">
                          📈 Reajustar Crédito
                        </button>
                      </>
                    )}
                    {g.status === 'ENCERRADO' && (
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Auditado</span>
                    )}
                  </td>
                </tr>
              ))}
              {grupos.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    Nenhum grupo formado. Crie o primeiro Grupo!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <GrupoForm onClose={() => setShowModal(false)} />
      )}

      {/* Modal de Inauguração */}
      {inaugurarGrupoId !== null && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setInaugurarGrupoId(null)} style={{ zIndex: 1000 }}>
          <div className="modal-card glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <h3>🚀 Inaugurar Grupo</h3>
            <p style={{ marginBottom: '20px', color: '#9ca3af', fontSize: '0.9rem' }}>
              Defina a data da 1ª Assembleia Geral Ordinária (AGO) para iniciar o andamento deste grupo.
            </p>
            <div className="form-group">
              <label htmlFor="dataAGO">Data da 1ª AGO *</label>
              <input 
                id="dataAGO"
                type="date" 
                value={dataInauguracaoInput} 
                onChange={(e) => setDataInauguracaoInput(e.target.value)} 
                style={{ width: '100%', marginTop: '5px' }}
              />
            </div>
            <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setInaugurarGrupoId(null)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  if (!dataInauguracaoInput) {
                    triggerToast("A data da assembleia é obrigatória.", "warning");
                    return;
                  }
                  inaugurarMutation.mutate({ id: inaugurarGrupoId, dataA: dataInauguracaoInput });
                  setInaugurarGrupoId(null);
                }}
              >
                Inaugurar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reajuste */}
      {reajustarGrupoId !== null && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setReajustarGrupoId(null)} style={{ zIndex: 1000 }}>
          <div className="modal-card glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <h3>📈 Reajustar Crédito do Grupo</h3>
            <p style={{ marginBottom: '20px', color: '#9ca3af', fontSize: '0.9rem' }}>
              Informe o novo valor de crédito do grupo. As parcelas em aberto serão reajustadas proporcionalmente.
            </p>
            <div className="form-group">
              <label htmlFor="novoCredito">Novo Valor do Crédito (R$) *</label>
              <input 
                id="novoCredito"
                type="number" 
                step="0.01" 
                value={novoValorInput} 
                onChange={(e) => setNovoValorInput(e.target.value)} 
                placeholder="Ex: 85000"
                style={{ width: '100%', marginTop: '5px' }}
              />
            </div>
            <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setReajustarGrupoId(null)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  const valor = Number(novoValorInput);
                  if (!novoValorInput || isNaN(valor) || valor <= 0) {
                    triggerToast("Informe um valor de crédito válido maior que zero.", "warning");
                    return;
                  }
                  reajustarMutation.mutate({ id: reajustarGrupoId, novoValor: valor });
                  setReajustarGrupoId(null);
                }}
              >
                Aplicar Reajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
