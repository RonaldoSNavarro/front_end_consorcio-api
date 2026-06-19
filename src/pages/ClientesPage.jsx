import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ClienteForm } from '../components/forms/ClienteForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Plus, ScrollText, Trash2, Loader2 } from 'lucide-react';

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
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const handleInativar = (id) => {
    setConfirmInativarId(id);
  };

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
        Erro ao carregar clientes: {error.message}
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Cadastro de Consorciados
          </h2>
          <p className="text-sm text-slate-400 mt-1">Gerenciamento e Validação Legal</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditClienteId(null); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table>
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
                <tr key={c.id} className={c.statusCliente === 'INATIVO' ? 'opacity-50' : ''}>
                  <td className="font-mono text-xs text-slate-400">#{c.id}</td>
                  <td className="font-semibold text-slate-900 dark:text-white">{c.nome}</td>
                  <td className="font-mono text-xs">{c.cpfCnpj}</td>
                  <td>
                    <span className={`badge badge-${(c.nivelRisco?.toLowerCase()) === 'baixo' ? 'success' : c.nivelRisco?.toLowerCase() === 'alto' ? 'danger' : 'warning'}`}>
                      {c.nivelRisco}
                    </span>
                  </td>
                  <td>
                    {c.statusCliente === 'INATIVO' ? 
                      <span className="badge badge-danger">Inativo</span> : 
                      <span className="badge badge-success">Ativo</span>
                    }
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      <button 
                        className="btn btn-ghost btn-xs" 
                        title="Histórico de Auditoria" 
                        aria-label="Histórico de Auditoria"
                      >
                        <ScrollText className="w-3.5 h-3.5" />
                      </button>
                      {c.statusCliente !== 'INATIVO' && (
                        <button 
                          className="btn btn-danger btn-xs" 
                          onClick={() => handleInativar(c.id)} 
                          title="Inativar Consorciado" 
                          aria-label="Inativar Consorciado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 text-sm">
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
