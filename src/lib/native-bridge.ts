/**
 * Native Bridge Utilities
 * Functions to communicate with Android and iOS native apps via WebView
 */

import { isDevMode } from './env';

declare global {
  interface Window {
    AndroidBridge?: {
      closeWebView: () => void;
      shareImageUrl: (url: string) => void;
      shareUrl: (url: string) => void;
      track: (eventName: string, eventValue: string) => void;
      handleDeeplink: (deeplinkUrl: string) => void;
    };
    webkit?: {
      messageHandlers?: {
        closeWebView?: {
          postMessage: (data: any) => void;
        };
        shareImageUrl?: {
          postMessage: (data: { url: string }) => void;
        };
        shareUrl?: {
          postMessage: (data: { url: string }) => void;
        };
        track?: {
          postMessage: (data: { eventName: string; eventValue: string }) => void;
        };
        handleDeeplink?: {
          postMessage: (data: { url: string }) => void;
        };
      };
    };
  }
}

/**
 * Closes the WebView in native app
 */
export function closeWebView(): void {
  // Android
  if (typeof window !== 'undefined' && (window as any).AndroidBridge?.closeWebView) {
    (window as any).AndroidBridge.closeWebView();
    return;
  }

  // iOS
  if (typeof window !== 'undefined' && (window as any).webkit?.messageHandlers?.closeWebView) {
    (window as any).webkit.messageHandlers.closeWebView.postMessage(null);
    return;
  }

  // Fallback for browser (debug mode)
  if (isDevMode()) {
    console.log('[NativeBridge] closeWebView() called - not supported in browser');
    // In development, we might want to show an alert or just log
    // alert("closeWebView() not supported in this environment.");
  }
}

/**
 * Shares an image URL to native app for sharing
 * @param url - The image URL to share
 */
export function shareImageUrl(url: string): void {
  if (!url) {
    console.error('[NativeBridge] shareImageUrl: URL is required');
    return;
  }

  // Android
  if (typeof window !== 'undefined' && (window as any).AndroidBridge?.shareImageUrl) {
    (window as any).AndroidBridge.shareImageUrl(url);
    return;
  }

  // iOS
  if (typeof window !== 'undefined' && (window as any).webkit?.messageHandlers?.shareImageUrl) {
    (window as any).webkit.messageHandlers.shareImageUrl.postMessage({ url });
    return;
  }

  // Fallback for browser (debug mode)
  if (isDevMode()) {
    console.log('[NativeBridge] shareImageUrl() called with URL:', url);
    // In development, just log - don't open new tab
  }
}

/**
 * Shares a URL to native app for sharing (for fullscreen slide sharing)
 * @param url - The URL to share
 */
export function shareUrl(url: string): void {
  if (!url) {
    console.error('[NativeBridge] shareUrl: URL is required');
    return;
  }

  // Android
  if (typeof window !== 'undefined' && (window as any).AndroidBridge?.shareUrl) {
    (window as any).AndroidBridge.shareUrl(url);
    return;
  }

  // iOS
  if (typeof window !== 'undefined' && (window as any).webkit?.messageHandlers?.shareUrl) {
    (window as any).webkit.messageHandlers.shareUrl.postMessage({ url });
    return;
  }

  // Fallback for browser (debug mode)
  if (isDevMode()) {
    console.log('[NativeBridge] shareUrl() called with URL:', url);
    window.open(url, '_blank');
  }
}

/**
 * Tracks an analytics event
 * @param eventName - The name of the event
 * @param eventValue - The value of the event
 */
export function track(eventName: string, eventValue: string): void {
  if (!eventName) {
    console.error('[NativeBridge] track: eventName is required');
    return;
  }

  // Android
  if (typeof window !== 'undefined' && (window as any).AndroidBridge?.track) {
    (window as any).AndroidBridge.track(eventName, eventValue);
    return;
  }

  // iOS
  if (typeof window !== 'undefined' && (window as any).webkit?.messageHandlers?.track) {
    (window as any).webkit.messageHandlers.track.postMessage({ eventName, eventValue });
    return;
  }

  // Fallback for browser (debug mode)
  if (isDevMode()) {
    console.log('[NativeBridge] track() called:', { eventName, eventValue });
  }
}

/**
 * Handles a deeplink navigation
 * @param deeplinkUrl - The deeplink URL to navigate to
 */
export function handleDeeplink(deeplinkUrl: string): void {
  if (!deeplinkUrl) {
    console.error('[NativeBridge] handleDeeplink: deeplinkUrl is required');
    return;
  }

  // Android
  if (typeof window !== 'undefined' && (window as any).AndroidBridge?.handleDeeplink) {
    (window as any).AndroidBridge.handleDeeplink(deeplinkUrl);
    return;
  }

  // iOS
  if (typeof window !== 'undefined' && (window as any).webkit?.messageHandlers?.handleDeeplink) {
    (window as any).webkit.messageHandlers.handleDeeplink.postMessage({ url: deeplinkUrl });
    return;
  }

  // Fallback for browser (debug mode)
  if (isDevMode()) {
    console.log('[NativeBridge] handleDeeplink() called with URL:', deeplinkUrl);
    // In development, we might want to show an alert
    // alert(`handleDeeplink() not supported in this environment. URL: ${deeplinkUrl}`);
  }
}

