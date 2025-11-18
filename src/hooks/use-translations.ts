"use client";

import { useState, useEffect, useCallback } from 'react';
import { getLocale, setLocale, t as translate, type Locale } from '@/i18n';

/**
 * React hook for translations
 * 
 * @example
 * const { t, locale, setLocale } = useTranslations();
 * <p>{t('screen1.greeting', { userName: 'John' })}</p>
 */
export function useTranslations() {
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  // Update locale when it changes
  useEffect(() => {
    const handleStorageChange = () => {
      setLocaleState(getLocale());
    };

    // Listen for storage changes (when locale is updated in another tab/window)
    window.addEventListener('storage', handleStorageChange);

    // Check URL parameter on mount
    const params = new URLSearchParams(window.location.search);
    const urlLocale = params.get('locale') as Locale;
    if (urlLocale && urlLocale !== locale) {
      setLocaleState(urlLocale);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [locale]);

  const updateLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return translate(key, params);
  }, []);

  return {
    t,
    locale,
    setLocale: updateLocale,
  };
}

