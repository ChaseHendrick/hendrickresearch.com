import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/instrument-serif/latin-400.css';
import './style.css';
import './game.css';
import './appearance';
import { gamePages, renderGamePage } from './game-pages';

const id = document.body.dataset.game ?? location.pathname.split('/').filter(Boolean)[1];
const game = gamePages.find(item => item.id === id);
if (!game) throw new Error('Unknown game page');
const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app.querySelector('main')) app.innerHTML = renderGamePage(game);
const frame = document.querySelector<HTMLIFrameElement>('#game-frame')!;
const stage = document.querySelector<HTMLDivElement>('#game-stage')!;
const fullScreen = document.querySelector<HTMLButtonElement>('#game-fullscreen')!;
const dim = document.querySelector<HTMLButtonElement>('#game-dim')!;
const viewBar = document.querySelector<HTMLDivElement>('#game-view-bar')!;
const viewFullscreen = document.querySelector<HTMLButtonElement>('#game-view-fullscreen')!;
const exitFullscreen = document.querySelector<HTMLButtonElement>('#game-exit-fullscreen')!;
const exitDim = document.querySelector<HTMLButtonElement>('#game-exit-dim')!;
const backdrop = document.createElement('div');
backdrop.className = 'play-dimmer';
backdrop.hidden = true;
backdrop.setAttribute('aria-hidden', 'true');
document.body.append(backdrop);
const placeholder = document.createElement('div');
placeholder.hidden = true;
placeholder.setAttribute('aria-hidden', 'true');
stage.before(placeholder);
let focused = false;
let previousFocus: HTMLElement | null = null;
let previousScroll = {x:0, y:0};
const inertElements = new Map<HTMLElement, boolean>();
const boundDocuments = new WeakSet<Document>();
const status = document.querySelector<HTMLParagraphElement>('#game-load-status')!;
const help = document.querySelector<HTMLParagraphElement>('#game-load-help')!;
let loadingTimer: ReturnType<typeof setTimeout>;

function markLoaded() {
  clearTimeout(loadingTimer);
  help.hidden = true;
  status.textContent = `${game!.title} is loaded. Click inside to play.`;
  bindFrameKeys();
}
function startLoading() {
  clearTimeout(loadingTimer);
  help.hidden = true;
  status.textContent = `Loading ${game!.title}…`;
  loadingTimer = setTimeout(() => { help.hidden = false; }, 18000);
}
frame.addEventListener('load', markLoaded);
frame.addEventListener('error', () => { clearTimeout(loadingTimer); status.textContent = 'The game could not load.'; help.hidden = false; });
document.querySelector('#game-reload')!.addEventListener('click', () => { startLoading(); frame.src = game!.assetPath; });
function updateView() {
  const expanded = document.fullscreenElement === stage;
  fullScreen.firstChild!.textContent = expanded ? 'Exit full screen ' : 'Full screen ';
  viewFullscreen.hidden = expanded;
  exitFullscreen.hidden = !expanded;
  exitDim.hidden = !focused;
  viewBar.hidden = !expanded && !focused;
  dim.setAttribute('aria-pressed', String(focused));
}
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (stage.requestFullscreen) await stage.requestFullscreen();
    else { status.textContent = 'Use Open in a new tab for a larger game view.'; return; }
    frame.focus();
  } catch { status.textContent = 'Use Open in a new tab for a larger game view.'; }
}
function setFocused(value: boolean) {
  if (value === focused) return;
  focused = value;
  if (value) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : dim;
    previousScroll = {x:window.scrollX, y:window.scrollY};
    placeholder.style.height = `${stage.getBoundingClientRect().height}px`;
    placeholder.hidden = false;
    // Keep the existing iframe in place so its game and save state survive view changes.
    let current: HTMLElement = stage;
    while (current.parentElement) {
      for (const sibling of current.parentElement.children) {
        if (sibling instanceof HTMLElement && sibling !== current && sibling !== backdrop && !['SCRIPT', 'STYLE'].includes(sibling.tagName)) {
          inertElements.set(sibling, sibling.inert);
          sibling.inert = true;
        }
      }
      current = current.parentElement;
      if (current === document.body) break;
    }
    stage.setAttribute('role', 'dialog');
    stage.setAttribute('aria-modal', 'true');
    stage.setAttribute('aria-labelledby', 'play-title');
    stage.setAttribute('aria-describedby', 'game-dim-hint');
  } else {
    for (const [element, wasInert] of inertElements) element.inert = wasInert;
    inertElements.clear();
    for (const name of ['role', 'aria-modal', 'aria-labelledby', 'aria-describedby']) stage.removeAttribute(name);
  }
  document.body.classList.toggle('play-focused', value);
  if (!value) placeholder.hidden = true;
  backdrop.hidden = !value;
  updateView();
  if (value) frame.focus({preventScroll:true});
  else {
    window.scrollTo({left:previousScroll.x, top:previousScroll.y, behavior:'instant'});
    previousFocus?.focus({preventScroll:true});
  }
}
async function leaveDim() {
  if (document.fullscreenElement === stage) await document.exitFullscreen();
  setFocused(false);
}
function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && focused && !document.fullscreenElement) {
    event.preventDefault();
    event.stopImmediatePropagation();
    setFocused(false);
  }
}
function bindFrameKeys() {
  const frameDocument = frame.contentDocument;
  if (frameDocument && !boundDocuments.has(frameDocument)) {
    frameDocument.addEventListener('keydown', onEscape, true);
    boundDocuments.add(frameDocument);
  }
}
fullScreen.addEventListener('click', toggleFullscreen);
viewFullscreen.addEventListener('click', toggleFullscreen);
exitFullscreen.addEventListener('click', toggleFullscreen);
dim.addEventListener('click', () => setFocused(!focused));
exitDim.addEventListener('click', () => { void leaveDim(); });
backdrop.addEventListener('click', () => { void leaveDim(); });
document.addEventListener('keydown', onEscape, true);
document.addEventListener('focusin', event => { if (focused && !stage.contains(event.target as Node)) exitDim.focus({preventScroll:true}); });
document.addEventListener('fullscreenchange', updateView);
window.addEventListener('pagehide', () => clearTimeout(loadingTimer));
startLoading();
if (frame.contentDocument?.readyState === 'complete' && frame.contentDocument.URL.includes(game.assetPath)) markLoaded();
