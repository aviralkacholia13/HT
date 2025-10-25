#!/usr/bin/env node
import { createWriteStream } from 'node:fs';
import { access, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const MODEL_URL = 'https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz';
const MODEL_PATH = fileURLToPath(new URL('../public/tesseract/eng.traineddata.gz', import.meta.url));

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function ensureModel() {
  if (await fileExists(MODEL_PATH)) {
    return;
  }

  await mkdir(dirname(MODEL_PATH), { recursive: true });

  const response = await fetch(MODEL_URL);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download model: ${response.status} ${response.statusText}`);
  }

  const body = response.body;
  if (!body) {
    throw new Error('Response body is empty');
  }

  const fileStream = createWriteStream(MODEL_PATH, { flags: 'w' });
  await pipeline(Readable.fromWeb(body), fileStream);
}

ensureModel().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
