import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

/**
 * Capacitor 8 Configuration for NEXO
 * 
 * Build: npm run build:mobile && npx cap sync
 * iOS:   npx cap open ios
 * Android: npx cap open android
 */
const config: CapacitorConfig = {
  appId: 'ai.trynexo.app',
  appName: 'NEXO',
  webDir: 'out',

  // iOS configuration
  ios: {
    scheme: 'NEXO',
    contentInset: 'automatic',
    allowsLinkPreview: false,
    preferredContentMode: 'mobile',
  },

  // Android configuration  
  android: {
    allowMixedContent: false,
  },

  // Plugin configurations
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#110e0c',
      showSpinner: false,
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    ScreenOrientation: {
      default: 'portrait',
    },
  },

  // Server configuration - no live reload URL (static export)
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
};

export default config;
