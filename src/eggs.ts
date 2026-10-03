// Small extras for the curious. Loaded lazily from appearance.ts once the page is idle.
import { foundSecrets, recordSecret, secretRoute, type SecretId } from './secrets';

const note = 'GUR HAYVFGRQ CNTR VF NCCRAQVK M';
const art = [' _  _ ___ ', '| || | _ \\', '| __ |   /', '|_||_|_|_\\'].join('\n');
console.log(`%c${art}\n%cA sealed note for the lab: ${note}`, 'font:12px/1.25 monospace;color:#9fb7d0', 'font:12px/1.6 monospace;color:#a9adb2');

const css = `.hr-egg{position:fixed;left:max(20px,env(safe-area-inset-left));bottom:max(20px,env(safe-area-inset-bottom));z-index:41;max-width:min(380px,calc(100vw - 40px));padding:14px 48px 14px 16px;border:1px solid var(--line,#2f3236);border-radius:10px;background:var(--surface,#1a1c1e);color:var(--ink,#ececec);font:400 13px/1.55 'DM Sans',system-ui,sans-serif;box-shadow:0 10px 30px #0000002e;animation:hr-egg-in .25s ease-out}
.hr-egg p{margin:0}.hr-egg a,.hr-egg-link{color:var(--copper,#9fb7d0);text-underline-offset:3px}.hr-egg a{display:inline-block;margin-top:6px}
.hr-egg button{position:absolute;top:8px;right:8px;width:32px;height:32px;border:0;border-radius:6px;background:none;color:inherit;font:inherit;font-size:18px;line-height:1;cursor:pointer}
.hr-egg :is(a,button):focus-visible,.hr-egg-link:focus-visible{outline:2px solid var(--copper,#9fb7d0);outline-offset:2px}
.hr-egg-link{display:block;margin-top:12px;font-size:12px}
@keyframes hr-egg-in{from{opacity:0;transform:translateY(8px)}}
@media (prefers-reduced-motion:reduce){.hr-egg{animation:none}}
@media (max-width:600px){.hr-egg{left:16px;right:16px;max-width:none;bottom:calc(max(20px,env(safe-area-inset-bottom)) + 60px)}}`;
let styled = false;
function style() {
  if (styled) return;
  styled = true;
  const sheet = document.createElement('style');
  sheet.textContent = css;
  document.head.append(sheet);
}

// Once anything is found, the appearance panel keeps a quiet way back to the appendix.
function revealLink() {
  const panel = document.getElementById('appearance-panel');
  if (!panel || panel.querySelector('.hr-egg-link') || !foundSecrets().length) return;
  style();
  panel.insertAdjacentHTML('beforeend', `<a class="hr-egg-link" href="${secretRoute}">Appendix Z <span aria-hidden="true">→</span></a>`);
}

let toast: HTMLElement | null = null;
const dismiss = () => { toast?.remove(); toast = null; };
function announce(message: string, id: SecretId) {
  const fresh = recordSecret(id);
  style();
  dismiss();
  const box = toast = document.createElement('div');
  box.className = 'hr-egg';
  box.setAttribute('role', 'status');
  document.body.append(box);
  // Fill after insertion so screen readers announce the live region.
  requestAnimationFrame(() => {
    const link = location.pathname === secretRoute ? '' : `<br/><a href="${secretRoute}">Open Appendix Z</a>`;
    box.innerHTML = `<p><strong>${message}</strong> ${fresh ? 'Secret recorded.' : 'You found this one before.'}${link}</p><button type="button" aria-label="Dismiss">×</button>`;
    box.querySelector('button')!.addEventListener('click', dismiss);
  });
  setTimeout(() => { if (toast === box && !box.matches(':hover,:focus-within')) dismiss(); }, 20000);
  revealLink();
}
document.addEventListener('keydown', event => { if (event.key === 'Escape' && toast) dismiss(); });

// Konami code. Ignored while typing and when the page has already handled the key (games, tabs).
const code = 'arrowup,arrowup,arrowdown,arrowdown,arrowleft,arrowright,arrowleft,arrowright,b,a';
let recent: string[] = [];
const typing = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || target.closest('input,textarea,select') !== null);
window.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey || typing(event.target)) return;
  recent = [...recent, event.key.toLowerCase()].slice(-10);
  if (recent.join() === code) { recent = []; announce('Player 2 has joined the session.', 'konami'); }
});

// Seven quick knocks on the home page logo (its links only scroll to the top there).
let knocks = 0, last = 0;
document.addEventListener('click', event => {
  if (!(event.target instanceof Element) || !event.target.closest('a.brand[href="#"],a.footer-brand[href="#"]')) return;
  knocks = event.timeStamp - last < 1500 ? knocks + 1 : 1;
  last = event.timeStamp;
  if (knocks === 7) { knocks = 0; announce('Seven knocks, and the door opens.', 'knock'); }
});

// The console note, brought to the Cipher Lab.
const letters = (value: string) => value.toUpperCase().replace(/[^A-Z]/g, '');
document.getElementById('cipher-form')?.addEventListener('submit', () => {
  const input = document.getElementById('cipher-input');
  if (input instanceof HTMLTextAreaElement && letters(input.value) === letters(note)) announce('The lab has your note. Half the alphabet stands between you and the answer.', 'lab');
});

revealLink();
