import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './style.css';
import { projects, papers, profile, type Project } from './content';
import { artwork } from './artwork';
import { mountAttractor } from './attractor';

const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.4"/></svg>';
const next = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.4"/></svg>';
const pause = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6 4h2v12H6zm6 0h2v12h-2z"/></svg>';
const play = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m7 4 9 6-9 6z"/></svg>';
const reset = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5a6 6 0 1 1-1 8M5 2v4H1" stroke="currentColor" stroke-width="1.2"/></svg>';
const external = (href: string, text: string, css = 'text-link') => `<a class="${css}" href="${href}" target="_blank" rel="noopener noreferrer">${text} ${arrow}</a>`;
const tags = (p: Project) => p.tags.map(t => `<span>${t}</span>`).join('');

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header wrap">
    <a class="brand" href="#" aria-label="Hendrick Research home"><img src="/logo.png" width="1536" height="1024" alt="Hendrick Research" /></a>
    <nav class="desktop-nav" aria-label="Main navigation"><a href="#projects">Projects</a><a href="#research">Research</a><a href="#about">The idea</a></nav>
    ${external(profile.github, 'GitHub', 'header-github')}
    <button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button>
    <nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden><a href="#projects">Projects</a><a href="#research">Research</a><a href="#about">The idea</a>${external(profile.github, 'GitHub')}</nav>
  </header>
  <main id="main">
    <section class="hero wrap" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="tiny-line"></span> INDEPENDENT RESEARCH & SOFTWARE</p>
        <h1 id="hero-title">Curiosity,<br /><em>made tangible.</em></h1>
        <p class="hero-description">Human ideas. New possibilities.<br />A collection of research, useful tools, and unexpected experiments by Chase Hendrick.</p>
        <div class="hero-actions"><a class="button button-dark" href="#projects">Explore the work ${next}</a><a class="text-link" href="#research">Read the research ${arrow}</a></div>
        <p class="hero-note"><span class="status-dot"></span> Built with AI. Led by curiosity.</p>
      </div>
      <figure class="hero-figure">
        <div class="figure-top"><span>FIG. 01</span><span>ORDER WITHIN CHAOS</span><span class="figure-plus">+</span></div>
        <div class="canvas-frame"><canvas id="attractor" role="img" aria-label="Interactive copper visualization of the Lorenz attractor, a classical chaotic system"></canvas></div>
        <div class="figure-bottom"><figcaption><span class="specimen-title">The Lorenz attractor</span><span class="specimen-caption">A small change. An entirely different path.</span></figcaption><div class="figure-controls"><button id="reset-flow" class="icon-button" aria-label="Reset the attractor view" title="Reset view">${reset}</button><button id="pause-flow" class="icon-button" aria-label="Pause animation" title="Pause animation" aria-pressed="false">${pause}</button></div></div>
      </figure>
    </section>
    <div class="introduction wrap"><p>An idea is only the beginning.</p><p>This is what happens when you build it.</p><a href="#projects" aria-label="Scroll to projects">↓</a></div>
    <section id="projects" class="projects-section wrap" aria-labelledby="projects-title">
      <div class="section-heading"><div><p class="eyebrow">01 / SELECTED WORK</p><h2 id="projects-title">Ideas, out in the world.</h2></div><p>Some practical. Some playful.<br />All driven by a question.</p></div>
      <div class="collection-toolbar"><div class="filters" role="group" aria-label="Filter projects">${['All work','Research','Tools','Play'].map((f,i) => `<button class="filter${i === 0 ? ' active' : ''}" data-filter="${f}" aria-pressed="${i === 0}">${f}</button>`).join('')}</div><span id="project-count" class="collection-count" aria-live="polite">${projects.length} projects</span></div>
      <div id="featured-project" class="featured-project">
        <button class="feature-art" data-project="genchase" aria-label="Read about GENChase">${artwork('genchase')}<span class="art-corner">01 / GENCHASE</span><span class="art-open">${arrow}</span></button>
        <div class="feature-copy"><p class="eyebrow">FEATURED EXPLORATION</p><h3>GENChase</h3><p class="feature-subtitle">A studio for scientific curiosity.</p><p class="feature-description">${projects[0].description}</p><div class="tags">${tags(projects[0])}</div><div class="feature-links">${external(projects[0].launch!, 'Get the studio')}${external(projects[0].source, 'Source code', 'subtle-link')}</div></div>
      </div>
      <div id="project-grid" class="project-grid"></div>
      <div class="collection-more"><button id="more-projects" class="button button-outline">Explore the full collection <span>+</span></button><span id="shown-projects" class="small-note">A few starting points. There’s more inside.</span></div>
    </section>
    <section id="research" class="research-section" aria-labelledby="research-title"><div class="wrap">
      <div class="section-heading"><div><p class="eyebrow">02 / RESEARCH & PAPERS</p><h2 id="research-title">Follow the question.</h2></div><p>Ideas are stronger when you can<br />inspect the reasoning behind them.</p></div>
      <div class="research-intro"><p>Mathematics, fluid dynamics, and computational neuroscience.</p><span class="preprint-note"><span class="status-dot"></span> Preprints. Not yet peer reviewed.</span></div>
      <div id="paper-list" class="paper-list"></div>
      <div class="research-footer"><button id="more-papers" class="text-link">All ${papers.length} research papers <span>+</span></button>${external(profile.orcid, 'Researcher profile', 'subtle-link')}</div>
    </div></section>
    <section id="about" class="about-section wrap" aria-labelledby="about-title">
      <div class="about-card"><div class="about-heading"><p class="eyebrow">03 / THE IDEA BEHIND IT</p><h2 id="about-title">One curious mind.<br /><em>A new set of tools.</em></h2><div class="about-signature"><span class="signature-line"></span> Chase Hendrick <span>Independent researcher & builder</span></div></div><div class="about-copy"><p>Hendrick Research is my personal collection of software and independent research. A place to ask questions, make things, and share what comes of it.</p><p>AI makes it possible to move from an idea to a working tool, an interactive world, or a new line of inquiry. This collection is a living demonstration of that possibility.</p><p class="about-manifesto">Human curiosity sets the direction.<br />The work speaks for itself.</p>${external(profile.github, 'See what I’m building', 'text-link light-link')}</div></div>
    </section>
  </main>
  <footer class="site-footer wrap"><a class="footer-brand" href="#" aria-label="Back to top"><img src="/logo.png" alt="Hendrick Research" width="1536" height="1024" /></a><p>Independent thought.<br />Open exploration.</p><div class="footer-links">${external(profile.github, 'GitHub', 'subtle-link')}${external(profile.orcid, 'ORCID', 'subtle-link')}<a class="subtle-link" href="#">Back to top ↑</a></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Chase Hendrick</span><span>Research. Software. Possibility.</span></div></footer>
  <dialog id="project-dialog" aria-labelledby="dialog-title"><button class="dialog-close icon-button" aria-label="Close project details">×</button><div id="dialog-content"></div></dialog>
