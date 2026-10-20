'use client';

import { useEffect, useRef } from 'react';
import '@/app/scenes.css';

/**
 * The qbix cube: 2 × 2 × 2 pieces of frosted glass round a lime core, seen
 * in true perspective. Each piece has frosted faces and polished, rounded
 * edges that mirror a soft studio; light bends into the glass (most at the
 * edges), the core shows through it blurred, its light fills the glass near it
 * and leaks out between the pieces. It gathers from a loose spread after the
 * splash, then half of it turns every few seconds, and it leans a little
 * toward the pointer. Traced per pixel in one WebGL2 fragment shader (the
 * pieces are rounded boxes, intersected exactly), drawn only while something
 * moves.
 */

type V3 = [number, number, number];
type M3 = number[]; // row-major 3×3

const I3: M3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
const mul = (a: M3, b: M3): M3 => {
  const o = new Array(9).fill(0);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
  return o;
};
const apply = (m: M3, v: V3): V3 => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
const transpose = (m: M3): M3 => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
const rotAxis = (axis: number, a: number): M3 => {
  const c = Math.cos(a), s = Math.sin(a);
  if (axis === 0) return [1, 0, 0, 0, c, -s, 0, s, c];
  if (axis === 1) return [c, 0, s, 0, 1, 0, -s, 0, c];
  return [c, -s, 0, s, c, 0, 0, 0, 1];
};
const round3 = (m: M3): M3 => m.map((x) => Math.round(x));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 frag;
uniform vec2 uRes;
uniform mat3 uView;      // cube space -> world
uniform vec3 uC[8];      // piece centres (cube space)
uniform mat3 uRi[8];     // piece inverse rotations (cube space -> piece space)
uniform float uH;        // half size of a piece
uniform float uR;        // the radius its polished edges are rounded to
uniform float uTone;     // 0 black page, 1 paper (or lime)
uniform float uLimePage; // 1 on lime: the frost and the core are white
uniform vec3 uCore;      // the core's colour
uniform float uGlow;     // how strongly it shines
uniform float uDist;     // camera distance
uniform float uTanF;     // tan(fov / 2)
uniform int uAA;         // rays a pixel (1, 2 or 4)

const float CORE = 0.17; // the core's half size (a small cube)
const vec3 KEY = vec3(-0.55, 0.75, 0.38);   // the studio's big softbox, up and to the left, in front

float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }

// A rounded box (half size size + rad, edges rounded to rad), entered by a ray: its t, or -1.
// After Inigo Quilez, https://iquilezles.org/articles/intersectors
float rbox(vec3 ro, vec3 rd, vec3 size, float rad) {
  vec3 m = 1.0 / rd;
  vec3 n = m * ro;
  vec3 k = abs(m) * (size + rad);
  vec3 t1 = -n - k, t2 = -n + k;
  float tN = max(max(t1.x, t1.y), t1.z);
  float tF = min(min(t2.x, t2.y), t2.z);
  if (tN > tF || tF < 0.0) return -1.0;
  float t = tN;
  vec3 pos = ro + t * rd;
  vec3 s = sign(pos);
  ro *= s; rd *= s; pos *= s;
  pos -= size;
  pos = max(pos.xyz, pos.yzx);
  if (min(min(pos.x, pos.y), pos.z) < 0.0) return t;
  vec3 oc = ro - size;
  vec3 dd = rd * rd, oo = oc * oc, od = oc * rd;
  float ra2 = rad * rad;
  t = 1e20;
  { float b = od.x + od.y + od.z; float c = oo.x + oo.y + oo.z - ra2; float h = b * b - c; if (h > 0.0) t = -b - sqrt(h); }
  { float a = dd.y + dd.z; float b = od.y + od.z; float c = oo.y + oo.z - ra2; float h = b * b - a * c;
    if (h > 0.0) { h = (-b - sqrt(h)) / a; if (h > 0.0 && h < t && abs(ro.x + rd.x * h) < size.x) t = h; } }
  { float a = dd.z + dd.x; float b = od.z + od.x; float c = oo.z + oo.x - ra2; float h = b * b - a * c;
    if (h > 0.0) { h = (-b - sqrt(h)) / a; if (h > 0.0 && h < t && abs(ro.y + rd.y * h) < size.y) t = h; } }
  { float a = dd.x + dd.y; float b = od.x + od.y; float c = oo.x + oo.y - ra2; float h = b * b - a * c;
    if (h > 0.0) { h = (-b - sqrt(h)) / a; if (h > 0.0 && h < t && abs(ro.z + rd.z * h) < size.z) t = h; } }
  return t > 1e19 ? -1.0 : t;
}
vec3 rboxN(vec3 p, vec3 size) { return sign(p) * normalize(max(abs(p) - size, 1e-6)); }
// where a ray is inside a sharp box of half size h
vec2 slab(vec3 o, vec3 d, float h) {
  vec3 inv = 1.0 / d;
  vec3 t1 = (-h - o) * inv, t2 = (h - o) * inv;
  vec3 mn = min(t1, t2), mx = max(t1, t2);
  return vec2(max(max(mn.x, mn.y), mn.z), min(min(mx.x, mx.y), mx.z));
}
// how far a point on a piece is from the nearest edge of the face it's on
float edgeDist(vec3 q) {
  vec3 a = abs(q);
  float m = max(max(a.x, a.y), a.z);
  float across = m == a.x ? max(a.y, a.z) : (m == a.y ? max(a.x, a.z) : max(a.x, a.y));
  return uH - across;
}

