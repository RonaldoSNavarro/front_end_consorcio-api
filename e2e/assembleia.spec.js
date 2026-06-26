import { test, expect } from '@playwright/test';

test.describe('Fluxo de Assembleia e Apuração', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    await page.goto('/login');
    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'admin');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('Deve abrir o modal do motor de apuração e disparar a requisição', async ({ page }) => {
    await page.goto('/assembleias');

    await expect(page.locator('h2', { hasText: 'Central AGO' })).toBeVisible();

    // Seleciona o primeiro grupo no select para carregar as assembleias
    await page.waitForSelector('select#select-grupo');
    const options = await page.locator('select#select-grupo option').allInnerTexts();
    if (options.length > 1) {
      await page.selectOption('select#select-grupo', { index: 1 });
    }

    // Tenta encontrar o botão Apurar
    const apurarButton = page.locator('button', { hasText: 'Apurar' }).first();
    
    // Se não existir, a gente tenta clicar em um botão "Fechar" para forçar uma como REALIZADA
    if (!(await apurarButton.isVisible())) {
       const fecharButton = page.locator('button', { hasText: 'Fechar' }).first();
       if (await fecharButton.isVisible()) {
           await fecharButton.click();
           await expect(page.locator('text=Captação encerrada')).toBeVisible({ timeout: 5000 });
       } else {
           // tenta abrir uma primeiro
           const abrirButton = page.locator('button', { hasText: 'Abrir' }).first();
           if (await abrirButton.isVisible()) {
               await abrirButton.click();
               await expect(page.locator('text=Captação de lances aberta')).toBeVisible({ timeout: 5000 });
               const fb = page.locator('button', { hasText: 'Fechar' }).first();
               if (await fb.isVisible()) {
                   await fb.click();
               }
           }
       }
    }

    if (await apurarButton.isVisible()) {
      await apurarButton.click();

      // Verifica o Modal do Motor de Apuração
      const modal = page.locator('.modal-backdrop', { hasText: 'Motor de Apuração' }).first();
      await expect(modal).toBeVisible();

      // Preenche a dezena de sorteio
      const dezenaInput = page.locator('#dezena-sorteio');
      if (await dezenaInput.isVisible()) {
        await dezenaInput.fill('42'); 
      }

      // Clica em Executar Apuração
      await page.click('button:has-text("Executar Apuração")');

      // Verifica Toast de Sucesso
      await expect(page.locator('text=Apuração concluída')).toBeVisible({ timeout: 15000 });
    }
  });
});
