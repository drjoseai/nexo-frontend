/**
 * Haptics utility for NEXO native app.
 * Provides tactile feedback for key user interactions.
 * Safe for SSR and web — no-ops when Haptics not available.
 * @module lib/capacitor/haptics
 */

'use client';

import { Capacitor } from '@capacitor/core';

let hapticsModule: typeof import('@capacitor/haptics') | null = null;

async function getHaptics() {
  if (!Capacitor.isNativePlatform()) return null;
  if (!hapticsModule) {
    hapticsModule = await import('@capacitor/haptics');
  }
  return hapticsModule;
}

/** Light tap — para enviar mensaje */
export async function hapticLight(): Promise<void> {
  try {
    const h = await getHaptics();
    if (!h) return;
    await h.Haptics.impact({ style: h.ImpactStyle.Light });
  } catch {
    // silencioso
  }
}

/** Medium tap — para cambiar avatar */
export async function hapticMedium(): Promise<void> {
  try {
    const h = await getHaptics();
    if (!h) return;
    await h.Haptics.impact({ style: h.ImpactStyle.Medium });
  } catch {
    // silencioso
  }
}

/** Success notification — para confirmaciones */
export async function hapticSuccess(): Promise<void> {
  try {
    const h = await getHaptics();
    if (!h) return;
    await h.Haptics.notification({ type: h.NotificationType.Success });
  } catch {
    // silencioso
  }
}

/** Error notification — para errores */
export async function hapticError(): Promise<void> {
  try {
    const h = await getHaptics();
    if (!h) return;
    await h.Haptics.notification({ type: h.NotificationType.Error });
  } catch {
    // silencioso
  }
}
