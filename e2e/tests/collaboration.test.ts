import { test, expect, type Browser, type Page } from "@playwright/test";

import { FRONTEND_URL } from "../config/environment";
import { generateUniqueString, generateUsername } from "./utils/testUtils";

const PASSWORD = "Ab12345678";

test.describe("Collaborative Flow", () => {
    test.describe.configure({ mode: "serial" });

    const users = {
        owner: { username: "", email: "" },
        editor: { username: "", email: "" },
        declined: { username: "", email: "" },
        leaver: { username: "", email: "" },
    };

    test.beforeAll(async ({ browser }) => {
        users.owner = await createUser(browser, "collab_owner");
        users.editor = await createUser(browser, "collab_editor");
        users.declined = await createUser(browser, "collab_decline");
        users.leaver = await createUser(browser, "collab_leaver");
    });

    test("owner can invite/manage collaborators and collaborator can decline or leave", async ({ browser }) => {
        test.setTimeout(180000);

        const ownerContext = await browser.newContext();
        const editorContext = await browser.newContext();
        const declinedContext = await browser.newContext();
        const leaverContext = await browser.newContext();

        const ownerPage = await ownerContext.newPage();
        const editorPage = await editorContext.newPage();
        const declinedPage = await declinedContext.newPage();
        const leaverPage = await leaverContext.newPage();

        const itineraryTitle = generateUniqueString("Viaje Colaborativo E2E");

        await login(ownerPage, users.owner.username);
        const itineraryId = await createItineraryAndOpenDetail(ownerPage, itineraryTitle);

        await inviteFromOwner(ownerPage, users.editor.username);
        await acceptInvitation(editorPage, users.editor.username, itineraryTitle);

        await expectCollaboratorVisible(ownerPage, itineraryId, users.editor.username, true);
        await changeRole(ownerPage, users.editor.username, /hacer editor/i);
        await expectCollaboratorRole(ownerPage, itineraryId, users.editor.username, /editor/i);

        await removeCollaborator(ownerPage, users.editor.username);
        await expectCollaboratorVisible(ownerPage, itineraryId, users.editor.username, false);

        await inviteFromOwner(ownerPage, users.declined.username);
        await declineInvitation(declinedPage, users.declined.username, itineraryTitle);
        await expectCollaboratorVisible(ownerPage, itineraryId, users.declined.username, false);

        await inviteFromOwner(ownerPage, users.leaver.username);
        await acceptInvitation(leaverPage, users.leaver.username, itineraryTitle);
        await leaveItinerary(leaverPage, users.leaver.username, itineraryId);

        await expectCollaboratorVisible(ownerPage, itineraryId, users.leaver.username, false);

        await ownerContext.close();
        await editorContext.close();
        await declinedContext.close();
        await leaverContext.close();
    });
});

async function createUser(browser: Browser, prefix: string) {
    const username = generateUsername(prefix);
    const email = `${username}@example.com`;

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

    return { username, email };
}

