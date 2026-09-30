export type CatalogEntry = {
  id: string;
  title: string;
  kind: 'module' | 'technique' | 'tab';
  category: string;
  description: string;
  tags?: string[];
  detail?: string;
  status?: string;
  family?: string;
  tabName?: string;
  presetCount?: number;
  evidenceStatus?: string;
  presets?: string[];
  presetLabels?: Partial<Record<string, string>>;
  previews?: Array<{ preset: string; image: string; video?: string; label?: string; note?: string }>;
};

const escapeHTML = (value: string): string => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]!));

const kindNames = { module: 'Module', technique: 'Technique', tab: 'Workspace tab' };
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.4"/></svg>';
const logo = '<picture><source srcset="/logo.webp" type="image/webp" /><img src="/logo.png" width="1536" height="1024" alt="Hendrick Research" decoding="async" /></picture>';

export function defaultPreset(entry: CatalogEntry): string {
  return entry.previews?.find(preview => preview.image)?.preset ?? entry.presets?.[0] ?? '';
}

export function presetLabel(entry: CatalogEntry, preset: string): string {
  return entry.previews?.find(preview => preview.preset === preset)?.label ?? entry.presetLabels?.[preset] ?? preset;
}

/** Public sample media only; no workspace code is needed to display a render. */
export function catalogPreview(entry: CatalogEntry, selectedPreset = defaultPreset(entry), context: 'card' | 'dialog' = 'card'): string {
  const presets = [...new Set([...(entry.presets ?? []), ...(entry.previews?.map(preview => preview.preset) ?? [])])];
  const preview = entry.previews?.find(candidate => candidate.preset === selectedPreset);
  const hasImage = !!preview?.image;
  const selectedLabel = presetLabel(entry, selectedPreset);
  const alt = `Sample render of ${entry.title}, preset ${selectedLabel}`;
  return `<div class="catalog-preview" data-preview-entry="${escapeHTML(entry.id)}" data-preview-context="${context}" data-preview-preset="${escapeHTML(selectedPreset)}" data-preview-available="${hasImage}">
    <figure class="catalog-media"><img class="catalog-preview-image"${hasImage ? ` src="${escapeHTML(preview!.image)}"` : ' hidden'} alt="${escapeHTML(alt)}" width="720" height="480" loading="${context === 'dialog' ? 'eager' : 'lazy'}" decoding="async" /><video class="catalog-preview-video" hidden muted loop playsinline preload="none"${hasImage ? ` poster="${escapeHTML(preview!.image)}"` : ''} data-video-src="${escapeHTML(preview?.video ?? '')}" aria-label="${escapeHTML(`Motion sample of ${entry.title}, preset ${selectedLabel}`)}"></video><div class="catalog-preview-fallback"${hasImage ? ' hidden' : ''}><span>Preview being prepared</span></div></figure>
    <div class="catalog-preview-body"><div class="catalog-preview-caption"><p class="catalog-sample-label">Sample render</p><button type="button" class="catalog-preview-toggle" data-preview-toggle aria-label="${escapeHTML(`Play sample motion for ${entry.title}`)}" aria-pressed="false"${preview?.video && hasImage ? '' : ' hidden'}>Play motion</button></div>
    <label class="catalog-preset-field"><span>Preset</span><select class="catalog-preset-select" data-preset-entry="${escapeHTML(entry.id)}" aria-label="${escapeHTML(`Preset for ${entry.title}`)}"${presets.length ? '' : ' disabled'}>${presets.length ? presets.map(preset => `<option value="${escapeHTML(preset)}"${preset === selectedPreset ? ' selected' : ''}>${escapeHTML(presetLabel(entry, preset))}</option>`).join('') : '<option value="">No presets listed</option>'}</select></label>
    <p class="catalog-selected-preset">Selected preset: <span data-selected-preset>${escapeHTML(selectedLabel || 'None selected')}</span></p><p class="catalog-selected-preset" data-sample-note${preview?.note ? '' : ' hidden'}>${escapeHTML(preview?.note ?? '')}</p></div>
  </div>`;
}

