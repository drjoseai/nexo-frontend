/**
 * PWA Configuration Tests
 * Validates manifest.json and PWA requirements
 */

import fs from 'fs';
import path from 'path';

describe('PWA Configuration', () => {
  let manifest: Record<string, unknown>;

  beforeAll(() => {
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    manifest = JSON.parse(manifestContent);
  });

  describe('Manifest Basic Fields', () => {
    it('should have required name fields', () => {
      expect(manifest.name).toBe('NEXO - Emotional AI Companion');
      expect(manifest.short_name).toBe('NEXO');
    });

    it('should have valid start_url', () => {
      expect(manifest.start_url).toBe('/');
    });

    it('should have display mode', () => {
      expect(manifest.display).toBe('standalone');
    });

    it('should have theme and background colors', () => {
      expect(manifest.theme_color).toBe('#7c3aed');
      expect(manifest.background_color).toBe('#0a0a0a');
    });

    it('should have id for PWA identity', () => {
      expect(manifest.id).toBeDefined();
    });
  });

  describe('Icons Configuration', () => {
    it('should have at least 8 icons', () => {
      expect((manifest.icons as Array<unknown>).length).toBeGreaterThanOrEqual(8);
    });

    it('should have PNG icons (not SVG)', () => {
      (manifest.icons as Array<{ type: string; src: string }>).forEach((icon) => {
        expect(icon.type).toBe('image/png');
        expect(icon.src).toMatch(/\.png$/);
      });
    });

    it('should have 192x192 icon', () => {
      const icon192 = (manifest.icons as Array<{ sizes: string; purpose: string }>).find(
        (i) => i.sizes === '192x192' && i.purpose === 'any'
      );
      expect(icon192).toBeDefined();
    });

    it('should have 512x512 icon', () => {
      const icon512 = (manifest.icons as Array<{ sizes: string; purpose: string }>).find(
        (i) => i.sizes === '512x512' && i.purpose === 'any'
      );
      expect(icon512).toBeDefined();
    });

    it('should have maskable icons', () => {
      const maskableIcons = (manifest.icons as Array<{ purpose: string }>).filter(
        (i) => i.purpose === 'maskable'
      );
      expect(maskableIcons.length).toBeGreaterThanOrEqual(1);
    });

    it('should have purpose defined for all icons', () => {
      (manifest.icons as Array<{ purpose: string }>).forEach((icon) => {
        expect(icon.purpose).toBeDefined();
        expect(['any', 'maskable', 'monochrome']).toContain(icon.purpose);
      });
    });
  });

  describe('Shortcuts Configuration', () => {
    it('should have 3 avatar shortcuts', () => {
      expect(manifest.shortcuts).toHaveLength(3);
    });

    it('should have shortcuts for Lía, Mía, and Allan', () => {
      const names = (manifest.shortcuts as Array<{ short_name: string }>).map((s) => s.short_name);
      expect(names).toContain('Lía');
      expect(names).toContain('Mía');
      expect(names).toContain('Allan');
    });

    it('should have valid shortcut URLs', () => {
      (manifest.shortcuts as Array<{ url: string }>).forEach((shortcut) => {
        expect(shortcut.url).toMatch(/^\/chat\?avatar=/);
      });
    });

    it('should have PNG icons for shortcuts', () => {
      (manifest.shortcuts as Array<{ icons: Array<{ type: string }> }>).forEach((shortcut) => {
        expect(shortcut.icons[0].type).toBe('image/png');
      });
    });
  });

  describe('Screenshots Configuration', () => {
    it('should have screenshots defined', () => {
      expect(manifest.screenshots).toBeDefined();
      expect((manifest.screenshots as Array<unknown>).length).toBeGreaterThanOrEqual(2);
    });

    it('should have desktop screenshot with wide form_factor', () => {
      const desktop = (manifest.screenshots as Array<{ form_factor: string }>).find(
        (s) => s.form_factor === 'wide'
      );
      expect(desktop).toBeDefined();
    });

    it('should have mobile screenshot with narrow form_factor', () => {
      const mobile = (manifest.screenshots as Array<{ form_factor: string }>).find(
        (s) => s.form_factor === 'narrow'
      );
      expect(mobile).toBeDefined();
    });
  });

  describe('Icon Files Existence', () => {
    const requiredIcons = [
      'icon-192x192.png',
      'icon-512x512.png',
      'icon-192x192-maskable.png',
      'icon-512x512-maskable.png',
      'apple-touch-icon.png',
      'shortcut-lia.png',
      'shortcut-mia.png',
      'shortcut-allan.png'
    ];

    requiredIcons.forEach((iconName) => {
      it(`should have ${iconName} file`, () => {
        const iconPath = path.join(process.cwd(), 'public', 'icons', iconName);
        expect(fs.existsSync(iconPath)).toBe(true);
      });
    });
  });

  describe('Screenshot Files Existence', () => {
    it('should have desktop screenshot file', () => {
      const screenshotPath = path.join(process.cwd(), 'public', 'screenshots', 'screenshot-desktop.png');
      expect(fs.existsSync(screenshotPath)).toBe(true);
    });

    it('should have mobile screenshot file', () => {
      const screenshotPath = path.join(process.cwd(), 'public', 'screenshots', 'screenshot-mobile.png');
      expect(fs.existsSync(screenshotPath)).toBe(true);
    });
  });
});

