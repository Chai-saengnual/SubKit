#!/usr/bin/env node
// scripts/build-icons.mjs
// Generates raster app icons (192, 512, 1024) + a maskable icon (512 with safe zone)
// from the SVG source at icon.svg. Outputs to /icons/ for the PWA manifest
// and the native iOS/Android asset catalogs.
//
// Usage: node scripts/build-icons.mjs
// Requires: npm install sharp

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'icon.svg');
const OUT_DIR = path.join(ROOT, 'icons');

async function buildOne(size, filename, maskable = false) {
  const svg = await fs.readFile(SOURCE, 'utf8');
  // For a maskable icon: add 20% safe zone padding so the OS can crop to a
  // circle/squircle without cutting off the mark. Easiest way: render to a
  // larger canvas with a transparent border.
  const targetSize = maskable ? Math.round(size * 1.6) : size;  // ~37.5% padding on each side
  const offset = Math.round((targetSize - size) / 2);
  const finalSize = size;
  await sharp(Buffer.from(svg), { density: 384 })
    .resize(targetSize, targetSize, { fit: 'contain', background: { r: 10, g: 10, b: 15, alpha: 1 } })
    .extract({ left: offset, top: offset, width: size, height: size })
    .png()
    .toFile(path.join(OUT_DIR, filename));
  console.log(`Wrote ${filename} (${size}x${size}${maskable ? ' maskable' : ''})`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  // PWA manifest
  await buildOne(192, 'icon-192.png');
  await buildOne(512, 'icon-512.png');
  await buildOne(512, 'icon-maskable-512.png', true);
  // iOS / Android store
  await buildOne(1024, 'icon-1024.png');
  // Apple Watch + legacy
  await buildOne(180, 'icon-180.png');
}

main().catch((e) => { console.error(e); process.exit(1); });
