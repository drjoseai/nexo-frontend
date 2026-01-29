// __tests__/lib/store/chat.test.ts
// Tests unitarios para el Chat Store de NEXO v2.0
// Verifica: sendMessage, loadHistory, optimistic updates, error handling

import { renderHook, act } from '@testing-library/react';
import { useChatStore } from '@/lib/store/chat';

// ============================================
// MOCK: API de chat
// ============================================
jest.mock('@/lib/api/chat', () => ({
  chatApi: {
    sendMessage: jest.fn(),
    getChatHistory: jest.fn(),
    getChatMessages: jest.fn(),
  },
}));

import { chatApi } from '@/lib/api/chat';

// ============================================
// TEST DATA
// ============================================
const mockAvatarId = 'lia';

const mockChatResponse = {
  success: true,
  avatar_response: '¡Hola! Me alegra mucho conocerte. ¿Cómo te sientes hoy?',
  model_used: 'gpt-4o-mini',
  tokens_used: 45,
  sentiment_detected: 'positive',
  emotional_depth: 0.7,
  cost_estimate: 0.0001,
  messages_remaining: 95,
};

const mockHistoryMessages = [
  {
    id: 'msg-1',
    role: 'user' as const,
    content: 'Hola Lía',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    status: 'sent' as const,
  },
  {
    id: 'msg-2',
    role: 'assistant' as const,
    content: '¡Hola! ¿Cómo estás?',
    timestamp: new Date('2024-01-01T10:00:05Z'),
    status: 'sent' as const,
  },
];

// ============================================
// HELPER: Reset store state
// ============================================
const resetStore = () => {
  useChatStore.setState({
    messages: [],
    isLoading: false,
    isSending: false,
    error: null,
    currentAvatarId: null,
    messagesRemaining: null,
  });
};

