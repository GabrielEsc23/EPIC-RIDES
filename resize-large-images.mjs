// resize-large-images-v2.mjs
// Resizes source images larger than 1600px wide, using temp files to avoid lock issues on Windows

import sharp from 'sharp';
import { readdir, stat, rename, unlink } from 'fs/promises';
import { writeFileSync } from 'fs';
import { join, extname } from 'path';

const MAX_WIDTH = 1600;
const QUALITY = 90;

const dirs = [
  'src/assets/descripcion-general',
  'src/assets/nosotros',
  'src/assets/paseos',
  'src/assets/servicios',
  'src/assets/comunidad',
  'src/assets/hero',
  'src/assets/testimonios',
];

let totalSaved = 0;
let filesResized = 0;

for (const dir of dirs) {
  let files;
  try {
    files = await readdir(dir);
  } catch {
    continue;
  }

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const filePath = join(dir, file);
    const tempPath = filePath + '.tmp';
    const fileStat = await stat(filePath);
    const originalSize = fileStat.size;

    try {
      const metadata = await sharp(filePath).metadata();
      if (metadata.width > MAX_WIDTH) {
        // Read into buffer first, then process
        const { readFileSync } = await import('fs');
        const inputBuffer = readFileSync(filePath);
        
        const buffer = await sharp(inputBuffer)
          .resize({ width: MAX_WIDTH, withoutEnlargement: true })
          .jpeg({ quality: QUALITY, mozjpeg: true })
          .toBuffer();

        if (buffer.length < originalSize) {
          writeFileSync(tempPath, buffer);
          await unlink(filePath);
          await rename(tempPath, filePath);
          const saved = originalSize - buffer.length;
          totalSaved += saved;
          filesResized++;
          console.log(`✅ ${filePath}: ${(originalSize/1024).toFixed(0)} KiB → ${(buffer.length/1024).toFixed(0)} KiB (saved ${(saved/1024).toFixed(0)} KiB) [${metadata.width}→${MAX_WIDTH}px]`);
        } else {
          console.log(`⏭️  ${filePath}: resize would be larger, skipped`);
        }
      }
    } catch (e) {
      console.error(`❌ ${filePath}: ${e.message}`);
      try { await unlink(tempPath); } catch {}
    }
  }
}

console.log(`\n🏁 Done! Resized ${filesResized} files, saved ${(totalSaved/1024/1024).toFixed(2)} MB total`);
