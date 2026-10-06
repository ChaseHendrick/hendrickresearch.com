// A quiet WebGPU layer behind research heroes, from the `shaders` package. It loads only where
// WebGPU exists, holds still under reduced motion, follows the Appearance theme and sends no
// telemetry. Without WebGPU the hero is unchanged.

type Kind = 'contours' | 'flow' | 'wave';

const ink = () => getComputedStyle(document.documentElement).getPropertyValue('--copper').trim() || '#3d5a78';

function preset(kind: Kind, still: boolean) {
  const line = ink();
  const speed = still ? 0 : 1;
  const contours = (extra: Record<string, unknown> = {}) => ({
    type: 'ContourLines',
    props: { levels: 14, lineWidth: 1, softness: 0.4, gamma: 0.9, colorMode: 'custom', lineColor: line, backgroundColor: 'transparent', ...extra },
    children: [{ type: 'SimplexNoise', props: { colorA: '#ffffff', colorB: '#000000', scale: 2.6, speed: 0.08 * speed, seed: 7 } }],
  });
  if (kind === 'flow') return { components: [{ type: 'FlowField', props: { strength: 0.12, detail: 1.6, speed: 0.6 * speed, evolutionSpeed: 0.3 * speed, seed: 3 }, children: [contours()] }] };
  if (kind === 'wave') return { components: [{ type: 'Waveform', props: { style: 'line', colorA: line, colorB: line, amplitude: 0.7, frequency: 0.8, height: 0.45, lineWidth: 0.004, softness: 0.3, speed: 0.35 * speed, seed: 4 } }] };
  return { components: [contours()] };
}

export async function mountHeroShader(): Promise<void> {
  const host = document.querySelector<HTMLElement>('[data-hero-shader]');
  if (!host || !('gpu' in navigator)) return;
  const kind = (host.dataset.heroShader as Kind) || 'contours';
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-shader';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let instance: { destroy?: () => void } | null = null;
  const start = async () => {
    instance?.destroy?.();
    try {
      const { createShader } = await import('shaders/js');
      instance = await createShader(canvas, preset(kind, still), { disableTelemetry: true, onError: reason => { host.dataset.shaderError = reason; canvas.remove(); } });
      canvas.classList.add('hero-shader-on');
    } catch (error) {
      host.dataset.shaderError = String(error);
      canvas.remove();
    }
  };
  await start();
  new MutationObserver(() => { void start(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}