// ============================================
// TESTS
// ============================================
describe('useChatStore', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  // ------------------------------------------
  // Initial State Tests
  // ------------------------------------------
  describe('estado inicial', () => {
    it('debe tener estado inicial correcto', () => {
      const { result } = renderHook(() => useChatStore());

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSending).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.currentAvatarId).toBeNull();
      expect(result.current.messagesRemaining).toBeNull();
    });

    it('debe exponer todas las acciones requeridas', () => {
      const { result } = renderHook(() => useChatStore());

      expect(typeof result.current.sendMessage).toBe('function');
      expect(typeof result.current.loadHistory).toBe('function');
      expect(typeof result.current.setCurrentAvatar).toBe('function');
      expect(typeof result.current.clearMessages).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  // ------------------------------------------
  // setCurrentAvatar Tests
  // ------------------------------------------
  describe('setCurrentAvatar', () => {
    it('debe establecer el avatar actual', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.setCurrentAvatar('lia');
      });

      expect(result.current.currentAvatarId).toBe('lia');
    });

    it('debe cambiar entre avatares', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.setCurrentAvatar('lia');
      });
      expect(result.current.currentAvatarId).toBe('lia');

      act(() => {
        result.current.setCurrentAvatar('mia');
      });
      expect(result.current.currentAvatarId).toBe('mia');
    });
  });

  // ------------------------------------------
  // sendMessage Tests
  // ------------------------------------------
  describe('sendMessage', () => {
    it('debe enviar mensaje exitosamente', async () => {
      (chatApi.sendMessage as jest.Mock).mockResolvedValue(mockChatResponse);

      const { result } = renderHook(() => useChatStore());

      let success: boolean = false;

      await act(async () => {
        success = await result.current.sendMessage('Hola Lía', mockAvatarId);
      });

      expect(success).toBe(true);
      expect(result.current.messages).toHaveLength(2); // user + assistant
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[0].content).toBe('Hola Lía');
      expect(result.current.messages[1].role).toBe('assistant');
      expect(result.current.messages[1].content).toBe(mockChatResponse.avatar_response);
    });

    it('debe hacer optimistic update del mensaje del usuario', async () => {
      let resolvePromise: (value: typeof mockChatResponse) => void;
      const pendingPromise = new Promise<typeof mockChatResponse>((resolve) => {
        resolvePromise = resolve;
      });

      (chatApi.sendMessage as jest.Mock).mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useChatStore());

      // Start sending (don't await)
      act(() => {
        result.current.sendMessage('Mensaje optimista', mockAvatarId);
      });

      // User message should appear immediately with 'sending' status
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Mensaje optimista');
      expect(result.current.messages[0].status).toBe('sending');
      expect(result.current.isSending).toBe(true);

      // Resolve the promise
      await act(async () => {
        resolvePromise!(mockChatResponse);
        await pendingPromise;
      });

      // Now should have both messages
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].status).toBe('sent');
      expect(result.current.isSending).toBe(false);
    });

    it('debe ignorar mensajes vacíos', async () => {
      const { result } = renderHook(() => useChatStore());

      let success: boolean = true;

      await act(async () => {
        success = await result.current.sendMessage('   ', mockAvatarId);
      });

      expect(success).toBe(false);
      expect(result.current.messages).toHaveLength(0);
      expect(chatApi.sendMessage).not.toHaveBeenCalled();
    });

    it('debe manejar error de API', async () => {
      (chatApi.sendMessage as jest.Mock).mockRejectedValue(
        new Error('Error de conexión')
      );

      const { result } = renderHook(() => useChatStore());

      let success: boolean = true;

      await act(async () => {
        success = await result.current.sendMessage('Hola', mockAvatarId);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Error de conexión');
      expect(result.current.messages[0].status).toBe('error');
      expect(result.current.isSending).toBe(false);
    });

    it('debe manejar respuesta fallida del backend', async () => {
      (chatApi.sendMessage as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Avatar no disponible',
      });

      const { result } = renderHook(() => useChatStore());

      let success: boolean = true;

      await act(async () => {
        success = await result.current.sendMessage('Hola', mockAvatarId);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Avatar no disponible');
      expect(result.current.messages[0].status).toBe('error');
    });

    it('debe actualizar messagesRemaining', async () => {
      (chatApi.sendMessage as jest.Mock).mockResolvedValue(mockChatResponse);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage('Hola', mockAvatarId);
      });

      expect(result.current.messagesRemaining).toBe(95);
    });

    it('debe detectar error de rate limit', async () => {
      // Mock del error estructurado que el interceptor de axios retorna
      const rateLimitError = {
        status: 429,
        code: 'daily_limit_exceeded',
        message: 'Has alcanzado tu límite diario de mensajes',
      };
      (chatApi.sendMessage as jest.Mock).mockRejectedValue(rateLimitError);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage('Hola', mockAvatarId);
      });

      expect(result.current.error).toContain('límite diario');
      expect(result.current.messagesRemaining).toBe(0);
    });
  });

  // ------------------------------------------
  // loadHistory Tests
  // ------------------------------------------
  describe('loadHistory', () => {
    it('debe cargar historial exitosamente', async () => {
      (chatApi.getChatMessages as jest.Mock).mockResolvedValue(mockHistoryMessages);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.loadHistory(mockAvatarId);
      });

      expect(result.current.messages).toEqual(mockHistoryMessages);
      expect(result.current.currentAvatarId).toBe(mockAvatarId);
      expect(result.current.isLoading).toBe(false);
    });

    it('debe mostrar isLoading durante carga', async () => {
      let resolvePromise: (value: typeof mockHistoryMessages) => void;
      const pendingPromise = new Promise<typeof mockHistoryMessages>((resolve) => {
        resolvePromise = resolve;
      });

      (chatApi.getChatMessages as jest.Mock).mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.loadHistory(mockAvatarId);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!(mockHistoryMessages);
        await pendingPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('debe manejar error de carga', async () => {
      (chatApi.getChatMessages as jest.Mock).mockRejectedValue(
        new Error('Error al cargar historial')
      );

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.loadHistory(mockAvatarId);
      });

      expect(result.current.error).toBe('Error al cargar historial');
      expect(result.current.isLoading).toBe(false);
    });

    it('debe usar límite personalizado', async () => {
      (chatApi.getChatMessages as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.loadHistory(mockAvatarId, 50);
      });

      expect(chatApi.getChatMessages).toHaveBeenCalledWith(mockAvatarId, 50);
    });
  });

  // ------------------------------------------
  // clearMessages Tests
  // ------------------------------------------
  describe('clearMessages', () => {
    it('debe limpiar todos los mensajes', () => {
      useChatStore.setState({
        messages: mockHistoryMessages,
        error: 'Some error',
      });

      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  // ------------------------------------------
  // clearError Tests
  // ------------------------------------------
  describe('clearError', () => {
    it('debe limpiar el error', () => {
      useChatStore.setState({ error: 'Error de prueba' });

      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  // ------------------------------------------
  // addOptimisticMessage Tests
  // ------------------------------------------
  describe('addOptimisticMessage', () => {
    it('debe agregar mensaje con status sending', () => {
      const { result } = renderHook(() => useChatStore());

      let messageId: string = '';

      act(() => {
        messageId = result.current.addOptimisticMessage('Test message');
      });

      expect(messageId).toMatch(/^msg_/);
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Test message');
      expect(result.current.messages[0].status).toBe('sending');
      expect(result.current.messages[0].role).toBe('user');
    });
  });

  // ------------------------------------------
  // updateMessageStatus Tests
  // ------------------------------------------
  describe('updateMessageStatus', () => {
    it('debe actualizar status de mensaje específico', () => {
      const { result } = renderHook(() => useChatStore());

      let messageId: string = '';

      act(() => {
        messageId = result.current.addOptimisticMessage('Test');
      });

      act(() => {
        result.current.updateMessageStatus(messageId, 'sent');
      });

      expect(result.current.messages[0].status).toBe('sent');
    });

    it('debe actualizar a error correctamente', () => {
      const { result } = renderHook(() => useChatStore());

      let messageId: string = '';

      act(() => {
        messageId = result.current.addOptimisticMessage('Test');
      });

      act(() => {
        result.current.updateMessageStatus(messageId, 'error');
      });

      expect(result.current.messages[0].status).toBe('error');
    });
  });
});

