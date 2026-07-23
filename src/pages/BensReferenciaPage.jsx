import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { BemReferenciaModal } from '../components/modals/BemReferenciaModal';
import { HistoricoPrecosModal } from '../components/modals/HistoricoPrecosModal';
import { Package, Plus, Edit3, History, AlertCircle, Filter, Search } from 'lucide-react';

export const BensReferenciaPage = () => {
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [historicoItem, setHistoricoItem] = useState(null);

  const { data: bensRes, isLoading, error } = useQuery({
    queryKey: ['bensReferencia', categoriaFiltro],
    queryFn: () => api.bens.listar(categoriaFiltro ? Number(categoriaFiltro) : null)
  });

  const bensList = Array.isArray(bensRes?.content) ? bensRes.content : (Array.isArray(bensRes) ? bensRes : []);

  const bensFiltrados = bensList.filter(b => 
    !busca || b.descricao?.toLowerCase().includes(busca.toLowerCase()) || b.codigoFipe?.toLowerCase().includes(busca.toLowerCase())
  );

  const handleEdit = (bem) => { setEditItem(bem); setShowModal(true); };
  const handleNew = () => { setEditItem(null); setShowModal(true); };
  const handleHistorico = (bem) => { setHistoricoItem(bem); };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-500" /> Bens de Referência
          </h2>
          <p className="text-sm text-slate-400 mt-1">Catálogo de referência para cartas de crédito e reajuste de tabela (FIPE/INCC)</p>
        </div>
        <button className="btn btn-primary" onClick={handleNew}>
          <Plus className="w-4 h-4" /> Novo Bem de Referência
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="pl-9 text-xs"
            placeholder="Buscar por descrição ou código FIPE..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            className="text-xs py-2"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todas as Categorias</option>
            <option value="1">Veículos Automotores</option>
            <option value="2">Imóveis</option>
            <option value="3">Serviços</option>
            <option value="4">Outros Bens Móveis</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex gap-2 items-center">
          <AlertCircle className="w-4 h-4 shrink-0" /> Erro ao carregar bens de referência: {error.message}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="text-left">Descrição do Bem</th>
                <th className="text-left">Categoria / Reajuste</th>
                <th className="text-right">Valor Atual (Crédito Base)</th>
                <th className="text-center">Código FIPE</th>
                <th className="text-center">Última Atualização</th>
                <th className="text-center">Status</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {bensFiltrados.map(b => (
                <tr key={b.id}>
                  <td className="text-left font-semibold text-slate-900 dark:text-white">
                    {b.descricao}
                  </td>
                  <td className="text-left">
                    <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300">
                      {b.nomeCategoria || 'Veículo Automotor'} ({b.indiceReajustePadrao || 'FIPE'})
                    </span>
                  </td>
                  <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    R$ {Number(b.valorAtual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-center font-mono text-xs text-slate-500">
                    {b.codigoFipe || '—'}
                  </td>
                  <td className="text-center font-mono text-xs text-slate-500">
                    {b.dataUltimaAtualizacao ? new Date(b.dataUltimaAtualizacao).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="text-center">
                    {b.ativo
                      ? <span className="badge badge-success">Ativo</span>
                      : <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-700/50">Inativo</span>}
                  </td>
                  <td className="text-center">
                    <div className="flex gap-1.5 justify-center">
                      <button className="btn btn-outline btn-xs" onClick={() => handleEdit(b)} title="Editar / Reajustar">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button className="btn btn-outline btn-xs !text-purple-600 !border-purple-200 hover:!bg-purple-50 dark:!border-purple-500/30 dark:hover:!bg-purple-500/10" onClick={() => handleHistorico(b)} title="Histórico de Valores">
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bensFiltrados.length === 0 && (
                <tr><td colSpan="7" className="text-center py-8 text-slate-400">Nenhum bem de referência encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <BemReferenciaModal bem={editItem} onClose={() => { setShowModal(false); setEditItem(null); }} />}
      {historicoItem && <HistoricoPrecosModal bem={historicoItem} onClose={() => setHistoricoItem(null)} />}
    </div>
  );
};
