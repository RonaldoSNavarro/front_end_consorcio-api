import React, { useState } from 'react';
import { useUsuarios } from '../hooks/useUsuarios';
import { UsuarioForm } from '../components/forms/UsuarioForm';
import { Plus, Trash2, Edit2, UserX } from 'lucide-react';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const UsuariosPage = () => {
  const { usuarios, isLoading, error, excluir } = useUsuarios();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
        Erro ao carregar usuários: {error.message}
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
            Gestão de Usuários
          </h2>
          <p className="text-sm text-slate-400 mt-1">Controle de acesso e atribuição de perfis</p>
        </div>
        <div className="flex gap-3 items-center">
          <button className="btn btn-primary" onClick={() => { setEditId(null); setShowModal(true); }}>
            <Plus className="w-4 h-4" /> Novo Usuário
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
                <th>Nome Completo</th>
                <th>E-mail (Login)</th>
                <th>Perfil Atribuído</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios?.map(u => (
                <tr key={u.id}>
                  <td className="font-mono text-xs text-slate-400">#{u.id}</td>
                  <td className="font-semibold text-slate-900 dark:text-white">{u.nome}</td>
                  <td className="text-slate-500">{u.email}</td>
                  <td>
                    {u.perfil && u.perfil.nome ? (
                      <span className="badge badge-info text-[10px]">
                        {u.perfil.nome}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sem Perfil</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      <button 
                        className="btn btn-ghost btn-xs" 
                        onClick={() => handleEdit(u.id)}
                        title="Editar Usuário"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        className="btn btn-danger btn-xs" 
                        onClick={() => handleExcluir(u.id)}
                        title="Excluir Usuário"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!usuarios || usuarios.length === 0) && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400 text-sm">
                    Nenhum usuário cadastrado no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <UsuarioForm 
          onClose={() => setShowModal(false)} 
          editId={editId}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmExclusao}
        title="Excluir Usuário"
        message="Tem certeza que deseja excluir este usuário permanentemente do sistema?"
        confirmText="Excluir"
        confirmClass="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
        icon={<UserX className="w-6 h-6 text-rose-500" />}
      />
    </div>
  );
};
