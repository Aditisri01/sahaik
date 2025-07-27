// Detect if running in Android WebView (Capacitor) or Emulator
const isAndroid = /Android/i.test(navigator.userAgent);

export const API_BASE_URL =
  isAndroid
    ? 'https://sahaik-backend-1073580335924.us-central1.run.app'
    : (process.env.NODE_ENV === 'development'
        ? 'http://localhost:5001'
        : 'https://sahaik-backend-1073580335924.us-central1.run.app'); 