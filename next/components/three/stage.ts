import * as THREE from 'three';

/**
 * Shared runtime for the offer-page scenes: renderer, resize, a render loop
 * that only runs while the canvas is on screen and the tab is visible, and
 * one dispose that frees every GPU resource the scene made.
 */

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const outQuint = (x: number) => 1 - Math.pow(1 - x, 5);
export const outBack = (x: number, s = 1.4) => (x <= 0 ? 0 : 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2));
export const smooth = (x: number) => x * x * (3 - 2 * x);

export type Frame = { t: number; dt: number };

export type StageOptions = {
  reduced: boolean;
  /** Pixel-ratio ceiling on desktop; phones are capped lower. */
  maxDpr?: number;
  shadows?: boolean;
  onReady: () => void;
};

export function createStage(host: HTMLElement, opts: StageOptions) {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : opts.maxDpr ?? 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;   // whites stay white, lime stays lime
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = opts.shadows ?? true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = 'stage-canvas';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const size = { w: 1, h: 1 };
  const resizers: ((w: number, h: number) => void)[] = [];
  const resize = () => {
    const r = host.getBoundingClientRect();
    size.w = Math.max(1, r.width);
    size.h = Math.max(1, r.height);
    renderer.setSize(size.w, size.h, false);
    resizers.forEach((f) => f(size.w, size.h));
  };

  let update: ((f: Frame) => THREE.Camera) | null = null;
  let ready = false;
  let clock = 0;
  let prev = performance.now();
  const draw = (now: number) => {
    if (!update) return;
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    if (!opts.reduced) clock += dt;
    const camera = update({ t: clock, dt });
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      opts.onReady();
    }
  };

  let raf = 0;
  let visible = false;
  const loop = (now: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    draw(now);
    raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    // Reduced motion draws on demand (resize, redraw()) instead of looping.
    if (opts.reduced) return;
    if (visible && !document.hidden && !raf) {
      prev = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (!visible && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    kick();
  });
  const ro = new ResizeObserver(() => {
    resize();
    if (!raf) draw(performance.now());
  });

  const disposers: (() => void)[] = [];

  return {
    THREE,
    renderer,
    scene,
    coarse,
    size,
    onResize(f: (w: number, h: number) => void) {
      resizers.push(f);
    },
    onDispose(f: () => void) {
      disposers.push(f);
    },
    /** Start drawing. `fn` advances the scene and returns the camera to render with. */
    run(fn: (f: Frame) => THREE.Camera) {
      update = fn;
      resize();
      ro.observe(host);
      io.observe(host);
      document.addEventListener('visibilitychange', kick);
      draw(performance.now());   // first frame now, so the fallback can hand over
    },
    /** Request frames again after an idle stretch (reduced motion still redraws on scroll). */
    redraw() {
      if (!raf) draw(performance.now());
    },
    get animating() {
      return !opts.reduced;
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', kick);
      disposers.forEach((f) => f());
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        const mats = Array.isArray(mat) ? mat : mat ? [mat] : [];
        mats.forEach((x) => {
          const withMaps = x as THREE.MeshStandardMaterial;
          withMaps.map?.dispose();
          withMaps.normalMap?.dispose();
          withMaps.emissiveMap?.dispose();
          x.dispose();
        });
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}

export type Stage = ReturnType<typeof createStage>;

/** CSS font stack behind one of the site's next/font variables, for canvas text. */
export function fontStack(variable: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

/** Resolve the three site faces and make sure they're loaded before canvas text is drawn. */
export async function siteFonts() {
  const fonts = {
    head: fontStack('--font-eurostile', 'sans-serif'),
    body: fontStack('--font-geist', 'system-ui, sans-serif'),
    mono: fontStack('--font-encode', 'system-ui, sans-serif'),
  };
  try {
    await Promise.all([
      document.fonts.load(`400 40px ${fonts.head}`),
      document.fonts.load(`400 40px ${fonts.body}`),
      document.fonts.load(`500 40px ${fonts.body}`),
      document.fonts.load(`600 40px ${fonts.body}`),
      document.fonts.load(`500 40px ${fonts.mono}`),
    ]);
  } catch {
    /* draw with whatever is available */
  }
  return fonts;
}
export type SiteFonts = Awaited<ReturnType<typeof siteFonts>>;

/** A canvas-backed texture you can redraw in place. */
export function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return Object.assign(tex, {
    redraw(fn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
      ctx.clearRect(0, 0, w, h);
      fn(ctx, w, h);
      tex.needsUpdate = true;
    },
  });
}
