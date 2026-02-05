// __tests__/lib/api/client.test.ts
// Tests unitarios para el API Client de NEXO v2.0
// Verifica: interceptores, auth headers, error handling, auto-refresh

/* eslint-disable @typescript-eslint/no-require-imports */

import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';


// ============================================
// TYPES
// ============================================

type RequestInterceptor = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
type RequestErrorInterceptor = (error: AxiosError) => Promise<never>;
type ResponseInterceptor = (response: AxiosResponse) => AxiosResponse;
type ResponseErrorInterceptor = (error: AxiosError) => Promise<unknown>;

interface MockAxiosInstance {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
  interceptors: {
    request: { use: jest.Mock };
    response: { use: jest.Mock };
  };
  (config: InternalAxiosRequestConfig): Promise<AxiosResponse>;
}

// ============================================
// MOCK: Axios with interceptor capture
// ============================================

let mockAxiosInstance: MockAxiosInstance;
let capturedRequestInterceptor: RequestInterceptor;
let capturedRequestErrorInterceptor: RequestErrorInterceptor;
let capturedResponseInterceptor: ResponseInterceptor;
let capturedResponseErrorInterceptor: ResponseErrorInterceptor;

// Track if interceptors were registered during import
let interceptorsRegistered = false;
let axiosCreateCalled = false;
let axiosCreateConfig: unknown = null;

jest.mock('axios', () => {
  // Create callable mock instance
  const instanceFn = jest.fn() as unknown as MockAxiosInstance;
  instanceFn.get = jest.fn();
  instanceFn.post = jest.fn();
  instanceFn.put = jest.fn();
  instanceFn.delete = jest.fn();
  instanceFn.interceptors = {
    request: {
      use: jest.fn((successHandler, errorHandler) => {
        capturedRequestInterceptor = successHandler;
        capturedRequestErrorInterceptor = errorHandler;
        interceptorsRegistered = true;
      }),
    },
    response: {
      use: jest.fn((successHandler, errorHandler) => {
        capturedResponseInterceptor = successHandler;
        capturedResponseErrorInterceptor = errorHandler;
      }),
    },
  };

  mockAxiosInstance = instanceFn;

  return {
    create: jest.fn((config) => {
      axiosCreateCalled = true;
      axiosCreateConfig = config;
      return mockAxiosInstance;
    }),
    isAxiosError: jest.fn((error) => error?.isAxiosError === true),
  };
});

// ============================================
// HELPERS
// ============================================

const createMockError = (
  status: number,
  url: string,
  data?: unknown,
  retry = false
): AxiosError & { config: InternalAxiosRequestConfig & { _retry?: boolean } } => ({
  isAxiosError: true,
  response: {
    status,
    data,
    statusText: status === 401 ? 'Unauthorized' : 'Error',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  },
  config: {
    url,
    _retry: retry,
    headers: {},
  } as InternalAxiosRequestConfig & { _retry?: boolean },
  message: `Request failed with status ${status}`,
  name: 'AxiosError',
  toJSON: () => ({}),
});

const createMockResponse = <T>(data: T, status = 200): AxiosResponse<T> => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {} as InternalAxiosRequestConfig,
});

// ============================================
// TESTS
// ============================================