`;

let selectedFilter = 'All work';
let showAllProjects = false;
const grid = document.querySelector<HTMLDivElement>('#project-grid')!;
function renderProjects() {
  const matching = projects.filter(p => selectedFilter === 'All work' || p.category === selectedFilter);
  const featured = matching.some(p => p.id === 'genchase');
  document.querySelector<HTMLElement>('#featured-project')!.hidden = !featured;
  const others = matching.filter(p => p.id !== 'genchase');
  const shown = showAllProjects || selectedFilter !== 'All work' ? others : others.slice(0,3);
  grid.innerHTML = shown.map(p => `<article class="project-card"><button class="project-art" data-project="${p.id}" aria-label="Read about ${p.name}">${artwork(p.id)}<span class="art-open">${arrow}</span></button><div class="project-meta"><span>${p.category}</span><span>${p.eyebrow}</span></div><div class="project-title-line"><h3><button class="title-button" data-project="${p.id}">${p.name}</button></h3>${external(p.launch ?? p.source, p.launch ? 'Visit project' : 'Source code', 'project-arrow')}</div><p class="project-description">${p.description}</p><div class="tags">${tags(p)}</div></article>`).join('');
  document.querySelector('#project-count')!.textContent = `${matching.length} project${matching.length === 1 ? '' : 's'}`;
  const more = document.querySelector<HTMLButtonElement>('#more-projects')!;
  more.hidden = selectedFilter !== 'All work';
  more.innerHTML = showAllProjects ? 'Show selected work <span>−</span>' : 'Explore the full collection <span>+</span>';
  more.setAttribute('aria-expanded', String(showAllProjects));
  document.querySelector('#shown-projects')!.textContent = selectedFilter !== 'All work' ? `Showing all ${matching.length} ${selectedFilter.toLowerCase()} projects.` : showAllProjects ? 'The collection keeps growing.' : 'A few starting points. There’s more inside.';
}
renderProjects();
document.querySelectorAll<HTMLButtonElement>('.filter').forEach(button => button.addEventListener('click', () => {
  selectedFilter = button.dataset.filter!;
  document.querySelectorAll('.filter').forEach(b => {b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button));});
  renderProjects();
}));
document.querySelector('#more-projects')!.addEventListener('click', () => {showAllProjects = !showAllProjects; renderProjects();});

let allPapers = false;
function renderPapers() {
  document.querySelector('#paper-list')!.innerHTML = (allPapers ? papers : papers.slice(0,3)).map((p,i) => `<article class="paper-row"><span class="paper-number">${String(i+1).padStart(2,'0')}</span><div class="paper-content"><div class="paper-meta"><span>${p.category}</span><span>Preprint</span></div><h3><a href="${p.doi}" target="_blank" rel="noopener noreferrer">${p.title}</a></h3><p>${p.summary}</p><div class="paper-links">${external(p.pdf, 'Read PDF', 'subtle-link')}${external(p.source, 'Code & evidence', 'subtle-link')}</div></div><a class="paper-open" href="${p.doi}" target="_blank" rel="noopener noreferrer" aria-label="Open the archived preprint: ${p.title}">${arrow}</a></article>`).join('');
  const more = document.querySelector<HTMLButtonElement>('#more-papers')!;
  more.innerHTML = allPapers ? 'Show selected papers <span>−</span>' : `All ${papers.length} research papers <span>+</span>`;
  more.setAttribute('aria-expanded',String(allPapers));
}
renderPapers();
document.querySelector('#more-papers')!.addEventListener('click', () => {allPapers = !allPapers; renderPapers();});

const dialog = document.querySelector<HTMLDialogElement>('#project-dialog')!;
let opener: HTMLElement | null = null;
document.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLElement>('[data-project]');
  if (!button) return;
  const project = projects.find(p => p.id === button.dataset.project)!;
  opener = button;
  document.querySelector('#dialog-content')!.innerHTML = `<div class="dialog-art">${artwork(project.id)}</div><div class="dialog-copy"><p class="eyebrow">${project.category} / ${project.eyebrow}</p><h2 id="dialog-title">${project.name}</h2><p>${project.detail}</p><div class="tags">${tags(project)}</div><div class="dialog-links">${project.launch ? external(project.launch,project.launchLabel ?? 'Visit project','button button-dark') : ''}${external(project.source,'View source code')}</div></div>`;
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

const attractor = mountAttractor(document.querySelector<HTMLCanvasElement>('#attractor')!);
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
