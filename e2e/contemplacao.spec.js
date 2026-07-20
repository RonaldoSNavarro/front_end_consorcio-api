import { test, expect } from '@playwright/test';

test.describe('Contemplações e Lances (ADR 004)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('Acesso à página de Lances', async ({ page }) => {
    // Navigate to assembleias and check if we can open the bidding modal or page
    await page.goto('/assembleias');
    
    // Selecionar o primeiro grupo para carregar a lista de cotas
    const selectGrupo = page.locator('#select-grupo');
    await selectGrupo.waitFor({ state: 'visible' });
    
    await page.waitForTimeout(1000);
    const options = await page.locator('select#select-grupo option').allInnerTexts();
    if (options.length > 1) {
      await page.selectOption('select#select-grupo', { index: 1 });
    }
    
    // Check if there's any assembly present
    const assembleiaTitle = page.locator('text=/Histórico de Assembleias/i');
    await expect(assembleiaTitle).toBeVisible();
  });

});
