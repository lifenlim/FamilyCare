import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SOURCE = "scripts/assets/brand-icon-source.jpg";

async function squared(size) {
  return sharp(SOURCE)
    .resize(size, size, { fit: "cover" })
    .png()
    .toBuffer();
}

const targets = [
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 },
  { file: "public/icons/logo.png", size: 512 },
];

await mkdir("public/icons", { recursive: true });

for (const { file, size } of targets) {
  const buffer = await squared(size);
  await sharp(buffer).toFile(file);
  console.log(`wrote ${file} (${size}x${size})`);
}
