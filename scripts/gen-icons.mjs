import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const svg = readFileSync(fileURLToPath(new URL("../public/icon.svg", import.meta.url)));

const targets = [
  { file: "pwa-192.png", size: 192 },
  { file: "pwa-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "maskable-512.png", size: 512, padded: true },
];

for (const t of targets) {
  const base = sharp(svg).resize(t.size, t.size);
  const out = fileURLToPath(new URL(`../public/${t.file}`, import.meta.url));
  await base.png().toFile(out);
  console.log("wrote", t.file);
}
