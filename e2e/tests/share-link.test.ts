import { test, expect, type Browser, type Page } from "@playwright/test";

import { FRONTEND_URL } from "../config/environment";
import { generateUniqueString, generateUsername } from "./utils/testUtils";

const PASSWORD = "Ab12345678";

test.describe("Share Link Lifecycle", () => {
    test.describe.configure({ mode: "serial" });

    const owner = { username: "", email: "" };

    test.beforeAll(async ({ browser }) => {
        owner.username = generateUsername("share_owner");
        owner.email = `${owner.username}@example.com`;
        await createUser(browser, owner.username, owner.email);
    });

    test("owner can generate, consume and revoke a share link", async ({ browser }) => {
        test.setTimeout(180000);

        const ownerContext = await browser.newContext();
        const ownerPage = await ownerContext.newPage();

        const itineraryTitle = generateUniqueString("Share Link E2E");
        const itineraryPlace = generateUniqueString("Lisboa");

        await login(ownerPage, owner.username);
        await createItineraryAndOpenDetail(ownerPage, itineraryTitle, itineraryPlace);

        await ownerPage.getByRole("button", { name: /gestionar colaboradores/i }).click();
        await expect(ownerPage.getByRole("heading", { name: /colaboradores/i })).toBeVisible({ timeout: 10000 });

        await Promise.all([
            ownerPage.waitForResponse((resp) => {
                return /\/api\/v1\/itineraries\/\d+\/share-links/.test(resp.url())
                    && resp.request().method() === "POST"
                    && resp.status() < 400;
            }),
            ownerPage.getByRole("button", { name: /generar enlace/i }).click(),
        ]);

        const shareUrlElement = ownerPage.locator("[class*='shareUrl']").first();
        await expect(shareUrlElement).toBeVisible({ timeout: 10000 });

        const shareUrl = (await shareUrlElement.textContent())?.trim() || "";
        expect(shareUrl).toMatch(/\/share\/[A-Za-z0-9]+$/);

        const sharedContext = await browser.newContext();
        const sharedPage = await sharedContext.newPage();

        await sharedPage.goto(shareUrl);
        await expect(sharedPage).toHaveURL(/\/share\/[A-Za-z0-9]+$/, { timeout: 15000 });
        await expect(sharedPage.getByText(new RegExp(itineraryPlace, "i")).first()).toBeVisible({ timeout: 15000 });
        await expect(sharedPage.getByRole("button", { name: /gestionar colaboradores/i })).toHaveCount(0);

        await sharedContext.close();

        await Promise.all([
            ownerPage.waitForResponse((resp) => {
                return /\/api\/v1\/itineraries\/\d+\/share-links\/\d+/.test(resp.url())
                    && resp.request().method() === "DELETE"
                    && resp.status() < 400;
            }),
            ownerPage.getByRole("button", { name: /revocar enlace compartido/i }).first().click(),
        ]);

        const revokedContext = await browser.newContext();
        const revokedPage = await revokedContext.newPage();

        await revokedPage.goto(shareUrl);
        await expect(revokedPage).toHaveURL(new RegExp(`${FRONTEND_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?$`), {
            timeout: 15000,
        });

        await revokedContext.close();
        await ownerContext.close();
    });
});

async function createUser(browser: Browser, username: string, email: string) {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${FRONTEND_URL}/signup`);
    await page.getByLabel(/correo electr[oó]nico/i).fill(email);
    await page.getByLabel(/usuario/i).fill(username);
    await page.getByLabel(/^contrase[ñn]a/i).fill(PASSWORD);
    await page.getByLabel(/confirmar contrase[ñn]a/i).fill(PASSWORD);
    await page.getByRole("button", { name: /registrarse/i }).click();

    await page.waitForURL(/\/verify/, { timeout: 15000 });
    await context.close();
}

async function login(page: Page, username: string) {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/usuario \/ email/i).fill(username);
    await page.getByLabel(/contrase[ñn]a/i).fill(PASSWORD);
    await page.getByRole("button", { name: /iniciar sesi[oó]n/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

async function createItineraryAndOpenDetail(page: Page, title: string, place: string) {
    await page.goto(`${FRONTEND_URL}/itineraries/new`);
    await page.getByLabel(/t[ií]tulo del viaje/i).fill(title);
    await page.getByLabel(/destino/i).fill(place);
    await page.getByLabel(/viajeros/i).fill("2");
    await page.getByLabel(/presupuesto/i).fill("1400");
    await page.getByLabel(/fecha de inicio/i).fill("2026-04-05");
    await page.getByLabel(/fecha de fin/i).fill("2026-04-06");

    await page.getByRole("button", { name: /^guardar$/i }).first().click();
    await expect(page).toHaveURL(/\/itineraries/, { timeout: 20000 });

    const card = page.getByText(new RegExp(title, "i")).first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await card.click({ force: true });

    await expect(page).toHaveURL(/\/itineraries\/\d+/, { timeout: 20000 });
}
