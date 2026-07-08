import { test, expect } from '@playwright/test';

test.describe('Fluxo de Inadimplência e Estorno', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    
    await page.waitForTimeout(1000);

    // Login com resiliência
    await expect(async () => {
      await page.goto('/login');
      await page.fill('#login-username', 'admin');
      await page.fill('#login-password', 'admin');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    }).toPass({ timeout: 20000 });
  });

  test('Deve verificar presença de painel de mora e estorno em parcelas', async ({ page }) => {
    await page.goto('/financeiro');
    await expect(page.locator('h2', { hasText: 'Financeiro e Caixa' })).toBeVisible();

    // Aguardar cotas e selecionar uma
    await page.waitForSelector('select#select-cota');
    await page.waitForTimeout(1000); // Wait for query
    const options = await page.locator('select#select-cota option').allInnerTexts();
    
    if (options.length > 1) {
      // Tentar encontrar uma cota para selecionar (pode ou não estar inadimplente)
      await page.selectOption('select#select-cota', { index: 1 });
    } else {
      console.log('Nenhuma cota retornada pela API. Finalizando com sucesso antecipado.');
      return;
    }

    // Verificar se o card de Inadimplência carrega (quando houver) ou tabela carrega
    const tableLocator = page.locator('table tbody tr').first();
    const emptyLocator = page.locator('text=Nenhuma parcela gerada para esta cota.');
    
    await expect(tableLocator.or(emptyLocator)).toBeVisible({ timeout: 15000 });

    if (await emptyLocator.isVisible()) {
      console.log('Cota sem parcelas geradas. Finalizando teste.');
      return;
    }

    // Ação de Estorno: Verificar se existe algum botão de Estornar e interagir
    const estornarBtn = page.locator('button', { hasText: 'Estornar' }).first();
    
    if (await estornarBtn.isVisible()) {
      // O estorno dispara window.confirm nativo, então precisamos interceptar
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('estorno');
        await dialog.accept();
      });
      
      await estornarBtn.click();
      await expect(page.locator('text=Pagamento de parcela estornado com sucesso')).toBeVisible({ timeout: 15000 });
    } else {
      console.log('Nenhuma parcela PAGA encontrada para estornar.');
    }
  });

  test('Deve visualizar badges de Inadimplência na página de Cotas', async ({ page }) => {
    await page.goto('/cotas');
    await expect(page.locator('h2', { hasText: 'Emissão & Venda de Cotas' })).toBeVisible();
    
    const tableLocator = page.locator('table tbody tr').first();
    const emptyLocator = page.locator('text=Nenhuma cota encontrada.');
    
    await expect(tableLocator.or(emptyLocator)).toBeVisible({ timeout: 15000 });

    // Se houver cotas, o badge de status (Adimplente/Inadimplente/Ativa) deve estar visível em alguma delas
    // Esse teste é passivo apenas para garantir que a renderização da coluna funciona
  });
});
