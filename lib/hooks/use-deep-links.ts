/**
 * React hook for Deep Links in NEXO.
 * Handles Universal Links (iOS) and App Links (Android).
 * @module lib/hooks/use-deep-links
 */

'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addDeepLinkListener, isNexoDeepLink, type DeepLinkEvent } from '@/lib/capacitor/deep-links';
import { isNative } from '@/src/lib/native';

/**
 * Hook to handle deep links and navigate accordingly.
 * Should be used once at the app root level.
 *
 * @param options.onDeepLink - Optional custom handler for deep link events
 *
 * @example
 * ```tsx
 * // In app layout or root component:
 * useDeepLinks();
 * ```
 */
export function useDeepLinks(options?: {
  onDeepLink?: (event: DeepLinkEvent) => void;
}): void {
  const router = useRouter();
  const cleanupRef = useRef<(() => void) | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    if (!isNative()) return;

    const setup = async () => {
      cleanupRef.current = await addDeepLinkListener((event) => {
        console.log('[useDeepLinks] Handling deep link:', event.path);

        optionsRef.current?.onDeepLink?.(event);

        if (!isNexoDeepLink(event.url)) return;

        const { path } = event;

        if (path.startsWith('/reset-password')) {
          const token = event.params.token;
          if (token) {
            router.push(`/reset-password?token=${token}`);
          }
        } else if (path.startsWith('/verify-email')) {
          const token = event.params.token;
          if (token) {
            router.push(`/verify-email?token=${token}`);
          }
        } else if (path.startsWith('/chat')) {
          router.push(path);
        } else if (path.startsWith('/subscription')) {
          router.push('/subscription');
        } else {
          router.push(path);
        }
      });
    };

    setup();

    return () => {
      cleanupRef.current?.();
    };
  }, [router]);
}
