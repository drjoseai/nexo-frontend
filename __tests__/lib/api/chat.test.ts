/**
 * Tests for Chat API Service
 * NEXO v2.0 - Day 10
 * 
 * @module __tests__/lib/api/chat.test
 */

import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'stream/web';

Object.assign(globalThis, { TextEncoder, TextDecoder, ReadableStream });

import { sendMessage, getChatHistory, getChatMessages, deleteHistory, sendMessageStream, chatApi } from '@/lib/api/chat';
import type { StreamCallbacks } from '@/lib/api/chat';
import { apiClient } from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Helper: Crear un ReadableStream mock desde SSE text
function createSSEStream(events: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const chunks = [encoder.encode(events)];
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(chunks[index++]);
      } else {
        controller.close();
      }
    },
  });
}

// Helper: Formatear evento SSE
function sseEvent(type: string, data: Record<string, unknown>): string {
  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
}

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

  describe('getChatHistory con relationshipType', () => {
    it('should include relationship_type param when provided', async () => {
      const mockResponse = {
        data: { avatar_id: 'lia', history: [], total_messages: 0 },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      await getChatHistory('lia', 20, 'romantic');

      expect(mockApiClient.get).toHaveBeenCalledWith('/chat/history/lia', {
        params: { limit: 20, relationship_type: 'romantic' },
      });
    });

    it('should not include relationship_type when undefined', async () => {
      const mockResponse = {
        data: { avatar_id: 'lia', history: [], total_messages: 0 },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      await getChatHistory('lia', 20, undefined);

      expect(mockApiClient.get).toHaveBeenCalledWith('/chat/history/lia', {
        params: { limit: 20 },
      });
    });
  });

  describe('getChatMessages con relationshipType', () => {
    it('should pass relationshipType through to getChatHistory', async () => {
      const mockResponse = {
        data: { avatar_id: 'lia', history: [], total_messages: 0 },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      await getChatMessages('lia', 30, 'friend');

      expect(mockApiClient.get).toHaveBeenCalledWith('/chat/history/lia', {
        params: { limit: 30, relationship_type: 'friend' },
      });
    });

    it('should map attachment fields from history', async () => {
      const mockResponse = {
        data: {
          avatar_id: 'lia',
          history: [
            {
              id: 'msg-1',
              role: 'user' as const,
              content: 'Check this',
              timestamp: '2025-12-12T14:00:00Z',
              conversation_id: 'conv-1',
              attachment_url: 'https://storage.example.com/photo.jpg',
              attachment_type: 'image',
              attachment_filename: 'photo.jpg',
              attachment_storage_path: 'uploads/photo.jpg',
            },
          ],
          total_messages: 1,
        },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const messages = await getChatMessages('lia');

      expect(messages[0].attachment_url).toBe('https://storage.example.com/photo.jpg');
      expect(messages[0].attachment_type).toBe('image');
      expect(messages[0].attachment_filename).toBe('photo.jpg');
      expect(messages[0].attachment_storage_path).toBe('uploads/photo.jpg');
    });

    it('should sort messages by timestamp ascending', async () => {
      const mockResponse = {
        data: {
          avatar_id: 'lia',
          history: [
            { id: 'msg-2', role: 'assistant' as const, content: 'Second', timestamp: '2025-12-12T14:00:05Z', conversation_id: 'c1' },
            { id: 'msg-1', role: 'user' as const, content: 'First', timestamp: '2025-12-12T14:00:00Z', conversation_id: 'c1' },
            { id: 'msg-3', role: 'user' as const, content: 'Third', timestamp: '2025-12-12T14:00:10Z', conversation_id: 'c1' },
          ],
          total_messages: 3,
        },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const messages = await getChatMessages('lia');

      expect(messages[0].content).toBe('First');
      expect(messages[1].content).toBe('Second');
      expect(messages[2].content).toBe('Third');
    });
  });

  describe('sendMessage con attachmentData', () => {
    it('should include attachment fields in request', async () => {
      const mockResponse = { data: { success: true, avatar_response: 'Nice photo!' } };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const attachmentData = {
        attachment_url: 'https://storage.example.com/photo.jpg',
        attachment_type: 'image' as const,
        attachment_filename: 'photo.jpg',
        attachment_storage_path: 'uploads/photo.jpg',
        extracted_text: undefined,
      };

      await sendMessage('lia', 'Check this', 'friend', 'es', attachmentData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/chat/message', expect.objectContaining({
        avatar_id: 'lia',
        content: 'Check this',
        attachment_url: 'https://storage.example.com/photo.jpg',
        attachment_type: 'image',
        attachment_filename: 'photo.jpg',
        attachment_storage_path: 'uploads/photo.jpg',
      }));
    });

    it('should include extracted_text when provided', async () => {
      const mockResponse = { data: { success: true, avatar_response: 'Got it!' } };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const attachmentData = {
        attachment_url: 'https://storage.example.com/doc.pdf',
        attachment_type: 'text' as const,
        attachment_filename: 'doc.pdf',
        attachment_storage_path: 'uploads/doc.pdf',
        extracted_text: 'Document content here',
      };

      await sendMessage('lia', 'Read this', undefined, undefined, attachmentData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/chat/message', expect.objectContaining({
        extracted_text: 'Document content here',
      }));
    });
  });

  describe('deleteHistory', () => {
    it('should delete history for avatar', async () => {
      mockApiClient.delete.mockResolvedValueOnce({});

      await deleteHistory('lia');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/chat/history/lia');
    });

    it('should include relationship_type query param when provided', async () => {
      mockApiClient.delete.mockResolvedValueOnce({});

      await deleteHistory('mia', 'romantic');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/chat/history/mia?relationship_type=romantic');
    });

    it('should handle delete errors', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(deleteHistory('lia')).rejects.toThrow('Delete failed');
    });
  });

  describe('sendMessageStream', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should call fetch with correct parameters', async () => {
      const sseData = sseEvent('complete', { message_id: 'msg-1', conversation_id: 'conv-1' });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: createSSEStream(sseData),
      });

      await sendMessageStream('lia', 'Hola', 'friend');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/chat/message/stream'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          credentials: 'include',
          body: JSON.stringify({
            avatar_id: 'lia',
            content: 'Hola',
            relationship_type: 'friend',
          }),
        })
      );
    });

    it('should trim content before sending', async () => {
      const sseData = sseEvent('complete', { message_id: 'msg-1', conversation_id: 'conv-1' });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: createSSEStream(sseData),
      });

      await sendMessageStream('lia', '  Hola mundo  ');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"content":"Hola mundo"'),
        })
      );
    });

    it('should call onStart callback', async () => {
      const startData = { avatar_id: 'lia', avatar_name: 'Lía', relationship_type: 'friend' };
      const sseData = sseEvent('start', { data: startData });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: createSSEStream(sseData),
      });

      const callbacks: StreamCallbacks = { onStart: jest.fn() };
      await sendMessageStream('lia', 'Hola', undefined, callbacks);

      expect(callbacks.onStart).toHaveBeenCalledWith(startData);
    });

    it('should call onContent callback with text chunks', async () => {
      global.requestAnimationFrame = jest.fn((cb) => { cb(0); return 0; });

      const sseData =
        sseEvent('content', { data: { text: 'Hola ' } }) +
        sseEvent('content', { data: { text: 'mundo!' } });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: createSSEStream(sseData),
      });

      const callbacks: StreamCallbacks = { onContent: jest.fn() };
      await sendMessageStream('lia', 'Hola', undefined, callbacks);

      expect(callbacks.onContent).toHaveBeenCalledTimes(2);
      expect(callbacks.onContent).toHaveBeenNthCalledWith(1, 'Hola ');
      expect(callbacks.onContent).toHaveBeenNthCalledWith(2, 'mundo!');
    });

    it('should call onMetadata callback', async () => {
      const metadataPayload = { tokens: 50, cost: 0.001, model: 'gpt-4o-mini', duration_ms: 200, cache_hit: false };
      const sseData = sseEvent('metadata', { data: metadataPayload });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: createSSEStream(sseData),
      });

      const callbacks: StreamCallbacks = { onMetadata: jest.fn() };
      await sendMessageStream('lia', 'Hola', undefined, callbacks);

      expect(callbacks.onMetadata).toHaveBeenCalledWith(metadataPayload);
    });

    it('should call onComplete callback', async () => {
      const completeData = { message_id: 'msg-1', conversation_id: 'conv-1' };
      const sseData = sseEvent('complete', { data: completeData });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: createSSEStream(sseData),
      });

      const callbacks: StreamCallbacks = { onComplete: jest.fn() };
      await sendMessageStream('lia', 'Hola', undefined, callbacks);

      expect(callbacks.onComplete).toHaveBeenCalledWith(completeData);
    });

    it('should call onError callback', async () => {
      const errorData = { message: 'Rate limit exceeded', error_type: 'rate_limit', retry_after: 60 };
      const sseData = sseEvent('error', { data: errorData });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: createSSEStream(sseData),
      });

      const callbacks: StreamCallbacks = { onError: jest.fn() };
      await sendMessageStream('lia', 'Hola', undefined, callbacks);

      expect(callbacks.onError).toHaveBeenCalledWith(errorData);
    });

    it('should throw structured error when response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: jest.fn().mockResolvedValueOnce({
          detail: {
            message: 'Rate limit exceeded',
            limit_info: { limit: 100, resets_at: '2026-01-30T08:00:00Z' },
          },
        }),
      });

      await expect(sendMessageStream('lia', 'Hola')).rejects.toMatchObject({
        status: 429,
        code: 'daily_limit_exceeded',
      });
    });

    it('should handle non-429 error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce({
          detail: 'Internal server error',
        }),
      });

      await expect(sendMessageStream('lia', 'Hola')).rejects.toMatchObject({
        status: 500,
        message: 'Internal server error',
      });
    });

    it('should handle json parse error on bad response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      });

      await expect(sendMessageStream('lia', 'Hola')).rejects.toMatchObject({
        status: 502,
        message: 'Error 502',
      });
    });

    it('should throw when response body is null', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: null,
      });

      await expect(sendMessageStream('lia', 'Hola')).rejects.toThrow(
        'Response body is null'
      );
    });

    it('should pass abort signal to fetch', async () => {
      const sseData = sseEvent('complete', { message_id: 'msg-1', conversation_id: 'conv-1' });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: createSSEStream(sseData),
      });

      const controller = new AbortController();
      await sendMessageStream('lia', 'Hola', undefined, undefined, controller.signal);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: controller.signal,
        })
      );
    });

    it('should handle SSE events without data wrapper', async () => {
      const sseData = sseEvent('complete', { message_id: 'msg-1', conversation_id: 'conv-1' });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: createSSEStream(sseData),
      });

      const callbacks: StreamCallbacks = { onComplete: jest.fn() };
      await sendMessageStream('lia', 'Hola', undefined, callbacks);

      expect(callbacks.onComplete).toHaveBeenCalledWith({ message_id: 'msg-1', conversation_id: 'conv-1' });
    });

    it('should handle malformed SSE events gracefully', async () => {
      const badSSE = "event: content\ndata: {invalid json}\n\n" +
        sseEvent('complete', { message_id: 'msg-1', conversation_id: 'conv-1' });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: createSSEStream(badSSE),
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const callbacks: StreamCallbacks = { onComplete: jest.fn() };

      await sendMessageStream('lia', 'Hola', undefined, callbacks);

      expect(consoleSpy).toHaveBeenCalled();
      expect(callbacks.onComplete).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should work without any callbacks', async () => {
      const sseData =
        sseEvent('start', { avatar_id: 'lia' }) +
        sseEvent('content', { data: { text: 'Hello' } }) +
        sseEvent('complete', { message_id: 'msg-1', conversation_id: 'conv-1' });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: createSSEStream(sseData),
      });

      await expect(sendMessageStream('lia', 'Hola')).resolves.toBeUndefined();
    });

    it('should release reader lock when done', async () => {
      const releaseLock = jest.fn();
      const reader = {
        read: jest.fn()
          .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(sseEvent('complete', { message_id: 'msg-1' })) })
          .mockResolvedValueOnce({ done: true, value: undefined }),
        releaseLock,
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => reader },
      });

      await sendMessageStream('lia', 'Hola');

      expect(releaseLock).toHaveBeenCalled();
    });

    it('should release reader lock even on error', async () => {
      const releaseLock = jest.fn();
      const reader = {
        read: jest.fn().mockRejectedValueOnce(new Error('Stream error')),
        releaseLock,
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: { getReader: () => reader },
      });

      await expect(sendMessageStream('lia', 'Hola')).rejects.toThrow('Stream error');
      expect(releaseLock).toHaveBeenCalled();
    });
  });

  describe('chatApi object - updated', () => {
    it('should export all functions including deleteHistory and sendMessageStream', () => {
      expect(chatApi.sendMessage).toBe(sendMessage);
      expect(chatApi.getChatHistory).toBe(getChatHistory);
      expect(chatApi.getChatMessages).toBe(getChatMessages);
      expect(chatApi.deleteHistory).toBe(deleteHistory);
      expect(chatApi.sendMessageStream).toBe(sendMessageStream);
    });
  });
});

