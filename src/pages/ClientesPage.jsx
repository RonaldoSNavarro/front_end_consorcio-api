import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ClienteForm } from '../components/forms/ClienteForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Plus, ScrollText, Trash2, Loader2, X, Clock, Search } from 'lucide-react';
import { TableSkeleton, Skeleton } from '../components/ui/Skeleton';

export const ClientesPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editClienteId, setEditClienteId] = useState(null);
  const [confirmInativarId, setConfirmInativarId] = useState(null);
  const [historicoClienteId, setHistoricoClienteId] = useState(null);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);

  const { data: historicoData, isLoading: historicoLoading } = useQuery({
    queryKey: ['clienteHistorico', historicoClienteId],
    queryFn: () => api.clientes.obterHistorico(historicoClienteId),
    enabled: !!historicoClienteId,
  });

  const handleHistoricoClick = (id) => {
    setHistoricoClienteId(id);
    setShowHistoricoModal(true);
  };
  
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce para evitar chamadas de API a cada letra digitada
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Volta para a página 1 ao pesquisar
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // React Query gerenciando o Fetch e Cache com Paginação e Busca!
  const { data: clientesData, isLoading, error } = useQuery({
    queryKey: ['clientes', page, size, debouncedSearch],
    queryFn: () => api.clientes.listar(page, size, debouncedSearch)
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
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar por Nome ou CPF/CNPJ..." 
              className="form-input pl-9 text-sm w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditClienteId(null); setShowModal(true); }}>
            <Plus className="w-4 h-4" /> Novo Cliente
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-fade-in">
          <TableSkeleton rows={10} columns={6} />
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
                        onClick={() => handleHistoricoClick(c.id)}
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
          <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 rounded-b-xl">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 font-medium">Itens por página:</span>
              <select 
                className="form-input py-1 px-2 text-sm w-20" 
                value={size} 
                onChange={e => { setSize(Number(e.target.value)); setPage(0); }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 font-medium">
                Página {page + 1} de {clientesData?.totalPages || 1}
              </span>
              <div className="flex gap-1.5">
                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={() => setPage(p => Math.max(0, p - 1))} 
                  disabled={page === 0}
                >
                  Anterior
                </button>
                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={() => setPage(p => p + 1)} 
                  disabled={clientesData?.last ?? true}
                >
                  Próxima
                </button>
                <button 
                  className="btn btn-outline btn-sm" 
                  onClick={() => setPage(clientesData?.totalPages ? clientesData.totalPages - 1 : 0)} 
                  disabled={clientesData?.last ?? true}
                >
                  Última
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <ClienteForm 
          onClose={() => setShowModal(false)} 
          editClienteId={editClienteId}
        />
      )}

      {/* Modal Histórico de Auditoria */}
      {showHistoricoModal && (
        <div className="modal-backdrop" onClick={() => { setShowHistoricoModal(false); setHistoricoClienteId(null); }}>
          <div
            className="w-full max-w-2xl mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-500" /> Histórico de Auditoria
              </h3>
              <button onClick={() => { setShowHistoricoModal(false); setHistoricoClienteId(null); }} className="btn-ghost p-2 rounded-lg" aria-label="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>

            {historicoLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {Array.isArray(historicoData) && historicoData.length > 0 ? (
                  historicoData.map((h, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{h.tipoInteracao || h.tipo}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {h.dataInteracao ? new Date(h.dataInteracao).toLocaleString('pt-BR') : ''}
                        </span>
                      </div>
                      {h.descricao && <p className="text-xs text-slate-500 mt-1">{h.descricao}</p>}
                      {h.usuarioResponsavel && (
                        <p className="text-[10px] text-slate-400 mt-1">Por: {h.usuarioResponsavel}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum histórico de auditoria encontrado.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
