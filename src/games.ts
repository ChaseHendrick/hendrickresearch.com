import { projects, profile } from './content';
import { artwork } from './artwork';
import { external, next } from './page';

export function renderGames(): string {
  const otherGames = projects.filter(p => p.category === 'Play' && p.id !== 'sirens');
  return `<a class="skip-link" href="#main">Skip to games</a>
    <header class="site-header wrap">
      <a class="brand" href="/" aria-label="Hendrick Research home"><picture><source srcset="/logo.webp" type="image/webp"/><img src="/logo.png" width="1536" height="1024" alt="Hendrick Research" decoding="async" /></picture></a>
      <nav class="desktop-nav" aria-label="Main navigation"><a href="/#projects">Projects</a><a href="/games/" aria-current="page">Games</a><a href="/music/">Music</a><a href="/play/siegeworks/">Sieges</a><a href="/generative-art/">Art</a><a href="/research/">Research</a><a href="/fibers/">Fibers of Earth</a></nav>
      <button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button>
      <nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden><a href="/#projects">Projects</a><a href="/games/" aria-current="page">Games</a><a href="/music/">Music</a><a href="/play/siegeworks/">Sieges</a><a href="/generative-art/">Art</a><a href="/research/">Research</a><a href="/fibers/">Fibers of Earth</a></nav>
    </header>
    <main id="main" class="games-main wrap">
      <div class="section-heading games-heading"><div><p class="eyebrow">HENDRICK RESEARCH / GAMES</p><h1>Worlds to play in.</h1></div><p>Explore, build, survive.<br />Games by Chase Hendrick.</p></div>
      <section class="game-feature" aria-labelledby="sirens-title">
        <a class="game-feature-art" href="/games/after-the-sirens/" aria-label="Play After the Sirens"><img src="/games/after-the-sirens/gameplay.png" width="1520" height="960" alt="After the Sirens, a top-down survival world with houses, roads, vehicles and survivors" fetchpriority="high" /></a>
        <div class="game-feature-copy"><p class="eyebrow">OPEN WORLD SURVIVAL / EARLY BUILD</p><h2 id="sirens-title">After the Sirens</h2><p>A seeded world of towns and wilderness, with 3,455 items to find and craft. Loot buildings, drive cars, mine resources, grow food, recruit allies, and defend your home. Bring a pet along.</p><p class="game-mode-note">Play singleplayer in your browser, or join a world for up to 20 players, hosted locally by you or a friend. Public servers and private invites are available, with game chat, proximity voice and owner commands.</p><div class="tags"><span>Singleplayer</span><span>Self-hosted multiplayer</span><span>Open source</span></div>
          <div class="game-feature-links"><a class="button button-dark" href="/games/after-the-sirens/">Play the game ${next}</a><a class="text-link" href="/after-the-sirens/">Game guide ${next}</a>${external('https://github.com/ChaseHendrick/After-the-Sirens/blob/main/docs/MULTIPLAYER.md', 'Host a world')}${external('https://github.com/ChaseHendrick/After-the-Sirens', 'Source code')}</div>
          <p class="game-footnote">Keyboard and mouse recommended. Music, sound effects and ambience have separate pause-menu controls. Singleplayer saves stay in your browser. Multiplayer needs a running host server.</p>
        </div>
      </section>
      <section aria-labelledby="more-games-title" class="more-games"><div class="section-heading"><div><p class="eyebrow">MORE WORLDS</p><h2 id="more-games-title">Keep exploring.</h2></div></div><div class="games-grid">${otherGames.map(p => `<article class="game-card"><a class="game-card-art" href="${p.launch ?? p.source}"${p.launch ? ' target="_blank" rel="noopener noreferrer"' : ''} aria-label="${p.launch ? 'Play' : 'View source for'} ${p.name}">${artwork(p.id)}</a><p class="eyebrow">${p.eyebrow}</p><h3>${p.name}</h3><p>${p.description}</p><div class="game-card-links">${external(p.launch ?? p.source, p.launch ? 'Play the game' : 'Source & run instructions')}${p.launch ? external(p.source, 'Source', 'subtle-link') : ''}</div></article>`).join('')}</div></section>
    </main>
    <footer class="site-footer wrap"><a class="text-link" href="/">Hendrick Research ${next}</a><div class="footer-links">${external(profile.github, 'GitHub', 'subtle-link')}<a class="subtle-link" href="/#research">Research</a></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Chase Hendrick</span><span>Research. Software. Play.</span></div></footer>`;
}
