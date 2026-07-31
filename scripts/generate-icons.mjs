import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const HEART_HANDSHAKE_PATH =
  "M19.414 14.414C21 12.828 22 11.5 22 9.5a5.5 5.5 0 0 0-9.591-3.676.6.6 0 0 1-.818.001A5.5 5.5 0 0 0 2 9.5c0 2.3 1.5 4 3 5.5l5.535 5.362a2 2 0 0 0 2.879.052 2.12 2.12 0 0 0-.004-3 2.124 2.124 0 1 0 3-3 2.124 2.124 0 0 0 3.004 0 2 2 0 0 0 0-2.828l-1.881-1.882a2.41 2.41 0 0 0-3.409 0l-1.71 1.71a2 2 0 0 1-2.828 0 2 2 0 0 1 0-2.828l2.823-2.762";

function iconSvg(size) {
  const iconSize = size * 0.58;
  const offset = (size - iconSize) / 2;
  const scale = iconSize / 24;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#4f46e5"/>
  <g transform="translate(${offset},${offset}) scale(${scale})">
    <path d="${HEART_HANDSHAKE_PATH}" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

const targets = [
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 },
  { file: "app/icon.png", size: 256 },
  { file: "app/apple-icon.png", size: 180 },
];

await mkdir("public/icons", { recursive: true });

for (const { file, size } of targets) {
  const svg = iconSvg(size);
  await sharp(Buffer.from(svg)).png().toFile(file);
  console.log(`wrote ${file} (${size}x${size})`);
}
