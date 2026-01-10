// __tests__/pages/login.test.tsx
// Tests para Login Page de NEXO v2.0
// Cobertura: Rendering, Validación, Submit, Errores, Navegación

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/(auth)/login/page';

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

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      login: 'Iniciar Sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      enterCredentials: 'Ingresa tus credenciales para acceder a tu cuenta',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta?',
      register: 'Registrarse',
      loggingIn: 'Iniciando sesión...',
      loginSuccess: '¡Bienvenido de vuelta!',
      loginSuccessDescription: 'Has iniciado sesión exitosamente',
      loginError: 'Error al iniciar sesión',
      loginErrorDescription: 'Error al iniciar sesión. Por favor, verifica tus credenciales.',
      emailRequired: 'El email es requerido',
      emailInvalid: 'Formato de email inválido',
      passwordMinLength6: 'La contraseña debe tener al menos 6 caracteres',
      passwordMaxLength: 'La contraseña es demasiado larga',
    };
    return translations[key] || key;
  },
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

// Mock auth store
const mockLogin = jest.fn();
let mockIsLoading = false;
let mockIsAuthenticated = false;

jest.mock('@/lib/store/auth', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    isLoading: mockIsLoading,
    isAuthenticated: mockIsAuthenticated,
    user: null,
  }),
}));

// ============================================
// TEST SETUP
// ============================================

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading = false;
    mockIsAuthenticated = false;
    mockLogin.mockResolvedValue({});
  });

  // ============================================
  // RENDERING TESTS
  // ============================================

  describe('Rendering', () => {
    it('renders the NEXO logo/brand', () => {
      render(<LoginPage />);
      expect(screen.getByText('NEXO')).toBeInTheDocument();
    });

    it('renders the login title', () => {
      const { container } = render(<LoginPage />);
      const title = container.querySelector('[data-slot="card-title"]');
      expect(title).toHaveTextContent('Iniciar Sesión');
    });

    it('renders the description text', () => {
      render(<LoginPage />);
      expect(screen.getByText('Ingresa tus credenciales para acceder a tu cuenta')).toBeInTheDocument();
    });

    it('renders email input with label', () => {
      render(<LoginPage />);
      expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    });

    it('renders password input with label', () => {
      render(<LoginPage />);
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('renders forgot password button (disabled)', () => {
      render(<LoginPage />);
      const forgotButton = screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' });
      expect(forgotButton).toBeInTheDocument();
      expect(forgotButton).toBeDisabled();
    });

    it('renders submit button', () => {
      render(<LoginPage />);
      expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    });

    it('renders register link', () => {
      render(<LoginPage />);
      expect(screen.getByText('¿No tienes cuenta?')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Registrarse' })).toHaveAttribute('href', '/register');
    });
  });

  // ============================================
  // FORM VALIDATION TESTS
  // ============================================

  describe('Form Validation', () => {
    it('shows error when email is empty', async () => {
      render(<LoginPage />);
      
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('El email es requerido')).toBeInTheDocument();
      });
    });

    it('shows error when email format is invalid', async () => {
      render(<LoginPage />);
      
      // Get the form and override noValidate to bypass browser validation
      const form = document.querySelector('form') as HTMLFormElement;
      form.noValidate = true;
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      
      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Formato de email inválido')).toBeInTheDocument();
      });
    });

    it('shows error when password is too short', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, '12345');
      
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument();
      });
    });

    it('sets aria-invalid on email input when validation fails', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
      
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  // ============================================
  // FORM SUBMISSION TESTS
  // ============================================

  describe('Form Submission', () => {
    it('calls login with correct credentials on valid submit', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      
      await userEvent.type(emailInput, 'test@nexo.com');
      await userEvent.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@nexo.com',
          password: 'password123',
        });
      });
    });

    it('shows success toast on successful login', async () => {
      mockLogin.mockResolvedValue({});
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      
      await userEvent.type(emailInput, 'test@nexo.com');
      await userEvent.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          '¡Bienvenido de vuelta!',
          expect.objectContaining({
            description: 'Has iniciado sesión exitosamente',
          })
        );
      });
    });

    it('navigates to dashboard on successful login', async () => {
      mockLogin.mockResolvedValue({});
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      
      await userEvent.type(emailInput, 'test@nexo.com');
      await userEvent.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows error toast on login failure', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      
      await userEvent.type(emailInput, 'test@nexo.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Error al iniciar sesión',
          expect.objectContaining({
            description: 'Invalid credentials',
          })
        );
      });
    });

    it('shows API error message when available', async () => {
      mockLogin.mockRejectedValue({
        response: { data: { message: 'Usuario no encontrado' } },
      });
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      
      await userEvent.type(emailInput, 'nonexistent@nexo.com');
      await userEvent.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Error al iniciar sesión',
          expect.objectContaining({
            description: 'Usuario no encontrado',
          })
        );
      });
    });
  });

  // ============================================
  // LOADING STATE TESTS
  // ============================================

  describe('Loading State', () => {
    it('disables inputs while loading', () => {
      mockIsLoading = true;
      render(<LoginPage />);
      
      expect(screen.getByLabelText('Correo electrónico')).toBeDisabled();
      expect(screen.getByLabelText('Contraseña')).toBeDisabled();
    });

    it('disables submit button while loading', () => {
      mockIsLoading = true;
      render(<LoginPage />);
      
      expect(screen.getByRole('button', { name: 'Iniciando sesión...' })).toBeDisabled();
    });

    it('shows loading text on submit button', () => {
      mockIsLoading = true;
      render(<LoginPage />);
      
      expect(screen.getByRole('button', { name: 'Iniciando sesión...' })).toBeInTheDocument();
    });
  });

  // ============================================
  // AUTHENTICATION REDIRECT TESTS
  // ============================================

  describe('Authentication Redirect', () => {
    // NOTE: Automatic redirect on isAuthenticated removed to fix race condition (Ventana #7)
    // The previous implementation had a useEffect that redirected when isAuthenticated changed,
    // but this caused a race condition with the onSubmit redirect after successful login.
    // 
    // Current behavior:
    // - Middleware (middleware.ts) handles redirecting authenticated users away from /login
    // - Login component only redirects after successful form submission in onSubmit
    // - This eliminates the race condition and provides more predictable behavior
    //
    // If you need to test the redirect behavior, test the middleware or the onSubmit flow
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  describe('Accessibility', () => {
    it('has correct autocomplete attributes', () => {
      render(<LoginPage />);
      
      expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('autocomplete', 'email');
      expect(screen.getByLabelText('Contraseña')).toHaveAttribute('autocomplete', 'current-password');
    });

    it('email input has type email', () => {
      render(<LoginPage />);
      expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('type', 'email');
    });

    it('password input has type password', () => {
      render(<LoginPage />);
      expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
    });
  });
});

