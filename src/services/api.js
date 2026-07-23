
export const BASE_URL = import.meta.env?.VITE_API_URL || '';



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



// Objeto unificado que decide se chama a API real ou a simulação local
export const api = {
  
  

  // --- AUTH ---
  login: async (username, password) => {
    const response = await fetchApi(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: username, senha: password })
    });
    
    if (response.status === 202) {
      return response.json(); // { mfaRequired: true, tempToken: "..." }
    }
    
    if (response.status === 401) {
      throw new Error("Usuário ou senha incorretos.");
    }
    
    if (!response.ok) throw await handleResponseError(response, "Falha na autenticação com o servidor Spring.");
    return { token: "cookie_managed", message: "Login success" };
  },

  loginMfa: async (tempToken, code) => {
    const response = await fetchApi(`${BASE_URL}/api/login/mfa-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken, code })
    });
    if (!response.ok) throw await handleResponseError(response, "Falha na verificação de MFA.");
    return { token: "cookie_managed", message: "Login success" };
  },

  setupMfa: async () => {
    const response = await fetchApi(`${BASE_URL}/api/mfa/setup`, { method: 'POST' });
    if (!response.ok) throw await handleResponseError(response, "Falha ao enviar e-mail de verificação.");
    return true;
  },

  confirmMfa: async (code) => {
    const response = await fetchApi(`${BASE_URL}/api/mfa/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!response.ok) throw await handleResponseError(response, "Falha ao confirmar MFA.");
    return true;
  },

  resetMfa: async () => {
    const response = await fetchApi(`${BASE_URL}/api/mfa/reset`, {
      method: 'POST'
    });
    if (!response.ok) throw await handleResponseError(response, "Falha ao resetar MFA.");
    return true;
  },

  logout: async () => {
    await fetchApi(`${BASE_URL}/api/login/logout`, { method: 'POST' });
  },

  obterUsuarioLogado: async () => {
    const response = await fetchApi(`${BASE_URL}/api/login/me`);
    if (!response.ok) throw new Error("Sessão inválida ou expirada.");
    return response.json();
  },

  // --- USUARIOS ---
  usuarios: {
    listar: async () => {
      const response = await fetchApi(`${BASE_URL}/api/usuarios`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao listar usuários.");
      return response.json();
    },
    salvar: async (dto) => {
      const response = await fetchApi(`${BASE_URL}/api/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao cadastrar usuário.");
      return response.json();
    },
    atualizar: async (id, dto) => {
      const response = await fetchApi(`${BASE_URL}/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao atualizar usuário.");
      return response.json();
    },
    excluir: async (id) => {
      const response = await fetchApi(`${BASE_URL}/api/usuarios/${id}`, { method: 'DELETE' });
      if (!response.ok) throw await handleResponseError(response, "Erro ao excluir usuário.");
      return true;
    }
  },

  // --- PERFIS ---
  perfis: {
    listar: async () => {
      const response = await fetchApi(`${BASE_URL}/api/perfis`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao listar perfis.");
      return response.json();
    },
    salvar: async (dto) => {
      const response = await fetchApi(`${BASE_URL}/api/perfis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao cadastrar perfil.");
      return response.json();
    },
    atualizar: async (id, dto) => {
      const response = await fetchApi(`${BASE_URL}/api/perfis/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao atualizar perfil.");
      return response.json();
    },
    excluir: async (id) => {
      const response = await fetchApi(`${BASE_URL}/api/perfis/${id}`, { method: 'DELETE' });
      if (!response.ok) throw await handleResponseError(response, "Erro ao excluir perfil.");
      return true;
    }
  },

  // --- CLIENTES ---
  clientes: {
    listar: async (page = 0, size = 100, search = '') => {
            const params = new URLSearchParams({ page, size });
      if (search) params.append('search', search);
      const response = await fetchApi(`${BASE_URL}/api/clientes?${params.toString()}`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar clientes da API.");
      const data = await response.json(); // Spring Page object
      return { 
        content: data.content || data, 
        totalPages: data.totalPages, 
        last: data.last, 
        totalElements: data.totalElements,
        isMock: false 
      };
    },
    salvar: async (dto) => {
            const response = await fetchApi(`${BASE_URL}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao cadastrar cliente na API.");
      return response.json();
    },
    atualizar: async (id, dto) => {
            const response = await fetchApi(`${BASE_URL}/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao atualizar cliente na API.");
      return response.json();
    },
    inativar: async (id) => {
            const response = await fetchApi(`${BASE_URL}/api/clientes/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao inativar cliente na API.");
      return true;
    },
    buscarCep: async (cep) => {
            const response = await fetchApi(`${BASE_URL}/api/clientes/busca-cep/${cep}`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar endereço pelo CEP.");
      return response.json();
    },
    obterHistorico: async (id, tipo = null) => {
            const url = tipo 
        ? `${BASE_URL}/api/clientes/${id}/historico?tipo=${tipo}`
        : `${BASE_URL}/api/clientes/${id}/historico`;
      const response = await fetchApi(url);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar histórico do cliente.");
      return response.json();
    }
  },

  // --- LOTERIA FEDERAL ---
  loteriaFederal: {
    listar: async () => {
            const response = await fetchApi(`${BASE_URL}/api/loteria-federal`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar sorteios.");
      return response.json();
    },
    registrar: async (dto) => {
            const response = await fetchApi(`${BASE_URL}/api/loteria-federal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao registrar sorteio.");
      return response.json();
    }
  },

  // --- GRUPOS ---
  grupos: {
    listar: async () => {
            const response = await fetchApi(`${BASE_URL}/api/grupos?size=2000`);
      if (!response.ok) throw new Error("Erro ao listar grupos da API.");
      const data = await response.json();
      return { content: data.content || data };
    },
    salvar: async (dto) => {
            const response = await fetchApi(`${BASE_URL}/api/grupos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao cadastrar grupo na API.");
      return response.json();
    },
    inaugurar: async (id, dataAssembleia) => {
            const response = await fetchApi(`${BASE_URL}/api/grupos/${id}/inaugurar?dataAssembleia=${dataAssembleia}`, {
        method: 'PUT'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao inaugurar grupo na API.");
      return response.json();
    },
    reajustar: async (id, novoValorCredito) => {
            const response = await fetchApi(`${BASE_URL}/api/grupos/${id}/reajuste?novoValorCredito=${novoValorCredito}`, {
        method: 'PUT'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao reajustar crédito na API.");
      return response.json();
    },
    obterFinanceiro: async (id) => {
            const response = await fetchApi(`${BASE_URL}/api/grupos/${id}/financeiro`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao obter relatório financeiro do grupo na API.");
      const data = await response.json();
      return { data };
    },
    encerrar: async (id) => {
            const response = await fetchApi(`${BASE_URL}/api/grupos/${id}/encerrar`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao encerrar grupo na API.");
      return response.json();
    },
    obterMovimentos: async (id) => {
            const response = await fetchApi(`${BASE_URL}/api/grupos/${id}/movimentos`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao obter extrato de movimentos do grupo na API.");
      return response.json();
    },
    obterSaldo: async (id) => {
      const response = await fetchApi(`${BASE_URL}/api/grupos/${id}/saldo`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao obter saldo atual do grupo na API.");
      return response.json();
    },
  },

  // --- BENS DE REFERÊNCIA ---
  bens: {
    categorias: async () => {
      const response = await fetchApi(`${BASE_URL}/api/bens-referencia/categorias`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao listar categorias de bem.");
      return response.json();
    },
    listar: async (categoriaId, page = 0, size = 50) => {
      const url = categoriaId 
        ? `${BASE_URL}/api/bens-referencia?categoriaId=${categoriaId}&page=${page}&size=${size}`
        : `${BASE_URL}/api/bens-referencia?page=${page}&size=${size}`;
      const response = await fetchApi(url);
      if (!response.ok) throw await handleResponseError(response, "Erro ao listar bens de referência.");
      return response.json();
    },
    listarTodos: async () => {
      const response = await fetchApi(`${BASE_URL}/api/bens-referencia/todos`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao listar bens de referência.");
      return response.json();
    },
    obterPorId: async (id) => {
      const response = await fetchApi(`${BASE_URL}/api/bens-referencia/${id}`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao obter bem de referência.");
      return response.json();
    },
    criar: async (dto) => {
      const response = await fetchApi(`${BASE_URL}/api/bens-referencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao cadastrar bem de referência.");
      return response.json();
    },
    atualizar: async (id, dto, origem = 'MANUAL') => {
      const response = await fetchApi(`${BASE_URL}/api/bens-referencia/${id}?origemReajuste=${origem}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao atualizar bem de referência.");
      return response.json();
    },
    obterHistorico: async (id) => {
      const response = await fetchApi(`${BASE_URL}/api/bens-referencia/${id}/historico`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao consultar histórico de preços.");
      return response.json();
    },
    fipeMarcas: async () => {
      const response = await fetchApi(`${BASE_URL}/api/bens-referencia/fipe/marcas`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao consultar marcas FIPE.");
      return response.json();
    },
    fipeModelos: async (marcaId) => {
      const response = await fetchApi(`${BASE_URL}/api/bens-referencia/fipe/marcas/${marcaId}/modelos`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao consultar modelos FIPE.");
      return response.json();
    },
    fipeAnos: async (marcaId, modeloId) => {
      const response = await fetchApi(`${BASE_URL}/api/bens-referencia/fipe/marcas/${marcaId}/modelos/${modeloId}/anos`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao consultar anos FIPE.");
      return response.json();
    },
    fipeConsultar: async (marcaId, modeloId, anoId) => {
      const response = await fetchApi(`${BASE_URL}/api/bens-referencia/fipe/consultar?marcaId=${marcaId}&modeloId=${modeloId}&anoId=${anoId}`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao consultar valor oficial FIPE.");
      return response.json();
    }
  },

  // --- RELATÓRIOS ---
  relatorios: {
    balancete: async (grupoId, dataReferencia) => {
            const url = dataReferencia ? `${BASE_URL}/api/relatorios/balancete/${grupoId}?dataReferencia=${dataReferencia}` : `${BASE_URL}/api/relatorios/balancete/${grupoId}`;
      const response = await fetchApi(url);
      if (!response.ok) throw await handleResponseError(response, "Erro ao gerar balancete.");
      return response.json();
    },
    estatisticas: async (grupoId, dataInicio, dataFim) => {
            const url = `${BASE_URL}/api/relatorios/estatisticas/${grupoId}?dataInicio=${encodeURIComponent(dataInicio)}&dataFim=${encodeURIComponent(dataFim)}`;
      const response = await fetchApi(url);
      if (!response.ok) throw await handleResponseError(response, "Erro ao gerar estatísticas.");
      return response.json();
    },
    pldFt: async (dataInicio, dataFim) => {
            const url = `${BASE_URL}/api/relatorios/pld-ft?dataInicio=${encodeURIComponent(dataInicio)}&dataFim=${encodeURIComponent(dataFim)}`;
      const response = await fetchApi(url);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar alertas PLD/FT.");
      return response.json();
    }
  },

  // --- COTAS ---
  cotas: {
    listar: async () => {
            const response = await fetchApi(`${BASE_URL}/api/cotas?size=2000`);
      if (!response.ok) throw new Error("Erro ao buscar cotas da API.");
      const data = await response.json();
      return { content: data.content };
    },
    buscar: async (grupoId, numeroCota, versao, cpfCnpj) => {
      const params = new URLSearchParams();
      if (grupoId) params.append('grupoId', grupoId);
      if (numeroCota) {
        params.append('codigoCota', numeroCota);
        params.append('numeroCota', numeroCota);
      }
      if (versao) {
        params.append('versaoHistorico', versao);
        params.append('versao', versao);
      }
      if (cpfCnpj) params.append('cpfCnpj', cpfCnpj.replace(/[^0-9]/g, ''));
      params.append('size', '50');
      const response = await fetchApi(`${BASE_URL}/api/cotas/buscar?${params.toString()}`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar cotas.");
      const data = await response.json();
      return { content: data.content || data, totalElements: data.totalElements };
    },
    buscarPorId: async (id) => {
      const response = await fetchApi(`${BASE_URL}/api/cotas/${id}`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar detalhes da cota.");
      return response.json();
    },
    listarPendentesReembolso: async () => {
            const response = await fetchApi(`${BASE_URL}/api/cotas/canceladas/pendentes-reembolso`);
      if (!response.ok) throw new Error("Erro ao buscar cotas canceladas elegíveis a reembolso da API.");
      return response.json();
    },
    listarPorCliente: async (clienteId) => {
            const response = await fetchApi(`${BASE_URL}/api/cotas/cliente/${clienteId}`);
      if (!response.ok) throw new Error("Erro ao buscar cotas do cliente.");
      const data = await response.json();
      return data.content || data;
    },
    listarPorGrupo: async (grupoId) => {
      const response = await fetchApi(`${BASE_URL}/api/cotas/grupo/${grupoId}?size=2000`);
      if (!response.ok) throw new Error("Erro ao buscar cotas do grupo.");
      const data = await response.json();
      return data.content || data;
    },
    salvar: async (dto) => {
            const response = await fetchApi(`${BASE_URL}/api/cotas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao cadastrar cota na API.");
      return response.json();
    },
    cancelar: async (id) => {
            const response = await fetchApi(`${BASE_URL}/api/cotas/${id}/cancelar`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao cancelar cota na API.");
      return response.json();
    },
    reembolsar: async (id) => {
            const response = await fetchApi(`${BASE_URL}/api/cotas/${id}/reembolsar`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao calcular reembolso da cota na API.");
      return response.json();
    },
    listarVersoes: async (id) => {
            const response = await fetchApi(`${BASE_URL}/api/cotas/${id}/versoes`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar histórico de versões da cota na API.");
      return response.json();
    },
    obterMovimentos: async (id) => {
            const response = await fetchApi(`${BASE_URL}/api/cotas/${id}/movimentos`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar extrato de movimentos da cota na API.");
      return response.json();
    }
  },

  // --- LANCES ---
  lances: {
    salvar: async (dto) => {
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
            const response = await fetchApi(`${BASE_URL}/api/parcelas/cota/${cotaId}`);
      if (!response.ok) throw new Error("Erro ao buscar histórico de parcelas.");
      const data = await response.json();
      return { content: data };
    },
    salvar: async (dto) => {
            const response = await fetchApi(`${BASE_URL}/api/parcelas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao gerar parcela na API.");
      return response.json();
    },
    pagar: async (id, dataPagamento) => {
            const response = await fetchApi(`${BASE_URL}/api/parcelas/${id}/pagar?dataPagamento=${dataPagamento}`, {
        method: 'PUT'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao registrar pagamento na API.");
      return response.json();
    },
    obterInadimplenciaCota: async (cotaId) => {
            const response = await fetchApi(`${BASE_URL}/api/cotas/${cotaId}/inadimplencia`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao obter inadimplência da cota.");
      const data = await response.json();
      return { data };
    },
    amortizarPorReducaoDePrazo: async (cotaId, valorLance) => {
            const response = await fetchApi(`${BASE_URL}/api/parcelas/cota/${cotaId}/lance/reducao-prazo?valorLance=${valorLance}`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro na amortização por redução de prazo.");
      return true;
    },
    amortizarPorDiluicao: async (cotaId, valorLance) => {
            const response = await fetchApi(`${BASE_URL}/api/parcelas/cota/${cotaId}/lance/diluicao?valorLance=${valorLance}`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro na amortização por diluição.");
      return true;
    },
    estornar: async (id) => {
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
            const response = await fetchApi(`${BASE_URL}/api/assembleias/grupo/${grupoId}`);
      if (!response.ok) throw new Error("Erro ao listar assembleias do grupo na API.");
      const data = await response.json();
      return { content: data };
    },
    salvar: async (dto) => {
            const response = await fetchApi(`${BASE_URL}/api/assembleias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao agendar assembleia na API.");
      return response.json();
    },
    abrirCaptacao: async (id) => {
            const response = await fetchApi(`${BASE_URL}/api/assembleias/${id}/abrir-captacao`, { method: 'POST' });
      if (!response.ok) throw await handleResponseError(response, "Erro ao abrir captação.");
      return response.json();
    },
    fecharCaptacao: async (id) => {
            const response = await fetchApi(`${BASE_URL}/api/assembleias/${id}/fechar-captacao`, { method: 'POST' });
      if (!response.ok) throw await handleResponseError(response, "Erro ao fechar captação.");
      return response.json();
    },
    apurar: async (id, params) => {
            const response = await fetchApi(`${BASE_URL}/api/assembleias/${id}/apurar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {})
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao apurar assembleia.");
      return response.json();
    }
  },

  // --- CONTEMPLAÇÕES ---
  contemplacoes: {
    listarPorAssembleia: async (assembleiaId) => {
            const response = await fetchApi(`${BASE_URL}/api/contemplacoes/assembleia/${assembleiaId}`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar contemplações da assembleia.");
      const data = await response.json();
      return { content: data };
    },
    registrar: async (dto) => {
            const response = await fetchApi(`${BASE_URL}/api/contemplacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao registrar contemplação na API.");
      return response.json();
    },
    listarPendentesIntegralizacao: async () => {
      const response = await fetchApi(`${BASE_URL}/api/contemplacoes/pendentes-integralizacao`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao buscar lances pendentes de integralização.");
      const data = await response.json();
      return data.content || data;
    },
    confirmarIntegralizacao: async (id) => {
      const response = await fetchApi(`${BASE_URL}/api/contemplacoes/lances/${id}/integralizar`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao confirmar integralização do lance.");
      return response.json();
    },
    pagarBem: async (id) => {
      const response = await fetchApi(`${BASE_URL}/api/contemplacoes/${id}/pagamento-bem`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao registrar pagamento do bem.");
      return response.json();
    },
    cancelar: async (id, motivo, justificativa) => {
      const params = new URLSearchParams();
      if (motivo) params.append('motivo', motivo);
      if (justificativa) params.append('justificativa', justificativa);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetchApi(`${BASE_URL}/api/contemplacoes/lances/${id}/cancelar${queryString}`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao cancelar contemplação.");
      return true;
    }
  },
  
  // --- COMPLIANCE (PLD/FT) ---
  compliance: {
    sincronizar: async () => {
            const response = await fetchApi(`${BASE_URL}/api/compliance/sincronizar`, {
        method: 'POST'
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao iniciar a sincronização.");
      // Tenta retornar JSON (ComplianceSyncResultDTO), ignora se vazio (202 sem body)
      try { return await response.json(); } catch { return { ofacStatus: 'INICIADO_EM_BACKGROUND' }; }
    },
    listarAlertas: async (status = '', origemLista = '') => {
            
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (origemLista) params.append('origemLista', origemLista);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await fetchApi(`${BASE_URL}/api/compliance/alertas${query}`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao listar alertas.");
      const data = await response.json();
      return { content: data };
    },
    deliberarAlerta: async (id, dto) => {
            const response = await fetchApi(`${BASE_URL}/api/compliance/alertas/${id}/deliberar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao deliberar alerta.");
      return true; // 200 OK
    },
    uploadPep: async (file) => {
            const formData = new FormData();
      formData.append('file', file);
      const response = await fetchApi(`${BASE_URL}/api/compliance/upload/pep`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao processar arquivo PEP.");
      return response.json();
    },
    uploadOnu: async (file) => {
            const formData = new FormData();
      formData.append('file', file);
      const response = await fetchApi(`${BASE_URL}/api/compliance/upload/onu`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao processar arquivo ONU.");
      return response.json();
    },
    uploadIbge: async (file) => {
            const formData = new FormData();
      formData.append('file', file);
      const response = await fetchApi(`${BASE_URL}/api/compliance/upload/ibge`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao processar arquivo IBGE.");
      return response.json();
    },
    getConfig: async () => {
            const response = await fetchApi(`${BASE_URL}/api/compliance/config`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao obter configuração de agendamento.");
      return response.json();
    },
    updateConfig: async (dto) => {
            const response = await fetchApi(`${BASE_URL}/api/compliance/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao atualizar configuração de agendamento.");
      return response.json();
    },
    listarExecucoes: async () => {
            const response = await fetchApi(`${BASE_URL}/api/compliance/execucoes`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao obter histórico de execuções.");
      return response.json();
    }
  },

  // --- VENDAS DE PROPOSTA ---
  vendas: {
    listarTiposAtivos: async () => {
      const response = await fetchApi(`${BASE_URL}/api/vendas/tipos`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao listar tipos de venda.");
      return response.json();
    },
    listarTiposTodos: async () => {
      const response = await fetchApi(`${BASE_URL}/api/vendas/tipos/todos`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao listar tipos de venda.");
      return response.json();
    },
    criarTipo: async (dto) => {
      const response = await fetchApi(`${BASE_URL}/api/vendas/tipos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao criar tipo de venda.");
      return response.json();
    },
    atualizarTipo: async (id, dto) => {
            const response = await fetchApi(`${BASE_URL}/api/vendas/tipos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao atualizar tipo de venda.");
      return response.json();
    },
    inativarTipo: async (id) => {
            const response = await fetchApi(`${BASE_URL}/api/vendas/tipos/${id}`, { method: 'DELETE' });
      if (!response.ok) throw await handleResponseError(response, "Erro ao inativar tipo de venda.");
      return true;
    },
    produtos: async () => {
      const response = await fetchApi(`${BASE_URL}/api/vendas/produtos`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao listar produtos.");
      return response.json();
    },
    listarPendentesRisco: async () => {
      const response = await fetchApi(`${BASE_URL}/api/vendas/propostas/pendentes-risco`);
      if (!response.ok) throw await handleResponseError(response, "Erro ao listar propostas pendentes de análise de risco.");
      return response.json();
    },
    analisarRisco: async (id, aprovada, justificativa) => {
      const response = await fetchApi(`${BASE_URL}/api/vendas/propostas/${id}/analise-risco`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aprovada, justificativa })
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao analisar risco.");
      return response.json();
    },
    criarProposta: async (dto) => {
      const response = await fetchApi(`${BASE_URL}/api/vendas/propostas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!response.ok) throw await handleResponseError(response, "Erro ao criar proposta de adesão.");
      return response.json();
    },
    aprovarProposta: async (id) => {
      const response = await fetchApi(`${BASE_URL}/api/vendas/propostas/${id}/aprovar`, { method: 'POST' });
      if (!response.ok) throw await handleResponseError(response, "Erro ao aprovar proposta.");
      return response.json();
    },
    efetivarContrato: async (id) => {
      const response = await fetchApi(`${BASE_URL}/api/vendas/contratos/${id}/efetivar`, { method: 'POST' });
      if (!response.ok) throw await handleResponseError(response, "Erro ao efetivar contrato (simulação de pagamento).");
      return response.json();
    }
  }
};
