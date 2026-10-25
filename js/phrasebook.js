import { $, icon, escapeHTML, toast } from './utils.js';
import { PHRASES, CATEGORIES } from './data.js';
import { state } from './state.js';

/* Saved phrases are remembered in this browser (if storage is allowed) */
export function loadSaved() {
  try { JSON.parse(localStorage.getItem('ccc-saved') || '[]').forEach(t => state.saved.add(t)); } catch (e) { /* storage blocked: start empty */ }
}
export function storeSaved() {
  try { localStorage.setItem('ccc-saved', JSON.stringify([...state.saved])); } catch (e) { /* ignore */ }
}

/* =========================================================
   9. PHRASEBOOK
   ========================================================= */
function renderCats() {
  $('#cats').innerHTML = CATEGORIES.map(c => {
    const n = c.id === 'all' ? PHRASES.length : c.id === 'saved' ? state.saved.size : PHRASES.filter(p => p.cat === c.id).length;
    return `<button class="cat" data-cat="${c.id}" aria-pressed="${state.pb.cat === c.id}">${c.label}<span class="count">${n}</span></button>`;
  }).join('');
}
function highlight(text, q) {
  const safe = escapeHTML(text);
  if (!q) return safe;
  const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
  return safe.replace(re, '<mark>$1</mark>');
}
export function renderPhrasebook() {
  renderCats();
  const q = state.pb.query.trim().toLowerCase();
  const list = PHRASES.filter(p => {
    const inCat = state.pb.cat === 'all' || (state.pb.cat === 'saved' ? state.saved.has(p.text) : p.cat === state.pb.cat);
    const inSearch = !q || (p.text + ' ' + p.mean + ' ' + p.use).toLowerCase().includes(q);
    return inCat && inSearch;
  });
  const grid = $('#phraseGrid');
  if (!list.length) {
    grid.innerHTML = state.pb.cat === 'saved' && !q
      ? `<div class="empty">${icon('star', 26)}<h3>No saved phrases yet</h3><p>Press the star on any phrase to keep it here.</p></div>`
      : `<div class="empty">${icon('search', 26)}<h3>No phrases match "${escapeHTML(state.pb.query)}"</h3><p>Try a simpler word, like "price", "late" or "thank".</p></div>`;
    return;
  }
  const catLabel = id => CATEGORIES.find(c => c.id === id).label;
  grid.innerHTML = list.map(p => {
    const saved = state.saved.has(p.text);
    return `<article class="card phrase">
      <div class="phrase-top"><span class="tag">${catLabel(p.cat)}</span>
        <div class="phrase-actions">
          <button class="icon-btn" data-save="${escapeHTML(p.text)}" aria-pressed="${saved}" aria-label="${saved ? 'Remove from saved' : 'Save phrase'}">${icon(saved ? 'star-filled' : 'star', 15)}</button>
          <button class="icon-btn" data-copy="${escapeHTML(p.text)}" aria-label="Copy phrase">${icon('copy', 15)}</button>
        </div>
      </div>
      <p class="phrase-text">${highlight(p.text, q)}</p>
      <p class="phrase-mean">${highlight(p.mean, q)}</p>
      <p class="phrase-use">${escapeHTML(p.use)}</p>
    </article>`;
  }).join('');
}
$('#pbSearch').addEventListener('input', (e) => { state.pb.query = e.target.value; renderPhrasebook(); });
$('#cats').addEventListener('click', (e) => {
  const b = e.target.closest('[data-cat]');
  if (!b) return;
  state.pb.cat = b.dataset.cat;
  renderPhrasebook();
});
$('#phraseGrid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-save]');
  if (!b) return;
  const t = b.dataset.save;
  if (state.saved.has(t)) { state.saved.delete(t); toast('Removed from saved'); }
  else { state.saved.add(t); toast('Phrase saved'); }
  storeSaved();
  renderPhrasebook();
});
