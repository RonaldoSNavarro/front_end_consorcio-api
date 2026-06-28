// Engine de Banco de Dados local persistido no LocalStorage
// Simula 100% das regras financeiras reais da API Spring Boot baseadas no BCB e CDC

const DB_KEY = 'consorcio_api_mock_db';

// Dados Iniciais para o Efeito "WOW"
const INITIAL_DATA = {
  clientes: [
    { id: 1, nome: "Ronaldo Navarro", cpfCnpj: "11122233344", email: "ronaldo@dev.com", telefone: "11999999999", dataCadastro: "2026-04-10", statusCliente: "ATIVO", patrimonioEstimado: 0, rendaMensalDeclarada: 0 },
    { id: 2, nome: "Ana Maria Souza", cpfCnpj: "98765432100", email: "ana.souza@gmail.com", telefone: "11988888888", dataCadastro: "2026-04-12", statusCliente: "ATIVO", patrimonioEstimado: 0, rendaMensalDeclarada: 0 },
    { id: 3, nome: "Tech Solutions Ltda", cpfCnpj: "12345678000199", email: "financeiro@techsolutions.com.br", telefone: "1133334444", dataCadastro: "2026-04-15", statusCliente: "ATIVO", patrimonioEstimado: 0, rendaMensalDeclarada: 0 },
    { id: 4, nome: "Carlos Eduardo Santos", cpfCnpj: "55566677788", email: "carlos.edu@yahoo.com", telefone: "21977777777", dataCadastro: "2026-04-20", statusCliente: "ATIVO", patrimonioEstimado: 0, rendaMensalDeclarada: 0 },
    { id: 5, nome: "OSAMA BIN LADEN", cpfCnpj: "00000000000", email: "osama@bad.com", telefone: "0000000000", dataCadastro: "2026-06-20", statusCliente: "ATIVO", patrimonioEstimado: 0, rendaMensalDeclarada: 0 },
    { id: 6, nome: "João Consorciado Excluído", cpfCnpj: "99988877766", email: "joao@bad.com", telefone: "0000000000", dataCadastro: "2026-06-20", statusCliente: "ATIVO", patrimonioEstimado: 0, rendaMensalDeclarada: 0 }
  ],
  grupos: [
    { id: 1, codigo: "GRP-AUTO-002", valorCredito: 60000.00, prazoMeses: 60, taxaAdministracao: 15.00, status: "EM_ANDAMENTO", dataCriacao: "2026-04-01", dataInauguracao: "2026-04-05" },
    { id: 2, codigo: "GRP-IMOVEL-010", valorCredito: 250000.00, prazoMeses: 120, taxaAdministracao: 12.00, status: "EM_FORMACAO", dataCriacao: "2026-04-10", dataInauguracao: null },
    { id: 3, codigo: "GRP-MOTO-005", valorCredito: 18000.00, prazoMeses: 36, taxaAdministracao: 18.00, status: "ENCERRADO", dataCriacao: "2026-01-01", dataInauguracao: "2026-01-05", dataEncerramento: "2026-05-20" },
    { id: 4, codigo: "GRP-TESTE-REEMBOLSO", valorCredito: 100000.00, prazoMeses: 100, taxaAdministracao: 10.00, status: "EM_ANDAMENTO", dataCriacao: "2026-01-01", dataInauguracao: "2026-01-05" }
  ],
  cotas: [
    { id: 1, numeroCota: 12, clienteId: 1, grupoId: 1, status: "ATIVA" },
    { id: 2, numeroCota: 45, clienteId: 2, grupoId: 1, status: "ATIVA" },
    { id: 3, numeroCota: 7, clienteId: 3, grupoId: 2, status: "ATIVA" },
    { id: 4, numeroCota: 22, clienteId: 4, grupoId: 3, status: "CONTEMPLADA" },
    { id: 5, numeroCota: 99, clienteId: 6, grupoId: 4, status: "CANCELADA", percentualFundoComumPago: 10, valorHistoricoPago: 8000, valorCredito: 100000 }
  ],
  parcelas: [
    // Parcelas para cota 1 (Grupo 1) - Algumas pagas, algumas pendentes, algumas em atraso
    { id: 1, cotaId: 1, numeroParcela: 1, valorFundoComum: 1000.00, valorTaxaAdm: 150.00, valorFundoReserva: 20.00, vencimento: "2026-04-05", pagamento: "2026-04-04", status: "PAGA", valorPago: 1170.00 },
    { id: 2, cotaId: 1, numeroParcela: 2, valorFundoComum: 1000.00, valorTaxaAdm: 150.00, valorFundoReserva: 20.00, vencimento: "2026-05-05", pagamento: null, status: "ATRASADA", valorPago: 0 },
    { id: 3, cotaId: 1, numeroParcela: 3, valorFundoComum: 1000.00, valorTaxaAdm: 150.00, valorFundoReserva: 20.00, vencimento: "2026-06-05", pagamento: null, status: "PENDENTE", valorPago: 0 },
    
    // Parcelas para cota 2 (Grupo 1) - Paga e em dia
    { id: 4, cotaId: 2, numeroParcela: 1, valorFundoComum: 1000.00, valorTaxaAdm: 150.00, valorFundoReserva: 20.00, vencimento: "2026-04-05", pagamento: "2026-04-05", status: "PAGA", valorPago: 1170.00 },
    { id: 5, cotaId: 2, numeroParcela: 2, valorFundoComum: 1000.00, valorTaxaAdm: 150.00, valorFundoReserva: 20.00, vencimento: "2026-05-05", pagamento: "2026-05-05", status: "PAGA", valorPago: 1170.00 },
    { id: 6, cotaId: 2, numeroParcela: 3, valorFundoComum: 1000.00, valorTaxaAdm: 150.00, valorFundoReserva: 20.00, vencimento: "2026-06-05", pagamento: null, status: "PENDENTE", valorPago: 0 },
    
    // Parcelas da cota 4 (Grupo 3 - Encerrado) - Todas pagas
    { id: 7, cotaId: 4, numeroParcela: 1, valorFundoComum: 500.00, valorTaxaAdm: 90.00, valorFundoReserva: 10.00, vencimento: "2026-02-05", pagamento: "2026-02-05", status: "PAGA", valorPago: 600.00 },
    { id: 8, cotaId: 4, numeroParcela: 2, valorFundoComum: 500.00, valorTaxaAdm: 90.00, valorFundoReserva: 10.00, vencimento: "2026-03-05", pagamento: "2026-03-05", status: "PAGA", valorPago: 600.00 },
    { id: 9, cotaId: 4, numeroParcela: 3, valorFundoComum: 500.00, valorTaxaAdm: 90.00, valorFundoReserva: 10.00, vencimento: "2026-04-05", pagamento: "2026-04-05", status: "PAGA", valorPago: 600.00 }
  ],
  assembleias: [
    { id: 1, dataAssembleia: "2026-04-05", tipo: "ORDINARIA", grupoId: 1 },
    { id: 2, dataAssembleia: "2026-05-05", tipo: "ORDINARIA", grupoId: 1 }
  ],
  contemplacoes: [
    { id: 1, cotaId: 4, assembleiaId: 1, tipoContemplacao: "SORTEIO", valorLance: 0, lanceEmbutido: false, dataContemplacao: "2026-02-05" }
  ],
  alertasCompliance: [
    { alertaId: 1054, clienteId: 1, nomeCliente: "Ronaldo Navarro", cpfCnpj: "111.222.333-44", origemLista: "OFAC", nomeEncontradoLista: "RONALDO NAVARRO", scoreSimilaridade: 1.0, status: "PENDENTE_ANALISE", dataDeteccao: "2026-06-19T11:00:00" },
    { alertaId: 1055, clienteId: 2, nomeCliente: "Ana Maria Souza", cpfCnpj: "987.654.321-00", origemLista: "PEP", nomeEncontradoLista: "ANA M SOUZA", scoreSimilaridade: 0.95, status: "PENDENTE_ANALISE", dataDeteccao: "2026-06-19T11:00:00" }
  ]
};

