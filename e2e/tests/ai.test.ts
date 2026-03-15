import { test, expect } from "@playwright/test";
import { FRONTEND_URL } from "../config/environment";
import { generateUsername } from "./utils/testUtils";

test.describe("AI Generation", () => {
    const validPassword = "Ab12345678";

    let testUsername: string;
    let testEmail: string;

    test.beforeAll(async ({ browser }) => {
        testUsername = generateUsername("ai_user");
        testEmail = `${testUsername}@test.com`
        
        const context = await browser.newContext();
        const page = await context.newPage();
        
        await page.goto(`${FRONTEND_URL}/signup`);
        await page.getByLabel(/correo electrónico/i).fill(testEmail);
        await page.getByLabel(/usuario/i).fill(testUsername);
        await page.getByLabel(/^contraseña/i).fill(validPassword);
        await page.getByLabel(/confirmar contraseña/i).fill(validPassword);
        await page.getByRole("button", { name: /registrarse/i }).click();
        
        await page.waitForURL(/\/verify/, { timeout: 10000 });
        await context.close();
    });

    test.beforeEach(async ({ page }) => {
        await page.goto(`${FRONTEND_URL}/login`);
        await page.getByLabel(/usuario \/ email/i).fill(testUsername);
        await page.getByLabel(/contraseña/i).fill(validPassword);
        await page.getByRole("button", { name: /iniciar sesión/i }).click();
        await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    test("should navigate to AI assistant tab", async ({ page }) => {
        await page.goto(`${FRONTEND_URL}/itineraries/new`);
        
        await expect(page.getByRole("tab", { name: /manual/i })).toHaveAttribute("aria-selected", "true");
        await page.getByRole("tab", { name: /asistente ia/i }).click();
        
        await expect(page.getByRole("heading", { name: /tu asistente de viajes/i })).toBeVisible();
        await expect(page.getByPlaceholder(/escribe tu solicitud aquí/i)).toBeVisible();
    });

    test("should use suggestions to fill prompt", async ({ page }) => {
        await page.goto(`${FRONTEND_URL}/itineraries/new?editorType=ai`);
        
        const suggestionBtn = page.locator("button").filter({
            hasText: /japón|gastronomía|dolomitas|nueva york/i
        }).first();
        await expect(suggestionBtn).toBeVisible();
        
        await suggestionBtn.click();
        
        const textarea = page.getByPlaceholder(/escribe tu solicitud aquí/i);
        await expect(textarea).not.toHaveValue("");
    });

    test("should toggle advanced options", async ({ page }) => {
        await page.goto(`${FRONTEND_URL}/itineraries/new?editorType=ai`);
        
        const toggleBtn = page.getByRole("button", { name: /mostrar opciones avanzadas/i });
        await toggleBtn.click();

        await expect(page.getByText(/duración/i)).toBeVisible();
        await expect(page.getByText(/presupuesto/i)).toBeVisible();
        await expect(page.getByText(/destino/i)).toBeVisible();
        
        await page.getByRole("button", { name: /ocultar opciones avanzadas/i }).click();
        await expect(page.getByText(/duración/i)).not.toBeVisible();
    });

    test("should submit AI generation request", async ({ page }) => {
        await page.goto(`${FRONTEND_URL}/itineraries/new?editorType=ai`);
        
        const prompt = "Un viaje de 3 días a Madrid cultural";
        await page.getByPlaceholder(/escribe tu solicitud aquí/i).fill(prompt);
        
        const generateBtn = page.getByRole("button", { name: /^generar$/i });
        await generateBtn.click();

        // Accept both success and rate-limit outcomes (3 requests/day limit).
        const successNotification = page.getByText(/solicitud recibida/i);
        const rateLimitNotification = page.getByText(/límite diario alcanzado/i);
        await expect(successNotification.or(rateLimitNotification)).toBeVisible({ timeout: 20000 });
    });
});
