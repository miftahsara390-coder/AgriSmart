import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { translations, Language } from '../i18n/translations';

interface LanguageState {
  language: Language;
  isLoading: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  loadLanguage: () => Promise<void>;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const STORAGE_KEY = 'app_language';

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'en',
  isLoading: true,

  loadLanguage: async () => {
    try {
      let storedLang: string | null = null;
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          storedLang = window.localStorage.getItem(STORAGE_KEY);
        }
      } else {
        storedLang = await SecureStore.getItemAsync(STORAGE_KEY);
      }

      if (storedLang === 'fr' || storedLang === 'en') {
        set({ language: storedLang, isLoading: false });
      } else {
        set({ language: 'en', isLoading: false });
      }
    } catch (e) {
      console.warn('Error loading stored language:', e);
      set({ language: 'en', isLoading: false });
    }
  },

  setLanguage: async (lang: Language) => {
    set({ language: lang });
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, lang);
        }
      } else {
        await SecureStore.setItemAsync(STORAGE_KEY, lang);
      }
    } catch (e) {
      console.warn('Error saving language preference:', e);
    }
  },

  t: (path: string, params?: Record<string, string | number>): string => {
    const currentLang = get().language;
    const langDict = translations[currentLang] || translations.en;
    const fallbackDict = translations.en;

    const resolveKey = (dict: any, keyPath: string): any => {
      const keys = keyPath.split('.');
      let current: any = dict;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          return undefined;
        }
      }
      return current;
    };

    let val = resolveKey(langDict, path);
    if (typeof val !== 'string') {
      val = resolveKey(fallbackDict, path);
    }

    if (typeof val !== 'string') {
      return path; // Return raw key if not found
    }

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        val = val.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return val;
  },
}));

import { useCallback } from 'react';

// Convenience hook that automatically triggers re-render when language changes
export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const rawT = useLanguageStore((state) => state.t);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>) => {
      return rawT(path, params);
    },
    [language, rawT]
  );

  return {
    language,
    setLanguage,
    t,
    isFrench: language === 'fr',
  };
}
