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

describe('api.cotas.buscarPorGrupoECota', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envia os códigos de negócio sem converter o grupo em ID interno', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: [{ id: 603, codigoCota: 1 }], totalElements: 1 })
    });

    await expect(api.cotas.buscarPorGrupoECota('002', 1)).resolves.toEqual({
      content: [{ id: 603, codigoCota: 1 }],
      totalElements: 1
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/cotas/buscar?codigoGrupo=002&codigoCota=1&size=50',
      expect.objectContaining({ credentials: 'include' })
    );
  });
});
