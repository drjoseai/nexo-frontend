/**
 * Tests for Chat API Service
 * NEXO v2.0 - Day 10
 * 
 * @module __tests__/lib/api/chat.test
 */

import { sendMessage, getChatHistory, getChatMessages, chatApi } from '@/lib/api/chat';
import { apiClient } from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Chat API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    const mockResponse = {
      data: {
        id: 'msg-456',
        response: '¡Hola! ¿Cómo estás?',
        avatar_response: '¡Hola! ¿Cómo estás?',
        model_used: 'gpt-4o-mini',
        tokens_used: 150,
        cache_used: false,
        success: true,
      },
    };

    it('should send message with required parameters', async () => {
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await sendMessage('lia', 'Hola!');

      expect(mockApiClient.post).toHaveBeenCalledWith('/chat/message', {
        avatar_id: 'lia',
        content: 'Hola!',
        relationship_type: undefined,
        language: undefined,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should send message with all parameters', async () => {
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await sendMessage('lia', 'Hola!', 'friend', 'es');

      expect(mockApiClient.post).toHaveBeenCalledWith('/chat/message', {
        avatar_id: 'lia',
        content: 'Hola!',
        relationship_type: 'friend',
        language: 'es',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should trim whitespace from content', async () => {
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      await sendMessage('lia', '  Hola!  ');

      expect(mockApiClient.post).toHaveBeenCalledWith('/chat/message', {
        avatar_id: 'lia',
        content: 'Hola!',
        relationship_type: undefined,
        language: undefined,
      });
    });

    it('should handle romantic relationship type', async () => {
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      await sendMessage('mia', 'Te amo', 'romantic', 'es');

      expect(mockApiClient.post).toHaveBeenCalledWith('/chat/message', {
        avatar_id: 'mia',
        content: 'Te amo',
        relationship_type: 'romantic',
        language: 'es',
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('Network error');
      mockApiClient.post.mockRejectedValueOnce(error);

      await expect(sendMessage('lia', 'Hola!')).rejects.toThrow('Network error');
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      mockApiClient.post.mockRejectedValueOnce(rateLimitError);

      await expect(sendMessage('lia', 'Hola!')).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('getChatHistory', () => {
    const mockHistoryResponse = {
      data: {
        avatar_id: 'lia',
        history: [
          {
            id: 'msg-1',
            role: 'user' as const,
            content: 'Hola!',
            timestamp: '2025-12-12T14:00:00Z',
            conversation_id: 'conv-123',
          },
          {
            id: 'msg-2',
            role: 'assistant' as const,
            content: '¡Hola! ¿Cómo estás?',
            timestamp: '2025-12-12T14:00:01Z',
            conversation_id: 'conv-123',
          },
        ],
        total_messages: 2,
      },
    };

    it('should get chat history with default limit', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockHistoryResponse);

      const result = await getChatHistory('lia');

      expect(mockApiClient.get).toHaveBeenCalledWith('/chat/history/lia', {
        params: { limit: 20 },
      });
      expect(result).toEqual(mockHistoryResponse.data);
    });

    it('should get chat history with custom limit', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockHistoryResponse);

      const result = await getChatHistory('mia', 50);

      expect(mockApiClient.get).toHaveBeenCalledWith('/chat/history/mia', {
        params: { limit: 50 },
      });
      expect(result).toEqual(mockHistoryResponse.data);
    });

    it('should handle empty history', async () => {
      const emptyResponse = {
        data: {
          avatar_id: 'allan',
          history: [],
          total_messages: 0,
        },
      };
      mockApiClient.get.mockResolvedValueOnce(emptyResponse);

      const result = await getChatHistory('allan');

      expect(result.history).toHaveLength(0);
      expect(result.total_messages).toBe(0);
    });

    it('should handle different avatar IDs', async () => {
      const liaResponse = { ...mockHistoryResponse };
      const miaResponse = {
        data: {
          avatar_id: 'mia',
          history: [
            {
              id: 'msg-3',
              role: 'user' as const,
              content: 'Hello!',
              timestamp: '2025-12-12T15:00:00Z',
              conversation_id: 'conv-456',
            },
          ],
          total_messages: 1,
        },
      };

      mockApiClient.get.mockResolvedValueOnce(liaResponse);
      await getChatHistory('lia');

      mockApiClient.get.mockResolvedValueOnce(miaResponse);
      await getChatHistory('mia');

      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
      expect(mockApiClient.get).toHaveBeenNthCalledWith(1, '/chat/history/lia', {
        params: { limit: 20 },
      });
      expect(mockApiClient.get).toHaveBeenNthCalledWith(2, '/chat/history/mia', {
        params: { limit: 20 },
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('Unauthorized');
      mockApiClient.get.mockRejectedValueOnce(error);

      await expect(getChatHistory('lia')).rejects.toThrow('Unauthorized');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network connection failed');
      mockApiClient.get.mockRejectedValueOnce(error);

      await expect(getChatHistory('lia')).rejects.toThrow('Network connection failed');
    });
  });

  describe('getChatMessages', () => {
    const mockHistoryResponse = {
      data: {
        avatar_id: 'lia',
        history: [
          {
            id: 'msg-1',
            role: 'user' as const,
            content: 'Hola!',
            timestamp: '2025-12-12T14:00:00Z',
            conversation_id: 'conv-123',
          },
          {
            id: 'msg-2',
            role: 'assistant' as const,
            content: '¡Hola! ¿Cómo estás?',
            timestamp: '2025-12-12T14:00:01Z',
            conversation_id: 'conv-123',
          },
        ],
        total_messages: 2,
      },
    };

    it('should transform history to Message format', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockHistoryResponse);

      const messages = await getChatMessages('lia');

      expect(messages).toHaveLength(2);
      expect(messages[0]).toMatchObject({
        id: 'msg-1',
        role: 'user',
        content: 'Hola!',
        status: 'sent',
      });
      expect(messages[0].timestamp).toBeInstanceOf(Date);
      expect(messages[1]).toMatchObject({
        id: 'msg-2',
        role: 'assistant',
        content: '¡Hola! ¿Cómo estás?',
        status: 'sent',
      });
      expect(messages[1].timestamp).toBeInstanceOf(Date);
    });

    it('should use custom limit parameter', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockHistoryResponse);

      await getChatMessages('lia', 10);

      expect(mockApiClient.get).toHaveBeenCalledWith('/chat/history/lia', {
        params: { limit: 10 },
      });
    });

    it('should return empty array for empty history', async () => {
      const emptyResponse = {
        data: {
          avatar_id: 'lia',
          history: [],
          total_messages: 0,
        },
      };
      mockApiClient.get.mockResolvedValueOnce(emptyResponse);

      const messages = await getChatMessages('lia');

      expect(messages).toHaveLength(0);
    });

    it('should correctly parse timestamp strings to Date objects', async () => {
      mockApiClient.get.mockResolvedValueOnce(mockHistoryResponse);

      const messages = await getChatMessages('lia');

      expect(messages[0].timestamp).toEqual(new Date('2025-12-12T14:00:00Z'));
      expect(messages[1].timestamp).toEqual(new Date('2025-12-12T14:00:01Z'));
    });

    it('should preserve message order', async () => {
      const multiMessageResponse = {
        data: {
          avatar_id: 'lia',
          history: [
            {
              id: 'msg-1',
              role: 'user' as const,
              content: 'First message',
              timestamp: '2025-12-12T14:00:00Z',
              conversation_id: 'conv-123',
            },
            {
              id: 'msg-2',
              role: 'assistant' as const,
              content: 'Second message',
              timestamp: '2025-12-12T14:00:01Z',
              conversation_id: 'conv-123',
            },
            {
              id: 'msg-3',
              role: 'user' as const,
              content: 'Third message',
              timestamp: '2025-12-12T14:00:02Z',
              conversation_id: 'conv-123',
            },
          ],
          total_messages: 3,
        },
      };
      mockApiClient.get.mockResolvedValueOnce(multiMessageResponse);

      const messages = await getChatMessages('lia');

      expect(messages[0].content).toBe('First message');
      expect(messages[1].content).toBe('Second message');
      expect(messages[2].content).toBe('Third message');
    });

    it('should handle API errors from getChatHistory', async () => {
      const error = new Error('Server error');
      mockApiClient.get.mockRejectedValueOnce(error);

      await expect(getChatMessages('lia')).rejects.toThrow('Server error');
    });
  });

  describe('chatApi object', () => {
    it('should export all functions', () => {
      expect(chatApi.sendMessage).toBe(sendMessage);
      expect(chatApi.getChatHistory).toBe(getChatHistory);
      expect(chatApi.getChatMessages).toBe(getChatMessages);
    });

    it('should have all required methods', () => {
      expect(typeof chatApi.sendMessage).toBe('function');
      expect(typeof chatApi.getChatHistory).toBe('function');
      expect(typeof chatApi.getChatMessages).toBe('function');
    });
  });
});

