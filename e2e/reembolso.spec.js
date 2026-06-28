import { test, expect } from '@playwright/test';

test.describe('Navegação e Cálculo de Reembolso', () => {
  test.beforeEach(async ({ page }) => {
    // Autenticação prévia
    await page.goto('/login');
    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'admin');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('Deve acessar a tela de restituições a excluídos, verificar cálculos e memória de cálculo contábil', async ({ page }) => {
    // Intercepta a rota da API que traz a lista para injetar um mock contábil fiel à ADR 005
    await page.route('**/api/cotas/canceladas/pendentes-reembolso', async (route) => {
      const json = {
        content: [
          {
            id: 1,
            numeroCota: 15,
            clienteId: 99,
            clienteNome: 'João Consorciado Excluído',
            cpfCnpj: '11122233344',
            numeroAssembleiaAGO: 'AGO-42',
            dataContemplacaoAGO: '2026-06-25T10:00:00Z',
            valorBemReferenciaAGO: 100000, // Valor do bem atualizado
            percentualFundoComumPago: 10,   // 10% de percentual pago
            valorHistoricoPago: 8000,       // Pagou nominalmente
            valorBrutoRestituicao: 10000,   // 10% de 100000
            valorMultaRestituicao: 1000,    // Multa de 10% sobre 10000
            valorLiquidoRestituicao: 9000,  // Liquido a receber: 9000
          }
        ]
      };
      await route.fulfill({ json });
    });

    // Navega para a tela
    await page.goto('/reembolsos-excluidos');
    
    // Verifica a presença dos dados na tabela
    await expect(page.locator('h2', { hasText: 'Restituições a Excluídos' })).toBeVisible();
    await expect(page.locator('text=João Consorciado Excluído')).toBeVisible();
    await expect(page.locator('text=R$ 100.000,00')).toBeVisible(); // Valor do Bem
    
    // O valor líquido deve aparecer na tabela formatado
    await expect(page.locator('td.text-right.font-mono.font-bold.text-emerald-600', { hasText: '9.000,00' })).toBeVisible();

    // Clica no botão de Memória de Cálculo (icone da calculadora)
    await page.click('button[title="Visualizar Memória de Cálculo detalhada"]');

    // Valida o modal de Memória de Cálculo e as regras financeiras
    const modal = page.locator('.modal-backdrop').first();
    await expect(modal).toBeVisible();
    
    await expect(modal.locator('text=Memória de Cálculo')).toBeVisible();
    
    // Verifica o percentual
    await expect(modal.locator('text=10.00%')).toBeVisible();
    
    // Verifica o Valor Bruto
    await expect(modal.locator('strong:has-text("R$ 10.000,00")')).toBeVisible();
    
    // Verifica a Multa Rescisória (- R$ 1.000,00)
    await expect(modal.locator('strong:has-text("- R$ 1.000,00")')).toBeVisible();

    // Fechar modal
    await modal.locator('button', { hasText: 'Fechar Memória' }).click();
  });

  test('Deve processar o pagamento do reembolso de excluído', async ({ page }) => {
    // Intercepta a rota da API de listagem
    await page.route('**/api/cotas/canceladas/pendentes-reembolso', async (route) => {
      const json = {
        content: [
          {
            id: 2,
            numeroCota: 33,
            clienteId: 77,
            clienteNome: 'Maria Excluída',
            valorBemReferenciaAGO: 200000, 
            percentualFundoComumPago: 5,   
            valorHistoricoPago: 10000,      
            valorBrutoRestituicao: 10000,   
            valorMultaRestituicao: 1000,    
            valorLiquidoRestituicao: 9000,  
          }
        ]
      };
      await route.fulfill({ json });
    });

    // Intercepta o POST de pagamento
    await page.route('**/api/cotas/2/reembolsar', async (route) => {
      await route.fulfill({ status: 200, json: { valorReembolsado: 9000, reembolsada: true } });
    });

    await page.goto('/reembolsos-excluidos');
    
    // Clica em Pagar Reembolso
    await page.click('button[title="Processar quitação bancária"]');

    // Preenche Modal de Pagamento
    const modal = page.locator('.modal-backdrop').first();
    await expect(modal).toBeVisible();
    
    await modal.locator('input[placeholder="EX: 341 - Itaú Unibanco"]').fill('341');
    await modal.locator('input[placeholder="EX: 0910"]').fill('1234');
    await modal.locator('input[placeholder="EX: 28472-1"]').fill('55555-5');

    // Executa
    await modal.locator('button', { hasText: 'Efetuar Quitação' }).click();

    // Verifica Toast
    await expect(page.locator('text=Reembolso processado com sucesso!')).toBeVisible();
  });
});
