import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './style.css';
import './catalog.css';
import catalogData from './genchase-data.json';
import { renderCatalog, catalogPreview, defaultPreset, presetLabel, type CatalogEntry } from './catalog-ui';

type Entry = CatalogEntry & { family: string; tabName: string; presetCount: number; presets: string[]; evidenceStatus: string };
const entries = catalogData.entries as Entry[];
const entryById = new Map(entries.map(entry => [entry.id, entry]));
const selectedPresets = new Map(entries.map(entry => [entry.id, defaultPreset(entry)]));
const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app.querySelector('main')) app.innerHTML = renderCatalog(entries, { areas: catalogData.workspaceAreas, tools: catalogData.workspaceTools });

const search = document.querySelector<HTMLInputElement>('#catalog-search')!;
const familySelect = document.querySelector<HTMLSelectElement>('#catalog-family')!;
const viewSelect = document.querySelector<HTMLSelectElement>('#catalog-view')!;
const grid = document.querySelector<HTMLElement>('#catalog-grid')!;
const cards = [...document.querySelectorAll<HTMLElement>('.catalog-card')];
cards.forEach((card, index) => { card.dataset.entryId ||= entries[index].id; });
const normalize = (text: string) => text.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ');
const searchable = new Map(entries.map(entry => [entry.id, normalize([entry.title, entry.description, entry.category, entry.family, entry.tabName, ...entry.presets, ...Object.values(entry.presetLabels ?? {}), ...(entry.tags ?? [])].join(' '))]));
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const playVersions = new WeakMap<HTMLVideoElement, number>();
const observedPreviews = new WeakSet<HTMLElement>();
let category = 'all';
let kind = 'all';
let visibleLimit = 24;

