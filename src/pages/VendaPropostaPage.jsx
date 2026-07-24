/* eslint-disable react/prop-types */
import React from 'react';
import { ShoppingCart, Users, Package, Tag, ChevronRight, CheckCircle, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVendaProposta } from '../hooks/useVendaProposta';

const StepIndicator = ({ steps, current }) => (
  <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${i === current ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : i < current ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
          {i < current ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">{i + 1}</span>}
          {s}
        </div>
        {i < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />}
      </React.Fragment>
    ))}
  </div>
);

export const VendaPropostaPage = () => {
  const navigate = useNavigate();
  const {
    step,
    setStep,
    selectedCliente,
    setSelectedCliente,
    selectedCategoria,
    setSelectedCategoria,
    selectedBem,
    setSelectedBem,
    bensFiltrados,
    isLoadingBens,
    valorCredito,
    selectedGrupo,
    setSelectedGrupo,
    gruposElegiveis,
    selectedCotaNumero,
    setSelectedCotaNumero,
    selectedTipo,
    setSelectedTipo,
    contratarSeguro,
    setContratarSeguro,
    selectedPrazo,
    setSelectedPrazo,
    clienteSearch,
    setClienteSearch,
    isSubmitting,
    clientes,
    isLoadingClientes,
    matchedProduto,
    gruposList,
    isLoadingGrupos,
    vacantQuotas,
    isLoadingCotas,
    tipos,
    term,
    taxa,
    fundoComum,
    taxaAdm,
    fundoReserva,
    seguroPrestamista,
    totalInstallment,
    handleEfetivarProposta,
    handleNextStep,
    handlePrevStep,
    register,
    errors
  } = useVendaProposta();

  const steps = ['Cliente', 'Simulação e Grupo', 'Canal de Venda', 'Confirmação'];

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <ShoppingCart className="w-6 h-6 text-brand-500" /> Nova Proposta de Adesão
        </h2>
        <p className="text-sm text-slate-400 mt-1">Esteira completa: Proposta &rarr; Análise &rarr; Contrato &rarr; Adesão &rarr; Cota</p>
      </div>

      <StepIndicator steps={steps} current={step} />

      {/* PASSO 0 — Selecionar Cliente */}
      {step === 0 && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-brand-500" />
            <h3 className="font-title font-bold text-slate-900 dark:text-white">Selecionar Consorciado</h3>
          </div>
          <input 
            type="search" 
            placeholder="Buscar por nome ou CPF/CNPJ..." 
            className="form-input"
            value={clienteSearch} 
            onChange={e => setClienteSearch(e.target.value)} 
          />
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
            {isLoadingClientes ? (
               <div className="text-center py-8 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /> Buscando...</div>
            ) : (
              clientes.slice(0, 30).map(c => (
                <button 
                  key={c.id} 
                  type="button"
                  onClick={(e) => { 
                    e.preventDefault();
                    setSelectedCliente(c); 
                    setStep(1); 
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selectedCliente?.id === c.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700/50 hover:border-brand-300 dark:hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">{c.nome}</div>
                      <div className="font-mono text-xs text-slate-500">{c.cpfCnpj}</div>
                    </div>
                    {selectedCliente?.id === c.id && <CheckCircle className="w-4 h-4 text-brand-500 shrink-0" />}
                  </div>
                </button>
              ))
            )}
            {clientes.length === 0 && !isLoadingClientes && (
              <div className="text-center py-8 text-slate-400 text-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Nenhum cliente ativo encontrado.
                <div className="mt-3">
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('/clientes')}>
                    <UserPlus className="w-3.5 h-3.5" /> Cadastrar Novo Cliente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PASSO 1 — Escolha da Categoria, Bem de Referência, Prazo & Atribuição Automática de Grupo */}
      {step === 1 && (
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-brand-500" />
            <h3 className="font-title font-bold text-slate-900 dark:text-white">Especificação do Consórcio</h3>
          </div>
          
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-sm text-emerald-700 dark:text-emerald-400 flex gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            Cliente Selecionado: <strong>{selectedCliente?.nome}</strong>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Seletor da Categoria de Bem BACEN */}
            <div className="space-y-1.5">
              <label htmlFor="cat-bem-select" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categoria do Bem (BACEN)</label>
              <select
                id="cat-bem-select"
                className="form-input"
                value={selectedCategoria}
                onChange={e => setSelectedCategoria(e.target.value)}
              >
                <option value="IMOVEL">Imóvel</option>
                <option value="VEICULO_AUTOMOTOR">Veículo Automotor</option>
                <option value="SERVICO">Serviço</option>
                <option value="OUTROS_BENS_MOVEIS">Outros Bens Móveis</option>
              </select>
            </div>

            {/* Seletor de Prazo Desejado */}
            <div className="space-y-1.5">
              <label htmlFor="prazo-select" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Prazo do Plano</label>
              <select
                id="prazo-select"
                className="form-input"
                value={selectedPrazo || 120}
                onChange={e => setSelectedPrazo(Number(e.target.value))}
              >
                <option value={36}>36 meses</option>
                <option value={60}>60 meses</option>
                <option value={72}>72 meses</option>
                <option value={120}>120 meses</option>
                <option value={180}>180 meses</option>
                <option value={240}>240 meses</option>
              </select>
            </div>
          </div>

          {/* Bem de Referência Escolhido / Auto-selecionado */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center">
              <span>Bem de Referência</span>
              {bensFiltrados.length === 1 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  Bem Selecionado por Padrão (Único para a categoria)
                </span>
              )}
            </label>

            {isLoadingBens ? (
              <div className="text-center py-4 text-slate-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /> Carregando bens de referência...</div>
            ) : bensFiltrados.length === 0 ? (
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs">
                Nenhum bem de referência cadastrado para a categoria <strong>{selectedCategoria}</strong>. É necessário cadastrar ao menos um bem de referência nesta categoria.
              </div>
            ) : bensFiltrados.length === 1 ? (
              <div className="p-4 rounded-xl border border-brand-200 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/10 flex items-center justify-between text-sm">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedBem?.descricao}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Código FIPE/ID: {selectedBem?.codigoFipe || selectedBem?.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Valor de Referência</div>
                  <div className="font-bold text-base text-brand-500">R$ {Number(selectedBem?.valorAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            ) : (
              <select
                className="form-input"
                value={selectedBem?.id || ''}
                onChange={e => {
                  const bem = bensFiltrados.find(b => b.id === Number(e.target.value));
                  if (bem) setSelectedBem(bem);
                }}
              >
                {bensFiltrados.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.descricao} — R$ {Number(b.valorAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Valor do Crédito (Imutável - Derivado do Bem) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase block">Valor do Crédito da Proposta</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                R$ {Number(valorCredito || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              Adquirido via Bem de Referência
            </span>
          </div>

          {/* Simulação de Parcelas */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 animate-fade-in">
            <h4 className="font-title font-bold text-sm text-slate-800 dark:text-slate-200 mb-2">Simulação de Parcelas</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Fundo Comum:</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">R$ {fundoComum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <span className="text-slate-400 block">Taxa de Administração ({taxa}%):</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">R$ {taxaAdm.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <span className="text-slate-400 block">Fundo de Reserva (2%):</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">R$ {fundoReserva.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <span className="text-slate-400 block">Seguro Prestamista ({contratarSeguro ? '1%' : '0%'}):</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">R$ {seguroPrestamista.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-2 sm:pt-0 sm:pl-4">
                <span className="text-slate-400 font-bold block">Total Mensal Estimado:</span>
                <div className="font-bold text-sm text-brand-500">R$ {totalInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>

          {/* Atribuição Automática de Grupo e Cota */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Atribuição Automática de Grupo e Cota</label>
            
            {gruposElegiveis.length === 0 && !isLoadingGrupos ? (
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">Nenhum Grupo Elegível Encontrado</div>
                  <div className="text-xs mt-1">Não há grupo ativo em formação para a categoria <strong>{selectedCategoria}</strong> e prazo de <strong>{selectedPrazo} meses</strong>. O sistema não cria grupos automaticamente.</div>
                  <button type="button" className="btn btn-outline btn-sm mt-3 border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30" onClick={() => navigate('/grupos')}>
                    Cadastrar Grupo Elegível
                  </button>
                </div>
              </div>
            ) : selectedGrupo && (
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/10 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Grupo Selecionado pelo Sistema: <strong>{selectedGrupo.codigoGrupo || selectedGrupo.codigo}</strong>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Categoria: <strong>{selectedGrupo.categoriaBem}</strong> | Status: <span className="font-semibold">{selectedGrupo.status?.replace('_', ' ')}</span> | Taxa Adm: {selectedGrupo.taxaAdministracao}%
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    {vacantQuotas.length} cotas disponíveis de {selectedGrupo?.quantidadeCotas || 1000}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-emerald-100 dark:border-emerald-500/20 pt-2">
                  A cota sequencial será alocada e vinculada ao consorciado no ato da efetivação da proposta.
                </div>
              </div>
            )}
          </div>

          {/* Botão de Avanço */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <button type="button" className="btn btn-outline" onClick={handlePrevStep}>&larr; Voltar</button>
            <button 
              type="button" 
              className="btn btn-primary flex-1" 
              onClick={handleNextStep}
              disabled={!selectedGrupo || !selectedBem}
            >
              Avançar
            </button>
          </div>
        </div>
      )}

      {/* PASSO 2 — Tipo de Venda & Detalhes */}
      {step === 2 && (
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-brand-500" />
            <h3 className="font-title font-bold text-slate-900 dark:text-white">Tipo de Venda</h3>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-sm text-emerald-700 dark:text-emerald-400 flex gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              Grupo: <strong>{selectedGrupo?.codigoGrupo || selectedGrupo?.codigo}</strong> | Cota: <strong>{selectedCotaNumero}</strong> | Crédito: <strong>R$ {Number(valorCredito || 0).toLocaleString('pt-BR')}</strong>
            </div>
          </div>

          {/* Checkbox Seguro Prestamista */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={contratarSeguro} 
                onChange={e => setContratarSeguro(e.target.checked)} 
                className="w-4 h-4 rounded text-brand-500" 
              />
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Contratar Seguro Prestamista</div>
                <div className="text-xs text-slate-400">Seguro que quita o consórcio em caso de sinistro (Morte ou Invalidez)</div>
              </div>
            </label>
          </div>

          {/* List channels */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Escolha o Canal de Venda</label>
            <div className="grid grid-cols-1 gap-2">
              {tipos && tipos.map(t => (
                <button 
                  key={t.id} 
                  type="button"
                  onClick={(e) => { 
                    e.preventDefault();
                    setSelectedTipo(t); 
                    setStep(3); 
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTipo?.id === t.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700/50 hover:border-brand-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">{t.nome}</div>
                      {t.descricao && <div className="text-xs text-slate-400 mt-0.5">{t.descricao}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        Comissão: {(t.percentualComissao * 100).toFixed(0)}%
                      </span>
                      {selectedTipo?.id === t.id && <CheckCircle className="w-4 h-4 text-brand-500 shrink-0" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <button type="button" className="btn btn-outline" onClick={handlePrevStep}>&larr; Voltar</button>
          </div>
        </div>
      )}

      {/* PASSO 3 — Confirmar Proposta & Geração Visual do Contrato & Aceite */}
      {step === 3 && (
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-brand-500" />
            <h3 className="font-title font-bold text-slate-900 dark:text-white">Confirmar Proposta</h3>
          </div>

          {/* Visual Contract Card */}
          <div className="border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-6 space-y-4 shadow-lg animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
              <h4 className="font-title font-bold text-slate-900 dark:text-white">RESUMO DO CONTRATO DE ADESÃO</h4>
              <span className="text-xs font-mono px-2 py-1 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">MINUTA</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400 text-xs uppercase block">Consorciado</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCliente?.nome}</span>
                <span className="text-slate-500 block text-xs font-mono">{selectedCliente?.cpfCnpj}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase block">Grupo Selecionado</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Grupo {selectedGrupo?.codigoGrupo || selectedGrupo?.codigo}</span>
                <span className="text-slate-500 block text-xs">Cota: <strong>Atribuição Automática (Sequencial)</strong></span>
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase block">Bem de Referência</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedBem?.descricao || matchedProduto?.bemReferencia?.descricao || matchedProduto?.nome || 'Conforme Categoria do Grupo'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase block">Crédito Contratado</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">R$ {Number(valorCredito || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs uppercase block">Prazo de Pagamento</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{term} meses</span>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
              <h5 className="font-title font-bold text-xs text-slate-800 dark:text-slate-300 uppercase">Composição da Parcela Mensal</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Fundo Comum:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">R$ {fundoComum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <span className="text-slate-400">Taxa Adm ({taxa}%):</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">R$ {taxaAdm.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <span className="text-slate-400">Fundo Reserva (2%):</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">R$ {fundoReserva.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <span className="text-slate-400">Seguro Prestamista:</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">R$ {seguroPrestamista.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-3 rounded-xl mt-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Total da Parcela:</span>
                <span className="text-base font-bold text-brand-500">R$ {totalInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={handlePrevStep} 
              disabled={isSubmitting}
            >
              &larr; Voltar
            </button>
            <button 
              type="button" 
              className="btn btn-primary flex-1" 
              onClick={handleEfetivarProposta}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processando Adesão...</>
              ) : (
                "Efetivar Proposta"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
