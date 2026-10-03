import papersData from './papers-data.json';
// Edit this file to add projects, papers, and links. Everything here is public.
export type Project = {
  id: string; name: string; category: 'Research' | 'Tools' | 'Play';
  eyebrow: string; description: string; detail: string;
  tags: string[]; source: string; launch?: string; launchLabel?: string; privateWorkspace?: boolean;
};

export const profile = {
  name: 'Chase Hendrick',
  github: 'https://github.com/ChaseHendrick',
  orcid: 'https://orcid.org/0009-0002-9754-6087',
};

export const projects: Project[] = [
  {
    id: 'genchase', name: 'GENChase', category: 'Research', eyebrow: 'A studio for scientific exploration',
    description: 'A private research workspace. A public guide to its methods and experiments.',
    detail: 'GENChase is a private research and development workspace. Its public catalog maps the techniques, studio tabs, and implementation families without publishing the research code. Explore the collection by topic and see how the different studies connect.',
    tags: ['Scientific computing', 'Generative art'],
    source: '',
    launch: '/genchase/', launchLabel: 'Explore the techniques', privateWorkspace: true,
  },

  {
    id: 'siegeworks', name: 'Siegeworks', category: 'Play', eyebrow: 'History in miniature',
    description: 'Six living siege worlds, from Roman ramps and defenses to causeways and cannon.',
    detail: 'Watch workers haul supplies, build siege works, and prepare an approach in Masada, Alesia, Jerusalem, Tyre, Constantinople, and Candia. Pick up and toss workers and soldiers, inspect their jobs, or follow the engines. These original procedural miniatures include historical sources and clearly stated reconstruction limits.',
    tags: ['History', 'Physics', 'Simulation'], source: 'https://github.com/ChaseHendrick/Siegeworks',
    launch: '/play/siegeworks/', launchLabel: 'Explore the sieges',
  },

  {
    id: 'sirens', name: 'After the Sirens', category: 'Play', eyebrow: 'An open world to explore',
    description: 'An offline survival world with driving, buildings, survivors, and crafting.',
    detail: 'An offline open world survival game with driving, buildings, survivors, and crafting. Explore the live browser game or inspect how the world is built in the public source.',
    tags: ['Survival', 'Open world'], source: 'https://github.com/ChaseHendrick/After-the-Sirens',
    launch: '/games/after-the-sirens/', launchLabel: 'Play the game',
  },

  {
    id: 'fibers', name: 'Fibers of Earth', category: 'Research', eyebrow: 'Material stories',
    description: 'An independent atlas of textile materials, their histories, and their science.',
    detail: 'An independent atlas exploring textile materials through their histories and science. A collection built around the connections between natural materials, human craft, and technical knowledge.',
    tags: ['Materials', 'Digital atlas'], source: 'https://github.com/ChaseHendrick/FibersOfEarth',
    launch: '/fibers/', launchLabel: 'Explore the atlas',
  },

  {
    id: 'pagearm', name: 'PageArm', category: 'Tools', eyebrow: 'The browser, reimagined',
    description: 'A runtime for editing and updating scripts in the pages you already use.',
    detail: 'PageArm brings editable scripts into the browser pages you already use. Visit the repository for installation instructions, supported workflows, and the current release.',
    tags: ['Browser tooling', 'Page scripting'], source: 'https://github.com/ChaseHendrick/PageArm',
  },

  {
    id: 'savedesk', name: 'SaveDesk', category: 'Tools', eyebrow: 'A home for what you save',
    description: 'Organize and rediscover your X likes and bookmarks in a searchable library.',
    detail: 'An import-first library for X likes and bookmarks. Organize a collection, search saved items, and return to the things you meant to read. Explore the live site and see the repository for import formats and account features.',
    tags: ['Reading library', 'Personal tools'], source: 'https://github.com/ChaseHendrick/SaveDesk',
    launch: 'https://chasehendrick.github.io/SaveDesk/', launchLabel: 'Explore the site',
  },

  {
    id: 'fins', name: 'Fin\u2019s', category: 'Play', eyebrow: 'Small worlds, living systems',
    description: 'An aquarium shop simulation with a neighborhood that keeps changing.',
    detail: 'An aquarium shop simulation whose fish, customers, and neighborhood keep changing while you are away. A playful experiment in building a persistent little world with AI-assisted coding.',
    tags: ['Simulation game', 'Living worlds'], source: 'https://github.com/ChaseHendrick/Fins',
    launch: '/play/fins/', launchLabel: 'Play the game',
  },

  {
    id: 'thermalpilot', name: 'ThermalPilot', category: 'Tools', eyebrow: 'Understand your machine',
    description: 'Native macOS fan control, live telemetry, and experimental power tuning.',
    detail: 'A native macOS utility for fan control and live system telemetry, with experimental power tuning. The repository documents compatibility, installation, and the limits of the available controls.',
    tags: ['macOS', 'System telemetry'], source: 'https://github.com/ChaseHendrick/ThermalPilot',
  },

  {
    id: 'tinylaps', name: 'TinyLaps', category: 'Play', eyebrow: 'A miniature racing world',
    description: 'Explore 20 miniature worlds with AI rivals, dense city streets, local traffic, flowing water, crash damage, and god powers.',
    detail: 'Take the wheel of any racer or watch autonomous drivers compete through a miniature world with crash damage, destructible terrain, and god powers.',
    tags: ['Racing', 'Simulation'], source: 'https://github.com/ChaseHendrick/TinyLaps',
    launch: '/play/tinylaps/', launchLabel: 'Play the game',
  },

  {
    id: 'haywire', name: 'Haywire', category: 'Play', eyebrow: 'Find the unexpected',
    description: 'A 3D needle-hunting game with physical hay, interactive farms, and a changing sky.',
    detail: 'A 3D needle-hunting game built around physical hay, interactive farms, and a changing sky. The public repository contains the source and current run instructions.',
    tags: ['3D', 'Exploration'], source: 'https://github.com/ChaseHendrick/Haywire',
    launch: '/play/haywire/', launchLabel: 'Play the game',
  },

];

export type Paper = {
  id: string; title: string; category: string; summary: string;
  doi: string; source: string; pdf: string;
};
// Generated from GENChase's papers/papers.json by scripts/sync-papers.mjs (run before every build).
export const papers: Paper[] = papersData;
