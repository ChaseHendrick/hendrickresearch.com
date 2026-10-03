import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './style.css';
import './appearance';
import { projects, papers } from './content';
import { artwork } from './artwork';
import { mountAttractor } from './attractor';

import { external, tags, pause, play, renderPage, projectCard, paperRow, selectedPapers } from './page';

const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app.querySelector('main')) app.innerHTML = renderPage();

let selectedFilter = 'All work';
let showAllProjects = false;
const grid = document.querySelector<HTMLDivElement>('#project-grid')!;
function renderProjects() {
  const matching = projects.filter(p => selectedFilter === 'All work' || p.category === selectedFilter);
  const featured = matching.some(p => p.id === 'genchase');
  document.querySelector<HTMLElement>('#featured-project')!.hidden = !featured;
  const others = matching.filter(p => p.id !== 'genchase');
  grid.innerHTML = others.map((p,i) => projectCard(p, !showAllProjects && selectedFilter === 'All work' && i >= 3)).join('');
  document.querySelector('#project-count')!.textContent = `${matching.length} project${matching.length === 1 ? '' : 's'}`;
  const more = document.querySelector<HTMLButtonElement>('#more-projects')!;
  more.hidden = selectedFilter !== 'All work';
  more.innerHTML = showAllProjects ? 'Show selected work <span>−</span>' : 'Explore the full collection <span>+</span>';
  more.setAttribute('aria-expanded', String(showAllProjects));
  document.querySelector('#shown-projects')!.textContent = selectedFilter !== 'All work' ? `Showing all ${matching.length} ${selectedFilter.toLowerCase()} projects.` : showAllProjects ? `All ${matching.length} projects.` : 'Showing a selection.';
}
renderProjects();
document.querySelectorAll<HTMLButtonElement>('.filter').forEach(button => button.addEventListener('click', () => {
  selectedFilter = button.dataset.filter!;
  document.querySelectorAll('.filter').forEach(b => {b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button));});
  renderProjects();
}));
document.querySelector('#more-projects')!.addEventListener('click', () => {showAllProjects = !showAllProjects; renderProjects();});

let allPapers = false;
let selectedTopic = 'All topics';
let paperQuery = '';
const searchInput = document.querySelector<HTMLInputElement>('#paper-search')!;
function renderPapers() {
  const query = paperQuery.trim().toLocaleLowerCase('en');
  const filtered = selectedTopic !== 'All topics' || query.length > 0;
  const matching = papers.filter(p => (selectedTopic === 'All topics' || p.category === selectedTopic) && `${p.title} ${p.summary} ${p.category}`.toLocaleLowerCase('en').includes(query));
  const selected = !allPapers && !filtered;
  const ordered = selected ? [...selectedPapers,...papers.filter(p => !selectedPapers.includes(p))] : matching;
  document.querySelector('#paper-list')!.innerHTML = ordered.length ? ordered.map((p,i) => paperRow(p,i, selected && i >= selectedPapers.length)).join('') : '<div class="empty-state"><p>No papers match this search.</p><button class="text-link" data-clear-research>Clear filters and search →</button></div>';
  document.querySelector('#paper-count')!.textContent = selected ? `${selectedPapers.length} selected papers / ${papers.length} in the collection` : `${matching.length} paper${matching.length === 1 ? '' : 's'}${filtered ? ' found' : ' in the collection'}`;
  const more = document.querySelector<HTMLButtonElement>('#more-papers')!;
  more.hidden = filtered;
  more.innerHTML = allPapers ? 'Show selected papers <span>−</span>' : `All ${papers.length} research papers <span>+</span>`;
  more.setAttribute('aria-expanded',String(allPapers));
  document.querySelectorAll<HTMLButtonElement>('.paper-filter').forEach(button => {const active = button.dataset.topic === selectedTopic; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active));});
}
renderPapers();
document.querySelector('#more-papers')!.addEventListener('click', () => {allPapers = !allPapers; renderPapers();});
document.querySelectorAll<HTMLButtonElement>('.paper-filter').forEach(button => button.addEventListener('click', () => {selectedTopic = button.dataset.topic!; renderPapers();}));
searchInput.addEventListener('input', () => {paperQuery = searchInput.value; renderPapers();});
document.querySelector('#paper-list')!.addEventListener('click', event => {if (!(event.target as HTMLElement).closest('[data-clear-research]')) return; selectedTopic = 'All topics'; paperQuery = ''; allPapers = false; searchInput.value = ''; renderPapers(); searchInput.focus({preventScroll:true});});
document.addEventListener('keydown', event => {
  const target = event.target as HTMLElement;
  if (event.code === 'Slash' && event.altKey && !event.metaKey && !event.ctrlKey && !target.closest('input,textarea,select,[contenteditable="true"]') && !document.querySelector('dialog[open]')) {event.preventDefault(); searchInput.focus();}
  if (event.key === 'Escape' && target === searchInput && searchInput.value) {searchInput.value = ''; paperQuery = ''; renderPapers();}
});

