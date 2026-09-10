import { chromium } from "playwright";
import fs from "fs";

const BASE = process.env.BASE || "http://localhost:3000";
const OUT = "C:/felipe/proyectos/citasbarber/.review";
fs.mkdirSync(OUT, { recursive: true });

const viewports = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 }, // iPhone 12/13/14
};

async function getBarberId() {
  const res = await fetch(`${BASE}/api/barberos`);
  const d = await res.json();
  const b = d.barberos.find((x) => x.local.includes("770")) || d.barberos[0];
  return b.id;
}

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log("shot:", name);
}

async function flujo(browser, vpName, vp, barberId) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  // Landing
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await shot(page, `${vpName}-1-landing`);

  // Agendar
  await page.goto(`${BASE}/agendar/${barberId}`, { waitUntil: "networkidle" });
  await shot(page, `${vpName}-2-datos`);

  // Paso 1: datos
  await page.fill('input[placeholder="Ej: Juan Pérez"]', "Nuevo Usuario");
  await page.fill('input[placeholder="Ej: 3001234567"]', "3009998877");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForTimeout(400);
  await shot(page, `${vpName}-3-plan`);

  // Paso 2: elegir plan (Plata para ver método de pago + anticipo después)
  await page.getByText("Plata", { exact: true }).first().click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: /Continuar/ }).click();
  await page.waitForTimeout(3000); // auto-búsqueda de primer día + cargar slots
  await shot(page, `${vpName}-4-horario`);

  // Seleccionar una hora (formato 12h: "2:00 pm")
  const slot = page.locator("button", { hasText: /\d{1,2}:\d{2}\s(am|pm)/ }).first();
  if (await slot.count()) {
    await slot.click();
    await page.waitForTimeout(200);
    await shot(page, `${vpName}-5-horario-seleccionado`);
    await page.getByRole("button", { name: /Continuar/ }).click();
    await page.waitForTimeout(600);
    await shot(page, `${vpName}-6-pago`);
  }

  await ctx.close();
}

const browser = await chromium.launch();
const barberId = await getBarberId();
console.log("Barbero:", barberId);
for (const [name, vp] of Object.entries(viewports)) {
  await flujo(browser, name, vp, barberId);
}
await browser.close();
console.log("LISTO");
