import { test, expect } from '@playwright/test';

test.describe('Fluxo de Venda Proposta', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'admin');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('Deve completar o Wizard de Venda com sucesso', async ({ page }) => {
    await page.goto('/vendas/proposta');

    // Step 1: Cliente
    await expect(page.locator('h3', { hasText: 'Selecionar Consorciado' })).toBeVisible();
    await page.fill('input[type="search"]', ''); // Ensure empty search to see list
    
    // Supondo que exista pelo menos um cliente para clicar
    const clientCard = page.locator('.max-h-72 > button').first();
    // Se a lista estiver vazia (aparece 'Nenhum cliente ativo encontrado'), o teste falharia legitimamente.
    await expect(clientCard).toBeVisible({ timeout: 10000 });
    await clientCard.click();
    
    // Clica vai automaticamente pro step 2 no onCLick, o layout não tem "Próximo"

    // Step 2: Valor do Crédito
    await expect(page.locator('h3', { hasText: 'Valor do Crédito' })).toBeVisible();
    await page.fill('input[type="number"]', '50000');
    await page.click('button:has-text("Avançar")');
    // Automaticamente avança pro step 3

    // Step 3: Tipo de Venda
    await expect(page.locator('h3', { hasText: 'Tipo de Venda' })).toBeVisible();
    const tipoCard = page.locator('button').filter({ hasText: 'Comissão:' }).first();
    await expect(tipoCard).toBeVisible();
    await tipoCard.click();
    // Automaticamente avança pro step 4

    // Step 4: Confirmação
    await expect(page.locator('h3', { hasText: 'Confirmar Proposta' })).toBeVisible();


    // Confirmar
    await page.click('button:has-text("Efetivar Proposta")');

    // Verificar o Toast de sucesso
    await expect(page.locator('text=Venda efetivada!')).toBeVisible({ timeout: 10000 });
  });
});