const dialog = document.querySelector<HTMLDialogElement>('#project-dialog')!;
let opener: HTMLElement | null = null;
document.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLElement>('[data-project]');
  if (!button) return;
  const project = projects.find(p => p.id === button.dataset.project)!;
  opener = button;
  document.querySelector('#dialog-content')!.innerHTML = `<div class="dialog-art">${artwork(project.id)}</div><div class="dialog-copy"><p class="eyebrow">${project.category} / ${project.eyebrow}</p><h2 id="dialog-title">${project.name}</h2><p>${project.detail}</p><div class="tags">${tags(project)}</div><div class="dialog-links">${project.launch ? external(project.launch,project.launchLabel ?? 'Visit project','button button-dark') : ''}${project.privateWorkspace ? '<span class="private-workspace-note">Private research workspace</span>' : external(project.source,'View source code')}</div></div>`;
  dialog.showModal();
  document.body.classList.add('dialog-open');
});
document.querySelector('.dialog-close')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {if (event.target === dialog) {const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();}});
dialog.addEventListener('close', () => {document.body.classList.remove('dialog-open'); opener?.focus({preventScroll:true});});

const menu = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
const mobileNav = document.querySelector<HTMLElement>('#mobile-nav')!;
function closeMenu() {menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation'); mobileNav.hidden = true;}
menu.addEventListener('click', () => {const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation'); mobileNav.hidden = !open;});
mobileNav.addEventListener('click', event => {if ((event.target as HTMLElement).closest('a')) closeMenu();});
document.addEventListener('keydown', event => {if (event.key === 'Escape') closeMenu();});

const navigationLinks = [...document.querySelectorAll<HTMLAnchorElement>('.desktop-nav a, .mobile-nav a[href^="#"]')];
const sections = ['projects','research','about'].map(id => document.getElementById(id)!);
function updateNavigation() {
  const atBottom = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3;
  const current = atBottom ? sections.at(-1)!.id : sections.filter(section => section.getBoundingClientRect().top <= 190).at(-1)?.id;
  navigationLinks.forEach(link => {if (link.hash === `#${current}`) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');});
}
let navigationFrame = 0;
window.addEventListener('scroll', () => {if (!navigationFrame) navigationFrame = requestAnimationFrame(() => {updateNavigation(); navigationFrame = 0;});}, {passive:true});
updateNavigation();

const attractor = mountAttractor(document.querySelector<HTMLCanvasElement>('#attractor')!, system => {
  document.querySelector('#attractor-label')!.textContent = system.label;
  document.querySelector('#attractor-name')!.textContent = system.name;
  document.querySelector('#attractor-caption')!.textContent = system.caption;
});
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = motionPreference.matches;
const pauseButton = document.querySelector<HTMLButtonElement>('#pause-flow')!;
function updatePause() {attractor.setPaused(paused); pauseButton.innerHTML = paused ? play : pause; pauseButton.setAttribute('aria-label',paused ? 'Play animation' : 'Pause animation'); pauseButton.title = paused ? 'Play animation' : 'Pause animation'; pauseButton.setAttribute('aria-pressed',String(paused));}
updatePause();
pauseButton.addEventListener('click', () => {paused = !paused; updatePause();});
document.querySelector('#reset-flow')!.addEventListener('click', () => attractor.reset());
motionPreference.addEventListener('change', event => {paused = event.matches; updatePause();});
window.addEventListener('pagehide', event => {if (!event.persisted) attractor.dispose();});
window.addEventListener('pageshow', event => {if (event.persisted) updatePause();});
