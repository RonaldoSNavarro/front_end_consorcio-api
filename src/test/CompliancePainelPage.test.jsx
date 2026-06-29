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
    mockTriggerToast.mockClear();
    
    // Mockar endpoints chamados na montagem
    vi.spyOn(api.compliance, 'listarAlertas').mockImplementation((status, origem) => {
      let data = [
        { alertaId: 1054, nomeCliente: 'Ronaldo Navarro', cpfCnpj: '111.222.333-44', status: 'PENDENTE_ANALISE', origemLista: 'OFAC', scoreSimilaridade: 0.80 },
        { alertaId: 1055, nomeCliente: 'Ana Maria Souza', cpfCnpj: '555.666.777-88', status: 'PENDENTE_ANALISE', origemLista: 'PEP', scoreSimilaridade: 0.40 }
      ];
      if (status) data = data.filter(d => d.status === status);
      if (origem) data = data.filter(d => d.origemLista === origem);
      return Promise.resolve({ content: data });
    });
    vi.spyOn(api.compliance, 'getConfig').mockResolvedValue({
      frequencia: 'DIARIO',
      horario: '03:00'
    });
  });

  it('deve renderizar a página de compliance com título e botões', async () => {
    render(<CompliancePainelPage />, { wrapper: createTestWrapper() });

    expect(await screen.findByText('Ronaldo Navarro')).toBeInTheDocument();
    expect(screen.getByText('Gestão de Compliance e PLD/FT')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sincronizar Bases/i })).toBeInTheDocument();

    // Deve listar os alertas mockados iniciais do mockDb
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
    const spyDeliberar = vi.spyOn(api.compliance, 'deliberarAlerta').mockResolvedValue({});
    
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
      expect(mockTriggerToast).toHaveBeenCalledWith('Sincronização manual iniciada em background com sucesso.', 'success');
    });
  });

  it('deve alternar entre as abas corretamente', async () => {
    render(<CompliancePainelPage />, { wrapper: createTestWrapper() });

    // Padrão: aba de Alertas
    expect(await screen.findByText('Ronaldo Navarro')).toBeInTheDocument();

    // Clica na aba de Importação de Listas
    const tabUpload = screen.getByRole('tab', { name: /Importar Listas/i });
    fireEvent.click(tabUpload);

    expect(screen.getByText('Lista PEP (CSV)')).toBeInTheDocument();
    expect(screen.getByText('Lista ONU (XML)')).toBeInTheDocument();
    expect(screen.getByText('Lista IBGE (XLS/XLSX)')).toBeInTheDocument();

    // Clica na aba de Agendamento
    const tabConfig = screen.getByRole('tab', { name: /Agendamento de Job/i });
    fireEvent.click(tabConfig);

    expect(await screen.findByText('Configurar Processamento Automático')).toBeInTheDocument();
    expect(screen.getByLabelText(/Frequência de Execução/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Horário de Disparo/i)).toBeInTheDocument();
  });

  it('deve validar extensões e fazer upload de arquivos com sucesso', async () => {
    const spyUploadPep = vi.spyOn(api.compliance, 'uploadPep').mockResolvedValue({
      mensagem: "Arquivo PEP processado com sucesso. 1500 registros inseridos/atualizados."
    });

    render(<CompliancePainelPage />, { wrapper: createTestWrapper() });

    const tabUpload = screen.getByRole('tab', { name: /Importar Listas/i });
    fireEvent.click(tabUpload);

    const inputPep = screen.getByLabelText(/Upload de arquivo para Lista PEP/i);

    // Upload de tipo incorreto
    const invalidFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(inputPep, { target: { files: [invalidFile] } });

    expect(mockTriggerToast).toHaveBeenCalledWith('Extensão de arquivo inválida. Esperado: .csv', 'danger');

    // Upload correto
    const validFile = new File(['cpf;nome\n11122233344;Test Pep'], 'pep.csv', { type: 'text/csv' });
    fireEvent.change(inputPep, { target: { files: [validFile] } });

    // O arquivo deve estar selecionado
    expect(screen.getByText('pep.csv')).toBeInTheDocument();

    // Clica no botão "Enviar Arquivo" da seção PEP
    const btnEnviar = screen.getAllByRole('button', { name: /Enviar Arquivo/i })[0];
    fireEvent.click(btnEnviar);

    await waitFor(() => {
      expect(spyUploadPep).toHaveBeenCalledWith(validFile);
      expect(mockTriggerToast).toHaveBeenCalledWith('Arquivo PEP processado com sucesso. 1500 registros inseridos/atualizados.', 'success');
      expect(screen.getByText('Arquivo PEP processado com sucesso. 1500 registros inseridos/atualizados.')).toBeInTheDocument();
    });
  });

  it('deve carregar a configuração e salvar novas alterações com sucesso', async () => {
    const spyUpdateConfig = vi.spyOn(api.compliance, 'updateConfig').mockResolvedValue({
      cronExpression: "0 30 4 1 * *",
      frequencia: "MENSAL",
      horario: "04:30",
      dataAtualizacao: new Date().toISOString()
    });

    render(<CompliancePainelPage />, { wrapper: createTestWrapper() });

    const tabConfig = screen.getByRole('tab', { name: /Agendamento de Job/i });
    fireEvent.click(tabConfig);

    // Verifica que a configuração padrão carregou do mockDb (DIARIO e 03:00)
    const selectFreq = await screen.findByLabelText(/Frequência de Execução/i);
    const inputHora = screen.getByLabelText(/Horário de Disparo/i);

    expect(selectFreq.value).toBe('DIARIO');
    expect(inputHora.value).toBe('03:00');

    // Altera valores
    fireEvent.change(selectFreq, { target: { value: 'MENSAL' } });
    fireEvent.change(inputHora, { target: { value: '04:30' } });

    // Salva
    const btnSalvar = screen.getByRole('button', { name: /Salvar Configuração/i });
    fireEvent.click(btnSalvar);

    await waitFor(() => {
      expect(spyUpdateConfig).toHaveBeenCalledWith({
        frequencia: 'MENSAL',
        horario: '04:30'
      });
      expect(mockTriggerToast).toHaveBeenCalledWith('Configuração de agendamento atualizada com sucesso.', 'success');
    });
  });
});
