export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`)
        .then((registration) => {
          console.log('ServiceWorker registered:', registration);
        })
        .catch((error) => {
          console.log('ServiceWorker registration failed:', error);
        });
    });
  }
};
