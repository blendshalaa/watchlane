import { chromium, Browser } from "playwright";
import { AppError } from "../utils/AppError.js";

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
    if (!browser || !browser.isConnected()) {
        browser = await chromium.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
    }
    return browser;
}

export async function scrapeUrl(url: string): Promise<string> {
    const browserInstance = await getBrowser();
    const context = await browserInstance.newContext({
        userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    try {
        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });

        // Wait a bit for dynamic content
        await page.waitForTimeout(2000);

        // Remove scripts, styles, and non-content elements, then extract text
        // Note: page.evaluate runs in the browser context where DOM types exist
        const textContent = await page.evaluate(() => {
            const selectors =
                "script, style, noscript, svg, img, video, audio, iframe, canvas";
            const elementsToRemove = document.querySelectorAll(selectors);
            elementsToRemove.forEach((el) => el.remove());

            const body = document.body;
            if (!body) return "";

            return body.innerText
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0)
                .join("\n");
        });

        return textContent;
    } finally {
        await context.close();
    }
}

export async function closeBrowser(): Promise<void> {
    if (browser) {
        await browser.close();
        browser = null;
    }
}
