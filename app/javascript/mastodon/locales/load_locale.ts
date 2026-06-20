import { Semaphore } from 'async-mutex';

import type { LocaleData } from './global_locale';
import { isLocaleLoaded, setLocale } from './global_locale';

const localeLoadingSemaphore = new Semaphore(1);

const localeFiles = import.meta.glob<{ default: LocaleData['messages'] }>([
  './*.json',
]);

export async function loadLocale() {
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- we want to match empty strings
  const locale = document.querySelector<HTMLElement>('html')?.lang || 'en';

  // We use a Semaphore here so only one thing can try to load the locales at
  // the same time. If one tries to do it while its in progress, it will wait
  // for the initial load to finish before it is resumed (and will see that locale
  // data is already loaded)
  await localeLoadingSemaphore.runExclusive(async () => {
    // if the locale is already set, then do nothing
    if (isLocaleLoaded()) return;

    // If there is no locale file, then fallback to english
    const localeFile = Object.hasOwn(localeFiles, `./${locale}.json`)
      ? localeFiles[`./${locale}.json`]
      : localeFiles['./en.json'];

    if (!localeFile) throw new Error('Could not load the locale JSON file');

    // Hometown-specific: To reduce conflicts with the locale files, we also
    // allow for a custom `[language-code].hometown.json` file to exist. If it
    // does, it's values are merged into the default locale.
    const hometownOverrideFile = Object.hasOwn(localeFiles, `./${locale}.hometown.json`)
      ? localeFiles[`./${locale}.hometown.json`]
      : localeFiles['./en.hometown.json'];

    const { default: localeData } = await localeFile();
    const { default: hometownData } = await hometownOverrideFile();

    setLocale({ messages: {...localeData, ...hometownData}, locale });
  });
}
