import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Users, Package, Tag, ChevronRight, CheckCircle, Loader2, AlertCircle, UserPlus, FileText, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const { triggerToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [contratarSeguro, setContratarSeguro] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  
  const [clienteSearch, setClienteSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Retornos dos novos endpoints
  const [novaProposta, setNovaProposta] = useState(null);
  const [novoContrato, setNovoContrato] = useState(null);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(clienteSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [clienteSearch]);

  const { data: clientesData, isLoading: isLoadingClientes } = useQuery({ 
    queryKey: ['clientes', 0, 30, debouncedSearch], 
    queryFn: () => api.clientes.listar(0, 30, debouncedSearch) 
  });
  const clientes = (clientesData?.content || clientesData || []).filter(c => c.statusCliente !== 'INATIVO');

  const { data: produtos, isLoading: isLoadingProdutos } = useQuery({
    queryKey: ['produtosConsorcio'],
    queryFn: () => api.vendas.produtos()
  });

  const { data: tipos } = useQuery({
    queryKey: ['tiposVenda'],
    queryFn: () => api.vendas.listarTiposAtivos()
  });

  // MUTAÇÕES
  const criarPropostaMutation = useMutation({
    mutationFn: () => api.vendas.criarProposta({
      clienteId: selectedCliente.id,
      produtoId: selectedProduto.id,
      tipoVendaId: selectedTipo.id,
      valorCreditoSolicitado: selectedProduto?.bemReferencia?.valorAtual || 0,
      contratouSeguro: contratarSeguro,
      observacoes: observacoes || null
    }),
    onSuccess: (data) => {
      setNovaProposta(data);
      triggerToast(`Proposta #${data.id} gerada! Status: EM_ANALISE.`, 'success');
      setStep(4);
    },
    onError: (err) => triggerToast(err.message || "Erro ao criar proposta.", 'danger')
  });

  const aprovarPropostaMutation = useMutation({
    mutationFn: (propostaId) => api.vendas.aprovarProposta(propostaId),
    onSuccess: (data) => {
      setNovoContrato(data); // O retorno deve ser o ContratoDTO gerado
      triggerToast(`Proposta Aprovada! Contrato gerado aguardando adesão.`, 'success');
      setStep(5);
    },
    onError: (err) => triggerToast(err.message || "Erro ao aprovar proposta.", 'danger')
  });

  const efetivarContratoMutation = useMutation({
    mutationFn: (contratoId) => api.vendas.efetivarContrato(contratoId),
    onSuccess: (data) => {
      triggerToast(`Pagamento da adesão confirmado! Cota criada no grupo.`, 'success');
      navigate('/cotas');
    },
    onError: (err) => triggerToast(err.message || "Erro ao efetivar contrato.", 'danger')
  });

  const steps = ['Cliente', 'Produto', 'Tipo Venda', 'Criar', 'Analisar', 'Adesão'];

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
          <input type="search" placeholder="Buscar por nome ou CPF/CNPJ..." className="form-input"
            value={clienteSearch} onChange={e => setClienteSearch(e.target.value)} />
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
            {isLoadingClientes ? (
               <div className="text-center py-8 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /> Buscando...</div>
            ) : (
              clientes.slice(0, 30).map(c => (
                <button key={c.id} onClick={() => { setSelectedCliente(c); setStep(1); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selectedCliente?.id === c.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700/50 hover:border-brand-300 dark:hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
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

      {/* PASSO 1 — Produto do Consórcio */}
      {step === 1 && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-brand-500" />
            <h3 className="font-title font-bold text-slate-900 dark:text-white">Selecione o Produto (Plano)</h3>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-sm text-emerald-700 dark:text-emerald-400 flex gap-2 mb-4">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            Cliente: <strong>{selectedCliente?.nome}</strong>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoadingProdutos ? (
               <div className="col-span-2 text-center py-8 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /> Carregando produtos...</div>
            ) : (
              (produtos || []).map(p => (
                <button key={p.id} onClick={() => { setSelectedProduto(p); setStep(2); }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedProduto?.id === p.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700/50 hover:border-brand-300 dark:hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{p.nome}</div>
                      <div className="text-xs text-slate-500 mt-1">Crédito Base: <span className="font-semibold text-slate-700 dark:text-slate-300">R$ {p.bemReferencia?.valorAtual?.toLocaleString('pt-BR')}</span></div>
                      <div className="text-xs text-slate-500 mt-1">Bem: {p.bemReferencia?.descricao}</div>
                      <div className="text-xs text-slate-500 mt-1">Prazo: {p.prazoMeses} meses | TX. Adm: {(p.taxaAdministracaoPerc * 100).toFixed(2)}%</div>
                    </div>
                    {selectedProduto?.id === p.id && <CheckCircle className="w-5 h-5 text-brand-500 shrink-0" />}
                  </div>
                </button>
              ))
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <button className="btn btn-outline" onClick={() => setStep(0)}>&larr; Voltar</button>
          </div>
        </div>
      )}

      {/* PASSO 2 — Tipo de Venda */}
      {step === 2 && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-brand-500" />
            <h3 className="font-title font-bold text-slate-900 dark:text-white">Tipo de Venda</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {(tipos || []).map(t => (
              <button key={t.id} onClick={() => { setSelectedTipo(t); setStep(3); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTipo?.id === t.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-slate-700/50 hover:border-brand-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">{t.nome}</div>
                    {t.descricao && <div className="text-xs text-slate-400 mt-0.5">{t.descricao}</div>}
                    <div className="text-xs text-slate-500 mt-1">
                      Comissão: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{(t.percentualComissao * 100).toFixed(1)}%</span>
                      {t.exigeSeguro && <span className="ml-2 badge badge-warning text-[10px] py-0">Exige Seguro</span>}
                    </div>
                  </div>
                  {selectedTipo?.id === t.id && <CheckCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />}
                </div>
              </button>
            ))}
          </div>
          <button className="btn btn-outline mt-2" onClick={() => setStep(1)}>&larr; Voltar</button>
        </div>
      )}

      {/* PASSO 3 — Confirmação e Criação da Proposta */}
      {step === 3 && (
        <div className="glass-panel p-6 space-y-6">
          <h3 className="font-title font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-500" />
            Revisar e Criar Proposta
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Consorciado</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedCliente?.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Produto de Consórcio</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedProduto?.nome} (R$ {selectedProduto?.bemReferencia?.valorAtual?.toLocaleString('pt-BR')})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Canal de Venda</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedTipo?.nome}</span>
              </div>
            </div>

            {selectedTipo?.exigeSeguro && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                Este tipo de venda exige contratação de seguro de vida.
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-brand-300 dark:hover:border-brand-500/50 transition-all">
              <input type="checkbox" checked={contratarSeguro} onChange={e => setContratarSeguro(e.target.checked)} className="w-4 h-4 rounded text-brand-500" />
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Contratar Seguro de Vida</div>
                <div className="text-xs text-slate-400">Proteção em caso de invalidez ou falecimento do consorciado</div>
              </div>
            </label>

            <div className="form-group">
              <label htmlFor="obs-venda">Observações (Opcional)</label>
              <textarea id="obs-venda" rows={2} className="form-input" placeholder="Informações adicionais sobre a proposta..."
                value={observacoes} onChange={e => setObservacoes(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <button className="btn btn-outline" onClick={() => setStep(2)} disabled={criarPropostaMutation.isPending}>&larr; Voltar</button>
            <button className="btn btn-primary flex-1" onClick={() => criarPropostaMutation.mutate()} disabled={criarPropostaMutation.isPending}>
              {criarPropostaMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Gerando Proposta...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Gerar Proposta de Adesão</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* PASSO 4 — Aprovação Backoffice */}
      {step === 4 && (
        <div className="glass-panel p-6 space-y-6 text-center">
          <div className="w-16 h-16 bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="font-title text-xl font-bold text-slate-900 dark:text-white">
            Proposta Criada com Sucesso!
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            A proposta <span className="font-mono font-bold text-slate-700 dark:text-slate-300">#{novaProposta?.id}</span> encontra-se em <span className="badge badge-warning">ANÁLISE</span>.
            Nesta etapa, o setor de Backoffice deve validar os documentos e aprovar a proposta.
          </p>
          
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <button 
              className="btn btn-primary w-full max-w-sm mx-auto" 
              onClick={() => aprovarPropostaMutation.mutate(novaProposta?.id)}
              disabled={aprovarPropostaMutation.isPending}
            >
              {aprovarPropostaMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</>
              ) : (
                <>Simular Aprovação (Backoffice) &rarr;</>
              )}
            </button>
            <p className="text-xs text-slate-400 mt-3">Para fins de demonstração, simulamos o clique do analista aqui.</p>
          </div>
        </div>
      )}

      {/* PASSO 5 — Pagamento da Adesão */}
      {step === 5 && (
        <div className="glass-panel p-6 space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Banknote className="w-8 h-8" />
          </div>
          <h3 className="font-title text-xl font-bold text-slate-900 dark:text-white">
            Contrato Gerado
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
            O contrato de adesão foi emitido sob status <span className="badge badge-info">PENDENTE PAGAMENTO</span>.
            A cota só será vinculada a um grupo após a confirmação do pagamento da primeira parcela (Taxa de Adesão).
          </p>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 max-w-sm mx-auto flex justify-between items-center">
             <div className="text-left">
               <div className="text-xs text-slate-500">Valor da Adesão</div>
               <div className="font-semibold text-lg text-slate-900 dark:text-white">
                 R$ {((selectedProduto?.bemReferencia?.valorAtual || 0) * 0.01).toLocaleString('pt-BR')}
               </div>
             </div>
             <Banknote className="w-6 h-6 text-emerald-500 opacity-50" />
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <button 
              className="btn bg-emerald-600 hover:bg-emerald-700 text-white w-full max-w-sm mx-auto border-none" 
              onClick={() => efetivarContratoMutation.mutate(novoContrato?.id || novaProposta?.id)}
              disabled={efetivarContratoMutation.isPending}
            >
              {efetivarContratoMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Efetivando...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Simular Pagamento do Cliente</>
              )}
            </button>
            <p className="text-xs text-slate-400 mt-3">Após pagar, o sistema alocará o grupo e criará a Cota.</p>
          </div>
        </div>
      )}
    </div>
  );
};
