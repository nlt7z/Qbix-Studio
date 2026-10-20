'use client';

import { useEffect, useRef } from 'react';
import '@/app/scenes.css';

/**
 * The qbix cube: 2 × 2 × 2 pieces of frosted glass round a lime core, seen
 * in true perspective. Each piece is a rounded box; the glass reflects a soft
 * studio light along its edges and lets the core's light through, diffused,
 * so it glows from inside and leaks out along the seams. It gathers from a
 * loose spread after the splash, then half of it turns every few seconds,
 * and it leans a little toward the pointer. Ray-marched in one WebGL2
 * fragment shader, drawn only while something moves.
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
uniform mat3 uRi[8];     // piece inverse rotations
uniform float uH;        // half size of a piece
uniform float uTone;     // 0 black page, 1 paper
uniform vec3 uCore;      // the core's colour
uniform float uGlow;     // how strongly it shines
uniform float uDist;     // camera distance
uniform float uTanF;     // tan(fov / 2)

const float CORE = 0.2;  // the core's half size (a small cube)
float sdBox(vec3 p, vec3 b) { vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }

// a soft studio, in world space: a large key above and to the left, a strip to the right
vec3 env(vec3 r) {
  float key = exp(-pow(length(r.xy - vec2(-0.42, 0.78)) / 0.42, 2.0)) * step(0.0, r.z + 0.6);
  float strip = exp(-pow((r.x - 0.9) / 0.07, 2.0)) * smoothstep(-0.3, 0.5, r.y);
  float l = 0.02 + 1.3 * key + 0.6 * strip + smoothstep(0.2, 1.0, r.y) * 0.2;
  return mix(vec3(l), vec3(0.9) + vec3(0.25) * key - vec3(0.4) * strip, uTone);
}
// how far a point on a piece's face is from that face's nearest edge
float edgeDist(vec3 q) {
  vec3 a = abs(q);
  float m = max(max(a.x, a.y), a.z);
  float across = m == a.x ? max(a.y, a.z) : (m == a.y ? max(a.x, a.z) : max(a.x, a.y));
  return uH - across;
}

vec4 shade(vec2 fc) {
  vec2 uv = (fc - 0.5 * uRes) / (0.5 * uRes.y);
  vec3 ro = vec3(0.0, 0.0, uDist);
  vec3 rd = normalize(vec3(uv * uTanF, -1.0));
  mat3 vt = transpose(uView);
  vec3 roc = vt * ro, rdc = vt * rd;
  float px = 2.0 * uTanF * uDist / uRes.y;
  // every piece the ray passes through: in and out
  float tFirst = 1e9, glass = 0.0;
  int first = -1;
  vec3 qFirst = vec3(0.0), nFirst = vec3(0.0);
  float tin[8], tout[8];
  for (int i = 0; i < 8; i++) {
    vec3 o = uRi[i] * (roc - uC[i]);
    vec3 d = uRi[i] * rdc;
    d += vec3(equal(d, vec3(0.0))) * 1e-6;
    vec3 t1 = (-uH - o) / d, t2 = (uH - o) / d;
    vec3 mn = min(t1, t2), mx = max(t1, t2);
    float a = max(max(mn.x, mn.y), mn.z), b = min(min(mx.x, mx.y), mx.z);
    tin[i] = a;
    tout[i] = b;
    if (b > max(a, 0.0)) {
      glass += b - a;
      if (a < tFirst) {
        tFirst = a;
        first = i;
        qFirst = o + d * a;
        vec3 ax = vec3(equal(mn, vec3(a)));
        nFirst = -sign(d) * ax;
      }
    }
  }
  // the core, seen through the glass in front of it, blurred by it
  float tc = dot(-roc, rdc);
  float before = 0.0;
  for (int i = 0; i < 8; i++) {
    if (tout[i] > max(tin[i], 0.0)) before += max(0.0, min(tout[i], tc) - tin[i]);
  }
  float blur = 0.03 + 0.14 * before;
  float near = 1e9;
  for (int i = 0; i < 9; i++) {
    float tt = tc + (float(i) / 8.0 - 0.5) * 0.8;
    near = min(near, sdBox(roc + rdc * tt, vec3(CORE)));
  }
  float core = (1.0 - smoothstep(-blur * 0.3, blur, near)) * mix(0.55, 1.0, exp(-1.6 * before));
  float halo = exp(-max(near, 0.0) * max(near, 0.0) / (0.02 + 0.06 * before)) * 0.4;
  if (first < 0) {
    // no glass on this ray: only the core's light, if it reaches past the cube
    return vec4(0.0);
  }
  // the near face
  vec3 n = transpose(uRi[first]) * nFirst;
  vec3 nw = uView * n;
  float cosT = clamp(dot(-rd, nw), 0.0, 1.0);
  float F = 0.04 + 0.96 * pow(1.0 - cosT, 5.0);
  vec3 L = normalize(vec3(-0.45, 0.85, 0.3));
  float key = clamp(0.5 + 0.5 * dot(nw, L), 0.0, 1.0);
  // the frost: the more glass the ray passes through, the milkier
  float T = exp(-1.45 * glass);
  float milkA = 1.0 - T;
  vec3 milk = mix(vec3(0.86, 0.885, 0.9), vec3(0.985), uTone) * (0.42 + 0.5 * key);
  // the edges inside, seen through the frost: soft, softer the deeper they sit
  float inner = 0.0;
  for (int i = 0; i < 8; i++) {
    if (!(tout[i] > max(tin[i], 0.0))) continue;
    vec3 o = uRi[i] * (roc - uC[i]);
    vec3 d = uRi[i] * rdc;
    if (i != first) {
      float dep = tin[i] - tFirst;
      float w = 0.015 + 0.07 * dep;
      inner += (1.0 - smoothstep(0.0, w, edgeDist(o + d * tin[i]))) * exp(-1.2 * dep);
    }
    float dep2 = tout[i] - tFirst;
    float w2 = 0.015 + 0.07 * dep2;
    inner += (1.0 - smoothstep(0.0, w2, edgeDist(o + d * tout[i]))) * exp(-1.2 * dep2);
  }
  // the near face's own edges: a crisp line of light
  float rim = 1.0 - smoothstep(0.0, px * 1.4 + 0.006, edgeDist(qFirst));
  vec3 edgeCol = mix(vec3(1.0), vec3(0.12, 0.13, 0.14), uTone);
  vec3 col = milk * milkA;
  float alpha = milkA * mix(0.86, 0.62, uTone);
  col += edgeCol * inner * 0.32 * mix(1.0, 0.55, uTone);
  alpha += inner * mix(0.22, 0.3, uTone);
  vec3 lime = uCore * uGlow;
  col = mix(col, lime, clamp(core * 0.9, 0.0, 1.0));
  alpha = mix(alpha, 1.0, core * 0.9 * uGlow);
  col += lime * halo * (1.0 - core);
  alpha += halo * uGlow * 0.35 * (1.0 - core);
  // the room in the near face, and its edge catching the light
  vec3 refl = env(reflect(rd, nw));
  col += refl * F;
  alpha += F * 0.6;
  // (on paper the edge reads as a fine dark line instead)
  col += mix(vec3(1.0), vec3(0.18, 0.19, 0.2), uTone) * rim * mix(0.75, 0.6, uTone);
  alpha += rim * mix(0.75, 0.6, uTone);
  alpha = clamp(alpha, 0.0, 1.0);
  return vec4(min(col, vec3(1.0)), alpha);
}

void main() {
  // four rays a pixel, so the edges are smooth
  vec4 acc = vec4(0.0);
  for (int i = 0; i < 4; i++) {
    vec2 o = vec2(float(i % 2), float(i / 2)) * 0.5 - 0.25;
    acc += shade(gl_FragCoord.xy + o);
  }
  frag = acc * 0.25;
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
    const tone = () => (canvas.closest<HTMLElement>('[data-tone]')?.dataset.tone === 'paper' ? 1 : 0);

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
    const uRes = U('uRes'), uView = U('uView'), uC = U('uC'), uRi = U('uRi'), uH = U('uH');
    const uTone = U('uTone'), uCore = U('uCore'), uGlow = U('uGlow'), uDist = U('uDist'), uTanF = U('uTanF');
    const FOV = (20 * Math.PI) / 180;
    gl.uniform1f(uH, 0.465);
    gl.uniform1f(uDist, 15);
    gl.uniform1f(uTanF, Math.tan(FOV / 2));
    gl.uniform3fv(uCore, lime ? [0.72, 1.0, 0.0] : [0.85, 0.86, 0.84]);

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
      gl.uniform1f(uTone, tone());
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
