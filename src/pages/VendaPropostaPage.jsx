import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Users, Banknote, Tag, ChevronRight, CheckCircle, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StepIndicator = ({ steps, current }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
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
  const [valorCredito, setValorCredito] = useState(50000);
  const [categoriaBem, setCategoriaBem] = useState('VEICULO_AUTOMOTOR');
  const [prazoMeses, setPrazoMeses] = useState(60);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [contratarSeguro, setContratarSeguro] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [clienteSearch, setClienteSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(clienteSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [clienteSearch]);

  const { data: clientesData } = useQuery({ 
    queryKey: ['clientes', 0, 30, debouncedSearch], 
    queryFn: () => api.clientes.listar(0, 30, debouncedSearch) 
  });
  const clientes = (clientesData?.content || clientesData || []).filter(c => c.statusCliente !== 'INATIVO');

  const { data: tiposData } = useQuery({
    queryKey: ['tiposVenda'],
    queryFn: () => api.vendas.listarTiposAtivos()
  });
  const tipos = tiposData || [];

  const efetivarMutation = useMutation({
    mutationFn: () => api.vendas.efetivarVenda({
      clienteId: selectedCliente.id,
      valorCreditoDesejado: valorCredito,
      categoriaBem: categoriaBem,
      prazoMeses: prazoMeses,
      tipoVendaId: selectedTipo.id,
      contratarSeguro,
      observacoes: observacoes || null
    }),
    onSuccess: (data) => {
      triggerToast(`Venda efetivada! Cota #${data.numeroCota || data.id} criada e alocada automaticamente.`, 'success');
      navigate('/cotas');
    },
    onError: (err) => triggerToast(err.message || "Erro ao efetivar venda. Verifique se há grupos disponíveis com esses parâmetros.", 'danger')
  });

  // Busca agora é feita via backend com debouncedSearch.
  const filteredClientes = clientes;

  const steps = ['Selecionar Cliente', 'Parâmetros do Plano', 'Tipo de Venda', 'Confirmar'];

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="font-title text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <ShoppingCart className="w-6 h-6 text-brand-500" /> Nova Proposta de Adesão
        </h2>
        <p className="text-sm text-slate-400 mt-1">O sistema alocará a cota automaticamente no melhor grupo disponível</p>
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
            {filteredClientes.slice(0, 30).map(c => (
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
            ))}
            {filteredClientes.length === 0 && (
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

      {/* PASSO 1 — Parâmetros do Plano */}
      {step === 1 && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Banknote className="w-5 h-5 text-brand-500" />
            <h3 className="font-title font-bold text-slate-900 dark:text-white">Parâmetros do Plano</h3>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-sm text-emerald-700 dark:text-emerald-400 flex gap-2 mb-4">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            Cliente: <strong>{selectedCliente?.nome}</strong>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Valor do Crédito</label>
              <div className="flex gap-2 items-center">
                <span className="text-slate-500 font-semibold">R$</span>
                <input type="number" className="form-input text-lg font-mono" min="1000" step="1000"
                  value={valorCredito} onChange={e => setValorCredito(Number(e.target.value))} />
              </div>
            </div>

            <div className="form-group">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Prazo (Meses)</label>
              <input type="number" className="form-input text-lg font-mono" min="12" step="1"
                value={prazoMeses} onChange={e => setPrazoMeses(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Categoria do Bem</label>
              <select className="form-input" value={categoriaBem} onChange={e => setCategoriaBem(e.target.value)}>
                <option value="VEICULO_AUTOMOTOR">Veículo Automotor</option>
                <option value="IMOVEL">Imóvel</option>
                <option value="SERVICO">Serviço</option>
                <option value="OUTROS_BENS_MOVEIS">Outros Bens Móveis</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">O sistema alocará automaticamente o cliente em um grupo ativo que corresponda a estes parâmetros.</p>
          
          <div className="flex gap-3 pt-4">
            <button className="btn btn-outline" onClick={() => setStep(0)}>&larr; Voltar</button>
            <button className="btn btn-primary flex-1" onClick={() => setStep(2)}>Avançar &rarr;</button>
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
            {tipos.map(t => (
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

      {/* PASSO 3 — Confirmação */}
      {step === 3 && (
        <div className="glass-panel p-6 space-y-6">
          <h3 className="font-title font-bold text-slate-900 dark:text-white">Confirmar Proposta</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedCliente?.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Crédito Desejado</span>
                <span className="font-semibold text-slate-900 dark:text-white">R$ {valorCredito?.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Canal de Venda</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedTipo?.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Comissão</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{(selectedTipo?.percentualComissao * 100).toFixed(1)}%</span>
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
              <label htmlFor="obs-venda">Observações</label>
              <textarea id="obs-venda" rows={2} className="form-input" placeholder="Informações adicionais sobre a proposta..."
                value={observacoes} onChange={e => setObservacoes(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <button className="btn btn-outline" onClick={() => setStep(2)} disabled={efetivarMutation.isPending}>&larr; Voltar</button>
            <button className="btn btn-primary flex-1" onClick={() => efetivarMutation.mutate()} disabled={efetivarMutation.isPending}>
              {efetivarMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Efetivar Proposta</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
