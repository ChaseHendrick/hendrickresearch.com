import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './style.css';
import './catalog.css';
import catalogData from './genchase-data.json';
import { renderCatalog, type CatalogEntry } from './catalog-ui';

type Entry = CatalogEntry & {family:string;tabName:string;presetCount:number;presets:string[];evidenceStatus:string};
const entries = catalogData.entries as Entry[];
const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app.querySelector('main')) app.innerHTML = renderCatalog(entries,{areas:catalogData.workspaceAreas,tools:catalogData.workspaceTools});

const search = document.querySelector<HTMLInputElement>('#catalog-search')!;
const familySelect = document.querySelector<HTMLSelectElement>('#catalog-family')!;
const viewSelect = document.querySelector<HTMLSelectElement>('#catalog-view')!;
const cards = [...document.querySelectorAll<HTMLElement>('.catalog-card')];
cards.forEach((card,index) => card.dataset.entryId = entries[index].id);
const normalize = (text:string) => text.normalize('NFKD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ');
const searchable = new Map(entries.map(entry => [entry.id, normalize([entry.title,entry.description,entry.category,entry.family,entry.tabName,...entry.presets,...(entry.tags ?? [])].join(' '))]));
let category = 'all';
let kind = 'all';
let visibleLimit = 24;

function updateResults() {
  const tokens = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
  const order = viewSelect.value === 'index' ? [...entries].sort((a,b) => a.tabName.localeCompare(b.tabName)) : entries;
  const matching = order.filter(entry => (category === 'all' || entry.category === category) && (kind === 'all' || entry.kind === kind) && (!familySelect.value || entry.family === familySelect.value) && tokens.every(token => searchable.get(entry.id)!.includes(token)));
  const visible = new Set(matching.slice(0,visibleLimit).map(entry => entry.id));
  cards.forEach(card => card.hidden = !visible.has(card.dataset.entryId!));
  document.querySelector('#catalog-count')!.textContent = matching.length > visibleLimit ? `Showing ${visibleLimit} of ${matching.length} techniques` : `${matching.length} technique${matching.length === 1 ? '' : 's'}`;
  document.querySelector<HTMLElement>('#catalog-empty')!.hidden = matching.length !== 0;
  const more = document.querySelector<HTMLButtonElement>('#catalog-more')!;
  more.hidden = matching.length <= visibleLimit;
  more.textContent = `Show ${Math.min(24,matching.length-visibleLimit)} more techniques +`;
  document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button => {const selected = button.dataset.category === category; button.setAttribute('aria-pressed',String(selected)); button.classList.toggle('active',selected);});
  document.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach(button => {const selected = button.dataset.kind === kind; button.setAttribute('aria-pressed',String(selected)); button.classList.toggle('active',selected);});
  const clear = document.querySelector<HTMLButtonElement>('#catalog-clear')!;
  clear.hidden = !search.value && category === 'all' && !familySelect.value && kind === 'all';
}
function resetFilters() {category = 'all'; kind = 'all'; search.value = ''; familySelect.value = ''; visibleLimit = 24; updateResults();}
search.addEventListener('input', () => {visibleLimit = 24; updateResults();});
familySelect.addEventListener('change', () => {visibleLimit = 24; updateResults();});
viewSelect.addEventListener('change', () => {
  const indexView = viewSelect.value === 'index';
  const grid = document.querySelector<HTMLElement>('#catalog-grid')!;
  grid.classList.toggle('catalog-index',indexView);
  const order = indexView ? [...entries].sort((a,b) => a.tabName.localeCompare(b.tabName)) : entries;
  const fragment = document.createDocumentFragment();
  order.forEach(entry => {const card = cards.find(item => item.dataset.entryId === entry.id)!; card.querySelector('h3')!.textContent = indexView ? entry.tabName : entry.title; fragment.append(card);});
  grid.append(fragment);
  visibleLimit = 24;
  updateResults();
});
document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button => button.addEventListener('click', () => {category = button.dataset.category!; visibleLimit = 24; updateResults();}));
document.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach(button => button.addEventListener('click', () => {kind = button.dataset.kind!; visibleLimit = 24; updateResults();}));
document.querySelector('#catalog-more')!.addEventListener('click', () => {visibleLimit += 24; updateResults();});
document.querySelector('#catalog-clear')!.addEventListener('click', resetFilters);
updateResults();

const escapeHTML = (text:string) => text.replace(/[&<>"']/g,character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!));
const dialog = document.querySelector<HTMLDialogElement>('#catalog-dialog')!;
let opener: HTMLElement | null = null;
document.querySelector('#catalog-grid')!.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLElement>('[data-id]');
  if (!button) return;
  const entry = entries.find(item => item.id === button.dataset.id)!;
  opener = button;
  document.querySelector('#catalog-dialog-content')!.innerHTML = `<p class="eyebrow">${escapeHTML(entry.category)}</p><h2 id="catalog-detail-title">${escapeHTML(entry.title)}</h2><p>${escapeHTML(entry.detail ?? entry.description)}</p><dl class="catalog-detail-facts"><div><dt>Studio tab</dt><dd>${escapeHTML(entry.tabName)}</dd></div><div><dt>Implementation family</dt><dd>${escapeHTML(entry.family)}</dd></div><div><dt>Preset configurations</dt><dd>${entry.presetCount}</dd></div><div><dt>Recorded evidence</dt><dd>${escapeHTML(entry.status ?? 'Exploratory')}</dd></div></dl>${entry.presets.length ? `<details class="catalog-presets"><summary>View ${entry.presetCount} presets</summary><div class="catalog-card-tags">${entry.presets.map(preset => `<span>${escapeHTML(preset)}</span>`).join('')}</div></details>` : ''}<p class="catalog-detail-note">Evidence labels refer to the workspace’s recorded internal checks and their stated limits. This public guide contains descriptive metadata; the research implementation stays private.</p>`;
  dialog.showModal();
  document.body.classList.add('dialog-open');
});
document.querySelector('#catalog-close')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {if(event.target!==dialog) return; const rect=dialog.getBoundingClientRect(); if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) dialog.close();});
dialog.addEventListener('close', () => {document.body.classList.remove('dialog-open'); opener?.focus({preventScroll:true});});
document.addEventListener('keydown', event => {
  const target = event.target as HTMLElement;
  if(event.code==='Slash' && event.altKey && !event.metaKey && !event.ctrlKey && !target.closest('input,select,textarea,[contenteditable="true"]') && !dialog.open){event.preventDefault();search.focus();}
  if(event.key==='Escape' && target===search && search.value){search.value='';visibleLimit=24;updateResults();}
});
