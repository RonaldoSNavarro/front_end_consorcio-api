# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reembolso.spec.js >> Navegação e Cálculo de Reembolso >> Deve acessar a tela de restituições a excluídos, verificar cálculos e memória de cálculo contábil
- Location: e2e\reembolso.spec.js:13:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/dashboard/
Received string:  "http://localhost:5173/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "http://localhost:5173/login"

```

```yaml
- heading "Consórcio Admin" [level=2]
- paragraph: Gerenciamento de Consórcios
- text: Login Administrativo
- textbox "Login Administrativo": admin
- text: Senha de Acesso
- textbox "Senha de Acesso": admin
- button "Mostrar senha"
- button "Autenticar"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Navegação e Cálculo de Reembolso', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Autenticação prévia
  6   |     await page.goto('/login');
  7   |     await page.fill('#login-username', 'admin');
  8   |     await page.fill('#login-password', 'admin');
  9   |     await page.click('button[type="submit"]');
> 10  |     await expect(page).toHaveURL(/.*\/dashboard/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  11  |   });
  12  | 
  13  |   test('Deve acessar a tela de restituições a excluídos, verificar cálculos e memória de cálculo contábil', async ({ page }) => {
  14  |     // Intercepta a rota da API que traz a lista para injetar um mock contábil fiel à ADR 005
  15  |     await page.route('**/api/cotas/canceladas/pendentes-reembolso', async (route) => {
  16  |       const json = {
  17  |         content: [
  18  |           {
  19  |             id: 1,
  20  |             numeroCota: 15,
  21  |             clienteId: 99,
  22  |             clienteNome: 'João Consorciado Excluído',
  23  |             cpfCnpj: '11122233344',
  24  |             numeroAssembleiaAGO: 'AGO-42',
  25  |             dataContemplacaoAGO: '2026-06-25T10:00:00Z',
  26  |             valorBemReferenciaAGO: 100000, // Valor do bem atualizado
  27  |             percentualFundoComumPago: 10,   // 10% de percentual pago
  28  |             valorHistoricoPago: 8000,       // Pagou nominalmente
  29  |             valorBrutoRestituicao: 10000,   // 10% de 100000
  30  |             valorMultaRestituicao: 1000,    // Multa de 10% sobre 10000
  31  |             valorLiquidoRestituicao: 9000,  // Liquido a receber: 9000
  32  |           }
  33  |         ]
  34  |       };
  35  |       await route.fulfill({ json });
  36  |     });
  37  | 
  38  |     // Navega para a tela
  39  |     await page.goto('/reembolsos-excluidos');
  40  |     
  41  |     // Verifica a presença dos dados na tabela
  42  |     await expect(page.locator('h2', { hasText: 'Restituições a Excluídos' })).toBeVisible();
  43  |     await expect(page.locator('text=João Consorciado Excluído')).toBeVisible();
  44  |     await expect(page.locator('text=R$ 100.000,00')).toBeVisible(); // Valor do Bem
  45  |     
  46  |     // O valor líquido deve aparecer na tabela formatado
  47  |     await expect(page.locator('td.text-right.font-mono.font-bold.text-emerald-600', { hasText: '9.000,00' })).toBeVisible();
  48  | 
  49  |     // Clica no botão de Memória de Cálculo (icone da calculadora)
  50  |     await page.click('button[title="Visualizar Memória de Cálculo detalhada"]');
  51  | 
  52  |     // Valida o modal de Memória de Cálculo e as regras financeiras
  53  |     const modal = page.locator('.modal-backdrop').first();
  54  |     await expect(modal).toBeVisible();
  55  |     
  56  |     await expect(modal.locator('text=Memória de Cálculo')).toBeVisible();
  57  |     
  58  |     // Verifica o percentual
  59  |     await expect(modal.locator('text=10.00%')).toBeVisible();
  60  |     
  61  |     // Verifica o Valor Bruto
  62  |     await expect(modal.locator('strong:has-text("R$ 10.000,00")')).toBeVisible();
  63  |     
  64  |     // Verifica a Multa Rescisória (- R$ 1.000,00)
  65  |     await expect(modal.locator('strong:has-text("- R$ 1.000,00")')).toBeVisible();
  66  | 
  67  |     // Fechar modal
  68  |     await modal.locator('button', { hasText: 'Fechar Memória' }).click();
  69  |   });
  70  | 
  71  |   test('Deve processar o pagamento do reembolso de excluído', async ({ page }) => {
  72  |     // Intercepta a rota da API de listagem
  73  |     await page.route('**/api/cotas/canceladas/pendentes-reembolso', async (route) => {
  74  |       const json = {
  75  |         content: [
  76  |           {
  77  |             id: 2,
  78  |             numeroCota: 33,
  79  |             clienteId: 77,
  80  |             clienteNome: 'Maria Excluída',
  81  |             valorBemReferenciaAGO: 200000, 
  82  |             percentualFundoComumPago: 5,   
  83  |             valorHistoricoPago: 10000,      
  84  |             valorBrutoRestituicao: 10000,   
  85  |             valorMultaRestituicao: 1000,    
  86  |             valorLiquidoRestituicao: 9000,  
  87  |           }
  88  |         ]
  89  |       };
  90  |       await route.fulfill({ json });
  91  |     });
  92  | 
  93  |     // Intercepta o POST de pagamento
  94  |     await page.route('**/api/cotas/2/reembolsar', async (route) => {
  95  |       await route.fulfill({ status: 200, json: { valorReembolsado: 9000, reembolsada: true } });
  96  |     });
  97  | 
  98  |     await page.goto('/reembolsos-excluidos');
  99  |     
  100 |     // Clica em Pagar Reembolso
  101 |     await page.click('button[title="Processar quitação bancária"]');
  102 | 
  103 |     // Preenche Modal de Pagamento
  104 |     const modal = page.locator('.modal-backdrop').first();
  105 |     await expect(modal).toBeVisible();
  106 |     
  107 |     await modal.locator('input[placeholder="EX: 341 - Itaú Unibanco"]').fill('341');
  108 |     await modal.locator('input[placeholder="EX: 0910"]').fill('1234');
  109 |     await modal.locator('input[placeholder="EX: 28472-1"]').fill('55555-5');
  110 | 
```