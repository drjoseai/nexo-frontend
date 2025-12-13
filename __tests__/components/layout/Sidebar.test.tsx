/**
 * Tests for Sidebar Layout Component
 * NEXO v2.0 - Day 10
 * 
 * @module __tests__/components/layout/Sidebar.test
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock next/navigation
const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useLocale: () => 'es',
  useTranslations: (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      navigation: {
        avatars: 'Avatares',
        profile: 'Perfil',
        subscription: 'Suscripción',
        settings: 'Configuración',
      },
      sidebar: {
        currentPlan: 'Plan actual',
      },
      auth: {
        logout: 'Cerrar Sesión',
      },
    };
    return (key: string) => translations[namespace]?.[key] || key;
  },
}));

// Mock auth store
const mockLogout = jest.fn();
const mockUser = {
  id: 1,
  email: 'test@example.com',
  display_name: 'Test User',
  plan: 'plus',
};

jest.mock('@/lib/store/auth', () => ({
  useAuthStore: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}));

// Mock LanguageSelector component
jest.mock('@/components/ui/language-selector', () => ({
  LanguageSelector: ({ currentLocale }: { currentLocale: string }) => (
    <div data-testid="language-selector">Language: {currentLocale}</div>
  ),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/dashboard');
  });

  describe('Branding', () => {
    it('should render NEXO logo', () => {
      render(<Sidebar />);
      
      expect(screen.getByText('NEXO')).toBeInTheDocument();
    });

    it('should have logo link to dashboard', () => {
      render(<Sidebar />);
      
      const logoLink = screen.getByRole('link', { name: /nexo/i });
      expect(logoLink).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Navigation Items', () => {
    it('should render all navigation items', () => {
      render(<Sidebar />);
      
      expect(screen.getByText('Avatares')).toBeInTheDocument();
      expect(screen.getByText('Perfil')).toBeInTheDocument();
      expect(screen.getByText('Suscripción')).toBeInTheDocument();
      expect(screen.getByText('Configuración')).toBeInTheDocument();
    });

    it('should have correct hrefs for navigation items', () => {
      render(<Sidebar />);
      
      expect(screen.getByRole('link', { name: /avatares/i })).toHaveAttribute('href', '/dashboard');
      expect(screen.getByRole('link', { name: /perfil/i })).toHaveAttribute('href', '/dashboard/profile');
      expect(screen.getByRole('link', { name: /suscripción/i })).toHaveAttribute('href', '/dashboard/subscription');
      expect(screen.getByRole('link', { name: /configuración/i })).toHaveAttribute('href', '/dashboard/settings');
    });

    it('should highlight active navigation item for dashboard', () => {
      mockPathname.mockReturnValue('/dashboard');
      render(<Sidebar />);
      
      const avatarsLink = screen.getByRole('link', { name: /avatares/i });
      expect(avatarsLink).toHaveClass('bg-sidebar-accent');
    });

    it('should highlight active navigation item for profile', () => {
      mockPathname.mockReturnValue('/dashboard/profile');
      render(<Sidebar />);
      
      const profileLink = screen.getByRole('link', { name: /perfil/i });
      expect(profileLink).toHaveClass('bg-sidebar-accent');
    });

    it('should highlight active navigation item for subscription', () => {
      mockPathname.mockReturnValue('/dashboard/subscription');
      render(<Sidebar />);
      
      const subscriptionLink = screen.getByRole('link', { name: /suscripción/i });
      expect(subscriptionLink).toHaveClass('bg-sidebar-accent');
    });

    it('should highlight active navigation item for settings', () => {
      mockPathname.mockReturnValue('/dashboard/settings');
      render(<Sidebar />);
      
      const settingsLink = screen.getByRole('link', { name: /configuración/i });
      expect(settingsLink).toHaveClass('bg-sidebar-accent');
    });

    it('should highlight active navigation item for nested routes', () => {
      mockPathname.mockReturnValue('/dashboard/profile/edit');
      render(<Sidebar />);
      
      const profileLink = screen.getByRole('link', { name: /perfil/i });
      expect(profileLink).toHaveClass('bg-sidebar-accent');
    });
  });

  describe('User Section', () => {
    it('should display user display name', () => {
      render(<Sidebar />);
      
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should display user email', () => {
      render(<Sidebar />);
      
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should display user plan badge', () => {
      render(<Sidebar />);
      
      expect(screen.getByText('plus')).toBeInTheDocument();
      expect(screen.getByText('Plan actual')).toBeInTheDocument();
    });

    it('should fallback to email prefix when no display name', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      jest.spyOn(require('@/lib/store/auth'), 'useAuthStore').mockReturnValue({
        user: { ...mockUser, display_name: null },
        logout: mockLogout,
      });
      
      render(<Sidebar />);
      
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    it('should show default plan when user has no plan', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      jest.spyOn(require('@/lib/store/auth'), 'useAuthStore').mockReturnValue({
        user: { ...mockUser, plan: null },
        logout: mockLogout,
      });
      
      render(<Sidebar />);
      
      expect(screen.getByText('free')).toBeInTheDocument();
    });
  });

  describe('Language Selector', () => {
    it('should render language selector', () => {
      render(<Sidebar />);
      
      expect(screen.getByTestId('language-selector')).toBeInTheDocument();
    });

    it('should pass current locale to language selector', () => {
      render(<Sidebar />);
      
      expect(screen.getByText('Language: es')).toBeInTheDocument();
    });
  });

  describe('Logout', () => {
    it('should render logout button', () => {
      render(<Sidebar />);
      
      expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
    });

    it('should call logout when button is clicked', () => {
      render(<Sidebar />);
      
      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
      fireEvent.click(logoutButton);
      
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have navigation landmark', () => {
      render(<Sidebar />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have aside element', () => {
      const { container } = render(<Sidebar />);
      
      expect(container.querySelector('aside')).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should have fixed positioning', () => {
      const { container } = render(<Sidebar />);
      
      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('fixed');
    });

    it('should have correct width', () => {
      const { container } = render(<Sidebar />);
      
      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('w-64');
    });
  });
});

