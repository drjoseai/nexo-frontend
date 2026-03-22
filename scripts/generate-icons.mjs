import sharp from 'sharp';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE = join(ROOT, 'public', 'nexo-logo-source.png');

const icons = [
  { path: 'public/favicon.png',                     size: 48  },
  { path: 'public/icons/favicon-32x32.png',         size: 32  },
  { path: 'public/icons/favicon-48x48.png',         size: 48  },
  { path: 'public/icons/icon-72x72.png',            size: 72  },
  { path: 'public/icons/icon-96x96.png',            size: 96  },
  { path: 'public/icons/icon-128x128.png',          size: 128 },
  { path: 'public/icons/icon-144x144.png',          size: 144 },
  { path: 'public/icons/icon-152x152.png',          size: 152 },
  { path: 'public/icons/icon-192x192.png',          size: 192 },
  { path: 'public/icons/icon-192x192-maskable.png', size: 192 },
  { path: 'public/icons/icon-32x32.png',            size: 32  },
  { path: 'public/icons/icon-384x384.png',          size: 384 },
  { path: 'public/icons/icon-512x512.png',          size: 512 },
  { path: 'public/icons/icon-512x512-maskable.png', size: 512 },
  { path: 'public/icons/apple-touch-icon.png',      size: 180 },
  { path: 'public/AppStore_1024x1024.png',          size: 1024 },
];

for (const icon of icons) {
  const dest = join(ROOT, icon.path);
  await sharp(SOURCE)
    .resize(icon.size, icon.size, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(dest);
  console.log(`✅ ${icon.path} (${icon.size}x${icon.size})`);
}

console.log('\n🎉 Todos los iconos generados correctamente.');
