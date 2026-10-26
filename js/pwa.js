/* =========================================================
   INSTALLABLE APP (PWA) — loaded by index.html and app.html
   1. Registers the service worker (sw.js), so the app also opens offline.
   2. Shows the "Install the app" button when the browser offers installing
      (Chrome, Edge, Android). iPhones never offer it: there you use
      Share → Add to Home Screen, as the landing page explains.
   ========================================================= */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* no offline mode, the app still works */ });
}

const installBtn = document.querySelector('#installBtn'); // only on the landing page
let installPrompt = null; // the browser's install offer, kept until the button is pressed

window.addEventListener('beforeinstallprompt', (e) => {
  if (!installBtn) return;  // in the app itself, the browser shows its own install offer
  e.preventDefault();       // on the landing page, show our button instead
  installPrompt = e;
  installBtn.hidden = false;
});

installBtn?.addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();          // the browser asks "Install this app?"
  await installPrompt.userChoice;  // wait for the answer (the offer can be used only once)
  installPrompt = null;
  installBtn.hidden = true;
});

// Installed (by our button or the browser's menu): the button is no longer needed
window.addEventListener('appinstalled', () => {
  if (installBtn) installBtn.hidden = true;
});
