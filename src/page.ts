import { projects, papers, profile, type Project, type Paper } from './content';
import { artwork } from './artwork';

export const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.4"/></svg>';
export const next = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.4"/></svg>';
export const pause = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6 4h2v12H6zm6 0h2v12h-2z"/></svg>';
export const play = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m7 4 9 6-9 6z"/></svg>';
export const reset = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5a6 6 0 1 1-1 8M5 2v4H1" stroke="currentColor" stroke-width="1.2"/></svg>';
export const external = (href: string, text: string, css = 'text-link') => `<a class="${css}" href="${href}"${href.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text} ${href.startsWith('/') || href.startsWith('#') ? next : arrow}</a>`;
export const tags = (p: Project) => p.tags.map(t => `<span>${t}</span>`).join('');

export const selectedPapers = ['minimal-winding', 'rank-window', 'double-pendulum'].map(id => papers.find(p => p.id === id)!);

export function projectCard(p: Project, hidden = false): string {
  return `<article class="project-card"${hidden ? ' hidden' : ''}><button class="project-art" data-project="${p.id}" aria-label="Read about ${p.name}">${artwork(p.id)}<span class="art-open">${arrow}</span></button><div class="project-meta"><span>${p.category}</span><span>${p.eyebrow}</span></div><div class="project-title-line"><h3><button class="title-button" data-project="${p.id}">${p.name}</button></h3>${external(p.launch ?? p.source, p.launch ? p.launchLabel ?? 'Visit project' : 'Source code', 'project-arrow')}</div><p class="project-description">${p.description}</p><div class="card-foot"><div class="tags">${tags(p)}</div>${p.privateWorkspace ? '<span class="private-workspace-note">Private workspace</span>' : external(p.source,'Source','card-source subtle-link')}</div></article>`;
}

export function paperRow(p: Paper, index: number, hidden = false): string {
  return `<article class="paper-row"${hidden ? ' hidden' : ''}><span class="paper-number">${String(index+1).padStart(2,'0')}</span><div class="paper-content"><div class="paper-meta"><span>${p.category}</span><span>Preprint</span></div><h3><a href="${p.doi}" target="_blank" rel="noopener noreferrer">${p.title}</a></h3><p>${p.summary}</p><div class="paper-links">${external(p.pdf, 'Read PDF', 'subtle-link')}${external(p.source, 'Code & evidence', 'subtle-link')}</div></div><a class="paper-open" href="${p.doi}" target="_blank" rel="noopener noreferrer" aria-label="Open the archived preprint: ${p.title}">${arrow}</a></article>`;
}

