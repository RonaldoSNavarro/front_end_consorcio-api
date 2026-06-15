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
    let connectionText = await page.locator('.connection-info').textContent();
    console.log(`🔌 Status da Conexão na Tela de Login: "${connectionText.trim()}"`);
    
    let isRealMode = connectionText.includes('API Spring Boot Conectada');
    
    if (!isRealMode) {
      console.warn("⚠️ Inicializado em MODO SIMULADO. Entrando como admin para alternar para MODO REAL...");
      // Loga como admin no simulado para alternar
      await page.fill('#username', 'admin');
      await page.fill('#password', 'admin');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      console.log("🔄 Clicando em 'Alternar Modo' para ativar MODO REAL...");
      await page.click('text=Alternar Modo');
      await page.waitForURL('**/login', { timeout: 10000 });
      
      // Re-verifica
      connectionText = await page.locator('.connection-info').textContent();
      isRealMode = connectionText.includes('API Spring Boot Conectada');
      console.log(`🔌 Status da Conexão após alternar: "${connectionText.trim()}"`);
    }

    if (!isRealMode) {
      throw new Error("Não foi possível ativar o Modo Real (Spring Boot). O backend está rodando?");
    }

    console.log("✅ Confirmado: Executando testes principais em MODO REAL (Spring Boot).");

    // 2. Preenche o formulário de login em Modo Real
    console.log("✍️ Preenchendo credenciais do Admin no Modo Real...");
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin');
    await page.click('button[type="submit"]');

    // Aguarda o redirecionamento para o Dashboard
    console.log("⏳ Aguardando transição para o Dashboard...");
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForSelector('text=📊 Dashboard Operacional', { timeout: 10000 });
    
    // Espera desaparecer o "Carregando métricas..." se houver
    try {
      await page.waitForSelector('text=Carregando métricas...', { state: 'detached', timeout: 5000 });
    } catch (e) {}
    
    // Print do Dashboard
    await page.screenshot({ path: path.join(screenshotDir, '02_dashboard.png') });
    console.log("📸 Print do Dashboard salvo.");
    
    const dashboardTitle = await page.locator('h2').first().textContent();
    console.log(`🏆 Título encontrado no Dashboard: "${dashboardTitle.trim()}"`);

    // Valida o status na Sidebar
    const sidebarMode = await page.locator('.mode-info').textContent();
    console.log(`🔌 Status da Conexão na Sidebar: "${sidebarMode.trim()}"`);

    // 3. Navegação pelos Relatórios BCB em Modo Real
    
    // 3.1 Relatório de Estatísticas (Doc 2080) - Acessível para todos
    console.log("📊 Navegando para Relatório de Estatísticas (Doc 2080)...");
    await page.click('text=Estatísticas (2080)');
    await page.waitForURL('**/relatorios/estatisticas', { timeout: 5000 });
    await page.waitForSelector('text=📊 Estatísticas — Documento 2080', { timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotDir, '03_estatisticas_page.png') });
    console.log("📸 Print da página de Estatísticas salvo.");
    
    // Verifica se a tabela ou KPIs contêm dados
    const totalAdesoes = await page.locator('text=Total Adesões').locator('..').locator('h3').textContent();
    console.log(`📈 KPI Total Adesões encontrado em Modo Real: ${totalAdesoes.trim()}`);

    // 3.2 Relatório de Balancete (Doc 4110) - Acessível para ADMIN
    console.log("📄 Navegando para Relatório de Balancete (Doc 4110)...");
    await page.click('text=Balancete (4110)');
    await page.waitForURL('**/relatorios/balancete', { timeout: 5000 });
    await page.waitForSelector('text=📄 Balancete — Documento 4110', { timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotDir, '04_balancete_page.png') });
    console.log("📸 Print da página de Balancete salvo.");
    
    const totalAtivo = await page.locator('text=Total Ativo').locator('..').locator('h3').textContent();
    console.log(`📗 KPI Total Ativo encontrado no Balancete em Modo Real: ${totalAtivo.trim()}`);

    // 3.3 Relatório PLD/FT - Acessível para ADMIN
    console.log("🔍 Navegando para Monitoramento PLD/FT...");
    await page.click('text=Monitoramento PLD/FT');
    await page.waitForURL('**/relatorios/pld-ft', { timeout: 5000 });
    await page.waitForSelector('text=🔍 Relatório PLD/FT', { timeout: 5000 });
    await page.screenshot({ path: path.join(screenshotDir, '05_pld_ft_page.png') });
    console.log("📸 Print da página de PLD/FT salvo.");
    
    const pldRiscoAlto = await page.locator('text=Risco Alto').locator('..').locator('h3').textContent();
    console.log(`🔴 KPI Risco Alto encontrado no PLD/FT em Modo Real: ${pldRiscoAlto.trim()}`);

    // 4. Validação de RBAC (Bloqueio de Rotas) em Modo Simulado
    console.log("🛡️ Testando controle de rotas por perfis (RBAC)...");
    
    // Voltamos para o Dashboard
    console.log("📊 Voltando ao Dashboard...");
    await page.click('text=Visão Geral');
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    
    // Configura interceptação de rede a partir deste momento para simular backend offline
    console.log("🛡️ Ativando interceptor de rede para forçar Modo Simulado offline...");
    await page.route('**/api/**', route => {
      console.log(`[NETWORK INTERCEPT] Bloqueando chamada para: ${route.request().url()}`);
      return route.abort('failed');
    });

    console.log("🔄 Clicando em 'Alternar Modo' para ativar MODO SIMULADO...");
    await page.click('text=Alternar Modo');
    await page.waitForURL('**/login', { timeout: 10000 });
    
    const connectionTextMock = await page.locator('.connection-info').textContent();
    console.log(`🔌 Status da Conexão após alternar para Simulado: "${connectionTextMock.trim()}"`);
    if (!connectionTextMock.includes('Simulação Local Ativa')) {
      throw new Error("Falha ao colocar o frontend em Modo Simulado!");
    }

    // Loga como 'operador' no Modo Simulado (senha 'admin')
    console.log("🔐 Logando como 'operador' em Modo Simulado...");
    await page.fill('#username', 'operador');
    await page.fill('#password', 'admin'); // senha aceita pelo mockDb agora é 'admin'
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForSelector('text=📊 Dashboard Operacional', { timeout: 10000 });
    console.log("✅ Logado como 'operador' em Modo Simulado.");

    // Validamos que o link de Balancete (4110) NÃO aparece na sidebar
    const hasBalanceteLink = await page.locator('text=Balancete (4110)').count();
    if (hasBalanceteLink === 0) {
      console.log("✅ Sucesso: O link do Balancete (4110) não está visível na Sidebar para o perfil OPERADOR.");
    } else {
      console.error("❌ Falha: O link do Balancete (4110) está visível na Sidebar para o perfil OPERADOR.");
    }

    // E se tentarmos navegar diretamente para a URL /relatorios/balancete?
    console.log("🛡️ Tentando forçar navegação direta para http://localhost:5173/relatorios/balancete...");
    await page.goto('http://localhost:5173/relatorios/balancete');
    
    // O ProtectedRoute deve nos redirecionar de volta para o /dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    console.log("✅ Sucesso: Navegação direta bloqueada e usuário redirecionado de volta para o Dashboard.");
    await page.screenshot({ path: path.join(screenshotDir, '06_rbac_blocked_redirect.png') });
    
    console.log("🎉 Testes finalizados com SUCESSO!");

  } catch (error) {
    console.error("🔴 OCORREU UM ERRO DURANTE O TESTE E2E:", error);
    await page.screenshot({ path: path.join(screenshotDir, 'error_screenshot.png') });
    process.exit(1);
  } finally {
    await browser.close();
    console.log("🏁 Navegador fechado.");
  }
})();
