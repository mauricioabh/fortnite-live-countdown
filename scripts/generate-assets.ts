/**
 * Generates raster favicons, OG image, and Expo assets from SVG sources in packages/ui/assets.
 * Run from repo root: npm run generate-assets
 */
import { createWriteStream } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pngToIco from "png-to-ico";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const UI_ASSETS = path.join(ROOT, "packages", "ui", "assets");
const WEB_PUBLIC = path.join(ROOT, "apps", "web", "public");
/** App Router serves this at `/favicon.ico`; do not also write `public/favicon.ico` (Next.js conflict). */
const WEB_APP_DIR = path.join(ROOT, "apps", "web", "src", "app");
const MOBILE_ASSETS = path.join(ROOT, "apps", "mobile", "assets");

const ISOTIPO = path.join(UI_ASSETS, "logo-isotipo.svg");
const OG_SVG = path.join(UI_ASSETS, "og-image.svg");

/** Primary blue from design tokens (#3b82f6) */
const PRIMARY = { r: 59, g: 130, b: 246, alpha: 1 };

function log(msg: string): void {
  console.log(`[generate-assets] ${msg}`);
}

async function ensureDirs(): Promise<void> {
  await mkdir(WEB_PUBLIC, { recursive: true });
  await mkdir(WEB_APP_DIR, { recursive: true });
  await mkdir(MOBILE_ASSETS, { recursive: true });
}

async function writeIcoFromPng(png32: Buffer, outPath: string): Promise<void> {
  const ico = await pngToIco([png32]);
  await new Promise<void>((resolve, reject) => {
    const stream = createWriteStream(outPath);
    stream.on("finish", () => resolve());
    stream.on("error", reject);
    stream.end(ico);
  });
}

async function main(): Promise<void> {
  await ensureDirs();

  const isotipoBuf = await readFile(ISOTIPO);
  const ogBuf = await readFile(OG_SVG);

  const fav16 = path.join(WEB_PUBLIC, "favicon-16x16.png");
  const fav32 = path.join(WEB_PUBLIC, "favicon-32x32.png");
  const favIco = path.join(WEB_APP_DIR, "favicon.ico");
  const apple = path.join(WEB_PUBLIC, "apple-touch-icon.png");
  const ogOut = path.join(WEB_PUBLIC, "og-image.png");

  await sharp(isotipoBuf).resize(16, 16).png().toFile(fav16);
  log(`wrote ${path.relative(ROOT, fav16)}`);

  const png32 = await sharp(isotipoBuf).resize(32, 32).png().toBuffer();
  await sharp(png32).png().toFile(fav32);
  log(`wrote ${path.relative(ROOT, fav32)}`);

  await writeIcoFromPng(png32, favIco);
  log(`wrote ${path.relative(ROOT, favIco)}`);

  await sharp(isotipoBuf).resize(180, 180).png().toFile(apple);
  log(`wrote ${path.relative(ROOT, apple)}`);

  await sharp(ogBuf).resize(1200, 630).png().toFile(ogOut);
  log(`wrote ${path.relative(ROOT, ogOut)}`);

  const icon1024 = path.join(MOBILE_ASSETS, "icon.png");
  const adaptive1024 = path.join(MOBILE_ASSETS, "adaptive-icon.png");
  const splash1024 = path.join(MOBILE_ASSETS, "splash-icon.png");
  const mobileFav = path.join(MOBILE_ASSETS, "favicon.png");

  const iconCanvas = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 12, g: 12, b: 15, alpha: 1 },
    },
  })
    .composite([
      {
        input: await sharp(isotipoBuf).resize(720, 720).png().toBuffer(),
        gravity: "center",
      },
    ])
    .png()
    .toBuffer();
  await sharp(iconCanvas).png().toFile(icon1024);
  log(`wrote ${path.relative(ROOT, icon1024)}`);

  const adaptiveCanvas = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: await sharp(isotipoBuf).resize(720, 720).png().toBuffer(),
        gravity: "center",
      },
    ])
    .png()
    .toBuffer();
  await sharp(adaptiveCanvas).png().toFile(adaptive1024);
  log(`wrote ${path.relative(ROOT, adaptive1024)}`);

  const splashCanvas = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: PRIMARY,
    },
  })
    .composite([
      {
        input: await sharp(isotipoBuf).resize(560, 560).png().toBuffer(),
        gravity: "center",
      },
    ])
    .png()
    .toBuffer();
  await sharp(splashCanvas).png().toFile(splash1024);
  log(`wrote ${path.relative(ROOT, splash1024)}`);

  await sharp(isotipoBuf).resize(48, 48).png().toFile(mobileFav);
  log(`wrote ${path.relative(ROOT, mobileFav)}`);

  log("done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
