import sharp from 'sharp';
import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname } from 'path';

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;

let totalOriginal = 0;
let totalOptimized = 0;
let fileCount = 0;

async function optimizeFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return;

  try {
    const inputBuffer = await readFile(filePath);
    const originalSize = inputBuffer.length;
    const metadata = await sharp(inputBuffer).metadata();

    let pipeline = sharp(inputBuffer);

    // Resize if larger than max dimension in either width or height
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      pipeline = pipeline.resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality: WEBP_QUALITY, effort: 5 });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    }

    const outputBuffer = await pipeline.toBuffer();

    if (outputBuffer.length < originalSize) {
      await writeFile(filePath, outputBuffer);
      const saved = originalSize - outputBuffer.length;
      totalOriginal += originalSize;
      totalOptimized += outputBuffer.length;
      fileCount++;
      console.log(`✅ [${((saved / originalSize) * 100).toFixed(1)}% OFF] ${filePath}: ${(originalSize / 1024).toFixed(0)} KB → ${(outputBuffer.length / 1024).toFixed(0)} KB`);
    } else {
      console.log(`⏭️  [SKIPPED] ${filePath}: already optimal (${(originalSize / 1024).toFixed(0)} KB)`);
    }
  } catch (err) {
    console.error(`❌ [ERROR] ${filePath}: ${err.message}`);
  }
}

async function scanAndOptimize(dir) {
  if (!existsSync(dir)) return;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await scanAndOptimize(fullPath);
    } else {
      await optimizeFile(fullPath);
    }
  }
}

console.log('🚀 Iniciando optimización de imágenes...\n');

// 1. Process specific source images for AboutUs
const danielSrc = 'public/images/PAGINA WEB/DESCRIPCION GENERAL - QUIENES SOMOS/Daniel.jpg';
const caroDanielSrc = 'public/images/PAGINA WEB/DESCRIPCION GENERAL - QUIENES SOMOS/Caro-y-Daniel-3.jpg';

if (existsSync(danielSrc)) {
  const buf = await readFile(danielSrc);
  const out = await sharp(buf)
    .resize({ width: 1200, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
  await writeFile('src/assets/nosotros/daniel-guias.jpg', out);
  console.log(`✅ Creado src/assets/nosotros/daniel-guias.jpg (${(out.length / 1024).toFixed(0)} KB)`);
}

if (existsSync(caroDanielSrc)) {
  const buf = await readFile(caroDanielSrc);
  const out = await sharp(buf)
    .resize({ width: 1200, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
  await writeFile('src/assets/nosotros/caro-daniel-campamento.jpg', out);
  console.log(`✅ Creado src/assets/nosotros/caro-daniel-campamento.jpg (${(out.length / 1024).toFixed(0)} KB)`);
}

// 2. Scan and optimize src/assets and public/images/web
await scanAndOptimize('src/assets');
await scanAndOptimize('public/images/web');
await optimizeFile('public/images/hero_andes_ride.jpg');

const totalSaved = totalOriginal - totalOptimized;
console.log(`\n🎉 Completado!`);
console.log(`Archivos optimizados: ${fileCount}`);
console.log(`Peso original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
console.log(`Peso final: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
console.log(`Espacio total ahorrado: ${(totalSaved / 1024 / 1024).toFixed(2)} MB (-${((totalSaved / totalOriginal) * 100).toFixed(1)}%)`);
