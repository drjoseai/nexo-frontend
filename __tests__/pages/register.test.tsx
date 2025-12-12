// __tests__/pages/register.test.tsx
// Tests para Register Page de NEXO v2.0
// Cobertura: Rendering, Validación, Submit, Errores, Navegación

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '@/app/(auth)/register/page';

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
  useTranslations: (namespace: string) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      auth: {
        createAccount: 'Crear Cuenta',
        createAccountDescription: 'Únete a NEXO y conoce a tus compañeros de IA',
        displayName: 'Nombre para mostrar',
        email: 'Correo electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar contraseña',
        hasAccount: '¿Ya tienes cuenta?',
        login: 'Iniciar Sesión',
        creatingAccount: 'Creando cuenta...',
        registerSuccess: '¡Cuenta creada exitosamente!',
        registerSuccessDescription: 'Bienvenido a NEXO',
        registerError: 'Error al crear cuenta',
        registerErrorDescription: 'Error al crear la cuenta. Por favor, intenta de nuevo.',
        emailRequired: 'El email es requerido',
        emailInvalid: 'Formato de email inválido',
        passwordMinLength8: 'La contraseña debe tener al menos 8 caracteres',
        passwordMaxLength: 'La contraseña es demasiado larga',
        passwordNeedsNumber: 'La contraseña debe contener al menos un número',
        confirmPasswordRequired: 'Debes confirmar tu contraseña',
        passwordsDoNotMatch: 'Las contraseñas no coinciden',
      },
      common: {
        optional: 'opcional',
      },
    };
    return translations[namespace]?.[key] || key;
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
const mockRegister = jest.fn();
let mockIsLoading = false;
let mockIsAuthenticated = false;

jest.mock('@/lib/store/auth', () => ({
  useAuthStore: () => ({
    register: mockRegister,
    isLoading: mockIsLoading,
    isAuthenticated: mockIsAuthenticated,
    user: null,
  }),
}));

