/**
 * Internationalization (i18n) Utilities
 * Supports Indonesian (id) and Singapore English (en)
 */

import idTranslations from './translations/id.json';
import enTranslations from './translations/en.json';

export type Locale = 'id' | 'en';

export const defaultLocale: Locale = 'id';
export const supportedLocales: Locale[] = ['id', 'en'];

const translations = {
  id: idTranslations,
  en: enTranslations,
} as const;

/**
 * Gets the current locale from URL parameter, localStorage, or defaults to 'id'
 */
export function getLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  // Check URL parameter first
  const params = new URLSearchParams(window.location.search);
  const urlLocale = params.get('locale') as Locale;
  if (urlLocale && supportedLocales.includes(urlLocale)) {
    // Save to localStorage for persistence
    try {
      localStorage.setItem('locale', urlLocale);
    } catch (e) {
      // localStorage might not be available
    }
    return urlLocale;
  }

  // Check localStorage
  try {
    const storedLocale = localStorage.getItem('locale') as Locale;
    if (storedLocale && supportedLocales.includes(storedLocale)) {
      return storedLocale;
    }
  } catch (e) {
    // localStorage might not be available
  }

  return defaultLocale;
}

/**
 * Sets the locale and updates localStorage
 */
export function setLocale(locale: Locale): void {
  if (!supportedLocales.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}. Using default: ${defaultLocale}`);
    return;
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('locale', locale);
    } catch (e) {
      console.error('Failed to save locale to localStorage:', e);
    }

    // Update URL parameter
    const url = new URL(window.location.href);
    url.searchParams.set('locale', locale);
    window.history.replaceState({}, '', url.toString());
  }
}

/**
 * Gets a translation value by key path (e.g., 'screen1.greeting')
 * Supports parameter interpolation using {paramName}
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const locale = getLocale();
  const translation = translations[locale];

  // Navigate through nested object using dot notation
  const keys = key.split('.');
  let value: any = translation;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to default locale if key not found
      if (locale !== defaultLocale) {
        let fallbackValue: any = translations[defaultLocale];
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            return key; // Return key if not found in fallback either
          }
        }
        value = fallbackValue;
      } else {
        return key; // Return key if not found
      }
      break;
    }
  }

  // If value is still an object, return the key
  if (typeof value !== 'string') {
    return key;
  }

  // Replace parameters
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramName) => {
      return params[paramName]?.toString() || match;
    });
  }

  return value;
}

/**
 * React hook for translations
 * Usage: const { t, locale, setLocale } = useTranslations();
 */
export function useTranslations() {
  // This will be implemented as a React hook
  // For now, we'll use the direct function
  return {
    t,
    locale: getLocale(),
    setLocale,
  };
}

