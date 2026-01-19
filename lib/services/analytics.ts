/**
 * Analytics Service for NEXO v2.0
 * 
 * Centralized Mixpanel analytics integration.
 * Handles event tracking, user identification, and property management.
 * 
 * @module lib/services/analytics
 */

import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Initialize only once
let isInitialized = false;

export const analytics = {
  /**
   * Initialize Mixpanel - call once on app load
   */
  init: () => {
    if (isInitialized || !MIXPANEL_TOKEN) {
      if (!MIXPANEL_TOKEN) {
        console.warn('[Analytics] MIXPANEL_TOKEN not configured');
      }
      return;
    }
    
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: !IS_PRODUCTION,
      track_pageviews: true,
      persistence: 'localStorage',
      ignore_dnt: false, // Respect Do Not Track
    });
    
    isInitialized = true;
    console.log('[Analytics] Mixpanel initialized');
  },

  /**
   * Identify user after login/register
   */
  identify: (userId: string, properties?: Record<string, unknown>) => {
    if (!isInitialized) return;
    
    mixpanel.identify(userId);
    
    if (properties) {
      mixpanel.people.set(properties);
    }
  },

  /**
   * Reset user identity on logout
   */
  reset: () => {
    if (!isInitialized) return;
    mixpanel.reset();
  },

  /**
   * Track an event
   */
  track: (event: string, properties?: Record<string, unknown>) => {
    if (!isInitialized) return;
    
    mixpanel.track(event, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Set user properties
   */
  setUserProperties: (properties: Record<string, unknown>) => {
    if (!isInitialized) return;
    mixpanel.people.set(properties);
  },

  /**
   * Increment a numeric user property
   */
  increment: (property: string, value: number = 1) => {
    if (!isInitialized) return;
    mixpanel.people.increment(property, value);
  },
};

// Pre-defined event names for consistency
export const AnalyticsEvents = {
  // Auth events
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  
  // Chat events
  MESSAGE_SENT: 'message_sent',
  CONVERSATION_STARTED: 'conversation_started',
  
  // Avatar events
  AVATAR_SELECTED: 'avatar_selected',
  RELATIONSHIP_CHANGED: 'relationship_changed',
  
  // Subscription events
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  
  // Navigation
  PAGE_VIEWED: 'page_viewed',
} as const;

export type AnalyticsEvent = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

