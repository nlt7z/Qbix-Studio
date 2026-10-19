import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * How the pieces look (components/three/blockStory.ts moves them): real
 * materials in a studio, after the brand's own renders (public/qbix-cube.png,
 * qbix-keyboard.png), not a clay model.
 *
 * - Materials, per piece (its kind): glossy moulded plastic in the page's
 *   two colours (white, ink), lime plastic, photo paper for pictures,
 *   brushed aluminium, frosted glass, and the cube's lime core, which glows
 *   evenly (no dark rim). Plastic has a clear coat; aluminium is brushed;
 *   what's printed on a face is matte ink.
 * - Every piece is a rounded box whose corner radius stays the same in real
 *   units whatever its size (the geometry is stretched like a nine-slice in
 *   the vertex shader), so edges catch the light like moulded parts.
 * - Light: an environment of soft boxes and strip lights (reflections and
 *   ambient), a key light that casts soft shadows, a rim light. Each chapter
 *   lights the object its own way; the key drifts slowly and leans toward the
 *   pointer, so the light is never quite still.
 * - Glass is drawn by a second mesh of the same pieces (three.js renders
 *   transmissive things after the opaque ones, seeing them through the
 *   glass), each mesh discarding what belongs to the other.
 */

/** The kinds of piece, the materials. FORE stands out from the page (white on black, ink on paper), BACK is the page's own colour. */
export const KIND = { FORE: 0, BACK: 5, PIC: 7, METAL: 8, LIME: 9, PLAY: 10, CORE: 11, GLASS: 12 } as const;

const R0 = 0.12;   // the unit geometry's corner radius

/** The geometry every piece shares: a unit box with round edges, stretched per piece in the vertex shader. */
export function pieceGeometry() {
  return new RoundedBoxGeometry(1, 1, 1, 3, R0);
}

export type LookUniforms = {
  uEdge: { value: number };
  uHasEdge: { value: number };
  uToneAbove: { value: number };
  uToneBelow: { value: number };
  uPrints: { value: THREE.Texture };
  uPixel: { value: number };
  uRound: { value: number };
};

const VERT_PARS = /* glsl */ `
attribute vec3 aSize;
attribute vec3 aKind;
attribute vec4 aPrintA;
attribute vec4 aPrintB;
uniform float uRound;
varying vec3 vKind;
varying vec4 vPrintA;
varying vec4 vPrintB;
varying vec3 vLocal;
varying vec3 vNormalLocal;
varying vec3 vSize;
`;
// The piece's size, with its corners kept round: the unit box's flat parts stretch, its rounding only moves.
const VERT_SHAPE = /* glsl */ `
#include <begin_vertex>
{
  vec3 h0 = vec3(0.5 - ${R0.toFixed(3)});
  vec3 inner = clamp(position, -h0, h0);
  vec3 o = position - inner;
  float r = min(uRound, 0.45 * min(min(aSize.x, aSize.y), aSize.z));
  transformed = inner / h0 * max(aSize * 0.5 - r, vec3(0.0)) + o * (r / ${R0.toFixed(3)});
  vLocal = transformed / max(aSize, vec3(1e-5));
}
vKind = aKind;
vPrintA = aPrintA;
vPrintB = aPrintB;
vNormalLocal = normal;
vSize = aSize;
`;

