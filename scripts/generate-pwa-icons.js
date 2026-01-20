/**
 * PWA Icon Generator for NEXO
 * Generates PNG icons from SVG source for full PWA compatibility
 * 
 * Run: node scripts/generate-pwa-icons.js
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// NEXO brand colors
const BRAND_COLOR = '#7c3aed';
const BACKGROUND_COLOR = '#0a0a0a';

// Icon sizes required for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SHORTCUT_SIZE = 96;

// Avatar colors for shortcuts
const AVATAR_COLORS = {
  lia: '#ec4899',    // Pink
  mia: '#f97316',    // Orange  
  allan: '#3b82f6'   // Blue
};

/**
 * Generate SVG content for main NEXO icon
 */
function generateMainIconSVG(size) {
  const fontSize = Math.round(size * 0.5);
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${BRAND_COLOR}"/>
    <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" 
          fill="white" font-family="Arial, Helvetica, sans-serif" font-weight="bold" 
          font-size="${fontSize}px">N</text>
  </svg>`;
}

/**
 * Generate SVG content for maskable icon (with safe zone padding)
 * Maskable icons need 10% padding on each side for safe zone
 */
function generateMaskableIconSVG(size) {
  const fontSize = Math.round(size * 0.4); // Smaller for safe zone
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${BRAND_COLOR}"/>
    <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" 
          fill="white" font-family="Arial, Helvetica, sans-serif" font-weight="bold" 
          font-size="${fontSize}px">N</text>
  </svg>`;
}

/**
 * Generate SVG for avatar shortcut icons
 */
function generateShortcutIconSVG(avatar, size) {
  const color = AVATAR_COLORS[avatar];
  const initial = avatar.charAt(0).toUpperCase();
  const fontSize = Math.round(size * 0.5);
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" rx="20%" fill="${color}"/>
    <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" 
          fill="white" font-family="Arial, Helvetica, sans-serif" font-weight="bold" 
          font-size="${fontSize}px">${initial}</text>
  </svg>`;
}

/**
 * Generate Apple touch icon (special format for iOS)
 */
function generateAppleTouchIconSVG(size) {
  const fontSize = Math.round(size * 0.45);
  // Apple requires no transparency, rounded corners handled by iOS
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${BRAND_COLOR}"/>
    <text x="50%" y="52%" dominant-baseline="central" text-anchor="middle" 
          fill="white" font-family="Arial, Helvetica, sans-serif" font-weight="bold" 
          font-size="${fontSize}px">N</text>
  </svg>`;
}

/**
 * Convert SVG string to PNG buffer
 */
async function svgToPng(svgString, size) {
  return sharp(Buffer.from(svgString))
    .resize(size, size)
    .png()
    .toBuffer();
}

/**
 * Main generation function
 */
async function generateIcons() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  
  console.log('🎨 NEXO PWA Icon Generator');
  console.log('==========================\n');

  // Ensure icons directory exists
  await fs.mkdir(iconsDir, { recursive: true });

  // Generate main icons in all sizes
  console.log('📱 Generating main icons...');
  for (const size of ICON_SIZES) {
    const svg = generateMainIconSVG(size);
    const png = await svgToPng(svg, size);
    const filename = `icon-${size}x${size}.png`;
    await fs.writeFile(path.join(iconsDir, filename), png);
    console.log(`   ✓ ${filename}`);
  }

  // Generate maskable icons (192 and 512 required)
  console.log('\n🎭 Generating maskable icons...');
  for (const size of [192, 512]) {
    const svg = generateMaskableIconSVG(size);
    const png = await svgToPng(svg, size);
    const filename = `icon-${size}x${size}-maskable.png`;
    await fs.writeFile(path.join(iconsDir, filename), png);
    console.log(`   ✓ ${filename}`);
  }

  // Generate shortcut icons for avatars
  console.log('\n👤 Generating avatar shortcut icons...');
  for (const avatar of Object.keys(AVATAR_COLORS)) {
    const svg = generateShortcutIconSVG(avatar, SHORTCUT_SIZE);
    const png = await svgToPng(svg, SHORTCUT_SIZE);
    const filename = `shortcut-${avatar}.png`;
    await fs.writeFile(path.join(iconsDir, filename), png);
    console.log(`   ✓ ${filename}`);
  }

  // Generate Apple touch icon (180x180 is the recommended size)
  console.log('\n🍎 Generating Apple touch icon...');
  const appleSvg = generateAppleTouchIconSVG(180);
  const applePng = await svgToPng(appleSvg, 180);
  await fs.writeFile(path.join(iconsDir, 'apple-touch-icon.png'), applePng);
  console.log('   ✓ apple-touch-icon.png');

  // Generate favicon (32x32)
  console.log('\n🔖 Generating favicon...');
  const faviconSvg = generateMainIconSVG(32);
  const faviconPng = await svgToPng(faviconSvg, 32);
  await fs.writeFile(path.join(__dirname, '..', 'public', 'favicon.png'), faviconPng);
  console.log('   ✓ favicon.png');

  // Also create ICO format for broader compatibility
  const favicon48 = await svgToPng(generateMainIconSVG(48), 48);
  await fs.writeFile(path.join(iconsDir, 'favicon-48x48.png'), favicon48);
  console.log('   ✓ favicon-48x48.png');

  console.log('\n✅ All icons generated successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Update manifest.json with PNG icons');
  console.log('   2. Add Apple meta tags to layout.tsx');
  console.log('   3. Deploy and verify in Chrome DevTools');
}

// Run generator
generateIcons().catch(console.error);

