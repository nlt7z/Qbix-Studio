'use client';

import { useEffect, useRef } from 'react';
import { watchCovered } from '@/components/three/covered';
import { whenLinked } from '@/components/three/glLink';

/**
 * 1-bit dither field for the lime panels — a slow-drifting noise field pushed
 * through an 8×8 Bayer matrix and printed as hard dark-ink dots, densest at the
 * panel's foot and thinning upward, so the flat lime reads as a printed plane
 * rather than an empty fill. The pointer gathers dots around it; as the panel
 * rides into view the field dithers in from the bottom (a threshold sweep, not
 * a fade). Hard-edged pixels only — no blur anywhere.
 *
 * WebGL1, one quad, ~30fps and only while the panel is on screen. Renders
 * nothing if WebGL is missing; reduced-motion gets a single still frame.
 */

const CELL = 7;          // CSS px per dither cell
const DOT = 3;           // CSS px dot inside each cell
const FRAME_MS = 1000 / 24;   // a slow drift — 24fps is plenty

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;       // canvas size in device px
uniform float uScale;    // device px per CSS px
uniform float uTime;
uniform vec2 uMouse;     // CSS px, y-down; far off when absent
uniform float uReveal;   // 0 → 1 as the panel enters

float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 css = gl_FragCoord.xy / uScale;                 // CSS px, y-up
  vec2 cell = floor(css / ${CELL.toFixed(1)});
  vec2 local = css - cell * ${CELL.toFixed(1)};
  if (local.x >= ${DOT.toFixed(1)} || local.y >= ${DOT.toFixed(1)}) discard;

  vec2 size = uRes / uScale;
  float y = (cell.y * ${CELL.toFixed(1)}) / size.y;    // 0 at the foot, 1 at the top

  // Ground swell: dense at the foot, thinning upward; the reveal lifts it in.
  float reach = mix(-0.05, 0.62, uReveal);
  float ground = clamp((reach - y) / 0.62, 0.0, 1.0);
  float n = fbm(cell * 0.045 + vec2(uTime * 0.05, -uTime * 0.11));
  float v = ground * ground * (0.25 + 1.05 * n);

  // Pointer bloom — dots gather in a ring around the cursor.
  vec2 m = vec2(uMouse.x, size.y - uMouse.y);
  float d = distance(cell * ${CELL.toFixed(1)}, m);
  v += 0.62 * exp(-d * d / (2.0 * 150.0 * 150.0)) * (0.55 + 0.6 * n);

  if (v <= bayer8(cell) + 0.04) discard;
  gl_FragColor = vec4(vec3(0.059, 0.102, 0.0) * 0.3, 0.3);   // --signal-dark, premultiplied
}`;

export default function DitherField() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const panel = host?.parentElement;
    if (!host || !panel) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'dither-canvas';
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) return;
    host.appendChild(canvas);

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);

    // The rest waits for the link to finish off the main thread.
    let cancelled = false;
    let teardown: (() => void) | undefined;
    const setup = () => {
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'aPos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const u = {
        res: gl.getUniformLocation(prog, 'uRes'),
        scale: gl.getUniformLocation(prog, 'uScale'),
        time: gl.getUniformLocation(prog, 'uTime'),
        mouse: gl.getUniformLocation(prog, 'uMouse'),
        reveal: gl.getUniformLocation(prog, 'uReveal'),
      };

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let scale = 1;
      const resize = () => {
        // Dots are whole CSS px, so render at 1× and let the browser scale up
        // with image-rendering: pixelated — same crisp dots, a quarter of the
        // fragments on retina screens.
        scale = 1;
        const r = host.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(r.width * scale));
        canvas.height = Math.max(1, Math.round(r.height * scale));
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (reduce) draw(performance.now());
      };

      const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        const r = host.getBoundingClientRect();
        mouse.tx = e.clientX - r.left;
        mouse.ty = e.clientY - r.top;
        if (mouse.x < -9000) {
          mouse.x = mouse.tx;
          mouse.y = mouse.ty;
        }
      };
      if (!reduce) window.addEventListener('pointermove', onMove, { passive: true });

      let reveal = reduce ? 1 : 0;
      const draw = (now: number) => {
        const r = panel.getBoundingClientRect();
        const vh = window.innerHeight;
        // How far the panel has risen into the viewport: 0 at the fold, 1 once
        // its top has climbed 70% of the screen.
        const target = reduce ? 1 : Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.7)));
        reveal += (target - reveal) * 0.12;
        mouse.x += (mouse.tx - mouse.x) * 0.18;
        mouse.y += (mouse.ty - mouse.y) * 0.18;

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(u.res, canvas.width, canvas.height);
        gl.uniform1f(u.scale, scale);
        gl.uniform1f(u.time, reduce ? 12 : now / 1000);
        gl.uniform2f(u.mouse, mouse.x, mouse.y);
        gl.uniform1f(u.reveal, reveal);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };

      let raf = 0;
      let last = 0;
      let visible = false;
      let covered = false;
      const loop = (now: number) => {
        raf = 0;
        if (!visible || covered || document.hidden) return;
        if (now - last >= FRAME_MS) {
          last = now;
          draw(now);
        }
        raf = requestAnimationFrame(loop);
      };
      const kick = () => {
        if (!reduce && visible && !covered && !raf) raf = requestAnimationFrame(loop);
      };

      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();
      // -1px: a panel whose edge merely touches the viewport isn't "visible".
      const io = new IntersectionObserver(
        ([e]) => {
          visible = e.isIntersecting;
          kick();
        },
        { rootMargin: '-1px 0px' },
      );
      io.observe(host);
      // The lime panels are sticky: stop drawing once the next panel covers them.
      const unwatch = watchCovered(host, (c) => {
        covered = c;
        kick();
      });
      document.addEventListener('visibilitychange', kick);

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        unwatch();
        window.removeEventListener('pointermove', onMove);
        document.removeEventListener('visibilitychange', kick);
      };
    };
    whenLinked(gl, prog).then((ok) => {
      if (cancelled) return;
      if (ok) teardown = setup();
      else canvas.remove();
    });

    return () => {
      cancelled = true;
      teardown?.();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="dither-field" aria-hidden />;
}
