/**
 * Files API Tests for NEXO v2.0
 * Coverage target: >90% lines for lib/api/files.ts
 */

import { fileApi, validateFile } from '@/lib/api/files';
import { apiClient } from '@/lib/api/client';

// Mock apiClient
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;

describe('Files API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // validateFile
  // ==========================================
  describe('validateFile', () => {
    it('should accept valid JPEG image', () => {
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
      const result = validateFile(file);
      expect(result).toEqual({ valid: true, fileType: 'image' });
    });

    it('should accept valid PNG image', () => {
      const file = new File(['data'], 'photo.png', { type: 'image/png' });
      const result = validateFile(file);
      expect(result).toEqual({ valid: true, fileType: 'image' });
    });

    it('should accept valid WebP image', () => {
      const file = new File(['data'], 'photo.webp', { type: 'image/webp' });
      const result = validateFile(file);
      expect(result).toEqual({ valid: true, fileType: 'image' });
    });

    it('should accept valid GIF image', () => {
      const file = new File(['data'], 'anim.gif', { type: 'image/gif' });
      const result = validateFile(file);
      expect(result).toEqual({ valid: true, fileType: 'image' });
    });

    it('should accept valid text file', () => {
      const file = new File(['hello'], 'doc.txt', { type: 'text/plain' });
      const result = validateFile(file);
      expect(result).toEqual({ valid: true, fileType: 'text' });
    });

    it('should accept valid PDF file', () => {
      const file = new File(['pdf'], 'doc.pdf', { type: 'application/pdf' });
      const result = validateFile(file);
      expect(result).toEqual({ valid: true, fileType: 'text' });
    });

    it('should reject unsupported file type', () => {
      const file = new File(['data'], 'video.mp4', { type: 'video/mp4' });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Tipo de archivo no soportado');
    });

    it('should reject image exceeding 5MB', () => {
      const bigData = new Uint8Array(5 * 1024 * 1024 + 1);
      const file = new File([bigData], 'big.jpg', { type: 'image/jpeg' });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('5MB');
    });

    it('should reject text file exceeding 10KB', () => {
      const bigText = 'x'.repeat(10 * 1024 + 1);
      const file = new File([bigText], 'big.txt', { type: 'text/plain' });
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('10KB');
    });
  });

  // ==========================================
  // uploadFile
  // ==========================================
  describe('uploadFile', () => {
    it('should upload file with FormData and correct headers', async () => {
      const mockResponse = {
        data: {
          success: true,
          signed_url: 'https://r2.example.com/file.jpg',
          filename: 'photo.jpg',
          storage_path: 'uploads/photo.jpg',
          file_category: 'image' as const,
          content_type: 'image/jpeg',
          size_bytes: 1234,
          uploads_remaining: 9,
        },
      };
      mockPost.mockResolvedValueOnce(mockResponse);

      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
      const result = await fileApi.uploadFile(file, 'avatar-123');

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/files/upload',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Verify FormData contents
      const formData = mockPost.mock.calls[0][1] as FormData;
      expect(formData.get('file')).toBeInstanceOf(File);
      expect(formData.get('avatar_id')).toBe('avatar-123');

      expect(result).toEqual(mockResponse.data);
    });

    it('should propagate errors from apiClient', async () => {
      mockPost.mockRejectedValueOnce(new Error('Upload failed'));

      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
      await expect(fileApi.uploadFile(file, 'avatar-123')).rejects.toThrow('Upload failed');
    });
  });

  // ==========================================
  // getUploadLimits
  // ==========================================
  describe('getUploadLimits', () => {
    it('should fetch upload limits', async () => {
      const mockResponse = {
        data: {
          allowed: true,
          used: 3,
          limit: 10,
          remaining: 7,
          plan: 'plus',
        },
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await fileApi.getUploadLimits();

      expect(mockGet).toHaveBeenCalledWith('/api/v1/files/limits');
      expect(result).toEqual(mockResponse.data);
    });

    it('should propagate errors from apiClient', async () => {
      mockGet.mockRejectedValueOnce(new Error('Limits fetch failed'));

      await expect(fileApi.getUploadLimits()).rejects.toThrow('Limits fetch failed');
    });
  });

  // ==========================================
  // refreshFileUrl
  // ==========================================
  describe('refreshFileUrl', () => {
    it('should refresh signed URL for storage path', async () => {
      const mockResponse = {
        data: {
          signed_url: 'https://r2.example.com/new-signed-url',
          expires_in: 3600,
        },
      };
      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await fileApi.refreshFileUrl('uploads/photo.jpg');

      expect(mockPost).toHaveBeenCalledWith(
        '/api/v1/files/refresh-url',
        { storage_path: 'uploads/photo.jpg' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should propagate errors from apiClient', async () => {
      mockPost.mockRejectedValueOnce(new Error('Refresh failed'));

      await expect(fileApi.refreshFileUrl('uploads/photo.jpg')).rejects.toThrow('Refresh failed');
    });
  });

  // ==========================================
  // fileApi export object
  // ==========================================
  describe('fileApi object', () => {
    it('should export all API methods', () => {
      expect(fileApi).toHaveProperty('uploadFile');
      expect(fileApi).toHaveProperty('getUploadLimits');
      expect(fileApi).toHaveProperty('refreshFileUrl');
      expect(fileApi).toHaveProperty('validateFile');
      expect(typeof fileApi.uploadFile).toBe('function');
      expect(typeof fileApi.getUploadLimits).toBe('function');
      expect(typeof fileApi.refreshFileUrl).toBe('function');
      expect(typeof fileApi.validateFile).toBe('function');
    });
  });
});
