// Snapshot public routes to static HTML so crawlers get content, not the SPA shell.
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
// Content pages only; prerendering auth forms drops values typed before hydration.
const ROUTES = ["/", "/help", "/privacy"];
const PORT = 4183;

const MIME = {
    ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
    ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp",
    ".ico": "image/x-icon", ".json": "application/json",
    ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
};

const server = createServer(async (req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const candidate = join(DIST, url);
    const file = extname(url) && existsSync(candidate) ? candidate : join(DIST, "index.html");
    try {
        const body = await readFile(file);
        res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
        res.end(body);
    } catch {
        res.writeHead(404).end("not found");
    }
});

const execPath = process.env.PUPPETEER_EXECUTABLE_PATH;
const launchOpts = execPath
    ? { executablePath: execPath, args: ["--no-sandbox", "--disable-setuid-sandbox"] }
    : { channel: "chrome", args: ["--no-sandbox", "--disable-setuid-sandbox"] };

await new Promise((r) => server.listen(PORT, r));
let browser;
try {
    browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();
    // Suppress the install prompt so snapshots show the baseline UI, not the install button.
    await page.evaluateOnNewDocument(() => {
        window.addEventListener(
            "beforeinstallprompt",
            (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
            },
            true,
        );
    });
    for (const route of ROUTES) {
        await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "domcontentloaded" });
        // Canonical matches the path only after the page mounted and useSeo ran.
        await page.waitForFunction(
            () => {
                const c = document.querySelector('link[rel="canonical"]');
                return c && new URL(c.href).pathname === location.pathname;
            },
            { timeout: 20000 }
        );
        const html = await page.content();
        const outDir = route === "/" ? DIST : join(DIST, route);
        await mkdir(outDir, { recursive: true });
        await writeFile(join(outDir, "index.html"), html);
        console.log(`prerendered ${route}`);
    }
} finally {
    await browser?.close();
    server.close();
}
