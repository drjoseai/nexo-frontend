// __tests__/pages/onboarding.test.tsx
// Tests para Onboarding Page de NEXO v2.0
// Cobertura: Rendering, Auth Guards, Steps Navigation, Form Submission, Skip Flow

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OnboardingPage from '@/app/onboarding/page';

// ============================================
// MOCKS
// ============================================

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock sonner toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

// Mock saveOnboardingProfile
const mockSaveOnboardingProfile = jest.fn();
jest.mock('@/lib/api/onboarding', () => ({
  saveOnboardingProfile: (...args: unknown[]) => mockSaveOnboardingProfile(...args),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  Check: () => <span data-testid="icon-check" />,
}));

// Mock auth store
const mockLoadUser = jest.fn();
let mockIsLoading = false;
let mockIsAuthenticated = true;
let mockUser: {
  display_name?: string | null;
  email?: string;
  preferred_language?: 'es' | 'en';
  onboarding_completed?: boolean;
} | null = null;

jest.mock('@/lib/store/auth', () => ({
  useAuthStore: () => ({
    user: mockUser,
    isAuthenticated: mockIsAuthenticated,
    isLoading: mockIsLoading,
    loadUser: mockLoadUser,
  }),
}));

// ============================================
// TEST SETUP
// ============================================