// ============================================
// TEST SETUP
// ============================================

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading = false;
    mockIsAuthenticated = false;
    mockRegister.mockResolvedValue({});
  });

  // ============================================
  // RENDERING TESTS
  // ============================================

  describe('Rendering', () => {
    it('renders the NEXO logo/brand', () => {
      render(<RegisterPage />);
      expect(screen.getByText('NEXO')).toBeInTheDocument();
    });

    it('renders the create account title', () => {
      render(<RegisterPage />);
      const titles = screen.getAllByText('Crear Cuenta');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('renders the description text', () => {
      render(<RegisterPage />);
      expect(screen.getByText('Únete a NEXO y conoce a tus compañeros de IA')).toBeInTheDocument();
    });

    it('renders display name input with optional label', () => {
      render(<RegisterPage />);
      expect(screen.getByLabelText(/Nombre para mostrar/)).toBeInTheDocument();
      expect(screen.getByText('(opcional)')).toBeInTheDocument();
    });

    it('renders email input with label', () => {
      render(<RegisterPage />);
      expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    });

    it('renders password input with label', () => {
      render(<RegisterPage />);
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    });

    it('renders confirm password input with label', () => {
      render(<RegisterPage />);
      expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<RegisterPage />);
      expect(screen.getByRole('button', { name: 'Crear Cuenta' })).toBeInTheDocument();
    });

    it('renders login link', () => {
      render(<RegisterPage />);
      expect(screen.getByText('¿Ya tienes cuenta?')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Iniciar Sesión' })).toHaveAttribute('href', '/login');
    });
  });

  // ============================================
  // FORM VALIDATION TESTS
  // ============================================

  describe('Form Validation', () => {
    it('shows error when email is empty', async () => {
      render(<RegisterPage />);
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('El email es requerido')).toBeInTheDocument();
      });
    });

    it('shows error when email format is invalid', async () => {
      render(<RegisterPage />);
      
      // Get the form and override noValidate to bypass browser validation
      const form = document.querySelector('form') as HTMLFormElement;
      form.noValidate = true;
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');
      
      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Formato de email inválido')).toBeInTheDocument();
      });
    });

    it('shows error when password is too short', async () => {
      render(<RegisterPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, '1234567');
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('La contraseña debe tener al menos 8 caracteres')).toBeInTheDocument();
      });
    });

    it('shows error when password has no number', async () => {
      render(<RegisterPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'abcdefgh');
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('La contraseña debe contener al menos un número')).toBeInTheDocument();
      });
    });

    it('shows error when confirm password is empty', async () => {
      render(<RegisterPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Debes confirmar tu contraseña')).toBeInTheDocument();
      });
    });

    it('shows error when passwords do not match', async () => {
      render(<RegisterPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmInput, 'differentpass1');
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // FORM SUBMISSION TESTS
  // ============================================

  describe('Form Submission', () => {
    it('calls register with correct data on valid submit (without display_name)', async () => {
      render(<RegisterPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');
      
      await userEvent.type(emailInput, 'newuser@nexo.com');
      await userEvent.type(passwordInput, 'securepass123');
      await userEvent.type(confirmInput, 'securepass123');
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          display_name: '',
          email: 'newuser@nexo.com',
          password: 'securepass123',
        });
      });
    });

    it('calls register with display_name when provided', async () => {
      render(<RegisterPage />);
      
      const displayNameInput = screen.getByLabelText(/Nombre para mostrar/);
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');
      
      await userEvent.type(displayNameInput, 'Juan');
      await userEvent.type(emailInput, 'juan@nexo.com');
      await userEvent.type(passwordInput, 'securepass123');
      await userEvent.type(confirmInput, 'securepass123');
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          display_name: 'Juan',
          email: 'juan@nexo.com',
          password: 'securepass123',
        });
      });
    });

    it('does not include confirm_password in API call', async () => {
      render(<RegisterPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');
      
      await userEvent.type(emailInput, 'test@nexo.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const callArgs = mockRegister.mock.calls[0][0];
        expect(callArgs).not.toHaveProperty('confirm_password');
      });
    });

    it('shows success toast on successful registration', async () => {
      mockRegister.mockResolvedValue({});
      render(<RegisterPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');
      
      await userEvent.type(emailInput, 'newuser@nexo.com');
      await userEvent.type(passwordInput, 'securepass123');
      await userEvent.type(confirmInput, 'securepass123');
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          '¡Cuenta creada exitosamente!',
          expect.objectContaining({
            description: 'Bienvenido a NEXO',
          })
        );
      });
    });

    it('navigates to dashboard on successful registration', async () => {
      mockRegister.mockResolvedValue({});
      render(<RegisterPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');
      
      await userEvent.type(emailInput, 'newuser@nexo.com');
      await userEvent.type(passwordInput, 'securepass123');
      await userEvent.type(confirmInput, 'securepass123');
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows error toast on registration failure', async () => {
      mockRegister.mockRejectedValue(new Error('Email already exists'));
      render(<RegisterPage />);
      
      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const confirmInput = screen.getByLabelText('Confirmar contraseña');
      
      await userEvent.type(emailInput, 'existing@nexo.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Error al crear cuenta',
          expect.objectContaining({
            description: 'Email already exists',
          })
        );
      });
    });
  });

  // ============================================
  // LOADING STATE TESTS
  // ============================================

  describe('Loading State', () => {
    it('disables all inputs while loading', () => {
      mockIsLoading = true;
      render(<RegisterPage />);
      
      expect(screen.getByLabelText(/Nombre para mostrar/)).toBeDisabled();
      expect(screen.getByLabelText('Correo electrónico')).toBeDisabled();
      expect(screen.getByLabelText('Contraseña')).toBeDisabled();
      expect(screen.getByLabelText('Confirmar contraseña')).toBeDisabled();
    });

    it('disables submit button while loading', () => {
      mockIsLoading = true;
      render(<RegisterPage />);
      
      expect(screen.getByRole('button', { name: 'Creando cuenta...' })).toBeDisabled();
    });

    it('shows loading text on submit button', () => {
      mockIsLoading = true;
      render(<RegisterPage />);
      
      expect(screen.getByRole('button', { name: 'Creando cuenta...' })).toBeInTheDocument();
    });
  });

  // ============================================
  // AUTHENTICATION REDIRECT TESTS
  // ============================================

  describe('Authentication Redirect', () => {
    it('redirects to dashboard if already authenticated', () => {
      mockIsAuthenticated = true;
      render(<RegisterPage />);
      
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  describe('Accessibility', () => {
    it('has correct autocomplete attributes', () => {
      render(<RegisterPage />);
      
      expect(screen.getByLabelText(/Nombre para mostrar/)).toHaveAttribute('autocomplete', 'name');
      expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('autocomplete', 'email');
      expect(screen.getByLabelText('Contraseña')).toHaveAttribute('autocomplete', 'new-password');
      expect(screen.getByLabelText('Confirmar contraseña')).toHaveAttribute('autocomplete', 'new-password');
    });

    it('password inputs have type password', () => {
      render(<RegisterPage />);
      expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText('Confirmar contraseña')).toHaveAttribute('type', 'password');
    });
  });
});

