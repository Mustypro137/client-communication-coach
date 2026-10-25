/* Small helpers shared by every screen: icons, $, escapeHTML, toast, copy. */

/* =========================================================
   1. ICONS — small inline SVGs, inserted where data-icon is used
   ========================================================= */
const ICONS = {
  home: '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  book: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  flame: '<path d="M12 21c4 0 6.5-2.6 6.5-6.2 0-3.6-2.8-5.6-4.3-9.3-.6 2.6-2 3.9-3.5 4.6C10 8 9.5 6.5 9.7 4.8 7.2 6.8 5.5 9.9 5.5 14.6 5.5 18.4 8 21 12 21z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  restart: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  send: '<path d="m4 12 16-8-6 16-2.5-6.5z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12h18"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  alert: '<path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .9-1 1.6v.3M12 17h.01"/>',
  coach: '<path d="M12 3 3 8l9 5 9-5z"/><path d="M7 10.5v4.5c1.5 1.5 3 2 5 2s3.5-.5 5-2v-4.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'
};
export function icon(name, size = 16) {
  const filled = name === 'star-filled';
  const path = ICONS[filled ? 'star' : name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}
export function paintIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    if (!el.dataset.painted) { el.outerHTML = icon(el.dataset.icon); }
  });
}

// Small helpers
export const $ = (sel) => document.querySelector(sel);
export const escapeHTML = (s) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function difficultyHTML(level) {
  const names = ['Beginner', 'Intermediate', 'Advanced'];
  const dots = [1, 2, 3].map(n => `<i class="${n <= level ? 'on' : ''}"></i>`).join('');
  return `<span class="dots" aria-hidden="true">${dots}</span>${names[level - 1]}`;
}

/* =========================================================
   5. TOAST + COPY TO CLIPBOARD
   ========================================================= */
let toastTimer;
export function toast(msg) {
  const t = $('#toast');
  t.innerHTML = icon('check') + escapeHTML(msg);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
// Tell screen-reader users about a change, without moving their focus.
// Cleared first, so the same message twice is still read out.
export function announce(msg) {
  const a = $('#announcer');
  if (!a) return;
  a.textContent = '';
  setTimeout(() => { a.textContent = msg; }, 50);
}
export async function copyText(text, fallbackEl) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Copied to clipboard');
  } catch (err) {
    // Clipboard blocked: select the text so the user can copy it manually
    if (fallbackEl && fallbackEl.select) { fallbackEl.focus(); fallbackEl.select(); }
    toast('Press Ctrl + C to copy the selected text');
  }
}
