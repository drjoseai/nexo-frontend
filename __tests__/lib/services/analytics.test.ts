/**
 * Tests for Analytics Service
 * Covers all branches for coverage requirements
 */

// Mock mixpanel-browser before importing analytics
const mockMixpanel = {
  init: jest.fn(),
  identify: jest.fn(),
  reset: jest.fn(),
  track: jest.fn(),
  people: {
    set: jest.fn(),
    increment: jest.fn(),
  },
};

jest.mock('mixpanel-browser', () => ({
  __esModule: true,
  default: mockMixpanel,
}));

// Save original env
const originalEnv = process.env;

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    // Reset env for each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('init', () => {
    it('should not initialize when MIXPANEL_TOKEN is not set', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = '';
      
      const { analytics } = await import('@/lib/services/analytics');
      await analytics.init();
      
      expect(mockMixpanel.init).not.toHaveBeenCalled();
    });

    it('should initialize mixpanel when token is set', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = 'test-token';
      process.env.NODE_ENV = 'production';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      await analytics.init();
      
      expect(mockMixpanel.init).toHaveBeenCalledWith('test-token', expect.any(Object));
    });

    it('should not re-initialize if already initialized', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = 'test-token';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      await analytics.init();
      await analytics.init(); // Second call
      
      expect(mockMixpanel.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('identify', () => {
    it('should not identify when not initialized', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = '';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      analytics.identify('user-123');
      
      expect(mockMixpanel.identify).not.toHaveBeenCalled();
    });

    it('should identify user when initialized', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = 'test-token';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      await analytics.init();
      analytics.identify('user-123');
      
      expect(mockMixpanel.identify).toHaveBeenCalledWith('user-123');
    });

    it('should set user properties when provided', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = 'test-token';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      await analytics.init();
      analytics.identify('user-123', { plan: 'premium' });
      
      expect(mockMixpanel.people.set).toHaveBeenCalledWith({ plan: 'premium' });
    });

    it('should not set properties when not provided', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = 'test-token';
      
      jest.resetModules();
      mockMixpanel.people.set.mockClear();
      const { analytics } = await import('@/lib/services/analytics');
      await analytics.init();
      analytics.identify('user-123');
      
      // people.set should not be called when no properties
      expect(mockMixpanel.people.set).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should not reset when not initialized', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = '';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      analytics.reset();
      
      expect(mockMixpanel.reset).not.toHaveBeenCalled();
    });

    it('should reset when initialized', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = 'test-token';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      await analytics.init();
      analytics.reset();
      
      expect(mockMixpanel.reset).toHaveBeenCalled();
    });
  });

  describe('track', () => {
    it('should not track when not initialized', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = '';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      analytics.track('test_event');
      
      expect(mockMixpanel.track).not.toHaveBeenCalled();
    });

    it('should track event when initialized', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = 'test-token';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      await analytics.init();
      analytics.track('test_event');
      
      expect(mockMixpanel.track).toHaveBeenCalledWith('test_event', expect.objectContaining({
        timestamp: expect.any(String),
      }));
    });

    it('should track event with properties', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = 'test-token';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      await analytics.init();
      analytics.track('test_event', { key: 'value' });
      
      expect(mockMixpanel.track).toHaveBeenCalledWith('test_event', expect.objectContaining({
        key: 'value',
        timestamp: expect.any(String),
      }));
    });
  });

  describe('setUserProperties', () => {
    it('should not set properties when not initialized', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = '';
      
      jest.resetModules();
      mockMixpanel.people.set.mockClear();
      const { analytics } = await import('@/lib/services/analytics');
      analytics.setUserProperties({ name: 'Test' });
      
      expect(mockMixpanel.people.set).not.toHaveBeenCalled();
    });

    it('should set properties when initialized', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = 'test-token';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      await analytics.init();
      analytics.setUserProperties({ name: 'Test' });
      
      expect(mockMixpanel.people.set).toHaveBeenCalledWith({ name: 'Test' });
    });
  });

  describe('increment', () => {
    it('should not increment when not initialized', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = '';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      analytics.increment('messages_sent');
      
      expect(mockMixpanel.people.increment).not.toHaveBeenCalled();
    });

    it('should increment with default value when initialized', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = 'test-token';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      await analytics.init();
      analytics.increment('messages_sent');
      
      expect(mockMixpanel.people.increment).toHaveBeenCalledWith('messages_sent', 1);
    });

    it('should increment with custom value', async () => {
      process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = 'test-token';
      
      jest.resetModules();
      const { analytics } = await import('@/lib/services/analytics');
      await analytics.init();
      analytics.increment('messages_sent', 5);
      
      expect(mockMixpanel.people.increment).toHaveBeenCalledWith('messages_sent', 5);
    });
  });

  describe('AnalyticsEvents', () => {
    it('should export predefined event names', async () => {
      const { AnalyticsEvents } = await import('@/lib/services/analytics');
      
      expect(AnalyticsEvents.USER_REGISTERED).toBe('user_registered');
      expect(AnalyticsEvents.USER_LOGGED_IN).toBe('user_logged_in');
      expect(AnalyticsEvents.MESSAGE_SENT).toBe('message_sent');
      expect(AnalyticsEvents.CHECKOUT_STARTED).toBe('checkout_started');
    });
  });
});

