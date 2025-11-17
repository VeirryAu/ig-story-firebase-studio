/**
 * Environment Utilities
 * Handles environment detection for development features
 * 
 * This allows building for production while still enabling dev features
 * via runtime environment variables or URL parameters
 */

/**
 * Checks if development mode should be enabled
 * Development mode can be enabled via:
 * 1. NODE_ENV === 'development' (build-time)
 * 2. NEXT_PUBLIC_ENABLE_DEV_MODE=true (runtime, via env var)
 * 3. ?dev=true URL parameter (runtime)
 * 
 * @returns boolean - true if dev mode should be enabled
 */
export function isDevMode(): boolean {
  // Check build-time environment
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Check runtime environment variable (set at build or runtime)
  if (typeof window !== 'undefined') {
    // Check URL parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === 'true') {
      return true;
    }

    // Check localStorage (for persistent dev mode)
    try {
      if (localStorage.getItem('dev_mode') === 'true') {
        return true;
      }
    } catch (e) {
      // localStorage might not be available
    }
  }

  // Check NEXT_PUBLIC environment variable (set at build time)
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true') {
    return true;
  }

  return false;
}

/**
 * Enables dev mode via localStorage (for testing)
 */
export function enableDevMode(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('dev_mode', 'true');
      // Reload to apply changes
      window.location.reload();
    } catch (e) {
      console.error('Failed to enable dev mode:', e);
    }
  }
}

/**
 * Disables dev mode via localStorage
 */
export function disableDevMode(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('dev_mode');
      // Reload to apply changes
      window.location.reload();
    } catch (e) {
      console.error('Failed to disable dev mode:', e);
    }
  }
}

