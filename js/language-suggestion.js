(function () {
  const storageKey = 'preferred-site-language';
  const dismissedKey = 'language-suggestion-dismissed';
  const currentLanguage = document.documentElement.lang.toLowerCase().startsWith('fa') ? 'fa' : 'en';
  const browserLanguages = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || ''];
  const primaryBrowserLanguage = browserLanguages[0].toLowerCase().split('-')[0];
  const browserLanguage = primaryBrowserLanguage === 'fa' || primaryBrowserLanguage === 'en'
    ? primaryBrowserLanguage
    : null;
  const preferredLanguage = browserLanguage || (currentLanguage === 'fa' ? 'en' : null);

  document.querySelectorAll('a[hreflang="fa"], a[hreflang="en"], a[lang="fa"], a[lang="en"]').forEach((link) => {
    link.addEventListener('click', () => {
      try {
        const selectedLanguage = (link.hreflang || link.lang).toLowerCase();
        localStorage.setItem(storageKey, selectedLanguage.startsWith('fa') ? 'fa' : 'en');
        localStorage.removeItem(dismissedKey);
      } catch (_) {
        // Language switching still works when browser storage is unavailable.
      }
    });
  });

  try {
    const savedLanguage = localStorage.getItem(storageKey);
    const dismissedLanguage = localStorage.getItem(dismissedKey);
    if (savedLanguage === currentLanguage || dismissedLanguage === currentLanguage || !preferredLanguage || preferredLanguage === currentLanguage) return;
  } catch (_) {
    if (!preferredLanguage || preferredLanguage === currentLanguage) return;
  }

  const languageLink = document.querySelector('a[hreflang="' + preferredLanguage + '"], a[lang="' + preferredLanguage + '"]');
  if (!languageLink) return;

  const prompt = document.createElement('aside');
  prompt.className = 'language-suggestion';
  prompt.lang = preferredLanguage;
  prompt.dir = preferredLanguage === 'fa' ? 'rtl' : 'ltr';
  prompt.setAttribute('aria-label', preferredLanguage === 'fa' ? 'پیشنهاد زبان' : 'Language suggestion');

  const message = document.createElement('p');
  message.textContent = preferredLanguage === 'fa'
    ? 'زبان مرورگرتان فارسی است. نسخهٔ فارسی سایت هم در دسترس است.'
    : browserLanguage === 'en'
      ? 'Your browser appears to use English. Would you like to view the English version?'
      : 'This site is also available in English. Would you like to view the English version?';

  const action = document.createElement('a');
  action.href = languageLink.href;
  action.hreflang = preferredLanguage;
  action.className = 'language-suggestion__action';
  action.textContent = preferredLanguage === 'fa' ? 'نمایش نسخهٔ فارسی' : 'View English version';
  action.addEventListener('click', () => {
    try {
      localStorage.setItem(storageKey, preferredLanguage);
      localStorage.removeItem(dismissedKey);
    } catch (_) {
      // Language switching still works when browser storage is unavailable.
    }
  });

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'language-suggestion__dismiss';
  dismiss.setAttribute('aria-label', preferredLanguage === 'fa' ? 'بستن پیشنهاد زبان' : 'Dismiss language suggestion');
  dismiss.textContent = '×';
  dismiss.addEventListener('click', () => {
    try { localStorage.setItem(dismissedKey, currentLanguage); } catch (_) { /* Ignore unavailable storage. */ }
    prompt.remove();
  });

  prompt.append(message, action, dismiss);
  document.body.append(prompt);
})();
