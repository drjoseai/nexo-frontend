/**
 * Toast Service Tests
 * @module __tests__/lib/services/toast-service.test
 */

import { toast, parseApiError } from '@/lib/services/toast-service';
import { toast as sonnerToast } from 'sonner';

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(() => 'toast-id-1'),
    error: jest.fn(() => 'toast-id-2'),
    warning: jest.fn(() => 'toast-id-3'),
    info: jest.fn(() => 'toast-id-4'),
    loading: jest.fn(() => 'toast-id-5'),
    dismiss: jest.fn(),
    promise: jest.fn((promise) => promise),
  },
}));

describe('Toast Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('should call sonner success with message', () => {
      toast.success('Operation successful');
      
      expect(sonnerToast.success).toHaveBeenCalledWith('Operation successful', {
        duration: 3000,
        description: undefined,
        id: undefined,
        action: undefined,
      });
    });

    it('should accept custom duration', () => {
      toast.success('Success', { duration: 5000 });
      
      expect(sonnerToast.success).toHaveBeenCalledWith('Success', {
        duration: 5000,
        description: undefined,
        id: undefined,
        action: undefined,
      });
    });

    it('should accept description', () => {
      toast.success('Success', { description: 'Additional info' });
      
      expect(sonnerToast.success).toHaveBeenCalledWith('Success', {
        duration: 3000,
        description: 'Additional info',
        id: undefined,
        action: undefined,
      });
    });

    it('should return toast ID', () => {
      const id = toast.success('Success');
      expect(id).toBe('toast-id-1');
    });
  });

  describe('error', () => {
    it('should call sonner error with message', () => {
      toast.error('Something went wrong');
      
      expect(sonnerToast.error).toHaveBeenCalledWith('Something went wrong', {
        duration: 5000,
        description: undefined,
        id: undefined,
        action: undefined,
      });
    });

    it('should have longer default duration than success', () => {
      toast.error('Error');
      toast.success('Success');
      
      const errorCall = (sonnerToast.error as jest.Mock).mock.calls[0][1];
      const successCall = (sonnerToast.success as jest.Mock).mock.calls[0][1];
      
      expect(errorCall.duration).toBeGreaterThan(successCall.duration);
    });
  });

  describe('warning', () => {
    it('should call sonner warning with message', () => {
      toast.warning('Be careful');
      
      expect(sonnerToast.warning).toHaveBeenCalledWith('Be careful', {
        duration: 4000,
        description: undefined,
        id: undefined,
        action: undefined,
      });
    });
  });

  describe('info', () => {
    it('should call sonner info with message', () => {
      toast.info('For your information');
      
      expect(sonnerToast.info).toHaveBeenCalledWith('For your information', {
        duration: 4000,
        description: undefined,
        id: undefined,
        action: undefined,
      });
    });
  });

  describe('loading', () => {
    it('should call sonner loading with infinite duration', () => {
      toast.loading('Please wait...');
      
      expect(sonnerToast.loading).toHaveBeenCalledWith('Please wait...', {
        duration: Infinity,
        description: undefined,
        id: undefined,
      });
    });

    it('should return toast ID for later dismissal', () => {
      const id = toast.loading('Loading...');
      expect(id).toBe('toast-id-5');
    });
  });

  describe('dismiss', () => {
    it('should dismiss specific toast by ID', () => {
      toast.dismiss('toast-123');
      expect(sonnerToast.dismiss).toHaveBeenCalledWith('toast-123');
    });

    it('should dismiss all toasts when no ID provided', () => {
      toast.dismiss();
      expect(sonnerToast.dismiss).toHaveBeenCalledWith();
    });
  });

  describe('promise', () => {
    it('should track promise state', async () => {
      const promise = Promise.resolve('data');
      const messages = {
        loading: 'Loading...',
        success: 'Done!',
        error: 'Failed',
      };

      await toast.promise(promise, messages);

      expect(sonnerToast.promise).toHaveBeenCalledWith(promise, messages);
    });
  });

  describe('parseApiError', () => {
    it('should return string errors as-is', () => {
      expect(parseApiError('Simple error')).toBe('Simple error');
    });

    it('should extract message from error object', () => {
      const error = { message: 'Error message' };
      expect(parseApiError(error)).toBe('Error message');
    });

    it('should extract detail from FastAPI error', () => {
      const error = { detail: 'FastAPI error detail' };
      expect(parseApiError(error)).toBe('FastAPI error detail');
    });

    it('should translate "Invalid credentials" error', () => {
      const error = { message: 'Invalid credentials' };
      expect(parseApiError(error)).toBe('Credenciales inválidas. Verifica tu email y contraseña.');
    });

    it('should translate "User already exists" error', () => {
      const error = { message: 'User already exists' };
      expect(parseApiError(error)).toBe('Este email ya está registrado.');
    });

    it('should translate "Token expired" error', () => {
      const error = { message: 'Token expired' };
      expect(parseApiError(error)).toBe('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    });

    it('should translate "Network Error"', () => {
      const error = { message: 'Network Error' };
      expect(parseApiError(error)).toBe('Error de conexión. Verifica tu internet.');
    });

    it('should return default message for unknown errors', () => {
      expect(parseApiError(null)).toBe('Ha ocurrido un error inesperado. Por favor, intenta de nuevo.');
      expect(parseApiError(undefined)).toBe('Ha ocurrido un error inesperado. Por favor, intenta de nuevo.');
      expect(parseApiError({})).toBe('Ha ocurrido un error inesperado. Por favor, intenta de nuevo.');
    });
  });

  describe('apiError', () => {
    it('should parse and display error toast', () => {
      toast.apiError({ message: 'API failed' });
      
      expect(sonnerToast.error).toHaveBeenCalledWith('API failed', expect.any(Object));
    });

    it('should use fallback message when parsing fails', () => {
      toast.apiError(null, 'Custom fallback');
      
      expect(sonnerToast.error).toHaveBeenCalled();
    });
  });
});