// The studio, as the polished edges mirror it: on the black page a big softbox and a tall strip in the
// dark; on paper a white room with dark flags at the sides and below, so the glass keeps its outline.
float envSharp(vec3 r) {
  float key = smoothstep(0.8, 0.93, dot(r, normalize(KEY)));
  vec2 h = normalize(r.xz + vec2(1e-4));
  float strip = smoothstep(0.94, 0.99, dot(h, normalize(vec2(0.95, -0.32)))) * smoothstep(-0.45, 0.1, r.y) * (1.0 - smoothstep(0.55, 0.85, r.y));
  // a dimmer strip on the left and a low bounce from below, so the shaded side keeps its outline
  float fillL = smoothstep(0.95, 0.99, dot(h, normalize(vec2(-0.96, 0.28)))) * smoothstep(-0.6, -0.1, r.y) * (1.0 - smoothstep(0.3, 0.7, r.y));
  float bounce = smoothstep(-0.25, -0.75, r.y) * smoothstep(-0.2, 0.6, r.z);
  // (bright like real lights: a polished edge mirrors 4% straight on, nearly all at a glance)
  float dark = 0.01 + 14.0 * key + 7.0 * strip + 3.0 * fillL + 1.2 * bounce + 0.5 * smoothstep(0.35, 1.0, r.y);
  // a dark band all round, just under eye level, as dark cards round a white set: the edges that mirror it read dark
  float band = 1.0 - smoothstep(0.06, 0.3, abs(r.y + 0.04));
  float paper = 0.96 - 0.82 * band - 0.3 * smoothstep(-0.4, -0.9, r.y) + 0.3 * key;
  return mix(dark, paper, uTone);
}
// ... and as the frosted faces see it: only its broad light
float envSoft(vec3 r) {
  float k = max(dot(r, normalize(KEY)), 0.0);
  float dark = 0.02 + 0.9 * k * k * k + 0.08 * smoothstep(-0.2, 1.0, r.y);
  float paper = 0.9 + 0.1 * k - 0.15 * smoothstep(0.0, -0.8, r.y);
  return mix(dark, paper, uTone);
}

