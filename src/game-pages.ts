export type GameId = 'fins' | 'tinylaps' | 'sirens' | 'haywire' | 'siegeworks';
export type GamePage = {
  id: GameId;
  title: string;
  eyebrow: string;
  description: string;
  controls: string[];
  input: string;
  keyboardRequired?: boolean;
  route: string;
  htmlFile: string;
  assetPath: string;
  source: string;
  notices: string;
  seoTitle?: string;
  image?: string;
};

export const gamePages: GamePage[] = [
  {
    id: 'siegeworks', title: 'Siegeworks', seoTitle: 'Historical Siege Simulator: Roman Sieges & More | Siegeworks', image: '/sieges/previews/masada.png', eyebrow: 'HISTORICAL SIEGES / LIVING MINIATURES',
    description: 'Explore six playable historical sieges: Masada, Alesia, Jerusalem, Tyre, Constantinople, and Candia. Watch workers build, soldiers patrol, and physical siege engines fire.',
    controls: ['Choose a siege: Roman campaigns at Masada, Alesia, and Jerusalem; the Macedonian causeway at Tyre; or Ottoman approaches at Constantinople and Candia.', 'Construction begins automatically. Use Overview, Works, City, and Camp to get closer. Drag to orbit, scroll or pinch to zoom.', 'Choose Grab & toss to lift workers and soldiers. Release gently to drop, or flick to throw. Shockwave knocks nearby people off balance.', 'Choose 1×, 4×, or 12× time. Space pauses. Advance works completes construction so you can watch the next phase.', 'Open the historical notes for sources and model assumptions. Each siege saves separately in this browser.'],
    input: 'Mouse or touch', route: '/play/siegeworks/', htmlFile: 'play/siegeworks/index.html', assetPath: '/games/siegeworks/index.html',
    source: 'https://github.com/ChaseHendrick/Siegeworks', notices: '/games/siegeworks/LICENSE.txt',
  },

  {
    id: 'fins', title: 'Fin’s', eyebrow: 'A SHOP. A STREET. A RECORD.',
    description: 'Keep an aquarium shop on a street that notices. Feed the fish, tend the water, and meet the people who come through the door.',
    controls: ['Choose Start, then Open the shop. Read the opening story or choose Skip the story.', 'Click the water to feed. Click a fish to read its card.', 'Switch between Tank, Shop, and Map. Open Guide when you need a hand.'],
    input: 'Mouse or touch', route: '/play/fins/', htmlFile: 'play/fins/index.html', assetPath: '/games/fins/index.html',
    source: 'https://github.com/ChaseHendrick/Fins', notices: '/games/fins/LICENSE.txt',
  },
  {
    id: 'tinylaps', title: 'TinyLaps', eyebrow: 'A MINIATURE RACING WORLD',
    description: 'Drive a racer or watch autonomous cars compete through dense city streets. Explore 20 miniature worlds with local traffic, families, crash physics, and god powers.',
    controls: ['Racers start on the streets of Foundry City. Choose among four city street races and 16 island circuits, including Workshop Quarter and Workshop Orchard.', 'Select a racer and choose Drive this car. WASD or arrows steer, accelerate, and brake into reverse; Shift brakes. Touch buttons work together for steering and a pedal.', 'Stop driving hands the car back to AI. Return to road gets a stranded car moving again without repairing damage. Space pauses; 1–4 change the camera.', 'Choose Grab & throw or press G. Pick Cars, People, or Buildings & trees. Hold to lift, release to drop, or flick to throw.', 'Open God Tools for meteors, shockwaves, and terrain powers. Townspeople react. Restart restores the world.'],
    input: 'Keyboard, mouse, or touch', route: '/play/tinylaps/', htmlFile: 'play/tinylaps/index.html', assetPath: '/games/tinylaps/index.html',
    source: 'https://github.com/ChaseHendrick/TinyLaps', notices: '/games/tinylaps/LICENSE.txt',
  },
  {
    id: 'sirens', title: 'After the Sirens', seoTitle: 'Play After the Sirens | Browser Zombie Survival Game', image: '/after-the-sirens/gameplay.png', eyebrow: 'LEAVE MORROW. FOLLOW THE ROAD.',
    description: 'Play an open world zombie survival game in your browser. Scavenge, craft, drive, recruit survivors, and save your progress. Explore 3,455 original items.',
    controls: ['Choose Enter the town to begin. Select singleplayer or a hosted multiplayer world in the menu.', 'WASD or arrow keys move. The mouse aims. E interacts.', 'I opens your pack, crafting and searchable item catalogue. V enters a nearby car. Escape pauses and opens music, sound effects and ambience settings.', 'T opens chat and commands. Type /help for controls. Enable proximity voice in multiplayer, then hold N to talk.'],
    input: 'Keyboard and mouse', keyboardRequired: true, route: '/play/sirens/', htmlFile: 'play/sirens/index.html', assetPath: '/games/after-the-sirens/index.html',
    source: 'https://github.com/ChaseHendrick/After-the-Sirens', notices: '/games/after-the-sirens/LICENSE.txt',
  },
  {
    id: 'haywire', title: 'Haywire', eyebrow: 'A VERY SMALL THING. A FEW BIG IDEAS.',
    description: 'Search a field of physical hay for a hidden needle. Sweep, salvage, and build better tools as the farm changes around you.',
    controls: ['Hold and drag across the hay to sweep.', 'Use the workshop to improve your tools. Click the farm buildings to visit them.', 'Right-drag or Alt-drag rotates the view. Scroll zooms. Touch players can use Rotate.'],
    input: 'Mouse, touch, or keyboard', route: '/play/haywire/', htmlFile: 'play/haywire/index.html', assetPath: '/games/haywire/index.html',
    source: 'https://github.com/ChaseHendrick/Haywire', notices: '/games/haywire/LICENSE.txt',
  },
];

