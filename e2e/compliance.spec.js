import { test, expect } from '@playwright/test';

test.describe('Compliance e Testes Negativos', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Fazer login primeiro para acessar rotas protegidas
    await page.goto('/login');
    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('Deve impedir venda para cliente bloqueado em lista restritiva (OFAC/ONU)', async ({ page }) => {
    // Navigate to sales proposal page
    await page.goto('/vendas/proposta');

    // 2. Procurar cliente bloqueado
    const clienteInput = page.locator('input[type="search"]');
    await clienteInput.fill('OSAMA BIN LADEN');
    
    // 3. Selecionar o cliente (Avança para passo 1)
    await page.waitForTimeout(500); // Wait for filter to apply
    await page.locator('.max-h-72 button').first().click();

    // 4. Passo 1: Informar valor do crédito
    const valorInput = page.locator('input[type="number"]');
    await valorInput.fill('50000');
    await page.getByRole('button', { name: /Avançar/i }).click();

    // 5. Passo 2: Selecionar um Tipo de Venda (Canal)
    await page.locator('.glass-panel button').filter({ hasText: /Comissão/i }).first().click();

    // 6. Passo 3: Efetivar Proposta
    await page.getByRole('button', { name: /Efetivar Proposta/i }).click();

    // 7. Espera-se o bloqueio por PLD/FT
    const toast = page.locator('text=/bloqueada por PLD\\/FT/i');
    await expect(toast).toBeVisible({ timeout: 5000 });
  });

  test('Deve bloquear lance de cota CANCELADA na Assembleia', async ({ page }) => {
    await page.goto('http://localhost:5173/assembleias');
    
    // Selecionar o primeiro grupo para carregar a lista de cotas
    const selectGrupo = page.locator('#select-grupo');
    await selectGrupo.selectOption({ index: 1 });
    
    // Selecionar uma assembleia (qualquer uma)
    const btnSelecionarAssembleia = page.locator('button', { hasText: 'Selecionar' }).first();
    await btnSelecionarAssembleia.waitFor({ state: 'visible' });
    await btnSelecionarAssembleia.click();

    // Verificar se a opção CANCELADA aparece no dropdown de Cota Ativa (não deve aparecer)
    const selectCota = page.locator('#select-cota');
    await selectCota.waitFor({ state: 'visible' });
    const textContent = await selectCota.textContent();
    expect(textContent).not.toMatch(/CANCELADA/i);
  });

  test('Deve impedir o processo de Apurar Assembleia se a Captação não estiver fechada', async ({ page }) => {
    await page.goto('http://localhost:5173/assembleias');
    
    // Selecionar o primeiro grupo
    const selectGrupo = page.locator('#select-grupo');
    await selectGrupo.selectOption({ index: 1 });
    
    // Encontrar uma assembleia que NÃO está REALIZADA (ex: AGENDADA)
    // Se a tabela carregar e existir alguma:
    const assembleiaNaoRealizadaRow = page.locator('table tbody tr').filter({ hasText: 'AGENDADA' }).first();
    
    // Verificar se o botão Apurar dentro dessa linha está disabled
    const apurarBtn = assembleiaNaoRealizadaRow.locator('button', { hasText: 'Apurar' });
    
    if (await apurarBtn.isVisible()) {
      await expect(apurarBtn).toBeDisabled();
    } else {
      // Se não houver assembleia AGENDADA para testar, garantimos que qualquer botão Apurar de assembleia em andamento esteja disabled
      const apurarBtns = page.locator('button', { hasText: 'Apurar' });
      const count = await apurarBtns.count();
      for (let i = 0; i < count; i++) {
        const title = await apurarBtns.nth(i).getAttribute('title');
        if (title !== 'Apurar Motor') { // Apenas botões que não são de assembleias REALIZADAS
          await expect(apurarBtns.nth(i)).toBeDisabled();
        }
      }
    }
  });
});
