import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ArrowLeft, FileText, History, Wallet, AlertTriangle, CircleDot } from 'lucide-react';
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
    'AGUARDANDO_INAUGURACAO': 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  };
  return map[status] || 'badge-neutral';
};

export const CotaDetalhePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumo');

  // --- Queries ---
  const { data: cota, isLoading: isLoadingCota } = useQuery({
    queryKey: ['cota-detalhe', id],
    queryFn: () => api.cotas.buscarPorId(id),
    enabled: !!id,
  });

  const { data: versoesData } = useQuery({
    queryKey: ['cotas', id, 'versoes'],
    queryFn: () => api.cotas.listarVersoes(id),
    enabled: !!id,
  });
  const versoes = versoesData || [];

  const { data: movimentosData } = useQuery({
    queryKey: ['cotas', id, 'movimentos'],
    queryFn: () => api.cotas.obterMovimentos(id),
    enabled: !!id,
  });
  const movimentos = movimentosData || [];

  const { data: parcelasData } = useQuery({
    queryKey: ['parcelas-cota', id],
    queryFn: () => api.parcelas.listarPorCota(id),
    enabled: !!id,
  });
  const parcelas = parcelasData?.content || parcelasData || [];

  const { data: inadimplenciaData } = useQuery({
    queryKey: ['inadimplencia-cota', id],
    queryFn: () => api.parcelas.obterInadimplenciaCota(id),
    enabled: !!id,
  });
  const inadimplencia = inadimplenciaData?.data || inadimplenciaData || null;

  if (isLoadingCota) {
    return (
      <div className="animate-fade-in space-y-6">
        <TableSkeleton rows={3} columns={4} />
      </div>
    );
  }

  if (!cota) {
    return (
      <div className="animate-fade-in p-6 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
        Cota não encontrada.
      </div>
    );
  }

  const parcelasPagas = parcelas.filter(p => p.status === 'PAGA');
  const parcelasAPagar = parcelas.filter(p => p.status !== 'PAGA');
  
  // Cálculo de amortização real do Fundo Comum (BACEN BCB 285)
  const somaPercentualFC = parcelasPagas.reduce((acc, p) => acc + Number(p.percentualFundoComum || p.percentualAmortizado || 0), 0);
  const percentualPago = somaPercentualFC > 0
    ? Math.min(100, Math.round(somaPercentualFC * 100 * 100) / 100)
    : Math.min(100, Math.round((parcelasPagas.length / (parcelas.length || 1)) * 100));
  const percentualAPagar = Math.max(0, Math.round((100 - percentualPago) * 100) / 100);


  return (
    <div className="animate-fade-in space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/cotas')}
        className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Cotas
      </button>

      {/* Header Info */}
      <div className="glass-panel p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <CircleDot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Cota #{cota.numeroCota}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Grupo: {cota.codigoGrupo || cota.grupoId} · Consorciado: {cota.nomeConsorciado || cota.clienteId}
              </p>
            </div>
          </div>
          <span className={`badge text-sm px-3 py-1 ${cotaStatusBadge(cota.status)}`}>
            {cota.status}
          </span>
        </div>

        <div className="mt-6 border-t border-slate-200 dark:border-slate-700/50 pt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Progresso de Pagamentos</span>
            <span className="text-sm font-bold text-brand-500">{percentualPago.toFixed(1)}% Pago</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden flex">
            <div className="bg-brand-500 h-3" style={{ width: `${percentualPago}%` }}></div>
            <div className="bg-slate-300 dark:bg-slate-600 h-3" style={{ width: `${percentualAPagar}%` }}></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-400">
            <span>{parcelasPagas.length} pagas</span>
            <span>{parcelasAPagar.length} a pagar</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700/50 pb-2">
        <button
          onClick={() => setActiveTab('resumo')}
          className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'resumo' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Resumo
        </button>
        <button
          onClick={() => setActiveTab('plano')}
          className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'plano' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Plano/Bens
        </button>
        <button
          onClick={() => setActiveTab('parcelas')}
          className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'parcelas' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Parcelas
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'resumo' && (
          <div className="space-y-6">
            {/* Inadimplência Card */}
            {inadimplencia && inadimplencia.quantidadeParcelasAtrasadas > 0 && (
              <div className="border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 p-5 rounded-2xl space-y-3 shadow-sm animate-pulse">
                <h4 className="text-rose-600 dark:text-rose-400 font-bold font-title flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" /> Cota em Atraso
                </h4>
                <div className="text-xs space-y-1 text-rose-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Parcelas Atrasadas:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{inadimplencia.quantidadeParcelasAtrasadas}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saldo Devedor Nominal:</span>
                    <span>R$ {inadimplencia.saldoDevedorNominal?.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Multa Acumulada (2%):</span>
                    <span>R$ {inadimplencia.multaAcumulada?.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Juros Mora:</span>
                    <span>R$ {inadimplencia.jurosMoraAcumulado?.toLocaleString('pt-BR')}</span>
                  </div>
                  <hr className="border-rose-200 dark:border-rose-500/20 my-2" />
                  <div className="flex justify-between font-bold text-sm text-rose-900 dark:text-white">
                    <span>Total para Quitação:</span>
                    <span>R$ {inadimplencia.valorTotalParaQuitacao?.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Histórico de Versões */}
            <div className="glass-panel p-5">
              <h3 className="text-base font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-brand-500" /> Histórico de Versões
              </h3>
              {versoes.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Nenhum histórico de versões disponível.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>Versão</th><th>Status Anterior</th><th>Status Novo</th><th>Motivo</th><th>Data</th><th>Usuário</th>
                      </tr>
                    </thead>
                    <tbody>
                      {versoes.map((v, idx) => (
                        <tr key={v.id || idx}>
                          <td className="font-semibold text-slate-900 dark:text-white">{v.versao ?? idx + 1}</td>
                          <td>{v.statusAnterior ? <span className={`badge ${cotaStatusBadge(v.statusAnterior)}`}>{v.statusAnterior}</span> : '—'}</td>
                          <td>{v.statusNovo ? <span className={`badge ${cotaStatusBadge(v.statusNovo)}`}>{v.statusNovo}</span> : '—'}</td>
                          <td className="text-sm">{v.motivo || v.descricao || '—'}</td>
                          <td>{v.dataCriacao ? new Date(v.dataCriacao).toLocaleDateString('pt-BR') : v.data ? new Date(v.data).toLocaleDateString('pt-BR') : '—'}</td>
                          <td className="text-sm">{v.usuario || v.criadoPor || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Movimentos Financeiros */}
            <div className="glass-panel p-5">
              <h3 className="text-base font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" /> Movimentos Financeiros
              </h3>
              {movimentos.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Nenhum movimento financeiro registrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th><th>Tipo</th><th>Valor</th><th>Data</th><th>Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimentos.map((m) => (
                        <tr key={m.id}>
                          <td className="font-semibold text-slate-900 dark:text-white">#{m.id}</td>
                          <td>
                            <span className={`badge ${
                              m.tipo === 'CREDITO' || m.tipoMovimento === 'CREDITO' ? 'badge-success'
                              : m.tipo === 'DEBITO' || m.tipoMovimento === 'DEBITO' ? 'badge-danger'
                              : 'badge-neutral'
                            }`}>
                              {m.tipo || m.tipoMovimento || '—'}
                            </span>
                          </td>
                          <td className="font-mono text-xs">
                            R$ {(m.valor || m.valorMovimento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td>{m.data ? new Date(m.data).toLocaleDateString('pt-BR') : m.dataCriacao ? new Date(m.dataCriacao).toLocaleDateString('pt-BR') : '—'}</td>
                          <td className="text-sm">{m.descricao || m.historico || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'plano' && (
          <div className="glass-panel p-5">
            <h3 className="text-base font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-500" /> Detalhes do Plano / Bem
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Nome do Bem de Referência</p>
                <p className="font-semibold text-slate-900 dark:text-white">{cota.nomeBemReferencia || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Valor do Bem de Referência</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {cota.valorBemReferencia ? `R$ ${cota.valorBemReferencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Categoria do Bem</p>
                <p className="font-semibold text-slate-900 dark:text-white">{cota.categoriaBem || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'parcelas' && (
          <div className="glass-panel p-5">
            <h3 className="text-base font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-brand-500" /> Todas as Parcelas
            </h3>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Nº Parcela</th>
                    <th>Data Vencimento</th>
                    <th>Valor Parcela</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parcelas.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-slate-500">Nenhuma parcela encontrada</td>
                    </tr>
                  ) : (
                    parcelas.map(p => (
                      <tr key={p.id}>
                        <td className="font-semibold text-slate-900 dark:text-white">#{p.numeroParcela}</td>
                        <td>{p.vencimento || p.dataVencimento ? new Date((p.vencimento || p.dataVencimento) + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                        <td className="font-mono text-xs">
                          {p.valorParcela ? `R$ ${p.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td><span className={`badge ${p.status === 'PAGA' ? 'badge-success' : p.status === 'ATRASADA' ? 'badge-danger' : 'badge-neutral'}`}>{p.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