describe('OnboardingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading = false;
    mockIsAuthenticated = true;
    mockUser = {
      display_name: 'Test User',
      email: 'test@nexo.ai',
      preferred_language: 'es',
      onboarding_completed: false,
    };
    mockSaveOnboardingProfile.mockResolvedValue({
      success: true,
      message: 'Profile saved',
      onboarding_completed: true,
      profile_summary: { name: 'Test User', language: 'es', interests_count: 0, facts_count: 1 },
    });
    mockLoadUser.mockResolvedValue(undefined);
  });

  // ============================================
  // RENDERING & AUTH GUARDS
  // ============================================

  describe('Rendering & Auth Guards', () => {
    it('renders loading spinner when auth is loading', () => {
      mockIsLoading = true;
      render(<OnboardingPage />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('redirects to /login if not authenticated', () => {
      mockIsAuthenticated = false;
      mockUser = null;
      render(<OnboardingPage />);

      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('redirects to /dashboard if onboarding already completed', () => {
      mockUser = {
        display_name: 'Test User',
        email: 'test@nexo.ai',
        preferred_language: 'es',
        onboarding_completed: true,
      };
      render(<OnboardingPage />);

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('renders step 1 (name & language) by default', () => {
      render(<OnboardingPage />);

      expect(screen.getByText('¡Hola! 👋')).toBeInTheDocument();
      expect(screen.getByLabelText('Tu nombre')).toBeInTheDocument();
    });
  });

  // ============================================
  // STEP 1: NAME & LANGUAGE
  // ============================================

  describe('Step 1: Name & Language', () => {
    it('shows name input and language selector', () => {
      render(<OnboardingPage />);

      expect(screen.getByLabelText('Tu nombre')).toBeInTheDocument();
      expect(screen.getByText('Idioma preferido')).toBeInTheDocument();
      expect(screen.getByText('🇪🇸 Español')).toBeInTheDocument();
      expect(screen.getByText('🇺🇸 English')).toBeInTheDocument();
    });

    it('pre-fills name from user.display_name', () => {
      render(<OnboardingPage />);

      const nameInput = screen.getByLabelText('Tu nombre') as HTMLInputElement;
      expect(nameInput.value).toBe('Test User');
    });

    it('allows typing a name', () => {
      mockUser = { ...mockUser!, display_name: '' };
      render(<OnboardingPage />);

      const nameInput = screen.getByLabelText('Tu nombre');
      fireEvent.change(nameInput, { target: { value: 'Carlos' } });

      expect((nameInput as HTMLInputElement).value).toBe('Carlos');
    });

    it('allows selecting language (ES/EN)', () => {
      render(<OnboardingPage />);

      // Default is ES, click EN
      const enButton = screen.getByText('🇺🇸 English');
      fireEvent.click(enButton);

      // After switching to EN, labels should change
      expect(screen.getByText('Hello! 👋')).toBeInTheDocument();
    });

    it('Next button is disabled when name is empty', () => {
      mockUser = { ...mockUser!, display_name: '' };
      render(<OnboardingPage />);

      const nextButton = screen.getByRole('button', { name: /Siguiente/ });
      expect(nextButton).toBeDisabled();
    });

    it('Next button is enabled when name has value', () => {
      render(<OnboardingPage />);

      // Name is pre-filled with 'Test User'
      const nextButton = screen.getByRole('button', { name: /Siguiente/ });
      expect(nextButton).toBeEnabled();
    });
  });

  // ============================================
  // STEP NAVIGATION
  // ============================================

  describe('Step Navigation', () => {
    it('clicking Next advances to step 2', () => {
      render(<OnboardingPage />);

      const nextButton = screen.getByRole('button', { name: /Siguiente/ });
      fireEvent.click(nextButton);

      // Step 2 shows the heading with user name
      expect(screen.getByRole('heading', { name: /Cuéntanos sobre ti/ })).toBeInTheDocument();
    });

    it('clicking Back on step 2 returns to step 1', () => {
      render(<OnboardingPage />);

      // Go to step 2
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      expect(screen.getByRole('heading', { name: /Cuéntanos sobre ti/ })).toBeInTheDocument();

      // Go back to step 1
      fireEvent.click(screen.getByRole('button', { name: /Atrás/ }));
      expect(screen.getByText('¡Hola! 👋')).toBeInTheDocument();
    });

    it('progress bar updates with each step', () => {
      const { container } = render(<OnboardingPage />);

      // Step 1: 1 active bar out of 4
      const bars = container.querySelectorAll('.rounded-full.h-1\\.5');
      const activeBars = container.querySelectorAll('.bg-primary.rounded-full');
      expect(activeBars.length).toBe(1);

      // Go to step 2
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      const activeBarsStep2 = container.querySelectorAll('.bg-primary.rounded-full');
      expect(activeBarsStep2.length).toBe(2);
    });

    it('shows "Step X of 4" text', () => {
      render(<OnboardingPage />);

      expect(screen.getByText('Paso 1 de 4')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      expect(screen.getByText('Paso 2 de 4')).toBeInTheDocument();
    });
  });

  // ============================================
  // STEP 2: ABOUT YOU
  // ============================================

  describe('Step 2: About You', () => {
    const goToStep2 = () => {
      render(<OnboardingPage />);
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    };

    it('shows location, profession, and age range fields', () => {
      goToStep2();

      expect(screen.getByLabelText(/¿De dónde eres/)).toBeInTheDocument();
      expect(screen.getByLabelText(/¿A qué te dedicas/)).toBeInTheDocument();
      expect(screen.getByText(/Rango de edad/)).toBeInTheDocument();
    });

    it('all fields are optional (Next is always enabled)', () => {
      goToStep2();

      const nextButton = screen.getByRole('button', { name: /Siguiente/ });
      expect(nextButton).toBeEnabled();
    });
  });

  // ============================================
  // STEP 3: INTERESTS & STYLE
  // ============================================

  describe('Step 3: Interests & Style', () => {
    const goToStep3 = () => {
      render(<OnboardingPage />);
      // Step 1 → Step 2
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      // Step 2 → Step 3
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    };

    it('shows interest options as toggle buttons', () => {
      goToStep3();

      expect(screen.getByText('🎵 Música')).toBeInTheDocument();
      expect(screen.getByText('🎬 Películas/Series')).toBeInTheDocument();
      expect(screen.getByText('✈️ Viajes')).toBeInTheDocument();
      expect(screen.getByText('💻 Tecnología')).toBeInTheDocument();
    });

    it('clicking an interest toggles it on/off', () => {
      goToStep3();

      const musicButton = screen.getByText('🎵 Música');

      // Click to select
      fireEvent.click(musicButton);
      expect(musicButton.closest('button')).toHaveClass('border-primary');

      // Click to deselect
      fireEvent.click(musicButton);
      expect(musicButton.closest('button')).not.toHaveClass('border-primary');
    });

    it('shows communication style options', () => {
      goToStep3();

      expect(screen.getByText('😊 Casual y relajado')).toBeInTheDocument();
      expect(screen.getByText('⚖️ Equilibrado')).toBeInTheDocument();
      expect(screen.getByText('👔 Más formal')).toBeInTheDocument();
    });
  });

  // ============================================
  // STEP 4: WHAT YOU'RE LOOKING FOR
  // ============================================

  describe('Step 4: What You\'re Looking For', () => {
    const goToStep4 = () => {
      render(<OnboardingPage />);
      // Step 1 → Step 2 → Step 3 → Step 4
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    };

    it('shows looking_for options', () => {
      goToStep4();

      expect(screen.getByText('💬 Compañía y conversación')).toBeInTheDocument();
      expect(screen.getByText('💛 Apoyo emocional')).toBeInTheDocument();
      expect(screen.getByText('😄 Diversión y risas')).toBeInTheDocument();
      expect(screen.getByText('🧠 Consejos y perspectiva')).toBeInTheDocument();
      expect(screen.getByText('❤️ Conexión romántica')).toBeInTheDocument();
      expect(screen.getByText('🤝 Amistad genuina')).toBeInTheDocument();
    });

    it('clicking an option toggles it on/off', () => {
      goToStep4();

      const funButton = screen.getByText('😄 Diversión y risas');

      // Click to select
      fireEvent.click(funButton);
      expect(funButton.closest('button')).toHaveClass('border-primary');

      // Click to deselect
      fireEvent.click(funButton);
      expect(funButton.closest('button')).not.toHaveClass('border-primary');
    });

    it('shows "¡Empezar!" submit button instead of Next', () => {
      goToStep4();

      expect(screen.queryByRole('button', { name: /Siguiente/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /¡Empezar!/ })).toBeInTheDocument();
    });
  });

  // ============================================
  // FORM SUBMISSION
  // ============================================

  describe('Form Submission', () => {
    const goToStep4AndSubmit = async () => {
      render(<OnboardingPage />);

      // Type a name (already pre-filled) and go through all steps
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

      // Submit on step 4
      fireEvent.click(screen.getByRole('button', { name: /¡Empezar!/ }));
    };

    it('calls saveOnboardingProfile with correct data on submit', async () => {
      await goToStep4AndSubmit();

      await waitFor(() => {
        expect(mockSaveOnboardingProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test User',
            preferred_language: 'es',
          })
        );
      });
    });

    it('calls loadUser after successful save', async () => {
      await goToStep4AndSubmit();

      await waitFor(() => {
        expect(mockLoadUser).toHaveBeenCalled();
      });
    });

    it('redirects to /dashboard after successful save', async () => {
      await goToStep4AndSubmit();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows error toast on save failure', async () => {
      mockSaveOnboardingProfile.mockRejectedValueOnce(new Error('Server error'));

      render(<OnboardingPage />);

      // Navigate to step 4
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
      fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /¡Empezar!/ }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Error al guardar perfil. Intenta de nuevo.'
        );
      });
    });
  });

  // ============================================
  // SKIP FLOW
  // ============================================

  describe('Skip Flow', () => {
    it('shows Skip button on step 1', () => {
      render(<OnboardingPage />);

      expect(screen.getByRole('button', { name: /Omitir/ })).toBeInTheDocument();
    });

    it('clicking Skip calls saveOnboardingProfile with minimal data (name + language)', async () => {
      render(<OnboardingPage />);

      fireEvent.click(screen.getByRole('button', { name: /Omitir/ }));

      await waitFor(() => {
        expect(mockSaveOnboardingProfile).toHaveBeenCalledWith({
          name: 'Test User',
          preferred_language: 'es',
        });
      });
    });

    it('redirects to /dashboard after skip', async () => {
      render(<OnboardingPage />);

      fireEvent.click(screen.getByRole('button', { name: /Omitir/ }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });
});
