// Snapshots the rendered HTML of the public routes into dist/ so crawlers and
// social scrapers get real content instead of the empty SPA shell.
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const ROUTES = ["/", "/login", "/signup", "/help", "/privacy"];
const PORT = 4183;

const MIME = {
    ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
    ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp",
    ".ico": "image/x-icon", ".json": "application/json",
    ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
};

// SPA fallback: real files by extension, index.html for routes.
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

// Docker sets an explicit path; local dev finds installed Chrome via channel.
const execPath = process.env.PUPPETEER_EXECUTABLE_PATH;
const launchOpts = execPath
    ? { executablePath: execPath, args: ["--no-sandbox", "--disable-setuid-sandbox"] }
    : { channel: "chrome", args: ["--no-sandbox", "--disable-setuid-sandbox"] };

await new Promise((r) => server.listen(PORT, r));
let browser;
try {
    browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();
    for (const route of ROUTES) {
        await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "domcontentloaded" });
        // Canonical matches the path only once the (lazy) page mounted and useSeo ran.
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
