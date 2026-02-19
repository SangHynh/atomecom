import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '../locales/en/translation.json';
import translationVI from '../locales/vi/translation.json';
import errorsEN from '../locales/en/errors.json';
import errorsVI from '../locales/vi/errors.json';

const resources = {
  en: {
    translation: translationEN,
    errors: errorsEN,
  },
  vi: {
    translation: translationVI,
    errors: errorsVI,
  },
};

// Initialize i18n instance
i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'vi',
  lng: 'vi', // Default to Vietnamese on server
  interpolation: {
    escapeValue: false,
  },
});

// Setup language detector ONLY in the browser
if (typeof window !== 'undefined') {
  import('i18next-browser-languagedetector').then((module) => {
    const LanguageDetector = module.default;
    i18n.use(LanguageDetector).init({
      detection: {
        order: ['localStorage', 'htmlTag', 'cookie'],
        caches: ['localStorage'],
      },
    });
  });
}

export default i18n;