vec4 shade(vec2 fc) {
  vec2 uv = (fc - 0.5 * uRes) / (0.5 * uRes.y);
  vec3 ro = vec3(0.0, 0.0, uDist);
  vec3 rd = normalize(vec3(uv * uTanF, -1.0));
  mat3 vt = transpose(uView);
  vec3 roc = vt * ro, rdc = vt * rd;

  // the nearest piece, its rounded surface
  float tHit = 1e9;
  int hit = -1;
  for (int i = 0; i < 8; i++) {
    vec3 o = uRi[i] * (roc - uC[i]);
    vec3 d = uRi[i] * rdc;
    d += vec3(equal(d, vec3(0.0))) * 1e-6;
    float t = rbox(o, d, vec3(uH - uR), uR);
    if (t > 0.0 && t < tHit) { tHit = t; hit = i; }
  }
  if (hit < 0) return vec4(0.0);

  vec3 P = roc + rdc * tHit;
  vec3 q = uRi[hit] * (P - uC[hit]);
  vec3 nq = rboxN(q, vec3(uH - uR));
  vec3 N = transpose(uRi[hit]) * nq;
  vec3 Nw = uView * N;
  float ndv = clamp(dot(Nw, -rd), 0.0, 1.0);
  float F = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
  // the frosted faces (1) and the polished, rounded edges (0)
  float frostFace = smoothstep(0.992, 0.9995, max(max(abs(nq.x), abs(nq.y)), abs(nq.z)));
  vec3 Rw = reflect(rd, Nw);
  float refl = mix(envSharp(Rw), envSoft(Rw), frostFace);

  // into the glass: bent at the surface (most at the edges), then through the rest of the cube
  // (bent gently, so the core reads as one cube inside, a little shifted at the edges)
  vec3 Ti = refract(rdc, N, 1.0 / 1.2);
  vec3 P0 = P + Ti * 0.002;
  float thick = 0.0, inner = 0.0;
  for (int i = 0; i < 8; i++) {
    vec3 o = uRi[i] * (P0 - uC[i]);
    vec3 d = uRi[i] * Ti;
    d += vec3(equal(d, vec3(0.0))) * 1e-6;
    vec2 s = slab(o, d, uH);
    float a = max(s.x, 0.0), b = s.y;
    if (b <= a) continue;
    thick += b - a;
    // the edges of the pieces behind, through the frost: faint, and softer the deeper they sit
    if (i != hit && s.x > 0.0) inner += (1.0 - smoothstep(0.0, 0.02 + 0.09 * a, edgeDist(o + d * a))) * exp(-2.0 * a);
    inner += (1.0 - smoothstep(0.0, 0.02 + 0.09 * b, edgeDist(o + d * b))) * exp(-2.0 * b) * 0.6;
  }
  // the core, along the straight view (so it reads as one cube inside), blurred by the glass in front of it
  float tc0 = dot(-roc, rdc);
  float beforeS = 0.0;
  for (int i = 0; i < 8; i++) {
    vec3 o = uRi[i] * (roc - uC[i]);
    vec3 d = uRi[i] * rdc;
    d += vec3(equal(d, vec3(0.0))) * 1e-6;
    vec2 sl = slab(o, d, uH);
    if (sl.y > sl.x) beforeS += max(0.0, min(sl.y, tc0) - max(sl.x, 0.0));
  }
  // its nearest distance to the line of sight: a golden-section search (along a line the distance is convex)
  float ga = tc0 - 0.6, gb = tc0 + 0.6;
  for (int k = 0; k < 14; k++) {
    float m1 = gb - (gb - ga) * 0.618, m2 = ga + (gb - ga) * 0.618;
    if (sdBox(roc + rdc * m1, vec3(CORE)) < sdBox(roc + rdc * m2, vec3(CORE))) gb = m2; else ga = m1;
  }
  float nearC = sdBox(roc + rdc * (0.5 * (ga + gb)), vec3(CORE));
  float blur = 0.04 + 0.07 * beforeS;
  float coreSeen = (1.0 - smoothstep(-blur * 0.5, blur, nearC)) * exp(-0.55 * beforeS);
  // its light, carried through the frost: a soft cloud round it, and a glow in the glass nearest it
  float cloud = exp(-max(nearC, 0.0) * 7.0) * min(1.0, 0.25 + beforeS);
  // ... and leaking out between the pieces: the seams on the faces toward the core
  vec3 toCore = uRi[hit] * (-uC[hit]);
  vec3 sq = uH - q * sign(toCore + vec3(1e-5));
  float seamD = min(min(sq.x, sq.y), sq.z);
  float seam = exp(-seamD / 0.014) * exp(-max(length(P) - 0.6, 0.0) * 3.0);
  // a face that looks at the core (seen through a gap) is lit by it directly
  float facing = max(dot(N, normalize(-P)), 0.0) * exp(-max(length(P) - 0.25, 0.0) * 1.8);

  vec3 lime = uCore * uGlow;
  float key = max(dot(Nw, normalize(KEY)), 0.0);
  // the black page: dark glass, lit from within, its edges catching the studio
  vec3 milkD = vec3(0.82, 0.86, 0.9) * (1.0 - exp(-1.1 * thick)) * (0.13 + 0.34 * key * key);
  // the lime, seen through milky glass: a little paler at its blurred edge
  vec3 limeSeen = mix(lime, lime * 0.6 + vec3(0.35), 1.0 - coreSeen) ;
  vec3 colD = milkD
    + limeSeen * 0.9 * coreSeen + lime * (0.45 * cloud + 1.0 * seam + 1.2 * facing)
    + vec3(0.85, 0.9, 1.0) * inner * 0.2
    + vec3(refl) * F;
  float aD = clamp((1.0 - exp(-1.4 * thick)) * 0.6 + F * 0.9 + 0.3 * coreSeen, 0.0, 1.0);
  // paper: clear, cool glass that darkens the page a touch, with the lime as a colour, not a light;
  // on lime: white frost that pales the lime behind it, round a white core (the lime, the frost, the light)
  vec3 tint = mix(vec3(0.8, 0.84, 0.87), vec3(1.0), uLimePage);
  float bodyP = (1.0 - exp(-1.0 * thick)) * mix(0.36, 0.5, uLimePage) * (1.0 - 0.7 * coreSeen * uLimePage);
  float limeP = mix(0.8 * coreSeen + 0.35 * cloud + 0.6 * seam + 0.5 * facing, 1.1 * coreSeen + 0.2 * cloud + 0.35 * seam + 0.3 * facing, uLimePage);
  float aP = clamp(bodyP + F * 0.9 + limeP + inner * 0.14, 0.0, 1.0);
  vec3 colP = tint * bodyP
    + uCore * limeP * mix(0.55, 1.0, uGlow)
    + vec3(0.2, 0.22, 0.24) * inner * 0.14
    + vec3(refl) * F * 0.9;
  vec3 col = mix(colD, colP, uTone);
  float alpha = mix(aD, aP, uTone);
  return vec4(min(col, vec3(1.2)), alpha);
}

