# NEXO PWA Icons

This directory contains all PWA icons for NEXO.

## Icon Generation

Icons are generated using the script at `scripts/generate-pwa-icons.js`.

### To regenerate icons:
```bash
npm run generate:pwa
```

### Icon Types

| Type | Purpose | Sizes |
|------|---------|-------|
| Standard | General use (any) | 72, 96, 128, 144, 152, 192, 384, 512 |
| Maskable | Android adaptive icons | 192, 512 |
| Apple Touch | iOS home screen | 180 |
| Shortcuts | Avatar quick access | 96 |

### File Naming Convention

- `icon-{size}x{size}.png` - Standard icons
- `icon-{size}x{size}-maskable.png` - Maskable icons
- `shortcut-{avatar}.png` - Avatar shortcut icons
- `apple-touch-icon.png` - iOS icon

## Brand Colors

- Primary: #7c3aed (Purple)
- Background: #0a0a0a (Dark)
- Lía: #ec4899 (Pink)
- Mía: #f97316 (Orange)
- Allan: #3b82f6 (Blue)

## Legacy SVG Files

SVG files are kept for reference but PNG is used for PWA compatibility.
SVG files can be safely deleted after confirming PNG icons work correctly.
