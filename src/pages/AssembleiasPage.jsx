import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CalendarDays, Scale, Award, Loader2, Play, Square, Zap } from 'lucide-react';
import { Confetti } from '../components/Confetti';

const formatarData = (data) => data ? new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR') : 'Não informada';
const formatarMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const rotuloTipoContemplacao = (tipo) => ({
  SORTEIO: 'Sorteio',
  LANCE_LIVRE: 'Lance livre',
  LANCE_FIXO: 'Lance fixo',
}[tipo] || tipo || 'Contemplação');

export const AssembleiasPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();
  const [showConfetti, setShowConfetti] = useState(false);

  const [grupoId, setGrupoId] = useState('');
  const [paginaAgendadas, setPaginaAgendadas] = useState(0);
  const [selectedAssembleiaId, setSelectedAssembleiaId] = useState('');
  const [dataAssembleia, setDataAssembleia] = useState('');
  const [tipoAssembleia, setTipoAssembleia] = useState('ORDINARIA');
  const [showApurarModal, setShowApurarModal] = useState(false);
  const [realizarSorteio, setRealizarSorteio] = useState(true);

  const { data: gruposData } = useQuery({ queryKey: ['grupos'], queryFn: () => api.grupos.listar() });
  const grupos = gruposData?.content || gruposData || [];

  const { data: agendadasData } = useQuery({
    queryKey: ['assembleias', grupoId, 'AGENDADA', paginaAgendadas],
    queryFn: () => api.assembleias.listarPorGrupoEStatus(grupoId, 'AGENDADA', { page: paginaAgendadas, size: 5 }),
    enabled: !!grupoId
  });
  const { data: captandoData } = useQuery({
    queryKey: ['assembleias', grupoId, 'CAPTANDO'],
    queryFn: () => api.assembleias.listarPorGrupoEStatus(grupoId, 'CAPTANDO', { size: 10 }),
    enabled: !!grupoId
  });
  const { data: realizadasData } = useQuery({
    queryKey: ['assembleias', grupoId, 'REALIZADA'],
    queryFn: () => api.assembleias.listarPorGrupoEStatus(grupoId, 'REALIZADA', { size: 10 }),
    enabled: !!grupoId
  });
  const { data: fechadasData } = useQuery({
    queryKey: ['assembleias', grupoId, 'FECHADA'],
    queryFn: () => api.assembleias.listarPorGrupoEStatus(grupoId, 'FECHADA', { size: 5 }),
    enabled: !!grupoId
  });
  const agendadas = agendadasData?.content || [];
  const captando = captandoData?.content || [];
  const realizadas = realizadasData?.content || [];
  const fechadas = fechadasData?.content || [];
  const assemblies = [...agendadas, ...captando, ...realizadas, ...fechadas];

  const { data: contemplacoesData } = useQuery({
    queryKey: ['contemplacoes-assembleia', selectedAssembleiaId],
    queryFn: () => api.contemplacoes.listarPorAssembleia(selectedAssembleiaId),
    enabled: !!selectedAssembleiaId
  });
  const contemplacoes = contemplacoesData?.content || contemplacoesData || [];

  const { data: extracoesData } = useQuery({
    queryKey: ['loteria-federal'],
    queryFn: () => api.loteriaFederal.listar(),
    enabled: !!selectedAssembleiaId,
  });
  const selectedAssembleia = assemblies.find((assembleia) => String(assembleia.id) === String(selectedAssembleiaId));
  const extracaoElegivel = (Array.isArray(extracoesData) ? extracoesData : extracoesData?.content || [])
    .filter((extracao) => selectedAssembleia?.dataAssembleia && extracao.dataSorteio <= selectedAssembleia.dataAssembleia)
    .sort((a, b) => a.dataSorteio.localeCompare(b.dataSorteio))
    .at(-1);

  const agendarMutation = useMutation({
    mutationFn: (dto) => api.assembleias.salvar(dto),
    onSuccess: () => {
      triggerToast("Assembleia agendada com sucesso!", "success");
      queryClient.invalidateQueries({ queryKey: ['assembleias', grupoId] });
      setDataAssembleia('');
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const abrirCaptacaoMutation = useMutation({
    mutationFn: (id) => api.assembleias.abrirCaptacao(id),
    onSuccess: () => {
      triggerToast("Captação de lances aberta!", "success");
      queryClient.invalidateQueries({ queryKey: ['assembleias', grupoId] });
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const fecharCaptacaoMutation = useMutation({
    mutationFn: (id) => api.assembleias.fecharCaptacao(id),
    onSuccess: () => {
      triggerToast("Captação encerrada! Assembleia marcada como REALIZADA.", "success");
      queryClient.invalidateQueries({ queryKey: ['assembleias', grupoId] });
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const apurarMutation = useMutation({
    mutationFn: ({ id, params }) => api.assembleias.apurar(id, params),
    onSuccess: (data) => {
      const msg = data.sorteioRealizado
        ? 'Apuração concluída com a extração oficial da Loteria Federal.'
        : 'Apuração de lances concluída com sucesso!';
      triggerToast(msg, "success");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      queryClient.invalidateQueries({ queryKey: ['contemplacoes-assembleia', selectedAssembleiaId] });
      queryClient.invalidateQueries({ queryKey: ['assembleias', grupoId] });
      setShowApurarModal(false);
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const handleAgendarSubmit = (e) => {
    e.preventDefault();
    if (!grupoId) { triggerToast("Selecione um grupo primeiro.", "warning"); return; }
    if (!dataAssembleia) { triggerToast("Selecione a data da assembleia.", "warning"); return; }
    agendarMutation.mutate({ grupoId: Number(grupoId), dataAssembleia, tipo: tipoAssembleia });
  };

  const activeGrupo = grupos.find(g => g.id === Number(grupoId));
  const totalPaginasAgendadas = agendadasData?.totalPages || 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <CalendarDays className="w-7 h-7 text-brand-500" /> Central AGO & Sorteios
        </h2>
        <p className="text-sm text-slate-400 mt-1">Abertura, Apuração de Lances e Contemplações Ordinárias (AGO).</p>
      </div>

      {/* Banner Compliance */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 text-sm flex gap-3 items-start">
        <Scale className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-blue-700 dark:text-blue-300">
          <strong className="block mb-1">Regras Regulatórias de Contemplação (Lei 11.795/08):</strong>
          Cada AGO contempla no mínimo uma cota por <strong>Sorteio</strong> e, havendo saldo, por <strong>Lance Livre/Embutido</strong>. Lance embutido limitado a <strong>30% do crédito</strong>.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Esquerdo */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-base font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2">Seleção de Grupo</h3>
            <div className="form-group">
              <label htmlFor="select-grupo">Grupo de Consórcio *</label>
              <select id="select-grupo" value={grupoId} onChange={(e) => { setGrupoId(e.target.value); setPaginaAgendadas(0); setSelectedAssembleiaId(''); }}>
                <option value="">Selecione um grupo...</option>
                {grupos.map(g => <option key={g.id} value={g.id}>{g.codigoGrupo || g.codigo} (Crédito: R$ {g.valorCredito?.toLocaleString('pt-BR')})</option>)}
              </select>
            </div>
            {activeGrupo && (
              <div className="bg-slate-50 dark:bg-white/[0.02] p-3 rounded-lg border border-slate-200 dark:border-slate-700/40 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div><strong>Status:</strong> <span className={`badge ${activeGrupo.status === 'EM_ANDAMENTO' ? 'badge-success' : activeGrupo.status === 'ENCERRADO' ? 'badge-neutral' : 'badge-info'}`}>{activeGrupo.status?.replace('_', ' ')}</span></div>
                <div><strong>Prazo:</strong> {activeGrupo.prazoMeses} meses</div>
                <div><strong>Taxa Admin:</strong> {activeGrupo.taxaAdministracao}%</div>
              </div>
            )}
          </div>

          {grupoId && activeGrupo?.status !== 'ENCERRADO' && (
            <div className="glass-panel p-5 space-y-4">
              <h3 className="text-base font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand-500" /> Agendar Assembleia
              </h3>
              <form onSubmit={handleAgendarSubmit} className="space-y-4">
                <div className="form-group">
                  <label htmlFor="dataAssembleia">Data *</label>
                  <input id="dataAssembleia" type="date" value={dataAssembleia} onChange={(e) => setDataAssembleia(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="tipoAssembleia">Tipo *</label>
                  <select id="tipoAssembleia" value={tipoAssembleia} onChange={(e) => setTipoAssembleia(e.target.value)}>
                    <option value="ORDINARIA">Ordinária (AGO)</option>
                    <option value="EXTRAORDINARIA">Extraordinária (AGE)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-block">Agendar Assembleia</button>
              </form>
            </div>
          )}
        </div>

        {/* Painel Direito */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-5">
            <h3 className="text-base font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-1">Agenda e operação da AGO</h3>
            <p className="text-xs text-slate-400 mb-4">A agenda carrega cinco itens por vez; as sessões operacionais ficam separadas para evitar percorrer todo o histórico.</p>
            {!grupoId ? (
              <p className="text-slate-400 text-sm text-center py-8">Selecione um grupo para visualizar.</p>
            ) : (
              <div className="space-y-5">
                <section aria-label="Assembleias em captação">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-white">Em captação</h4>
                    <span className="badge badge-warning">{captando.length}</span>
                  </div>
                  {captando.length === 0 ? <p className="text-xs text-slate-400 py-3">Nenhuma assembleia recebendo lances.</p> : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {captando.map((ass) => (
                        <div key={ass.id} className="rounded-lg border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10 p-3 text-sm">
                          <div className="flex items-start justify-between gap-2"><div><strong>AGO #{ass.id}</strong><div className="text-xs text-slate-500 mt-1">{formatarData(ass.dataAssembleia)} · {ass.tipo}</div></div><span className="badge badge-warning">CAPTANDO</span></div>
                          <div className="flex gap-2 mt-3"><button className="btn btn-outline btn-xs" onClick={() => setSelectedAssembleiaId(String(ass.id))}>Detalhes</button><button className="btn btn-outline btn-xs !text-amber-600" onClick={() => fecharCaptacaoMutation.mutate(ass.id)} disabled={fecharCaptacaoMutation.isPending}><Square className="w-3 h-3" /> Encerrar</button></div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section aria-label="Assembleias prontas para apuração" className="border-t border-slate-200 dark:border-slate-700/50 pt-4">
                  <div className="flex items-center justify-between mb-2"><h4 className="font-semibold text-sm text-slate-800 dark:text-white">Prontas para apuração</h4><span className="badge badge-info">{realizadas.length}</span></div>
                  {realizadas.length === 0 ? <p className="text-xs text-slate-400 py-3">Encerre uma captação para disponibilizá-la ao motor de apuração.</p> : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {realizadas.map((ass) => (
                        <div key={ass.id} className="rounded-lg border border-blue-200 dark:border-blue-500/25 bg-blue-50 dark:bg-blue-500/10 p-3 text-sm"><div className="flex items-start justify-between gap-2"><div><strong>AGO #{ass.id}</strong><div className="text-xs text-slate-500 mt-1">{formatarData(ass.dataAssembleia)} · {ass.tipo}</div></div><span className="badge badge-info">REALIZADA</span></div><div className="flex gap-2 mt-3"><button className="btn btn-outline btn-xs" onClick={() => setSelectedAssembleiaId(String(ass.id))}>Detalhes</button><button className="btn btn-primary btn-xs" onClick={() => { setSelectedAssembleiaId(String(ass.id)); setShowApurarModal(true); }}><Zap className="w-3 h-3" /> Apurar</button></div></div>
                      ))}
                    </div>
                  )}
                </section>

                <section aria-label="Assembleias agendadas" className="border-t border-slate-200 dark:border-slate-700/50 pt-4">
                  <div className="flex items-center justify-between mb-2"><h4 className="font-semibold text-sm text-slate-800 dark:text-white">Próximas agendadas</h4><span className="text-xs text-slate-400">5 por página · {agendadasData?.totalElements || 0} no total</span></div>
                  {agendadas.length === 0 ? <p className="text-xs text-slate-400 py-3">Nenhuma assembleia agendada nesta página.</p> : <div className="overflow-x-auto"><table><thead><tr><th>ID</th><th>Data</th><th>Tipo</th><th>Ação</th></tr></thead><tbody>{agendadas.map((ass) => <tr key={ass.id}><td className="font-mono text-xs">#{ass.id}</td><td>{formatarData(ass.dataAssembleia)}</td><td><span className="badge badge-neutral">{ass.tipo}</span></td><td><button className="btn btn-outline btn-xs !text-emerald-600" onClick={() => abrirCaptacaoMutation.mutate(ass.id)} disabled={abrirCaptacaoMutation.isPending}><Play className="w-3 h-3" /> Abrir captação</button></td></tr>)}</tbody></table></div>}
                  {totalPaginasAgendadas > 1 && <div className="flex items-center justify-end gap-2 mt-3"><span className="text-xs text-slate-400">Página {paginaAgendadas + 1} de {totalPaginasAgendadas}</span><button className="btn btn-outline btn-xs" disabled={paginaAgendadas === 0} onClick={() => setPaginaAgendadas((pagina) => pagina - 1)}>Anterior</button><button className="btn btn-outline btn-xs" disabled={paginaAgendadas + 1 >= totalPaginasAgendadas} onClick={() => setPaginaAgendadas((pagina) => pagina + 1)}>Próxima</button></div>}
                </section>

                {fechadas.length > 0 && <section aria-label="Atas recentes" className="border-t border-slate-200 dark:border-slate-700/50 pt-4"><h4 className="font-semibold text-sm text-slate-800 dark:text-white mb-2">Atas recentes</h4><div className="flex flex-wrap gap-2">{fechadas.map((ass) => <button key={ass.id} className="btn btn-outline btn-xs" onClick={() => setSelectedAssembleiaId(String(ass.id))}>AGO #{ass.id} · {formatarData(ass.dataAssembleia)}</button>)}</div></section>}
              </div>
            )}
          </div>

          {selectedAssembleiaId && (
            <>
              <section className="glass-panel p-5 space-y-5" aria-label="Ata de apuração da assembleia">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between border-b border-slate-200 dark:border-slate-700/50 pb-3">
                  <div>
                    <h3 className="text-base font-title font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-brand-500" /> Ata de Apuração — AGO #{selectedAssembleiaId}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">AGO de {formatarData(selectedAssembleia?.dataAssembleia)} · resultado auditável do sorteio, da pedra-chave e das contemplações registradas pelo motor.</p>
                  </div>
                  <span className={`badge ${selectedAssembleia?.status === 'FECHADA' ? 'badge-success' : 'badge-info'}`}>
                    {selectedAssembleia?.status || 'AGUARDANDO'}
                  </span>
                </div>

                {selectedAssembleia?.status !== 'FECHADA' ? (
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-700/40 text-sm text-slate-500 dark:text-slate-300">
                    A ata será consolidada aqui após a apuração fechar a assembleia. As contemplações já existentes continuam visíveis no histórico abaixo.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
                      <div className="rounded-xl border border-indigo-200 dark:border-indigo-500/25 bg-indigo-50 dark:bg-indigo-500/10 p-3">
                        <div className="text-[11px] uppercase tracking-wide text-indigo-600 dark:text-indigo-300 font-bold">Extração oficial</div>
                        <div className="font-mono font-semibold text-slate-800 dark:text-white mt-1">{selectedAssembleia.numeroExtracaoLoteria || 'Não vinculada'}</div>
                      </div>
                      <div className="rounded-xl border border-brand-200 dark:border-brand-500/25 bg-brand-50 dark:bg-brand-500/10 p-3">
                        <div className="text-[11px] uppercase tracking-wide text-brand-600 dark:text-brand-300 font-bold">1º prêmio / sorteio</div>
                        <div className="font-mono font-semibold text-slate-800 dark:text-white mt-1">{selectedAssembleia.numeroSorteado ?? 'Não realizado'}</div>
                      </div>
                      <div className="rounded-xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10 p-3">
                        <div className="text-[11px] uppercase tracking-wide text-amber-700 dark:text-amber-300 font-bold">Pedra-chave</div>
                        <div className="font-mono font-semibold text-slate-800 dark:text-white mt-1">{selectedAssembleia.pedraChaveCalculada ?? 'Não calculada'}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedAssembleia.algoritmoUsado?.replaceAll('_', ' ') || 'Algoritmo não informado'}</div>
                      </div>
                      <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10 p-3">
                        <div className="text-[11px] uppercase tracking-wide text-emerald-700 dark:text-emerald-300 font-bold">Resultado consolidado</div>
                        <div className="font-semibold text-slate-800 dark:text-white mt-1">{contemplacoes.length} contemplação(ões)</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fallbacks: {selectedAssembleia.fallbacksAplicados ?? 0} · Excluídos: {selectedAssembleia.premioExcluidos ?? '—'}</div>
                      </div>
                    </div>

                    {contemplacoes.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">A apuração foi concluída sem contemplações registradas para esta assembleia.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table>
                          <thead><tr><th>Resultado</th><th>Cota</th><th>Consorciado</th><th>Oferta</th><th>Crédito liberado</th><th>Situação da cota</th></tr></thead>
                          <tbody>
                            {contemplacoes.map((contemplacao) => (
                              <tr key={contemplacao.id}>
                                <td><span className="badge badge-info">{rotuloTipoContemplacao(contemplacao.tipoContemplacao)}</span></td>
                                <td className="font-mono">{contemplacao.codigoGrupo || '—'} / {contemplacao.codigoCota ?? contemplacao.cotaId}</td>
                                <td>{contemplacao.nomeCliente || 'Consorciado não identificado'}</td>
                                <td>{contemplacao.tipoContemplacao === 'SORTEIO' ? '—' : formatarMoeda(contemplacao.valorLance)}{contemplacao.lanceEmbutido ? ' (embutido)' : ''}</td>
                                <td>{formatarMoeda(contemplacao.valorCreditoLiberado)}</td>
                                <td><span className="badge badge-neutral">{contemplacao.statusCota || '—'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fluxo de apuração */}
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-sm font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-500" /> Fluxo da AGO #{selectedAssembleiaId}
                </h3>
                <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <li><strong>1. Fechar captação:</strong> a assembleia passa para <code>REALIZADA</code>.</li>
                  <li><strong>2. Confirmar extração oficial:</strong> registre o concurso da Loteria Federal elegível.</li>
                  <li><strong>3. Apurar:</strong> o motor sorteia cotas, processa os lances e registra as contemplações.</li>
                  <li><strong>4. Integralizar:</strong> vencedores de lance firme ou FGTS seguem para a tela de Integralização de Lances.</li>
                </ol>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
                  A contemplação manual foi removida desta tela para preservar a trilha auditável do sorteio e dos lances apurados pelo motor.
                </div>
              </div>

              {/* Contemplados */}
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-sm font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-500" /> Contemplados (AGO #{selectedAssembleiaId})
                </h3>
                {showConfetti && <Confetti active={true} config={{ angle: 90, spread: 360, startVelocity: 40, elementCount: 70, decay: 0.95 }} />}
                
                {contemplacoes.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-8">Nenhuma cota contemplada nesta AGO.</p>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {/* AGRUPAMENTO: SORTEIO */}
                    {contemplacoes.filter(c => c.tipoContemplacao === 'SORTEIO').length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Sorteio da Loteria</div>
                        {contemplacoes.filter(c => c.tipoContemplacao === 'SORTEIO').map(c => (
                          <div key={c.id} className="bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 p-3 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between font-bold text-brand-700 dark:text-brand-300">
                              <span>Cota #{c.codigoCota || c.numeroCota || c.cotaId}</span>
                              <span className="badge badge-primary">Sorteio</span>
                            </div>
                            <div className="text-slate-500 dark:text-slate-400">Data: {new Date(c.dataContemplacao).toLocaleDateString('pt-BR')}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AGRUPAMENTO: LANCE FIXO */}
                    {contemplacoes.filter(c => c.tipoContemplacao === 'LANCE_FIXO').length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Lances Fixos (Desempate pela Pedra Chave)</div>
                        {contemplacoes.filter(c => c.tipoContemplacao === 'LANCE_FIXO').map(c => (
                          <div key={c.id} className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-3 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-300">
                              <span>Cota #{c.codigoCota || c.numeroCota || c.cotaId}</span>
                              <span className="badge badge-success">Lance Fixo</span>
                            </div>
                            <div className="text-emerald-600 dark:text-emerald-400">Lance Ofertado: R$ {c.valorLance?.toLocaleString('pt-BR')} {c.lanceEmbutido && '(Embutido)'}</div>
                            <div className="text-slate-500 dark:text-slate-400">Data: {new Date(c.dataContemplacao).toLocaleDateString('pt-BR')}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AGRUPAMENTO: LANCE LIVRE */}
                    {contemplacoes.filter(c => c.tipoContemplacao === 'LANCE_LIVRE').length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Lances Livres</div>
                        {contemplacoes.filter(c => c.tipoContemplacao === 'LANCE_LIVRE').map(c => (
                          <div key={c.id} className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 p-3 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between font-bold text-blue-700 dark:text-blue-300">
                              <span>Cota #{c.codigoCota || c.numeroCota || c.cotaId}</span>
                              <span className="badge badge-info">Lance Livre</span>
                            </div>
                            <div className="text-blue-600 dark:text-blue-400">Lance Ofertado: R$ {c.valorLance?.toLocaleString('pt-BR')} {c.lanceEmbutido && '(Embutido)'}</div>
                            <div className="text-slate-500 dark:text-slate-400">Data: {new Date(c.dataContemplacao).toLocaleDateString('pt-BR')}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL: Motor de Apuração */}
      {showApurarModal && (
        <div className="modal-backdrop">
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl animate-scale-up bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-title font-bold text-slate-900 dark:text-white">Motor de Apuração</h3>
                <p className="text-xs text-slate-400">Assembleia #{selectedAssembleiaId}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <div><strong>Critério de Desempate (Lances):</strong> {activeGrupo?.criterioDesempateLance?.replace?.(/_/g, ' ')}</div>
                <div><strong>Como funciona:</strong> O motor processa lances livres e fixos por saldo disponível no fundo comum. Se ativado, o sorteio inclui cotas ATIVAS e CANCELADAS (BCB).</div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-brand-300 dark:hover:border-brand-500/50 transition-all">
                <input type="checkbox" checked={realizarSorteio} onChange={e => setRealizarSorteio(e.target.checked)} className="mt-0.5 w-4 h-4 rounded text-brand-500" />
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Realizar Sorteio</div>
                  <div className="text-xs text-slate-400">Inclui cotas ATIVAS e CANCELADAS no sorteio (conforme BCB)</div>
                </div>
              </label>

              <div className={`p-3 rounded-lg border text-xs ${extracaoElegivel ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300'}`}>
                {extracaoElegivel ? (
                  <>
                    <strong>Fonte oficial confirmada:</strong> concurso {extracaoElegivel.concurso}, extração de {new Date(extracaoElegivel.dataSorteio + 'T12:00:00').toLocaleDateString('pt-BR')}. O motor calcula a pedra-chave pelos prêmios registrados.
                  </>
                ) : (
                  <>
                    <strong>Não é possível apurar:</strong> registre uma extração da Loteria Federal com data anterior ou igual à data desta assembleia.
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn btn-outline flex-1" onClick={() => setShowApurarModal(false)} disabled={apurarMutation.isPending}>Cancelar</button>
              <button
                className="btn btn-primary flex-1"
                disabled={apurarMutation.isPending || !extracaoElegivel}
                onClick={() => apurarMutation.mutate({
                  id: Number(selectedAssembleiaId),
                  params: { realizarSorteio }
                })}
              >
                {apurarMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Apurando...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Executar Apuração</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
