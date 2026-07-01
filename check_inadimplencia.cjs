const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const screenshotDir = 'C:\\Users\\ronal\\.gemini\\antigravity\\brain\\c926dc8c-a2fa-4db6-9e20-86d259f3fc97\\scratch';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

const log = (msg) => {
  console.log(`[QA AGENT] ${new Date().toLocaleTimeString()} - ${msg}`);
};

(async () => {
  let executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(executablePath)) {
      executablePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
    executablePath: fs.existsSync(executablePath) ? executablePath : undefined
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    // LOGIN
    log("Acessando http://localhost:5173...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    log("Login efetuado.");

    // TESTE STATUS EXCLUIDA/EM_EXECUCAO
    log("Acessando tela de Cotas...");
    await page.click('text=Cotas');
    await page.waitForURL('**/cotas', { timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotDir, 'cotas_status.png') });
    log("Tirou print da tela de cotas.");

    const bodyText = await page.innerText('body');
    const hasExcluida = bodyText.includes('EXCLUIDA');
    const hasEmExecucao = bodyText.includes('EM_EXECUCAO');
    log(`Encontrou EXCLUIDA: ${hasExcluida}, Encontrou EM_EXECUCAO: ${hasEmExecucao}`);

    // TESTE FINANCEIRO ATRASADA
    log("Acessando tela Financeiro...");
    await page.click('text=Amortização / Parcelas');
    await page.waitForURL('**/financeiro', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Select first available cota
    const selectOptions = await page.$$eval('#select-cota option', opts => opts.map(o => o.value).filter(v => v));
    if(selectOptions.length > 0) {
        // Let's iterate and find one with ATRASADA if possible
        for(let cotaId of selectOptions) {
            await page.selectOption('#select-cota', cotaId);
            await page.waitForTimeout(1000);
            const finText = await page.innerText('body');
            if(finText.includes('ATRASADA')) {
                log(`Cota ${cotaId} tem parcela ATRASADA.`);
                await page.screenshot({ path: path.join(screenshotDir, `financeiro_cota_${cotaId}.png`) });
                break;
            }
        }
    }
    
    log("Verificação concluída.");
  } catch (err) {
    log(`Erro: ${err.message}`);
    await page.screenshot({ path: path.join(screenshotDir, 'error_inadimplencia.png') });
  } finally {
    await browser.close();
  }
})();
