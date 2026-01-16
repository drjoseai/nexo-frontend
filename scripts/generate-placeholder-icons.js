/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// Sizes needed for PWA
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple SVG that can be used as placeholder
const createSvgIcon = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#7c3aed"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" 
        fill="white" font-family="Arial, sans-serif" font-weight="bold" 
        font-size="${Math.floor(size * 0.5)}px">N</text>
</svg>`;

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG placeholders (will need to be converted to PNG for production)
sizes.forEach(size => {
  const svg = createSvgIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg.trim());
  console.log(`Created: ${filename}`);
});

// Apple touch icon
const appleSvg = createSvgIcon(180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleSvg.trim());
console.log('Created: apple-touch-icon.svg');

// Shortcut icons for avatars
['lia', 'mia', 'allan'].forEach(avatar => {
  const svg = createSvgIcon(96);
  fs.writeFileSync(path.join(iconsDir, `shortcut-${avatar}.svg`), svg.trim());
  console.log(`Created: shortcut-${avatar}.svg`);
});

console.log('\n✅ Placeholder icons created!');
console.log('⚠️  Note: These are SVG placeholders. For production, convert to PNG.');

