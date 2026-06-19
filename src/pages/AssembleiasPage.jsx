import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CalendarDays, Scale, Award, Loader2 } from 'lucide-react';

export const AssembleiasPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();

  const [grupoId, setGrupoId] = useState('');
  const [selectedAssembleiaId, setSelectedAssembleiaId] = useState('');
  const [dataAssembleia, setDataAssembleia] = useState('');
  const [tipoAssembleia, setTipoAssembleia] = useState('ORDINARIA');
  const [cotaIdParaContemplar, setCotaIdParaContemplar] = useState('');
  const [tipoContemplacao, setTipoContemplacao] = useState('SORTEIO');
  const [valorLanceInput, setValorLanceInput] = useState('');
  const [lanceEmbutido, setLanceEmbutido] = useState(false);

  const { data: gruposData } = useQuery({ queryKey: ['grupos'], queryFn: () => api.grupos.listar() });
  const grupos = gruposData?.content || gruposData || [];

  const { data: assembliesData } = useQuery({
    queryKey: ['assembleias', grupoId],
    queryFn: () => api.assembleias.listarPorGrupo(grupoId),
    enabled: !!grupoId
  });
  const assemblies = assembliesData?.content || assembliesData || [];

  const { data: cotasData } = useQuery({
    queryKey: ['cotas-grupo', grupoId],
    queryFn: () => api.cotas.listarPorGrupo(grupoId),
    enabled: !!grupoId
  });
  const cotas = cotasData?.content || cotasData || [];

  const { data: contemplacoesData } = useQuery({
    queryKey: ['contemplacoes-assembleia', selectedAssembleiaId],
    queryFn: () => api.contemplacoes.listarPorAssembleia(selectedAssembleiaId),
    enabled: !!selectedAssembleiaId
  });
  const contemplacoes = contemplacoesData?.content || contemplacoesData || [];

  const agendarMutation = useMutation({
    mutationFn: (dto) => api.assembleias.salvar(dto),
    onSuccess: () => {
      triggerToast("Assembleia agendada com sucesso!", "success");
      queryClient.invalidateQueries({ queryKey: ['assembleias', grupoId] });
      setDataAssembleia('');
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const contemplarMutation = useMutation({
    mutationFn: (dto) => api.contemplacoes.registrar(dto),
    onSuccess: () => {
      triggerToast("Cota contemplada com sucesso!", "success");
      queryClient.invalidateQueries({ queryKey: ['contemplacoes-assembleia', selectedAssembleiaId] });
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
      queryClient.invalidateQueries({ queryKey: ['cotas-grupo', grupoId] });
      setCotaIdParaContemplar('');
      setValorLanceInput('');
      setLanceEmbutido(false);
    },
    onError: (err) => triggerToast(err.message, "danger")
  });

  const handleAgendarSubmit = (e) => {
    e.preventDefault();
    if (!grupoId) { triggerToast("Selecione um grupo primeiro.", "warning"); return; }
    if (!dataAssembleia) { triggerToast("Selecione a data da assembleia.", "warning"); return; }
    agendarMutation.mutate({ grupoId: Number(grupoId), dataAssembleia, tipo: tipoAssembleia });
  };

  const handleContemplarSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssembleiaId) { triggerToast("Selecione uma assembleia.", "warning"); return; }
    if (!cotaIdParaContemplar) { triggerToast("Selecione a cota a ser contemplada.", "warning"); return; }
    const valorLance = tipoContemplacao === 'LANCE' ? Number(valorLanceInput) : 0;
    if (tipoContemplacao === 'LANCE' && (isNaN(valorLance) || valorLance <= 0)) { triggerToast("Valor deve ser maior que zero.", "warning"); return; }
    contemplarMutation.mutate({
      assembleiaId: Number(selectedAssembleiaId),
      cotaId: Number(cotaIdParaContemplar),
      tipoContemplacao: tipoContemplacao === 'LANCE' ? 'LANCE_LIVRE' : tipoContemplacao,
      valorLance,
      lanceEmbutido
    });
  };

  const activeGrupo = grupos.find(g => g.id === Number(grupoId));

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
              <select id="select-grupo" value={grupoId} onChange={(e) => { setGrupoId(e.target.value); setSelectedAssembleiaId(''); }}>
                <option value="">Selecione um grupo...</option>
                {grupos.map(g => <option key={g.id} value={g.id}>{g.codigo} (Crédito: R$ {g.valorCredito?.toLocaleString('pt-BR')})</option>)}
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
            <h3 className="text-base font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 mb-4">Histórico de Assembleias</h3>
            {!grupoId ? (
              <p className="text-slate-400 text-sm text-center py-8">Selecione um grupo para visualizar.</p>
            ) : assemblies.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Nenhuma assembleia para este grupo.</p>
            ) : (
              <div className="overflow-x-auto">
                <table>
                  <thead><tr><th>ID</th><th>Data</th><th>Tipo</th><th>Ações</th></tr></thead>
                  <tbody>
                    {assemblies.map(ass => (
                      <tr key={ass.id} className={selectedAssembleiaId === String(ass.id) ? 'bg-brand-50 dark:bg-brand-500/10' : ''}>
                        <td className="font-mono text-xs text-slate-400">#{ass.id}</td>
                        <td>{new Date(ass.dataAssembleia + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                        <td><span className="badge badge-info">{ass.tipo}</span></td>
                        <td><button className="btn btn-outline btn-xs" onClick={() => setSelectedAssembleiaId(String(ass.id))}>Selecionar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedAssembleiaId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Apuração */}
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-sm font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-500" /> Apurar Contemplado (AGO #{selectedAssembleiaId})
                </h3>
                {activeGrupo?.status === 'ENCERRADO' ? (
                  <p className="text-rose-500 dark:text-rose-400 text-xs">Grupo encerrado.</p>
                ) : (
                  <form onSubmit={handleContemplarSubmit} className="space-y-4">
                    <div className="form-group">
                      <label htmlFor="select-cota">Cota Ativa *</label>
                      <select id="select-cota" value={cotaIdParaContemplar} onChange={(e) => setCotaIdParaContemplar(e.target.value)}>
                        <option value="">Selecione...</option>
                        {cotas.filter(c => c.status === 'ATIVA' || c.status === 'INADIMPLENTE').map(c => <option key={c.id} value={c.id}>Cota #{c.numeroCota} ({c.status})</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="select-tipo-cont">Modalidade *</label>
                      <select id="select-tipo-cont" value={tipoContemplacao} onChange={(e) => setTipoContemplacao(e.target.value)}>
                        <option value="SORTEIO">Sorteio da Loteria Federal</option>
                        <option value="LANCE">Oferta de Lance</option>
                      </select>
                    </div>
                    {tipoContemplacao === 'LANCE' && (
                      <>
                        <div className="form-group">
                          <label htmlFor="valorLance">Valor do Lance (R$) *</label>
                          <input id="valorLance" type="number" step="0.01" value={valorLanceInput} onChange={(e) => setValorLanceInput(e.target.value)} placeholder="Ex: 15000" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <input id="lanceEmbutido" type="checkbox" checked={lanceEmbutido} onChange={(e) => setLanceEmbutido(e.target.checked)} className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-500 focus:ring-brand-500" />
                          <label htmlFor="lanceEmbutido" className="!text-xs !font-normal !uppercase-none !tracking-normal !mb-0 text-slate-600 dark:text-slate-400">Lance Embutido (max 30% do crédito)</label>
                        </div>
                      </>
                    )}
                    <button type="submit" className="btn btn-primary btn-block" disabled={contemplarMutation.isPending}>
                      {contemplarMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                      {contemplarMutation.isPending ? 'Contemplando...' : 'Contemplar Cota'}
                    </button>
                  </form>
                )}
              </div>

              {/* Contemplados */}
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-sm font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-500" /> Contemplados (AGO #{selectedAssembleiaId})
                </h3>
                {contemplacoes.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-8">Nenhuma cota contemplada nesta AGO.</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {contemplacoes.map(c => (
                      <div key={c.id} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-slate-700/30 p-3 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between font-bold text-brand-600 dark:text-brand-400">
                          <span>Cota #{c.cotaId || c.numeroCota}</span>
                          <span>{c.tipoContemplacao}</span>
                        </div>
                        {c.valorLance > 0 && (
                          <div className="text-slate-500 dark:text-slate-400">
                            Lance: R$ {c.valorLance?.toLocaleString('pt-BR')} 
                            {c.lanceEmbutido && <span className="text-brand-500 ml-1">(Embutido)</span>}
                          </div>
                        )}
                        <div className="text-slate-400">Data: {new Date(c.dataContemplacao).toLocaleDateString('pt-BR')}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
