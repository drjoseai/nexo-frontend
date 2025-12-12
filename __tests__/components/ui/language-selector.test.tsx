/**
 * LanguageSelector Component Tests
 * Tests for language switching functionality
 * 
 * NEXO v2.0 - Sprint Frontend Hardening
 * Day 4 - i18n Tests
 * 
 * Note: Radix UI DropdownMenu uses portals that don't render synchronously in JSDOM.
 * These tests focus on rendering which is reliable in the test environment.
 * Dropdown interaction is better tested via E2E (Playwright) in Day 9.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LanguageSelector } from '@/components/ui/language-selector';
import { localeNames, localeFlags } from '@/i18n/config';

describe('LanguageSelector', () => {
  describe('Rendering', () => {
    it('renders with default Spanish locale', () => {
      render(<LanguageSelector />);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText(`${localeFlags.es} ${localeNames.es}`)).toBeInTheDocument();
    });

    it('renders with English locale when specified', () => {
      render(<LanguageSelector currentLocale="en" />);
      
      expect(screen.getByText(`${localeFlags.en} ${localeNames.en}`)).toBeInTheDocument();
    });

    it('renders without label when showLabel is false', () => {
      render(<LanguageSelector showLabel={false} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.queryByText(localeNames.es)).not.toBeInTheDocument();
      expect(screen.queryByText(localeNames.en)).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<LanguageSelector className="custom-class" />);
      
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('renders with outline variant', () => {
      render(<LanguageSelector variant="outline" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with default variant', () => {
      render(<LanguageSelector variant="default" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with ghost variant (default)', () => {
      render(<LanguageSelector variant="ghost" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Button State', () => {
    it('button is enabled by default', () => {
      render(<LanguageSelector />);
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('button has aria-haspopup attribute', () => {
      render(<LanguageSelector />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('button has correct initial aria-expanded state', () => {
      render(<LanguageSelector />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Props Handling', () => {
    it('uses es as default locale', () => {
      render(<LanguageSelector />);
      
      expect(screen.getByText(/Español/)).toBeInTheDocument();
    });

    it('displays correct flag for Spanish', () => {
      render(<LanguageSelector currentLocale="es" />);
      
      expect(screen.getByText(/🇪🇸/)).toBeInTheDocument();
    });

    it('displays correct flag for English', () => {
      render(<LanguageSelector currentLocale="en" />);
      
      expect(screen.getByText(/🇺🇸/)).toBeInTheDocument();
    });

    it('renders icon even without label', () => {
      render(<LanguageSelector showLabel={false} />);
      
      // The Globe icon should still be rendered (as SVG)
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
