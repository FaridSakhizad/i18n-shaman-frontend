import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const currentLanguage = localStorage.getItem('language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    lng: currentLanguage,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
