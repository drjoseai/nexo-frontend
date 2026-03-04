/**
 * Sign in with Apple Button for NEXO
 * 
 * Renders an Apple Sign In button following Apple's HIG.
 * Only visible on iOS native platform.
 * 
 * Handles:
 * 1. Native Apple Sign In dialog
 * 2. Sending credentials to NEXO backend
 * 3. Updating auth store with user data
 * 
 * @module components/auth/AppleSignInButton
 */

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useNativePlatform } from '@/lib/hooks/use-native-platform';
import { isAppleSignInAvailable, appleSignIn } from '@/lib/capacitor/apple-auth';
import { appleSignInCallback } from '@/lib/api/iap';
import { useAuthStore } from '@/lib/store/auth';
import { analytics, AnalyticsEvents } from '@/lib/services/analytics';

interface AppleSignInButtonProps {
  /** Where to redirect after successful sign in */
  redirectTo?: string;
  /** Additional CSS classes */
  className?: string;
}

export function AppleSignInButton({
  redirectTo = '/dashboard',
  className = '',
}: AppleSignInButtonProps) {
  const router = useRouter();
  const { isIOSApp } = useNativePlatform();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('auth');

  if (!isIOSApp || !isAppleSignInAvailable()) {
    return null;
  }

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const appleResult = await appleSignIn();

      const { user, isNewUser } = await appleSignInCallback({
        identity_token: appleResult.identityToken,
        authorization_code: appleResult.authorizationCode,
        user: appleResult.user,
        email: appleResult.email,
        full_name: appleResult.givenName || appleResult.familyName
          ? { givenName: appleResult.givenName || undefined, familyName: appleResult.familyName || undefined }
          : null,
      });

      useAuthStore.setState({
        user,
        token: null,
        isAuthenticated: true,
        error: null,
        isLoading: false,
      });

      analytics.identify(user.id, {
        email: user.email,
        plan: user.plan,
        language: user.preferred_language,
        auth_provider: 'apple',
      });

      if (isNewUser) {
        analytics.track(AnalyticsEvents.USER_REGISTERED, {
          auth_provider: 'apple',
        });
        toast.success(t('registerSuccess'));
        router.push('/onboarding');
      } else {
        analytics.track(AnalyticsEvents.USER_LOGGED_IN, {
          auth_provider: 'apple',
          plan: user.plan,
        });
        toast.success(`¡Bienvenido, ${user.display_name || user.email}!`);
        router.push(redirectTo);
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      if (errorMsg === 'APPLE_SIGNIN_CANCELED') {
        return;
      }

      console.error('[AppleSignIn] Error:', error);
      toast.error(t('loginError'), {
        description: t('loginErrorDescription'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full bg-white text-black hover:bg-gray-100 border-gray-300 font-medium gap-2 ${className}`}
      onClick={handleAppleSignIn}
      disabled={isLoading}
      data-testid="apple-signin-button"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      )}
      {t('signInWithApple')}
    </Button>
  );
}
