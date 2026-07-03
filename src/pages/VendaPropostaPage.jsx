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
    valorCredito,
    selectedGrupo,
    setSelectedGrupo,
    selectedCotaNumero,
    setSelectedCotaNumero,
    selectedTipo,
    setSelectedTipo,
    contratarSeguro,
    setContratarSeguro,
    clienteSearch,
    setClienteSearch,
    isSubmitting,
    clientes,
    isLoadingClientes,
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

      {/* PASSO 1 — Valor do Crédito & Simulação & Grupo/Cota */}
      {step === 1 && (
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-brand-500" />
            <h3 className="font-title font-bold text-slate-900 dark:text-white">Valor do Crédito</h3>
          </div>
          
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-sm text-emerald-700 dark:text-emerald-400 flex gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            Cliente Selecionado: <strong>{selectedCliente?.nome}</strong>
          </div>

          <div className="form-group">
            <label htmlFor="credit-value" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Valor do Crédito (R$)</label>
            <input 
              id="credit-value"
              type="number" 
              className="form-input" 
              {...register('valorCredito', { valueAsNumber: true })}
              placeholder="Ex: 50000"
            />
            {errors.valorCredito && (
              <span className="text-red-500 text-xs mt-1 block">
                {errors.valorCredito.message}
              </span>
            )}
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

          {/* Seleção do Grupo */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Selecionar Grupo</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoadingGrupos ? (
                <div className="col-span-2 text-center py-4 text-slate-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /> Carregando grupos...</div>
              ) : gruposList.map(g => {
                const arrecadado = g.status === 'EM_FORMACAO' ? '15%' : '65%';
                const prazoRestante = g.status === 'EM_FORMACAO' ? g.prazoMeses : Math.max(1, g.prazoMeses - 6);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGrupo(g)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedGrupo?.id === g.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700/50 hover:border-brand-300 dark:hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{g.codigo}</div>
                        <div className="text-xs text-slate-500 mt-1">Status: <span className="font-semibold">{g.status?.replace('_', ' ')}</span></div>
                        <div className="text-xs text-slate-500 mt-1">Prazo Total: {g.prazoMeses} meses | TX Adm: {g.taxaAdministracao}%</div>
                        <div className="mt-2 flex gap-4 text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400">Arrecadado: <strong>{arrecadado}</strong></span>
                          <span className="text-amber-500">Prazo Restante: <strong>{prazoRestante} meses</strong></span>
                        </div>
                      </div>
                      {selectedGrupo?.id === g.id && <CheckCircle className="w-5 h-5 text-brand-500 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seleção de Cota Vaga */}
          {selectedGrupo && (
            <div className="space-y-2">
              <label htmlFor="quota-select" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reservar Cota Vaga</label>
              {isLoadingCotas ? (
                <div className="text-slate-400 text-xs flex items-center gap-1"><Loader2 className="w-4 h-4 animate-spin" /> Buscando cotas ocupadas...</div>
              ) : (
                <div className="flex items-center gap-3">
                  <select
                    id="quota-select"
                    className="form-input max-w-[200px]"
                    value={selectedCotaNumero || ''}
                    onChange={e => setSelectedCotaNumero(Number(e.target.value))}
                  >
                    {vacantQuotas.map(q => (
                      <option key={q} value={q}>Cota {String(q).padStart(3, '0')}</option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-400">({vacantQuotas.length} cotas disponíveis de 100)</span>
                </div>
              )}
            </div>
          )}

          {/* Botão de Avanço */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <button type="button" className="btn btn-outline" onClick={handlePrevStep}>&larr; Voltar</button>
            <button 
              type="button" 
              className="btn btn-primary flex-1" 
              onClick={handleNextStep}
              disabled={!selectedGrupo || !selectedCotaNumero}
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
              Grupo: <strong>{selectedGrupo?.codigo}</strong> | Cota: <strong>{selectedCotaNumero}</strong> | Crédito: <strong>R$ {Number(valorCredito || 0).toLocaleString('pt-BR')}</strong>
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
                <span className="text-slate-400 text-xs uppercase block">Grupo e Cota Reservada</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Grupo {selectedGrupo?.codigo}</span>
                <span className="text-slate-500 block text-xs">Cota Reservada: <strong>{String(selectedCotaNumero).padStart(3, '0')}</strong></span>
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
