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
export function mountAttractor(canvas: HTMLCanvasElement): AttractorControls {
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

  function createTrajectory() {
    const variation = Math.random();
    cameraSeed = 0.24 + variation * 0.23;
    let x = 1 + variation * 0.17;
    let y = 1 - variation * 0.12;
    let z = 1 + variation * 0.08;

    // Burn-in removes the initial approach to the attractor before sampling.
    for (let i = -1400; i < count; i += 1) {
      const aX = 10 * (y - x);
      const aY = x * (28 - z) - y;
      const aZ = x * y - (8 / 3) * z;

      const bX0 = x + aX * step * 0.5;
      const bY0 = y + aY * step * 0.5;
      const bZ0 = z + aZ * step * 0.5;
      const bX = 10 * (bY0 - bX0);
      const bY = bX0 * (28 - bZ0) - bY0;
      const bZ = bX0 * bY0 - (8 / 3) * bZ0;

      const cX0 = x + bX * step * 0.5;
      const cY0 = y + bY * step * 0.5;
      const cZ0 = z + bZ * step * 0.5;
      const cX = 10 * (cY0 - cX0);
      const cY = cX0 * (28 - cZ0) - cY0;
      const cZ = cX0 * cY0 - (8 / 3) * cZ0;

      const dX0 = x + cX * step;
      const dY0 = y + cY * step;
      const dZ0 = z + cZ * step;
      const dX = 10 * (dY0 - dX0);
      const dY = dX0 * (28 - dZ0) - dY0;
      const dZ = dX0 * dY0 - (8 / 3) * dZ0;

      x += (step / 6) * (aX + 2 * bX + 2 * cX + dX);
      y += (step / 6) * (aY + 2 * bY + 2 * cY + dY);
      z += (step / 6) * (aZ + 2 * bZ + 2 * cZ + dZ);

      if (i >= 0) {
        trajectory[i * 3] = x;
        trajectory[i * 3 + 1] = y;
        trajectory[i * 3 + 2] = z;
      }
    }
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
    const ink = colors.getPropertyValue('--attractor-rgb').trim() || '112,75,49';
    const flow = colors.getPropertyValue('--attractor-flow-rgb').trim() || '106,66,40';
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const yaw = cameraSeed + Math.sin(elapsed * 0.035) * 0.24 + easedPointerX * 0.085;
    const pitch = -0.14 + Math.sin(elapsed * 0.022) * 0.055 + easedPointerY * 0.045;
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const scale = Math.min(width / 66, height / 54) * 0.92;
    const centerX = width * 0.5;
    const centerY = height * 0.51;

    for (let i = 0; i < count; i += 1) {
      const x = trajectory[i * 3];
      const y = trajectory[i * 3 + 1];
      const z = trajectory[i * 3 + 2] - 25;
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
    if (lastTick) elapsed += Math.min((timestamp - lastTick) / 1000, 0.1);
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
