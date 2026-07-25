import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnaliseRiscoPage } from '../pages/AnaliseRiscoPage';

const mocks = vi.hoisted(() => ({
  listarPendentesRisco: vi.fn(),
  analisarRisco: vi.fn(),
  triggerToast: vi.fn()
}));

vi.mock('../services/api', () => ({
  api: {
    vendas: {
      listarPendentesRisco: mocks.listarPendentesRisco,
      analisarRisco: mocks.analisarRisco
    }
  }
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ triggerToast: mocks.triggerToast })
}));

const propostaPendente = {
  id: 10,
  numeroProposta: 'PROP-001',
  valorCreditoSolicitado: 100000,
  cliente: { nome: 'Cliente Restritivo' },
  alertas: [{ tipo: 'OFAC', descricao: 'Alerta restritivo confirmado' }]
};

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AnaliseRiscoPage />
    </QueryClientProvider>
  );
};

describe('AnaliseRiscoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listarPendentesRisco.mockResolvedValue([propostaPendente]);
    mocks.analisarRisco.mockResolvedValue({ id: 20, status: 'PENDENTE_PAGAMENTO' });
  });

  it('abre o modal e permite cancelar sem enviar a aprovação', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /aprovar/i }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/proposta #PROP-001/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(mocks.analisarRisco).not.toHaveBeenCalled();
  });

  it('envia a aprovação somente após a confirmação no modal', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /aprovar/i }));
    expect(mocks.analisarRisco).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar Aprovação' }));

    await waitFor(() => {
      expect(mocks.analisarRisco).toHaveBeenCalledTimes(1);
      expect(mocks.analisarRisco).toHaveBeenCalledWith(10, true, undefined);
    });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(mocks.triggerToast).toHaveBeenCalledWith(
      "Proposta aprovada! Primeira parcela pendente de pagamento.",
      "success"
    );
  });

  it('conclui a reprovação quando a API responde sem conteúdo', async () => {
    mocks.analisarRisco.mockResolvedValue(null);
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /reprovar/i }));
    fireEvent.change(screen.getByLabelText(/justificativa da reprovação/i), {
      target: { value: 'Risco incompatível com a política de crédito.' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar Reprovação' }));

    await waitFor(() => {
      expect(mocks.analisarRisco).toHaveBeenCalledWith(
        10,
        false,
        'Risco incompatível com a política de crédito.'
      );
    });
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Confirmar Reprovação' })).not.toBeInTheDocument());
    expect(mocks.triggerToast).toHaveBeenCalledWith('Análise de risco concluída com sucesso!', 'success');
  });
});
