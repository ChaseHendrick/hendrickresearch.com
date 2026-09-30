import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './style.css';
import './music.css';
import './appearance';
import { renderMusic, promptIdeas } from './music';

const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app.querySelector('main')) app.innerHTML = renderMusic();

const menu = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
const mobileNav = document.querySelector<HTMLElement>('#mobile-nav')!;
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
  mobileNav.hidden = true;
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileNav.hidden = !open;
});
mobileNav.addEventListener('click', event => {
  if ((event.target as HTMLElement).closest('a')) closeMenu();
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

document.querySelectorAll<HTMLButtonElement>('[data-prompt]').forEach(button => {
  button.addEventListener('click', () => {
    const idea = promptIdeas[Number(button.dataset.prompt)];
    if (!idea) return;
    document.querySelector('#music-prompt-text')!.textContent = idea.text;
    document.querySelectorAll('[data-prompt]').forEach(option => {
      option.setAttribute('aria-pressed', String(option === button));
    });
  });
});
