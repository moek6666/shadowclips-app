import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import idJSON from './locales/id.json';
import enJSON from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      id: { translation: idJSON },
      en: { translation: enJSON }
    },
    lng: 'id', // Bahasa utama (Indonesia)
    fallbackLng: 'en', // Jika terjemahan tidak ditemukan, gunakan bahasa Inggris
    interpolation: {
      escapeValue: false // React sudah aman dari XSS
    }
  });

export default i18n;