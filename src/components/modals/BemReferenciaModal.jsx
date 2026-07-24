import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Package, X, Loader2, Search, CheckCircle2 } from 'lucide-react';

export const BemReferenciaModal = ({ bem, onClose }) => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    categoriaBemId: bem?.categoriaBemId ? String(bem.categoriaBemId) : '1',
    descricao: bem?.descricao || '',
    valorAtualInput: bem?.valorAtual ? String(bem.valorAtual) : '',
    codigoFipe: bem?.codigoFipe || '',
    ativo: bem?.ativo ?? true,
  });

  const [modoFipe, setModoFipe] = useState(false);
  const [fipeMarcaId, setFipeMarcaId] = useState('');
  const [fipeModeloId, setFipeModeloId] = useState('');
  const [fipeAnoId, setFipeAnoId] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const { data: categorias = [] } = useQuery({
    queryKey: ['categoriasBem'],
    queryFn: () => api.bens.categorias()
  });

  // Queries FIPE
  const { data: marcas = [], isLoading: loadingMarcas } = useQuery({
    queryKey: ['fipeMarcas'],
    queryFn: () => api.bens.fipeMarcas(),
    enabled: modoFipe
  });

  const { data: modelosRes, isLoading: loadingModelos } = useQuery({
    queryKey: ['fipeModelos', fipeMarcaId],
    queryFn: () => api.bens.fipeModelos(fipeMarcaId),
    enabled: modoFipe && !!fipeMarcaId
  });
  const modelos = modelosRes?.modelos || [];

  const { data: anos = [], isLoading: loadingAnos } = useQuery({
    queryKey: ['fipeAnos', fipeMarcaId, fipeModeloId],
    queryFn: () => api.bens.fipeAnos(fipeMarcaId, fipeModeloId),
    enabled: modoFipe && !!fipeMarcaId && !!fipeModeloId
  });

  const { data: valorFipeObj, isLoading: loadingValorFipe } = useQuery({
    queryKey: ['fipeValor', fipeMarcaId, fipeModeloId, fipeAnoId],
    queryFn: () => api.bens.fipeConsultar(fipeMarcaId, fipeModeloId, fipeAnoId),
    enabled: modoFipe && !!fipeMarcaId && !!fipeModeloId && !!fipeAnoId
  });

  const aplicarValorFipe = () => {
    if (!valorFipeObj) return;
    const rawVal = valorFipeObj.valor || '';
    const numVal = rawVal.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
    
    setForm(prev => ({
      ...prev,
      categoriaBemId: '1',
      descricao: prev.descricao || `${valorFipeObj.marca} ${valorFipeObj.modelo} (${valorFipeObj.anoModelo})`,
      valorAtualInput: numVal,
      codigoFipe: valorFipeObj.codigoFipe || prev.codigoFipe
    }));
    triggerToast(`Valor FIPE aplicado: ${valorFipeObj.valor}`, 'success');
  };

  const mutation = useMutation({
    mutationFn: (dto) => bem
      ? api.bens.atualizar(bem.id, dto, modoFipe ? 'FIPE' : 'MANUAL')
      : api.bens.criar(dto),
    onSuccess: () => {
      triggerToast(bem ? 'Bem de referência atualizado com sucesso!' : 'Bem de referência criado com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['bensReferencia'] });
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
    const valor = parseFloat(form.valorAtualInput);
    if (isNaN(valor) || valor <= 0) {
      triggerToast('Informe um valor válido maior que zero.', 'warning');
      return;
    }

    mutation.mutate({
      categoriaBemId: Number(form.categoriaBemId),
      descricao: form.descricao.trim(),
      valorAtual: valor,
      codigoFipe: form.codigoFipe.trim() || null,
      ativo: form.ativo
    });
  };

  const modalContent = (
    <div className="modal-backdrop flex items-center justify-center p-4 sm:p-6 z-[9999]" onClick={onClose}>
      <div 
        className="w-full max-w-xl mx-auto p-5 sm:p-6 rounded-2xl animate-scale-up
                   bg-white dark:bg-slate-800 
                   border border-slate-200 dark:border-slate-700/60
                   shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-500" />
            {bem ? 'Editar Bem de Referência' : 'Novo Bem de Referência'}
          </h3>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg" aria-label="Fechar"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl mb-5">
          <button
            type="button"
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${!modoFipe ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setModoFipe(false)}
          >
            Cadastro Manual
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${modoFipe ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setModoFipe(true)}
          >
            <Search className="w-3.5 h-3.5" /> Consulta Tabela FIPE
          </button>
        </div>

        {modoFipe && (
          <div className="p-4 mb-5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Busca Oficial Tabela FIPE (Parallelum API)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="form-group mb-0">
                <label htmlFor="fipe-marca">Marca</label>
                <select id="fipe-marca" value={fipeMarcaId} onChange={(e) => { setFipeMarcaId(e.target.value); setFipeModeloId(''); setFipeAnoId(''); }}>
                  <option value="">Selecione...</option>
                  {loadingMarcas ? <option disabled>Carregando...</option> : marcas.map(m => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
                </select>
              </div>

              <div className="form-group mb-0">
                <label htmlFor="fipe-modelo">Modelo</label>
                <select id="fipe-modelo" value={fipeModeloId} onChange={(e) => { setFipeModeloId(e.target.value); setFipeAnoId(''); }} disabled={!fipeMarcaId}>
                  <option value="">Selecione...</option>
                  {loadingModelos ? <option disabled>Carregando...</option> : modelos.map(m => <option key={m.codigo} value={m.codigo}>{m.nome}</option>)}
                </select>
              </div>

              <div className="form-group mb-0">
                <label htmlFor="fipe-ano">Ano/Combustível</label>
                <select id="fipe-ano" value={fipeAnoId} onChange={(e) => setFipeAnoId(e.target.value)} disabled={!fipeModeloId}>
                  <option value="">Selecione...</option>
                  {loadingAnos ? <option disabled>Carregando...</option> : anos.map(a => <option key={a.codigo} value={a.codigo}>{a.nome}</option>)}
                </select>
              </div>
            </div>

            {loadingValorFipe && (
              <div className="flex items-center gap-2 text-xs text-brand-500 py-1">
                <Loader2 className="w-4 h-4 animate-spin" /> Consultando valor oficial FIPE...
              </div>
            )}

            {valorFipeObj && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 mt-2">
                <div>
                  <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{valorFipeObj.marca} {valorFipeObj.modelo} ({valorFipeObj.anoModelo})</div>
                  <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">{valorFipeObj.valor}</div>
                  <div className="text-[0.65rem] text-emerald-700 dark:text-emerald-400">Código FIPE: {valorFipeObj.codigoFipe} | Ref: {valorFipeObj.mesReferencia}</div>
                </div>
                <button type="button" className="btn btn-xs bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1" onClick={aplicarValorFipe}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Usar Valor
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="bm-cat">Categoria do Bem *</label>
            <select id="bm-cat" name="categoriaBemId" value={form.categoriaBemId} onChange={handleChange}>
              {categorias && categorias.length > 0 ? (
                categorias.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.indiceReajustePadrao || 'FIPE'})
                  </option>
                ))
              ) : (
                <>
                  <option value="1">Veículos Automotores (FIPE)</option>
                  <option value="2">Imóveis (INCC)</option>
                  <option value="3">Serviços (IPCA)</option>
                  <option value="4">Outros Bens Móveis (IPCA)</option>
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bm-desc">Descrição do Bem *</label>
            <input id="bm-desc" name="descricao" value={form.descricao} onChange={handleChange} required maxLength={255} placeholder="Ex: Sedan Premium 2.0 Flex 4P" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="bm-valor">Valor Atual (R$) *</label>
              <input id="bm-valor" name="valorAtualInput" type="number" step="0.01" value={form.valorAtualInput} onChange={handleChange} required placeholder="Ex: 150000.00" />
            </div>

            <div className="form-group">
              <label htmlFor="bm-fipe">Código FIPE (Opcional)</label>
              <input id="bm-fipe" name="codigoFipe" value={form.codigoFipe} onChange={handleChange} placeholder="Ex: 004001-8" />
            </div>
          </div>

          {bem && (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300 pt-1">
              <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange} className="w-4 h-4 rounded text-brand-500" />
              Bem de Referência Ativo
            </label>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={mutation.isPending}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {mutation.isPending ? 'Salvando...' : 'Salvar Bem de Referência'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
