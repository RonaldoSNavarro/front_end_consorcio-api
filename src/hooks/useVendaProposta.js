import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

// Schema de validação Zod para o crédito
export const vendaPropostaSchema = z.object({
  valorCredito: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const num = Number(val);
      return Number.isNaN(num) ? undefined : num;
    },
    z.number({
      invalid_type_error: 'Valor do crédito deve ser um número',
      required_error: 'Valor do crédito é obrigatório'
    })
    .positive('O valor do crédito deve ser positivo.')
    .min(1000, 'O valor do crédito deve ser de pelo menos R$ 1.000,00')
  )
});

export function useVendaProposta() {
  const { triggerToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState('IMOVEL');
  const [selectedBem, setSelectedBem] = useState(null);
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [selectedCotaNumero, setSelectedCotaNumero] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [contratarSeguro, setContratarSeguro] = useState(false);
  const [selectedPrazo, setSelectedPrazo] = useState(120);

  const [clienteSearch, setClienteSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Configuração do react-hook-form com Zod
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(vendaPropostaSchema),
    defaultValues: {
      valorCredito: 50000
    },
    mode: 'onChange'
  });

  const valorCredito = watch('valorCredito');

  // Debounce para busca de cliente
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(clienteSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [clienteSearch]);

  // Query: Clientes
  const { data: clientesData, isLoading: isLoadingClientes } = useQuery({
    queryKey: ['clientes', 0, 30, debouncedSearch],
    queryFn: () => api.clientes.listar(0, 30, debouncedSearch)
  });

  const clientes = useMemo(() => {
    const list = clientesData?.content || clientesData || [];
    return list.filter(c => c.statusCliente !== 'INATIVO' && c.status !== 'INATIVO');
  }, [clientesData]);

  // Query: Bens de Referência
  const { data: bensData, isLoading: isLoadingBens } = useQuery({
    queryKey: ['bensReferencia'],
    queryFn: () => api.bens.listarTodos()
  });

  const bensList = useMemo(() => {
    return Array.isArray(bensData) ? bensData : (bensData?.content || []);
  }, [bensData]);

  // Filtrar bens de referência pela Categoria BACEN selecionada
  const bensFiltrados = useMemo(() => {
    if (!selectedCategoria) return bensList;
    return bensList.filter(bem => {
      const tipoBacen = bem.categoriaBem?.tipoBacen;
      if (selectedCategoria === 'IMOVEL') return tipoBacen === 'BEM_IMOVEL';
      if (selectedCategoria === 'VEICULO_AUTOMOTOR') return tipoBacen === 'BEM_MOVEL_I';
      if (selectedCategoria === 'OUTROS_BENS_MOVEIS') return tipoBacen === 'BEM_MOVEL_II';
      if (selectedCategoria === 'SERVICO') return tipoBacen === 'SERVICO';
      return true;
    });
  }, [bensList, selectedCategoria]);

  // Auto-seleção do Bem de Referência (se houver apenas 1 ou se o atual não pertencer à categoria)
  useEffect(() => {
    if (bensFiltrados.length > 0) {
      if (!selectedBem || !bensFiltrados.find(b => b.id === selectedBem.id)) {
        setSelectedBem(bensFiltrados[0]);
      }
    } else {
      setSelectedBem(null);
    }
  }, [bensFiltrados, selectedBem]);

  // Atualizar valorCredito no form dinamicamente a partir do bem selecionado
  const creditValue = selectedBem ? Number(selectedBem.valorAtual || 0) : (valorCredito || 50000);
  useEffect(() => {
    if (selectedBem) {
      setValue('valorCredito', Number(selectedBem.valorAtual || 0));
    }
  }, [selectedBem, setValue]);

  // Query: Produtos
  const { data: produtos } = useQuery({
    queryKey: ['produtosConsorcio'],
    queryFn: () => api.vendas.produtos()
  });

  // Query: Grupos
  const { data: gruposData, isLoading: isLoadingGrupos } = useQuery({
    queryKey: ['grupos'],
    queryFn: () => api.grupos.listar()
  });

  const gruposList = useMemo(() => {
    const list = gruposData?.content || gruposData || [];
    return list.filter(g => g.status === 'EM_FORMACAO' || g.status === 'EM_ANDAMENTO');
  }, [gruposData]);

  // Filtrar grupos elegíveis por Categoria e Prazo
  const gruposElegiveis = useMemo(() => {
    return gruposList.filter(g => {
      if (g.categoriaBem !== selectedCategoria) return false;
      if (selectedPrazo) {
        const prazos = g.prazosPermitidos && g.prazosPermitidos.length > 0
          ? g.prazosPermitidos
          : [g.prazoMeses || g.prazoMaximoMeses];
        return prazos.includes(selectedPrazo);
      }
      return true;
    });
  }, [gruposList, selectedCategoria, selectedPrazo]);

  // Auto-atribuir primeiro Grupo Elegível
  useEffect(() => {
    if (gruposElegiveis.length > 0) {
      if (!selectedGrupo || !gruposElegiveis.find(g => g.id === selectedGrupo.id)) {
        setSelectedGrupo(gruposElegiveis[0]);
      }
    } else {
      setSelectedGrupo(null);
    }
  }, [gruposElegiveis, selectedGrupo]);

  // Query: Cotas do grupo selecionado
  const { data: cotasData, isLoading: isLoadingCotas } = useQuery({
    queryKey: ['cotas', selectedGrupo?.id],
    queryFn: () => api.cotas.listarPorGrupo(selectedGrupo.id),
    enabled: !!selectedGrupo?.id
  });

  const occupiedQuotas = useMemo(() => {
    const list = cotasData || [];
    return list
      .filter(c => c.status !== 'CANCELADA' && c.status !== 'EXCLUIDA')
      .map(c => c.numeroCota)
      .filter(Boolean);
  }, [cotasData]);

  const vacantQuotas = useMemo(() => {
    const vacant = [];
    const maxCotas = selectedGrupo?.quantidadeCotas || 1000;
    for (let i = 1; i <= maxCotas; i++) {
      if (!occupiedQuotas.includes(i)) {
        vacant.push(i);
      }
    }
    return vacant;
  }, [occupiedQuotas, selectedGrupo]);

  // Auto-select primeira cota vaga
  useEffect(() => {
    if (vacantQuotas.length > 0 && (!selectedCotaNumero || !vacantQuotas.includes(selectedCotaNumero))) {
      setSelectedCotaNumero(vacantQuotas[0]);
    }
  }, [vacantQuotas, selectedCotaNumero]);

  // Query: Tipos Venda
  const { data: tipos } = useQuery({
    queryKey: ['tiposVenda'],
    queryFn: () => api.vendas.listarTiposAtivos()
  });

  // Auto-select primeiro canal
  useEffect(() => {
    if (tipos && tipos.length > 0 && !selectedTipo) {
      setSelectedTipo(tipos[0]);
    }
  }, [tipos, selectedTipo]);

  // Cálculos para simulação
  const term = selectedPrazo || (selectedGrupo ? (selectedGrupo.prazoMeses || selectedGrupo.prazoMaximoMeses || 120) : 120);
  const taxa = selectedGrupo ? selectedGrupo.taxaAdministracao : 15;
  const reserves = 2; // padrão 2%
  const valCreditoCalc = selectedBem ? Number(selectedBem.valorAtual || 0) : (Number(valorCredito) || 0);

  const fundoComum = valCreditoCalc / term;
  const taxaAdm = fundoComum * (taxa / 100);
  const fundoReserva = fundoComum * (reserves / 100);
  const seguroPrestamista = contratarSeguro ? (fundoComum * 0.01) : 0;
  const totalInstallment = fundoComum + taxaAdm + fundoReserva + seguroPrestamista;

  const matchedProduto = useMemo(() => {
    if (!produtos || produtos.length === 0) return null;
    if (selectedGrupo) {
      const catGroup = selectedGrupo.categoriaBem;
      // 1. Tentar encontrar produto com Categoria de Bem compatível com a do Grupo
      const matched = produtos.find(p => {
        const tipoBacen = p.bemReferencia?.categoriaBem?.tipoBacen;
        if (catGroup === 'IMOVEL' && tipoBacen === 'BEM_IMOVEL') return true;
        if (catGroup === 'VEICULO_AUTOMOTOR' && tipoBacen === 'BEM_MOVEL_I') return true;
        if (catGroup === 'OUTROS_BENS_MOVEIS' && tipoBacen === 'BEM_MOVEL_II') return true;
        if (catGroup === 'SERVICO' && tipoBacen === 'SERVICO') return true;
        return false;
      });
      if (matched) return matched;

      // 2. Fallback: encontrar por prazo
      const matchedByPrazo = produtos.find(p => p.prazoMeses === selectedGrupo.prazoMeses);
      if (matchedByPrazo) return matchedByPrazo;
    }
    return produtos[0];
  }, [produtos, selectedGrupo]);

  // Mutation para o fluxo completo
  const vendaMutation = useMutation({
    mutationFn: async () => {
      if (!matchedProduto) {
        throw new Error("Nenhum produto de consórcio cadastrado.");
      }

      // 1. Criar Proposta
      const proposta = await api.vendas.criarProposta({
        clienteId: selectedCliente.id,
        produtoId: matchedProduto.id,
        grupoId: selectedGrupo?.id,
        tipoVendaId: selectedTipo.id,
        valorCreditoSolicitado: Number(valorCredito)
      });

      // 2. Aprovar Proposta
      let contrato;
      try {
        contrato = await api.vendas.aprovarProposta(proposta.id);
      } catch (err) {
        if (err.message && err.message.includes("Compliance")) {
          return { isCompliance: true, message: err.message };
        }
        throw err;
      }

      // 3. Efetivar Contrato (Simulação de Pagamento)
      const efetivacao = await api.vendas.efetivarContrato(contrato.id);

      return efetivacao;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cotas'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['grupos'] });

      if (data && data.isCompliance) {
        triggerToast("Proposta com cliente de alto risco/alerta enviada para a Esteira de Análise de Risco (Compliance).", "warning");
        navigate("/compliance/analise-risco");
      } else {
        triggerToast("Venda efetivada com sucesso!", "success");
        navigate("/cotas");
      }
    },
    onError: (err) => {
      triggerToast(err.message || "Erro ao efetivar proposta.", "danger");
    }
  });

  const handleEfetivarProposta = () => {
    vendaMutation.mutate();
  };

  const handleNextStep = async () => {
    if (step === 1) {
      const isValid = await trigger('valorCredito');
      if (!isValid) return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  return {
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
    debouncedSearch,
    isSubmitting: vendaMutation.isPending,
    clientes,
    isLoadingClientes,
    produtos,
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
    handleSubmit,
    errors
  };
}
