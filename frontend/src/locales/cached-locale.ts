export const cachedLocale = (): string | null => {
  try {
    const storedLocale = JSON.parse(localStorage.getItem('vuex') || '');
    return storedLocale?.settings?.locale;
  } catch (e) {
    return null;
  }
};
