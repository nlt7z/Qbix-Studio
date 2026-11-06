'use client';

import * as THREE from 'three';
import { useRef } from 'react';
import { loadFaces, paint } from '@/components/blocks/art/forma';
import { KH, KW, drawDesigned, drawGrid, drawMark, drawPlain } from '@/components/blocks/art/kova';
import { canvasTexture, roundRect, roundShape, smooth, stage } from '@/components/blocks/three/stage';
import { useChapter3D, type Built } from '@/components/blocks/three/useChapter3D';

/**
 * The brand upgrade, in 3D: Kova's phone, level, at three-quarters (art/kova.ts, drawn). As the chapter
 * scrolls, its screen comes apart into its layers (the ground, the app as it shipped, its grid); the app as
 * it shipped slides out and the app as designed comes in (its ink, its content, its lime mark, each a
 * layer); then the layers press back into the screen. The pointer turns it a little about the upright.
 */
const YAW = -0.62;
const W = 0.86;
const H = (W * KH) / KW;

async function build(host: HTMLElement): Promise<Built> {
  const f = await loadFaces();
  const S = stage(host, { yaw: YAW, pitch: 0.12, zoom: 1.12 });
  const { scene, renderer } = S;
  const tex = (draw: (x: CanvasRenderingContext2D) => void) => canvasTexture(paint(KW, KH, 3, draw), renderer);

  const phone = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundShape(W + 0.08, H + 0.08, 0.14), { depth: 0.05, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 12 }),
    new THREE.MeshStandardMaterial({ color: 0x2a2c30, metalness: 0.7, roughness: 0.34 }),
  );
  body.position.z = -0.025;
  phone.add(body);

  // the layers, bottom up; each sheet with a faint glass of its own so it reads when apart
  let order = 0;
  const sheet = (map: THREE.Texture | null, color?: number) => {
    const g = new THREE.Group();
    const geo = roundRect(W, H, 0.11);
    const glass = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xdfe5d6, transparent: true, opacity: 0, depthWrite: false }));
    const face = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map, color: color ?? 0xffffff, transparent: true, toneMapped: false, depthWrite: false }));
    glass.position.z = -0.001;
    // drawn bottom up, whatever their distance
    glass.renderOrder = order++;
    face.renderOrder = order++;
    g.add(glass, face);
    phone.add(g);
    return { g, glass: glass.material as THREE.MeshBasicMaterial, face: face.material as THREE.MeshBasicMaterial };
  };
  const ground = sheet(null, 0xffffff);
  const plain = sheet(tex(drawPlain));
  const grid = sheet(tex(drawGrid));
  const ink = sheet(null, 0x0b0c0e);
  const designed = sheet(tex((x) => drawDesigned(x, f)));
  const mark = sheet(tex(drawMark));
  const layers = [ground, plain, grid, ink, designed, mark];
  phone.position.x = -0.45;
  scene.add(phone);

  return {
    S,
    update: (p, lean) => {
      const apart = smooth(0.04, 0.3, p) * (1 - smooth(0.7, 0.95, p));
      const swap = smooth(0.34, 0.62, p);
      layers.forEach((l, i) => {
        // over the body's front (its bevel ends at 0.037)
        l.g.position.z = 0.042 + i * 0.003 + apart * i * 0.26;
        l.glass.opacity = apart * 0.38;
      });
      plain.face.opacity = 1 - swap;
      plain.g.position.y = swap * 0.5;
      plain.glass.opacity *= 1 - swap;
      grid.face.opacity = apart;
      grid.glass.opacity *= apart;
      [ink, designed, mark].forEach((l) => {
        l.face.opacity = swap;
        l.glass.opacity *= swap;
        l.g.position.y = -(1 - swap) * 0.5;
      });
      // a sheet with nothing on it isn't drawn
      layers.forEach((l) => (l.g.visible = l.face.opacity > 0.002));
      S.view(YAW + lean * 0.26);
    },
  };
}

export default function KovaLayers() {
  const ref = useRef<HTMLDivElement>(null);
  useChapter3D(ref, build);
  return <div ref={ref} className="three" role="img" aria-label="Kova's phone app taken apart into its layers and put back together with its new brand" />;
}
