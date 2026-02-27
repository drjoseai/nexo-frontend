// __tests__/pages/dashboard.test.tsx
// Tests para Dashboard Page de NEXO v2.0
// Cobertura: Rendering, Loading, Avatars, Plan Banner, Empty State

import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';

// ============================================
// MOCKS
// ============================================

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      greeting: 'Hola',
      whoToTalkTo: '¿Con quién quieres hablar hoy?',
      unlockAllAvatars: 'Desbloquea todos los avatares',
      upgradeToPlus: 'Actualiza a Plus para acceder a todos los avatares',
      viewPlans: 'Ver Planes',
      welcomeToNexo: '¡Bienvenido a NEXO!',
      clickAvatarToStart: 'Haz clic en un avatar para comenzar a conversar',
    };
    return translations[key] || key;
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock auth store
let mockUser: { display_name?: string; plan: string } | null = null;

jest.mock('@/lib/store/auth', () => ({
  useAuthStore: () => ({
    user: mockUser,
  }),
}));

// Mock AvatarCard components
jest.mock('@/components/avatars/AvatarCard', () => ({
  AvatarCard: ({ avatarId }: { avatarId: string }) => (
    <div data-testid={`avatar-card-${avatarId}`}>Avatar Card: {avatarId}</div>
  ),
  AvatarCardSkeleton: () => (
    <div data-testid="avatar-skeleton">Loading skeleton</div>
  ),
}));

// Mock avatar types
jest.mock('@/types/avatar', () => ({
  getAllAvatars: () => [
    { id: 'lia', name: 'Lía' },
    { id: 'mia', name: 'Mía' },
    { id: 'allan', name: 'Allan' },
  ],
  AVATARS: {},
  RELATIONSHIP_LEVELS: [],
  isAvatarAvailableForPlan: jest.fn(() => true),
}));

// Mock avatar API
jest.mock('@/lib/api/avatars', () => ({
  getRelationshipsSummary: jest.fn().mockResolvedValue({
    lia: { relationship_type: 'assistant', message_count: 5 },
    mia: { relationship_type: 'assistant', message_count: 3 },
    allan: { relationship_type: 'assistant', message_count: 0 },
  }),
}));

// ============================================
// TEST SETUP
// ============================================

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { display_name: 'Usuario Test', plan: 'free' };
  });

  // ============================================
  // RENDERING TESTS
  // ============================================

  describe('Rendering', () => {
    it('renders the greeting with user name', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Hola/)).toBeInTheDocument();
        expect(screen.getByText(/, Usuario Test!/)).toBeInTheDocument();
      });
    });

    it('renders greeting without name when display_name is empty', async () => {
      mockUser = { plan: 'free' };
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Hola/)).toBeInTheDocument();
      });
    });

    it('renders the description text', async () => {
      render(<DashboardPage />);
      
      expect(screen.getByText('¿Con quién quieres hablar hoy?')).toBeInTheDocument();
    });
  });

  // ============================================
  // LOADING STATE TESTS
  // ============================================

  describe('Loading State', () => {
    it('shows skeletons while loading', () => {
      render(<DashboardPage />);
      
      const skeletons = screen.getAllByTestId('avatar-skeleton');
      expect(skeletons).toHaveLength(3);
    });

    it('shows avatar cards after loading', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('avatar-card-lia')).toBeInTheDocument();
        expect(screen.getByTestId('avatar-card-mia')).toBeInTheDocument();
        expect(screen.getByTestId('avatar-card-allan')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('hides skeletons after loading', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('avatar-skeleton')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  // ============================================
  // PLAN BANNER TESTS
  // ============================================

  describe('Plan Upgrade Banner', () => {
    it('shows upgrade banner for free plan users', async () => {
      mockUser = { display_name: 'Free User', plan: 'free' };
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Desbloquea todos los avatares')).toBeInTheDocument();
        expect(screen.getByText('Actualiza a Plus para acceder a todos los avatares')).toBeInTheDocument();
      });
    });

    it('does not show upgrade banner for trial plan users', async () => {
      mockUser = { display_name: 'Trial User', plan: 'trial' };
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Desbloquea todos los avatares')).not.toBeInTheDocument();
      });
    });

    it('has link to subscription page', async () => {
      mockUser = { display_name: 'Free User', plan: 'free' };
      render(<DashboardPage />);
      
      await waitFor(() => {
        const viewPlansLink = screen.getByRole('link', { name: 'Ver Planes' });
        expect(viewPlansLink).toHaveAttribute('href', '/dashboard/subscription');
      });
    });

    it('does not show banner for plus plan users', async () => {
      mockUser = { display_name: 'Plus User', plan: 'plus' };
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Desbloquea todos los avatares')).not.toBeInTheDocument();
      });
    });

    it('does not show banner for premium plan users', async () => {
      mockUser = { display_name: 'Premium User', plan: 'premium' };
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Desbloquea todos los avatares')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================
  // WELCOME MESSAGE TESTS
  // ============================================

  describe('Welcome Message for New Users', () => {
    it('shows welcome tip when no messages have been sent', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('¡Bienvenido a NEXO!')).toBeInTheDocument();
        expect(screen.getByText(/Haz clic en un avatar para comenzar a conversar/)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  // ============================================
  // AVATAR GRID TESTS
  // ============================================

  describe('Avatar Grid', () => {
    it('renders all 3 avatars', async () => {
      render(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('avatar-card-lia')).toBeInTheDocument();
        expect(screen.getByTestId('avatar-card-mia')).toBeInTheDocument();
        expect(screen.getByTestId('avatar-card-allan')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  // ============================================
  // USER CONTEXT TESTS
  // ============================================

  describe('User Context', () => {
    it('defaults to free plan when user.plan is undefined', async () => {
      mockUser = { display_name: 'User' } as { display_name: string; plan: string };
      render(<DashboardPage />);
      
      // Should show upgrade banner (implies free plan default)
      await waitFor(() => {
        expect(screen.getByText('Desbloquea todos los avatares')).toBeInTheDocument();
      });
    });

    it('handles null user gracefully', async () => {
      mockUser = null;
      render(<DashboardPage />);
      
      // Should still render without crashing
      await waitFor(() => {
        expect(screen.getByText(/Hola/)).toBeInTheDocument();
      });
    });
  });
});

