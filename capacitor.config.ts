import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.subkit.tracker',
  appName: 'SubKit',
  webDir: '.',
  // The web app lives on Vercel. The native shell loads it directly
  // (no bundling — same single-file PWA we ship to the browser).
  server: {
    url: 'https://subkit-ten.vercel.app',
    cleartext: false,
    // Allow navigating to /app from a deep link, not just /
    androidScheme: 'https',
    iosAllowBrowserNavigation: ['subkit.app', 'subkit-ten.vercel.app'],
  },
  ios: {
    contentInset: 'automatic',
    // WKWebView performance
    prefersFullScreen: true,
    backgroundColor: '#0a0a0f',
  },
  android: {
    // We use Bubblewrap (TWA) for Android, not Capacitor. The Android
    // Capacitor build is here only so `cap sync` doesn't fail; the
    // Play Store deliverable is .android/ via bubblewrap.
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: true,
      backgroundColor: '#0a0a0f',
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'LaunchStoryboard',
    },
  },
};

export default config;
