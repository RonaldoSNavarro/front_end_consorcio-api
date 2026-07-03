import { test, expect } from '@playwright/test';

test.describe('Navegação e Links Globais', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'admin');
    await page.click('button[type="submit"]');
    // Esperar o redirecionamento para o dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('Deve acessar todas as rotas da sidebar e verificar carregamento', async ({ page }) => {
    // Verifica a presença da Sidebar
    await expect(page.locator('nav')).toBeVisible();

    // 1. Dashboard
    await page.click('text=Visão Geral');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Clientes
    await page.click('text=Clientes');
    await expect(page).toHaveURL(/.*\/clientes/);

    // 3. Grupos
    await page.click('text=Grupos');
    await expect(page).toHaveURL(/.*\/grupos/);

    // 4. Cotas
    await page.click('text=Cotas');
    await expect(page).toHaveURL(/.*\/cotas/);

    // 5. Compliance
    await page.click('text=Listas Restritivas (PLD)');
    await expect(page).toHaveURL(/.*\/compliance\/alertas/);

    // 6. Assembleias
    await page.click('text=Assembleias');
    await expect(page).toHaveURL(/.*\/assembleias/);

    // 7. Lances
    await page.click('text=Lances e Integralização');
    await expect(page).toHaveURL(/.*\/lances-pendentes/);

    // 8. Venda Proposta
    await page.goto('/vendas/proposta');
    await expect(page).toHaveURL(/.*\/vendas\/proposta/);

    // 9. Tipos de Venda
    await page.goto('/vendas/tipos');
    await expect(page).toHaveURL(/.*\/vendas\/tipos/);
  });
});
