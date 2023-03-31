export const injectScript = (src: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');

    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Failed to load script')), { once: true });

    script.src = src;
    script.async = true;
    script.defer = true;

    document.head.appendChild(script);
  });
};