function setMotionButton(preview: HTMLElement, playing: boolean) {
  const button = preview.querySelector<HTMLButtonElement>('[data-preview-toggle]')!;
  const entry = entryById.get(preview.dataset.previewEntry!);
  button.setAttribute('aria-pressed', String(playing));
  button.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} sample motion for ${entry?.title ?? 'this technique'}`);
  button.textContent = playing ? 'Pause motion' : 'Play motion';
  button.disabled = false;
}

function pausePreview(preview: HTMLElement, showStill = true) {
  const video = preview.querySelector<HTMLVideoElement>('.catalog-preview-video');
  if (!video) return;
  playVersions.set(video, (playVersions.get(video) ?? 0) + 1);
  video.pause();
  if (showStill) {
    video.hidden = true;
    preview.querySelector<HTMLImageElement>('.catalog-preview-image')!.hidden = preview.dataset.previewAvailable !== 'true';
    if (video.hasAttribute('src')) {
      video.removeAttribute('src');
      video.load();
    }
  }
  setMotionButton(preview, false);
}

function pauseAllPreviews(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('.catalog-preview').forEach(preview => pausePreview(preview));
}

const mediaObserver = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(observations => {
  observations.forEach(observation => {
    if (!observation.isIntersecting) pausePreview(observation.target as HTMLElement);
  });
}, { threshold: 0.05 }) : null;

function observePreviews(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('.catalog-preview').forEach(preview => {
    if (observedPreviews.has(preview)) return;
    observedPreviews.add(preview);
    mediaObserver?.observe(preview);
  });
}

function applyPreset(entry: Entry, preset: string) {
  selectedPresets.set(entry.id, preset);
  const media = entry.previews?.find(preview => preview.preset === preset);
  const label = presetLabel(entry, preset);
  document.querySelectorAll<HTMLElement>('.catalog-preview').forEach(preview => {
    if (preview.dataset.previewEntry !== entry.id) return;
    pausePreview(preview);
    const image = preview.querySelector<HTMLImageElement>('.catalog-preview-image')!;
    const video = preview.querySelector<HTMLVideoElement>('.catalog-preview-video')!;
    const fallback = preview.querySelector<HTMLElement>('.catalog-preview-fallback')!;
    const selector = preview.querySelector<HTMLSelectElement>('.catalog-preset-select')!;
    const button = preview.querySelector<HTMLButtonElement>('[data-preview-toggle]')!;
    preview.dataset.previewPreset = preset;
    preview.dataset.previewAvailable = String(!!media?.image);
    selector.value = preset;
    preview.querySelector('[data-selected-preset]')!.textContent = label || 'None selected';
    const note = preview.querySelector<HTMLElement>('[data-sample-note]')!;
    note.textContent = media?.note ?? '';
    note.hidden = !media?.note;
    image.alt = `Sample render of ${entry.title}, preset ${label}`;
    image.hidden = !media?.image;
    fallback.hidden = !!media?.image;
    if (media?.image) image.src = media.image;
    else image.removeAttribute('src');
    if (video.hasAttribute('src')) {
      video.removeAttribute('src');
      video.load();
    }
    video.dataset.videoSrc = media?.video ?? '';
    video.setAttribute('aria-label', `Motion sample of ${entry.title}, preset ${label}`);
    if (media?.image) video.poster = media.image;
    else video.removeAttribute('poster');
    button.hidden = !media?.video || !media.image;
    setMotionButton(preview, false);
  });
}

document.addEventListener('change', event => {
  const selector = event.target as HTMLSelectElement;
  if (!selector.matches('.catalog-preset-select')) return;
  const entry = entryById.get(selector.dataset.presetEntry!);
  if (entry) applyPreset(entry, selector.value);
});

document.addEventListener('click', async event => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-preview-toggle]');
  if (!button) return;
  const preview = button.closest<HTMLElement>('.catalog-preview')!;
  const video = preview.querySelector<HTMLVideoElement>('.catalog-preview-video')!;
  if (button.getAttribute('aria-pressed') === 'true') {
    pausePreview(preview, false);
    return;
  }
  if (!video.dataset.videoSrc || preview.dataset.previewAvailable !== 'true' || document.hidden) return;
  const bounds = preview.getBoundingClientRect();
  if (!bounds.width || !bounds.height || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
  pauseAllPreviews();
  const version = (playVersions.get(video) ?? 0) + 1;
  playVersions.set(video, version);
  if (!video.hasAttribute('src')) video.src = video.dataset.videoSrc;
  video.muted = true;
  video.hidden = false;
  button.disabled = true;
  button.textContent = 'Loading motion…';
  try {
    await video.play();
    if (playVersions.get(video) !== version) return;
    if (document.hidden) {
      pausePreview(preview);
      return;
    }
    preview.querySelector<HTMLImageElement>('.catalog-preview-image')!.hidden = true;
    setMotionButton(preview, true);
  } catch {
    if (playVersions.get(video) === version) pausePreview(preview);
  }
});

document.addEventListener('error', event => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.matches('.catalog-preview-image')) return;
  const preview = image.closest<HTMLElement>('.catalog-preview')!;
  preview.dataset.previewAvailable = 'false';
  image.hidden = true;
  preview.querySelector<HTMLElement>('.catalog-preview-fallback')!.hidden = false;
  preview.querySelector<HTMLButtonElement>('[data-preview-toggle]')!.hidden = true;
  pausePreview(preview);
}, true);

function updateResults() {
  const tokens = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
  const order = viewSelect.value === 'index' ? [...entries].sort((a, b) => a.tabName.localeCompare(b.tabName)) : entries;
  const matching = order.filter(entry => (category === 'all' || entry.category === category) && (kind === 'all' || entry.kind === kind) && (!familySelect.value || entry.family === familySelect.value) && tokens.every(token => searchable.get(entry.id)!.includes(token)));
  const visible = new Set(matching.slice(0, visibleLimit).map(entry => entry.id));
  cards.forEach(card => {
    card.hidden = !visible.has(card.dataset.entryId!);
    if (card.hidden || viewSelect.value === 'index') pauseAllPreviews(card);
  });
  document.querySelector('#catalog-count')!.textContent = matching.length > visibleLimit ? `Showing ${visibleLimit} of ${matching.length} techniques` : `${matching.length} technique${matching.length === 1 ? '' : 's'}`;
  document.querySelector<HTMLElement>('#catalog-empty')!.hidden = matching.length !== 0;
  const more = document.querySelector<HTMLButtonElement>('#catalog-more')!;
  more.hidden = matching.length <= visibleLimit;
  more.textContent = `Show ${Math.min(24, matching.length - visibleLimit)} more techniques +`;
  document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button => { const selected = button.dataset.category === category; button.setAttribute('aria-pressed', String(selected)); button.classList.toggle('active', selected); });
  document.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach(button => { const selected = button.dataset.kind === kind; button.setAttribute('aria-pressed', String(selected)); button.classList.toggle('active', selected); });
  document.querySelector<HTMLButtonElement>('#catalog-clear')!.hidden = !search.value && category === 'all' && !familySelect.value && kind === 'all';
}

function resetFilters() { category = 'all'; kind = 'all'; search.value = ''; familySelect.value = ''; visibleLimit = 24; updateResults(); }
search.addEventListener('input', () => { visibleLimit = 24; updateResults(); });
familySelect.addEventListener('change', () => { visibleLimit = 24; updateResults(); });
viewSelect.addEventListener('change', () => {
  const indexView = viewSelect.value === 'index';
  grid.classList.toggle('catalog-index', indexView);
  const order = indexView ? [...entries].sort((a, b) => a.tabName.localeCompare(b.tabName)) : entries;
  const fragment = document.createDocumentFragment();
  order.forEach(entry => {
    const card = cards.find(item => item.dataset.entryId === entry.id)!;
    (card.querySelector('h3 a') ?? card.querySelector('h3'))!.textContent = indexView ? entry.tabName : entry.title;
    fragment.append(card);
  });
  grid.append(fragment);
  visibleLimit = 24;
  updateResults();
});
document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button => button.addEventListener('click', () => { category = button.dataset.category!; visibleLimit = 24; updateResults(); }));
document.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach(button => button.addEventListener('click', () => { kind = button.dataset.kind!; visibleLimit = 24; updateResults(); }));
document.querySelector('#catalog-more')!.addEventListener('click', () => { visibleLimit += 24; updateResults(); });
document.querySelector('#catalog-clear')!.addEventListener('click', resetFilters);

const escapeHTML = (text: string) => text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
const dialog = document.querySelector<HTMLDialogElement>('#catalog-dialog')!;
let opener: HTMLElement | null = null;
grid.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLElement>('[data-id]');
  if (!button) return;
  const entry = entryById.get(button.dataset.id!)!;
  opener = button;
  pauseAllPreviews();
  dialog.querySelectorAll<HTMLElement>('.catalog-preview').forEach(preview => mediaObserver?.unobserve(preview));
  document.querySelector('#catalog-dialog-content')!.innerHTML = `<p class="eyebrow">${escapeHTML(entry.category)}</p><h2 id="catalog-detail-title">${escapeHTML(entry.title)}</h2><div class="catalog-dialog-media">${catalogPreview(entry, selectedPresets.get(entry.id), 'dialog')}</div><p>${escapeHTML(entry.detail ?? entry.description)}</p><dl class="catalog-detail-facts"><div><dt>Studio tab</dt><dd>${escapeHTML(entry.tabName)}</dd></div><div><dt>Implementation family</dt><dd>${escapeHTML(entry.family)}</dd></div><div><dt>Preset configurations</dt><dd>${entry.presetCount}</dd></div><div><dt>Recorded evidence</dt><dd>${escapeHTML(entry.status ?? 'Exploratory')}</dd></div></dl>${entry.presets.length ? `<details class="catalog-presets"><summary>View all ${entry.presetCount} preset names</summary><div class="catalog-card-tags">${entry.presets.map(preset => `<span>${escapeHTML(presetLabel(entry, preset))}</span>`).join('')}</div></details>` : ''}<p class="catalog-detail-note">Images and motion are sample renders, not scientific validation. Evidence labels refer to recorded internal checks and their stated limits. This public guide contains descriptive metadata; the research implementation stays private.</p>`;
  dialog.showModal();
  document.body.classList.add('dialog-open');
  observePreviews(dialog);
});
document.querySelector('#catalog-close')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); });
dialog.addEventListener('close', () => { pauseAllPreviews(dialog); document.body.classList.remove('dialog-open'); opener?.focus({ preventScroll: true }); });
document.addEventListener('keydown', event => {
  const target = event.target as HTMLElement;
  if (event.code === 'Slash' && event.altKey && !event.metaKey && !event.ctrlKey && !target.closest('input,select,textarea,[contenteditable="true"]') && !dialog.open) { event.preventDefault(); search.focus(); }
  if (event.key === 'Escape' && target === search && search.value) { search.value = ''; visibleLimit = 24; updateResults(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseAllPreviews(); });
motionPreference.addEventListener('change', event => { if (event.matches) pauseAllPreviews(); });
window.addEventListener('pagehide', event => { pauseAllPreviews(); if (!event.persisted) mediaObserver?.disconnect(); });

updateResults();
observePreviews();