async function login(page: Page, username: string) {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/usuario \/ email/i).fill(username);
    await page.getByLabel(/contrase[ñn]a/i).fill(PASSWORD);
    await page.getByRole("button", { name: /iniciar sesi[oó]n/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

async function createItineraryAndOpenDetail(page: Page, itineraryTitle: string) {
    await page.goto(`${FRONTEND_URL}/itineraries/new`);
    await page.getByLabel(/t[ií]tulo del viaje/i).fill(itineraryTitle);
    await page.getByLabel(/destino/i).fill("Madrid, España");
    await page.getByLabel(/viajeros/i).fill("2");
    await page.getByLabel(/presupuesto/i).fill("1200");
    await page.getByLabel(/fecha de inicio/i).fill("2026-04-05");
    await page.getByLabel(/fecha de fin/i).fill("2026-04-07");

    await page.getByRole("button", { name: /^guardar$/i }).first().click();
    await expect(page).toHaveURL(/\/itineraries/, { timeout: 20000 });

    const card = page.getByText(new RegExp(itineraryTitle, "i")).first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await card.click({ force: true });

    await expect(page).toHaveURL(/\/itineraries\/\d+/, { timeout: 20000 });
    const match = page.url().match(/\/itineraries\/(\d+)/);
    if (!match) throw new Error("Could not determine itinerary id from URL");

    return Number(match[1]);
}

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pageRow(page: Page, username: string) {
    const normalized = escapeRegex(username);
    return page
        .locator("[class*='collaboratorItem']")
        .filter({ hasText: new RegExp(`(?:@)?${normalized}`, "i") })
        .first();
}

async function openCollaborationModal(page: Page) {
    await page.getByRole("button", { name: /gestionar colaboradores/i }).click();
    await expect(page.getByRole("heading", { name: /colaboradores/i })).toBeVisible({ timeout: 10000 });
}

async function inviteFromOwner(ownerPage: Page, username: string) {
    await openCollaborationModal(ownerPage);

    await ownerPage.getByLabel(/nombre de usuario para invitar/i).fill(username);
    await Promise.all([
        ownerPage.waitForResponse((resp) => {
            return resp.url().includes("/collaborators")
                && resp.request().method() === "POST"
                && resp.status() < 400;
        }),
        ownerPage.getByRole("button", { name: /enviar invitaci[oó]n/i }).click(),
    ]);

    await expect(pageRow(ownerPage, username)).toBeVisible({ timeout: 10000 });
    await ownerPage.getByRole("button", { name: /cerrar modal/i }).click();
}

async function acceptInvitation(page: Page, username: string, itineraryTitle: string) {
    await login(page, username);
    await page.goto(`${FRONTEND_URL}/dashboard/notifications`);

    await expect(page.getByRole("heading", { name: /notificaciones/i })).toBeVisible({ timeout: 15000 });

    const invitationCard = page.locator('[class*="card"]').filter({ hasText: new RegExp(itineraryTitle, "i") }).first();
    await expect(invitationCard).toBeVisible({ timeout: 20000 });

    await Promise.all([
        page.waitForResponse((resp) => {
            return resp.url().includes("/accept")
                && resp.request().method() === "PUT"
                && resp.status() < 400;
        }),
        invitationCard.getByRole("button", { name: /aceptar invitaci[oó]n/i }).click(),
    ]);

    await expect(invitationCard).toHaveCount(0);
}

async function declineInvitation(page: Page, username: string, itineraryTitle: string) {
    await login(page, username);
    await page.goto(`${FRONTEND_URL}/dashboard/notifications`);

    await expect(page.getByRole("heading", { name: /notificaciones/i })).toBeVisible({ timeout: 15000 });

    const invitationCard = page.locator('[class*="card"]').filter({ hasText: new RegExp(itineraryTitle, "i") }).first();
    await expect(invitationCard).toBeVisible({ timeout: 20000 });

    await Promise.all([
        page.waitForResponse((resp) => {
            return resp.url().includes("/decline")
                && resp.request().method() === "DELETE"
                && resp.status() < 400;
        }),
        invitationCard.getByRole("button", { name: /rechazar invitaci[oó]n/i }).click(),
    ]);

    await expect(invitationCard).toHaveCount(0);
}

async function changeRole(ownerPage: Page, username: string, actionLabel: RegExp) {
    await openCollaborationModal(ownerPage);

    const collaboratorRow = pageRow(ownerPage, username);
    await expect(collaboratorRow).toBeVisible({ timeout: 10000 });

    const contextMenuTrigger = collaboratorRow.locator("button:not([disabled])").first();
    await expect(contextMenuTrigger).toBeVisible({ timeout: 10000 });
    await contextMenuTrigger.click({ force: true });
    await expect(ownerPage.getByRole("menuitem", { name: actionLabel })).toBeVisible({ timeout: 10000 });

    await Promise.all([
        ownerPage.waitForResponse((resp) => {
            return /\/api\/v1\/itineraries\/\d+\/collaborators\//.test(resp.url())
                && !resp.url().includes("accept")
                && resp.request().method() === "PUT"
                && resp.status() < 400;
        }),
        ownerPage.getByRole("menuitem", { name: actionLabel }).click(),
    ]);

    await ownerPage.getByRole("button", { name: /cerrar modal/i }).click();
}

async function removeCollaborator(ownerPage: Page, username: string) {
    await openCollaborationModal(ownerPage);

    const collaboratorRow = pageRow(ownerPage, username);
    await expect(collaboratorRow).toBeVisible({ timeout: 10000 });

    const contextMenuTrigger = collaboratorRow.locator("button:not([disabled])").first();
    await expect(contextMenuTrigger).toBeVisible({ timeout: 10000 });
    await contextMenuTrigger.click({ force: true });
    await expect(ownerPage.getByRole("menuitem", { name: /eliminar/i })).toBeVisible({ timeout: 10000 });

    await Promise.all([
        ownerPage.waitForResponse((resp) => {
            return /\/api\/v1\/itineraries\/\d+\/collaborators\//.test(resp.url())
                && !resp.url().includes("decline")
                && resp.request().method() === "DELETE"
                && resp.status() < 400;
        }),
        ownerPage.getByRole("menuitem", { name: /eliminar/i }).click(),
    ]);

    await ownerPage.getByRole("button", { name: /cerrar modal/i }).click();
}

async function expectCollaboratorRole(ownerPage: Page, itineraryId: number, username: string, rolePattern: RegExp) {
    await ownerPage.goto(`${FRONTEND_URL}/itineraries/${itineraryId}`);
    await expect(ownerPage).toHaveURL(new RegExp(`/itineraries/${itineraryId}`), { timeout: 15000 });

    await openCollaborationModal(ownerPage);
    const row = pageRow(ownerPage, username);
    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(row).toContainText(rolePattern);
    await ownerPage.getByRole("button", { name: /cerrar modal/i }).click();
}

async function leaveItinerary(page: Page, username: string, itineraryId: number) {
    await page.goto(`${FRONTEND_URL}/itineraries/${itineraryId}`);
    await expect(page).toHaveURL(new RegExp(`/itineraries/${itineraryId}`), { timeout: 15000 });

    await openCollaborationModal(page);

    await Promise.all([
        page.waitForResponse((resp) => {
            return resp.url().includes(`/api/v1/itineraries/${itineraryId}/collaborators/${username}`)
                && resp.request().method() === "DELETE"
                && resp.status() < 400;
        }),
        page.getByRole("button", { name: /abandonar itinerario/i }).click(),
    ]);

    await expect(page).toHaveURL(/\/itineraries/, { timeout: 15000 });
}

async function expectCollaboratorVisible(ownerPage: Page, itineraryId: number, username: string, shouldBeVisible: boolean) {
    await ownerPage.goto(`${FRONTEND_URL}/itineraries/${itineraryId}`);
    await expect(ownerPage).toHaveURL(new RegExp(`/itineraries/${itineraryId}`), { timeout: 15000 });

    await openCollaborationModal(ownerPage);
    const row = pageRow(ownerPage, username);

    if (shouldBeVisible) {
        await expect(row).toBeVisible({ timeout: 10000 });
    } else {
        await expect(row).toHaveCount(0);
    }

    await ownerPage.getByRole("button", { name: /cerrar modal/i }).click();
}
