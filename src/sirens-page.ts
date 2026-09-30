import type { ContentPage } from './content-pages';

export const sirensPage: ContentPage = {
  route: '/after-the-sirens/',
  title: 'After the Sirens: Open World Zombie Survival Game',
  description: 'Play After the Sirens, a free browser zombie survival game. Explore a seeded world, scavenge, craft, drive, build a home, and save your singleplayer progress.',
  image: '/after-the-sirens/gameplay.png',
  body: `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/games/">Browser games</a><span aria-hidden="true">/</span><span>After the Sirens</span></nav>
    <section class="editorial-hero"><p class="eyebrow">ZOMBIE SURVIVAL / OPEN WORLD / VERSION 0.5</p><h1>After the Sirens.<br /><em>A world to survive in.</em></h1><p class="editorial-intro">An original, free browser zombie survival game. Leave Morrow, follow the roads, scavenge buildings, drive cars, and find a place to stay. Explore on your own, recruit survivors, or join a world hosted by a friend.</p><div class="editorial-actions"><a class="editorial-link" href="/play/sirens/">Play After the Sirens <span aria-hidden="true">↗</span></a><a class="editorial-link" href="https://github.com/ChaseHendrick/After-the-Sirens">Explore the source code <span aria-hidden="true">↗</span></a></div></section>
    <figure class="method-feature siege-guide-feature"><img src="/after-the-sirens/gameplay.png" width="1520" height="960" alt="After the Sirens gameplay: a top-down survivor among houses, roads, cars, and undead in Morrow" fetchpriority="high" decoding="async"/><figcaption>Original procedural world and artwork · Early playable build</figcaption></figure>
    <section class="editorial-section"><h2>Scavenge, craft, and keep moving.</h2><p class="section-intro">Search houses and businesses for food, water, medicine, tools, clothing, and weapons. The searchable catalogue contains 3,455 original items and 4,457 crafting and salvage recipes. Item entries explain acquisition paths; browsing the catalogue does not give you free supplies.</p><p class="section-intro">Hunger, thirst, stamina, fatigue, bleeding, infection, and equipment shape your decisions. Craft at stations, improve your skills, grow food, share settlement supplies, and put up simple defenses. Buildings have accessible upper floors, while doors, windows, and walls can be damaged.</p></section>
    <section class="editorial-section"><h2>A seeded world of towns and wilderness.</h2><p class="section-intro">Travel through farms, forests, riverside settlements, suburbs, and industrial districts. Enter a world seed to reproduce the same starting landscape, or continue a saved run with your changes intact. The game streams nearby regions and keeps a bounded record of visited places.</p><p class="section-intro">Drive, reverse, refuel, and repair your plans after a collision. Survivors can trade, follow you, work, and fight nearby threats. Raiders, undead, weather, and the day-night cycle make the roads less predictable. Choose Open world for free survival or Rescue mission for the original radio-repair scenario.</p></section>
    <section class="editorial-section"><h2>Play solo, or host a world with friends.</h2><p class="section-intro">Singleplayer runs directly in your desktop browser, with no installation or account. It autosaves every five seconds during play and on page exit. Continue restores your run; export and import let you keep a portable copy. Browser saves stay on this site in the same browser.</p><p class="section-intro">Multiplayer supports up to 20 connected players on a world server run by you or a friend. Hosts can provide private invites or list a public world. Shared worlds include text chat and optional proximity voice. The website serves the game; multiplayer needs a running, reachable host. The initial server list is empty until real hosts are submitted.</p><p class="editorial-note">Version 0.5 is an early playable release. Multiplayer currently shares one loaded region and the ground floor. Chrome is tested; keyboard and mouse are required. The source repository documents the current limits and hosting setup.</p><a class="editorial-link" href="https://github.com/ChaseHendrick/After-the-Sirens/blob/main/docs/MULTIPLAYER.md">Read the multiplayer hosting guide <span aria-hidden="true">↗</span></a></section>
    <section class="editorial-section"><h2>Getting started.</h2><p class="section-intro">Choose Enter the town, then Singleplayer. WASD or arrow keys move; the mouse aims. Press E to interact, I for your pack, crafting, and catalogue, J for the journal, and V to enter a nearby car. Escape pauses and opens separate music, sound effects, and ambience settings.</p><p class="section-intro">Prefer to watch first? AI play uses a small local adaptive steering controller and rule-based actions to guide a survivor. It runs in the browser without an external AI service. Manual movement or combat returns control to you.</p><div class="editorial-actions"><a class="editorial-link" href="/play/sirens/">Start a survival run <span aria-hidden="true">↗</span></a><a class="editorial-link" href="/games/">Explore more browser games <span aria-hidden="true">↗</span></a><a class="editorial-link" href="https://github.com/ChaseHendrick/After-the-Sirens/blob/main/docs/ITEMS.md">Read the item guide <span aria-hidden="true">↗</span></a></div></section>`,
  schema: {
    '@type': 'WebPage',
    mainEntity: {
      '@type': ['VideoGame', 'WebApplication'],
      name: 'After the Sirens',
      url: 'https://www.hendrickresearch.com/play/sirens/',
      image: 'https://www.hendrickresearch.com/after-the-sirens/gameplay.png',
      description: 'An original open world zombie survival game with scavenging, crafting, vehicles, survivors, persistent singleplayer saves, and self-hosted multiplayer.',
      genre: ['Zombie survival', 'Open world', 'Sandbox'],
      playMode: ['SinglePlayer', 'MultiPlayer'],
      applicationCategory: 'GameApplication',
      operatingSystem: 'Desktop web browser',
      softwareVersion: '0.5',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      codeRepository: 'https://github.com/ChaseHendrick/After-the-Sirens',
    },
  },
};
