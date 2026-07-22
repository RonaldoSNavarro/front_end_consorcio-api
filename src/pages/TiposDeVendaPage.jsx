import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Tag, Plus, Edit3, Trash2, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';

const CANAL_LABELS = {
  VENDA_DIRETA: 'Venda Direta',
  CORRESPONDENTE_BANCARIO: 'Correspondente Bancário',
  DIGITAL_SELF_SERVICE: 'Portal Digital',
  PARCERIA_COMERCIAL: 'Parceria Comercial',
};

const TipoVendaModal = ({ tipoVenda, onClose }) => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(tipoVenda || {
    nome: '', descricao: '', canal: 'VENDA_DIRETA',
    percentualComissao: 0.05, exigeSeguro: false, permiteReajuste: true, ativo: true
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const mutation = useMutation({
    mutationFn: (data) => tipoVenda
      ? api.vendas.atualizarTipo(tipoVenda.id, data)
      : api.vendas.criarTipo(data),
    onSuccess: () => {
      triggerToast(tipoVenda ? 'Tipo de venda atualizado!' : 'Tipo de venda criado!', 'success');
      queryClient.invalidateQueries({ queryKey: ['tiposVenda'] });
      onClose();
    },
    onError: (err) => triggerToast(err.message, 'danger')
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...form, percentualComissao: parseFloat(form.percentualComissao) });
  };

  const modalContent = (
    <div className="modal-backdrop flex items-center justify-center p-4 sm:p-6 z-[9999]" onClick={onClose}>
      <div className="w-full max-w-lg mx-auto p-5 sm:p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-500" />
            {tipoVenda ? 'Editar Tipo de Venda' : 'Novo Tipo de Venda'}
          </h3>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg" aria-label="Fechar"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="tv-nome">Nome *</label>
            <input id="tv-nome" name="nome" value={form.nome} onChange={handleChange} required maxLength={100} placeholder="Ex: Venda Direta Balcão" />
          </div>
          <div className="form-group">
            <label htmlFor="tv-descricao">Descrição</label>
            <textarea id="tv-descricao" name="descricao" value={form.descricao || ''} onChange={handleChange} rows={2} maxLength={500} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="tv-canal">Canal *</label>
              <select id="tv-canal" name="canal" value={form.canal} onChange={handleChange}>
                {Object.entries(CANAL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="tv-comissao">Comissão (%) *</label>
              <input id="tv-comissao" name="percentualComissao" type="number" step="0.01" min="0" max="20" value={(parseFloat(form.percentualComissao) * 100).toFixed(2)}
                onChange={(e) => setForm(prev => ({ ...prev, percentualComissao: parseFloat(e.target.value) / 100 }))} />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
              <input type="checkbox" name="exigeSeguro" checked={form.exigeSeguro} onChange={handleChange} className="w-4 h-4 rounded text-brand-500" />
              Exige Seguro
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
              <input type="checkbox" name="permiteReajuste" checked={form.permiteReajuste} onChange={handleChange} className="w-4 h-4 rounded text-brand-500" />
              Permite Reajuste (INCC)
            </label>
            {tipoVenda && (
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange} className="w-4 h-4 rounded text-brand-500" />
                Ativo
              </label>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export const TiposDeVendaPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data: tipos, isLoading, error } = useQuery({
    queryKey: ['tiposVenda'],
    queryFn: () => api.vendas.listarTiposTodos()
  });

  const inativarMutation = useMutation({
    mutationFn: (id) => api.vendas.inativarTipo(id),
    onSuccess: () => {
      triggerToast('Tipo de venda inativado.', 'success');
      queryClient.invalidateQueries({ queryKey: ['tiposVenda'] });
    },
    onError: (err) => triggerToast(err.message, 'danger')
  });

  const handleEdit = (tipo) => { setEditItem(tipo); setShowModal(true); };
  const handleNew = () => { setEditItem(null); setShowModal(true); };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-brand-500" /> Tipos de Venda
          </h2>
          <p className="text-sm text-slate-400 mt-1">Canais de comercialização e regras de proposta de adesão</p>
        </div>
        <button className="btn btn-primary" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Novo Tipo de Venda
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex gap-2 items-center">
          <AlertCircle className="w-4 h-4 shrink-0" /> Erro ao carregar: {error.message}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Canal</th>
                <th>Comissão</th>
                <th>Seguro</th>
                <th>Reajuste</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tipos && tipos.map(t => (
                <tr key={t.id}>
                  <td className="font-semibold text-slate-900 dark:text-white">
                    {t.nome}
                    {t.descricao && <div className="text-xs text-slate-400 font-normal mt-0.5">{t.descricao}</div>}
                  </td>
                  <td><span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{CANAL_LABELS[t.canal] || t.canal}</span></td>
                  <td className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{(t.percentualComissao * 100).toFixed(1)}%</td>
                  <td>{t.exigeSeguro ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                  <td>{t.permiteReajuste ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" /> : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                  <td>
                    {t.ativo
                      ? <span className="badge badge-success">Ativo</span>
                      : <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-700/50">Inativo</span>}
                  </td>
                  <td>
                    <div className="flex gap-1.5 justify-center">
                      <button className="btn btn-outline btn-xs" onClick={() => handleEdit(t)} title="Editar">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {t.ativo && (
                        <button className="btn btn-outline btn-xs !text-rose-500 !border-rose-200 hover:!bg-rose-50 dark:!border-rose-500/30 dark:hover:!bg-rose-500/10" onClick={() => inativarMutation.mutate(t.id)} title="Inativar">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {tipos && tipos.length === 0 && (
                <tr><td colSpan="7" className="text-center py-8 text-slate-400">Nenhum tipo de venda cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <TipoVendaModal tipoVenda={editItem} onClose={() => { setShowModal(false); setEditItem(null); }} />}
    </div>
  );
};
