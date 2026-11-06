import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * One three.js stage for a chapter's 3D (KovaLayers): a transparent renderer filling its host,
 * a room's light on the materials, and an orthographic camera, so upright edges stay upright and the
 * object reads level, at an exact three-quarter view (yaw) and a little from above (pitch). It renders only
 * when asked.
 */
export type Stage = {
  scene: THREE.Scene;
  cam: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  view: (yaw: number) => void;
  render: () => void;
  dispose: () => void;
};

export function stage(host: HTMLElement, { yaw, pitch, zoom }: { yaw: number; pitch: number; zoom: number }): Stage {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environment = env;
  pm.dispose();
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 5, 4);
  scene.add(key);

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  let at = yaw;
  const place = () => {
    const w = host.clientWidth;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    const a = w / h;
    // fit the width on a narrow box, the height on a wide one
    const z = a < 1 ? zoom / a : zoom;
    cam.left = -z * a;
    cam.right = z * a;
    cam.top = z;
    cam.bottom = -z;
    cam.position.set(Math.sin(at) * Math.cos(pitch) * 10, Math.sin(pitch) * 10, Math.cos(at) * Math.cos(pitch) * 10);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  };
  place();
  const render = () => renderer.render(scene, cam);
  const ro = new ResizeObserver(() => {
    place();
    render();
  });
  ro.observe(host);
  return {
    scene,
    cam,
    renderer,
    view: (y) => {
      at = y;
      place();
    },
    render,
    dispose: () => {
      ro.disconnect();
      env.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (Array.isArray(m.material) ? m.material : m.material ? [m.material] : []).forEach((mat) => {
          (mat as THREE.MeshBasicMaterial).map?.dispose();
          mat.dispose();
        });
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}

/** A rounded rectangle's outline, centred. */
export function roundShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** A rounded rectangle, centred, its UVs 0..1 across it (for a screen's picture). */
export function roundRect(w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  const g = new THREE.ShapeGeometry(roundShape(w, h, r), 8);
  const uv = g.attributes.uv;
  const p = g.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) - x) / w, (p.getY(i) - y) / h);
  uv.needsUpdate = true;
  return g;
}

/** A canvas as a texture: sharp at an angle (mipmaps, anisotropy), in the page's colours. */
export function canvasTexture(c: HTMLCanvasElement, renderer: THREE.WebGLRenderer) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

/**
 * How far its chapter has been played, 0..1: on a wide screen, the pinned chapter's own scroll; on a phone,
 * its scene column's runway (blocks.css .chapter, .ch-run).
 */
export function chapterProgress(host: HTMLElement) {
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const ch = host.closest<HTMLElement>('.chapter');
  if (ch && matchMedia('(min-width: 900px) and (min-height: 560px)').matches) {
    const r = ch.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height - innerHeight));
  }
  const run = host.closest<HTMLElement>('.ch-run');
  const pin = run?.firstElementChild as HTMLElement | null;
  if (!run || !pin) return 0;
  const r = run.getBoundingClientRect();
  const top = parseFloat(getComputedStyle(pin).top) || 0;
  return clamp((top - r.top) / Math.max(1, r.height - pin.offsetHeight));
}

export const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
