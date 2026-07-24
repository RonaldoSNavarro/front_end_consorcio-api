import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Gavel, AlertTriangle, Scale, CircleDot } from 'lucide-react';

/**
 * CredenciamentoLancesPage — Ofertas de lance para contemplação
 * em assembleias com captação aberta (status CAPTANDO).
 */
export const CredenciamentoLancesPage = () => {
  const { triggerToast } = useToast();
  const queryClient = useQueryClient();

  // --- Form state ---
  const [selectedGrupoId, setSelectedGrupoId] = useState('');
  const [selectedAssembleiaId, setSelectedAssembleiaId] = useState('');
  const [selectedCotaId, setSelectedCotaId] = useState('');
  const [tipoLance, setTipoLance] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [valorOferta, setValorOferta] = useState('');

  // --- Queries ---
  const { data: gruposData } = useQuery({
    queryKey: ['grupos'],
    queryFn: () => api.grupos.listar(),
  });
  const grupos = gruposData?.content || [];

  const { data: assembleiasData } = useQuery({
    queryKey: ['assembleias-grupo', selectedGrupoId],
    queryFn: () => api.assembleias.listarPorGrupo(selectedGrupoId),
    enabled: !!selectedGrupoId,
  });
  const assembleiasCaptando = (assembleiasData?.content || []).filter(
    (a) => a.status === 'CAPTANDO' || a.status === 'AGENDADA'
  );

  const { data: cotasData } = useQuery({
    queryKey: ['cotas-grupo', selectedGrupoId],
    queryFn: () => api.cotas.listarPorGrupo(selectedGrupoId),
    enabled: !!selectedGrupoId,
  });
  const cotasAtivas = (cotasData || []).filter((c) => c.status === 'ATIVA');

  // --- Mutation ---
  const salvarLanceMutation = useMutation({
    mutationFn: (dto) => api.lances.salvar(dto),
    onSuccess: () => {
      triggerToast('Lance registrado com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['assembleias-grupo', selectedGrupoId] });
      // Reset form fields
      setSelectedCotaId('');
      setTipoLance('');
      setModalidade('');
      setValorOferta('');
    },
    onError: (err) => triggerToast(err.message, 'danger'),
  });

  // --- Handlers ---
  const handleGrupoChange = (e) => {
    setSelectedGrupoId(e.target.value);
    setSelectedAssembleiaId('');
    setSelectedCotaId('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCotaId || !selectedAssembleiaId || !tipoLance || !modalidade || !valorOferta) {
      triggerToast('Preencha todos os campos obrigatórios.', 'warning');
      return;
    }
    const valor = Number(valorOferta);
    if (isNaN(valor) || valor <= 0) {
      triggerToast('Informe um valor de oferta válido maior que zero.', 'warning');
      return;
    }

    const grupoSelecionado = grupos?.find(g => g.id === Number(selectedGrupoId));
    if (tipoLance === 'EMBUTIDO' && grupoSelecionado) {
      const limitePercentual = grupoSelecionado.percentualLanceEmbutidoMaximo || 0.30;
      const limiteValor = grupoSelecionado.valorCredito ? (grupoSelecionado.valorCredito * limitePercentual) : null;
      if (limiteValor && valor > limiteValor) {
        triggerToast(`O valor do lance embutido ultrapassa o teto máximo permitido de ${(limitePercentual * 100).toFixed(0)}% (Max: R$ ${limiteValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`, 'danger');
        return;
      }
    }

    if (tipoLance === 'FGTS' && grupoSelecionado) {
      const categoria = grupoSelecionado.categoria || grupoSelecionado.categoriaBem;
      if (categoria && categoria !== 'IMOVEL') {
        triggerToast('A oferta de lance utilizando recursos do FGTS é permitida exclusivamente para consórcios da categoria IMÓVEL.', 'danger');
        return;
      }
    }

    salvarLanceMutation.mutate({
      cotaId: Number(selectedCotaId),
      assembleiaId: Number(selectedAssembleiaId),
      tipo: tipoLance,
      valorOferta: valor,
      modalidade,
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Gavel className="w-7 h-7 text-brand-500" /> Credenciamento de Lances
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Ofertas de lance para contemplação em assembleias com captação aberta.
        </p>
      </div>

      {/* Compliance Banner */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 text-sm flex gap-3 items-start">
        <Scale className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-amber-700 dark:text-amber-300">
          <strong className="block mb-1">Regras de Lance — Circular BCB nº 3.432/2009:</strong>
          O lance somente pode ser ofertado durante a fase de <strong>captação</strong> da assembleia (status CAPTANDO).
          Lance <strong>embutido</strong> está limitado a no máximo 30% do valor do crédito vigente.
          Lance <strong>FGTS</strong> é permitido exclusivamente para grupos da categoria <strong>IMÓVEL</strong>.
          A apuração ocorre após o fechamento da captação e sorteio da Loteria Federal.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Seletores */}
        <div className="lg:col-span-1 space-y-6">
          {/* Grupo Selector */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-base font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 flex items-center gap-2">
              <CircleDot className="w-4 h-4 text-brand-500" /> Seleção de Grupo
            </h3>
            <div className="form-group">
              <label htmlFor="select-grupo">Grupo *</label>
              <select id="select-grupo" value={selectedGrupoId} onChange={handleGrupoChange}>
                <option value="">Selecione um grupo...</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    Grupo #{g.id} — {g.categoriaCredito || g.categoria} ({g.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Assembleia Selector */}
            {selectedGrupoId && (
              <div className="form-group">
                <label htmlFor="select-assembleia">Assembleia Captando *</label>
                <select
                  id="select-assembleia"
                  value={selectedAssembleiaId}
                  onChange={(e) => setSelectedAssembleiaId(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {assembleiasCaptando.length === 0 ? (
                    <option disabled>Nenhuma assembleia em captação</option>
                  ) : (
                    assembleiasCaptando.map((a) => (
                      <option key={a.id} value={a.id}>
                        AG #{a.id} — {a.dataAssembleia ? new Date(a.dataAssembleia + 'T12:00:00').toLocaleDateString('pt-BR') : 'S/D'}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {/* Info when no assembleia available */}
            {selectedGrupoId && assembleiasCaptando.length === 0 && (
              <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/5 p-3 rounded-lg border border-amber-200 dark:border-amber-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Este grupo não possui assembleias com captação aberta no momento.</span>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita: Formulário de Lance */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-base font-title font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/50 pb-2 flex items-center gap-2">
              <Gavel className="w-4 h-4 text-brand-500" /> Dados do Lance
            </h3>

            {!selectedAssembleiaId ? (
              <p className="text-slate-400 text-sm text-center py-8">
                Selecione um grupo e uma assembleia em captação para registrar um lance.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Cota */}
                <div className="form-group">
                  <label htmlFor="select-cota-lance">Cota *</label>
                  <select
                    id="select-cota-lance"
                    value={selectedCotaId}
                    onChange={(e) => setSelectedCotaId(e.target.value)}
                  >
                    <option value="">Selecione uma cota ativa...</option>
                    {cotasAtivas.map((c) => (
                      <option key={c.id} value={c.id}>
                        Cota #{c.codigoCota || c.numeroCota} — Cliente {c.clienteId}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Lance */}
                <div className="form-group">
                  <label htmlFor="tipo-lance">Tipo de Lance *</label>
                  <select
                    id="tipo-lance"
                    value={tipoLance}
                    onChange={(e) => setTipoLance(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="EMBUTIDO">Embutido (máx. 30% do crédito)</option>
                    <option value="FIRME">Firme (recursos próprios)</option>
                    <option value="MISTO">Misto</option>
                    <option value="FGTS">FGTS (somente Imóvel)</option>
                    <option value="SEGURO_OBITO">Seguro Óbito</option>
                  </select>
                </div>

                {/* Modalidade */}
                <div className="form-group">
                  <label htmlFor="modalidade-lance">Modalidade *</label>
                  <select
                    id="modalidade-lance"
                    value={modalidade}
                    onChange={(e) => setModalidade(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="LIVRE">Livre</option>
                    <option value="FIXO">Fixo</option>
                  </select>
                </div>

                {/* Valor */}
                <div className="form-group">
                  <label htmlFor="valor-oferta">Valor da Oferta (R$) *</label>
                  <input
                    id="valor-oferta"
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorOferta}
                    onChange={(e) => setValorOferta(e.target.value)}
                    placeholder="Ex: 15000.00"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={salvarLanceMutation.isPending}
                >
                  {salvarLanceMutation.isPending ? 'Registrando lance...' : 'Registrar Lance'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
