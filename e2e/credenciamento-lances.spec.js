import { test, expect } from '@playwright/test';

test.describe('Credenciamento de Lances (Backoffice)', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate and login
    await page.goto('/login');
    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'admin');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
  });

  test('Deve acessar a página de Credenciamento de Lances e exibir os campos corretamente', async ({ page }) => {
    // 1. Navegar até Credenciamento de Lances via Sidebar
    await page.click('text="Credenciamento de Lances"');
    await expect(page).toHaveURL(/.*\/credenciamento-lances/, { timeout: 10000 });
    await expect(page.locator('h2', { hasText: 'Credenciamento de Lances' })).toBeVisible();

    // 2. Verificar os campos do formulário
    const grupoSelect = page.locator('select#select-grupo');
    await expect(grupoSelect).toBeVisible();

    // 3. Simular seleção (se houver grupos disponíveis na base local)
    // Opcional: só avança se tiver grupos para testar o fluxo de seleção em cascata
    const count = await page.locator('select#select-grupo option').count();
    if (count > 1) {
      await page.selectOption('select#select-grupo', { index: 1 });

      // Aguarda carregar assembleias
      const assembleiaSelect = page.locator('select#select-assembleia');
      await expect(assembleiaSelect).toBeVisible();
      
      const assembleiasCount = await page.locator('select#select-assembleia option').count();
      if (assembleiasCount > 1) {
        await page.selectOption('select#select-assembleia', { index: 1 });
        
        // Aguarda carregar cotas
        const cotaSelect = page.locator('select#select-cota-lance');
        await expect(cotaSelect).toBeVisible();

        const cotasCount = await page.locator('select#select-cota-lance option').count();
        if (cotasCount > 1) {
           await page.selectOption('select#select-cota-lance', { index: 1 });
           
           // Preenche tipo, modalidade e valor
           await page.selectOption('select#tipo-lance', 'LIVRE');
           await page.selectOption('select#modalidade-lance', 'FIXO');
           await page.fill('input#valor-oferta', '10000');
           
           // Se tivermos certeza de que o mock/db permite o envio real sem quebrar o estado local de teste,
           // poderíamos clicar em enviar:
           // await page.click('button[type="submit"]');
           // await expect(page.locator('text=Lance registrado com sucesso')).toBeVisible();
        }
      }
    }
  });
});
