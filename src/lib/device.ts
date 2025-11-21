"use client";

/**
 * Best-effort detection for iOS/Android WebView environments.
 * Falls back to `false` during SSR or desktop browsers.
 */
export function isWebViewEnvironment(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  if ((window as any).ReactNativeWebView) {
    return true;
  }

  const userAgent = navigator.userAgent || navigator.vendor || "";

  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

  const isIOSWebView = isIOS && !isSafari;
  const isAndroidWebView =
    isAndroid && (/\bwv\b/.test(userAgent) || /Version\/[\d.]+/.test(userAgent));

  const hasCustomAppUA = /ForeApp|IGStory|FBAN|FBAV/i.test(userAgent);

  return Boolean(isIOSWebView || isAndroidWebView || hasCustomAppUA);
}