const FRAG_PARS = /* glsl */ `
uniform float uEdge;
uniform float uHasEdge;
uniform float uToneAbove;
uniform float uToneBelow;
uniform sampler2D uPrints;
uniform float uPixel;
varying vec3 vKind;
varying vec4 vPrintA;
varying vec4 vPrintB;
varying vec3 vLocal;
varying vec3 vNormalLocal;
varying vec3 vSize;
varying vec3 vTx;
varying vec3 vTy;
varying vec3 vTz;
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float cover(float d, float w) { return clamp(0.5 - d / max(w, 1e-5), 0.0, 1.0); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
`;
// Which kind this fragment is (the next one coming on across the piece, left to right, in a
// dithered band of the page's 4px pixel), and its colour with what's printed on it.
const FRAG_KIND = /* glsl */ `
vec4 diffuseColor = vec4( diffuse, opacity );
vec2 fuv = vLocal.xy + 0.5;
vec2 fdx = dFdx(fuv), fdy = dFdy(fuv);
float th = (vLocal.x + 0.5) * 0.6 + bayer4(floor(gl_FragCoord.xy / uPixel)) * 0.4;
bool toB = vKind.z > th;
float kk = toB ? vKind.y : vKind.x;
vec4 pr = toB ? vPrintB : vPrintA;
#ifdef BLOCK_GLASS
  if (kk < 11.5) discard;
#else
  if (kk > 11.5) discard;
#endif
float tone = (uHasEdge > 0.5 && gl_FragCoord.y < uEdge) ? uToneBelow : uToneAbove;
const vec3 WHITE = vec3(0.9, 0.905, 0.89);
const vec3 INK = vec3(0.0105, 0.0115, 0.0135);
const vec3 LIMEC = vec3(0.479, 1.0, 0.0);
vec3 foreC = mix(WHITE, INK, tone), backC = mix(INK, WHITE, tone);
bool isLime = kk > 8.5 && kk < 11.5;
bool isPic = kk > 6.5 && kk < 7.5;
bool isMetal = kk > 7.5 && kk < 8.5;
bool isCore = kk > 10.5 && kk < 11.5;
bool isGlass = kk > 11.5;
bool isBack = kk > 4.5 && kk < 6.5;
vec3 base = isLime ? LIMEC : isPic ? WHITE : isMetal ? vec3(0.91, 0.915, 0.92) : isGlass ? vec3(0.97, 0.99, 0.98) : isBack ? backC : foreC;
float light = dot(base, vec3(0.333)) > 0.3 ? 1.0 : 0.0;   // a light surface (for its finish)
if (kk > 9.5 && kk < 10.5 && min(vSize.x, vSize.y) > 0.3) {
  // the play button: an ink triangle on the lime, pointing right
  vec2 t = (fuv - 0.5) * vSize.xy / (0.5 * min(vSize.x, vSize.y));
  float inside = max(-0.32 - t.x, abs(t.y) * 1.25 + t.x * 0.62 - 0.36);
  base = mix(base, INK, cover(inside, 0.02) * step(0.5, vNormalLocal.z));
}
float printed = 0.0;
if (pr.z > 0.0 && vNormalLocal.z > 0.5) {
  vec2 q = clamp(fuv, 0.0, 1.0);
  vec3 p = textureGrad(uPrints, pr.xy + q * pr.zw, fdx * pr.zw, fdy * pr.zw).rgb;
  vec3 ink = (isLime || isPic || isMetal || isGlass) ? INK : isBack ? foreC : backC;
  base = base * max(0.0, 1.0 - p.r - p.g) + ink * p.r + LIMEC * p.g;
  printed = clamp(p.r + p.g, 0.0, 1.0);
}
diffuseColor.rgb = base;
`;
const FRAG_ROUGH = /* glsl */ `
#include <roughnessmap_fragment>
roughnessFactor = isMetal ? 0.3 : isPic ? 0.55 : isCore ? 0.2 : isGlass ? 0.2 : isLime ? 0.3 : light > 0.5 ? 0.3 : 0.36;
roughnessFactor = mix(roughnessFactor, 0.62, printed * 0.7);   // ink is matte
`;
const FRAG_METAL = /* glsl */ `
#include <metalnessmap_fragment>
metalnessFactor = isMetal ? 1.0 : 0.0;
`;
// The surface: brushed lines on aluminium (plastic stays smooth).
const FRAG_NORMAL = /* glsl */ `
#include <normal_fragment_maps>
{
  vec3 pl = vLocal * vSize * 40.0;
  vec3 g = vec3(0.0);
  float amp = 0.0;
  if (isMetal) {
    // brushed along x: the lines run across every face (on the top, front to back)
    bool top = abs(vNormalLocal.y) > 0.5;
    float n = vnoise(vec2((pl.x + pl.z) * 0.06, (top ? pl.z : pl.y) * 6.0)) - 0.5;
    g = top ? vec3(0.0, 0.0, n) : vec3(0.0, n, 0.0);
    amp = 0.1;
  }
  normal = normalize(normal + amp * (g.x * vTx + g.y * vTy + g.z * vTz));
}
`;
const FRAG_EMISSIVE = /* glsl */ `
#include <emissivemap_fragment>
if (isCore) totalEmissiveRadiance = LIMEC * 1.25;
`;
const FRAG_COAT = /* glsl */ `
#include <lights_physical_fragment>
#ifdef USE_CLEARCOAT
  material.clearcoat = (isMetal || isGlass ? 0.0 : isPic ? 0.3 : isCore ? 1.0 : 0.75) * (1.0 - 0.6 * printed);
  material.clearcoatRoughness = min(max(isCore ? 0.04 : 0.09, 0.0525) + geometryRoughness, 1.0);
#endif
`;