const escapeHTML = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
const diagonal = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.4"/></svg>';
const expand = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" stroke="currentColor" stroke-width="1.3"/></svg>';

/** The playable browser builds are hosted separately from this site’s presentation. */
export function renderGamePage(game: GamePage): string {
  return `<a class="skip-link" href="#play-main">Skip to game</a>
    <header class="play-header wrap"><a class="play-brand" href="/" aria-label="Hendrick Research home"><picture><source srcset="/logo.webp" type="image/webp" /><img src="/logo.png" width="1536" height="1024" alt="Hendrick Research" decoding="async" /></picture></a><nav class="play-nav" aria-label="Main navigation"><a href="/">Home</a><a href="/games/" aria-current="page">Games</a><a href="/music/">Music</a><a href="/cipher-lab/">Cipher Lab</a><a href="/genchase/">GENChase</a></nav></header>
    <main id="play-main" class="wrap"><section class="play-intro" aria-labelledby="play-title"><div><p class="eyebrow">${escapeHTML(game.eyebrow)}</p><h1 id="play-title">${escapeHTML(game.title)}</h1><p class="play-description">${escapeHTML(game.description)}</p><a class="play-jump" href="#game-stage">Play now <span aria-hidden="true">↓</span></a></div><div class="play-intro-note"><span>PLAY IN YOUR BROWSER</span><p>${escapeHTML(game.input)}<br />Progress stays in this browser.</p></div></section>
      <section class="play-stage-section" aria-label="${escapeHTML(`${game.title} playable game`)}"><div class="play-toolbar"><p id="game-load-status" role="status" aria-live="polite">Loading ${escapeHTML(game.title)}…</p><div><button type="button" id="game-dim" aria-pressed="false">Dim surroundings</button><button type="button" id="game-fullscreen">Full screen ${expand}</button><a href="${escapeHTML(game.assetPath)}" target="_blank" rel="noopener">Open in a new tab ${diagonal}</a></div></div><div class="play-stage" id="game-stage"><div class="play-view-bar" id="game-view-bar" hidden><span id="game-dim-hint">Click outside or press Esc to return</span><div><button type="button" id="game-view-fullscreen">Full screen</button><button type="button" id="game-exit-fullscreen" hidden>Exit full screen</button><button type="button" id="game-exit-dim" hidden>Exit dim mode <span aria-hidden="true">×</span></button></div></div><iframe id="game-frame" src="${escapeHTML(game.assetPath)}" title="${escapeHTML(`${game.title}, playable browser game`)}" allow="fullscreen; autoplay; gamepad${game.id === 'sirens' ? '; microphone' : ''}" allowfullscreen></iframe></div><p id="game-load-help" class="play-load-help" hidden>The game is taking a little longer to load. You can open it in a new tab above or <button type="button" id="game-reload">reload the game</button>.</p>${game.keyboardRequired ? '<p class="play-device-note">Designed for keyboard and mouse. Touch play is not supported in this game.</p>' : ''}</section>
      <section class="play-guide" aria-labelledby="play-guide-title"><h2 id="play-guide-title">A few starting points.</h2><ol>${game.controls.map(control => `<li>${escapeHTML(control)}</li>`).join('')}</ol><p>Click inside the game to give it keyboard focus. Choose Dim surroundings to focus on the game. Click outside or press Escape to return. Full screen gives the world more room.</p></section>
${game.id==='sirens' ? '<section class="play-guide"><h2>Surviving after the sirens.</h2><p>Explore the world, learn the controls, and read about crafting, persistent saves, and hosting a multiplayer world.</p><a class="play-jump" href="/after-the-sirens/">Read the After the Sirens game guide ↗</a></section>' : ''}
${game.id==='siegeworks' ? '<section class="play-guide"><h2>The stories behind the works.</h2><p>Read the historical context, engineering focus, sources, and model assumptions for each of the six playable scenes.</p><a class="play-jump" href="/sieges/">Explore the historical siege field guides ↗</a></section>' : ''}
    </main><footer class="play-footer wrap"><a href="/#projects">Explore the other projects</a><div><a href="${escapeHTML(game.source)}" target="_blank" rel="noopener noreferrer">Game source ${diagonal}</a><a href="${escapeHTML(game.notices)}" target="_blank" rel="noopener">License and notices ${diagonal}</a></div></footer>`;
}
