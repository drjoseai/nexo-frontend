// __tests__/lib/store/chat.test.ts
// Tests unitarios para el Chat Store de NEXO v2.0
// Verifica: sendMessage, loadHistory, optimistic updates, error handling

import { renderHook, act } from '@testing-library/react';
import { useChatStore, selectMessages, selectIsLoading, selectIsSending, selectError, selectMessagesRemaining, selectUploadLimits, selectFileUploading, selectIsStreaming, selectStreamingMessageId } from '@/lib/store/chat';

// ============================================
// MOCK: API de chat
// ============================================
jest.mock('@/lib/api/chat', () => ({
  chatApi: {
    sendMessage: jest.fn(),
    getChatHistory: jest.fn(),
    getChatMessages: jest.fn(),
    deleteHistory: jest.fn(),
    sendMessageStream: jest.fn(),
  },
}));

// Mock: File API
jest.mock('@/lib/api/files', () => ({
  fileApi: {
    uploadFile: jest.fn(),
    getUploadLimits: jest.fn(),
  },
}));

// Mock: Analytics
jest.mock('@/lib/services/analytics', () => ({
  analytics: {
    track: jest.fn(),
    increment: jest.fn(),
  },
  AnalyticsEvents: {
    MESSAGE_SENT: 'message_sent',
    ERROR_OCCURRED: 'error_occurred',
  },
}));