function inject(shader: THREE.WebGLProgramParametersWithUniforms, U: LookUniforms) {
  Object.assign(shader.uniforms, U);
  shader.vertexShader = shader.vertexShader
    .replace('void main() {', `${VERT_PARS}\nvarying vec3 vTx;\nvarying vec3 vTy;\nvarying vec3 vTz;\nvoid main() {`)
    .replace('#include <begin_vertex>', `${VERT_SHAPE}
mat3 pieceView = mat3(modelViewMatrix) * mat3(instanceMatrix);
vTx = normalize(pieceView * vec3(1.0, 0.0, 0.0));
vTy = normalize(pieceView * vec3(0.0, 1.0, 0.0));
vTz = normalize(pieceView * vec3(0.0, 0.0, 1.0));`);
  shader.fragmentShader = shader.fragmentShader
    .replace('void main() {', `${FRAG_PARS}\nvoid main() {`)
    .replace('vec4 diffuseColor = vec4( diffuse, opacity );', FRAG_KIND)
    .replace('#include <roughnessmap_fragment>', FRAG_ROUGH)
    .replace('#include <metalnessmap_fragment>', FRAG_METAL)
    .replace('#include <normal_fragment_maps>', FRAG_NORMAL)
    .replace('#include <emissivemap_fragment>', FRAG_EMISSIVE)
    .replace('#include <lights_physical_fragment>', FRAG_COAT);
}

