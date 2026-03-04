/**
 * Sign in with Apple wrapper for NEXO
 * 
 * Uses a custom minimal Capacitor plugin (NexoAppleAuth) registered
 * in the iOS native project. This approach is needed because
 * @capacitor-community/apple-sign-in is incompatible with Capacitor 8.
 * 
 * Flow:
 * 1. Call authorize() → native Apple Sign In dialog
 * 2. Receive identity_token + authorization_code + user info
 * 3. Send to backend POST /api/v1/auth/apple/callback
 * 4. Backend validates with Apple, creates/logs in user, returns JWT
 * 
 * @module lib/capacitor/apple-auth
 */

import { isIOS, isNative } from '@/src/lib/native';
import { registerPlugin } from '@capacitor/core';

/** Response from Apple Sign In native dialog */
export interface AppleSignInResult {
  identityToken: string;
  authorizationCode: string;
  user: string | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
}

/** Custom plugin interface */
interface NexoAppleAuthPlugin {
  authorize(): Promise<AppleSignInResult>;
}

/** Register the custom native plugin */
const NexoAppleAuth = registerPlugin<NexoAppleAuthPlugin>('NexoAppleAuth');

/**
 * Check if Sign in with Apple is available.
 * Only available on iOS native.
 */
export function isAppleSignInAvailable(): boolean {
  return isNative() && isIOS();
}

/**
 * Trigger Apple Sign In native dialog.
 * 
 * @returns Apple credentials (identity_token, authorization_code, user info)
 * @throws Error if user cancels or Apple Sign In fails
 */
export async function appleSignIn(): Promise<AppleSignInResult> {
  if (!isAppleSignInAvailable()) {
    throw new Error('Apple Sign In is only available on iOS native app');
  }

  try {
    const result = await NexoAppleAuth.authorize();
    console.log('[AppleAuth] Sign in successful');
    return result;
  } catch (error: unknown) {
    const authError = error as { code?: string; message?: string };

    // ASAuthorizationError.canceled = 1001
    if (authError.code === '1001' || authError.message?.includes('canceled')) {
      throw new Error('APPLE_SIGNIN_CANCELED');
    }

    console.error('[AppleAuth] Sign in failed:', error);
    throw error;
  }
}
