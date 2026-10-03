import './appearance.css';
import { appearanceKey } from './appearance-shared';
import { applyLanguage, languageKey, languages, preferredLanguage, type Lang } from './i18n';
import { inject as injectAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Vercel Web Analytics and Speed Insights (cookieless; enabled per project in the Vercel dashboard).
// appearance.ts loads on every page, so this covers the whole site.
injectAnalytics();
injectSpeedInsights();

type Preference = 'light' | 'dark' | 'system';
const valid = (value: string | null): value is Preference => value === 'light' || value === 'dark' || value === 'system';
const system = matchMedia('(prefers-color-scheme: dark)');
let preference: Preference = 'dark';
try { const saved = localStorage.getItem(appearanceKey); if (valid(saved)) preference = saved; } catch { /* Settings still work when storage is unavailable. */ }

const settings = document.createElement('div');
settings.className = 'appearance';
settings.innerHTML = `<button type="button" class="appearance-toggle" aria-expanded="false" aria-controls="appearance-panel" aria-label="Appearance settings"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.4"/><path d="M12 5a7 7 0 0 1 0 14Z" fill="currentColor"/></svg><span>Appearance</span></button><div class="appearance-panel" id="appearance-panel" hidden><fieldset><legend>Appearance</legend><p>Choose your preferred light.</p>${(['light', 'dark', 'system'] as const).map(value => `<label><input type="radio" name="site-appearance" value="${value}"/><span>${value[0].toUpperCase() + value.slice(1)}</span>${value === 'system' ? '<small>Follow your device</small>' : ''}</label>`).join('')}</fieldset><label class="appearance-language"><span>Language</span><select name="site-language">${Object.entries(languages).map(([code, name]) => `<option value="${code}" lang="${code}">${name}</option>`).join('')}</select></label></div>`;
document.body.append(settings);
const toggle = settings.querySelector<HTMLButtonElement>('.appearance-toggle')!;
const panel = settings.querySelector<HTMLDivElement>('.appearance-panel')!;

function apply() {
  const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#121314' : '#f7f5ef');
  settings.querySelectorAll<HTMLInputElement>('input').forEach(input => { input.checked = input.value === preference; });
  toggle.title = `Appearance: ${preference[0].toUpperCase() + preference.slice(1)}`;
  window.dispatchEvent(new Event('appearancechange'));
}
function close(restoreFocus = false) {
  panel.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
  if (restoreFocus) toggle.focus({ preventScroll: true });
}
toggle.addEventListener('click', () => {
  const opening = panel.hidden;
  panel.hidden = !opening;
  toggle.setAttribute('aria-expanded', String(opening));
  if (opening) settings.querySelector<HTMLInputElement>('input:checked')!.focus();
});
settings.addEventListener('change', event => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !valid(input.value)) return;
  preference = input.value;
  try { localStorage.setItem(appearanceKey, preference); } catch { /* Use this preference for the current visit. */ }
  apply();
let language: Lang = preferredLanguage();
const languageSelect = settings.querySelector<HTMLSelectElement>('[name="site-language"]')!;
languageSelect.value = language;
languageSelect.addEventListener('change', () => { language = languageSelect.value as Lang; try { localStorage.setItem(languageKey, language); } catch { /* this visit only */ } applyLanguage(language); window.dispatchEvent(new Event('languagechange-site')); });
const applyNow = () => applyLanguage(language);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyNow); else applyNow();
});
document.addEventListener('pointerdown', event => { if (!settings.contains(event.target as Node)) close(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(true); } });
settings.addEventListener('focusout', event => { if (event.relatedTarget && !settings.contains(event.relatedTarget as Node)) close(); });
system.addEventListener('change', () => { if (preference === 'system') apply(); });
window.addEventListener('storage', event => { if (event.key === appearanceKey || event.key === null) { preference = valid(event.newValue) ? event.newValue : 'dark'; apply(); } });
apply();
let language: Lang = preferredLanguage();
const languageSelect = settings.querySelector<HTMLSelectElement>('[name="site-language"]')!;
languageSelect.value = language;
languageSelect.addEventListener('change', () => { language = languageSelect.value as Lang; try { localStorage.setItem(languageKey, language); } catch { /* this visit only */ } applyLanguage(language); window.dispatchEvent(new Event('languagechange-site')); });
const applyNow = () => applyLanguage(language);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyNow); else applyNow();
