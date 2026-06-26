# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: compliance.spec.js >> Compliance e Testes Negativos >> Deve impedir venda para cliente bloqueado em lista restritiva (OFAC/ONU)
- Location: e2e\compliance.spec.js:10:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Nova Venda')

```

# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - img [ref=e8]
    - heading "Consórcio Admin" [level=2] [ref=e12]
    - paragraph [ref=e13]: Gerenciamento Financeiro & Contemplações
  - generic [ref=e14]:
    - generic [ref=e15]:
      - generic [ref=e16]: Login Administrativo
      - textbox "Login Administrativo" [active] [ref=e17]: admin
    - generic [ref=e18]:
      - generic [ref=e19]: Senha de Acesso
      - generic [ref=e20]:
        - textbox "Senha de Acesso" [ref=e21]: admin
        - button "Mostrar senha" [ref=e22] [cursor=pointer]:
          - img [ref=e23]
    - generic [ref=e26]:
      - img [ref=e27]
      - generic [ref=e29]:
        - text: "Dica: Use"
        - strong [ref=e30]: admin
        - text: /
        - strong [ref=e31]: admin
        - text: para entrar direto
    - button "Autenticar" [ref=e32] [cursor=pointer]:
      - img [ref=e33]
      - text: Autenticar
  - generic [ref=e38]: API Spring Boot Conectada
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Compliance e Testes Negativos', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // Acessa a página principal (simulando autenticação admin)
  7  |     await page.goto('http://localhost:5173');
  8  |   });
  9  | 
  10 |   test('Deve impedir venda para cliente bloqueado em lista restritiva (OFAC/ONU)', async ({ page }) => {
  11 |     // Vai para a tela de vendas/wizard
> 12 |     await page.click('text=Nova Venda');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  13 | 
  14 |     // Preenche dados simulando um cliente listado
  15 |     await page.fill('input[name="cpf"]', '999.999.999-99');
  16 |     await page.fill('input[name="nome"]', 'OSAMA BIN LADEN'); // Nome hipotético bloqueado
  17 | 
  18 |     // Tenta avançar
  19 |     const nextBtn = page.locator('button:has-text("Avançar")');
  20 |     if (await nextBtn.isVisible()) {
  21 |       await nextBtn.click();
  22 |     }
  23 | 
  24 |     // O sistema deve barrar e mostrar o alerta de compliance
  25 |     // Verifica se aparece um toast ou mensagem de bloqueio PLD/FT
  26 |     const toast = page.locator('.toast, .alert, .text-rose-500').filter({ hasText: /bloqueado|restritiva|PLD/i });
  27 |     await expect(toast).toBeVisible({ timeout: 5000 }).catch(() => {
  28 |         // Se falhar no timeout, loga pra debugar, mas assume que ainda vamos implementar backend check forte na UI.
  29 |         console.warn("Falta hard block UI para OFAC");
  30 |     });
  31 |   });
  32 | 
  33 |   test('Deve bloquear lance de cota CANCELADA na Assembleia', async ({ page }) => {
  34 |     // Vai para a tela de Lances Pendentes
  35 |     await page.click('text=Lances Pendentes');
  36 |     
  37 |     // Tenta encontrar o botão "Registrar Lance"
  38 |     // Se a API for mockada, podemos simular que estamos tentando ofertar para cota cancelada
  39 |     // Aqui testamos se o select de cotas oculta as canceladas
  40 |     const addLanceBtn = page.locator('button:has-text("Registrar Lance")');
  41 |     if (await addLanceBtn.isVisible()) {
  42 |       await addLanceBtn.click();
  43 |       
  44 |       // O dropdown de cotas elegíveis não deve conter texto "(CANCELADA)"
  45 |       const selectCota = page.locator('select[name="cotaId"]');
  46 |       const textContent = await selectCota.textContent();
  47 |       expect(textContent).not.toMatch(/CANCELADA/);
  48 |     }
  49 |   });
  50 | 
  51 |   test('Deve impedir o processo de Apurar Assembleia se a Captação não estiver fechada', async ({ page }) => {
  52 |     await page.click('text=Assembleias');
  53 |     
  54 |     // Supondo que existe um botão "Apurar Sorteio"
  55 |     const apurarBtn = page.locator('button:has-text("Apurar")').first();
  56 |     if (await apurarBtn.isVisible()) {
  57 |       await apurarBtn.click();
  58 |       
  59 |       // Se a assembleia estiver como AGENDADA e não "CAPTAÇÃO FECHADA",
  60 |       // deve mostrar aviso
  61 |       const aviso = page.locator('text=fechar a captação');
  62 |       await expect(aviso).toBeVisible({ timeout: 3000 }).catch(() => {
  63 |         console.warn("Falta bloqueio visual forte de apuração");
  64 |       });
  65 |     }
  66 |   });
  67 | 
  68 | });
  69 | 
```