// Carrega ou inicializa banco local
const getDb = () => {
  try {
    const data = localStorage.getItem(DB_KEY);
    let db;
    if (!data) {
      db = JSON.parse(JSON.stringify(INITIAL_DATA));
    } else {
      db = JSON.parse(data);
    }
    let updated = false;
    if (!db.historicos) { db.historicos = []; updated = true; }
    if (!db.versoes) { db.versoes = []; updated = true; }
    if (!db.movimentos) { db.movimentos = []; updated = true; }
    if (!db.alertasCompliance) { db.alertasCompliance = []; updated = true; }
    if (updated) {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
    return db;
  } catch (e) {
    console.warn("Corrupt local database detected or blocked access. Resetting to initial data...", e);
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
    } catch (writeErr) {
      console.error("Unable to write reset data to localStorage:", writeErr);
    }
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
};

const saveDb = (db) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn("Unable to write to localStorage:", e);
  }
};

// Funções Utilitárias Financeiras
const calcularJurosEMulta = (vencimento, dataPagamentoStr, valorTotal) => {
  const venc = new Date(vencimento);
  const pag = new Date(dataPagamentoStr);
  
  if (pag <= venc) return { multa: 0, juros: 0, diasAtraso: 0, total: valorTotal };
  
  const diffTime = Math.abs(pag - venc);
  const diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Multa de 2.00% sobre o total
  const multa = Number((valorTotal * 0.02).toFixed(2));
  
  // Juros de mora de 1.00% ao mês (pro-rata die = 1% / 30 por dia)
  const taxaDiaria = 0.01 / 30;
  const juros = Number((valorTotal * taxaDiaria * diasAtraso).toFixed(2));
  
  const total = Number((valorTotal + multa + juros).toFixed(2));
  
  return { multa, juros, diasAtraso, total };
};

