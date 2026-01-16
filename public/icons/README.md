# PWA Icons for NEXO

## Required Icons

Generate these icons from a 1024x1024 source image with the NEXO logo.

### Standard PWA Icons
| Filename | Size | Purpose |
|----------|------|---------|
| icon-16x16.png | 16x16 | Favicon |
| icon-32x32.png | 32x32 | Favicon |
| icon-72x72.png | 72x72 | PWA |
| icon-96x96.png | 96x96 | PWA |
| icon-128x128.png | 128x128 | PWA |
| icon-144x144.png | 144x144 | PWA |
| icon-152x152.png | 152x152 | PWA |
| icon-192x192.png | 192x192 | PWA (required) |
| icon-384x384.png | 384x384 | PWA |
| icon-512x512.png | 512x512 | PWA (required) |

### Apple Touch Icon
| Filename | Size | Purpose |
|----------|------|---------|
| apple-touch-icon.png | 180x180 | iOS home screen |

### Avatar Shortcuts
| Filename | Size | Purpose |
|----------|------|---------|
| shortcut-lia.png | 96x96 | Quick action for Lía |
| shortcut-mia.png | 96x96 | Quick action for Mía |
| shortcut-allan.png | 96x96 | Quick action for Allan |

### Favicon
| Filename | Sizes | Purpose |
|----------|-------|---------|
| favicon.ico | 16, 32, 48 | Browser tab icon |

## Generation Tools

Use one of these tools to generate all sizes from a single source image:

1. **Real Favicon Generator**: https://realfavicongenerator.net/
2. **PWA Builder**: https://www.pwabuilder.com/imageGenerator
3. **NPM Package**: `npx pwa-asset-generator`

## Design Guidelines

- **Background**: Transparent or #0a0a0a (dark)
- **Primary Color**: #7c3aed (violet)
- **Safe Zone**: Keep logo within 80% of icon area for maskable icons
- **Format**: PNG with transparency

## Quick Generate Command
```bash
npx pwa-asset-generator ./source-logo.png ./public/icons --background "#0a0a0a" --padding "10%"
```

