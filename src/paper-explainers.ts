// Plain-language explainers for the published preprints. Each entry is keyed by the paper id in
// src/papers-data.json; the abstracts, numbers and status labels follow each paper's own README and
// manuscript at the commit recorded in src/paper-data.json. Keep claims inside what the paper proves.

export type Label = 'Computer-assisted proof' | 'Proved' | 'Numerical' | 'Not claimed';
export type Explainer = {
  id: string;
  searchName: string;
  question: string;
  plain: { what: string; found: string; why: string; limits: string };
  terms: { term: string; meaning: string }[];
  results: { label: Label; text: string }[];
  numbers: { label: string; value: string; note?: string }[];
  faq: { q: string; a: string }[];
  module?: 'vortex' | 'pendulum' | 'hh-neuron' | 'hh-shoot' | 'neural-field' | 'rank-window' | 'ring';
  moduleIntro?: string;
};

const pointVortex = { term: 'Point vortex', meaning: 'An idealized swirl concentrated at a single point. The fluid circulates around it, and every vortex is carried along by the flow the others make.' };
const circulation = { term: 'Circulation', meaning: 'The strength of a vortex. Its sign says which way it spins.' };
const winding = { term: 'Winding P', meaning: 'How tightly a collapsing group spirals: the angle, in radians, that the group turns while the square of its size shrinks by the factor e (about 2.72).' };
const cap = { term: 'Computer-assisted proof', meaning: 'A written proof in which a finite list of inequalities is checked by a program using interval or ball arithmetic, which carries rigorous error bounds through every operation, so rounding cannot change the answer.' };

