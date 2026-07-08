import { test, expect } from '@playwright/test';

test.describe('Fluxo de Assembleia e Apuração', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    
    // Aguarda o vite responder para não dar abort na navegação
    await page.waitForTimeout(1000);

    // Repetir a navegação de login caso o backend / proxy dê reset inicial
    await expect(async () => {
      await page.goto('/login');
      await page.fill('#login-username', 'admin');
      await page.fill('#login-password', 'admin');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    }).toPass({ timeout: 20000 });
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

    // Espera a UI reagir após a seleção
    await page.waitForTimeout(1000);
    
    // Se não tiver nenhuma assembleia listada, agenda uma rapidamente para prosseguir
    const emptyMsg = page.locator('text=Nenhuma assembleia para este grupo.');
    if (await emptyMsg.isVisible()) {
        await page.fill('#dataAssembleia', '2030-10-24');
        await page.click('button:has-text("Agendar Assembleia")');
        await expect(page.locator('text=Assembleia agendada com sucesso')).toBeVisible({ timeout: 5000 });
        await page.waitForSelector('table tbody tr', { timeout: 10000 });
    } else {
        await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => {});
    }

    // Usando toPass para garantir retentativas seguras e progressão de estado
    await expect(async () => {
      // Se Apurar já está habilitado, sucesso!
      const apurarButton = page.locator('button:not(:disabled)', { hasText: 'Apurar' }).first();
      if (await apurarButton.isVisible()) {
        return;
      }
      
      // Senão, tentar avançar máquina de estado:
      const fecharButton = page.locator('button', { hasText: 'Fechar' }).first();
      if (await fecharButton.isVisible()) {
          await fecharButton.click();
          await expect(page.locator('text=Captação encerrada')).toBeVisible({ timeout: 5000 });
          throw new Error('Aguardando re-render após Fechar');
      } 
      
      const abrirButton = page.locator('button', { hasText: 'Abrir' }).first();
      if (await abrirButton.isVisible()) {
          await abrirButton.click();
          await expect(page.locator('text=Captação de lances aberta')).toBeVisible({ timeout: 5000 });
          throw new Error('Aguardando re-render após Abrir');
      }
      
      throw new Error('Nenhum botão de ação visível ainda');
    }).toPass({ timeout: 15000 });
    
    const apurarButtonFinal = page.locator('button:not(:disabled)', { hasText: 'Apurar' }).first();
    await expect(apurarButtonFinal).toBeVisible();
    await apurarButtonFinal.click();

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
  });
});
