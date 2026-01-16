// __tests__/pages/register.test.tsx
// Tests para Register Page de NEXO v2.0
// Cobertura: Rendering, Validación, Submit, Errores, Navegación, Legal & Compliance

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '@/app/(auth)/register/page';

// Helper to get a valid adult date of birth (25 years ago)
const getAdultDateOfBirth = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 25);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

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
        // Legal & Compliance V19
        dateOfBirth: 'Fecha de nacimiento',
        dateOfBirthRequired: 'La fecha de nacimiento es requerida',
        dateOfBirthInvalid: 'Fecha de nacimiento inválida',
        mustBe18: 'Debes ser mayor de 18 años',
        tosAcceptance: 'Acepto los',
        termsOfService: 'Términos de Servicio',
        privacyPolicy: 'Política de Privacidad',
        and: 'y la',
        tosRequired: 'Debes aceptar los términos de servicio',
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

    // Legal & Compliance V19 - Rendering
    it('renders date of birth input with label', () => {
      render(<RegisterPage />);
      expect(screen.getByLabelText('Fecha de nacimiento')).toBeInTheDocument();
      expect(screen.getByTestId('register-date-of-birth')).toBeInTheDocument();
    });

    it('renders terms of service checkbox', () => {
      render(<RegisterPage />);
      expect(screen.getByTestId('register-tos-checkbox')).toBeInTheDocument();
      // The label text is split across elements, so use a more flexible matcher
      expect(screen.getByLabelText(/Acepto los/)).toBeInTheDocument();
    });

    it('renders terms and privacy links', () => {
      render(<RegisterPage />);
      expect(screen.getByRole('link', { name: 'Términos de Servicio' })).toHaveAttribute('href', '/terms');
      expect(screen.getByRole('link', { name: 'Política de Privacidad' })).toHaveAttribute('href', '/privacy');
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

      // Fill date of birth (Legal & Compliance V19)
      const dobInput = screen.getByTestId('register-date-of-birth');
      fireEvent.change(dobInput, { target: { value: getAdultDateOfBirth() } });

      // Accept Terms of Service (Legal & Compliance V19)
      const tosCheckbox = screen.getByTestId('register-tos-checkbox');
      await userEvent.click(tosCheckbox);
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          display_name: '',
          email: 'newuser@nexo.com',
          password: 'securepass123',
          date_of_birth: getAdultDateOfBirth(),
          tos_accepted: true,
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

      // Fill date of birth (Legal & Compliance V19)
      const dobInput = screen.getByTestId('register-date-of-birth');
      fireEvent.change(dobInput, { target: { value: getAdultDateOfBirth() } });

      // Accept Terms of Service (Legal & Compliance V19)
      const tosCheckbox = screen.getByTestId('register-tos-checkbox');
      await userEvent.click(tosCheckbox);
      
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          display_name: 'Juan',
          email: 'juan@nexo.com',
          password: 'securepass123',
          date_of_birth: getAdultDateOfBirth(),
          tos_accepted: true,
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

      // Fill date of birth (Legal & Compliance V19)
      const dobInput = screen.getByTestId('register-date-of-birth');
      fireEvent.change(dobInput, { target: { value: getAdultDateOfBirth() } });

      // Accept Terms of Service (Legal & Compliance V19)
      const tosCheckbox = screen.getByTestId('register-tos-checkbox');
      await userEvent.click(tosCheckbox);
      
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

      // Fill date of birth (Legal & Compliance V19)
      const dobInput = screen.getByTestId('register-date-of-birth');
      fireEvent.change(dobInput, { target: { value: getAdultDateOfBirth() } });

      // Accept Terms of Service (Legal & Compliance V19)
      const tosCheckbox = screen.getByTestId('register-tos-checkbox');
      await userEvent.click(tosCheckbox);
      
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

      // Fill date of birth (Legal & Compliance V19)
      const dobInput = screen.getByTestId('register-date-of-birth');
      fireEvent.change(dobInput, { target: { value: getAdultDateOfBirth() } });

      // Accept Terms of Service (Legal & Compliance V19)
      const tosCheckbox = screen.getByTestId('register-tos-checkbox');
      await userEvent.click(tosCheckbox);
      
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

      // Fill date of birth (Legal & Compliance V19)
      const dobInput = screen.getByTestId('register-date-of-birth');
      fireEvent.change(dobInput, { target: { value: getAdultDateOfBirth() } });

      // Accept Terms of Service (Legal & Compliance V19)
      const tosCheckbox = screen.getByTestId('register-tos-checkbox');
      await userEvent.click(tosCheckbox);
      
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
      // Legal & Compliance V19
      expect(screen.getByTestId('register-date-of-birth')).toBeDisabled();
      expect(screen.getByTestId('register-tos-checkbox')).toBeDisabled();
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

    it('date of birth input has type date', () => {
      render(<RegisterPage />);
      expect(screen.getByTestId('register-date-of-birth')).toHaveAttribute('type', 'date');
    });
  });

  // ============================================
  // LEGAL & COMPLIANCE TESTS (V19)
  // ============================================

  describe('Legal & Compliance Fields', () => {
    it('should show error when date of birth is not provided', async () => {
      render(<RegisterPage />);
      
      // Fill other required fields but not date_of_birth
      await userEvent.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('Contraseña'), 'Test1234');
      await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'Test1234');
      
      // Accept TOS but don't fill date
      const tosCheckbox = screen.getByTestId('register-tos-checkbox');
      await userEvent.click(tosCheckbox);
      
      // Submit
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);
      
      // Should show date of birth error
      await waitFor(() => {
        expect(screen.getByTestId('register-date-of-birth-error')).toBeInTheDocument();
      });
    });

    it('should show error when TOS is not accepted', async () => {
      render(<RegisterPage />);
      
      // Fill all fields but don't accept TOS
      await userEvent.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('Contraseña'), 'Test1234');
      await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'Test1234');
      
      const dobInput = screen.getByTestId('register-date-of-birth');
      await userEvent.clear(dobInput);
      await userEvent.type(dobInput, getAdultDateOfBirth());
      
      // Submit without accepting TOS
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);
      
      // Should show TOS error
      await waitFor(() => {
        expect(screen.getByTestId('register-tos-error')).toBeInTheDocument();
      });
    });

    it('should show error for underage users', async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);
      
      // Fill all fields with underage date
      await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
      await user.type(screen.getByLabelText('Contraseña'), 'Test1234');
      await user.type(screen.getByLabelText('Confirmar contraseña'), 'Test1234');
      
      // Set date to 16 years ago (underage) using fireEvent for reliable date input handling
      const underageDate = new Date();
      underageDate.setFullYear(underageDate.getFullYear() - 16);
      const underageDateString = underageDate.toISOString().split('T')[0];
      
      const dobInput = screen.getByTestId('register-date-of-birth');
      // Use fireEvent with bubbling to properly trigger react-hook-form handlers
      fireEvent.change(dobInput, { target: { value: underageDateString } });
      // Also dispatch a blur event to ensure validation runs
      fireEvent.blur(dobInput);
      
      // Accept TOS
      const tosCheckbox = screen.getByTestId('register-tos-checkbox');
      await user.click(tosCheckbox);
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      await user.click(submitButton);
      
      // The form validation should prevent submission for underage users
      await waitFor(() => {
        // Either the error element is shown OR register was not called (validation failed)
        const hasError = screen.queryByTestId('register-date-of-birth-error') !== null;
        const registerNotCalled = mockRegister.mock.calls.length === 0;
        expect(hasError || registerNotCalled).toBe(true);
      });
      
      // Verify the register function was NOT called (validation should have blocked it)
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should include date_of_birth and tos_accepted in register call', async () => {
      render(<RegisterPage />);
      
      // Fill all fields
      await userEvent.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('Contraseña'), 'Test1234');
      await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'Test1234');
      
      const dobInput = screen.getByTestId('register-date-of-birth');
      await userEvent.clear(dobInput);
      await userEvent.type(dobInput, getAdultDateOfBirth());
      
      const tosCheckbox = screen.getByTestId('register-tos-checkbox');
      await userEvent.click(tosCheckbox);
      
      // Submit
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);
      
      // Verify register was called with all fields
      await waitFor(() => {
        const callArgs = mockRegister.mock.calls[0][0];
        expect(callArgs).toHaveProperty('date_of_birth', getAdultDateOfBirth());
        expect(callArgs).toHaveProperty('tos_accepted', true);
      });
    });

    it('allows users exactly 18 years old to register', async () => {
      render(<RegisterPage />);
      
      // Fill all fields with exactly 18 years old
      await userEvent.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
      await userEvent.type(screen.getByLabelText('Contraseña'), 'Test1234');
      await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'Test1234');
      
      // Set date to exactly 18 years ago
      const eighteenDate = new Date();
      eighteenDate.setFullYear(eighteenDate.getFullYear() - 18);
      const dobInput = screen.getByTestId('register-date-of-birth');
      fireEvent.change(dobInput, { target: { value: eighteenDate.toISOString().split('T')[0] } });
      
      // Accept TOS
      const tosCheckbox = screen.getByTestId('register-tos-checkbox');
      await userEvent.click(tosCheckbox);
      
      // Submit
      const submitButton = screen.getByRole('button', { name: 'Crear Cuenta' });
      fireEvent.click(submitButton);
      
      // Should not show date of birth error - form should be valid
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });
    });
  });
});

