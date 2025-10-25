#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

let sourcePath = '';
try {
  sourcePath = require.resolve('@tesseract.js-data/eng/eng.traineddata.gz');
} catch (error) {
  console.error('\n[install-ocr-model] Unable to locate @tesseract.js-data/eng.');
  console.error('Install dependencies before building the frontend workspace.');
  process.exitCode = 1;
  process.exit(1);
}

const targetDir = resolve(dirname(fileURLToPath(import.meta.url)), '../public/tesseract');
const targetPath = resolve(targetDir, 'eng.traineddata.gz');

mkdirSync(targetDir, { recursive: true });

const sourceSize = statSync(sourcePath).size;
if (existsSync(targetPath)) {
  try {
    const currentSize = statSync(targetPath).size;
    if (currentSize === sourceSize) {
      console.log('[install-ocr-model] OCR model already up to date.');
      process.exit(0);
    }
  } catch (error) {
    // Ignore and rewrite the file below.
  }
}

copyFileSync(sourcePath, targetPath);
console.log(`[install-ocr-model] Copied OCR model to ${targetPath}`);