export const mockDb = {
  // === AUTENTICAÇÃO ===
  login: (username, password) => {
    if (password === 'admin') {
      return { token: `mock_jwt_token_for_${username}_profile_authenticated` };
    }
    throw new Error("Credenciais incorretas no simulador. Use a senha 'admin'.");
  },

  // === CLIENTES ===
  clientes: {
    listar: () => {
      const db = getDb();
      return db.clientes;
    },
    buscarPorId: (id) => {
      const db = getDb();
      return db.clientes.find(c => c.id === Number(id));
    },
    buscarCep: (cep) => {
      // Simula resposta da API ViaCep
      return {
        cep: cep,
        logradouro: `Avenida Paulista, CEP ${cep}`,
        complemento: "Lado ímpar",
        bairro: "Bela Vista",
        localidade: "São Paulo",
        uf: "SP"
      };
    },
    obterHistorico: (id, tipo = null) => {
      const db = getDb();
      let histList = db.historicos.filter(h => h.clienteId === Number(id));
      if (tipo) {
        histList = histList.filter(h => h.tipoInteracao === tipo);
      }
      return histList.sort((a,b) => b.dataInteracao.localeCompare(a.dataInteracao));
    },
    salvar: (dto) => {
      const db = getDb();
      // CPF/CNPJ duplicado check
      if (db.clientes.some(c => c.cpfCnpj === dto.cpfCnpj)) {
        throw new Error("Já existe um cliente cadastrado com este CPF/CNPJ.");
      }
      const novoCliente = {
        id: db.clientes.length > 0 ? Math.max(...db.clientes.map(c => c.id)) + 1 : 1,
        nome: dto.nome,
        cpfCnpj: dto.cpfCnpj,
        email: dto.email,
        telefone: dto.telefone,
        cep: dto.cep,
        logradouro: dto.logradouro || `Avenida Paulista, CEP ${dto.cep}`,
        numero: dto.numero,
        complemento: dto.complemento,
        bairro: dto.bairro || "Bela Vista",
        localidade: dto.localidade || "São Paulo",
        uf: dto.uf || "SP",
        patrimonioEstimado: Number(dto.patrimonioEstimado || 0),
        rendaMensalDeclarada: Number(dto.rendaMensalDeclarada || 0),
        nivelRisco: dto.nivelRisco || "MEDIO",
        dataCadastro: new Date().toISOString().split('T')[0],
        statusCliente: "ATIVO"
      };
      db.clientes.push(novoCliente);

      // Registra no histórico
      const novoHistorico = {
        id: db.historicos.length > 0 ? Math.max(...db.historicos.map(h => h.id)) + 1 : 1,
        clienteId: novoCliente.id,
        tipoInteracao: "CADASTRO",
        descricao: `Adesão inicial e cadastro do cliente consorciado. Risco: ${novoCliente.nivelRisco}. Renda: R$ ${novoCliente.rendaMensalDeclarada.toLocaleString('pt-BR')}. Patrimônio: R$ ${novoCliente.patrimonioEstimado.toLocaleString('pt-BR')}.`,
        dataInteracao: new Date().toISOString(),
        nomeUsuario: "admin"
      };
      db.historicos.push(novoHistorico);

      saveDb(db);
      return novoCliente;
    },
    atualizar: (id, dto) => {
      const db = getDb();
      const idx = db.clientes.findIndex(c => c.id === Number(id));
      if (idx === -1) throw new Error("Cliente não encontrado.");
      
      db.clientes[idx] = {
        ...db.clientes[idx],
        nome: dto.nome,
        email: dto.email,
        telefone: dto.telefone,
        cep: dto.cep || db.clientes[idx].cep,
        logradouro: dto.logradouro || db.clientes[idx].logradouro,
        numero: dto.numero || db.clientes[idx].numero,
        complemento: dto.complemento || db.clientes[idx].complemento,
        bairro: dto.bairro || db.clientes[idx].bairro,
        localidade: dto.localidade || db.clientes[idx].localidade,
        uf: dto.uf || db.clientes[idx].uf,
        patrimonioEstimado: Number(dto.patrimonioEstimado || db.clientes[idx].patrimonioEstimado || 0),
        rendaMensalDeclarada: Number(dto.rendaMensalDeclarada || db.clientes[idx].rendaMensalDeclarada || 0),
        nivelRisco: dto.nivelRisco || db.clientes[idx].nivelRisco || "MEDIO"
      };

      // Registra histórico
      const novoHistorico = {
        id: db.historicos.length > 0 ? Math.max(...db.historicos.map(h => h.id)) + 1 : 1,
        clienteId: Number(id),
        tipoInteracao: "ATUALIZACAO",
        descricao: `Dados cadastrais atualizados pelo painel administrativo.`,
        dataInteracao: new Date().toISOString(),
        nomeUsuario: "admin"
      };
      db.historicos.push(novoHistorico);

      saveDb(db);
      return db.clientes[idx];
    },
    inativar: (id) => {
      const db = getDb();
      const idx = db.clientes.findIndex(c => c.id === Number(id));
      if (idx === -1) throw new Error("Cliente não encontrado.");
      
      // Inativação lógica LGPD
      db.clientes[idx] = {
        ...db.clientes[idx],
        nome: "[INATIVADO - LGPD]",
        email: "removido@lgpd.com",
        telefone: "00000000000",
        cep: "00000000",
        logradouro: "Removido por Obrigação Legal",
        numero: "0",
        complemento: "",
        bairro: "Removido",
        localidade: "Removido",
        uf: "XX",
        patrimonioEstimado: 0,
        rendaMensalDeclarada: 0,
        inativado: true,
        statusCliente: "INATIVO"
      };

      // Registra histórico
      const novoHistorico = {
        id: db.historicos.length > 0 ? Math.max(...db.historicos.map(h => h.id)) + 1 : 1,
        clienteId: Number(id),
        tipoInteracao: "EXCLUSAO",
        descricao: `Inativação lógica dos dados do cliente em cumprimento ao Art. 16, inciso II da LGPD. Dados de contato e sensíveis removidos/mascarados permanentemente.`,
        dataInteracao: new Date().toISOString(),
        nomeUsuario: "admin"
      };
      db.historicos.push(novoHistorico);

      saveDb(db);
      return true;
    }
  },

  // === GRUPOS ===
  grupos: {
    listar: () => {
      const db = getDb();
      return db.grupos;
    },
    salvar: (dto) => {
      const db = getDb();
      if (db.grupos.some(g => g.codigo === dto.codigo)) {
        throw new Error("Código de grupo já existente.");
      }
      const novoGrupo = {
        id: db.grupos.length > 0 ? Math.max(...db.grupos.map(g => g.id)) + 1 : 1,
        codigo: dto.codigo,
        valorCredito: Number(dto.valorCredito),
        prazoMeses: Number(dto.prazoMeses),
        taxaAdministracao: Number(dto.taxaAdministracao),
        status: "EM_FORMACAO",
        dataCriacao: new Date().toISOString().split('T')[0],
        dataInauguracao: null
      };
      db.grupos.push(novoGrupo);
      saveDb(db);
      return novoGrupo;
    },
    inaugurar: (id, dataAssembleia) => {
      const db = getDb();
      const grupo = db.grupos.find(g => g.id === Number(id));
      if (!grupo) throw new Error("Grupo não encontrado.");
      if (grupo.status !== "EM_FORMACAO") throw new Error("Apenas grupos 'EM_FORMACAO' podem ser inaugurados.");
      
      grupo.status = "EM_ANDAMENTO";
      grupo.dataInauguracao = dataAssembleia;

      // Ao inaugurar, o sistema gera a primeira parcela para todas as cotas ativas deste grupo
      const cotasDoGrupo = db.cotas.filter(c => c.grupoId === grupo.id && c.status === "ATIVA");
      
      cotasDoGrupo.forEach(cota => {
        // Gera 1ª parcela
        const valorFundoComum = Number((grupo.valorCredito / grupo.prazoMeses).toFixed(2));
        const valorTaxaAdm = Number(((grupo.valorCredito * (grupo.taxaAdministracao / 100)) / grupo.prazoMeses).toFixed(2));
        const valorFundoReserva = Number((valorFundoComum * 0.02).toFixed(2)); // Fundo reserva padrão 2%
        
        const novaParcela = {
          id: db.parcelas.length > 0 ? Math.max(...db.parcelas.map(p => p.id)) + 1 : 1,
          cotaId: cota.id,
          numeroParcela: 1,
          valorFundoComum,
          valorTaxaAdm,
          valorFundoReserva,
          vencimento: dataAssembleia,
          pagamento: null,
          status: "PENDENTE",
          valorPago: 0
        };
        db.parcelas.push(novaParcela);
      });

      saveDb(db);
      return grupo;
    },
    reajustar: (id, novoValorCredito) => {
      const db = getDb();
      const grupo = db.grupos.find(g => g.id === Number(id));
      if (!grupo) throw new Error("Grupo não encontrado.");
      
      const antigoCredito = grupo.valorCredito;
      grupo.valorCredito = Number(novoValorCredito);
      
      // Proporção de variação
      const proporcao = Number(novoValorCredito) / antigoCredito;

      // Reajusta todas as parcelas em aberto (PENDENTE ou ATRASADA) das cotas associadas a este grupo
      const cotasDoGrupo = db.cotas.filter(c => c.grupoId === grupo.id);
      db.parcelas.forEach(p => {
        if (cotasDoGrupo.some(c => c.id === p.cotaId) && p.status !== "PAGA") {
          p.valorFundoComum = Number((p.valorFundoComum * proporcao).toFixed(2));
          p.valorTaxaAdm = Number((p.valorTaxaAdm * proporcao).toFixed(2));
          p.valorFundoReserva = Number((p.valorFundoReserva * proporcao).toFixed(2));
        }
      });
      
      saveDb(db);
      return grupo;
    },
    obterFinanceiro: (id) => {
      const db = getDb();
      const grupo = db.grupos.find(g => g.id === Number(id));
      if (!grupo) throw new Error("Grupo não encontrado.");
      
      const cotasDoGrupo = db.cotas.filter(c => c.grupoId === grupo.id);
      
      let fundoComumArrecadado = 0;
      let taxaAdmArrecadada = 0;
      let fundoReservaArrecadado = 0;
      let creditosPagos = 0;

      db.parcelas.forEach(p => {
        if (cotasDoGrupo.some(c => c.id === p.cotaId) && p.status === "PAGA") {
          fundoComumArrecadado += p.valorFundoComum;
          taxaAdmArrecadada += p.valorTaxaAdm;
          fundoReservaArrecadado += p.valorFundoReserva;
        }
      });

      // Creditos pagos são as cotas contempladas
      const contemplacoesGrupo = db.contemplacoes.filter(cont => 
        cotasDoGrupo.some(c => c.id === cont.cotaId)
      );

      contemplacoesGrupo.forEach(cont => {
        // Se foi contemplada, o caixa liberou o valor do crédito, menos o lance embutido se houver
        const cota = db.cotas.find(c => c.id === cont.cotaId);
        const valorCredito = grupo.valorCredito;
        if (cont.lanceEmbutido) {
          creditosPagos += (valorCredito - cont.valorLance);
        } else {
          creditosPagos += valorCredito;
        }
      });

      const saldoDisponivelFundoComum = Number((fundoComumArrecadado - creditosPagos).toFixed(2));

      return {
        grupoId: grupo.id,
        codigoGrupo: grupo.codigo,
        fundoComumArrecadado: Number(fundoComumArrecadado.toFixed(2)),
        saldoDisponivelFundoComum,
        taxaAdministracaoArrecadada: Number(taxaAdmArrecadada.toFixed(2)),
        fundoReservaArrecadado: Number(fundoReservaArrecadado.toFixed(2)),
        fundoReservaDisponivel: Number(fundoReservaArrecadado.toFixed(2)), // Simplificação
        creditosPagos: Number(creditosPagos.toFixed(2))
      };
    },
    encerrar: (id) => {
      const db = getDb();
      const grupo = db.grupos.find(g => g.id === Number(id));
      if (!grupo) throw new Error("Grupo não encontrado.");
      
      // Valida se há parcelas PENDENTE ou ATRASADA
      const cotasDoGrupo = db.cotas.filter(c => c.grupoId === grupo.id);
      const parcelasPendente = db.parcelas.filter(p => 
        cotasDoGrupo.some(c => c.id === p.cotaId) && p.status !== "PAGA"
      );

      if (parcelasPendente.length > 0) {
        throw new Error(`Grupo não pode ser encerrado. Existem ${parcelasPendente.length} parcelas pendentes ou em atraso.`);
      }

      grupo.status = "ENCERRADO";
      grupo.dataEncerramento = new Date().toISOString().split('T')[0];
      saveDb(db);
      return grupo;
    },
    obterMovimentos: (id) => {
      const db = getDb();
      return db.movimentos.filter(m => m.grupoId === Number(id))
                          .sort((a,b) => b.dataMovimento.localeCompare(a.dataMovimento));
    },
    obterSaldo: (id) => {
      const db = getDb();
      const movs = db.movimentos.filter(m => m.grupoId === Number(id));
      let saldo = 0;
      movs.forEach(m => {
        if (m.natureza === "CREDITO") {
          saldo += m.valor;
        } else {
          saldo -= m.valor;
        }
      });
      return Number(saldo.toFixed(2));
    }
  },

  // === COTAS ===
  cotas: {
    listar: () => {
      const db = getDb();
      return db.cotas;
    },
    listarPorCliente: (clienteId) => {
      const db = getDb();
      return db.cotas.filter(c => c.clienteId === Number(clienteId));
    },
    listarPorGrupo: (grupoId) => {
      const db = getDb();
      return db.cotas.filter(c => c.grupoId === Number(grupoId));
    },
    salvar: (dto) => {
      const db = getDb();
      const grupo = db.grupos.find(g => g.id === Number(dto.grupoId));
      if (!grupo) throw new Error("Grupo não encontrado.");
      if (grupo.status === "ENCERRADO") throw new Error("Não é possível associar cota a um grupo encerrado.");

      // Cota repetida no mesmo grupo check
      if (db.cotas.some(c => c.grupoId === Number(dto.grupoId) && c.numeroCota === Number(dto.numeroCota))) {
        throw new Error(`Número de cota ${dto.numeroCota} já vendido neste grupo.`);
      }

      const novaCota = {
        id: db.cotas.length > 0 ? Math.max(...db.cotas.map(c => c.id)) + 1 : 1,
        numeroCota: Number(dto.numeroCota),
        clienteId: Number(dto.clienteId),
        grupoId: Number(dto.grupoId),
        status: "ATIVA"
      };

      db.cotas.push(novaCota);

      // Se o grupo já estiver EM_ANDAMENTO, gera parcelas futuras imediatamente
      if (grupo.status === "EM_ANDAMENTO") {
        const valorFundoComum = Number((grupo.valorCredito / grupo.prazoMeses).toFixed(2));
        const valorTaxaAdm = Number(((grupo.valorCredito * (grupo.taxaAdministracao / 100)) / grupo.prazoMeses).toFixed(2));
        const valorFundoReserva = Number((valorFundoComum * 0.02).toFixed(2));
        
        // Gera 1ª parcela
        const novaParcela = {
          id: db.parcelas.length > 0 ? Math.max(...db.parcelas.map(p => p.id)) + 1 : 1,
          cotaId: novaCota.id,
          numeroParcela: 1,
          valorFundoComum,
          valorTaxaAdm,
          valorFundoReserva,
          vencimento: new Date().toISOString().split('T')[0], // vencimento hoje
          pagamento: null,
          status: "PENDENTE",
          valorPago: 0
        };
        db.parcelas.push(novaParcela);
      }

      saveDb(db);
      return novaCota;
    },
    cancelar: (id) => {
      const db = getDb();
      const cota = db.cotas.find(c => c.id === Number(id));
      if (!cota) throw new Error("Cota não encontrada.");
      
      cota.status = "CANCELADA";
      
      // Exclui parcelas abertas (PENDENTE ou ATRASADA)
      db.parcelas = db.parcelas.filter(p => !(p.cotaId === cota.id && p.status !== "PAGA"));
      
      saveDb(db);
      return cota;
    },
    reembolsar: (id) => {
      const db = getDb();
      const cota = db.cotas.find(c => c.id === Number(id));
      if (!cota) throw new Error("Cota não encontrada.");
      if (cota.status !== "CANCELADA") throw new Error("Apenas cotas CANCELADAS podem ser reembolsadas.");

      const parcelasPagas = db.parcelas.filter(p => p.cotaId === cota.id && p.status === "PAGA");
      const totalFundoComumPago = parcelasPagas.reduce((acc, p) => acc + p.valorFundoComum, 0);

      // Multa rescisória de 10% do fundo comum pago
      const multaRescisoria = Number((totalFundoComumPago * 0.10).toFixed(2));
      const valorReembolso = Number((totalFundoComumPago - multaRescisoria).toFixed(2));

      // Registra histórico
      const novoHistorico = {
        id: db.historicos.length > 0 ? Math.max(...db.historicos.map(h => h.id)) + 1 : 1,
        clienteId: cota.clienteId,
        cotaId: cota.id,
        grupoId: cota.grupoId,
        tipoInteracao: "COBRANCA",
        descricao: `Cálculo de Reembolso de Cota Excluída processado. Líquido a Devolver: R$ ${valorReembolso.toLocaleString('pt-BR')}. Retenção Multa 10% aplicada.`,
        dataInteracao: new Date().toISOString(),
        nomeUsuario: "admin"
      };
      db.historicos.push(novoHistorico);

      saveDb(db);
      return {
        cotaId: cota.id,
        numeroCota: cota.numeroCota,
        totalPagoFundoComum: Number(totalFundoComumPago.toFixed(2)),
        multaRescisoria: Number(multaRescisoria.toFixed(2)),
        valorLiquidoAReembolsar: Number(valorReembolso.toFixed(2)),
        dataCalculo: new Date().toISOString().split('T')[0]
      };
    },
    listarVersoes: (id) => {
      const db = getDb();
      let versList = db.versoes.filter(v => v.cotaId === Number(id));
      if (versList.length === 0) {
        // Gera versão inicial 1 caso não exista para manter a robustez
        const cota = db.cotas.find(c => c.id === Number(id));
        if (cota) {
          versList = [{
            id: 1,
            cotaId: cota.id,
            versao: 1,
            statusAnterior: null,
            statusNovo: cota.status,
            motivo: "Adesão inicial ao grupo de consórcio",
            dataTransicao: new Date(Date.now() - 24*60*60*1000).toISOString(),
            nomeUsuario: "sistema"
          }];
        }
      }
      return versList.sort((a,b) => b.versao - a.versao);
    },
    obterMovimentos: (id) => {
      const db = getDb();
      return db.movimentos.filter(m => m.cotaId === Number(id))
                          .sort((a,b) => b.dataMovimento.localeCompare(a.dataMovimento));
    }
  },

  // === PARCELAS ===
  parcelas: {
    listarPorCota: (cotaId) => {
      const db = getDb();
      // Atualiza status dinamicamente de PENDENTE para ATRASADA se a data de hoje passou do vencimento
      const hoje = new Date().toISOString().split('T')[0];
      let alterado = false;
      
      db.parcelas.forEach(p => {
        if (p.cotaId === Number(cotaId) && p.status === "PENDENTE" && p.vencimento < hoje) {
          p.status = "ATRASADA";
          alterado = true;
        }
      });

      if (alterado) saveDb(db);
      return db.parcelas.filter(p => p.cotaId === Number(cotaId)).sort((a,b) => a.numeroParcela - b.numeroParcela);
    },
    salvar: (dto) => {
      const db = getDb();
      const cota = db.cotas.find(c => c.id === Number(dto.cotaId));
      if (!cota) throw new Error("Cota não encontrada.");
      
      const grupo = db.grupos.find(g => g.id === cota.grupoId);
      const valorFundoComum = Number((grupo.valorCredito / grupo.prazoMeses).toFixed(2));
      const valorTaxaAdm = Number(((grupo.valorCredito * (grupo.taxaAdministracao / 100)) / grupo.prazoMeses).toFixed(2));
      const valorFundoReserva = Number((valorFundoComum * 0.02).toFixed(2));
      
      const numeroProximaParcela = db.parcelas.filter(p => p.cotaId === cota.id).length + 1;

      const novaParcela = {
        id: db.parcelas.length > 0 ? Math.max(...db.parcelas.map(p => p.id)) + 1 : 1,
        cotaId: cota.id,
        numeroParcela: numeroProximaParcela,
        valorFundoComum,
        valorTaxaAdm,
        valorFundoReserva,
        vencimento: dto.vencimento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias na frente
        pagamento: null,
        status: "PENDENTE",
        valorPago: 0
      };

      db.parcelas.push(novaParcela);
      saveDb(db);
      return novaParcela;
    },
    pagar: (id, dataPagamento) => {
      const db = getDb();
      const p = db.parcelas.find(parc => parc.id === Number(id));
      if (!p) throw new Error("Parcela não encontrada.");
      if (p.status === "PAGA") throw new Error("Esta parcela já foi paga.");

      const cota = db.cotas.find(c => c.id === p.cotaId);
      if (cota.status === "CANCELADA") throw new Error("Não é possível pagar parcelas de uma cota cancelada.");

      const valorNominal = Number((p.valorFundoComum + p.valorTaxaAdm + p.valorFundoReserva).toFixed(2));
      const calculo = calcularJurosEMulta(p.vencimento, dataPagamento, valorNominal);

      p.pagamento = dataPagamento;
      p.status = "PAGA";
      p.valorPago = calculo.total;
      p.multaPaga = calculo.multa;
      p.jurosPagos = calculo.juros;
      p.diasAtraso = calculo.diasAtraso;

      // Se pagou todas as parcelas e estava com status INADIMPLENTE, devolve para ATIVA
      const atrasadas = db.parcelas.filter(par => par.cotaId === cota.id && par.status === "ATRASADA");
      if (atrasadas.length === 0 && cota.status === "INADIMPLENTE") {
        cota.status = "ATIVA";
      }

      // Lança movimento financeiro (CREDITO no grupo)
      const saldoGrupoAnterior = db.movimentos.filter(m => m.grupoId === cota.grupoId)
        .reduce((acc, m) => m.natureza === "CREDITO" ? acc + m.valor : acc - m.valor, 0);

      const novoMovimento = {
        id: db.movimentos.length > 0 ? Math.max(...db.movimentos.map(m => m.id)) + 1 : 1,
        grupoId: cota.grupoId,
        cotaId: cota.id,
        parcelaId: p.id,
        tipoMovimento: "ARRECADACAO_FUNDO_COMUM",
        natureza: "CREDITO",
        valor: p.valorFundoComum,
        saldoAnterior: saldoGrupoAnterior,
        saldoPosterior: Number((saldoGrupoAnterior + p.valorFundoComum).toFixed(2)),
        descricao: `Arrecadação Fundo Comum - Parcela nº ${p.numeroParcela} da Cota nº ${cota.numeroCota}`,
        dataMovimento: new Date().toISOString(),
        dataReferencia: new Date().toISOString().split('T')[0],
        nomeUsuario: "sistema"
      };
      db.movimentos.push(novoMovimento);

      // Lança histórico
      const novoHistorico = {
        id: db.historicos.length > 0 ? Math.max(...db.historicos.map(h => h.id)) + 1 : 1,
        clienteId: cota.clienteId,
        cotaId: cota.id,
        grupoId: cota.grupoId,
        tipoInteracao: "PAGAMENTO_PARCELA",
        descricao: `Baixa efetuada da Parcela nº ${p.numeroParcela}. Valor Pago: R$ ${calculo.total.toLocaleString('pt-BR')} (Multa: R$ ${calculo.multa.toLocaleString('pt-BR')}, Juros: R$ ${calculo.juros.toLocaleString('pt-BR')}).`,
        dataInteracao: new Date().toISOString(),
        nomeUsuario: "sistema"
      };
      db.historicos.push(novoHistorico);

      saveDb(db);
      return p;
    },
    obterInadimplenciaCota: (cotaId) => {
      const db = getDb();
      const cota = db.cotas.find(c => c.id === Number(cotaId));
      if (!cota) throw new Error("Cota não encontrada.");

      const hoje = new Date().toISOString().split('T')[0];
      const parcelasAtrasadas = db.parcelas.filter(p => p.cotaId === cota.id && p.status === "PENDENTE" && p.vencimento < hoje);
      
      // Corrige status no banco se necessário
      if (parcelasAtrasadas.length > 0) {
        parcelasAtrasadas.forEach(p => { p.status = "ATRASADA"; });
        saveDb(db);
      }

      const todasAtrasadas = db.parcelas.filter(p => p.cotaId === cota.id && p.status === "ATRASADA");
      
      let totalMulta = 0;
      let totalJuros = 0;
      let saldoDevedorNominal = 0;

      todasAtrasadas.forEach(p => {
        const valorNominal = p.valorFundoComum + p.valorTaxaAdm + p.valorFundoReserva;
        saldoDevedorNominal += valorNominal;
        
        const calculo = calcularJurosEMulta(p.vencimento, hoje, valorNominal);
        totalMulta += calculo.multa;
        totalJuros += calculo.juros;
      });

      const totalAcumulado = Number((saldoDevedorNominal + totalMulta + totalJuros).toFixed(2));

      return {
        cotaId: cota.id,
        numeroCota: cota.numeroCota,
        quantidadeParcelasAtrasadas: todasAtrasadas.length,
        saldoDevedorNominal: Number(saldoDevedorNominal.toFixed(2)),
        multaAcumulada: Number(totalMulta.toFixed(2)),
        jurosMoraAcumulado: Number(totalJuros.toFixed(2)),
        valorTotalParaQuitacao: totalAcumulado
      };
    },
    amortizarPorReducaoDePrazo: (cotaId, valorLance) => {
      const db = getDb();
      const cota = db.cotas.find(c => c.id === Number(cotaId));
      if (!cota) throw new Error("Cota não encontrada.");

      // Seleciona parcelas PENDENTE ordenadas de trás para frente (número de parcela decrescente)
      let parcelasPendentes = db.parcelas
        .filter(p => p.cotaId === cota.id && p.status === "PENDENTE")
        .sort((a,b) => b.numeroParcela - a.numeroParcela);

      if (parcelasPendentes.length === 0) {
        throw new Error("Não existem parcelas pendentes para amortizar nesta cota.");
      }

      let saldoAmortizar = Number(valorLance);

      for (let p of parcelasPendentes) {
        const valorTotalParcela = Number((p.valorFundoComum + p.valorTaxaAdm + p.valorFundoReserva).toFixed(2));
        if (saldoAmortizar >= valorTotalParcela) {
          p.status = "PAGA";
          p.pagamento = new Date().toISOString().split('T')[0];
          p.valorPago = valorTotalParcela;
          p.amortizada = true;
          saldoAmortizar = Number((saldoAmortizar - valorTotalParcela).toFixed(2));
        } else if (saldoAmortizar > 0) {
          // Amortização parcial da última parcela pendente de trás pra frente
          p.valorFundoComum = Number((p.valorFundoComum - (saldoAmortizar * (p.valorFundoComum / valorTotalParcela))).toFixed(2));
          p.valorTaxaAdm = Number((p.valorTaxaAdm - (saldoAmortizar * (p.valorTaxaAdm / valorTotalParcela))).toFixed(2));
          p.valorFundoReserva = Number((p.valorFundoReserva - (saldoAmortizar * (p.valorFundoReserva / valorTotalParcela))).toFixed(2));
          saldoAmortizar = 0;
          break;
        } else {
          break;
        }
      }

      saveDb(db);
      return true;
    },
    amortizarPorDiluicao: (cotaId, valorLance) => {
      const db = getDb();
      const cota = db.cotas.find(c => c.id === Number(cotaId));
      if (!cota) throw new Error("Cota não encontrada.");

      // Seleciona parcelas PENDENTE
      let parcelasPendentes = db.parcelas
        .filter(p => p.cotaId === cota.id && p.status === "PENDENTE")
        .sort((a,b) => a.numeroParcela - b.numeroParcela);

      const n = parcelasPendentes.length;
      if (n === 0) throw new Error("Não existem parcelas pendentes para amortizar nesta cota.");

      // Divide o valor do lance igualmente pelas parcelas pendentes
      const valorAbaterPorParcela = Number((Number(valorLance) / n).toFixed(2));
      
      // Regra do centavo perdido: arredondamento vai na última parcela
      const totalAbatidoCalculado = valorAbaterPorParcela * n;
      const diferencaCentavo = Number((Number(valorLance) - totalAbatidoCalculado).toFixed(2));

      parcelasPendentes.forEach((p, idx) => {
        const abatimentoCorrente = idx === n - 1 ? (valorAbaterPorParcela + diferencaCentavo) : valorAbaterPorParcela;
        
        // Abate proporcionalmente sobre cada fundo
        const valorNominal = p.valorFundoComum + p.valorTaxaAdm + p.valorFundoReserva;
        
        p.valorFundoComum = Number((p.valorFundoComum - (abatimentoCorrente * (p.valorFundoComum / valorNominal))).toFixed(2));
        p.valorTaxaAdm = Number((p.valorTaxaAdm - (abatimentoCorrente * (p.valorTaxaAdm / valorNominal))).toFixed(2));
        p.valorFundoReserva = Number((p.valorFundoReserva - (abatimentoCorrente * (p.valorFundoReserva / valorNominal))).toFixed(2));
      });

      saveDb(db);
      return true;
    },
    estornar: (id) => {
      const db = getDb();
      const p = db.parcelas.find(parc => parc.id === Number(id));
      if (!p) throw new Error("Parcela não encontrada.");
      if (p.status !== "PAGA") throw new Error("Apenas parcelas com status PAGA podem ser estornadas.");

      const cota = db.cotas.find(c => c.id === p.cotaId);
      
      // Estorna valores
      p.status = "PENDENTE";
      p.pagamento = null;
      const valorEstornado = p.valorFundoComum;
      p.valorPago = 0;
      p.multaPaga = 0;
      p.jurosPagos = 0;
      p.diasAtraso = 0;

      // Lança movimento de estorno (DÉBITO no grupo)
      const saldoGrupoAnterior = db.movimentos.filter(m => m.grupoId === cota.grupoId)
        .reduce((acc, m) => m.natureza === "CREDITO" ? acc + m.valor : acc - m.valor, 0);

      const novoMovimento = {
        id: db.movimentos.length > 0 ? Math.max(...db.movimentos.map(m => m.id)) + 1 : 1,
        grupoId: cota.grupoId,
        cotaId: cota.id,
        parcelaId: p.id,
        tipoMovimento: "ESTORNO_ARRECADACAO",
        natureza: "DEBITO",
        valor: valorEstornado,
        saldoAnterior: saldoGrupoAnterior,
        saldoPosterior: Number((saldoGrupoAnterior - valorEstornado).toFixed(2)),
        descricao: `Estorno de Pagamento de Parcela nº ${p.numeroParcela} - Cota nº ${cota.numeroCota}`,
        dataMovimento: new Date().toISOString(),
        dataReferencia: new Date().toISOString().split('T')[0],
        nomeUsuario: "admin"
      };
      db.movimentos.push(novoMovimento);

      const novoHistorico = {
        id: db.historicos.length > 0 ? Math.max(...db.historicos.map(h => h.id)) + 1 : 1,
        clienteId: cota.clienteId,
        cotaId: cota.id,
        grupoId: cota.grupoId,
        tipoInteracao: "COBRANCA",
        descricao: `Estorno contábil efetuado para a Parcela nº ${p.numeroParcela}. Status retornado para PENDENTE e saldo estornado do Fundo Comum.`,
        dataInteracao: new Date().toISOString(),
        nomeUsuario: "admin"
      };
      db.historicos.push(novoHistorico);

      saveDb(db);
      return p;
    }
  },

  // === ASSEMBLEIAS ===
  assembleias: {
    listarPorGrupo: (grupoId) => {
      const db = getDb();
      return db.assembleias.filter(a => a.grupoId === Number(grupoId)).sort((a,b) => b.dataAssembleia.localeCompare(a.dataAssembleia));
    },
    salvar: (dto) => {
      const db = getDb();
      const grupo = db.grupos.find(g => g.id === Number(dto.grupoId));
      if (!grupo) throw new Error("Grupo não encontrado.");

      const novaAssembleia = {
        id: db.assembleias.length > 0 ? Math.max(...db.assembleias.map(a => a.id)) + 1 : 1,
        dataAssembleia: dto.dataAssembleia,
        tipo: dto.tipo || "ORDINARIA",
        grupoId: Number(dto.grupoId)
      };

      db.assembleias.push(novaAssembleia);
      saveDb(db);
      return novaAssembleia;
    }
  },

  // === CONTEMPLAÇÕES ===
  contemplacoes: {
    listarPorAssembleia: (assembleiaId) => {
      const db = getDb();
      return db.contemplacoes.filter(c => c.assembleiaId === Number(assembleiaId));
    },
    registrar: (dto) => {
      const db = getDb();
      const cota = db.cotas.find(c => c.id === Number(dto.cotaId));
      if (!cota) throw new Error("Cota não encontrada.");
      if (cota.status === "CANCELADA") throw new Error("Não é possível contemplar uma cota cancelada.");
      if (cota.status === "CONTEMPLADA") throw new Error("Esta cota já está contemplada.");

      const grupo = db.grupos.find(g => g.id === cota.grupoId);
      const assembleia = db.assembleias.find(a => a.id === Number(dto.assembleiaId));
      if (!assembleia) throw new Error("Assembleia não encontrada.");

      // Regra 1: Bloqueio por Inadimplência
      const hoje = new Date().toISOString().split('T')[0];
      const parcelasAtrasadas = db.parcelas.filter(p => p.cotaId === cota.id && p.status === "PENDENTE" && p.vencimento < hoje);
      if (parcelasAtrasadas.length > 0 || cota.status === "INADIMPLENTE") {
        cota.status = "INADIMPLENTE";
        saveDb(db);
        throw new Error("Cota inabilitada para assembleia devido a inadimplência.");
      }

      // Regra 2: Verificação de Saldo de Caixa do Grupo
      const financeiro = mockDb.grupos.obterFinanceiro(grupo.id);
      const valorCredito = grupo.valorCredito;
      const valorLance = Number(dto.valorLance || 0);

      // Caixa necessário = Valor do crédito, descontando o lance se for embutido
      const caixaNecessario = dto.lanceEmbutido ? (valorCredito - valorLance) : valorCredito;

      if (financeiro.saldoDisponivelFundoComum < caixaNecessario) {
        throw new Error(`Saldo de Caixa do Grupo insuficiente para contemplação. Saldo Comum disponível: R$ ${financeiro.saldoDisponivelFundoComum.toLocaleString('pt-BR', {minimumFractionDigits: 2})}. Necessário: R$ ${caixaNecessario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}.`);
      }

      // Regra 3: Lance Embutido Limite de 30% do crédito
      if (dto.lanceEmbutido && valorLance > (valorCredito * 0.30)) {
        throw new Error("O lance embutido máximo é limitado a 30% do valor total do crédito do grupo.");
      }

      // Processa a contemplação
      cota.status = "CONTEMPLADA";
      
      const novaContemplacao = {
        id: db.contemplacoes.length > 0 ? Math.max(...db.contemplacoes.map(c => c.id)) + 1 : 1,
        cotaId: cota.id,
        assembleiaId: assembleia.id,
        tipoContemplacao: dto.tipoContemplacao,
        valorLance,
        lanceEmbutido: dto.lanceEmbutido,
        dataContemplacao: new Date().toISOString().split('T')[0]
      };

      db.contemplacoes.push(novaContemplacao);

      // Salva a transição de versão
      const versaoAnterior = db.versoes.filter(v => v.cotaId === cota.id).length;
      const novaVersao = {
        id: db.versoes.length > 0 ? Math.max(...db.versoes.map(v => v.id)) + 1 : 1,
        cotaId: cota.id,
        versao: versaoAnterior > 0 ? versaoAnterior + 1 : 1,
        statusAnterior: "ATIVA",
        statusNovo: "CONTEMPLADA",
        motivo: `Contemplação por modalidade ${dto.tipoContemplacao} na AGO do grupo ${grupo.codigo}.`,
        dataTransicao: new Date().toISOString(),
        nomeUsuario: "admin"
      };
      db.versoes.push(novaVersao);

      // Salva histórico do cliente
      const novoHistorico = {
        id: db.historicos.length > 0 ? Math.max(...db.historicos.map(h => h.id)) + 1 : 1,
        clienteId: cota.clienteId,
        cotaId: cota.id,
        grupoId: cota.grupoId,
        tipoInteracao: "CONTEMPLACAO",
        descricao: `🎉 COTA CONTEMPLADA por ${dto.tipoContemplacao}! Crédito de R$ ${valorCredito.toLocaleString('pt-BR')} liberado. Lance ofertado: R$ ${valorLance.toLocaleString('pt-BR')}.`,
        dataInteracao: new Date().toISOString(),
        nomeUsuario: "admin"
      };
      db.historicos.push(novoHistorico);

      // Lança movimento financeiro (DÉBITO no grupo)
      const saldoGrupoAnterior = db.movimentos.filter(m => m.grupoId === grupo.id)
        .reduce((acc, m) => m.natureza === "CREDITO" ? acc + m.valor : acc - m.valor, 0);

      const novoMovimento = {
        id: db.movimentos.length > 0 ? Math.max(...db.movimentos.map(m => m.id)) + 1 : 1,
        grupoId: grupo.id,
        cotaId: cota.id,
        contemplacaoId: novaContemplacao.id,
        tipoMovimento: "PAGAMENTO_CREDITO",
        natureza: "DEBITO",
        valor: caixaNecessario,
        saldoAnterior: saldoGrupoAnterior,
        saldoPosterior: Number((saldoGrupoAnterior - caixaNecessario).toFixed(2)),
        descricao: `Liberação de Crédito - Cota nº ${cota.numeroCota} contemplada`,
        dataMovimento: new Date().toISOString(),
        dataReferencia: new Date().toISOString().split('T')[0],
        nomeUsuario: "admin"
      };
      db.movimentos.push(novoMovimento);

      // Se houver lance e não for embutido, lança entrada de dinheiro do lance (CRÉDITO)
      if (valorLance > 0 && !dto.lanceEmbutido) {
        const saldoGrupoAposDebito = novoMovimento.saldoPosterior;
        const movLance = {
          id: db.movimentos.length > 0 ? Math.max(...db.movimentos.map(m => m.id)) + 1 : 1,
          grupoId: grupo.id,
          cotaId: cota.id,
          tipoMovimento: "RECEBIMENTO_LANCE",
          natureza: "CREDITO",
          valor: valorLance,
          saldoAnterior: saldoGrupoAposDebito,
          saldoPosterior: Number((saldoGrupoAposDebito + valorLance).toFixed(2)),
          descricao: `Arrecadação de Lance - Cota nº ${cota.numeroCota}`,
          dataMovimento: new Date().toISOString(),
          dataReferencia: new Date().toISOString().split('T')[0],
          nomeUsuario: "admin"
        };
        db.movimentos.push(movLance);
      }

      // Se houver lance, executa amortização imediata
      if (valorLance > 0) {
        if (dto.lanceEmbutido) {
          mockDb.parcelas.amortizarPorReducaoDePrazo(cota.id, valorLance);
        } else {
          mockDb.parcelas.amortizarPorDiluicao(cota.id, valorLance);
        }
      }

      saveDb(db);
      return novaContemplacao;
    }
  },
  
  // === RELATÓRIOS (PLD/FT, BALANCETE, ESTATÍSTICAS) ===
  relatorios: {
    getPldFt: (dataInicio, dataFim) => {
      // Simula uma busca no banco de lances acima de 50.000 (Regra PLD/FT)
      // Como é mock, vamos retornar dados estáticos ou filtrados levemente baseados no contrato
      return [
        {
          lanceId: 1054,
          cotaId: 98,
          nomeConsorciado: "João da Silva",
          cpfCnpj: "123.456.789-00",
          valorOferta: 55000.00,
          tipoLance: "LIVRE",
          dataOferta: "2026-06-18T14:30:00",
          grupoId: 12,
          codigoGrupo: "GRUPO-XYZ"
        },
        {
          lanceId: 2100,
          cotaId: 15,
          nomeConsorciado: "Empresa Laranja ME",
          cpfCnpj: "00.000.000/0001-91",
          valorOferta: 120000.00,
          tipoLance: "LIVRE",
          dataOferta: "2026-06-19T09:15:00",
          grupoId: 2,
          codigoGrupo: "GRP-IMOVEL-010"
        }
      ];
    },
    getBalancete: (grupoId, dataReferencia) => {
      const db = getDb();
      const grupo = db.grupos.find(g => g.id === Number(grupoId));
      if (!grupo) throw new Error("Grupo não encontrado para o balancete.");
      
      const financeiro = mockDb.grupos.obterFinanceiro(grupoId);
      
      return {
        grupoId: grupo.id,
        codigoGrupo: grupo.codigo,
        dataReferencia: dataReferencia || new Date().toISOString().split('T')[0],
        contas: [
          {
            codigoCosif: "2.1.2.10.10-6",
            nome: "Disponibilidades (Fundo Comum)",
            natureza: "DEVEDORA",
            saldo: financeiro.saldoDisponivelFundoComum
          },
          {
            codigoCosif: "3.1.1.20.10-4",
            nome: "Taxa de Administração Arrecadada",
            natureza: "CREDORA",
            saldo: financeiro.taxaAdministracaoArrecadada
          },
          {
            codigoCosif: "2.1.2.10.20-9",
            nome: "Fundo de Reserva",
            natureza: "CREDORA",
            saldo: financeiro.fundoReservaArrecadado
          }
        ]
      };
    },
    getEstatisticas: (grupoId, dataInicio, dataFim) => {
      const db = getDb();
      const grupo = db.grupos.find(g => g.id === Number(grupoId));
      if (!grupo) throw new Error("Grupo não encontrado.");
      
      const cotasDoGrupo = db.cotas.filter(c => c.grupoId === grupo.id);
      const totalAdesoes = cotasDoGrupo.length;
      const totalExclusoes = cotasDoGrupo.filter(c => c.status === "CANCELADA").length;
      
      const contemplacoesGrupo = db.contemplacoes.filter(c => cotasDoGrupo.some(cota => cota.id === c.cotaId));
      const totalContemplacoesSorteio = contemplacoesGrupo.filter(c => c.tipoContemplacao === "SORTEIO").length;
      const totalContemplacoesLance = contemplacoesGrupo.filter(c => c.tipoContemplacao === "LANCE_LIVRE" || c.tipoContemplacao === "LANCE_FIXO").length;
      
      // Lances mockados
      const totalLancesOfertados = totalContemplacoesLance * 3 + 5; // Fake number para o mock
      
      const financeiro = mockDb.grupos.obterFinanceiro(grupoId);

      return {
        grupoId: grupo.id,
        codigoGrupo: grupo.codigo,
        dataInicio: dataInicio,
        dataFim: dataFim,
        totalAdesoes,
        totalExclusoes,
        totalLancesOfertados,
        totalLancesVencedores: totalContemplacoesLance,
        totalContemplacoesSorteio,
        totalContemplacoesLance,
        valorTotalCreditosLiberados: financeiro.creditosPagos
      };
    }
  },
  
  // === COMPLIANCE (PLD/FT) ===
  compliance: {
    sincronizar: async () => {
      // Simula delay de integração
      return new Promise((resolve) => setTimeout(() => {
        resolve({
          mensagem: "Sincronização de listas restritivas iniciada em background.",
          dataHora: new Date().toISOString()
        });
      }, 1000));
    },
    listarAlertas: () => {
      const db = getDb();
      return db.alertasCompliance || [];
    },
    deliberarAlerta: (id, payload) => {
      const db = getDb();
      const idx = db.alertasCompliance.findIndex(a => a.alertaId === Number(id));
      if (idx === -1) throw new Error("Alerta não encontrado.");
      
      db.alertasCompliance[idx] = {
        ...db.alertasCompliance[idx],
        status: payload.novoStatus,
        justificativa: payload.justificativa,
        dataDeliberacao: new Date().toISOString()
      };
      saveDb(db);
      return true;
    },
    uploadPep: async () => {
      return new Promise((resolve) => setTimeout(() => {
        resolve({
          mensagem: "Arquivo PEP processado com sucesso. 1500 registros inseridos/atualizados."
        });
      }, 1000));
    },
    uploadOnu: async () => {
      return new Promise((resolve) => setTimeout(() => {
        resolve({
          mensagem: "Arquivo ONU processado com sucesso. 350 registros inseridos/atualizados."
        });
      }, 1000));
    },
    uploadIbge: async () => {
      return new Promise((resolve) => setTimeout(() => {
        resolve({
          mensagem: "Arquivo IBGE processado com sucesso. 120 municípios de fronteira indexados."
        });
      }, 1000));
    },
    getConfig: () => {
      const db = getDb();
      if (!db.complianceConfig) {
        db.complianceConfig = {
          cronExpression: "0 0 3 * * *",
          frequencia: "DIARIO",
          horario: "03:00",
          dataAtualizacao: "2026-06-22T23:00:00"
        };
        saveDb(db);
      }
      return db.complianceConfig;
    },
    updateConfig: (payload) => {
      const db = getDb();
      const timeParts = payload.horario ? payload.horario.split(':') : ["03", "00"];
      const minute = timeParts[1] || "00";
      const hour = timeParts[0] || "03";
      
      let cron = `0 ${minute} ${hour} * * *`;
      if (payload.frequencia === 'SEMANAL') {
        cron = `0 ${minute} ${hour} * * MON`;
      } else if (payload.frequencia === 'MENSAL') {
        cron = `0 ${minute} ${hour} 1 * *`;
      }
      
      db.complianceConfig = {
        cronExpression: cron,
        frequencia: payload.frequencia,
        horario: payload.horario,
        dataAtualizacao: new Date().toISOString()
      };
      saveDb(db);
      return db.complianceConfig;
    }
  }
};
