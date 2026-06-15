import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { api } from './services/api';

// Mock do Confetti para evitar falha com APIs HTML5 Canvas não suportadas nativamente no JSDOM
vi.mock('./components/Confetti', () => ({
  Confetti: ({ active }) => active ? <div data-testid="mock-confetti">🎉 Confetti 🎉</div> : null
}));

// Mock do detectBackend para resolver instantaneamente nos testes unitários do JSDOM
vi.mock('./services/api', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    detectBackend: vi.fn().mockResolvedValue(true)
  };
});

describe('Integração de Componentes do Front-End (App.jsx)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    api.setMockMode(true); // Garante o Modo Simulado local para maior previsibilidade
  });

  describe('Tela de Autenticação (Login)', () => {
    it('deve exibir a tela de login se o token de acesso não estiver presente', async () => {
      render(<App />);
      
      // Aguarda o encerramento da verificação assíncrona de sessão
      expect(await screen.findByText('Consórcio Admin')).toBeInTheDocument();
      expect(screen.getByLabelText('Login Administrativo')).toBeInTheDocument();
      expect(screen.getByLabelText('Senha de Acesso')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Autenticar/i })).toBeInTheDocument();
    });

    it('deve autenticar com sucesso ao inserir credenciais admin/admin e carregar o painel', async () => {
      render(<App />);

      // Aguarda o encerramento da verificação assíncrona de sessão
      const usernameInput = await screen.findByLabelText('Login Administrativo');
      const passwordInput = screen.getByLabelText('Senha de Acesso');
      const submitButton = screen.getByRole('button', { name: /Autenticar/i });

      // Insere credenciais corretas
      fireEvent.change(usernameInput, { target: { value: 'admin' } });
      fireEvent.change(passwordInput, { target: { value: 'admin' } });
      fireEvent.click(submitButton);

      // Espera autenticar e carregar a barra lateral principal do sistema
      await waitFor(() => {
        expect(screen.getByText(/Consórcio API/)).toBeInTheDocument();
        expect(screen.getByText('Visão Geral')).toBeInTheDocument();
        expect(screen.getByText('Visão Geral do Consórcio')).toBeInTheDocument();
      });
    });
  });

  describe('Navegação e Fluxo de Cadastro de Clientes', () => {
    // Helper para pular a tela de login de forma assíncrona e segura
    const loginAndGoToTab = async (tabName) => {
      render(<App />);
      
      // Aguarda o carregamento assíncrono da tela de login
      const usernameInput = await screen.findByLabelText('Login Administrativo');
      fireEvent.change(usernameInput, { target: { value: 'admin' } });
      fireEvent.change(screen.getByLabelText('Senha de Acesso'), { target: { value: 'admin' } });
      fireEvent.click(screen.getByRole('button', { name: /Autenticar/i }));
      
      // Busca pelo link na sidebar usando a role link
      const tabButton = await screen.findByRole('link', { name: new RegExp(tabName, 'i') });
      fireEvent.click(tabButton);
    };

    it('deve permitir navegar para a aba de Clientes', async () => {
      await loginAndGoToTab('Clientes');
      expect(await screen.findByText(/Cadastro de Consorciados/)).toBeInTheDocument();
    });

    it('deve realizar busca automática e preencher o endereço no formulário ao digitar CEP válido', async () => {
      await loginAndGoToTab('Clientes');

      // Abre o modal de Novo Cliente
      const btnNovoCliente = screen.getByRole('button', { name: /Novo Cliente/i });
      fireEvent.click(btnNovoCliente);

      expect(screen.getByText('Novo Cliente Consorciado')).toBeInTheDocument();

      const cepInput = screen.getByPlaceholderText('Ex: 01001000');
      const logradouroInput = screen.getByPlaceholderText('Rua/Avenida');
      const bairroInput = screen.getByLabelText('Bairro');
      const localidadeInput = screen.getByPlaceholderText('Cidade');
      const ufInput = screen.getByPlaceholderText('UF');

      // Simula digitação de um CEP completo de 8 dígitos
      fireEvent.change(cepInput, { target: { value: '01001000' } });

      // Dispara explicitamente a busca pelo ViaCEP clicando no botão do formulário
      const btnBuscarCep = screen.getByRole('button', { name: /Buscar ViaCEP/i });
      fireEvent.click(btnBuscarCep);

      // Espera o autopreenenchimento do ViaCEP disparado pelo evento onChange
      await waitFor(() => {
        expect(logradouroInput.value).toContain('Avenida Paulista');
        expect(bairroInput.value).toBe('Bela Vista');
        expect(localidadeInput.value).toBe('São Paulo');
        expect(ufInput.value).toBe('SP');
      });
    });

    it('deve cadastrar um novo cliente com sucesso preenchendo todos os campos requeridos', async () => {
      await loginAndGoToTab('Clientes');

      // Abre o modal
      fireEvent.click(screen.getByRole('button', { name: /Novo Cliente/i }));

      // Preenche os campos cadastrais reais
      fireEvent.change(screen.getByLabelText('Nome / Razão Social *'), { target: { value: 'Ronaldo da Silva' } });
      fireEvent.change(screen.getByLabelText('CPF / CNPJ (Números) *'), { target: { value: '44455566677' } });
      fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ronaldo@silva.com' } });
      fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '11987654321' } });
      
      // Endereço e disparo da busca
      fireEvent.change(screen.getByPlaceholderText('Ex: 01001000'), { target: { value: '01001000' } });
      const btnBuscarCep = screen.getByRole('button', { name: /Buscar ViaCEP/i });
      fireEvent.click(btnBuscarCep);

      // Aguarda o autocomplete do endereço para que a validação do formulário seja satisfeita
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Rua/Avenida').value).toContain('Avenida Paulista');
      });

      fireEvent.change(screen.getByPlaceholderText('Número'), { target: { value: '1200' } });
      
      // Compliance e Risco
      fireEvent.change(screen.getByLabelText('Patrimônio Declarado (R$)'), { target: { value: '350000.00' } });
      fireEvent.change(screen.getByLabelText('Renda Mensal (R$)'), { target: { value: '8500.00' } });
      fireEvent.change(screen.getByLabelText('Nível de Risco (Compliance)'), { target: { value: 'BAIXO' } });

      // Clica em Salvar
      const form = screen.getByText('Novo Cliente Consorciado').closest('div').querySelector('form');
      fireEvent.submit(form);

      // Espera fechar o modal e o novo cliente estar presente na lista
      await waitFor(() => {
        expect(screen.queryByText('Novo Cliente Consorciado')).not.toBeInTheDocument();
        expect(screen.getByText('Ronaldo da Silva')).toBeInTheDocument();
      });
    });
  });
});
