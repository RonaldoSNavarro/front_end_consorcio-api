import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ClienteForm } from '../components/forms/ClienteForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const ClientesPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editClienteId, setEditClienteId] = useState(null);
  const [confirmInativarId, setConfirmInativarId] = useState(null);
  
  // React Query gerenciando o Fetch e Cache!
  const { data: clientesData, isLoading, error } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => api.clientes.listar(0, 100)
  });

  const clientes = clientesData?.content || clientesData || [];
  
  // React Query gerenciando as mutações (ações que alteram dados)
  const inativarMutation = useMutation({
    mutationFn: (id) => api.clientes.inativar(id),
    onSuccess: () => {
      triggerToast("Cliente inativado logicamente conforme RGPD/LGPD.", "warning");
      // Força a atualização da lista automaticamente!
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const handleInativar = (id) => {
    setConfirmInativarId(id);
  };

  if (error) {
    return <div style={{ color: '#ff6b6b' }}>Erro ao carregar clientes: {error.message}</div>;
  }

  return (
    <div className="view-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mb-4">
        <div className="header-title">
          <h2>👥 Cadastro de Consorciados</h2>
          <p>Gerenciamento e Validação Legal</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditClienteId(null); setShowModal(true); }}>
          + Novo Cliente
        </button>
      </div>

      {isLoading ? (
        <div style={{ color: '#fff' }}>Carregando consorciados...</div>
      ) : (
        <div className="glass-panel table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome / Razão Social</th>
                <th>CPF / CNPJ</th>
                <th>Risco</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(clientes) && clientes.map(c => (
                <tr key={c.id} className={(c.statusCliente === 'INATIVO') ? 'row-inative' : ''}>
                  <td>#{c.id}</td>
                  <td><strong>{c.nome}</strong></td>
                  <td className="mono">{c.cpfCnpj}</td>
                  <td>
                    <span className={`badge badge-${c.nivelRisco?.toLowerCase() || 'medio'}`}>
                      {c.nivelRisco}
                    </span>
                  </td>
                  <td>
                    {c.statusCliente === 'INATIVO' ? 
                      <span className="status-indicator error">Inativo</span> : 
                      <span className="status-indicator success">Ativo</span>
                    }
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon view" title="Histórico de Auditoria" aria-label="Histórico de Auditoria">
                      📜
                    </button>
                    {c.statusCliente !== 'INATIVO' && (
                      <button className="btn-icon danger" onClick={() => handleInativar(c.id)} title="Inativar Consorciado" aria-label="Inativar Consorciado">
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    Nenhum cliente cadastrado no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ClienteForm 
          onClose={() => setShowModal(false)} 
          editClienteId={editClienteId}
        />
      )}

      <ConfirmDialog 
        isOpen={confirmInativarId !== null}
        title="LGPD Compliance: Inativar Consorciado?"
        message="Atenção: A inativação lógica mascarará permanentemente todos os dados de contato do cliente por obrigação regulatória. Esta operação é irreversível no nível operacional."
        type="danger"
        confirmText="Confirmar Inativação"
        cancelText="Voltar"
        onConfirm={() => {
          inativarMutation.mutate(confirmInativarId);
          setConfirmInativarId(null);
        }}
        onCancel={() => setConfirmInativarId(null)}
      />
    </div>
  );
};
