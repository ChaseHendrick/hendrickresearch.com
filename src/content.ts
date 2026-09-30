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
    detail: 'GENChase is my private research and development workspace. Its public catalog maps the techniques, studio tabs, and implementation families without publishing the research code. Explore the collection by topic and see how the different studies connect.',
    tags: ['Scientific computing', 'Generative art'],
    source: '',
    launch: '/genchase/', launchLabel: 'Explore the techniques', privateWorkspace: true,
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
    id: 'fins', name: 'Fin’s', category: 'Play', eyebrow: 'Small worlds, living systems',
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
    id: 'fibers', name: 'Fibers of Earth', category: 'Research', eyebrow: 'Material stories',
    description: 'An independent atlas of textile materials, their histories, and their science.',
    detail: 'An independent atlas exploring textile materials through their histories and science. A collection built around the connections between natural materials, human craft, and technical knowledge.',
    tags: ['Materials', 'Digital atlas'], source: 'https://github.com/ChaseHendrick/FibersOfEarth',
    launch: '/fibers/', launchLabel: 'Explore the atlas',
  },
  {
    id: 'tinylaps', name: 'TinyLaps', category: 'Play', eyebrow: 'A miniature racing world',
    description: 'Autonomous drivers, crash damage, destructible terrain, and god powers.',
    detail: 'A miniature racing world with autonomous drivers, crash damage, destructible terrain, and god powers. Open the live game to explore the system in motion.',
    tags: ['Racing', 'Simulation'], source: 'https://github.com/ChaseHendrick/TinyLaps',
    launch: '/play/tinylaps/', launchLabel: 'Play the game',
  },
  {
    id: 'sirens', name: 'After the Sirens', category: 'Play', eyebrow: 'An open world to explore',
    description: 'An offline survival world with driving, buildings, survivors, and crafting.',
    detail: 'An offline open world survival game with driving, buildings, survivors, and crafting. Explore the live browser game or inspect how the world is built in the public source.',
    tags: ['Survival', 'Open world'], source: 'https://github.com/ChaseHendrick/After-the-Sirens',
    launch: '/games/after-the-sirens/', launchLabel: 'Play the game',
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
const paper = (id: string, title: string, category: string, summary: string, doi: string, filename = id): Paper => ({
  id, title, category, summary,
  doi: `https://doi.org/10.5281/zenodo.${doi}`,
  source: `https://github.com/ChaseHendrick/${id}`,
  pdf: `https://raw.githubusercontent.com/ChaseHendrick/${id}/main/paper/${filename}.pdf`,
});

export const papers: Paper[] = [
  paper('minimal-winding', 'Minimal Winding in the Self-Similar Collapse of Point Vortices', 'Fluid dynamics', 'Sharp winding bounds and computer-assisted results for collapsing vortex configurations.', '23050561'),
  paper('collapse-without-rotation', 'Point-Vortex Collapse Without Rotation: A Cluster Mechanism, a Phase Diagram and a Continuum Limit', 'Fluid dynamics', 'Cluster mechanisms and numerical phase diagrams for vortex collapse without rotation.', '23050575'),
  paper('stable-expansion', 'Stable Self-Similar Expansion of Four and Five Point Vortices and Confinement of Vortex Patches', 'Fluid dynamics', 'Computer-assisted configurations, nonlinear stability, and confinement estimates.', '23050580'),
  paper('rank-window', 'A Finite Rank Window Cannot Show That a Neural Population Code Satisfies the Eigenspectrum Smoothness Bound', 'Neuroscience', 'The limits of inferring asymptotic smoothness from finite neural eigenspectra.', '23050586', 'note'),
  paper('hh-dynamics', 'Hopf Bifurcations and Bistability in the Hodgkin-Huxley Equations at the 1952 Parameters: Computer-Assisted Proofs', 'Neuroscience', 'Computer-assisted analysis of equilibrium stability and bistability in the classical model.', '23050587'),
  paper('double-pendulum', 'Chaos and Analytic Non-Integrability of the Classical Double Pendulum: A Computer-Assisted Proof', 'Dynamical systems', 'Interval arithmetic proofs for chaotic dynamics at specified energies.', '23050590'),
  paper('nf-pulse', 'Traveling Pulses in a Neural Field with a Smooth Firing Rate: Computer-Assisted Existence and Spectral Stability', 'Neuroscience', 'Computer-assisted pulse existence and spectral stability in neural field models.', '23050600'),
  paper('hh-pulse', 'The Propagated Action Potential of Hodgkin and Huxley at Their 1952 Constants: A Computer-Assisted Existence Proof', 'Neuroscience', 'A computer-assisted existence proof for the propagated action potential at two temperatures.', '23050604'),
];