export function catalogCard(entry: CatalogEntry): string {
  const topicTags = entry.tags?.filter(Boolean) ?? [];
  const status = entry.status ?? entry.evidenceStatus;
  const presetCount = typeof entry.presetCount === 'number' && Number.isFinite(entry.presetCount)
    ? Math.max(0, Math.floor(entry.presetCount))
    : undefined;
  return `<article class="catalog-card" data-entry-kind="${escapeHTML(entry.kind)}" data-entry-id="${escapeHTML(entry.id)}">
    <div class="catalog-card-media">${catalogPreview(entry)}</div>
    <div class="catalog-card-meta"><span class="catalog-card-kind">${kindNames[entry.kind]}</span>${status ? `<span class="catalog-card-status">${escapeHTML(status)}</span>` : ''}</div>
    <h3><a href="/genchase/${escapeHTML(entry.id)}/">${escapeHTML(entry.title)}</a></h3>
    ${entry.category ? `<p class="catalog-card-category">${escapeHTML(entry.category)}</p>` : ''}
    <p class="catalog-card-description">${escapeHTML(entry.description)}</p>
    ${entry.family || entry.tabName && entry.tabName !== entry.title || presetCount !== undefined ? `<dl class="catalog-card-facts">${entry.family ? `<div><dt>Family</dt><dd>${escapeHTML(entry.family)}</dd></div>` : ''}${entry.tabName && entry.tabName !== entry.title ? `<div><dt>Studio tab</dt><dd>${escapeHTML(entry.tabName)}</dd></div>` : ''}${presetCount !== undefined ? `<div><dt>Presets</dt><dd>${presetCount}</dd></div>` : ''}</dl>` : ''}
    ${topicTags.length ? `<div class="catalog-card-tags" aria-label="Topics">${topicTags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div>` : ''}
    <button type="button" class="catalog-card-open" data-id="${escapeHTML(entry.id)}" aria-label="Read about ${escapeHTML(entry.title)}">Read details ${arrow}</button>
  </article>`;
}

/** Renders descriptive public metadata without importing the private workspace. */
export function renderCatalog(entries: CatalogEntry[], workspace?: {areas:{title:string;description:string}[];tools:{title:string;description:string}[]}): string {
  const categories = [...new Set(entries.map(entry => entry.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const kinds = ['module', 'technique', 'tab'] as const;
  const availableKinds = kinds.filter(kind => entries.some(entry => entry.kind === kind));
  const familyCount = new Set(entries.map(entry => entry.family).filter(Boolean)).size;
  const presetCount = entries.reduce((sum, entry) => sum + (typeof entry.presetCount === 'number' && Number.isFinite(entry.presetCount) ? Math.max(0, Math.floor(entry.presetCount)) : 0), 0);
  const entryLabel = availableKinds.length === 1 ? availableKinds[0] === 'tab' ? 'Workspace tabs' : `${kindNames[availableKinds[0]]}s` : 'Catalog entries';
  const overview = [[entries.length, entryLabel], [familyCount, 'Implementation families'], [presetCount, 'Presets']] as const;
  const entryCount = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;
  const families = [...new Set(entries.map(entry => entry.family).filter((family): family is string => !!family))].sort();

  return `<a class="skip-link" href="#catalog-main">Skip to catalog</a>
    <header class="catalog-header wrap">
      <a class="catalog-brand" href="/" aria-label="Hendrick Research home">${logo}</a>
      <nav class="catalog-nav" aria-label="Main navigation"><a href="/">Home</a><a href="/games/">Games</a><a href="/genchase/" aria-current="page">GENChase</a><a href="/#research">Research</a></nav>
    </header>
    <main id="catalog-main">
      <section class="catalog-hero wrap" aria-labelledby="catalog-title">
        <div class="catalog-hero-copy">
          <p class="eyebrow catalog-kicker"><span aria-hidden="true"></span> GENCHASE / PUBLIC CATALOG</p>
          <h1 id="catalog-title">A workspace for<br /><em>scientific curiosity.</em></h1>
          <p class="catalog-intro">One collection, many ways to explore. Each technique is a studio tab, with its implementation family shown alongside it. Browse by topic, find a method, or scan the studio index.</p>
          <p class="catalog-access-note">This is a public descriptive guide.<br />The implementation and source code are private.</p>
        </div>
        <aside class="catalog-overview" aria-label="Catalog overview">
          <p class="eyebrow">THE WORKSPACE / AT A GLANCE</p>
          <dl>${overview.map(([count, label]) => `<div><dt>${label}</dt><dd>${count}</dd></div>`).join('')}</dl>
          <p>Browse what’s inside.<br />Follow what interests you.</p>
        </aside>
      </section>
      ${workspace ? `<details class="workspace-guide wrap"><summary>How the workspace fits together <span aria-hidden="true">+</span></summary><div class="workspace-areas">${workspace.areas.map(area => `<article><h2>${escapeHTML(area.title)}</h2><p>${escapeHTML(area.description)}</p></article>`).join('')}</div><div class="workspace-tools">${workspace.tools.map(tool => `<details><summary>${escapeHTML(tool.title)}</summary><p>${escapeHTML(tool.description)}</p></details>`).join('')}</div></details>` : ''}
      <section class="catalog-browser wrap" aria-labelledby="catalog-browser-title">
        <aside class="catalog-sidebar">
          <h2 id="catalog-browser-title">Explore the catalog.</h2>
          <p class="catalog-sidebar-description">Find a method, a model,<br />or a new direction.</p>
          <h3 id="catalog-categories-title">Categories</h3>
          <div class="catalog-categories" role="group" aria-labelledby="catalog-categories-title">
            <button type="button" class="catalog-category active" data-category="all" aria-pressed="true"><span>All categories</span><span class="catalog-category-count" aria-hidden="true">${entries.length}</span></button>
            ${categories.map(category => `<button type="button" class="catalog-category" data-category="${escapeHTML(category)}" aria-pressed="false"><span>${escapeHTML(category)}</span><span class="catalog-category-count" aria-hidden="true">${entries.filter(entry => entry.category === category).length}</span></button>`).join('')}
          </div>
          <div class="catalog-selectors"><label>Implementation family<select id="catalog-family"><option value="">All ${families.length} families</option>${families.map(family => `<option value="${escapeHTML(family)}">${escapeHTML(family)} (${entries.filter(entry => entry.family === family).length})</option>`).join('')}</select></label><label>Browse as<select id="catalog-view"><option value="cards">Technique cards</option><option value="index">Studio tab index</option></select></label><button id="catalog-clear" class="subtle-link" hidden>Reset filters ×</button></div>
        </aside>
        <div class="catalog-results">
          <div class="catalog-search-field">
            <label for="catalog-search">Search the catalog</label>
            <div class="catalog-search-box"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.3"/><path d="m15.3 15.3 4.7 4.7" stroke="currentColor" stroke-width="1.3"/></svg><input id="catalog-search" name="q" type="search" placeholder="Search titles, methods, topics…" autocomplete="off" spellcheck="false" /></div>
          </div>
          <div class="catalog-toolbar">${availableKinds.length > 1 ? `<div class="catalog-kinds" role="group" aria-label="Filter by entry type"><button type="button" class="catalog-kind active" data-kind="all" aria-pressed="true">All entries</button>${availableKinds.map(kind => `<button type="button" class="catalog-kind" data-kind="${kind}" aria-pressed="false">${kind === 'tab' ? 'Tabs' : `${kindNames[kind]}s`}</button>`).join('')}</div>` : `<p class="catalog-collection-label">${entryLabel}</p>`}<span id="catalog-count" role="status" aria-live="polite" aria-atomic="true">${entryCount}</span></div>
          <h2 class="catalog-sr-only" id="catalog-results-title">Catalog entries</h2>
          <div id="catalog-grid" class="catalog-grid" aria-labelledby="catalog-results-title">${entries.map(catalogCard).join('')}</div>
          <div id="catalog-empty" class="catalog-empty"${entries.length ? ' hidden' : ''}><p class="eyebrow">A DIFFERENT DIRECTION</p><h3>No entries found.</h3><p>Try another search term or choose a broader category.</p></div>
          <div class="catalog-more"><button id="catalog-more" class="button button-outline">Show more techniques +</button></div>
          <p class="catalog-results-note">Images are sample renders, not scientific validation. Evidence labels describe recorded internal checks and their stated limits. Techniques without recorded validation are marked exploratory.</p>
        </div>
      </section>
    </main>
    <footer class="catalog-footer wrap"><a href="/">Back to Hendrick Research ${arrow}</a><p>Research. Software. Possibility.</p></footer>
    <dialog id="catalog-dialog" aria-labelledby="catalog-detail-title"><button type="button" id="catalog-close" class="catalog-close" aria-label="Close entry details"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.3"/></svg></button><div id="catalog-dialog-content"><h2 id="catalog-detail-title">Catalog details</h2></div></dialog>`;
}
