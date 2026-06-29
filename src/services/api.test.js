import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from './api';

describe('Serviço da API (api.js)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('clientes.buscarCep()', () => {
    it('deve consultar o backend Spring Boot', async () => {
      const mockPayload = {
        cep: "01001000",
        logradouro: "Rua Direita",
        bairro: "Sé",
        localidade: "São Paulo",
        uf: "SP"
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPayload)
      });

      const res = await api.clientes.buscarCep("01001000");
      
      expect(res.cep).toBe("01001000");
      expect(res.logradouro).toBe("Rua Direita");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/clientes/busca-cep/01001000"),
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

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 99, ...validDto })
      });

      const res = await api.clientes.salvar(validDto);
      expect(res.id).toBe(99);
      expect(res.nome).toBe("João da Silva");
    });

    it('deve capturar e detalhar erros de validação (@Valid / ExceptionDTO) do Spring Boot', async () => {

      
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
