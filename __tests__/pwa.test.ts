import manifest from '../public/manifest.json';

describe('PWA Configuration', () => {
  describe('Manifest Basic Fields', () => {
    it('should have required name fields', () => {
      expect(manifest.name).toBe('NEXO - Emotional AI Companion');
      expect(manifest.short_name).toBe('NEXO');
    });

    it('should have description', () => {
      expect(manifest.description).toBeDefined();
    });

    it('should have correct display mode', () => {
      expect(manifest.display).toBe('standalone');
    });

    it('should have start_url', () => {
      expect(manifest.start_url).toBe('/');
    });

    it('should have theme and background colors', () => {
      expect(manifest.theme_color).toBe('#2D1B4E');
      expect(manifest.background_color).toBe('#2D1B4E');
    });
  });

  describe('Icons Configuration', () => {
    it('should have at least 2 icons', () => {
      expect((manifest.icons as Array<unknown>).length).toBeGreaterThanOrEqual(2);
    });

    it('should have PNG icons (not SVG)', () => {
      (manifest.icons as Array<{ type: string }>).forEach((icon) => {
        expect(icon.type).toBe('image/png');
      });
    });

    it('should have 192x192 icon', () => {
      const icon192 = (manifest.icons as Array<{ sizes: string }>).find(
        (i) => i.sizes === '192x192'
      );
      expect(icon192).toBeDefined();
    });

    it('should have 512x512 icon', () => {
      const icon512 = (manifest.icons as Array<{ sizes: string }>).find(
        (i) => i.sizes === '512x512'
      );
      expect(icon512).toBeDefined();
    });

    it('should have purpose defined for all icons', () => {
      (manifest.icons as Array<{ purpose?: string }>).forEach((icon) => {
        if (icon.purpose) {
          // purpose can be "any", "maskable", "any maskable", or "monochrome"
          expect(icon.purpose).toMatch(/^(any|maskable|any maskable|monochrome)$/);
        }
      });
    });
  });
});