/** The pieces' materials: everything but glass; glass; and the shape the shadows are cast by. */
export function pieceMaterials(U: LookUniforms) {
  const opaque = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1 });
  opaque.onBeforeCompile = (s) => inject(s, U);
  opaque.customProgramCacheKey = () => 'qbix-piece';

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0,
    transmission: 1,
    thickness: 0.9,
    ior: 1.45,
    attenuationColor: new THREE.Color(0.93, 0.98, 0.95),
    attenuationDistance: 2.4,
    specularIntensity: 1,
  });
  glass.defines = { ...glass.defines, BLOCK_GLASS: '' };
  glass.onBeforeCompile = (s) => inject(s, U);
  glass.customProgramCacheKey = () => 'qbix-glass';

  // Shadows are cast by the same shapes, and not by glass.
  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  depth.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, U);
    s.vertexShader = s.vertexShader
      .replace('void main() {', `${VERT_PARS}\nvoid main() {`)
      .replace('#include <begin_vertex>', VERT_SHAPE);
    s.fragmentShader = s.fragmentShader
      .replace('void main() {', `uniform float uPixel;\nvarying vec3 vKind;\nvarying vec3 vLocal;\nvarying vec3 vSize;\nfloat bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }\nfloat bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }\nvoid main() {`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
float kk = vKind.z > (vLocal.x + 0.5) * 0.6 + bayer4(floor(gl_FragCoord.xy / uPixel)) * 0.4 ? vKind.y : vKind.x;
if (kk > 11.5 || min(min(vSize.x, vSize.y), vSize.z) < 0.001) discard;`);
  };
  depth.customProgramCacheKey = () => 'qbix-depth';
  return { opaque, glass, depth };
}

/* ------------------------------------------------------------------ light */

/** How a chapter is lit: where the key comes from (azimuth, elevation, radians), how strong it, the environment and the rim are, and how far the environment is turned. */
export type Lighting = { az: number; el: number; key: number; env: number; rim: number; spin: number };

export const LIGHTS: Record<'dark' | 'paper', Lighting[]> = {
  // black chapters: a stronger key from one side, a bright rim, less fill (the gloss reads on black)
  dark: [
    { az: -0.75, el: 0.75, key: 3.2, env: 1.0, rim: 2.4, spin: 0 },
    { az: 0.85, el: 0.6, key: 3.0, env: 0.95, rim: 2.8, spin: 1.2 },
    { az: -0.35, el: 1.0, key: 3.0, env: 1.0, rim: 2.0, spin: -0.8 },
  ],
  // paper chapters: soft and high, a gentle rim
  paper: [
    { az: 0.55, el: 0.85, key: 2.6, env: 1.05, rim: 1.0, spin: 0.6 },
    { az: -0.6, el: 0.9, key: 2.5, env: 1.1, rim: 0.9, spin: -1.0 },
    { az: 0.2, el: 1.1, key: 2.7, env: 1.0, rim: 1.1, spin: 2.0 },
  ],
};

// A studio to be reflected in: a soft grey sweep, a large key box above and in front, two tall
// strip lights at the sides (long highlights down glossy edges), a top panel, a low back rim.
function studio(): THREE.Scene {
  const s = new THREE.Scene();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const sweep = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: 'varying vec3 vP; void main() { vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec3 vP; void main() { float y = vP.y; vec3 c = mix(vec3(0.3, 0.31, 0.32), vec3(0.9, 0.91, 0.92), smoothstep(-0.6, 0.9, y)); gl_FragColor = vec4(c, 1.0); }',
    }),
  );
  s.add(sweep);
  const panel = (x: number, y: number, z: number, w: number, h: number, d: number, power: number, warm = 0) => {
    const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color(power, power * (1 - 0.03 * warm), power * (1 - 0.08 * warm)) }));
    m.position.set(x, y, z);
    m.scale.set(w, h, d);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  panel(0, 4, 42, 44, 26, 0.5, 1.7);      // a big soft light behind the camera: the faces turned to us are white
  panel(-14, 22, 18, 22, 14, 0.5, 8, 1);  // the key box, above, in front, to the left
  panel(-26, 4, 2, 3, 30, 0.5, 7);        // a strip at the left
  panel(26, 6, -4, 3, 30, 0.5, 5);        // a strip at the right
  panel(0, 34, -6, 26, 0.5, 18, 4);       // the top panel
  panel(8, -6, -30, 30, 6, 0.5, 2.2);     // a low rim behind
  panel(4, -24, 14, 30, 0.5, 10, 1.1);    // a floor bounce
  return s;
}

export type Look = {
  /** Light the object for this frame: its lighting (eased toward), the pointer (-1..1), and where the object is (centre, radius, world). */
  update: (dt: number, t: number, want: Lighting, pointer: { x: number; y: number }, centre: THREE.Vector3, radius: number) => void;
  dispose: () => void;
};

export function makeLook(renderer: THREE.WebGLRenderer, scene: THREE.Scene, fine: boolean): Look {
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const pm = new THREE.PMREMGenerator(renderer);
  const room = studio();
  const env = pm.fromScene(room, 0.03).texture;
  room.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose();
    (m.material as THREE.Material | undefined)?.dispose?.();
  });
  pm.dispose();
  scene.environment = env;

  const key = new THREE.DirectionalLight(0xfff6ec, 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(fine ? 2048 : 1024, fine ? 2048 : 1024);
  key.shadow.bias = -0.0004;
  key.shadow.intensity = 0.55;   // soft, not black
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xe9f1ff, 1.6);
  scene.add(rim, rim.target);

  const cur: Lighting = { ...LIGHTS.dark[0] };
  const dir = new THREE.Vector3();
  const update: Look['update'] = (dt, t, want, pointer, centre, radius) => {
    const k = 1 - Math.exp(-dt * 1.6);
    for (const p of ['az', 'el', 'key', 'env', 'rim', 'spin'] as const) cur[p] += (want[p] - cur[p]) * k;
    // the key drifts a little, and leans toward the pointer
    const az = cur.az + Math.sin(t * 0.17) * 0.14 + pointer.x * 0.22;
    const el = Math.min(1.35, Math.max(0.25, cur.el + Math.sin(t * 0.13 + 1.3) * 0.06 + pointer.y * 0.12));
    dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).normalize();
    const reach = Math.max(1, radius);
    key.position.copy(centre).addScaledVector(dir, reach * 4);
    key.target.position.copy(centre);
    key.intensity = cur.key;
    const cam = key.shadow.camera as THREE.OrthographicCamera;
    cam.left = cam.bottom = -reach * 1.15;
    cam.right = cam.top = reach * 1.15;
    cam.near = reach * 1.5;
    cam.far = reach * 6.5;
    cam.updateProjectionMatrix();
    key.shadow.normalBias = reach * 0.004;
    rim.position.copy(centre).add(dir.set(-Math.sin(az) * 0.6, 0.35, -0.75).normalize().multiplyScalar(reach * 4));
    rim.target.position.copy(centre);
    rim.intensity = cur.rim;
    scene.environmentIntensity = cur.env;
    scene.environmentRotation.set(0, cur.spin + Math.sin(t * 0.09) * 0.25, 0);
  };
  return {
    update,
    dispose: () => {
      env.dispose();
      key.shadow.map?.dispose();
    },
  };
}
