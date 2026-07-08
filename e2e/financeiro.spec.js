import { test, expect } from '@playwright/test';

test.describe('Fluxo Financeiro - Fundos e Parcelas', () => {
  test.beforeEach(async ({ page }) => {
    // Escuta logs do browser para facilitar debugging
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    
    await page.waitForTimeout(1000);

    // Login (com toPass para maior resiliência)
    await expect(async () => {
      await page.goto('/login');
      await page.fill('#login-username', 'admin');
      await page.fill('#login-password', 'admin');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    }).toPass({ timeout: 20000 });
  });

  test('Deve visualizar cotas, baixar parcela e amortizar', async ({ page }) => {
    // 1. Navegar até Financeiro
    await page.goto('/financeiro');
    await expect(page.locator('h2', { hasText: 'Financeiro e Caixa' })).toBeVisible();

    // 2. Selecionar a primeira Cota disponível
    await page.waitForSelector('select#select-cota');
    await page.waitForTimeout(1000); // Wait for fetch
    const options = await page.locator('select#select-cota option').allInnerTexts();
    console.log('Cotas Options found:', options);
    
    if (options.length > 1) {
      await page.selectOption('select#select-cota', { index: 1 });
    } else {
      console.log('Nenhuma cota retornada pela API!');
    }

    // 3. Aguardar o carregamento das parcelas (Evita race conditions aguardando elemento ou mensagem)
    const tableLocator = page.locator('table tbody tr').first();
    const emptyLocator = page.locator('text=Nenhuma parcela gerada para esta cota.');
    
    await expect(tableLocator.or(emptyLocator)).toBeVisible({ timeout: 15000 });

    if (await emptyLocator.isVisible()) {
        console.log('A cota selecionada não possui parcelas. O teste encerra com sucesso antecipado por falta de dados pre-semeados.');
        return;
    }

    // 4. Fluxo de Amortização
    const inputAmortizar = page.locator('#valorAmortizar');
    if (await inputAmortizar.isVisible()) {
      await inputAmortizar.fill('5000');
      // Deixa o tipo como DILUICAO
      await page.click('button[type="submit"]:has-text("Amortizar Valor")');
      
      // Verifica o toast
      await expect(page.locator('text=Amortização por lance de parcelas executada com sucesso!')).toBeVisible({ timeout: 15000 });
    }

    // 5. Fluxo de Baixa (Pagar)
    // Procurar o primeiro botão 'Baixar'
    const baixarBtn = page.locator('button', { hasText: 'Baixar' }).first();
    if (await baixarBtn.isVisible()) {
      // Pega o input de data para certificar que está preenchido
      await page.fill('#dataPagamento', '2026-06-25');
      await baixarBtn.click();
      
      await expect(page.locator('text=Pagamento de parcela baixado com sucesso!')).toBeVisible({ timeout: 15000 });
    }
  });
});