describe('apiClient', () => {
  // Store original console methods
  const originalConsole = { log: console.log, error: console.error };

  beforeAll(() => {
    // Suppress console logs during tests
    console.log = jest.fn();
    console.error = jest.fn();

    // Import the module to capture interceptors
    require('@/lib/api/client');
  });

  beforeEach(() => {
    // Only clear method mocks, not the captured interceptors or import-time state
    mockAxiosInstance.get.mockReset();
    mockAxiosInstance.post.mockReset();
    mockAxiosInstance.put.mockReset();
    mockAxiosInstance.delete.mockReset();
    (mockAxiosInstance as unknown as jest.Mock).mockReset();
    
    // Reset sessionStorage mock calls
    (window.sessionStorage.setItem as jest.Mock).mockClear();
    (window.sessionStorage.getItem as jest.Mock).mockClear();
    
    // Reset internal state between tests
    const { __resetForTesting } = require('@/lib/api/client');
    __resetForTesting();
  });

  afterAll(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
  });

  // ============================================
  // Initial Configuration Tests
  // ============================================

  describe('configuración inicial', () => {
    it('debe crear instancia de axios con baseURL correcta', () => {
      expect(axiosCreateCalled).toBe(true);
      expect(axiosCreateConfig).toMatchObject({
        baseURL: expect.any(String),
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
    });

    it('debe configurar interceptores de request y response', () => {
      expect(interceptorsRegistered).toBe(true);
      expect(capturedRequestInterceptor).toBeDefined();
      expect(capturedResponseInterceptor).toBeDefined();
      expect(capturedResponseErrorInterceptor).toBeDefined();
    });
  });

  // ============================================
  // Request Interceptor Tests
  // ============================================

  describe('request interceptor', () => {
    it('debe pasar la configuración sin modificar', () => {
      const config = {
        url: '/test',
        headers: {},
      } as InternalAxiosRequestConfig;

      const result = capturedRequestInterceptor(config);
      expect(result).toBe(config);
    });

    it('debe rechazar errores de request', async () => {
      const error = { message: 'Request setup error' } as AxiosError;

      await expect(capturedRequestErrorInterceptor(error)).rejects.toEqual(error);
    });
  });

  // ============================================
  // Response Interceptor Success Tests
  // ============================================

  describe('response interceptor - success', () => {
    it('debe pasar respuestas exitosas sin modificar', () => {
      const mockResponse = createMockResponse({ success: true });

      const result = capturedResponseInterceptor(mockResponse);
      expect(result).toBe(mockResponse);
    });
  });

  // ============================================
  // Response Interceptor 401 Error Tests
  // ============================================

  describe('response interceptor - 401 error handling', () => {
    it('no debe intentar refresh para endpoint /auth/refresh', async () => {
      const error = createMockError(401, '/api/v1/auth/refresh');

      await expect(capturedResponseErrorInterceptor(error)).rejects.toBe(error);
      expect(mockAxiosInstance.post).not.toHaveBeenCalled();
    });

    it('no debe intentar refresh para endpoint /auth/login', async () => {
      const error = createMockError(401, '/api/v1/auth/login');

      await expect(capturedResponseErrorInterceptor(error)).rejects.toBe(error);
      expect(mockAxiosInstance.post).not.toHaveBeenCalled();
    });

    it('no debe intentar refresh para endpoint /auth/me (previene loop infinito)', async () => {
      const error = createMockError(401, '/api/v1/auth/me');

      await expect(capturedResponseErrorInterceptor(error)).rejects.toBe(error);
      expect(mockAxiosInstance.post).not.toHaveBeenCalled();
    });

    it('no debe intentar refresh si ya se reintentó (_retry = true)', async () => {
      const error = createMockError(401, '/api/v1/chat/send', undefined, true);

      await expect(capturedResponseErrorInterceptor(error)).rejects.toEqual({
        message: 'Request failed with status 401',
        status: 401,
      });
      expect(mockAxiosInstance.post).not.toHaveBeenCalled();
    });

    it('debe intentar refresh de token en error 401 y reintentar request original', async () => {
      const error = createMockError(401, '/api/v1/chat/send');
      const refreshResponse = createMockResponse({ success: true });
      const retryResponse = createMockResponse({ data: 'retried successfully' });

      mockAxiosInstance.post.mockResolvedValueOnce(refreshResponse);
      (mockAxiosInstance as unknown as jest.Mock).mockResolvedValueOnce(retryResponse);

      const result = await capturedResponseErrorInterceptor(error);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/auth/refresh',
        undefined,
        { withCredentials: true }
      );
      expect(result).toEqual(retryResponse);
    });

    // Note: These tests are skipped because jsdom doesn't allow proper mocking
    // of window.location.pathname. The redirect logic is verified in e2e tests.
    it.skip('debe redirigir a login cuando el refresh falla', async () => {
      // This test requires window.location.pathname to be mockable
      // jsdom limitation: Cannot modify window.location.pathname in tests
    });

    it.skip('no debe guardar redirect cuando ya está en /login', async () => {
      // This test requires window.location.pathname to be mockable
      // jsdom limitation: Cannot modify window.location.pathname in tests
    });

    it.skip('no debe guardar redirect cuando ya está en /register', async () => {
      // This test requires window.location.pathname to be mockable
      // jsdom limitation: Cannot modify window.location.pathname in tests
    });

    it('debe encolar requests cuando ya se está haciendo refresh', async () => {
      const error1 = createMockError(401, '/api/v1/chat/send');
      const error2 = createMockError(401, '/api/v1/user/profile');
      const refreshResponse = createMockResponse({ success: true });
      const retryResponse1 = createMockResponse({ data: 'retry1' });
      const retryResponse2 = createMockResponse({ data: 'retry2' });

      // First refresh call - will succeed after delay
      let resolveRefresh: (value: unknown) => void;
      const refreshPromise = new Promise((resolve) => {
        resolveRefresh = resolve;
      });
      mockAxiosInstance.post.mockReturnValueOnce(refreshPromise);

      // Retry calls
      (mockAxiosInstance as unknown as jest.Mock)
        .mockResolvedValueOnce(retryResponse1)
        .mockResolvedValueOnce(retryResponse2);

      // Start first request (triggers refresh)
      const promise1 = capturedResponseErrorInterceptor(error1);

      // Start second request (should be queued)
      const promise2 = capturedResponseErrorInterceptor(error2);

      // Resolve the refresh
      resolveRefresh!(refreshResponse);

      // Both should complete successfully
      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(retryResponse1);
      expect(result2).toEqual(retryResponse2);
    });

    it('debe rechazar requests encolados cuando refresh falla', async () => {
      const error1 = createMockError(401, '/api/v1/chat/send');
      const error2 = createMockError(401, '/api/v1/user/profile');
      const refreshError = new Error('Refresh failed');

      // First refresh call - will fail after delay
      let rejectRefresh: (reason: unknown) => void;
      const refreshPromise = new Promise((_, reject) => {
        rejectRefresh = reject;
      });
      mockAxiosInstance.post.mockReturnValueOnce(refreshPromise);

      // Start first request (triggers refresh)
      const promise1 = capturedResponseErrorInterceptor(error1);

      // Start second request (should be queued)
      const promise2 = capturedResponseErrorInterceptor(error2);

      // Reject the refresh
      rejectRefresh!(refreshError);

      // Both should reject
      await expect(promise1).rejects.toBe(refreshError);
      await expect(promise2).rejects.toBe(refreshError);

      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Response Interceptor Non-401 Error Tests
  // ============================================

  describe('response interceptor - non-401 errors', () => {
    it('debe devolver datos de error para errores con response.data', async () => {
      const errorData = { message: 'Bad Request', code: 'INVALID_INPUT' };
      const error = createMockError(400, '/api/v1/chat/send', errorData);

      await expect(capturedResponseErrorInterceptor(error)).rejects.toEqual(errorData);
    });

    it('debe construir objeto de error cuando no hay response.data', async () => {
      const error = createMockError(500, '/api/v1/chat/send');

      await expect(capturedResponseErrorInterceptor(error)).rejects.toEqual({
        message: 'Request failed with status 500',
        status: 500,
      });
    });

    it('debe manejar errores sin response', async () => {
      const error: AxiosError = {
        isAxiosError: true,
        config: { url: '/api/v1/chat/send', headers: {} } as InternalAxiosRequestConfig,
        message: 'Network Error',
        name: 'AxiosError',
        toJSON: () => ({}),
      };

      await expect(capturedResponseErrorInterceptor(error)).rejects.toEqual({
        message: 'Network Error',
        status: undefined,
      });
    });

    it('debe usar mensaje por defecto cuando no hay message', async () => {
      const error: AxiosError = {
        isAxiosError: true,
        response: {
          status: 503,
          data: null,
          statusText: 'Service Unavailable',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: { url: '/api/v1/chat/send', headers: {} } as InternalAxiosRequestConfig,
        message: '',
        name: 'AxiosError',
        toJSON: () => ({}),
      };

      await expect(capturedResponseErrorInterceptor(error)).rejects.toEqual({
        message: 'An unexpected error occurred',
        status: 503,
      });
    });
  });

  // ============================================
  // Export Tests
  // ============================================

  describe('exports', () => {
    it('debe exportar apiClient', () => {
      const { apiClient } = require('@/lib/api/client');
      expect(apiClient).toBeDefined();
    });

    it('debe exportar helper functions', () => {
      const { get, post, put, del } = require('@/lib/api/client');
      expect(get).toBeDefined();
      expect(post).toBeDefined();
      expect(put).toBeDefined();
      expect(del).toBeDefined();
    });

    it('debe exportar delete como alias de del', () => {
      const clientModule = require('@/lib/api/client');
      expect(clientModule.delete).toBe(clientModule.del);
    });
  });

  // ============================================
  // Helper Functions Tests
  // ============================================

  describe('helper functions', () => {
    it('get debe retornar response.data', async () => {
      const responseData = { users: [{ id: 1, name: 'Test' }] };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: responseData });

      const { get } = require('@/lib/api/client');
      const result = await get('/api/v1/users');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/users', undefined);
      expect(result).toEqual(responseData);
    });

    it('get debe pasar config opcional', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: {} });

      const { get } = require('@/lib/api/client');
      const config = { params: { page: 1 } };
      await get('/api/v1/users', config);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v1/users', config);
    });

    it('post debe retornar response.data', async () => {
      const responseData = { id: 1, created: true };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: responseData });

      const { post } = require('@/lib/api/client');
      const requestData = { name: 'New User' };
      const result = await post('/api/v1/users', requestData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/users',
        requestData,
        undefined
      );
      expect(result).toEqual(responseData);
    });

    it('post debe pasar config opcional', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: {} });

      const { post } = require('@/lib/api/client');
      const config = { headers: { 'X-Custom': 'value' } };
      await post('/api/v1/users', { name: 'Test' }, config);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/users',
        { name: 'Test' },
        config
      );
    });

    it('put debe retornar response.data', async () => {
      const responseData = { id: 1, updated: true };
      mockAxiosInstance.put.mockResolvedValueOnce({ data: responseData });

      const { put } = require('@/lib/api/client');
      const requestData = { name: 'Updated User' };
      const result = await put('/api/v1/users/1', requestData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        '/api/v1/users/1',
        requestData,
        undefined
      );
      expect(result).toEqual(responseData);
    });

    it('put debe pasar config opcional', async () => {
      mockAxiosInstance.put.mockResolvedValueOnce({ data: {} });

      const { put } = require('@/lib/api/client');
      const config = { timeout: 5000 };
      await put('/api/v1/users/1', { name: 'Test' }, config);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        '/api/v1/users/1',
        { name: 'Test' },
        config
      );
    });

    it('del debe retornar response.data', async () => {
      const responseData = { deleted: true };
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: responseData });

      const { del } = require('@/lib/api/client');
      const result = await del('/api/v1/users/1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/v1/users/1', undefined);
      expect(result).toEqual(responseData);
    });

    it('del debe pasar config opcional', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: {} });

      const { del } = require('@/lib/api/client');
      const config = { headers: { 'X-Confirm': 'true' } };
      await del('/api/v1/users/1', config);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/v1/users/1', config);
    });
  });

  // ============================================
  // Integration Tests
  // ============================================

  describe('apiClient Integration', () => {
    it('debe tener métodos HTTP disponibles', () => {
      const { apiClient } = require('@/lib/api/client');

      expect(typeof apiClient.get).toBe('function');
      expect(typeof apiClient.post).toBe('function');
      expect(typeof apiClient.put).toBe('function');
      expect(typeof apiClient.delete).toBe('function');
    });
  });

  // ============================================
  // Edge Cases for processQueue
  // ============================================

  describe('processQueue edge cases', () => {
    it('debe procesar cola correctamente con error', async () => {
      // Create multiple errors that will queue
      const error1 = createMockError(401, '/api/v1/resource1');
      const error2 = createMockError(401, '/api/v1/resource2');
      const error3 = createMockError(401, '/api/v1/resource3');
      const refreshError = new Error('Auth server down');

      // Mock a slow refresh that will fail
      let rejectRefresh: (reason: unknown) => void;
      const refreshPromise = new Promise((_, reject) => {
        rejectRefresh = reject;
      });
      mockAxiosInstance.post.mockReturnValueOnce(refreshPromise);

      // Start multiple requests
      const promise1 = capturedResponseErrorInterceptor(error1);
      const promise2 = capturedResponseErrorInterceptor(error2);
      const promise3 = capturedResponseErrorInterceptor(error3);

      // Reject refresh
      rejectRefresh!(refreshError);

      // All should fail with the same error
      await expect(promise1).rejects.toBe(refreshError);
      await expect(promise2).rejects.toBe(refreshError);
      await expect(promise3).rejects.toBe(refreshError);
    });
  });

  // ============================================
  // 429 Rate Limit Error Tests
  // ============================================

  describe('response interceptor - 429 rate limit handling', () => {
    it('debe transformar error 429 con detail completo', async () => {
      const error: AxiosError & { config: InternalAxiosRequestConfig } = {
        isAxiosError: true,
        response: {
          status: 429,
          data: {
            detail: {
              message: 'Has alcanzado tu límite de 100 mensajes',
              limit_info: { limit: 100, resets_at: '2026-01-30T08:00:00Z' },
              upgrade_url: '/dashboard/subscription'
            }
          },
          statusText: 'Too Many Requests',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {
          url: '/api/v1/chat/send',
          headers: {},
        } as InternalAxiosRequestConfig,
        message: 'Request failed with status 429',
        name: 'AxiosError',
        toJSON: () => ({}),
      };

      try {
        await capturedResponseErrorInterceptor(error);
        fail('Should have thrown an error');
      } catch (err: unknown) {
        const rateLimitError = err as Record<string, unknown>;
        expect(rateLimitError.status).toBe(429);
        expect(rateLimitError.code).toBe('daily_limit_exceeded');
        expect(rateLimitError.message).toBe('Has alcanzado tu límite de 100 mensajes');
        expect(rateLimitError.limit_info).toEqual({ limit: 100, resets_at: '2026-01-30T08:00:00Z' });
        expect(rateLimitError.upgrade_url).toBe('/dashboard/subscription');
      }
    });

    it('debe manejar error 429 sin detail (usa defaults)', async () => {
      const error: AxiosError & { config: InternalAxiosRequestConfig } = {
        isAxiosError: true,
        response: {
          status: 429,
          data: {},
          statusText: 'Too Many Requests',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {
          url: '/api/v1/chat/send',
          headers: {},
        } as InternalAxiosRequestConfig,
        message: 'Request failed with status 429',
        name: 'AxiosError',
        toJSON: () => ({}),
      };

      try {
        await capturedResponseErrorInterceptor(error);
        fail('Should have thrown an error');
      } catch (err: unknown) {
        const rateLimitError = err as Record<string, unknown>;
        expect(rateLimitError.status).toBe(429);
        expect(rateLimitError.code).toBe('daily_limit_exceeded');
        expect(rateLimitError.message).toBe('Has alcanzado tu límite diario de mensajes');
        expect(rateLimitError.limit_info).toBeNull();
        expect(rateLimitError.upgrade_url).toBe('/dashboard/subscription');
      }
    });

    it('debe extraer detail de response.data directamente si no hay wrapper', async () => {
      const error: AxiosError & { config: InternalAxiosRequestConfig } = {
        isAxiosError: true,
        response: {
          status: 429,
          data: {
            message: 'Límite excedido directamente',
            limit_info: { limit: 50 },
          },
          statusText: 'Too Many Requests',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {
          url: '/api/v1/chat/send',
          headers: {},
        } as InternalAxiosRequestConfig,
        message: 'Request failed with status 429',
        name: 'AxiosError',
        toJSON: () => ({}),
      };

      try {
        await capturedResponseErrorInterceptor(error);
        fail('Should have thrown an error');
      } catch (err: unknown) {
        const rateLimitError = err as Record<string, unknown>;
        expect(rateLimitError.status).toBe(429);
        expect(rateLimitError.code).toBe('daily_limit_exceeded');
        expect(rateLimitError.message).toBe('Límite excedido directamente');
        expect(rateLimitError.limit_info).toEqual({ limit: 50 });
      }
    });
  });

  // ============================================
  // Additional branch coverage tests
  // ============================================

  describe('branch coverage - additional cases', () => {
    it('debe manejar URL vacío en la petición original', async () => {
      const error: AxiosError & { config: InternalAxiosRequestConfig & { _retry?: boolean } } = {
        isAxiosError: true,
        response: {
          status: 401,
          data: null,
          statusText: 'Unauthorized',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {
          // URL vacío
          url: '',
          _retry: false,
          headers: {},
        } as InternalAxiosRequestConfig & { _retry?: boolean },
        message: 'Unauthorized',
        name: 'AxiosError',
        toJSON: () => ({}),
      };

      const refreshResponse = createMockResponse({ success: true });
      const retryResponse = createMockResponse({ data: 'success' });
      
      mockAxiosInstance.post.mockResolvedValueOnce(refreshResponse);
      (mockAxiosInstance as unknown as jest.Mock).mockResolvedValueOnce(retryResponse);

      const result = await capturedResponseErrorInterceptor(error);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v1/auth/refresh',
        undefined,
        { withCredentials: true }
      );
      expect(result).toEqual(retryResponse);
    });

    it('debe manejar error sin config.url (undefined)', async () => {
      const error: AxiosError & { config: InternalAxiosRequestConfig & { _retry?: boolean } } = {
        isAxiosError: true,
        response: {
          status: 401,
          data: null,
          statusText: 'Unauthorized',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {
          // url undefined
          _retry: false,
          headers: {},
        } as InternalAxiosRequestConfig & { _retry?: boolean },
        message: 'Unauthorized',
        name: 'AxiosError',
        toJSON: () => ({}),
      };

      const refreshResponse = createMockResponse({ success: true });
      const retryResponse = createMockResponse({ data: 'success' });
      
      mockAxiosInstance.post.mockResolvedValueOnce(refreshResponse);
      (mockAxiosInstance as unknown as jest.Mock).mockResolvedValueOnce(retryResponse);

      const result = await capturedResponseErrorInterceptor(error);
      
      expect(mockAxiosInstance.post).toHaveBeenCalled();
      expect(result).toEqual(retryResponse);
    });
  });
});
