export type AttractorSystem = {
  id: string; name: string; label: string; caption: string;
  step: number; burnIn: number; start: [number, number, number];
  f: (x: number, y: number, z: number) => [number, number, number];
};

/** Classical chaotic systems at their standard parameter values. Illustrations, not research results. */
export const systems: AttractorSystem[] = [
  { id: 'lorenz', name: 'The Lorenz attractor', label: 'LORENZ SYSTEM', caption: 'Nearby starting points drift apart; the shape stays the same.',
    step: 0.008, burnIn: 1400, start: [1, 1, 1], f: (x, y, z) => [10 * (y - x), x * (28 - z) - y, x * y - (8 / 3) * z] },
  { id: 'rossler', name: 'The Rössler attractor', label: 'RÖSSLER SYSTEM', caption: 'One stretch and one fold, repeated forever.',
    step: 0.03, burnIn: 2000, start: [1, 1, 0], f: (x, y, z) => [-y - z, x + 0.2 * y, 0.2 + z * (x - 5.7)] },
  { id: 'aizawa', name: 'The Aizawa attractor', label: 'AIZAWA SYSTEM', caption: 'A sphere with a tube through its axis.',
    step: 0.01, burnIn: 3000, start: [0.1, 0, 0], f: (x, y, z) => [(z - 0.7) * x - 3.5 * y, 3.5 * x + (z - 0.7) * y, 0.6 + 0.95 * z - z ** 3 / 3 - (x * x + y * y) * (1 + 0.25 * z) + 0.1 * z * x ** 3] },
  { id: 'thomas', name: 'Thomas’ cyclically symmetric attractor', label: 'THOMAS SYSTEM', caption: 'The same rule in every direction.',
    step: 0.08, burnIn: 3000, start: [0.1, 0, 0], f: (x, y, z) => [Math.sin(y) - 0.208186 * x, Math.sin(z) - 0.208186 * y, Math.sin(x) - 0.208186 * z] },
  { id: 'halvorsen', name: 'The Halvorsen attractor', label: 'HALVORSEN SYSTEM', caption: 'Three linked lobes with threefold symmetry.',
    step: 0.008, burnIn: 4000, start: [-1.48, -1.51, 2.04], f: (x, y, z) => [-1.4 * x - 4 * y - 4 * z - y * y, -1.4 * y - 4 * z - 4 * x - z * z, -1.4 * z - 4 * x - 4 * y - x * x] },
];
const period = 16, fade = 0.9;

type AttractorControls = {
  setPaused(value: boolean): void;
  reset(): void;
  dispose(): void;
};

/**
 * An illustrative Lorenz simulation, not a presentation of new research.
 * Trajectories use fourth-order Runge-Kutta integration with the standard
 * parameters sigma = 10, rho = 28, and beta = 8/3.
 */
