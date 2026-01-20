/**
 * PWA Screenshot Generator for NEXO
 * Generates placeholder screenshots for PWA install experience
 * 
 * Run: node scripts/generate-pwa-screenshots.js
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const BRAND_COLOR = '#7c3aed';
const BG_COLOR = '#0a0a0a';

// Screenshot specifications
const SCREENSHOTS = [
  { name: 'screenshot-desktop.png', width: 1280, height: 720, label: 'NEXO on Desktop' },
  { name: 'screenshot-mobile.png', width: 390, height: 844, label: 'NEXO on Mobile' }
];

function generateScreenshotSVG(width, height, label) {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${BG_COLOR};stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <text x="50%" y="45%" dominant-baseline="central" text-anchor="middle" 
          fill="${BRAND_COLOR}" font-family="Arial, Helvetica, sans-serif" font-weight="bold" 
          font-size="${Math.round(width * 0.12)}px">NEXO</text>
    <text x="50%" y="58%" dominant-baseline="central" text-anchor="middle" 
          fill="#888888" font-family="Arial, Helvetica, sans-serif" 
          font-size="${Math.round(width * 0.025)}px">${label}</text>
    <text x="50%" y="68%" dominant-baseline="central" text-anchor="middle" 
          fill="#666666" font-family="Arial, Helvetica, sans-serif" 
          font-size="${Math.round(width * 0.018)}px">Your AI Companion</text>
  </svg>`;
}

async function generateScreenshots() {
  const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
  
  console.log('📸 NEXO PWA Screenshot Generator');
  console.log('================================\n');

  await fs.mkdir(screenshotsDir, { recursive: true });

  for (const screenshot of SCREENSHOTS) {
    const svg = generateScreenshotSVG(screenshot.width, screenshot.height, screenshot.label);
    const png = await sharp(Buffer.from(svg))
      .resize(screenshot.width, screenshot.height)
      .png()
      .toBuffer();
    
    await fs.writeFile(path.join(screenshotsDir, screenshot.name), png);
    console.log(`   ✓ ${screenshot.name} (${screenshot.width}x${screenshot.height})`);
  }

  console.log('\n✅ Screenshots generated successfully!');
}

generateScreenshots().catch(console.error);

