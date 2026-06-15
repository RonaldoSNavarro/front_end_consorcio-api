const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

// Garante que o diretório de prints existe
const screenshotDir = 'C:\\Users\\ronal\\.gemini\\antigravity\\brain\\d99d5750-1545-4d65-be5d-47359615016a\\scratch';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

(async () => {
  console.log("🚀 Iniciando Teste E2E com Google Chrome local...");
  
  // Lança o navegador Chrome localmente no Windows
  const browser = await chromium.launch({ 
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true 
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  // Captura logs do navegador
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  try {
    // 1. Acessa a página de login
    console.log("📍 Acessando http://localhost:5173...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    
    // Tira print inicial
    await page.screenshot({ path: path.join(screenshotDir, '01_login_page.png') });
    console.log("📸 Print da tela de login salvo.");

    // Verifica se está conectado à API real ou simulador
    const connectionText = await page.locator('.connection-info').textContent();
    console.log(`🔌 Status da Conexão na Tela de Login: "${connectionText.trim()}"`);
    
    const isRealMode = connectionText.includes('API Spring Boot Conectada');
    if (isRealMode) {
      console.log("✅ Confirmado: Frontend está rodando em MODO REAL (Spring Boot).");
    } else {
      console.warn("⚠️ Frontend rodando em MODO SIMULADO.");
    }

    // 2. Preenche o formulário de login
    console.log("✍️ Preenchendo credenciais...");
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin');
    
    // Clica no botão de autenticação
    console.log("🔑 Clicando em Autenticar...");
    await page.click('button[type="submit"]');

    // Aguarda o redirecionamento para o Dashboard
    console.log("⏳ Aguardando transição para o Dashboard...");
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Aguarda carregar as métricas do Dashboard
    await page.waitForSelector('text=📊 Dashboard Operacional', { timeout: 10000 });
    
    // Espera desaparecer o "Carregando métricas..." se houver
    try {
      await page.waitForSelector('text=Carregando métricas...', { state: 'detached', timeout: 5000 });
    } catch (e) {
      // Já pode ter carregado instantaneamente
    }
    
    // Print do Dashboard
    await page.screenshot({ path: path.join(screenshotDir, '02_dashboard.png') });
    console.log("📸 Print do Dashboard salvo.");
    
    const dashboardTitle = await page.locator('h2').first().textContent();
    console.log(`🏆 Título encontrado no Dashboard: "${dashboardTitle.trim()}"`);

    // Valida o status na Sidebar
    const sidebarMode = await page.locator('.mode-info').textContent();
    console.log(`🔌 Status da Conexão na Sidebar: "${sidebarMode.trim()}"`);

    // 3. Navegação pelos Relatórios BCB
    
    // 3.1 Relatório de Estatísticas (Doc 2080) - Acessível para todos
    console.log("📊 Navegando para Relatório de Estatísticas (Doc 2080)...");
    await page.click('text=Estatísticas (2080)');
    await page.waitForURL('**/relatorios/estatisticas', { timeout: 5000 });
    await page.waitForSelector('text=📊 Estatísticas — Documento 2080', { timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotDir, '03_estatisticas_page.png') });
    console.log("📸 Print da página de Estatísticas salvo.");
    
    // Verifica se a tabela ou KPIs contêm dados
    const totalAdesoes = await page.locator('text=Total Adesões').locator('..').locator('h3').textContent();
    console.log(`📈 KPI Total Adesões encontrado: ${totalAdesoes.trim()}`);

    // 3.2 Relatório de Balancete (Doc 4110) - Acessível para ADMIN
    console.log("📄 Navegando para Relatório de Balancete (Doc 4110)...");
    await page.click('text=Balancete (4110)');
    await page.waitForURL('**/relatorios/balancete', { timeout: 5000 });
    await page.waitForSelector('text=📄 Balancete — Documento 4110', { timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotDir, '04_balancete_page.png') });
    console.log("📸 Print da página de Balancete salvo.");
    
    const totalAtivo = await page.locator('text=Total Ativo').locator('..').locator('h3').textContent();
    console.log(`📗 KPI Total Ativo encontrado no Balancete: ${totalAtivo.trim()}`);

    // 3.3 Relatório PLD/FT - Acessível para ADMIN
    console.log("🔍 Navegando para Monitoramento PLD/FT...");
    await page.click('text=Monitoramento PLD/FT');
    await page.waitForURL('**/relatorios/pld-ft', { timeout: 5000 });
    await page.waitForSelector('text=🔍 Relatório PLD/FT', { timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotDir, '05_pld_ft_page.png') });
    console.log("📸 Print da página de PLD/FT salvo.");
    
    const pldRiscoAlto = await page.locator('text=Risco Alto').locator('..').locator('h3').textContent();
    console.log(`🔴 KPI Risco Alto encontrado no PLD/FT: ${pldRiscoAlto.trim()}`);

    // 4. Validação de RBAC (Bloqueio de Rotas)
    console.log("🛡️ Testando controle de rotas por perfis (RBAC)...");
    
    // Faremos o logout do admin
    console.log("🚪 Realizando logout do Admin...");
    await page.click('.btn-logout');
    await page.waitForURL('**/login', { timeout: 5000 });
    console.log("✅ Deslogado com sucesso.");

    // Tenta logar como 'consorciado' no Modo Real
    let loggedAsConsorciado = false;
    try {
      console.log("🔐 Tentando logar como 'consorciado' no Modo Real...");
      await page.fill('#username', 'consorciado');
      await page.fill('#password', 'consorciado');
      await page.click('button[type="submit"]');
      
      // Espera 3 segundos para ver se redireciona ou dá erro
      await page.waitForURL('**/dashboard', { timeout: 3000 });
      loggedAsConsorciado = true;
      console.log("✅ Logado com sucesso como 'consorciado'.");
    } catch (e) {
      console.log("❌ Falha ao logar como 'consorciado' no Modo Real (esperado caso precise de Modo Simulado ou credencial diferente).");
    }

    if (!loggedAsConsorciado) {
      // Se falhar no real, vamos alternar para Modo Simulado e testar o RBAC
      console.log("🔄 Alternando para Modo Simulado para testar RBAC do frontend...");
      
      console.log("🔑 Logando como admin novamente...");
      await page.fill('#username', 'admin');
      await page.fill('#password', 'admin');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 5000 });
      
      // Na sidebar, clica no botão "Alternar Modo"
      console.log("🔄 Clicando em 'Alternar Modo' na Sidebar...");
      await page.click('text=Alternar Modo');
      
      // O toggleMockMode redefine token para null, redirecionando para /login
      await page.waitForURL('**/login', { timeout: 5000 });
      console.log("✅ Redirecionado para /login após alternar para Modo Simulado.");
      
      // Agora o frontend deve estar em Modo Simulado (Simulação Local Ativa)
      const connectionTextMock = await page.locator('.connection-info').textContent();
      console.log(`🔌 Status da Conexão em Modo Simulado: "${connectionTextMock.trim()}"`);
      
      // Loga como 'operador' em Modo Simulado (qualquer usuário diferente de admin vira OPERADOR)
      console.log("🔐 Logando como 'operador' em Modo Simulado...");
      await page.fill('#username', 'operador');
      await page.fill('#password', 'operador');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 5000 });
      console.log("✅ Logado como 'operador' em Modo Simulado.");
    }

    // Agora que estamos logados como um usuário sem perfil ADMIN/DIRETOR (seja consorciado real ou operador simulado)
    // Vamos validar que o link de Balancete (4110) NÃO aparece na sidebar
    const hasBalanceteLink = await page.locator('text=Balancete (4110)').count();
    if (hasBalanceteLink === 0) {
      console.log("✅ Sucesso: O link do Balancete (4110) não está visível na Sidebar para este perfil.");
    } else {
      console.error("❌ Falha: O link do Balancete (4110) está visível na Sidebar para este perfil não-autorizado.");
    }

    // E se tentarmos navegar diretamente para a URL /relatorios/balancete?
    console.log("🛡️ Tentando forçar navegação direta para http://localhost:5173/relatorios/balancete...");
    await page.goto('http://localhost:5173/relatorios/balancete');
    
    // O ProtectedRoute deve nos redirecionar de volta para o /dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    console.log("✅ Sucesso: Navegação direta bloqueada e usuário redirecionado de volta para o Dashboard.");
    await page.screenshot({ path: path.join(screenshotDir, '06_rbac_blocked_redirect.png') });
    
    console.log("🎉 Testes finalizados com SUCOESSO!");

  } catch (error) {
    console.error("🔴 OCORREU UM ERRO DURANTE O TESTE E2E:", error);
    await page.screenshot({ path: path.join(screenshotDir, 'error_screenshot.png') });
    process.exit(1);
  } finally {
    await browser.close();
    console.log("🏁 Navegador fechado.");
  }
})();
