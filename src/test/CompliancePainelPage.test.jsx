/* eslint-disable no-unused-vars, react/prop-types, react/display-name */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompliancePainelPage } from '../pages/CompliancePainelPage';
import { api } from '../services/api';

// Mock do Toast Hook diretamente
const mockTriggerToast = vi.fn();
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    triggerToast: mockTriggerToast
  })
}));

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0
      }
    }
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('CompliancePainelPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    mockTriggerToast.mockClear();
    api.setMockMode(true); // Garante modo simulado local
  });

  it('deve renderizar a página de compliance com título e botões', async () => {
    render(<CompliancePainelPage />, { wrapper: createTestWrapper() });

    expect(screen.getByText('Gestão de Alertas PLD/FT')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sincronizar Bases/i })).toBeInTheDocument();

    // Deve listar os alertas mockados iniciais do mockDb
    expect(await screen.findByText('Ronaldo Navarro')).toBeInTheDocument();
    expect(screen.getByText('Ana Maria Souza')).toBeInTheDocument();
    expect(screen.getByText('OFAC')).toBeInTheDocument();
    expect(screen.getByText('PEP')).toBeInTheDocument();
  });

  it('deve permitir filtrar alertas por status', async () => {
    render(<CompliancePainelPage />, { wrapper: createTestWrapper() });

    // Espera os dados carregarem
    expect(await screen.findByText('Ronaldo Navarro')).toBeInTheDocument();

    const selects = screen.getAllByRole('combobox');
    const selectFiltroStatus = selects[0]; // Filtro Status

    // Filtra por "Falsos Positivos" (FALSO_POSITIVO)
    fireEvent.change(selectFiltroStatus, { target: { value: 'FALSO_POSITIVO' } });

    // Como os mocks iniciais são todos PENDENTE_ANALISE, o filtro de Falso Positivo deve deixar a lista vazia
    await waitFor(() => {
      expect(screen.getByText('Nenhum alerta encontrado')).toBeInTheDocument();
      expect(screen.queryByText('Ronaldo Navarro')).not.toBeInTheDocument();
    });
  });

  it('deve permitir filtrar alertas por lista de origem', async () => {
    render(<CompliancePainelPage />, { wrapper: createTestWrapper() });

    expect(await screen.findByText('Ronaldo Navarro')).toBeInTheDocument();

    const selects = screen.getAllByRole('combobox');
    const selectFiltroOrigem = selects[1]; // Filtro Origem

    // Filtra por ONU
    fireEvent.change(selectFiltroOrigem, { target: { value: 'ONU' } });

    await waitFor(() => {
      expect(screen.getByText('Nenhum alerta encontrado')).toBeInTheDocument();
    });

    // Filtra por OFAC (deve trazer Ronaldo Navarro)
    fireEvent.change(selectFiltroOrigem, { target: { value: 'OFAC' } });
    await waitFor(() => {
      expect(screen.getByText('Ronaldo Navarro')).toBeInTheDocument();
      expect(screen.queryByText('Ana Maria Souza')).not.toBeInTheDocument();
    });
  });

  it('deve abrir o modal de deliberação e exibir dados corretos', async () => {
    render(<CompliancePainelPage />, { wrapper: createTestWrapper() });

    expect(await screen.findByText('Ronaldo Navarro')).toBeInTheDocument();

    const botoesDeliberar = screen.getAllByRole('button', { name: /Deliberar/i });
    fireEvent.click(botoesDeliberar[0]); // Clica no botão deliberar do primeiro alerta

    // Deve abrir o modal
    expect(screen.getByText(/Deliberar Alerta #/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Veredito/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Justificativa/i)).toBeInTheDocument();
  });

  it('deve validar o preenchimento da justificativa de deliberação (mínimo de 10 caracteres)', async () => {
    render(<CompliancePainelPage />, { wrapper: createTestWrapper() });

    expect(await screen.findByText('Ronaldo Navarro')).toBeInTheDocument();

    const botoesDeliberar = screen.getAllByRole('button', { name: /Deliberar/i });
    fireEvent.click(botoesDeliberar[0]);

    const inputJustificativa = screen.getByPlaceholderText(/Descreva a base legal/i);
    const botaoConfirmar = screen.getByRole('button', { name: /Confirmar Deliberação/i });

    // Digita justificativa muito curta e envia
    fireEvent.change(inputJustificativa, { target: { value: 'Curta' } });
    fireEvent.click(botaoConfirmar);

    // Deve mostrar mensagem de erro
    expect(await screen.findByText('Mínimo de 10 caracteres.')).toBeInTheDocument();
  });

  it('deve deliberar alerta com sucesso se os campos forem válidos', async () => {
    const spyDeliberar = vi.spyOn(api.compliance, 'deliberarAlerta');
    
    render(<CompliancePainelPage />, { wrapper: createTestWrapper() });

    expect(await screen.findByText('Ronaldo Navarro')).toBeInTheDocument();

    const botoesDeliberar = screen.getAllByRole('button', { name: /Deliberar/i });
    fireEvent.click(botoesDeliberar[0]);

    const inputJustificativa = screen.getByPlaceholderText(/Descreva a base legal/i);
    const selectVeredito = screen.getByLabelText(/Veredito/i);
    const botaoConfirmar = screen.getByRole('button', { name: /Confirmar Deliberação/i });

    // Preenche com dados válidos
    fireEvent.change(selectVeredito, { target: { value: 'FALSO_POSITIVO' } });
    fireEvent.change(inputJustificativa, { target: { value: 'Esta pessoa é homônima do suspeito verificado.' } });
    
    fireEvent.click(botaoConfirmar);

    await waitFor(() => {
      expect(spyDeliberar).toHaveBeenCalledWith(1054, {
        novoStatus: 'FALSO_POSITIVO',
        justificativa: 'Esta pessoa é homônima do suspeito verificado.'
      });
      expect(mockTriggerToast).toHaveBeenCalledWith('Alerta deliberado com sucesso.', 'success');
      expect(screen.queryByText(/Deliberar Alerta #/i)).not.toBeInTheDocument();
    });
  });

  it('deve disparar sincronização manual ao clicar no botão correspondente', async () => {
    const spySincronizar = vi.spyOn(api.compliance, 'sincronizar').mockResolvedValue({
      mensagem: "Sincronização de listas restritivas iniciada em background.",
      dataHora: new Date().toISOString()
    });
    
    render(<CompliancePainelPage />, { wrapper: createTestWrapper() });

    const btnSincronizar = screen.getByRole('button', { name: /Sincronizar Bases/i });
    fireEvent.click(btnSincronizar);

    await waitFor(() => {
      expect(spySincronizar).toHaveBeenCalled();
      expect(mockTriggerToast).toHaveBeenCalledWith('Sincronização iniciada em background com sucesso.', 'success');
    });
  });
});
