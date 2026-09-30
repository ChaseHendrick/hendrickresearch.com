import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/instrument-serif/latin-400.css';
import './style.css';
import './game.css';
import { gamePages, renderGamePage } from './game-pages';

const id = document.body.dataset.game ?? location.pathname.split('/').filter(Boolean)[1];
const game = gamePages.find(item => item.id === id);
if (!game) throw new Error('Unknown game page');
const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app.querySelector('main')) app.innerHTML = renderGamePage(game);
const frame = document.querySelector<HTMLIFrameElement>('#game-frame')!;
const stage = document.querySelector<HTMLDivElement>('#game-stage')!;
const fullScreen = document.querySelector<HTMLButtonElement>('#game-fullscreen')!;
const exitFullscreen = document.createElement('button');
exitFullscreen.type = 'button';
exitFullscreen.className = 'play-exit-fullscreen';
exitFullscreen.textContent = 'Exit full screen';
exitFullscreen.hidden = true;
stage.append(exitFullscreen);
const status = document.querySelector<HTMLParagraphElement>('#game-load-status')!;
const help = document.querySelector<HTMLParagraphElement>('#game-load-help')!;
let loadingTimer: ReturnType<typeof setTimeout>;

function markLoaded() {
  clearTimeout(loadingTimer);
  help.hidden = true;
  status.textContent = `${game!.title} is loaded. Click inside to play.`;
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
fullScreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (stage.requestFullscreen) await stage.requestFullscreen();
    else { status.textContent = 'Use Open in a new tab for a larger game view.'; return; }
    frame.focus();
  } catch { status.textContent = 'Use Open in a new tab for a larger game view.'; }
});
exitFullscreen.addEventListener('click', () => { if (document.fullscreenElement) void document.exitFullscreen(); });
document.addEventListener('fullscreenchange', () => { const expanded = document.fullscreenElement === stage; fullScreen.firstChild!.textContent = expanded ? 'Exit full screen ' : 'Full screen '; exitFullscreen.hidden = !expanded; });
window.addEventListener('pagehide', () => clearTimeout(loadingTimer));
startLoading();
if (frame.contentDocument?.readyState === 'complete' && frame.contentDocument.URL.includes(game.assetPath)) markLoaded();
