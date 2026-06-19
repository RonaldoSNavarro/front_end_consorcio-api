import { mockDb } from './mockDb';

const BASE_URL = import.meta.env?.VITE_API_URL || (typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 'http://localhost:8080' : '');

let isMockMode = true;

const fetchApi = (url, options = {}) => {
  return fetch(url, { ...options, credentials: 'include' });
};

const handleResponseError = async (response, defaultMessage) => {
  try {
    const errData = await response.json();
    if (errData.detalhes) {
      return new Error(`${errData.mensagem}: ${errData.detalhes}`);
    }
    return new Error(errData.mensagem || defaultMessage);
  } catch (e) {
    return new Error(defaultMessage);
  }
};

// Ping backend to detect online/offline status
export const detectBackend = async () => {
  // Em homolog/prod, VITE_ENABLE_MOCK_FALLBACK pode ser explicitamente "false"
  const allowMockFallback = import.meta.env?.VITE_ENABLE_MOCK_FALLBACK !== 'false';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1000);
  try {
    // Apenas tenta um fetch leve com timeout curto. 
    // Qualquer status de resposta HTTP (mesmo 403 ou 401 de acesso negado pelo JWT) prova que o Spring Boot está rodando!
    const response = await fetchApi(`${BASE_URL}/api/clientes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (response.status === 502 || response.status === 504) {
      throw new Error("Backend offline (Vite Proxy Error 502/504)");
    }
    
    isMockMode = false;
    console.log("🔌 backend: Spring Boot API ativa. Rodando em Modo Real.");
    return false; // isMockMode = false
  } catch (e) {
    clearTimeout(timeoutId);
    
    if (!allowMockFallback) {
      console.error("🔌 backend: API offline e fallback para simulação está DESABILITADO neste ambiente.");
      isMockMode = false;
      throw new Error("O sistema encontra-se indisponível no momento.");
    }

    isMockMode = true;
    console.warn("🔌 backend: Spring Boot API offline. Ativando Modo Simulado.");
    return true; // isMockMode = true
  }
};

// Objeto unificado que decide se chama a API real ou a simulação local
export const api = {
  getIsMockMode: () => isMockMode,
  setMockMode: (val) => { isMockMode = val; },

  // --- AUTH ---
  login: async (username, password) => {
    if (isMockMode) {
      return mockDb.login(username, password);
    }
    const response = await fetchApi(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: username, senha: password })
    });
    if (!response.ok) throw await handleResponseError(response, "Falha na autenticação com o servidor Spring.");
    // Com HttpOnly Cookie, o token vem no cabeçalho e não no body. O Spring boot foi alterado para retornar vazio no body.
    return { token: "cookie_managed", message: "Login success" };
  },

  logout: async () => {
    if (isMockMode) {
      return;
    }
    await fetchApi(`${BASE_URL}/api/login/logout`, { method: 'POST' });
  },

  obterUsuarioLogado: async () => {
    if (isMockMode) {
      return { login: "admin", role: "ADMIN", isMock: true };
    }
    const response = await fetchApi(`${BASE_URL}/api/login/me`);
    if (!response.ok) throw new Error("Sessão inválida ou expirada.");
    return response.json();
  },

  // --- CLIENTES ---
  clientes: {
    listar: async (page = 0, size = 100) => {
      if (isMockMode) {
        const content = mockDb.clientes.listar();
        return { content, isMock: true };
      }
      const response = await fetchApi(`${BASE_URL}/api/clientes?page=${page}&size=${size}`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar clientes da API.");
      const data = await response.json(); // Spring Page object
      return { content: data.content || data, isMock: false };
    },
    salvar: async (dto) => {
      if (isMockMode) return mockDb.clientes.salvar(dto);
      const response = await fetchApi(`${BASE_URL}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao cadastrar cliente na API.");
      return response.json();
    },
    atualizar: async (id, dto) => {
      if (isMockMode) return mockDb.clientes.atualizar(id, dto);
      const response = await fetchApi(`${BASE_URL}/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao atualizar cliente na API.");
      return response.json();
    },
    inativar: async (id) => {
      if (isMockMode) return mockDb.clientes.inativar(id);
      const response = await fetchApi(`${BASE_URL}/api/clientes/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao inativar cliente na API.");
      return true;
    },
    buscarCep: async (cep) => {
      if (isMockMode) return mockDb.clientes.buscarCep(cep);
      const response = await fetchApi(`${BASE_URL}/api/clientes/busca-cep/${cep}`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar endereço pelo CEP.");
      return response.json();
    },
    obterHistorico: async (id, tipo = null) => {
      if (isMockMode) return mockDb.clientes.obterHistorico(id, tipo);
      const url = tipo 
        ? `${BASE_URL}/api/clientes/${id}/historico?tipo=${tipo}`
        : `${BASE_URL}/api/clientes/${id}/historico`;
      const response = await fetchApi(url);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar histórico do cliente.");
      return response.json();
    }
  },

  // --- GRUPOS ---
  grupos: {
    listar: async () => {
      if (isMockMode) return { content: mockDb.grupos.listar(), isMock: true };
      const response = await fetchApi(`${BASE_URL}/api/grupos?size=2000`);
      if (!response.ok) throw new Error("Erro ao listar grupos da API.");
      const data = await response.json();
      return { content: data.content || data, isMock: false };
    },
    salvar: async (dto) => {
      if (isMockMode) return mockDb.grupos.salvar(dto);
      const response = await fetchApi(`${BASE_URL}/api/grupos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao cadastrar grupo na API.");
      return response.json();
    },
    inaugurar: async (id, dataAssembleia) => {
      if (isMockMode) return mockDb.grupos.inaugurar(id, dataAssembleia);
      const response = await fetchApi(`${BASE_URL}/api/grupos/${id}/inaugurar?dataAssembleia=${dataAssembleia}`, {
        method: 'PUT'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao inaugurar grupo na API.");
      return response.json();
    },
    reajustar: async (id, novoValorCredito) => {
      if (isMockMode) return mockDb.grupos.reajustar(id, novoValorCredito);
      const response = await fetchApi(`${BASE_URL}/api/grupos/${id}/reajuste?novoValorCredito=${novoValorCredito}`, {
        method: 'PUT'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao reajustar crédito na API.");
      return response.json();
    },
    obterFinanceiro: async (id) => {
      if (isMockMode) return { data: mockDb.grupos.obterFinanceiro(id), isMock: true };
      const response = await fetchApi(`${BASE_URL}/api/grupos/${id}/financeiro`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao obter relatório financeiro do grupo na API.");
      const data = await response.json();
      return { data, isMock: false };
    },
    encerrar: async (id) => {
      if (isMockMode) return mockDb.grupos.encerrar(id);
      const response = await fetchApi(`${BASE_URL}/api/grupos/${id}/encerrar`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao encerrar grupo na API.");
      return response.json();
    },
    obterMovimentos: async (id) => {
      if (isMockMode) return mockDb.grupos.obterMovimentos(id);
      const response = await fetchApi(`${BASE_URL}/api/grupos/${id}/movimentos`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao obter extrato de movimentos do grupo na API.");
      return response.json();
    },
    obterSaldo: async (id) => {
      if (isMockMode) return mockDb.grupos.obterSaldo(id);
      const response = await fetchApi(`${BASE_URL}/api/grupos/${id}/saldo`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao obter saldo atual do grupo na API.");
      return response.json();
    },
  },

  // --- RELATÓRIOS ---
  relatorios: {
    balancete: async (grupoId, dataReferencia) => {
      if (isMockMode) return mockDb.relatorios.getBalancete(grupoId, dataReferencia);
      const url = dataReferencia ? `${BASE_URL}/api/relatorios/balancete/${grupoId}?dataReferencia=${dataReferencia}` : `${BASE_URL}/api/relatorios/balancete/${grupoId}`;
      const response = await fetchApi(url);
      if (!response.ok) throw await handleResponseError(response, "Erro ao gerar balancete.");
      return response.json();
    },
    estatisticas: async (grupoId, dataInicio, dataFim) => {
      if (isMockMode) return mockDb.relatorios.getEstatisticas(grupoId, dataInicio, dataFim);
      const url = `${BASE_URL}/api/relatorios/estatisticas/${grupoId}?dataInicio=${dataInicio}&dataFim=${dataFim}`;
      const response = await fetchApi(url);
      if (!response.ok) throw await handleResponseError(response, "Erro ao gerar estatísticas.");
      return response.json();
    },
    pldFt: async (dataInicio, dataFim) => {
      if (isMockMode) return mockDb.relatorios.getPldFt(dataInicio, dataFim);
      const url = `${BASE_URL}/api/relatorios/pld-ft?dataInicio=${dataInicio}&dataFim=${dataFim}`;
      const response = await fetchApi(url);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar alertas PLD/FT.");
      return response.json();
    }
  },

  // --- COTAS ---
  cotas: {
    listar: async () => {
      if (isMockMode) return { content: mockDb.cotas.listar(), isMock: true };
      const response = await fetchApi(`${BASE_URL}/api/cotas?size=2000`);
      if (!response.ok) throw new Error("Erro ao buscar cotas da API.");
      const data = await response.json();
      return { content: data.content || data, isMock: false };
    },
    listarPorCliente: async (clienteId) => {
      if (isMockMode) return mockDb.cotas.listarPorCliente(clienteId);
      const response = await fetchApi(`${BASE_URL}/api/cotas/cliente/${clienteId}`);
      if (!response.ok) throw new Error("Erro ao buscar cotas do cliente.");
      const data = await response.json();
      return data.content || data;
    },
    listarPorGrupo: async (grupoId) => {
      if (isMockMode) return mockDb.cotas.listarPorGrupo(grupoId);
      const response = await fetchApi(`${BASE_URL}/api/cotas/grupo/${grupoId}`);
      if (!response.ok) throw new Error("Erro ao buscar cotas do grupo.");
      const data = await response.json();
      return data.content || data;
    },
    salvar: async (dto) => {
      if (isMockMode) return mockDb.cotas.salvar(dto);
      const response = await fetchApi(`${BASE_URL}/api/cotas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao cadastrar cota na API.");
      return response.json();
    },
    cancelar: async (id) => {
      if (isMockMode) return mockDb.cotas.cancelar(id);
      const response = await fetchApi(`${BASE_URL}/api/cotas/${id}/cancelar`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao cancelar cota na API.");
      return response.json();
    },
    reembolsar: async (id) => {
      if (isMockMode) return mockDb.cotas.reembolsar(id);
      const response = await fetchApi(`${BASE_URL}/api/cotas/${id}/reembolsar`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao calcular reembolso da cota na API.");
      return response.json();
    },
    listarVersoes: async (id) => {
      if (isMockMode) return mockDb.cotas.listarVersoes(id);
      const response = await fetchApi(`${BASE_URL}/api/cotas/${id}/versoes`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar histórico de versões da cota na API.");
      return response.json();
    },
    obterMovimentos: async (id) => {
      if (isMockMode) return mockDb.cotas.obterMovimentos(id);
      const response = await fetchApi(`${BASE_URL}/api/cotas/${id}/movimentos`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar extrato de movimentos da cota na API.");
      return response.json();
    }
  },

  // --- LANCES ---
  lances: {
    salvar: async (dto) => {
      if (isMockMode) {
        return {
          id: Math.floor(Math.random() * 1000) + 1,
          cotaId: Number(dto.cotaId),
          assembleiaId: Number(dto.assembleiaId),
          tipo: dto.tipo,
          modalidade: dto.modalidade,
          valorOferta: Number(dto.valorOferta),
          dataOferta: new Date().toISOString(),
          statusApuracao: "PENDENTE"
        };
      }
      const response = await fetchApi(`${BASE_URL}/api/lances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao cadastrar lance na API.");
      return response.json();
    }
  },

  // --- PARCELAS ---
  parcelas: {
    listarPorCota: async (cotaId) => {
      if (isMockMode) return { content: mockDb.parcelas.listarPorCota(cotaId), isMock: true };
      const response = await fetchApi(`${BASE_URL}/api/parcelas/cota/${cotaId}`);
      if (!response.ok) throw new Error("Erro ao buscar histórico de parcelas.");
      const data = await response.json();
      return { content: data, isMock: false };
    },
    salvar: async (dto) => {
      if (isMockMode) return mockDb.parcelas.salvar(dto);
      const response = await fetchApi(`${BASE_URL}/api/parcelas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao gerar parcela na API.");
      return response.json();
    },
    pagar: async (id, dataPagamento) => {
      if (isMockMode) return mockDb.parcelas.pagar(id, dataPagamento);
      const response = await fetchApi(`${BASE_URL}/api/parcelas/${id}/pagar?dataPagamento=${dataPagamento}`, {
        method: 'PUT'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao registrar pagamento na API.");
      return response.json();
    },
    obterInadimplenciaCota: async (cotaId) => {
      if (isMockMode) return { data: mockDb.parcelas.obterInadimplenciaCota(cotaId), isMock: true };
      const response = await fetchApi(`${BASE_URL}/api/cotas/${cotaId}/inadimplencia`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao obter inadimplência da cota.");
      const data = await response.json();
      return { data, isMock: false };
    },
    amortizarPorReducaoDePrazo: async (cotaId, valorLance) => {
      if (isMockMode) return mockDb.parcelas.amortizarPorReducaoDePrazo(cotaId, valorLance);
      const response = await fetchApi(`${BASE_URL}/api/parcelas/cota/${cotaId}/lance/reducao-prazo?valorLance=${valorLance}`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro na amortização por redução de prazo.");
      return true;
    },
    amortizarPorDiluicao: async (cotaId, valorLance) => {
      if (isMockMode) return mockDb.parcelas.amortizarPorDiluicao(cotaId, valorLance);
      const response = await fetchApi(`${BASE_URL}/api/parcelas/cota/${cotaId}/lance/diluicao?valorLance=${valorLance}`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro na amortização por diluição.");
      return true;
    },
    estornar: async (id) => {
      if (isMockMode) return mockDb.parcelas.estornar(id);
      const response = await fetchApi(`${BASE_URL}/api/parcelas/${id}/estornar`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao estornar pagamento da parcela na API.");
      return response.json();
    }
  },

  // --- ASSEMBLEIAS ---
  assembleias: {
    listarPorGrupo: async (grupoId) => {
      if (isMockMode) return { content: mockDb.assembleias.listarPorGrupo(grupoId), isMock: true };
      const response = await fetchApi(`${BASE_URL}/api/assembleias/grupo/${grupoId}`);
      if (!response.ok) throw new Error("Erro ao listar assembleias do grupo na API.");
      const data = await response.json();
      return { content: data, isMock: false };
    },
    salvar: async (dto) => {
      if (isMockMode) return mockDb.assembleias.salvar(dto);
      const response = await fetchApi(`${BASE_URL}/api/assembleias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao agendar assembleia na API.");
      return response.json();
    }
  },

  // --- CONTEMPLAÇÕES ---
  contemplacoes: {
    listarPorAssembleia: async (assembleiaId) => {
      if (isMockMode) return { content: mockDb.contemplacoes.listarPorAssembleia(assembleiaId), isMock: true };
      const response = await fetchApi(`${BASE_URL}/api/contemplacoes/assembleia/${assembleiaId}`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar contemplações da assembleia.");
      const data = await response.json();
      return { content: data, isMock: false };
    },
    registrar: async (dto) => {
      if (isMockMode) return mockDb.contemplacoes.registrar(dto);
      const response = await fetchApi(`${BASE_URL}/api/contemplacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao registrar contemplação na API.");
      return response.json();
    }
  },
  
  // --- COMPLIANCE (PLD/FT) ---
  compliance: {
    sincronizar: async () => {
      if (isMockMode) return mockDb.compliance.sincronizar();
      const response = await fetchApi(`${BASE_URL}/api/compliance/sincronizar`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao iniciar a sincronização.");
      return true; // 202 Accepted
    },
    listarAlertas: async (status = '', origemLista = '') => {
      if (isMockMode) {
        const content = mockDb.compliance.listarAlertas();
        // Filtros básicos no mock
        let filtrado = content;
        if (status) filtrado = filtrado.filter(a => a.status === status);
        if (origemLista) filtrado = filtrado.filter(a => a.origemLista === origemLista);
        return { content: filtrado, isMock: true };
      }
      
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (origemLista) params.append('origemLista', origemLista);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await fetchApi(`${BASE_URL}/api/compliance/alertas${query}`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao listar alertas.");
      const data = await response.json();
      return { content: data, isMock: false };
    },
    deliberarAlerta: async (id, dto) => {
      if (isMockMode) return mockDb.compliance.deliberarAlerta(id, dto);
      const response = await fetchApi(`${BASE_URL}/api/compliance/alertas/${id}/deliberar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao deliberar alerta.");
      return true; // 200 OK
    }
  }
};
