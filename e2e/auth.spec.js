import { test, expect } from '@playwright/test';

test.describe('Autenticação e Sessão (ADR 007)', () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    // LocalStorage não pode ser limpo no about:blank. Playwright já isola o contexto.
  });

  test('Deve logar com sucesso e gerenciar a sessão via Cookie HttpOnly (sem vazar no LocalStorage)', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'admin');
    await page.click('button[type="submit"]');
    
    // Verifica redirecionamento e toast
    await page.waitForURL('**/dashboard');
    
    const welcomeText = page.locator('text=/Dashboard Operacional/i');
    await expect(welcomeText).toBeVisible();

    // Verifica que o JWT não vazou no LocalStorage
    const tokenNoLocalStorage = await page.evaluate(() => localStorage.getItem('consorcio_api_token'));
    expect(tokenNoLocalStorage).toBeNull();
  });

  test('Deve manter o usuário logado ao atualizar a página (F5-safety)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // F5
    await page.reload();

    // Deve voltar pro dashboard sem pedir login
    await page.waitForURL('**/dashboard');
    const welcomeText = page.locator('text=/Dashboard Operacional/i');
    await expect(welcomeText).toBeVisible();
  });

  test('Deve realizar o logout corretamente', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Click logout. Assumes there's a button with title Sair do painel
    const logoutBtn = page.locator('button[title="Sair do painel"]');
    await logoutBtn.click();

    await page.waitForURL('**/login');
  });

});
