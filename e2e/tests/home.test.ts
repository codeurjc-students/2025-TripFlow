import { test, expect } from '@playwright/test';
import { FRONTEND_URL } from "../config/environment";

test.describe('Home Page Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(FRONTEND_URL);
    });

    test("should render main sections", async ({ page }) => {
        await expect(page.getByText("Planifica tus viajes del futuro")).toBeVisible();
        await expect(page.getByText("¿Por qué TripFlow?")).toBeVisible();
        await expect(page.getByText("Instala TripFlow en tu Móvil")).toBeVisible();
        await expect(page.getByText("Preguntas Frecuentes")).toBeVisible();
        await expect(page.getByText(/Empieza a planificar un viaje/i)).toBeVisible();
    });

    test("should navigate to login page", async ({ page }) => {
        await page.getByRole("link", { name: /acceder/i }).click();
        await expect(page).toHaveURL(/\/login/);
    });

    test("should navigate to signup page", async ({ page }) => {
        await page.getByRole("link", { name: /comenzar ahora/i }).click();
        await expect(page).toHaveURL(/\/signup/);
    });

    test("should toggle demo mode", async ({ page }) => {
        // Activate demo mode
        const demoButton = page.getByRole("button", { name: /probar demo/i }).first();
        await demoButton.click();
        await expect(page).toHaveURL(/\/dashboard/);
        
        // Go back to home
        await page.goto(FRONTEND_URL);
        
        // Verify exit demo button
        const exitDemoButton = page.getByRole("button", { name: /abandonar demo/i }).first();
        await expect(exitDemoButton).toBeVisible();
        
        // Deactivate demo mode
        await exitDemoButton.click();
        
        // Verify that the original button returns
        await expect(demoButton).toBeVisible();
    });
});
