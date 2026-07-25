import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../services/api';

describe('api.vendas.analisarRisco', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('trata 204 da reprovação como sucesso sem tentar ler JSON', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 204 });

    await expect(api.vendas.analisarRisco(7, false, 'Risco incompatível.')).resolves.toBeNull();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/vendas/propostas/7/analise-risco',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ aprovada: false, justificativa: 'Risco incompatível.' })
      })
    );
  });
});
