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
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [selectedCotaNumero, setSelectedCotaNumero] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [contratarSeguro, setContratarSeguro] = useState(false);

  const [clienteSearch, setClienteSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Configuração do react-hook-form com Zod
  const {
    register,
    handleSubmit,
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

  // Debouce para busca de cliente
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

  // Auto-select primeiro grupo
  useEffect(() => {
    if (gruposList.length > 0 && !selectedGrupo) {
      setSelectedGrupo(gruposList[0]);
    }
  }, [gruposList, selectedGrupo]);

  // Query: Cotas do grupo selecionado
  const { data: cotasData, isLoading: isLoadingCotas } = useQuery({
    queryKey: ['cotas', selectedGrupo?.id],
    queryFn: () => api.cotas.listarPorGrupo(selectedGrupo.id),
    enabled: !!selectedGrupo?.id
  });

  const occupiedQuotas = useMemo(() => {
    const list = cotasData || [];
    // Cotas CANCELADAS ou EXCLUIDAS estão vagas para venda de reposição (Art. 31-A BCB 285)
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
  const term = selectedGrupo ? selectedGrupo.prazoMeses : 100;
  const taxa = selectedGrupo ? selectedGrupo.taxaAdministracao : 15;
  const reserves = 2; // padrão 2%
  const creditValue = Number(valorCredito) || 0;

  const fundoComum = creditValue / term;
  const taxaAdm = fundoComum * (taxa / 100);
  const fundoReserva = fundoComum * (reserves / 100);
  const seguroPrestamista = contratarSeguro ? (fundoComum * 0.01) : 0;
  const totalInstallment = fundoComum + taxaAdm + fundoReserva + seguroPrestamista;

  const getMatchedProduto = () => {
    if (!produtos || produtos.length === 0) return null;
    if (selectedGrupo) {
      const matched = produtos.find(p => p.prazoMeses === selectedGrupo.prazoMeses);
      if (matched) return matched;
    }
    return produtos[0];
  };

  // Mutation para o fluxo completo
  const vendaMutation = useMutation({
    mutationFn: async () => {
      const matchedProduto = getMatchedProduto();
      if (!matchedProduto) {
        throw new Error("Nenhum produto de consórcio cadastrado.");
      }

      // 1. Criar Proposta
      const proposta = await api.vendas.criarProposta({
        clienteId: selectedCliente.id,
        produtoId: matchedProduto.id,
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
    debouncedSearch,
    isSubmitting: vendaMutation.isPending,
    clientes,
    isLoadingClientes,
    produtos,
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
