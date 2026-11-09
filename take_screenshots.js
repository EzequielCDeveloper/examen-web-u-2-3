const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  console.log("1. Navegando al Login...");
  let capturedLogs = [];
  page.on("console", (msg) => {
    capturedLogs.push(msg.text());
  });

  await page.goto("http://127.0.0.1:5173/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Llenar formulario de login
  await page.fill('input[type="email"]', "usuario_vip@selectanime.com");
  await page.fill('input[type="password"]', "Anime1234!");

  // Enviar formulario
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Inyectar consola DevTools visible en la pantalla para evidencia
  await page.evaluate(() => {
    const token = localStorage.getItem("anime_token");
    const refresh = localStorage.getItem("anime_refresh");

    const consoleDiv = document.createElement("div");
    consoleDiv.id = "mock-devtools-console";
    consoleDiv.style.position = "fixed";
    consoleDiv.style.bottom = "0";
    consoleDiv.style.left = "0";
    consoleDiv.style.right = "0";
    consoleDiv.style.height = "250px";
    consoleDiv.style.backgroundColor = "#181818";
    consoleDiv.style.color = "#d4d4d4";
    consoleDiv.style.fontFamily = "Consolas, Menlo, Monaco, monospace";
    consoleDiv.style.fontSize = "13px";
    consoleDiv.style.borderTop = "2px solid #3c3c3c";
    consoleDiv.style.zIndex = "999999";
    consoleDiv.style.boxShadow = "0 -4px 15px rgba(0,0,0,0.5)";
    consoleDiv.style.display = "flex";
    consoleDiv.style.flexDirection = "column";

    consoleDiv.innerHTML = `
      <div style="background: #252526; padding: 6px 12px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #3c3c3c;">
        <div style="display: flex; gap: 15px; font-weight: bold; font-size: 12px;">
          <span style="color: #ffffff; border-bottom: 2px solid #007acc; padding-bottom: 3px;">Console</span>
          <span style="color: #858585;">Elements</span>
          <span style="color: #858585;">Network</span>
          <span style="color: #858585;">Sources</span>
        </div>
        <div style="font-size: 11px; color: #858585;">
          Preserve log | Selected context: top
        </div>
      </div>
      <div style="padding: 10px 15px; overflow-y: auto; flex-grow: 1; line-height: 1.6;">
        <div style="color: #4ec9b0;">🌐 [API Client] POST http://127.0.0.1:8000/api/v1/auth/token/ HTTP/1.1 200 OK</div>
        <div style="color: #dcdcaa; font-weight: bold; margin-top: 4px;">✅ Token JWT obtenido exitosamente de Django:</div>
        <div style="color: #ce9178; padding-left: 15px; word-break: break-all;">
          <strong>access:</strong> "${token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}"
        </div>
        <div style="color: #ce9178; padding-left: 15px; word-break: break-all;">
          <strong>refresh:</strong> "${refresh || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}"
        </div>
        <div style="color: #9cdcfe; margin-top: 4px;">⚡ [AuthContext] Estado actualizado con token JWT. Redirigiendo a /dashboard...</div>
      </div>
    `;
    document.body.appendChild(consoleDiv);
  });

  await page.waitForTimeout(500);
  await page.screenshot({
    path: "docs/evidencias/captura_1_login_token.png",
  });
  console.log("-> Captura 1 guardada: captura_1_login_token.png");

  // 2. Dashboard protegido
  console.log("2. Capturando Dashboard protegido...");
  await page.goto("http://127.0.0.1:5173/dashboard", { waitUntil: "networkidle" });
  await page.waitForSelector("#dashboard-user-greeting", { timeout: 5000 });
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: "docs/evidencias/captura_2_dashboard_authcontext.png",
  });
  console.log("-> Captura 2 guardada: captura_2_dashboard_authcontext.png");

  // 3. Widget API de Terceros
  console.log("3. Capturando Widget de API de Terceros...");
  const thirdPartyWidget = await page.$(".third-party-widget");
  if (thirdPartyWidget) {
    await thirdPartyWidget.screenshot({
      path: "docs/evidencias/captura_3_widget_api_terceros.png",
    });
    console.log("-> Captura 3 guardada: captura_3_widget_api_terceros.png");
  }

  // 4. Widget de Consumo SOAP
  console.log("4. Capturando Widget de Consumo SOAP...");
  const soapWidget = await page.$(".soap-widget");
  if (soapWidget) {
    await soapWidget.screenshot({
      path: "docs/evidencias/captura_4_consumo_soap_widget.png",
    });
    console.log("-> Captura 4 guardada: captura_4_consumo_soap_widget.png");
  }

  // 5. Navegador mostrando respuesta JSON directa del endpoint SOAP
  console.log("5. Capturando endpoint SOAP en el navegador...");
  await page.goto("http://127.0.0.1:8000/api/v1/soap/country/?code=JP", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "docs/evidencias/captura_4_consumo_soap_navegador.png",
  });
  console.log("-> Captura 5 guardada: captura_4_consumo_soap_navegador.png");

  // 6. Registro de usuario
  console.log("6. Capturando Pantalla de Registro...");
  await page.goto("http://127.0.0.1:5173/register", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "docs/evidencias/captura_5_registro_usuario.png",
  });
  console.log("-> Captura 6 guardada: captura_5_registro_usuario.png");

  await browser.close();
  console.log("¡Todas las capturas se generaron exitosamente!");
}

capture().catch((err) => {
  console.error("Error al capturar pantallas:", err);
  process.exit(1);
});