void main() {
  vec4 acc = vec4(0.0);
  for (int i = 0; i < 4; i++) {
    if (i >= uAA) break;
    vec2 o = uAA == 1 ? vec2(0.0) : uAA == 2 ? vec2(i == 0 ? -0.25 : 0.25, i == 0 ? -0.25 : 0.25) : vec2(float(i % 2), float(i / 2)) * 0.5 - 0.25;
    acc += shade(gl_FragCoord.xy + o);
  }
  frag = acc / float(uAA);
}`;

type Piece = { p: V3; R: M3 };

export default function GlassCube({
  className = '',
  label = 'The qbix cube: eight pieces of frosted glass round a lime core, half of it turning now and then',
  lime = true,
}: {
  className?: string;
  label?: string;
  /** false where the screen's one lime is something else (a form's button): the core is a dim white */
  lime?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const page = () => canvas.closest<HTMLElement>('[data-tone]')?.dataset.tone;

    /* the program */
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn('[cube]', gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[cube]', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = U('uRes'), uView = U('uView'), uC = U('uC'), uRi = U('uRi'), uH = U('uH'), uR = U('uR');
    const uTone = U('uTone'), uLimePage = U('uLimePage'), uCore = U('uCore'), uGlow = U('uGlow'), uDist = U('uDist'), uTanF = U('uTanF'), uAA = U('uAA');
    const FOV = (20 * Math.PI) / 180;
    gl.uniform1f(uH, 0.465);
    gl.uniform1f(uR, 0.06);
    // four rays a pixel where there's a mouse (a computer), two on a phone
    gl.uniform1i(uAA, fine ? 4 : 2);
    gl.uniform1f(uDist, 15);
    gl.uniform1f(uTanF, Math.tan(FOV / 2));

    /* the pieces, solved: one in each octant */
    const pieces: Piece[] = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) pieces.push({ p: [x, y, z], R: I3 });

    /* sizing: drawn at the canvas's own size (a little under the screen's density on phones) */
    let W = 1, H = 1;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, fine ? 2 : 1.5);
      W = Math.max(1, Math.round(r.width * dpr));
      H = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      dirty = true;
    };

    /* motion */
    let gatherAt: number | null = null;
    let sawSplash = false;
    type Turn = { axis: number; side: number; dir: number; start: number; dur: number };
    let turn: Turn | null = null;
    let last: Turn | null = null;
    let nextTurnAt = 0;
    let seed = 5;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const startTurn = (now: number) => {
      let axis = 0, side = 1, dir = 1;
      for (let i = 0; i < 8; i++) {
        axis = Math.floor(rnd() * 3);
        side = rnd() < 0.5 ? -1 : 1;
        dir = rnd() < 0.5 ? -1 : 1;
        if (!last || !(last.axis === axis && last.side === side && last.dir === -dir)) break;
      }
      turn = { axis, side, dir, start: now, dur: 900 };
    };
    const endTurn = (tr: Turn) => {
      const m = round3(rotAxis(tr.axis, (tr.dir * Math.PI) / 2));
      for (const pc of pieces) {
        if (pc.p[tr.axis] !== tr.side) continue;
        pc.p = apply(m, pc.p).map((v) => Math.round(v)) as V3;
        pc.R = round3(mul(m, pc.R));
      }
      last = tr;
    };

    let lean = { x: 0, y: 0 }, leanS = { x: 0, y: 0 };
    let dirty = true;
    const C = new Float32Array(24), RI = new Float32Array(72);
    const draw = (now: number) => {
      gl.viewport(0, 0, W, H);
      gl.uniform2f(uRes, W, H);
      const tone = page();
      gl.uniform1f(uTone, tone === 'paper' || tone === 'lime' ? 1 : 0);
      gl.uniform1f(uLimePage, tone === 'lime' ? 1 : 0);
      gl.uniform3fv(uCore, tone === 'lime' ? [1.0, 1.0, 1.0] : lime ? [0.72, 1.0, 0.0] : [0.85, 0.86, 0.84]);
      // the view: a three-quarter view from above, leaning toward the pointer
      const yaw = -0.62 + leanS.x * 0.16, pitch = 0.5 + leanS.y * 0.08;
      const view = mul(rotAxis(0, pitch), rotAxis(1, yaw));
      // three.js-style column-major upload of a row-major matrix: transpose
      gl.uniformMatrix3fv(uView, false, new Float32Array(transpose(view)));
      const g = gatherAt === null ? 0 : reduced ? 1 : clamp01((now - gatherAt) / 1600);
      const tr = turn;
      const k = tr ? easeInOut(clamp01((now - tr.start) / tr.dur)) : 0;
      const turning = tr ? rotAxis(tr.axis, (tr.dir * Math.PI * k) / 2) : I3;
      pieces.forEach((pc, i) => {
        const spread = 0.5 * (1 + 0.55 * (1 - easeOut(clamp01(g * 1.15 - (pc.p[1] + 1) * 0.06))));
        let c: V3 = [pc.p[0] * spread, pc.p[1] * spread, pc.p[2] * spread];
        let M = pc.R;
        if (tr && pc.p[tr.axis] === tr.side) {
          c = apply(turning, c);
          M = mul(turning, M);
        }
        C.set(c, i * 3);
        // the inverse rotation, uploaded column-major (so the shader gets transpose(M) = M⁻¹)
        RI.set(M, i * 9);
      });
      gl.uniform3fv(uC, C);
      gl.uniformMatrix3fv(uRi, false, RI);
      gl.uniform1f(uGlow, (lime ? 1 : 0.35) * (0.35 + 0.65 * g));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      dirty = false;
    };

    let raf = 0, visible = false;
    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      const splashUp = (window as unknown as { __qbixSplashDone?: boolean }).__qbixSplashDone === false;
      if (splashUp) sawSplash = true;
      if (gatherAt === null && !splashUp) {
        gatherAt = now + (sawSplash ? 380 : 0);
        nextTurnAt = gatherAt + (reduced ? Infinity : 2600);
      }
      leanS.x += (lean.x - leanS.x) * 0.08;
      leanS.y += (lean.y - leanS.y) * 0.08;
      const leaning = Math.abs(lean.x - leanS.x) > 0.001 || Math.abs(lean.y - leanS.y) > 0.001;
      if (turn && now >= turn.start + turn.dur) {
        endTurn(turn);
        turn = null;
        nextTurnAt = now + 2600 + rnd() * 1200;
        dirty = true;
      }
      if (!turn && gatherAt !== null && !reduced && now >= nextTurnAt) startTurn(now);
      const gathering = gatherAt !== null && now - gatherAt < 1800;
      if (gatherAt !== null && now < gatherAt) dirty = true;
      if (dirty || leaning || turn || gathering) draw(now);
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      kick();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        dirty = true;
        kick();
      }
    });
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      lean = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
      kick();
    };
    if (fine && !reduced) window.addEventListener('pointermove', onMove, { passive: true });
    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
      visible = false;
    };
    canvas.addEventListener('webglcontextlost', onLost);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('webglcontextlost', onLost);
      // (the context stays: a remount gets the same canvas and context back)
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [lime]);

  return <canvas ref={ref} className={`glass-cube ${className}`} role="img" aria-label={label} />;
}
