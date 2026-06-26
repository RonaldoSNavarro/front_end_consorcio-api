import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { GrupoForm } from '../components/forms/GrupoForm';
import { Plus, Rocket, TrendingUp, Loader2 } from 'lucide-react';

const GrupoSaldoCell = ({ grupoId }) => {
  const { data: saldo, isLoading, error } = useQuery({
    queryKey: ['grupo', grupoId, 'saldo'],
    queryFn: () => api.grupos.obterSaldo(grupoId)
  });

  if (isLoading) return <span className="text-slate-400 animate-pulse">...</span>;
  if (error) return <span className="text-rose-400 text-xs">Erro</span>;

  const valor = typeof saldo === 'number' ? saldo : Number(saldo || 0);
  return <span className="text-emerald-600 dark:text-emerald-400 font-semibold">R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
};

const statusBadge = (status) => {
  const map = {
    'EM_FORMACAO': 'badge-info',
    'EM_ANDAMENTO': 'badge-success',
    'ENCERRADO': 'badge-neutral',
  };
  return map[status] || 'badge-neutral';
};

export const GruposPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
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

  if (error) {
    return <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">Erro ao carregar grupos: {error.message}</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Administração de Grupos Financeiros
          </h2>
          <p className="text-sm text-slate-400 mt-1">Configuração e Controle de Caixa</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Novo Grupo
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Código BCB</th>
                <th>Status</th>
                <th>Categoria</th>
                <th>Prazo</th>
                <th>Crédito Base</th>
                <th>Fundo Comum (Saldo)</th>
                <th>Ações Regulatórias</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(grupos) && grupos.map(g => (
                <tr key={g.id}>
                  <td className="font-semibold text-slate-900 dark:text-white">{g.codigo}</td>
                  <td>
                    <span className={`badge ${statusBadge(g.status)}`}>
                      {g.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {g.categoriaBem && (
                      <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                        {g.categoriaBem.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                  <td>{g.prazoMeses}x</td>
                  <td className="font-mono text-sm">R$ {g.valorCredito?.toLocaleString('pt-BR')}</td>
                  <td>
                    <GrupoSaldoCell grupoId={g.id} />
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      {g.status === 'EM_FORMACAO' && (
                        <button className="btn btn-outline btn-xs" onClick={() => handleInaugurarGrupo(g.id)}>
                          <Rocket className="w-3.5 h-3.5" /> Inaugurar
                        </button>
                      )}
                      {g.status === 'EM_ANDAMENTO' && (
                        <button className="btn btn-outline btn-xs" onClick={() => handleReajusteGrupo(g.id, g.valorCredito)} title="Reajuste INCC">
                          <TrendingUp className="w-3.5 h-3.5" /> Reajustar
                        </button>
                      )}
                      {g.status === 'ENCERRADO' && (
                        <span className="text-xs text-slate-400">Auditado</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {grupos.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 text-sm">
                    Nenhum grupo formado. Crie o primeiro Grupo!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <GrupoForm onClose={() => setShowModal(false)} />}

      {/* Modal de Inauguração */}
      {inaugurarGrupoId !== null && (
        <div className="modal-backdrop" onClick={() => setInaugurarGrupoId(null)}>
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-brand-500" /> Inaugurar Grupo
            </h3>
            <p className="mt-2 mb-5 text-sm text-slate-400">
              Defina a data da 1ª Assembleia Geral Ordinária (AGO) para iniciar o andamento deste grupo.
            </p>
            <div className="form-group">
              <label htmlFor="dataAGO">Data da 1ª AGO *</label>
              <input 
                id="dataAGO" type="date" 
                value={dataInauguracaoInput} 
                onChange={(e) => setDataInauguracaoInput(e.target.value)} 
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" className="btn btn-outline" onClick={() => setInaugurarGrupoId(null)}>Cancelar</button>
              <button 
                type="button" className="btn btn-primary" 
                onClick={() => {
                  if (!dataInauguracaoInput) { triggerToast("A data da assembleia é obrigatória.", "warning"); return; }
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
        <div className="modal-backdrop" onClick={() => setReajustarGrupoId(null)}>
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-500" /> Ajustar Valor do Bem de Referência
            </h3>
            <p className="mt-2 mb-5 text-sm text-slate-400">
              Informe o novo valor do bem de referência do grupo. O crédito e as parcelas em aberto serão reajustados proporcionalmente.
            </p>
            <div className="form-group">
              <label htmlFor="novoCredito">Novo Valor do Bem (R$) *</label>
              <input 
                id="novoCredito" type="number" step="0.01" 
                value={novoValorInput} 
                onChange={(e) => setNovoValorInput(e.target.value)} 
                placeholder="Ex: 85000"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" className="btn btn-outline" onClick={() => setReajustarGrupoId(null)}>Cancelar</button>
              <button 
                type="button" className="btn btn-primary" 
                onClick={() => {
                  const valor = Number(novoValorInput);
                  if (!novoValorInput || isNaN(valor) || valor <= 0) { triggerToast("Informe um valor de crédito válido maior que zero.", "warning"); return; }
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