export const explainers: Explainer[] = [
  {
    id: 'minimal-winding',
    searchName: 'Point Vortex Collapse: How Little Can Vortices Spiral',
    question: 'When a group of point vortices crashes into a single point, how little can it turn on the way in?',
    plain: {
      what: 'In an ideal fluid, a few point vortices with the right strengths and positions can all fall into one point at the same moment, keeping their shape the whole way. Each vortex then moves on a logarithmic spiral. The paper measures how tightly the group spirals with one number, P.',
      found: 'For three vortices, P is always larger than the square root of 3 divided by 2, about 0.866, and no smaller constant works: some collapses come as close to it as you like. It follows that every vortex travels more than twice its starting distance from the collision point. With four, five and six vortices the bound fails; the paper proves collapses whose winding has local minima 0.7979, 0.7448 and 0.7137. In two modified models it proves collapses that do not turn at all, with 11 and with 60 vortices.',
      why: 'Collapse is one of the few exact ways an ideal two-dimensional flow can concentrate into a point in finite time. A sharp limit on how such a collapse must spiral tells you what these singular events can and cannot look like.',
      limits: 'A preprint, not peer reviewed. Everything is about the point-vortex model, an idealization of a real fluid. Results for seven or more ordinary vortices are numerical, not proved.',
    },
    terms: [pointVortex, circulation, winding, { term: 'Self-similar collapse', meaning: 'A motion in which the vortices keep their shape while the whole picture shrinks and turns, reaching a single point at a finite time.' }, { term: 'Alpha models and SQG', meaning: 'Variants in which a vortex pushes its neighbours with a force that falls off faster with distance. The surface quasi-geostrophic model (SQG), used for atmosphere and ocean surfaces, is the case alpha = 1.' }, cap],
    results: [
      { label: 'Proved', text: 'Every self-similar collapse of three point vortices has P above the square root of 3 over 2, and the constant is sharp. In the alpha models the sharp bound is the square root of (3 + alpha) over (2 + alpha).' },
      { label: 'Proved', text: 'Closed forms for two concentric regular polygons, with or without a central vortex, whose minimum exceeds the three-vortex constant; and the same bound for a strong vortex with weak, tight pairs of opposite sign.' },
      { label: 'Computer-assisted proof', text: 'Four, five and six Euler vortices collapse with P below the three-vortex bound, with strict local minima 0.7978967838, 0.7448144569 and 0.7136801485.' },
      { label: 'Computer-assisted proof', text: 'Eleven vortices in the alpha = 2 model and sixty in the SQG model collapse without rotating at all.' },
      { label: 'Numerical', text: 'Sixty-one Euler vortices reach P = 0.498.' },
    ],
    numbers: [
      { label: 'Three-vortex bound', value: '0.8660254…', note: 'square root of 3 over 2' },
      { label: 'Four vortices, local minimum', value: '0.7978967838…' },
      { label: 'Sixty-one vortices', value: '0.498…', note: 'numerical' },
    ],
    faq: [
      { q: 'Is this about real tornadoes or hurricanes?', a: 'No. Point vortices are a mathematical idealization of swirls in a perfect two-dimensional fluid. They are used to understand how vorticity can concentrate, not to forecast storms.' },
      { q: 'Why does the square root of 3 over 2 matter?', a: 'It is the least winding any collapse of three vortices can have. It also turns out to be the limit for a strong vortex carrying weak tight pairs, and the sequel paper shows it is a limit, not a bound, when more weak vortices are added.' },
      { q: 'What does computer-assisted mean here?', a: 'The existence of each four-, five- and six-vortex collapse is reduced to finitely many inequalities, which a program checks in ball arithmetic at 320 bits, so the conclusion does not depend on rounding.' },
    ],
    module: 'vortex',
    moduleIntro: 'These are the stored collapses from the paper, run live by the Biot-Savart law in your browser. Each vortex is drawn with its trail; the readout measures the winding as the group shrinks, and should agree with the paper\'s value until the vortices get so close that the integrator stops.',
  },
  {
    id: 'collapse-without-rotation',
    searchName: 'Point Vortex Collapse Without Rotation: Phase Diagram',
    question: 'Can a group of vortices collapse to a point without spinning on the way in?',
    plain: {
      what: 'This is the sequel to the minimal-winding paper. That paper found that three ordinary vortices always turn by at least about 0.866 radians as they collapse, and that in some modified models large groups can collapse without turning at all. This paper asks where the line falls between turning and not turning.',
      found: 'For ordinary vortices, a strong vortex carrying any number of weak, tight clusters still turns by about 0.866 or more as the clusters weaken, so no such group collapses without turning. A weak triple beside a strong vortex dips just below 0.866, so that number is a limit, not a floor. In the modified models the paper maps, numerically, the fewest vortices that can collapse without turning: 5, 6, 8, 11, 17, 29 and 60 as the model gets closer to an ordinary fluid. Fits suggest an ordinary fluid would need infinitely many. It also finds a continuum limit, a vortex sheet between two point vortices, with winding 0.47736.',
      why: 'Whether a fluid can concentrate vorticity without rotating is a question about the shape of possible singularities. The phase diagram turns a yes-or-no question into a map with a measurable edge.',
      limits: 'A preprint, not peer reviewed. The phase diagram, the stability of the families and the continuum limit are numerical. The two collapses without rotation are numerically unstable, with 8 and 57 unstable modes.',
    },
    terms: [pointVortex, circulation, winding, { term: 'Alpha', meaning: 'How fast a vortex\'s push falls off with distance. Alpha = 0 is an ordinary fluid; larger alpha means a shorter reach.' }, { term: 'Vortex sheet', meaning: 'Vorticity spread along a curve instead of concentrated at points.' }],
    results: [
      { label: 'Proved', text: 'A strong Euler vortex with weak tight clusters of any sizes and signs has P at least the square root of 3 over 2 minus a vanishing amount; no such configuration collapses without rotation, whatever the number of vortices.' },
      { label: 'Proved', text: 'A weak triple of signs (+, +, -) beside a positive strong vortex gives collapses with P below the square root of 3 over 2, so the constant is a limit, not a bound at fixed strength. No self-similar collapse with nonzero total circulation is mirror symmetric.' },
      { label: 'Numerical', text: 'The least number of vortices that can collapse without rotation is 5, 6, 8, 11, 17, 29 and 60 for alpha = 6, 4, 3, 2, 1.5, 1.2 and 1; fitted thresholds give a positive limit between 0.66 and 0.80.' },
      { label: 'Numerical', text: 'The Euler minimizers approach a continuum of two point vortices and a vortex sheet, with a minimum winding of 0.47736353369…' },
    ],
    numbers: [
      { label: 'SQG (alpha = 1)', value: '60 vortices', note: 'fewest found that collapse without rotating' },
      { label: 'Continuum winding', value: '0.47736353369…', note: 'numerical' },
      { label: 'Fitted threshold limit', value: '0.66 to 0.80' },
    ],
    faq: [
      { q: 'Why can\'t ordinary vortices collapse without turning?', a: 'In the regime the paper can prove, a weak vortex next to a strong one is forced into a turning motion, and the turning grows as the weak vortices weaken. The phase diagram suggests the same for any finite number, but that part is numerical.' },
      { q: 'What is the continuum limit?', a: 'As the number of vortices grows, the best collapses look more and more like a smooth sheet of vorticity between two point vortices. Its winding, about 0.477, appears to be the bottom of the range.' },
    ],
    module: 'vortex',
    moduleIntro: 'The two certified collapses without rotation, run live: 11 vortices in the alpha = 2 model and 60 in SQG. Compare their readout with the ordinary 61-vortex collapse, which turns. Because these collapses are unstable, rounding eventually pulls the live run away from the exact motion.',
  },
  {
    id: 'stable-expansion',
    searchName: 'Stable Self-Similar Expansion of Four and Five Point Vortices',
    question: 'Can four or five vortices spread apart in a way that small disturbances do not wreck?',
    plain: {
      what: 'Run a vortex collapse backwards and the group expands, keeping its shape while it grows like the square root of time. For three vortices these expansions are stable, and Zbarsky used that to prove that small blobs of real vorticity placed at the vortices stay confined forever. He expected the same for four or more vortices if a stable enough example existed.',
      found: 'The paper gives such examples, one with four vortices and one with five. A computer-assisted proof shows that, apart from the motions forced by symmetry, every disturbance decays. The stability is then proved for the full nonlinear motion, and Zbarsky\'s confinement theorem is carried over: vortex patches placed at these vortices stay close to their centres for all time.',
      why: 'Confinement results are among the few long-time statements that can be proved about real two-dimensional fluids. Each new stable configuration extends them to new arrangements.',
      limits: 'A preprint, not peer reviewed. The direct integrations and the random sample of how common stable expansions are (52 of 342 four-vortex and 32 of 543 five-vortex cases) are numerical.',
    },
    terms: [pointVortex, circulation, { term: 'Self-similar expansion', meaning: 'A motion that keeps its shape while growing like the square root of time and turning.' }, { term: 'Linear stability', meaning: 'Every small disturbance, except those that only move along the family of solutions, shrinks over time.' }, { term: 'Vortex patch', meaning: 'A region of uniform vorticity with a sharp edge: a more realistic stand-in for a point vortex.' }, cap],
    results: [
      { label: 'Computer-assisted proof', text: 'Four vortices with circulations (-1, -5/2, -1/9, 4/5) and five with (-1, 3/7, 7/8, -9/7, -47/35) expand self-similarly with every non-forced eigenvalue of real part -1 or -2.' },
      { label: 'Proved', text: 'The stability is nonlinear: a nearby motion stays close to an exactly self-similar expansion of a nearby member of the family, the one with the same energy.' },
      { label: 'Proved', text: 'Zbarsky\'s confinement theorem holds for these two configurations: vortex patches stay within epsilon times t to the power 1/4 + epsilon of their centres of vorticity for all time.' },
      { label: 'Numerical', text: 'In a naive random search, 52 of 342 converged four-vortex collapses and 32 of 543 five-vortex collapses reverse into linearly stable expansions.' },
    ],
    numbers: [
      { label: 'Eigenvalue real parts', value: '-1 or -2', note: 'besides the double eigenvalue 0' },
      { label: 'Stable share, four vortices', value: '52 of 342' },
      { label: 'Stable share, five vortices', value: '32 of 543' },
    ],
    faq: [
      { q: 'Why run a collapse backwards?', a: 'The equations of point vortices can be run in either direction in time. A collapse reversed is an expansion, and the question is whether that expansion survives small disturbances.' },
      { q: 'What does the demonstration below show?', a: 'It runs the stored starting points of the stable four- and five-vortex examples and of two unstable controls. Nudge any of them: the stable ones keep their shape, the unstable ones drift away from it.' },
    ],
    module: 'vortex',
    moduleIntro: 'The stored starting points of the certified stable examples and of two unstable controls from the paper\'s data, run live. Press Nudge to push every vortex a little; the shape error measures how far the group is from its own self-similar shape, after removing size and rotation.',
  },
  {
    id: 'rank-window',
    searchName: 'Neural Population Code Eigenspectrum: What a Rank Window Can Show',
    question: 'Can a fitted slope over a finite range of ranks show how smooth a brain\'s code is?',
    plain: {
      what: 'Stringer and colleagues (Nature, 2019) recorded thousands of neurons in mouse visual cortex responding to images. The variance of the response along its n-th principal direction fell roughly like a power of n. They noted that a code that maps the stimulus space smoothly must have its spectrum fall at least as fast as n to the power -(1 + 2/d) asymptotically, and concluded the code is about as high-dimensional as smoothness allows.',
      found: 'An asymptotic rate cannot be read off a finite window of ranks, and this note makes that quantitative for these stimulus sets. Codes built exactly at the border of differentiability give window exponents anywhere from 0.255 to 1.628 at d = 8, below and above the bound, depending on their tuning width; codes that are not differentiable can also exceed the bound. The reported exponents are consistent with the bound but cannot show that the code satisfies it.',
      why: 'Eigenspectrum exponents are now a common way to compare neural codes and artificial networks. Knowing what a window fit can and cannot say keeps those comparisons honest.',
      limits: 'A preprint, not peer reviewed. Apart from Proposition 1 and its corollary, everything is numerical, in double precision. No exponent fitted to any recording enters the note.',
    },
    terms: [{ term: 'Eigenspectrum', meaning: 'The variances of a population\'s responses along its principal directions, ranked from largest to smallest.' }, { term: 'Power-law exponent', meaning: 'The slope of the spectrum on a log-log plot. A steeper slope means the response is concentrated in fewer dimensions.' }, { term: 'Rank window', meaning: 'The range of ranks, such as 11 to 500, over which the slope is fitted.' }, { term: 'Matern tuning', meaning: 'A family of model neurons whose smoothness is set by one number, nu, so codes at a known smoothness can be built and tested.' }],
    results: [
      { label: 'Proved', text: 'For codes on bounded eigenfunctions, the head of the spectrum fixes the finite-sample spectrum up to a constant times the variance of the tail, whatever the tail\'s rate; so no estimator continuous in that spectrum can tell a continuously differentiable code from one with infinite expected squared gradient.' },
      { label: 'Numerical', text: 'Codes exactly at the differentiability border give ranks 11 to 500 exponents from 0.255 to 1.628 at d = 8 and from 0.625 to 1.762 at d = 4.' },
      { label: 'Numerical', text: 'For 32 grating directions a non-differentiable code reaches 3.5012 over ranks 5 to 30, above the d = 1 bound of 3.' },
      { label: 'Numerical', text: 'The eigenmoment method\'s tail exponent depends on the unresolved tail: spectra sharing a broken power law up to rank 500 give tail exponents from 1.138 to 1.394.' },
    ],
    numbers: [
      { label: 'd = 8 bound', value: '1.25', note: 'reported 1.49' },
      { label: 'd = 4 bound', value: '1.5', note: 'reported 1.65' },
      { label: 'd = 1 bound', value: '3', note: 'reported 3.43' },
    ],
    faq: [
      { q: 'Does this say the 2019 result is wrong?', a: 'No. Their exponents are consistent with the smoothness bound. The note shows that a fit over a finite window cannot confirm that the code satisfies the bound or sits close to it.' },
      { q: 'What does the toy below show?', a: 'A made-up spectrum whose slope changes at a break rank. Fit a window that ends before the break and you measure the head; the tail, which decides smoothness, can be anything. It is an illustration of the argument, not data.' },
    ],
    module: 'rank-window',
    moduleIntro: 'An illustration, not data: a spectrum with one slope up to a break rank and another after it. Move the fitting window and the break, and compare the fitted exponent with the true tail exponent, which is what smoothness depends on.',
  },
  {
    id: 'hh-dynamics',
    searchName: 'Hodgkin-Huxley Model: Hopf Bifurcations and Bistability Proved',
    question: 'Exactly where does the classic model neuron start and stop firing?',
    plain: {
      what: 'Hodgkin and Huxley\'s 1952 equations describe how sodium and potassium currents make the squid giant axon fire. Feed the membrane a steady current J: at low current it rests, above a threshold it fires a regular train of spikes, and at very high current it stops again. These transitions were known from computer simulations.',
      found: 'The paper proves them, with Hodgkin and Huxley\'s own constants. For every current from 0 to 200 microamperes per square centimetre there is exactly one resting state. It is stable below 9.7754 and above 154.5224, and unstable in between, with the boundaries pinned to 12 decimal places. The lower transition is subcritical and the upper supercritical. At J = 8 the membrane is bistable: resting and firing a spike every 16.01 ms are both stable, so a brief kick can switch it from one to the other.',
      why: 'The Hodgkin-Huxley model is the foundation of computational neuroscience, and much of what is taught about it rests on simulation. Proving its basic bifurcations removes any doubt that they are artifacts of numerics.',
      limits: 'A preprint, not peer reviewed. Nothing is claimed about the basins of attraction or about other attractors. The bistability is proved at J = 8; the demo below simulates other currents without proof.',
    },
    terms: [{ term: 'Equilibrium', meaning: 'A resting state where all currents balance.' }, { term: 'Hopf bifurcation', meaning: 'The point where a resting state loses stability and an oscillation is born or dies.' }, { term: 'Subcritical and supercritical', meaning: 'Whether the oscillation appears abruptly, with a jump to large spikes (subcritical), or grows smoothly from zero (supercritical).' }, { term: 'Bistable', meaning: 'Two different stable behaviours exist at the same input; which one you see depends on history.' }, cap],
    results: [
      { label: 'Computer-assisted proof', text: 'Exactly one equilibrium for every J in [0, 200] and every leak potential in [10.59, 10.62] mV; stable for J below J_H1 and above J_H2, two unstable eigenvalues in between.' },
      { label: 'Computer-assisted proof', text: 'At the printed leak potential 10.613 mV, J_H1 lies in [9.775437995393, 9.775437995394] and J_H2 in [154.522433665808, 154.522433665809]; the first Lyapunov coefficient is positive at J_H1 and negative at J_H2.' },
      { label: 'Computer-assisted proof', text: 'At J = 8 a stable equilibrium coexists with an orbitally stable spike train of period between 16.0058 and 16.0140 ms.' },
      { label: 'Not claimed', text: 'The basins of attraction, and any other attractors.' },
    ],
    numbers: [
      { label: 'Lower Hopf point J_H1', value: '9.775437995393… µA/cm²' },
      { label: 'Upper Hopf point J_H2', value: '154.522433665808… µA/cm²' },
      { label: 'Spike period at J = 8', value: '16.0058 to 16.0140 ms' },
    ],
    faq: [
      { q: 'What does bistable mean for a neuron?', a: 'At the same steady input the cell can either sit at rest or fire repetitively. A short extra pulse of current can switch it into firing, and it stays there.' },
      { q: 'Why 1952 constants?', a: 'They are the constants Hodgkin and Huxley printed, at 6.3 degrees Celsius. The paper proves the results for those exact values and for a small interval of leak potentials around them.' },
    ],
    module: 'hh-neuron',
    moduleIntro: 'The space-clamped Hodgkin-Huxley equations at their 1952 constants, simulated live. Voltage is shown as depolarization from rest, as in the paper. Set the steady current and give the membrane a 1 ms kick; at J = 8 a kick switches it from rest to a lasting spike train.',
  },
  {
    id: 'hh-pulse',
    searchName: 'Hodgkin-Huxley Propagated Action Potential: Existence Proved',
    question: 'Does the nerve impulse Hodgkin and Huxley computed by hand in 1952 really exist?',
    plain: {
      what: 'To find how fast a nerve impulse travels, Hodgkin and Huxley guessed a speed, integrated their equation by hand, and watched the solution fly off towards plus or minus infinity. A guess too low went one way and a guess too high the other, and they narrowed the speed between them. They got 18.8 metres per second.',
      found: 'The paper proves that their unmodified travelling-wave equation really has a pulse, at 18.5 and at 6.3 degrees Celsius, with the rate functions and constants they printed. The speed is pinned down so tightly that every digit shown is proved: 18.73188824788048354046831343329624387695575077 metres per second at 18.5 degrees.',
      why: 'Earlier existence proofs changed the equations by speeding up or slowing down some of the gates. This is the first proof, as far as the paper\'s search reached, for the equation Hodgkin and Huxley actually wrote down.',
      limits: 'A preprint, not peer reviewed. Uniqueness, stability, other temperatures and the slow pulse are not claimed.',
    },
    terms: [{ term: 'Travelling wave', meaning: 'A pulse that moves along the axon at constant speed without changing shape, so it can be described as a function of one variable.' }, { term: 'Shooting', meaning: 'Guess the speed, integrate, see which way the solution escapes, and adjust. The true speed is where the escape direction flips.' }, { term: 'Homoclinic orbit', meaning: 'A solution that leaves the resting state and comes back to it: the pulse.' }, cap],
    results: [
      { label: 'Computer-assisted proof', text: 'At 18.5 °C and at 6.3 °C, with the printed leak potential 10.613 mV, the travelling-wave equation has an orbit homoclinic to rest; the speed parameter lies in intervals of width 3e-45 and 2.8e-61.' },
      { label: 'Computer-assisted proof', text: 'The conduction speeds begin 18.73188824788048354046831343329624387695575077 m/s at 18.5 °C and 12.31375672016229859330140853674732362368394751453213155988245 m/s at 6.3 °C.' },
      { label: 'Not claimed', text: 'Uniqueness of the pulse, its stability, other temperatures, the slow pulse.' },
    ],
    numbers: [
      { label: 'Speed at 18.5 °C', value: '18.7318882478… m/s', note: 'Hodgkin and Huxley computed 18.8' },
      { label: 'Speed at 6.3 °C', value: '12.3137567201… m/s' },
    ],
    faq: [
      { q: 'If they already computed it, what is new?', a: 'A computation by shooting shows where the escape direction flips, but not that a true pulse exists between the two guesses. The proof closes that gap with rigorous error bounds and an argument at the resting state.' },
      { q: 'Can I shoot the speed myself?', a: 'Yes, below. It runs their equation from rest. Too low a speed parameter and the voltage plunges, too high and it shoots up. Narrow it down the way they did.' },
    ],
    module: 'hh-shoot',
    moduleIntro: 'Hodgkin and Huxley\'s travelling-wave equation, u\'\' = K (u\' + I_ion), integrated from rest along its unstable direction in ordinary floating point. Change the speed parameter K and watch which way the solution escapes. Floating point can locate K to about six digits; the proof pins it to 45.',
  },
  {
    id: 'nf-pulse',
    searchName: 'Neural Field Traveling Pulses: Existence and Stability Proved',
    question: 'Do waves of activity really travel in this model of cortex when recovery is not slow?',
    plain: {
      what: 'A neural field treats a sheet of cortex as a continuum: activity u at each point excites its neighbours through a kernel, and a recovery variable v pulls it back down. In slices of cortex with inhibition blocked, waves of activity travel along the tissue. Pinto and Ermentrout\'s model captures them, but the existing proofs of travelling pulses needed recovery to be very slow, or relied on conditions nobody had checked.',
      found: 'The paper proves pulses at explicit parameters with recovery that is not slow. With a logistic firing rate and recovery rate 1/10 there is a fast pulse with speed 1.10274770973415924914786770, to 25 digits, and a slow pulse with speed about 0.37753. A fast pulse exists for every recovery rate from 0.08 to 0.13693, and the fast pulse at 1/10 is proved spectrally stable.',
      why: 'Neural field models are widely used to interpret cortical waves. A proof at realistic parameters means the waves seen in simulations are real solutions of the model, not artifacts of a small-parameter approximation.',
      limits: 'A preprint, not peer reviewed. Nonlinear stability is not proved. The simulation below is a simulation; that it settles on the fast pulse is observed, not proved.',
    },
    terms: [{ term: 'Neural field', meaning: 'A model of cortex as a continuous sheet of activity rather than separate neurons.' }, { term: 'Recovery rate epsilon', meaning: 'How quickly the tissue recovers after firing. Earlier proofs needed it to be tiny.' }, { term: 'Spectral stability', meaning: 'Small disturbances of the pulse do not grow, at the level of the linearized equation.' }, cap],
    results: [
      { label: 'Computer-assisted proof', text: 'For gain 20, threshold 1/4, no recovery decay and kernel exp(-|x|)/2, a fast pulse at epsilon = 1/10 with speed in (c_1, c_1 + 1e-25), c_1 = 1.1027477097341592491478677, and a slow pulse.' },
      { label: 'Computer-assisted proof', text: 'A fast pulse for every epsilon in [0.08, 0.13693] and at 3/20, where it coexists with a slow pulse; and fast pulses for the sigmoid of Pinto and Ermentrout\'s Fig. 5 and in Faye\'s model with synaptic depression.' },
      { label: 'Computer-assisted proof', text: 'Spectral stability of the fast pulse at epsilon = 1/10 for every pulse in a class defined by a speed bracket of width 1e-58.' },
      { label: 'Not claimed', text: 'Nonlinear stability.' },
    ],
    numbers: [
      { label: 'Fast pulse speed, epsilon = 1/10', value: '1.10274770973…', note: 'in units of the kernel length per membrane time' },
      { label: 'Slow pulse speed', value: '0.37753193506…' },
      { label: 'Proved range of epsilon', value: '0.08 to 0.13693' },
    ],
    faq: [
      { q: 'What units is the speed in?', a: 'The model is dimensionless: distance in units of the kernel\'s decay length and time in units of the membrane time constant.' },
      { q: 'Why does the simulation not match to 25 digits?', a: 'It runs on a grid with a finite ring and time step. Its measured speed should agree with the proved value to two or three digits.' },
    ],
    module: 'neural-field',
    moduleIntro: 'The Pinto-Ermentrout field u_t = -u - v + w * S(u), v_t = epsilon u, simulated on a ring of length 120 in your browser. A stimulus at the left starts a pulse; the readout times its front. At epsilon = 0.1 the measured speed should sit near the proved 1.1027.',
  },
  {
    id: 'double-pendulum',
    searchName: 'Double Pendulum Chaos: A Computer-Assisted Proof',
    question: 'Is the ordinary double pendulum really chaotic? Has anyone proved it?',
    plain: {
      what: 'Two equal arms swinging on each other is the standard picture of chaos in physics classes. But proofs of chaos for it needed a small parameter: a weak coupling, a tiny mass ratio or a special shape. As far as the paper could find, nobody had proved chaos for the plain case of equal masses and equal arms.',
      found: 'The paper proves it with a computer. At three energies, including the textbook one of releasing both arms horizontal from rest, the motion contains a horseshoe, a set of orbits that can follow any sequence of choices; at that energy the return map has topological entropy above 0.1016 per return. It also proves that, besides energy, the pendulum has no other smooth (real-analytic) conserved quantity near that energy, so it cannot be solved in closed form.',
      why: 'It settles, with explicit bounds, a statement that textbooks assume. The method, interval arithmetic with the time-reversal symmetry of the pendulum, carries over to other mechanical systems.',
      limits: 'A preprint, not peer reviewed. On the interval of energies a horseshoe is not proved, only the transversal homoclinic orbit. Non-integrability in the meromorphic sense remains open. The proof trusts the CAPD library\'s rigorous integrator.',
    },
    terms: [{ term: 'Poincaré section', meaning: 'Record the state each time the upper arm passes straight down while swinging one way. Regular motion leaves curves; chaos fills areas.' }, { term: 'Horseshoe', meaning: 'A set of orbits that stretch and fold like a baker kneading dough, which forces chaos.' }, { term: 'Topological entropy', meaning: 'How fast the number of distinguishable orbits grows. Positive entropy is a precise meaning of chaos.' }, { term: 'Integrable', meaning: 'Solvable by enough conserved quantities. The paper proves the pendulum is not.' }, cap],
    results: [
      { label: 'Computer-assisted proof', text: 'At E = -1/2, 0 and 1/2 a symmetric hyperbolic periodic orbit with a transversal homoclinic orbit, and the same for every E in [-1e-10, 1e-10] at once.' },
      { label: 'Computer-assisted proof', text: 'Explicit topological horseshoes at the three energies, with entropy at least 0.0906, 0.1016 and 0.0906 per return and 0.0213, 0.0138 and 0.0129 per unit time for the flow.' },
      { label: 'Proved', text: 'No real-analytic first integral independent of the energy on any connected open set containing the level E = 0.' },
      { label: 'Not claimed', text: 'Meromorphic non-integrability in the sense of Morales-Ruiz and Ramis; a horseshoe on the whole energy interval.' },
    ],
    numbers: [
      { label: 'Entropy per return, E = 0', value: 'above 0.1016' },
      { label: 'Entropy per unit time, E = 0', value: 'above 0.0138' },
      { label: 'Energy of the textbook release', value: 'E = 0', note: 'lower rest is E = -3' },
    ],
    faq: [
      { q: 'Wasn\'t this already known?', a: 'Everyone expected it, and simulations show it, but the published proofs the paper found needed a small parameter. This proof works at equal masses and lengths.' },
      { q: 'What do the energies mean?', a: 'In units where mass, length and gravity are 1, hanging straight down at rest is E = -3, and releasing both arms horizontal from rest is E = 0. Between -1 and 1 the lower arm can turn over but the upper arm cannot.' },
    ],
    module: 'pendulum',
    moduleIntro: 'The equal-mass, equal-length double pendulum, integrated live from its Hamiltonian. Pick an energy, then click inside the section to start an orbit there. Each time the upper arm swings through the bottom to the right, a dot is added at the lower arm\'s angle and momentum.',
  },
  {
    id: 'cardiac-rings',
    searchName: 'Rotating Waves in Rings of Heart Cells: Computer-Assisted Proofs',
    question: 'Can a ring of model heart cells carry a stable rotating wave, proved for a realistic cell?',
    plain: {
      what: 'Waves of electrical activity that circle around a loop of heart tissue underlie some arrhythmias. The paper studies rings of N identical model ventricular cells, Erhardt\'s 18-variable version of the ten Tusscher-Panfilov model, joined through their voltage. At the chosen potassium conductance a single cell oscillates on its own.',
      found: 'For one cell the paper proves a stable oscillation twice, with two independent programs. For rings of 8, 16, 32 and 64 cells it proves a rotating wave exists, is locally unique, is not just all cells beating together, has a period near 53.588 ms enclosed to within 2e-25 ms, and is stable. A rotating wave also exists for every ring of 8 or more cells, and for the continuous cable they approach.',
      why: 'Detailed cell models are used to study arrhythmia, but results about them come almost entirely from simulation. Proofs at explicit parameters show which simulated waves are genuine solutions.',
      limits: 'A preprint, not peer reviewed. Stability is proved only for the single cell and the four rings. Nothing is claimed for real tissue.',
    },
    terms: [{ term: 'Rotating wave', meaning: 'Each cell does the same thing as its neighbour, a fixed fraction of a period later, so a wave runs round the ring.' }, { term: 'Floquet multiplier', meaning: 'How much a small disturbance grows or shrinks over one period. Below 1 in size means it dies out.' }, { term: 'Cable', meaning: 'The continuum limit of the ring, a fibre of tissue.' }, cap],
    results: [
      { label: 'Computer-assisted proof', text: 'One cell: an orbitally asymptotically stable periodic orbit, by CAPD and by Arb, with an exact rational check that both enclose the same orbit.' },
      { label: 'Computer-assisted proof', text: 'Rings of 8, 16, 32 and 64 cells: a locally unique, non-synchronous rotating 1-wave with period enclosed to within 2e-25 ms, locally exponentially orbitally stable, every other multiplier below 0.9997321 in modulus.' },
      { label: 'Computer-assisted proof', text: 'A locally unique rotating 1-wave for every N of at least 8, and a travelling wave for the cable.' },
      { label: 'Not claimed', text: 'Anything for real tissue; stability for rings other than the four listed.' },
    ],
    numbers: [
      { label: 'Period, 8 cells', value: '53.587970976819… ms' },
      { label: 'Period, 64 cells', value: '53.588100418317… ms' },
      { label: 'Multiplier bound', value: 'below 0.9997321' },
    ],
    faq: [
      { q: 'Is this a model of a real heart?', a: 'It is a ring of model cells, a standard simplification. The cell model is detailed, but the paper is careful to claim nothing about tissue.' },
      { q: 'Why do the periods differ so slightly?', a: 'Coupling is scaled so the ring approaches a fixed cable as N grows. The period converges, changing by about a tenth of a microsecond from 8 to 64 cells.' },
    ],
  },
];

export const explainerFor = (id: string): Explainer | undefined => explainers.find(e => e.id === id);
