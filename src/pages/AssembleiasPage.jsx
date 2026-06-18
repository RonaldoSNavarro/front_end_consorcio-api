import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CalendarIcon, ScaleIcon, AwardIcon } from '../components/ui/Icons';

export const AssembleiasPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();

  const [grupoId, setGrupoId] = useState('');
  const [selectedAssembleiaId, setSelectedAssembleiaId] = useState('');
  
  // Agendamento form states
  const [dataAssembleia, setDataAssembleia] = useState('');
  const [tipoAssembleia, setTipoAssembleia] = useState('ORDINARIA');

  // Contemplação simulation states
  const [cotaIdParaContemplar, setCotaIdParaContemplar] = useState('');
  const [tipoContemplacao, setTipoContemplacao] = useState('SORTEIO');
  const [valorLanceInput, setValorLanceInput] = useState('');
  const [lanceEmbutido, setLanceEmbutido] = useState(false);

  // Queries
  const { data: gruposData } = useQuery({
    queryKey: ['grupos'],
    queryFn: () => api.grupos.listar()
  });
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

  // Mutations
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
    if (!grupoId) {
      triggerToast("Selecione um grupo primeiro.", "warning");
      return;
    }
    if (!dataAssembleia) {
      triggerToast("Selecione a data da assembleia.", "warning");
      return;
    }
    
    agendarMutation.mutate({
      grupoId: Number(grupoId),
      dataAssembleia,
      tipo: tipoAssembleia
    });
  };

  const handleContemplarSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssembleiaId) {
      triggerToast("Selecione uma assembleia para registrar a contemplação.", "warning");
      return;
    }
    if (!cotaIdParaContemplar) {
      triggerToast("Selecione a cota a ser contemplada.", "warning");
      return;
    }

    const valorLance = tipoContemplacao === 'LANCE' ? Number(valorLanceInput) : 0;
    if (tipoContemplacao === 'LANCE' && (isNaN(valorLance) || valorLance <= 0)) {
      triggerToast("Para lances, o valor deve ser maior que zero.", "warning");
      return;
    }

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
    <div className="view-container animate-fade-in font-sans text-slate-100">
      
      {/* Header */}
      <div className="header-title mb-6">
        <h2 className="text-2xl font-bold font-title text-amber-500 flex items-center gap-2">
          <CalendarIcon size={28} /> Central AGO & Sorteios
        </h2>
        <p className="text-slate-400 text-sm">
          Abertura, Apuração de Lances e Contemplações Ordinárias (AGO) do Sistema Consorcial.
        </p>
      </div>

      {/* Banner de Conformidade */}
      <div className="mb-6 p-4 rounded-xl border border-blue-500/20 bg-blue-950/20 text-slate-300 text-sm flex gap-3 items-start shadow-md">
        <ScaleIcon size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-400 font-semibold block mb-1">Regras Regulatórias de Contemplação (Lei 11.795/08):</strong>
          Cada assembleia ordinária contempla no mínimo uma cota por <strong>Sorteio</strong> (baseado na Loteria Federal) e, caso haja saldo disponível no Fundo Comum do grupo, cotas por <strong>Lance Livre/Embutido</strong>. O lance embutido é limitado a no máximo <strong>30% do crédito</strong> do grupo e é deduzido do crédito pago ao consorciado.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel Esquerdo: Seleção e Agendamento */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-lg font-bold font-title border-b border-slate-700/50 pb-2"> Seleção de Grupo</h3>
            <div className="form-group">
              <label htmlFor="select-grupo">Grupo de Consórcio *</label>
              <select 
                id="select-grupo" 
                value={grupoId} 
                onChange={(e) => {
                  setGrupoId(e.target.value);
                  setSelectedAssembleiaId('');
                }}
                className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
              >
                <option value="">Selecione um grupo...</option>
                {grupos.map(g => (
                  <option key={g.id} value={g.id}>{g.codigo} (Crédito Base: R$ {g.valorCredito?.toLocaleString('pt-BR')})</option>
                ))}
              </select>
            </div>
            
            {activeGrupo && (
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40 text-xs space-y-1.5">
                <div><strong>Status:</strong> <span className={`badge badge-${activeGrupo.status?.toLowerCase()}`}>{activeGrupo.status}</span></div>
                <div><strong>Prazo Total:</strong> {activeGrupo.prazoMeses} meses</div>
                <div><strong>Taxa Admin:</strong> {activeGrupo.taxaAdministracao}%</div>
              </div>
            )}
          </div>

          {grupoId && activeGrupo?.status !== 'ENCERRADO' && (
            <div className="glass-panel p-5 space-y-4">
              <h3 className="text-lg font-bold font-title border-b border-slate-700/50 pb-2 flex items-center gap-2">
                <CalendarIcon size={18} className="text-amber-500" /> Agendar Assembleia
              </h3>
              <form onSubmit={handleAgendarSubmit} className="space-y-4">
                <div className="form-group">
                  <label htmlFor="dataAssembleia">Data da Assembleia *</label>
                  <input 
                    id="dataAssembleia"
                    type="date"
                    value={dataAssembleia}
                    onChange={(e) => setDataAssembleia(e.target.value)}
                    className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tipoAssembleia">Tipo de Assembleia *</label>
                  <select 
                    id="tipoAssembleia"
                    value={tipoAssembleia}
                    onChange={(e) => setTipoAssembleia(e.target.value)}
                    className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
                  >
                    <option value="ORDINARIA">Ordinária (AGO)</option>
                    <option value="EXTRAORDINARIA">Extraordinária (AGE)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-full py-2">
                  Agendar Assembleia
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Painel Central: Histórico de Assembleias */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-5">
            <h3 className="text-lg font-bold font-title border-b border-slate-700/50 pb-2 mb-4">
              📋 Histórico de Assembleias
            </h3>
            
            {!grupoId ? (
              <p className="text-slate-400 text-sm text-center py-8">Selecione um grupo para visualizar o histórico.</p>
            ) : assemblies.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Nenhuma assembleia agendada ou realizada para este grupo.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table w-full text-sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assemblies.map(ass => (
                      <tr key={ass.id} className={selectedAssembleiaId === String(ass.id) ? 'bg-amber-500/10' : ''}>
                        <td>#{ass.id}</td>
                        <td>{new Date(ass.dataAssembleia + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                        <td>
                          <span className={`badge badge-info`}>{ass.tipo}</span>
                        </td>
                        <td>
                          <button 
                            className="btn-sm btn-outline"
                            onClick={() => setSelectedAssembleiaId(String(ass.id))}
                          >
                            Selecionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Seletor de Assembleia selecionada para apuração/contemplações */}
          {selectedAssembleiaId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Apuração / Realizar Contemplação */}
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-base font-bold font-title border-b border-slate-700/50 pb-2 flex items-center gap-2">
                  <AwardIcon size={18} className="text-amber-500" /> Apurar Contemplado (AGO #{selectedAssembleiaId})
                </h3>
                
                {activeGrupo?.status === 'ENCERRADO' ? (
                  <p className="text-rose-400 text-xs">Este grupo já está encerrado. Não é possível contemplar novas cotas.</p>
                ) : (
                  <form onSubmit={handleContemplarSubmit} className="space-y-4">
                    <div className="form-group">
                      <label htmlFor="select-cota">Cota Ativa do Grupo *</label>
                      <select 
                        id="select-cota"
                        value={cotaIdParaContemplar}
                        onChange={(e) => setCotaIdParaContemplar(e.target.value)}
                        className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
                      >
                        <option value="">Selecione a Cota...</option>
                        {cotas.filter(c => c.status === 'ATIVA' || c.status === 'INADIMPLENTE').map(c => (
                          <option key={c.id} value={c.id}>Cota #{c.numeroCota} ({c.status})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="select-tipo-cont">Modalidade de Contemplação *</label>
                      <select 
                        id="select-tipo-cont"
                        value={tipoContemplacao}
                        onChange={(e) => setTipoContemplacao(e.target.value)}
                        className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
                      >
                        <option value="SORTEIO">Sorteio da Loteria Federal</option>
                        <option value="LANCE">Oferta de Lance</option>
                      </select>
                    </div>

                    {tipoContemplacao === 'LANCE' && (
                      <>
                        <div className="form-group">
                          <label htmlFor="valorLance">Valor do Lance Ofertado (R$) *</label>
                          <input 
                            id="valorLance"
                            type="number"
                            step="0.01"
                            value={valorLanceInput}
                            onChange={(e) => setValorLanceInput(e.target.value)}
                            placeholder="Ex: 15000"
                            className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white"
                          />
                        </div>
                        <div className="checkbox-group flex items-center gap-2 mt-2">
                          <input 
                            id="lanceEmbutido"
                            type="checkbox"
                            checked={lanceEmbutido}
                            onChange={(e) => setLanceEmbutido(e.target.checked)}
                          />
                          <label htmlFor="lanceEmbutido" className="text-xs">Utilizar Lance Embutido (max 30% do crédito)</label>
                        </div>
                      </>
                    )}

                    <button 
                      type="submit" 
                      className="btn btn-primary w-full py-2 flex items-center justify-center gap-2"
                      disabled={contemplarMutation.isPending}
                    >
                      {contemplarMutation.isPending ? 'Contemplando...' : <span className="flex items-center gap-1"><AwardIcon size={14} /> Contemplar Cota</span>}
                    </button>
                  </form>
                )}
              </div>

              {/* Lista de Contemplados da Assembleia */}
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-base font-bold font-title border-b border-slate-700/50 pb-2 flex items-center gap-2">
                  <AwardIcon size={18} className="text-amber-500" /> Contemplados na Assembleia #{selectedAssembleiaId}
                </h3>
                
                {contemplacoes.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-8">Nenhuma cota contemplada nesta AGO.</p>
                ) : (
                  <div className="space-y-3 max-height-[300px] overflow-y-auto pr-1">
                    {contemplacoes.map(c => (
                      <div key={c.id} className="bg-slate-800/30 border border-slate-700/30 p-3 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between font-bold text-amber-500">
                          <span>Cota #{c.cotaId || c.numeroCota}</span>
                          <span>{c.tipoContemplacao}</span>
                        </div>
                        {c.valorLance > 0 && (
                          <div className="text-slate-400">
                            Lance: R$ {c.valorLance?.toLocaleString('pt-BR')} 
                            {c.lanceEmbutido && <span className="text-amber-400 ml-1">(Embutido)</span>}
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
