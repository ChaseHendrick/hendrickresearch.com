import { external, next } from './page';
import { profile } from './content';

export const musicPage = {
  route: '/music/',
  title: 'Orograph & MPC Studio: Music Software | Hendrick Research',
  description: 'Play Orograph, a 3D wave terrain synthesizer, in your browser or on the desktop, and make ambient soundscapes for Akai MPC XL with MPC Studio.',
  image: '/music/orograph-social.jpg',
  imageAlt: 'Orograph, a synthesizer you can walk across: a rendered ivory landscape with copper contour lines and an orbit looping past a glowing dot',
  sitemapImages: ['/music/orograph-hero-light.jpg', '/music/orograph-hero-dark.jpg', '/music/mpc-studio.png'],
  schema: { '@graph': [{
    '@type': ['SoftwareApplication', 'WebApplication'],
    name: 'Orograph',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web browser, macOS, Windows, Linux',
    softwareVersion: '2.0.2',
    url: 'https://www.hendrickresearch.com/music/orograph/',
    downloadUrl: 'https://github.com/ChaseHendrick/synth/releases/latest',
    codeRepository: 'https://github.com/ChaseHendrick/synth',
    image: 'https://www.hendrickresearch.com/music/orograph-social.jpg',
    license: 'https://opensource.org/licenses/MIT',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Person', name: 'Chase Hendrick' },
  }, {
    '@type': 'SoftwareApplication',
    name: 'MPC Studio',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'macOS 26 or later on Apple Silicon',
    softwareVersion: '0.1.0',
    downloadUrl: 'https://www.hendrickresearch.com/downloads/MPC-Studio-macOS.zip',
    codeRepository: 'https://github.com/ChaseHendrick/music-field-manual/tree/main/native/MPCStudio',
    screenshot: 'https://www.hendrickresearch.com/music/mpc-studio.png',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Person', name: 'Chase Hendrick' },
  }, {
    '@type': 'WebApplication',
    name: 'MPC Studio Browser',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Windows or macOS with Chrome or Edge',
    browserRequirements: 'Current Chrome or Edge, HTTPS and granted MIDI device access for hardware playback',
    url: 'https://www.hendrickresearch.com/music/studio/',
    codeRepository: 'https://github.com/ChaseHendrick/music-field-manual/tree/main/studio',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Person', name: 'Chase Hendrick' },
  }] },
};

const source = 'https://github.com/ChaseHendrick/music-field-manual/tree/main/native/MPCStudio';
const orographSource = 'https://github.com/ChaseHendrick/synth';
const orographRelease = 'https://github.com/ChaseHendrick/synth/releases/latest';
const orographDownload = (file: string) => `${orographRelease}/download/${file}`;
// Release asset names come from the synth repository's package.json (build.*.artifactName) and its release workflow.
export const orographFiles = [
  ['Orograph-mac-arm64.dmg', 'Mac (Apple Silicon)'],
  ['Orograph-mac-x64.dmg', 'Mac (Intel)'],
  ['Orograph-windows-setup.exe', 'Windows installer'],
  ['Orograph-windows-portable.exe', 'Windows portable'],
  ['Orograph-linux-x86_64.AppImage', 'Linux AppImage'],
  ['Orograph.html', 'Offline, one file'],
] as const;
export const promptIdeas = [
  { label: 'After midnight', text: 'A slow, hazy soundscape in D minor. Warm chords, glassy notes, a quiet pulse, and lots of air.' },
  { label: 'Space for guitar', text: 'Evolving ambient chords with a gentle melody. Keep it spacious and leave room for my Jackson Soloist.' },
  { label: 'A brighter morning', text: 'Soft, luminous major chords, an unhurried bass line, and a few delicate notes that rise and fall.' },
];

