/**
 * In-App Review utility for NEXO native app.
 * Requests user rating after meaningful engagement.
 * Uses @capacitor-community/app-review plugin.
 * Safe for SSR and web — no-op on non-native platforms.
 * @module lib/capacitor/in-app-review
 */

'use client';

import { Capacitor } from '@capacitor/core';

const STORAGE_KEY = 'nexo_review_requested';
const MESSAGE_COUNT_KEY = 'nexo_messages_sent_count';
const TRIGGER_COUNT = 10;

/**
 * Increment sent message count and request review if threshold reached.
 * Call this after each successful message send.
 */
export async function trackMessageAndRequestReview(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (typeof window === 'undefined') return;

  try {
    const alreadyRequested = localStorage.getItem(STORAGE_KEY);
    if (alreadyRequested) return;

    const current = parseInt(localStorage.getItem(MESSAGE_COUNT_KEY) || '0', 10);
    const updated = current + 1;
    localStorage.setItem(MESSAGE_COUNT_KEY, String(updated));

    console.log(`[InAppReview] Messages sent: ${updated}/${TRIGGER_COUNT}`);

    if (updated >= TRIGGER_COUNT) {
      await requestReview();
    }
  } catch (error) {
    console.warn('[InAppReview] Error tracking message:', error);
  }
}

/**
 * Request the native in-app review prompt.
 * Apple/Google decide whether to actually show it.
 */
async function requestReview(): Promise<void> {
  try {
    const { InAppReview } = await import('@capacitor-community/in-app-review');

    await InAppReview.requestReview();

    localStorage.setItem(STORAGE_KEY, 'true');
    console.log('[InAppReview] Review requested successfully');
  } catch (error) {
    console.warn('[InAppReview] Plugin not available or failed:', error);
    localStorage.setItem(STORAGE_KEY, 'true');
  }
}

/**
 * Reset review state (for testing purposes only).
 */
export function resetReviewState(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(MESSAGE_COUNT_KEY);
}
