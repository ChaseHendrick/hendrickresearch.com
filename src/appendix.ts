import type { ContentPage } from './content-pages';
import { secretCatalog, secretRoute, type SecretId } from './secrets';

export function renderSecretList(found: readonly SecretId[]): string {
  const count = secretCatalog.filter(s => found.includes(s.id)).length;
  const items = secretCatalog.map(s => {
    const got = found.includes(s.id);
    return `<li class="secret${got ? ' found' : ''}"><p class="secret-state">${got ? 'Found' : 'Not yet'}</p><h3>${s.title}</h3><p>${got ? s.found : `Hint: ${s.hint}`}</p></li>`;
  }).join('');
  return `<p class="section-intro" id="secret-progress">${count === secretCatalog.length ? `All ${count} found. Nothing left to hide from you.` : `You have found ${count} of ${secretCatalog.length}.`}</p><ul class="secret-list">${items}</ul>`;
}

export const appendixPage: ContentPage = {
  route: secretRoute,
  title: 'Appendix Z | Hendrick Research',
  description: 'An unlisted page.',
  body: `<section class="editorial-hero"><p class="eyebrow">Unlisted</p><h1>Appendix Z</h1><p class="editorial-intro">No menu links here, the sitemap leaves it out, and search engines are asked to skip it. If you are reading this, you went looking. Curiosity is welcome here.</p></section>
<section class="editorial-section" aria-labelledby="secrets-heading"><h2 id="secrets-heading">Secrets found</h2><div id="secret-list" aria-live="polite">${renderSecretList([])}</div><p class="editorial-note">Progress lives only in this browser's local storage. Nothing is sent anywhere.</p><button type="button" class="secret-reset" id="secret-reset">Forget my progress</button></section>
<section class="editorial-section"><h2>Loose ends</h2><p class="section-intro secret-note">The credits are kept in <a href="/humans.txt">humans.txt</a>. The home page source has a riddle for anyone who reads markup, and the browser console greets every visitor with a note.</p></section>`,
};