import { chatApi } from '@/lib/api/chat';
import { fileApi } from '@/lib/api/files';
import type { StreamCallbacks } from '@/lib/api/chat';

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
    uploadLimits: null,
    fileUploading: false,
    isStreaming: false,
    streamingMessageId: null,
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

    it('debe mostrar hora de reset cuando limit_info tiene resets_at_formatted', async () => {
      const mockError = {
        status: 429,
        code: 'daily_limit_exceeded',
        message: 'Límite alcanzado',
        limit_info: {
          limit: 100,
          resets_at_formatted: '08:00'
        }
      };

      (chatApi.sendMessage as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage('test', mockAvatarId);
      });

      expect(result.current.error).toContain('08:00');
      expect(result.current.error).toContain('100');
      expect(result.current.messagesRemaining).toBe(0);
    });

    it('debe formatear resets_at cuando no hay resets_at_formatted', async () => {
      const mockError = {
        status: 429,
        code: 'daily_limit_exceeded',
        message: 'Límite alcanzado',
        limit_info: {
          limit: 100,
          resets_at: '2026-01-30T08:00:00Z'
        }
      };

      (chatApi.sendMessage as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage('test', mockAvatarId);
      });

      expect(result.current.error).toContain('límite');
      expect(result.current.error).toContain('100');
      expect(result.current.messagesRemaining).toBe(0);
    });

    it('debe usar mensaje default cuando no hay limit_info', async () => {
      const mockError = {
        status: 429,
        code: 'daily_limit_exceeded',
        message: 'Has alcanzado tu límite diario de mensajes',
        limit_info: null
      };

      (chatApi.sendMessage as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage('test', mockAvatarId);
      });

      expect(result.current.error).toBe('Has alcanzado tu límite diario de mensajes');
      expect(result.current.messagesRemaining).toBe(0);
    });

    it('debe manejar error con propiedad error en vez de message', async () => {
      const mockError = {
        error: 'Error específico del servidor',
      };

      (chatApi.sendMessage as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage('test', mockAvatarId);
      });

      expect(result.current.error).toBe('Error específico del servidor');
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

      expect(chatApi.getChatMessages).toHaveBeenCalledWith(mockAvatarId, 50, undefined);
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

  // ------------------------------------------
  // sendMessage con File Upload Tests
  // ------------------------------------------
  describe('sendMessage con file upload', () => {
    const mockFile = new File(['test content'], 'photo.jpg', { type: 'image/jpeg' });
    const mockUploadResponse = {
      signed_url: 'https://storage.example.com/photo.jpg',
      file_category: 'image',
      filename: 'photo.jpg',
      storage_path: 'uploads/photo.jpg',
      extracted_text: undefined,
    };

    beforeEach(() => {
      global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/fake-blob');
      global.URL.revokeObjectURL = jest.fn();
    });

    it('debe enviar mensaje con archivo adjunto exitosamente', async () => {
      (fileApi.uploadFile as jest.Mock).mockResolvedValue(mockUploadResponse);
      (chatApi.sendMessage as jest.Mock).mockResolvedValue(mockChatResponse);

      const { result } = renderHook(() => useChatStore());

      let success = false;
      await act(async () => {
        success = await result.current.sendMessage('Mira esta foto', mockAvatarId, undefined, mockFile);
      });

      expect(success).toBe(true);
      expect(fileApi.uploadFile).toHaveBeenCalledWith(mockFile, mockAvatarId);
      expect(chatApi.sendMessage).toHaveBeenCalled();
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].attachment_url).toBe('https://storage.example.com/photo.jpg');
      expect(result.current.messages[0].attachment_type).toBe('image');
      expect(result.current.messages[0].attachment_filename).toBe('photo.jpg');
    });

    it('debe crear optimistic attachment con blob URL para imágenes', async () => {
      let resolveUpload: (value: typeof mockUploadResponse) => void;
      const pendingUpload = new Promise<typeof mockUploadResponse>((resolve) => {
        resolveUpload = resolve;
      });
      (fileApi.uploadFile as jest.Mock).mockReturnValue(pendingUpload);

      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.sendMessage('Foto', mockAvatarId, undefined, mockFile);
      });

      expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(result.current.messages[0].attachment_url).toBe('blob:http://localhost/fake-blob');

      await act(async () => {
        resolveUpload!(mockUploadResponse);
        (chatApi.sendMessage as jest.Mock).mockResolvedValue(mockChatResponse);
        await pendingUpload;
      });
    });

    it('debe manejar error de upload de archivo', async () => {
      (fileApi.uploadFile as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      const { result } = renderHook(() => useChatStore());

      let success = true;
      await act(async () => {
        success = await result.current.sendMessage('Foto', mockAvatarId, undefined, mockFile);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Error al subir el archivo. Intenta de nuevo.');
      expect(result.current.messages[0].status).toBe('error');
      expect(result.current.fileUploading).toBe(false);
      expect(result.current.isSending).toBe(false);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/fake-blob');
    });

    it('debe revocar blob URL después de upload exitoso', async () => {
      (fileApi.uploadFile as jest.Mock).mockResolvedValue(mockUploadResponse);
      (chatApi.sendMessage as jest.Mock).mockResolvedValue(mockChatResponse);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage('Foto', mockAvatarId, undefined, mockFile);
      });

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/fake-blob');
    });

    it('debe decrementar uploadLimits después de enviar con attachment', async () => {
      (fileApi.uploadFile as jest.Mock).mockResolvedValue(mockUploadResponse);
      (chatApi.sendMessage as jest.Mock).mockResolvedValue(mockChatResponse);

      useChatStore.setState({
        uploadLimits: { allowed: true, limit: 10, used: 3, remaining: 7, plan: 'plus' },
      });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessage('Foto', mockAvatarId, undefined, mockFile);
      });

      expect(result.current.uploadLimits?.used).toBe(4);
      expect(result.current.uploadLimits?.remaining).toBe(6);
    });

    it('debe enviar mensaje con solo archivo sin texto', async () => {
      (fileApi.uploadFile as jest.Mock).mockResolvedValue(mockUploadResponse);
      (chatApi.sendMessage as jest.Mock).mockResolvedValue(mockChatResponse);

      const { result } = renderHook(() => useChatStore());

      let success = false;
      await act(async () => {
        success = await result.current.sendMessage('', mockAvatarId, undefined, mockFile);
      });

      expect(success).toBe(true);
      expect(result.current.messages).toHaveLength(2);
    });
  });

  // ------------------------------------------
  // fetchUploadLimits Tests
  // ------------------------------------------
  describe('fetchUploadLimits', () => {
    it('debe obtener límites de upload', async () => {
      const mockLimits = { allowed: true, limit: 10, used: 2, remaining: 8, plan: 'plus' };
      (fileApi.getUploadLimits as jest.Mock).mockResolvedValue(mockLimits);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.fetchUploadLimits();
      });

      expect(result.current.uploadLimits).toEqual(mockLimits);
    });

    it('debe manejar error silenciosamente', async () => {
      (fileApi.getUploadLimits as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.fetchUploadLimits();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.uploadLimits).toBeNull();
    });
  });

  // ------------------------------------------
  // deleteHistory Tests
  // ------------------------------------------
  describe('deleteHistory', () => {
    it('debe borrar historial exitosamente', async () => {
      (chatApi.deleteHistory as jest.Mock).mockResolvedValue(undefined);
      useChatStore.setState({ messages: mockHistoryMessages });

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.deleteHistory('lia');
      });

      expect(chatApi.deleteHistory).toHaveBeenCalledWith('lia', undefined);
      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('debe pasar relationshipType a deleteHistory', async () => {
      (chatApi.deleteHistory as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.deleteHistory('mia', 'romantic');
      });

      expect(chatApi.deleteHistory).toHaveBeenCalledWith('mia', 'romantic');
    });

    it('debe manejar error y hacer throw', async () => {
      (chatApi.deleteHistory as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await expect(result.current.deleteHistory('lia')).rejects.toThrow('Delete failed');
      });

      expect(result.current.error).toBe('Error al borrar el historial');
    });
  });

  // ------------------------------------------
  // loadHistory con relationshipType
  // ------------------------------------------
  describe('loadHistory con relationshipType', () => {
    it('debe pasar relationshipType a getChatMessages', async () => {
      (chatApi.getChatMessages as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.loadHistory(mockAvatarId, 20, 'romantic');
      });

      expect(chatApi.getChatMessages).toHaveBeenCalledWith(mockAvatarId, 20, 'romantic');
    });

    it('debe manejar error no-Error object en loadHistory', async () => {
      (chatApi.getChatMessages as jest.Mock).mockRejectedValue('string error');

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.loadHistory(mockAvatarId);
      });

      expect(result.current.error).toBe('Error al cargar historial');
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ------------------------------------------
  // sendMessageStreaming Tests
  // ------------------------------------------
  describe('sendMessageStreaming', () => {
    it('debe enviar mensaje con streaming exitosamente', async () => {
      (chatApi.sendMessageStream as jest.Mock).mockImplementation(
        async (_avatarId: string, _content: string, _relType: string | undefined, callbacks: StreamCallbacks) => {
          callbacks?.onStart?.({ avatar_id: 'lia', avatar_name: 'Lía', relationship_type: 'friend' });
          callbacks?.onContent?.('Hola ');
          callbacks?.onContent?.('mundo!');
          callbacks?.onMetadata?.({ tokens: 10, cost: 0.001, model: 'gpt-4o-mini', duration_ms: 200, cache_hit: false });
          callbacks?.onComplete?.({ message_id: 'msg-1', conversation_id: 'conv-1' });
        }
      );

      const { result } = renderHook(() => useChatStore());

      let success = false;
      await act(async () => {
        success = await result.current.sendMessageStreaming('Hola', mockAvatarId);
      });

      expect(success).toBe(true);
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.isSending).toBe(false);
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[0].content).toBe('Hola');
      expect(result.current.messages[0].status).toBe('sent');
      expect(result.current.messages[1].role).toBe('assistant');
      expect(result.current.messages[1].content).toBe('Hola mundo!');
      expect(result.current.messages[1].status).toBe('sent');
      expect(result.current.messages[1].metadata?.model_used).toBe('gpt-4o-mini');
    });

    it('debe ignorar mensaje vacío en streaming', async () => {
      const { result } = renderHook(() => useChatStore());

      let success = true;
      await act(async () => {
        success = await result.current.sendMessageStreaming('   ', mockAvatarId);
      });

      expect(success).toBe(false);
      expect(chatApi.sendMessageStream).not.toHaveBeenCalled();
    });

    it('debe manejar onError durante streaming con contenido parcial', async () => {
      (chatApi.sendMessageStream as jest.Mock).mockImplementation(
        async (_avatarId: string, _content: string, _relType: string | undefined, callbacks: StreamCallbacks) => {
          callbacks?.onStart?.({ avatar_id: 'lia', avatar_name: 'Lía', relationship_type: 'friend' });
          callbacks?.onContent?.('Respuesta parcial');
          callbacks?.onError?.({ message: 'Connection lost', error_type: 'server_error' });
        }
      );

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessageStreaming('Hola', mockAvatarId);
      });

      const avatarMsg = result.current.messages.find(m => m.role === 'assistant');
      expect(avatarMsg).toBeDefined();
      expect(avatarMsg?.content).toBe('Respuesta parcial');
      expect(avatarMsg?.status).toBe('error');
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.error).toBe('Connection lost');
    });

    it('debe remover avatar message vacío en onError', async () => {
      (chatApi.sendMessageStream as jest.Mock).mockImplementation(
        async (_avatarId: string, _content: string, _relType: string | undefined, callbacks: StreamCallbacks) => {
          callbacks?.onError?.({ message: 'Error inmediato' });
        }
      );

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessageStreaming('Hola', mockAvatarId);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.error).toBe('Error inmediato');
    });

    it('debe setear messagesRemaining a 0 en rate_limit error', async () => {
      (chatApi.sendMessageStream as jest.Mock).mockImplementation(
        async (_avatarId: string, _content: string, _relType: string | undefined, callbacks: StreamCallbacks) => {
          callbacks?.onError?.({ message: 'Rate limit', error_type: 'rate_limit' });
        }
      );

      useChatStore.setState({ messagesRemaining: 10 });
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessageStreaming('Hola', mockAvatarId);
      });

      expect(result.current.messagesRemaining).toBe(0);
    });

    it('debe decrementar messagesRemaining en onComplete', async () => {
      (chatApi.sendMessageStream as jest.Mock).mockImplementation(
        async (_avatarId: string, _content: string, _relType: string | undefined, callbacks: StreamCallbacks) => {
          callbacks?.onComplete?.({ message_id: 'msg-1', conversation_id: 'conv-1' });
        }
      );

      useChatStore.setState({ messagesRemaining: 50 });
      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessageStreaming('Hola', mockAvatarId);
      });

      expect(result.current.messagesRemaining).toBe(49);
    });

    it('debe manejar AbortError silenciosamente', async () => {
      (chatApi.sendMessageStream as jest.Mock).mockRejectedValue(
        new DOMException('The operation was aborted', 'AbortError')
      );

      const { result } = renderHook(() => useChatStore());

      let success = true;
      await act(async () => {
        success = await result.current.sendMessageStreaming('Hola', mockAvatarId);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.isSending).toBe(false);
    });

    it('debe manejar error de red en streaming', async () => {
      (chatApi.sendMessageStream as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useChatStore());

      let success = true;
      await act(async () => {
        success = await result.current.sendMessageStreaming('Hola', mockAvatarId);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe('Error de conexión. Intenta de nuevo.');
      expect(result.current.isStreaming).toBe(false);
    });

    it('debe limpiar avatar message vacío en error de red', async () => {
      (chatApi.sendMessageStream as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessageStreaming('Hola', mockAvatarId);
      });

      const avatarMsgs = result.current.messages.filter(m => m.role === 'assistant');
      expect(avatarMsgs).toHaveLength(0);
    });

    it('debe mantener avatar message con contenido parcial en error de red', async () => {
      let callCount = 0;
      (chatApi.sendMessageStream as jest.Mock).mockImplementation(
        async (_avatarId: string, _content: string, _relType: string | undefined, callbacks: StreamCallbacks) => {
          callbacks?.onContent?.('Contenido parcial');
          callCount++;
          throw new Error('Network dropped');
        }
      );

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessageStreaming('Hola', mockAvatarId);
      });

      expect(callCount).toBe(1);
      const avatarMsgs = result.current.messages.filter(m => m.role === 'assistant');
      expect(avatarMsgs).toHaveLength(1);
      expect(avatarMsgs[0].content).toBe('Contenido parcial');
    });

    it('debe setear streaming state durante envío', async () => {
      let capturedState: { isStreaming: boolean; streamingMessageId: string | null } | null = null;

      (chatApi.sendMessageStream as jest.Mock).mockImplementation(
        async (_avatarId: string, _content: string, _relType: string | undefined, callbacks: StreamCallbacks) => {
          capturedState = {
            isStreaming: useChatStore.getState().isStreaming,
            streamingMessageId: useChatStore.getState().streamingMessageId,
          };
          callbacks?.onComplete?.({ message_id: 'msg-1', conversation_id: 'conv-1' });
        }
      );

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessageStreaming('Hola', mockAvatarId);
      });

      expect(capturedState?.isStreaming).toBe(true);
      expect(capturedState?.streamingMessageId).toBeTruthy();
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.streamingMessageId).toBeNull();
    });

    it('debe pasar relationshipType a sendMessageStream', async () => {
      (chatApi.sendMessageStream as jest.Mock).mockImplementation(
        async (_avatarId: string, _content: string, _relType: string | undefined, callbacks: StreamCallbacks) => {
          callbacks?.onComplete?.({ message_id: 'msg-1', conversation_id: 'conv-1' });
        }
      );

      const { result } = renderHook(() => useChatStore());

      await act(async () => {
        await result.current.sendMessageStreaming('Hola', mockAvatarId, 'romantic');
      });

      expect(chatApi.sendMessageStream).toHaveBeenCalledWith(
        mockAvatarId,
        'Hola',
        'romantic',
        expect.any(Object),
        expect.any(AbortSignal)
      );
    });
  });

  // ------------------------------------------
  // abortStream Tests
  // ------------------------------------------
  describe('abortStream', () => {
    it('debe abortar stream sin error cuando no hay stream activo', () => {
      const { result } = renderHook(() => useChatStore());

      expect(() => {
        act(() => {
          result.current.abortStream();
        });
      }).not.toThrow();
    });
  });

  // ------------------------------------------
  // Selectores Tests
  // ------------------------------------------
  describe('selectores', () => {
    it('debe exponer selectores funcionales', () => {
      const state = useChatStore.getState();

      expect(selectMessages(state)).toEqual([]);
      expect(selectIsLoading(state)).toBe(false);
      expect(selectIsSending(state)).toBe(false);
      expect(selectError(state)).toBeNull();
      expect(selectMessagesRemaining(state)).toBeNull();
      expect(selectUploadLimits(state)).toBeNull();
      expect(selectFileUploading(state)).toBe(false);
      expect(selectIsStreaming(state)).toBe(false);
      expect(selectStreamingMessageId(state)).toBeNull();
    });
  });
});