export function renderMusic(): string {
  const nav = '<a href="/#projects">Projects</a><a href="/games/">Games</a><a href="/music/" aria-current="page">Music</a><a href="/cipher-lab/">Cipher Lab</a><a href="/play/siegeworks/">Sieges</a><a href="/generative-art/">Art</a><a href="/research/">Research</a><a href="/fibers/">Fibers of Earth</a>';
  return `<a class="skip-link" href="#main">Skip to music</a>
    <header class="site-header wrap">
      <a class="brand" href="/" aria-label="Hendrick Research home"><picture><source srcset="/logo.webp" type="image/webp"/><img src="/logo.png" width="1536" height="1024" alt="Hendrick Research" decoding="async" /></picture></a>
      <nav class="desktop-nav" aria-label="Main navigation"><a href="/">Home</a>${nav}</nav>
      <button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button>
      <nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden><a href="/">Home</a>${nav}</nav>
    </header>
    <main id="main" class="music-main">
      <section class="music-hero wrap" aria-labelledby="music-title">
        <div class="music-hero-copy">
          <a class="music-new" href="#orograph"><span>New</span>Orograph, a synthesizer you can walk across ${next}</a>
          <p class="eyebrow"><span class="tiny-line"></span> HENDRICK RESEARCH / MUSIC</p>
          <h1 id="music-title">Room for<br /><em>something new.</em></h1>
          <p class="music-lead">A thought. A few notes. A soundscape that keeps unfolding.</p>
          <p class="music-description">Describe the feeling, shape a spacious ambient loop, and let your Akai MPC XL bring it to life. A native app for Mac, with a browser studio for Windows.</p>
          <div class="music-actions"><a class="button button-dark" href="/downloads/MPC-Studio-macOS.zip" download>Download for Mac ${next}</a><a class="button music-browser-button" href="/music/studio/">Open Browser Studio ${next}</a>${external(source, 'Explore the source')}</div>
          <p class="music-requirements">Mac app: version 0.1.0 · macOS 26+ · Apple Silicon<br />Windows studio: current Chrome or Edge · HTTPS · MIDI permission</p>
        </div>
        <figure class="music-atmosphere" aria-label="Abstract waves suggesting an evolving ambient soundscape">
          <div class="music-figure-top"><span>STUDY 01</span><span>A LITTLE ROOM TO BREATHE</span></div>
          <svg class="ambient-waves" viewBox="0 0 560 470" fill="none" aria-hidden="true">
            <defs>
              <radialGradient id="ambient-glow"><stop stop-color="#cdaf9b" stop-opacity=".65"/><stop offset="1" stop-color="#cdaf9b" stop-opacity="0"/></radialGradient>
              <linearGradient id="ambient-line" x1="40" y1="235" x2="530" y2="235" gradientUnits="userSpaceOnUse"><stop stop-color="#b9b9a6" stop-opacity=".25"/><stop offset=".48" stop-color="#815c42"/><stop offset="1" stop-color="#b9b9a6" stop-opacity=".25"/></linearGradient>
            </defs>
            <circle cx="290" cy="245" r="200" fill="url(#ambient-glow)"/>
            <g stroke="url(#ambient-line)" stroke-width="1">${Array.from({ length: 26 }, (_, i) => {
              const y = 102 + i * 10;
              const wave = Math.sin(i * .18) * 32;
              return `<path d="M24 ${y} C100 ${y + wave},125 ${y - 70},210 ${y - 21} S320 ${y + 82},395 ${y + 8} S476 ${y - 33},536 ${y + 12}"/>`;
            }).join('')}</g>
            <path d="M24 386H536" stroke="#b9b9a6" stroke-opacity=".4"/>
            <text x="25" y="413" fill="#6c7263" font-size="9" letter-spacing="2">SLOW MOVEMENT</text><text x="426" y="413" fill="#6c7263" font-size="9" letter-spacing="2">OPEN SPACE</text>
          </svg>
          <figcaption><span>Sound, with a little space.</span><span>Made on your Mac. Played by your MPC.</span></figcaption>
        </figure>
      </section>

      <section class="orograph-section" id="orograph" aria-labelledby="orograph-title">
        <div class="wrap">
          <div class="music-section-heading"><div><p class="eyebrow">NEW / OROGRAPH</p><h2 id="orograph-title">A synthesizer<br /><em>you can walk across.</em></h2></div><p>Place the dot. Shape the land. <br />Listen to the ground.</p></div>
          <figure class="orograph-figure">
            <img class="orograph-hero orograph-hero-light" src="/music/orograph-hero-light.jpg" alt="A rendered Orograph landscape in warm ivory tones, with copper contour lines and an orbit looping past a glowing dot" width="1920" height="1080" loading="lazy" decoding="async" />
            <img class="orograph-hero orograph-hero-dark" src="/music/orograph-hero-dark.jpg" alt="A rendered Orograph landscape at night: deep blue hills, pale contour lines and a glowing orange orbit looping past the dot" width="1920" height="1080" loading="lazy" decoding="async" />
            <figcaption><span>Orograph / wave terrain synthesizer</span><span>Swell and Massif terrains, rose orbit · Rendered from Orograph's own terrain data</span></figcaption>
          </figure>
          <div class="orograph-intro">
            <p>Orograph turns landscapes into sound. A closed path circles the dot you place on a 3D map, and the height of the ground under that path becomes the waveform. Move the dot and the tone changes. Grow the orbit and it gets brighter. Blend two terrains, fold the peaks, or let a marble roll downhill and play the valleys it finds.</p>
            <div class="music-actions"><a class="button button-dark" href="/music/orograph/">Play in your browser ${next}</a><a class="button music-browser-button" href="${orographRelease}">Download the desktop app ${next}</a>${external(orographSource, 'Explore the source')}</div>
            <p class="orograph-downloads">Direct downloads: ${orographFiles.map(([file, label]) => `<a href="${orographDownload(file)}">${label}</a>`).join(' · ')}</p>
          </div>
          <div class="music-features">
            <article><span class="music-feature-number">01</span><h3>Place the dot anywhere.</h3><p>Choose from nineteen mathematical terrains and 320 original images at 512 by 512 resolution, then trace one of twenty orbit shapes. Or import an image, wavetable or complete recording. Drag the dot, roll a marble downhill, let it drift or explore, and lock positions to sequencer steps. Window, Mangle and mirroring reshape the path as the sound travels.</p></article>
            <article><span class="music-feature-number">02</span><h3>Shape the sound.</h3><p>Build a voice with up to eight unison copies, two seven-wave subs, eleven morphable partial profiles, phase and ring modulation, and a Karplus-Strong pluck. Four noise colours, synthesized loop textures and imported recordings add air and grit. Three ladder colours, SEM and diode-inspired digital filters shape the result. Forty parameters each have an LFO, a six-stage envelope and four controller slots, with 32-step modulation to keep the sound moving.</p></article>
            <article><span class="music-feature-number">03</span><h3>Make music with it.</h3><p>Layer up to sixteen tracks with patterns, an arpeggiator, four effect slots per track, 27 effects and ten routing layouts. Loop and overdub guitar or vocals, capture a held note as a terrain, then resample a loop into another instrument. Connect an Akai MPC XL over USB-C for pads, Q-Links and shared tempo. Experimental guitar chords need clean input, respond more slowly and can miss quiet or octave-doubled strings; real guitar hardware remains untested.</p></article>
          </div>
          <p class="music-requirements">Browser: current Chrome or Edge for MIDI; sound works in any modern browser. Desktop: macOS, Windows 10 or 11, Linux. Early release without a paid Apple or Microsoft signing certificate, so your computer asks you to confirm the first launch. On a Mac, use System Settings → Privacy &amp; Security → Open Anyway.<br />An independent, clean-room project. Not affiliated with Conductive Labs; Terrain Synth is their trademark. MIT licensed.</p>
        </div>
      </section>

      <section class="music-studio-section" aria-labelledby="studio-title">
        <div class="wrap">
          <div class="music-section-heading"><div><p class="eyebrow">01 / MPC STUDIO</p><h2 id="studio-title">An idea becomes a place<br /><em>you can play in.</em></h2></div><p>Start ambient. Follow the feeling. <br />Bring your guitar if you like.</p></div>
          <figure class="music-window"><img src="/music/mpc-studio.png" alt="MPC Studio running on macOS, with an ambient composition and USB MIDI controls" width="2480" height="1880" loading="lazy" decoding="async" /><figcaption><span>MPC Studio / native macOS app</span><span>Drums · Bass · Chords · Melody</span></figcaption></figure>
          <div class="music-features">
            <article><span class="music-feature-number">01</span><h3>Start with a single sound.</h3><p>Load a pad or instrument on your MPC. The default ambient setup sends the musical parts to one MIDI channel, so you can explore before building a full project.</p></article>
            <article><span class="music-feature-number">02</span><h3>Keep it moving.</h3><p>Loop a soundscape and enable evolving variations. Small changes in the notes and feel make space for listening, improvising, or finding the next idea.</p></article>
            <article><span class="music-feature-number">03</span><h3>Make it yours.</h3><p>Change key, tempo, density and swing. Split the parts across MPC tracks, perform with pads, or export the MIDI and keep shaping the music.</p></article>
          </div>
        </div>
      </section>

      <section class="music-prompts wrap" aria-labelledby="prompts-title">
        <div><p class="eyebrow">02 / A FEW STARTING POINTS</p><h2 id="prompts-title">What does it<br /><em>feel like?</em></h2><p>AI turns your description into a musical plan. The offline engine works from musical rules, your controls and simple prompt keywords. Each route gives you editable notes.</p></div>
        <div class="music-prompt-card"><div class="music-prompt-options" role="group" aria-label="Example music prompts">${promptIdeas.map((idea, i) => `<button type="button" data-prompt="${i}" aria-pressed="${i === 0}">${idea.label}</button>`).join('')}</div><p id="music-prompt-text">${promptIdeas[0].text}</p><span class="music-prompt-note">Try a prompt like this in MPC Studio.</span><div class="music-style-list"><span>Ambient</span><span>Boom bap</span><span>Trap</span><span>House</span><span>Metal / guitar</span></div></div>
      </section>

      <section class="music-engines wrap" aria-labelledby="engines-title">
        <div class="music-section-heading"><div><p class="eyebrow">03 / YOUR CHOICE OF ENGINE</p><h2 id="engines-title">Your Mac.<br /><em>Your musical direction.</em></h2></div><p>Start with the built-in engines. <br />Connect another model when you want to.</p></div>
        <div class="music-engine-grid">
          <article><span class="music-engine-tag">NATIVE MAC APP</span><h3>Apple Intelligence.</h3><p>Use the language model already on your Mac to turn a feeling into a constrained musical plan. No API key is needed. Apple manages the model's compute.</p></article>
          <article><span class="music-engine-tag">MAC & WINDOWS</span><h3>A musical rule engine.</h3><p>Generate on the CPU without a model or generation service. Seeded phrases and chord movement respond to your controls. The native app also recognizes simple directions such as “sparse” or “no drums.”</p></article>
          <article><span class="music-engine-tag">OPTIONAL MODEL SERVER</span><h3>A model you choose.</h3><p>Connect a locally installed model through Ollama or LM Studio, with GPU use configured in that server. MLX is an Apple Silicon option. Or choose a compatible HTTPS cloud endpoint and your own key.</p></article>
        </div>
        <div class="music-compute-note"><span>PLAN → NOTES → SOUND</span><div><p>The Mac app's engines feed one MIDI renderer, with open chord inversions, smooth voice movement and seeded motif development. The Windows browser has its own CPU music engine. CPU code arranges notes and schedules MIDI; your local model server controls GPU offload and memory use. Your MPC supplies the sound.</p><p>These engines design MIDI arrangements, not neural waveform audio. Built-in generation keeps musical directions on your computer. A custom model receives them only when you generate or evolve music with that engine selected.</p></div></div>
      </section>

      <section class="music-setup wrap" id="setup" aria-labelledby="setup-title">
        <div class="music-section-heading"><div><p class="eyebrow">04 / YOUR FIRST SOUNDS</p><h2 id="setup-title">Mac. USB-C. MPC.</h2></div><p>A short setup on the hardware. <br />Then a little room to experiment.</p></div>
        <ol class="music-steps">
          <li><span>01</span><div><h3>Open the app.</h3><p>Download and unzip MPC Studio on an Apple Silicon Mac with macOS 26 or later. It selects on-device AI when Apple's model is ready, or the offline engine otherwise. Check the composer picker before generating.</p><p class="music-first-launch">For AI, enable Apple Intelligence and allow its model to download. This build is locally signed and not notarized. If macOS blocks the first launch, review the app and use System Settings → Privacy & Security → Open Anyway.</p></div></li>
          <li><span>02</span><div><h3>Connect and load a sound.</h3><p>Connect the MPC XL's USB-C computer port with a data cable. Keep it in Standalone mode and load a plugin, keygroup, or drum kit. The app looks for MPC MIDI destinations automatically.</p></div></li>
          <li><span>03</span><div><h3>Give the notes somewhere to go.</h3><p>On the MPC, enable Track for USB MIDI Port 1 in MIDI/Sync. Set your loaded track's MIDI input to that port, channel 1, with In or Merge monitoring. Generate a soundscape, preview it on the Mac, then play it on the MPC.</p></div></li>
        </ol>
        <div class="music-setup-notes"><p>Mac preview uses a General MIDI sound bank. Your MPC plays the sounds you load and route. A USB connection alone does not load an instrument or prepare a track.</p><p>To keep the notes, export MIDI or record incoming MIDI into your prepared MPC track. CC and transport controls need the corresponding MIDI Learn or Receive MMC setup. Leave external MIDI clock off when recording guitar or sampling audio: the MPC manual says audio recording is disabled while receiving MIDI Clock.</p></div>
        <div class="music-setup-links">${external(source.replace('/tree/', '/blob/') + '/README.md', 'Full setup & build instructions')}${external('https://github.com/ChaseHendrick/music-field-manual', 'MPC XL & Jackson field manual')}</div>
        <aside class="music-windows-setup" aria-labelledby="windows-title"><div><p class="eyebrow">ON WINDOWS</p><h3 id="windows-title">Open a studio in your browser.</h3><p>Use current Chrome or Edge on the HTTPS site, connect a supported USB MIDI device, then press Connect and grant MIDI access. Windows must expose the MIDI port; if it does not appear, check Akai's current MPC XL driver in the inMusic Software Center. Load a sound on the MPC and route its MIDI input before playback. Keep the studio tab visible while playing to hardware.</p><p>The browser has its own CPU music engine and synthesized preview. Apple Intelligence and MMC transport are native Mac app features. Optional model connections depend on the server's allowed origins and browser local-network permissions. Real Windows hardware playback still needs validation.</p></div><a class="button music-browser-button" href="/music/studio/">Open Browser Studio ${next}</a></aside>
      </section>

      <section class="music-download wrap" aria-labelledby="download-title"><div><p class="eyebrow">A NEW IDEA, WAITING TO HAPPEN</p><h2 id="download-title">Make a little atmosphere.</h2><p>On your Mac or in a Windows browser. A companion to the instrument you already have.</p></div><div class="music-download-actions"><a class="button button-dark" href="/downloads/MPC-Studio-macOS.zip" download>Download for Mac ${next}</a><a class="text-link" href="/music/studio/">Open Browser Studio ${next}</a></div></section>
      <p class="music-disclosure wrap">Early release. Apple on-device generation and MIDI rendering have been tested on a Mac. Physical MPC playback and optional model-provider connections still need end-to-end validation; protocol fixtures do not establish those results. Locally signed, not notarized. Unofficial software, not affiliated with Akai, inMusic, Jackson or Fender. Source available under the repository's PolyForm Small Business license.</p>
    </main>
    <footer class="site-footer wrap"><a class="text-link" href="/">Hendrick Research ${next}</a><div class="footer-links">${external(profile.github, 'GitHub', 'subtle-link')}<a class="subtle-link" href="/research/">Research</a></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Chase Hendrick</span><span>Research. Software. Music.</span></div></footer>`;
}