export function mountAttractor(canvas: HTMLCanvasElement, onSystem: (system: AttractorSystem) => void = () => {}): AttractorControls {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) {
    return { setPaused() {}, reset() {}, dispose() {} };
  }

  const count = 14000;
  const step = 0.008;
  const trajectory = new Float32Array(count * 3);
  const projected = new Float32Array(count * 2);
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyPaused: boolean | null = null;
  let disposed = false;
  let inView = true;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let frame = 0;
  let lastFrameTime = 0;
  let elapsed = 0;
  let lastTick = 0;
  let cameraSeed = 0.32;
  let pointerX = 0;
  let pointerY = 0;
  let easedPointerX = 0;
  let easedPointerY = 0;
  let systemIndex = 0;
  let systemTime = 0;
  let center = [0, 0, 0];
  let radius = 1;

  function createTrajectory() {
    const system = systems[systemIndex];
    const variation = Math.random();
    cameraSeed = 0.24 + variation * 0.23;
    let [x, y, z] = system.start;
    x += variation * 0.017; y -= variation * 0.012; z += variation * 0.008;
    const h = system.step;
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    // Fourth-order Runge-Kutta; burn-in removes the initial approach to the attractor before sampling.
    for (let i = -system.burnIn; i < count; i += 1) {
      const [aX, aY, aZ] = system.f(x, y, z);
      const [bX, bY, bZ] = system.f(x + aX * h / 2, y + aY * h / 2, z + aZ * h / 2);
      const [cX, cY, cZ] = system.f(x + bX * h / 2, y + bY * h / 2, z + bZ * h / 2);
      const [dX, dY, dZ] = system.f(x + cX * h, y + cY * h, z + cZ * h);
      x += (h / 6) * (aX + 2 * bX + 2 * cX + dX);
      y += (h / 6) * (aY + 2 * bY + 2 * cY + dY);
      z += (h / 6) * (aZ + 2 * bZ + 2 * cZ + dZ);
      if (i >= 0) {
        trajectory[i * 3] = x; trajectory[i * 3 + 1] = y; trajectory[i * 3 + 2] = z;
        lo[0] = Math.min(lo[0], x); lo[1] = Math.min(lo[1], y); lo[2] = Math.min(lo[2], z);
        hi[0] = Math.max(hi[0], x); hi[1] = Math.max(hi[1], y); hi[2] = Math.max(hi[2], z);
      }
    }
    center = [0, 1, 2].map(k => (lo[k] + hi[k]) / 2);
    radius = 0;
    for (let i = 0; i < count; i += 1) {
      const dx = trajectory[i * 3] - center[0], dy = trajectory[i * 3 + 1] - center[1], dz = trajectory[i * 3 + 2] - center[2];
      radius = Math.max(radius, Math.hypot(dx, dy, dz));
    }
    onSystem(system);
  }

  function paused() {
    return manuallyPaused ?? motionPreference.matches;
  }

  function canAnimate() {
    return !disposed && !paused() && inView && !document.hidden && width > 0 && height > 0;
  }

  function render() {
    if (disposed || width <= 0 || height <= 0) return;
    const ctx = context!;
    const colors = getComputedStyle(document.documentElement);
    const ink = colors.getPropertyValue('--attractor-rgb').trim() || '52,74,98';
    const flow = colors.getPropertyValue('--attractor-flow-rgb').trim() || '40,62,88';
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const yaw = cameraSeed + Math.sin(elapsed * 0.035) * 0.24 + easedPointerX * 0.085;
    const pitch = -0.14 + Math.sin(elapsed * 0.022) * 0.055 + easedPointerY * 0.045;
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const scale = Math.min(width, height) * 0.5 / radius;
    const alpha = Math.max(0, Math.min(1, systemTime / fade, (period - systemTime) / fade));
    ctx.globalAlpha = paused() ? 1 : alpha;
    const centerX = width * 0.5;
    const centerY = height * 0.51;

    for (let i = 0; i < count; i += 1) {
      const x = trajectory[i * 3] - center[0];
      const y = trajectory[i * 3 + 1] - center[1];
      const z = trajectory[i * 3 + 2] - center[2];
      const horizontal = x * cosYaw + y * sinYaw;
      const depth = -x * sinYaw + y * cosYaw;
      projected[i * 2] = centerX + horizontal * scale;
      projected[i * 2 + 1] = centerY - (z * cosPitch - depth * sinPitch) * scale;
    }

    ctx.lineWidth = 0.58;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Separate short paths retain the delicacy of an ink specimen at crossings.
    const chunk = 240;
    for (let start = 0; start < count - 1; start += chunk) {
      const end = Math.min(start + chunk, count - 1);
      const opacity = 0.13 + (start / count) * 0.1;
      ctx.strokeStyle = `rgba(${ink}, ${opacity})`;
      ctx.beginPath();
      ctx.moveTo(projected[start * 2], projected[start * 2 + 1]);
      for (let i = start + 1; i <= end; i += 1) {
        ctx.lineTo(projected[i * 2], projected[i * 2 + 1]);
      }
      ctx.stroke();
    }

    // Small moving sections suggest flow without changing the sampled geometry.
    for (let stream = 0; stream < 3; stream += 1) {
      const head = Math.floor((elapsed * 115 + stream * 4351 + 2300) % (count - 100)) + 80;
      ctx.lineWidth = 0.9;
      for (let section = 0; section < 4; section += 1) {
        const start = head - 80 + section * 20;
        ctx.strokeStyle = `rgba(${flow}, ${0.11 + section * 0.13})`;
        ctx.beginPath();
        ctx.moveTo(projected[start * 2], projected[start * 2 + 1]);
        for (let i = start + 1; i <= start + 20; i += 1) {
          ctx.lineTo(projected[i * 2], projected[i * 2 + 1]);
        }
        ctx.stroke();
      }
    }
  }

  function tick(timestamp: number) {
    frame = 0;
    if (!canAnimate()) return;
    if (lastTick) { const dt = Math.min((timestamp - lastTick) / 1000, 0.1); elapsed += dt; systemTime += dt; }
    if (systemTime >= period) { systemTime = 0; systemIndex = (systemIndex + 1) % systems.length; createTrajectory(); }
    lastTick = timestamp;

    if (!lastFrameTime || timestamp - lastFrameTime >= 1000 / 30) {
      easedPointerX += (pointerX - easedPointerX) * 0.055;
      easedPointerY += (pointerY - easedPointerY) * 0.055;
      render();
      lastFrameTime = timestamp;
    }
    frame = window.requestAnimationFrame(tick);
  }

  function updateAnimation() {
    if (!canAnimate()) {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      lastTick = 0;
      lastFrameTime = 0;
      return;
    }
    if (!frame) frame = window.requestAnimationFrame(tick);
  }

  function resize() {
    if (disposed) return;
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.8);
    const nextWidth = Math.max(1, Math.round(width * pixelRatio));
    const nextHeight = Math.max(1, Math.round(height * pixelRatio));
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }
    render();
    updateAnimation();
  }

  function onPointerMove(event: PointerEvent) {
    if (paused() || event.pointerType === 'touch') return;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  }

  function onPointerLeave() {
    pointerX = 0;
    pointerY = 0;
  }

  const resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(resize)
    : null;
  const intersectionObserver = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateAnimation();
    }, { rootMargin: '80px' })
    : null;

  createTrajectory();
  resize();
  resizeObserver?.observe(canvas);
  intersectionObserver?.observe(canvas);
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', updateAnimation);
  window.addEventListener('appearancechange', render);
  motionPreference.addEventListener('change', updateAnimation);
  canvas.addEventListener('pointermove', onPointerMove, { passive: true });
  canvas.addEventListener('pointerleave', onPointerLeave, { passive: true });

  return {
    setPaused(value) {
      if (disposed) return;
      manuallyPaused = value;
      updateAnimation();
    },
    reset() {
      if (disposed) return;
      elapsed = 0;
      systemTime = fade;
      lastTick = 0;
      pointerX = 0;
      pointerY = 0;
      easedPointerX = 0;
      easedPointerY = 0;
      createTrajectory();
      render();
      updateAnimation();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', updateAnimation);
      window.removeEventListener('appearancechange', render);
      motionPreference.removeEventListener('change', updateAnimation);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    },
  };
}
