import React, { useState } from 'react';
import { usePerfis } from '../hooks/usePerfis';
import { useToast } from '../context/ToastContext';
import { PerfilForm } from '../components/forms/PerfilForm';
import { Plus, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const PerfisPage = () => {
  const { perfis, isLoading, error, excluir } = usePerfis();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
        Erro ao carregar perfis: {error.message}
      </div>
    );
  }

  const handleEdit = (id) => {
    setEditId(id);
    setShowModal(true);
  };

  const handleExcluir = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmExclusao = () => {
    if (confirmDeleteId) {
      excluir(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Perfis de Acesso
          </h2>
          <p className="text-sm text-slate-400 mt-1">Gerenciamento de regras de autorização (RBAC)</p>
        </div>
        <div className="flex gap-3 items-center">
          <button className="btn btn-primary" onClick={() => { setEditId(null); setShowModal(true); }}>
            <Plus className="w-4 h-4" /> Novo Perfil
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome do Perfil</th>
                <th>Permissões Vinculadas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {perfis?.map(p => (
                <tr key={p.id}>
                  <td className="font-mono text-xs text-slate-400">#{p.id}</td>
                  <td className="font-semibold text-slate-900 dark:text-white">{p.nome}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {p.permissoes?.map(perm => (
                        <span key={perm} className="badge badge-primary text-[10px]">
                          {perm}
                        </span>
                      ))}
                      {(!p.permissoes || p.permissoes.length === 0) && (
                        <span className="text-xs text-slate-400 italic">Nenhuma</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      <button 
                        className="btn btn-ghost btn-xs" 
                        onClick={() => handleEdit(p.id)}
                        title="Editar Perfil"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        className="btn btn-danger btn-xs" 
                        onClick={() => handleExcluir(p.id)}
                        title="Excluir Perfil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!perfis || perfis.length === 0) && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400 text-sm">
                    Nenhum perfil cadastrado no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <PerfilForm 
          onClose={() => setShowModal(false)} 
          editId={editId}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmExclusao}
        title="Excluir Perfil"
        message="Tem certeza que deseja excluir este perfil? Usuários vinculados a ele podem perder acesso."
        confirmText="Excluir"
        confirmClass="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
        icon={<ShieldAlert className="w-6 h-6 text-rose-500" />}
      />
    </div>
  );
};
