import type { Language } from './config';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';

const translations: { [key in Language]: Record<string, any> } = {
  en: enTranslations,
  fr: frTranslations,
};

export const getTranslations = (lang: Language) => {
  return translations[lang] || translations.en;
};

export const t = (lang: Language, key: string) => {
  try {
    const keys = key.split('.');
    let value = getTranslations(lang);

    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        console.warn(`Translation missing for key: ${key} in language: ${lang}`);

        // Try to fallback to English
        const enValue = getFallbackValue(keys, translations.en);

        if (enValue !== undefined) {
          return enValue;
        }

        return key;
      }
    }

    return value;
  } catch (error) {
    console.error(`Translation error for key: ${key}`, error);
    return key;
  }
};

// Helper function to get a deeply nested value
function getFallbackValue(keys: string[], obj: Record<string, any>): any {
  let value = obj;

  for (const key of keys) {
    if (value && value[key] !== undefined) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
}
