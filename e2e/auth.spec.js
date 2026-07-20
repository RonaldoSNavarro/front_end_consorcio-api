import { test, expect } from '@playwright/test';

test.describe('Autenticação e Sessão (ADR 007)', () => {

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    // LocalStorage não pode ser limpo no about:blank. Playwright já isola o contexto.
  });

  test('Deve logar com sucesso e gerenciar a sessão via Cookie HttpOnly (sem vazar no LocalStorage)', async ({ page }) => {
    // Mock the login API to bypass MFA
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Admin', role: 'ADMIN', mfaRequired: false }),
        headers: { 'Set-Cookie': 'consorcio_session=mocked_token; Path=/; HttpOnly' }
      });
    });

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
    // Mock APIs to bypass MFA and verify session
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Admin', role: 'ADMIN', mfaRequired: false }),
        headers: { 'Set-Cookie': 'consorcio_session=mocked_token; Path=/; HttpOnly' }
      });
    });
    await page.route('**/api/login/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Admin', role: 'ADMIN' })
      });
    });

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
    // Mock login APIs to bypass MFA
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ name: 'Admin', role: 'ADMIN', mfaRequired: false }),
        headers: { 'Set-Cookie': 'consorcio_session=mocked_token; Path=/; HttpOnly' }
      });
    });
    // Mock logout API
    await page.route('**/api/login/logout', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Logout success' }),
        headers: { 'Set-Cookie': 'consorcio_session=; Path=/; HttpOnly; Max-Age=0' }
      });
    });

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
