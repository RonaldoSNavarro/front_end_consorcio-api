import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, detectBackend } from './api';

describe('Serviço da API (api.js & mockDb.js)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    // Default to mock mode before each test
    api.setMockMode(true);
  });

  describe('detectBackend()', () => {
    it('deve desativar o modo simulado se a API Spring Boot estiver online', async () => {
      // Mock fetch leve com status OK
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      const isMock = await detectBackend();
      expect(isMock).toBe(false);
      expect(api.getIsMockMode()).toBe(false);
    });

    it('deve manter o modo simulado ativo se a API Spring Boot estiver offline', async () => {
      // Mock fetch falhando
      global.fetch.mockRejectedValueOnce(new Error("Network connection refused"));

      const isMock = await detectBackend();
      expect(isMock).toBe(true);
      expect(api.getIsMockMode()).toBe(true);
    });
  });

  describe('clientes.buscarCep()', () => {
    it('deve retornar dados simulados do LocalStorage/mockDb em Modo Simulado', async () => {
      api.setMockMode(true);
      const res = await api.clientes.buscarCep("01001000");

      expect(res.cep).toBe("01001000");
      expect(res.logradouro).toContain("Avenida Paulista");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deve consultar o backend Spring Boot em Modo Real', async () => {
      api.setMockMode(false);
      
      const mockPayload = {
        cep: "01001000",
        logradouro: "Rua Direita",
        bairro: "Sé",
        localidade: "São Paulo",
        uf: "SP"
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPayload)
      });

      const res = await api.clientes.buscarCep("01001000");
      
      expect(res.cep).toBe("01001000");
      expect(res.logradouro).toBe("Rua Direita");
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/clientes/busca-cep/01001000",
        expect.any(Object)
      );
    });
  });

  describe('clientes.salvar() - Tratamento de Erros e Exceções', () => {
    const validDto = {
      nome: "João da Silva",
      cpfCnpj: "11122233344",
      email: "joao@email.com",
      telefone: "11999999999",
      cep: "01001000",
      numero: "123",
      patrimonio: 200000.00,
      rendaMensal: 6000.00,
      nivelRisco: "MEDIO"
    };

    it('deve persistir e retornar o cliente cadastrado em caso de sucesso', async () => {
      api.setMockMode(false);
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 99, ...validDto })
      });

      const res = await api.clientes.salvar(validDto);
      expect(res.id).toBe(99);
      expect(res.nome).toBe("João da Silva");
    });

    it('deve capturar e detalhar erros de validação (@Valid / ExceptionDTO) do Spring Boot', async () => {
      api.setMockMode(false);
      
      const errorResponse = {
        mensagem: "Erro de validação",
        detalhes: "cpfCnpj: CPF ou CNPJ inválido; telefone: Telefone deve ter 10 ou 11 dígitos"
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(errorResponse)
      });

      // Asserta que a chamada rejeita com a mensagem detalhada combinando mensagem e detalhes
      await expect(api.clientes.salvar(validDto)).rejects.toThrow(
        "Erro de validação: cpfCnpj: CPF ou CNPJ inválido; telefone: Telefone deve ter 10 ou 11 dígitos"
      );
    });

    it('deve usar mensagem genérica de fallback se o JSON de erro do back-end não tiver os campos mensagem/detalhes', async () => {
      api.setMockMode(false);
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.reject(new Error("Response is not JSON"))
      });

      await expect(api.clientes.salvar(validDto)).rejects.toThrow(
        "Erro ao cadastrar cliente na API."
      );
    });
  });
});
