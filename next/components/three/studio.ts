import * as THREE from 'three';

/**
 * Product-photography environment: an overhead softbox, two tall strip lights,
 * a low front fill and a white kicker behind — long, clean gradient
 * reflections on the glossy faces instead of a generic room.
 */
export function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  env.background = new THREE.Color('#050607');
  const panel = (w: number, h: number, intensity: number, color: string, pos: [number, number, number]) => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  };
  panel(7, 7, 2.4, '#ffffff', [0, 9, 0.5]);
  panel(1.6, 10, 3.6, '#ffffff', [-8, 1.5, 3.5]);
  panel(1.6, 10, 2.6, '#eef3ff', [8, 1.5, -2.5]);
  panel(10, 2.5, 0.45, '#ffffff', [0, 0.5, 9]);
  panel(7, 1.1, 1.8, '#ffffff', [0, 3, -9]);   // was a lime kicker: no lime in reflections
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.015).texture;
  pmrem.dispose();
  env.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    (m.material as THREE.Material | undefined)?.dispose();
  });
  return tex;
}