export function renderPage(): string {
  return `
  <noscript><style>#project-grid>.project-card[hidden]{display:block!important}#paper-list>.paper-row[hidden]{display:grid!important}.filters,.figure-controls,.menu-toggle,.collection-more,#more-papers,.research-toolbar,.paper-results{display:none!important}.project-art,.feature-art,.title-button{cursor:default}.project-art,.feature-art,.title-button{pointer-events:none}</style></noscript>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header wrap">
    <a class="brand" href="#" aria-label="Hendrick Research home"><picture><source srcset="/logo.webp" type="image/webp"/><img src="/logo.png" width="1536" height="1024" alt="Hendrick Research" fetchpriority="high" decoding="async" /></picture></a>
    <nav class="desktop-nav" aria-label="Main navigation"><a href="/" aria-current="page">Home</a><a href="#projects">Projects</a><a href="/games/">Games</a><a href="/music/">Music</a><a href="/cipher-lab/">Cipher Lab</a><a href="/play/siegeworks/">Sieges</a><a href="/generative-art/">Art</a><a href="/research/">Research</a><a href="/fibers/">Fibers of Earth</a></nav>
    <button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button>
    <nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden><a href="/" aria-current="page">Home</a><a href="#projects">Projects</a><a href="/games/">Games</a><a href="/music/">Music</a><a href="/cipher-lab/">Cipher Lab</a><a href="/play/siegeworks/">Sieges</a><a href="/generative-art/">Generative art</a><a href="/research/">Research</a><a href="/fibers/">Fibers of Earth</a><a href="/genchase/">GENChase</a><a href="#about">About</a>${external(profile.github, 'GitHub')}</nav>
  </header>
  <main id="main">
    <section class="hero wrap" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="tiny-line"></span> INDEPENDENT RESEARCH & SOFTWARE</p>
        <h1 id="hero-title" data-i18n="hero.title">Computational research<br /><em>and software.</em></h1>
        <p class="hero-description" data-i18n="hero.desc">Hendrick Research develops computer-assisted proofs in fluid dynamics, dynamical systems and mathematical biology, alongside open research software, simulations and interactive tools. Every result is archived with the programs that verify it.</p>
        <div class="hero-actions"><a class="button button-dark" href="#projects"><span data-i18n="View the work">View the work</span> ${next}</a><a class="text-link" href="#research"><span data-i18n="Read the publications">Read the publications</span> ${arrow}</a></div>
      </div>
      <figure class="hero-figure">
        <div class="figure-top"><span id="attractor-label">LORENZ SYSTEM</span><span>RK4, LIVE IN YOUR BROWSER</span><span class="figure-plus">+</span></div>
        <div class="canvas-frame"><canvas id="attractor" role="img" aria-label="Animated visualization of classical chaotic attractors: Lorenz, Rössler, Aizawa, Thomas and Halvorsen"></canvas></div>
        <div class="figure-bottom"><figcaption><span id="attractor-name" class="specimen-title">The Lorenz attractor</span><span id="attractor-caption" class="specimen-caption">Nearby starting points drift apart; the shape stays the same.</span></figcaption><div class="figure-controls"><button id="reset-flow" class="icon-button" aria-label="Reset the attractor view" title="Reset view">${reset}</button><button id="pause-flow" class="icon-button" aria-label="Pause animation" title="Pause animation" aria-pressed="false">${pause}</button></div></div>
      </figure>
    </section>
    <div class="introduction wrap"><p data-i18n="intro.count" data-i18n-p="${projects.length}" data-i18n-n="${papers.length}">${projects.length} projects and ${papers.length} preprints.</p><a href="#projects" aria-label="Scroll to projects">↓</a></div>
    <section id="projects" class="projects-section wrap" aria-labelledby="projects-title">
      <div class="section-heading"><div><p class="eyebrow" data-i18n="PROJECTS">PROJECTS</p><h2 id="projects-title" data-i18n="Research software and tools.">Research software and tools.</h2></div><p data-i18n="projects.desc">Simulation environments, analysis tools<br />and interactive work. Most are open source.</p></div>
      <div class="collection-toolbar"><div class="filters" role="group" aria-label="Filter projects">${['All work','Research','Tools','Play'].map((f,i) => `<button class="filter${i === 0 ? ' active' : ''}" data-filter="${f}" aria-pressed="${i === 0}">${f}</button>`).join('')}</div><span id="project-count" class="collection-count" aria-live="polite">${projects.length} projects</span></div>
      <div id="featured-project" class="featured-project">
        <button class="feature-art" data-project="genchase" aria-label="Read about GENChase">${artwork('genchase')}<span class="art-corner">GENCHASE</span><span class="art-open">${arrow}</span></button>
        <div class="feature-copy"><p class="eyebrow" data-i18n="FEATURED">FEATURED</p><h3>GENChase</h3><p class="feature-subtitle" data-i18n="The simulation environment behind the publications.">The simulation environment behind the publications.</p><p class="feature-description">${projects[0].description}</p><div class="tags">${tags(projects[0])}</div><div class="feature-links">${external(projects[0].launch!, projects[0].launchLabel!)}<span class="private-workspace-note">Private workspace</span></div></div>
      </div>
      <div id="project-grid" class="project-grid">${projects.filter(p => p.id !== 'genchase').map((p,i) => projectCard(p, i >= 3)).join('')}</div>
      <div class="collection-more"><button id="more-projects" class="button button-outline"><span data-i18n="Show all projects">Show all projects</span> <span>+</span></button><span id="shown-projects" class="small-note">Showing a selection.</span></div>
    </section>
    <section id="research" class="research-section" aria-labelledby="research-title"><div class="wrap">
      <div class="section-heading"><div><p class="eyebrow" data-i18n="PUBLICATIONS">PUBLICATIONS</p><h2 id="research-title" data-i18n="Publications.">Publications.</h2></div><p data-i18n="papers.desc">Preprints archived on Zenodo, each with<br />its DOI and the programs that verify it.</p></div>
      <div class="research-intro"><p>${[...new Set(papers.map(p => p.category))].join(' · ')}</p><span class="preprint-note"><span class="status-dot"></span> <span data-i18n="Preprints. Not yet peer reviewed.">Preprints. Not yet peer reviewed.</span></span></div>
      <div class="research-toolbar"><div class="paper-filters" role="group" aria-label="Filter papers by topic">${['All topics',...new Set(papers.map(p => p.category))].map((topic,i) => `<button class="paper-filter${i === 0 ? ' active' : ''}" data-topic="${topic}" aria-pressed="${i === 0}">${topic}</button>`).join('')}</div><label class="search-field"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="5" stroke="currentColor" stroke-width="1.2"/><path d="m12 12 5 5" stroke="currentColor" stroke-width="1.2"/></svg><input id="paper-search" type="search" placeholder="Search papers" data-i18n-placeholder="Search papers" aria-label="Search research papers" autocomplete="off"/><kbd aria-hidden="true">Alt+/</kbd></label></div>
      <p id="paper-count" class="paper-results" aria-live="polite">3 selected papers / ${papers.length} in the collection</p>
      <div id="paper-list" class="paper-list">${selectedPapers.map((p,i) => paperRow(p,i)).join('')}${papers.filter(p => !selectedPapers.includes(p)).map((p,i) => paperRow(p,i+selectedPapers.length,true)).join('')}</div>
      <div class="research-footer"><button id="more-papers" class="text-link">All ${papers.length} research papers <span>+</span></button>${external(profile.orcid, 'Researcher profile', 'subtle-link')}</div>
    </div></section>
    <section id="about" class="about-section wrap" aria-labelledby="about-title">
      <div class="about-card"><div class="about-heading"><p class="eyebrow" data-i18n="ABOUT">ABOUT</p><h2 id="about-title" data-i18n="About Hendrick Research.">About Hendrick Research.</h2></div><div class="about-copy"><p data-i18n="about.p1">Hendrick Research is an independent research practice working where mathematics, computation and the life sciences meet. Its work centers on rigorous computer-assisted results: proofs in which every inequality is decided in interval or ball arithmetic.</p><p data-i18n="about.p2">Software is developed with AI-assisted programming under human direction; the questions, methods and verification are set and checked by a person. Results are released as preprints with their programs and data, and each paper states what was and was not verified. None has yet been peer reviewed.</p><p class="about-manifesto" data-i18n="Corrections and questions are welcome on GitHub.">Corrections and questions are welcome on GitHub.</p></div></div>
    </section>
  </main>
  <footer class="site-footer wrap"><a class="footer-brand" href="#" aria-label="Back to top"><picture><source srcset="/logo.webp" type="image/webp"/><img src="/logo.png" alt="Hendrick Research" width="1536" height="1024" decoding="async" loading="lazy" /></picture></a><div class="footer-links">${external(profile.github, 'GitHub', 'subtle-link')}${external(profile.orcid, 'ORCID', 'subtle-link')}<a class="subtle-link" href="#">Back to top ↑</a></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Hendrick Research</span><span>Hendrick Research</span></div></footer>
  <dialog id="project-dialog" aria-labelledby="dialog-title"><button class="dialog-close icon-button" aria-label="Close project details">×</button><div id="dialog-content"></div></dialog>
`;
}
