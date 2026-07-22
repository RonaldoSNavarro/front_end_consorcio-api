import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { XCircle, Calculator, X, Search } from 'lucide-react';
import { TableSkeleton } from '../components/ui/Skeleton';

const cotaStatusBadge = (status) => {
  const map = { 
    'ATIVA': 'badge-success', 
    'CONTEMPLADA': 'badge-info', 
    'CANCELADA': 'badge-danger', 
    'EXCLUIDA': 'badge-danger',
    'EM_EXECUCAO': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    'ENCERRADA': 'badge-neutral',
    'SUSPENSA': 'badge-warning',
    'AGUARDANDO_INAUGURACAO': 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
  };
  return map[status] || 'badge-neutral';
};

export const CotasPage = () => {
  const { triggerToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [cotaCancelarId, setCotaCancelarId] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  // --- Search form state ---
  const [searchGrupoId, setSearchGrupoId] = useState('');
  const [searchNumeroCota, setSearchNumeroCota] = useState('');
  const [searchVersao, setSearchVersao] = useState('');
  const [searchCpfCnpj, setSearchCpfCnpj] = useState('');

  // --- Mutations ---
  const searchMutation = useMutation({
    mutationFn: () => api.cotas.buscar(searchGrupoId, searchNumeroCota, searchVersao, searchCpfCnpj),
    onSuccess: (data) => {
      const res = (data.content || data || []).filter(c => c.status !== 'DISPONIVEL' && (c.nomeConsorciado || c.clienteId));
      setSearchResults(res);
      if (res.length === 0) {
        triggerToast('Nenhuma cota com consorciado encontrada para os filtros informados.', 'warning');
      }
    },
    onError: (err) => triggerToast(err.message || 'Erro ao buscar cotas', 'danger'),
  });

  const cancelarMutation = useMutation({
    mutationFn: (id) => api.cotas.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotas'] });
      triggerToast("Cota Cancelada logicamente e parcelas excluídas.", "warning");
      if (searchResults) searchMutation.mutate();
    },
    onError: (err) => triggerToast(err.message || "Erro ao cancelar cota", "danger"),
  });

  const reembolsarMutation = useMutation({
    mutationFn: (id) => api.cotas.reembolsar(id),
    onSuccess: (data) => {
      setSimulationResult(data);
      triggerToast("Cálculo de reembolso gerado com sucesso!", "success");
    },
    onError: (err) => triggerToast(err.message || "Erro ao simular reembolso", "danger"),
  });

  // --- Handlers ---
  const handleSearch = (e) => {
    e.preventDefault();
    searchMutation.mutate();
  };

  const handleCancelar = async (id) => {
    cancelarMutation.mutate(id);
    setCotaCancelarId(null);
  };

  const handleReembolsar = (id) => {
    reembolsarMutation.mutate(id);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gestão de Cotas</h2>
          <p className="text-sm text-slate-400 mt-1">Busca e gestão de cotas consorciais</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="glass-panel p-5">
        <h3 className="text-base font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-brand-500" /> Buscar Cotas
        </h3>
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="form-group">
            <label htmlFor="search-grupo">Grupo</label>
            <input
              id="search-grupo"
              type="text"
              value={searchGrupoId}
              onChange={(e) => setSearchGrupoId(e.target.value)}
              placeholder="Ex: GRUPO-A12"
            />
          </div>
          <div className="form-group">
            <label htmlFor="search-numero">Nº da Cota</label>
            <input
              id="search-numero"
              type="number"
              value={searchNumeroCota}
              onChange={(e) => setSearchNumeroCota(e.target.value)}
              placeholder="Ex: 5"
            />
          </div>
          <div className="form-group">
            <label htmlFor="search-versao">Versão</label>
            <input
              id="search-versao"
              type="number"
              value={searchVersao}
              onChange={(e) => setSearchVersao(e.target.value)}
              placeholder="Ex: 1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="search-cpf">CPF/CNPJ</label>
            <input
              id="search-cpf"
              type="text"
              value={searchCpfCnpj}
              onChange={(e) => setSearchCpfCnpj(e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={searchMutation.isPending}
            >
              <Search className="w-4 h-4" />
              {searchMutation.isPending ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>
      </div>

      {/* Results Table */}
      {searchMutation.isPending && (
        <div className="animate-fade-in">
          <TableSkeleton rows={5} columns={5} />
        </div>
      )}

      {searchResults !== null && !searchMutation.isPending && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nº da Cota</th><th>Consorciado</th><th>Grupo</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-slate-400 py-8">
                    Nenhuma cota comercializada/vinculada a consorciado encontrada.
                  </td>
                </tr>
              ) : (
                searchResults.map(c => (
                  <tr
                    key={c.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                    onClick={() => navigate(`/cotas/${c.id}`)}
                  >
                    <td className="font-semibold text-slate-900 dark:text-white">Cota {c.numeroCota}</td>
                    <td className="text-sm">{c.nomeConsorciado || c.clienteId}</td>
                    <td className="text-sm">{c.codigoGrupo || c.grupoId}</td>
                    <td><span className={`badge ${cotaStatusBadge(c.status)}`}>{c.status}</span></td>
                    <td>
                      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {c.status !== 'CANCELADA' && c.status !== 'ENCERRADA' && (
                          <button className="btn btn-danger btn-xs" onClick={() => setCotaCancelarId(c.id)}>
                            <XCircle className="w-3.5 h-3.5" /> Cancelar
                          </button>
                        )}
                        {c.status === 'CANCELADA' && (
                          <button className="btn btn-outline btn-xs" onClick={() => handleReembolsar(c.id)}>
                            <Calculator className="w-3.5 h-3.5" /> Simular Devolução
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={cotaCancelarId !== null}
        title="Cancelar Cota Consorcial?"
        message="Atenção: Ao cancelar esta cota, as parcelas pendentes futuras serão excluídas de projeções conforme regra BCB."
        type="danger"
        confirmText="Confirmar"
        cancelText="Voltar"
        onConfirm={() => handleCancelar(cotaCancelarId)}
        onCancel={() => setCotaCancelarId(null)}
      />

      {simulationResult && (
        <div className="modal-backdrop" onClick={() => setSimulationResult(null)}>
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-title font-bold text-slate-900 dark:text-white">Simulador de Devoluções Rescisórias</h3>
                <p className="text-xs text-slate-400 mt-1">Conformidade com Circular BCB</p>
              </div>
              <button onClick={() => setSimulationResult(null)} className="btn-ghost p-2 rounded-lg" aria-label="Fechar"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-3 my-5">
              <div className="flex justify-between pb-3 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-sm text-slate-400">Cota</span>
                <strong className="text-sm text-slate-900 dark:text-white">nº {simulationResult.numeroCota}</strong>
              </div>
              <div className="flex justify-between pb-3 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-sm text-slate-400">Total Pago ao Fundo Comum</span>
                <strong className="text-sm text-slate-900 dark:text-white">R$ {simulationResult.totalPagoFundoComum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="flex justify-between pb-3 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-sm text-rose-500">Retenção Penal Rescisória (10%)</span>
                <strong className="text-sm text-rose-500">R$ {simulationResult.multaRescisoria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="flex justify-between pt-2 text-base">
                <span className="font-semibold text-slate-900 dark:text-white">Valor Líquido a Reembolsar</span>
                <strong className="text-brand-500">R$ {simulationResult.valorLiquidoAReembolsar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button className="btn btn-primary" onClick={() => setSimulationResult(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
