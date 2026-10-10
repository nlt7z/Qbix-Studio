/**
 * Footer sign-off — "qbix" behind a pane of reeded (fluted) glass.
 *
 * The word is set flat and sharp in the headline face; a full-width pane of
 * vertical ribs slices it into shifted strips with a thin chromatic fringe.
 * One clear slot, two ribs wide, rides the pointer on a spring and shows the
 * true word through it, its edges drawn as 1px lime hairlines.
 *
 * Motion is optical and structural only — no opacity or blur changes:
 *  · entrance: the word starts sharp; the pane slides in from the right,
 *    hard-edged with a 1px leading hairline, then the ribs settle 1.3 → 1.0;
 *  · idle: the rib grid drifts sideways (~8px/s), like walking past the glass;
 *  · pointer: the slot follows x; fast moves briefly deepen the refraction;
 *    away from the footer the slot parks over the "x".
 *
 * Plain WebGL1, one full-screen pass, ~30fps, only while on screen.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;      // device px
uniform float uDpr;
uniform float uRib;     // rib width, device px
uniform float uShift;   // max sample shift, device px
uniform float uDrift;   // device px
uniform float uPane;    // pane's left edge, device px (glass to the right of it)
uniform float uSlotX;   // device px
uniform float uSlotW;   // device px

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }
float A(vec2 px) { return texture2D(uTex, px / uRes).a; }
vec4 over(vec4 top, vec4 bot) { return top + bot * (1.0 - top.a); }

void main() {
  vec2 px = vec2(vUv.x * uRes.x, vUv.y * uRes.y);
  vec3 ink = vec3(0.969, 0.973, 0.973);

  float inPane = step(uPane, px.x);
  float dSlot = abs(px.x - uSlotX) - uSlotW * 0.5;
  float glass = inPane * step(0.0, dSlot);

  vec4 word;
  if (glass > 0.5) {
    float rp = (px.x + uDrift) / uRib;
    float local = fract(rp) - 0.5;                       // -0.5 .. 0.5 across a rib
    // Each rib is a little cylindrical lens: it re-samples a shifted strip.
    float shift = local * uShift * 1.1 + (hash(floor(rp)) - 0.5) * uShift * 0.35;
    float ca = uShift * 0.07;
    float r = A(px + vec2(shift + ca, 0.0));
    float g = A(px + vec2(shift, 0.0));
    float b = A(px + vec2(shift - ca, 0.0));
    float shade = 1.0 - 0.38 * pow(abs(local) * 2.0, 4.0);  // darker toward rib edges
    word = vec4(ink * vec3(r, g, b) * shade, max(r, max(g, b)));

    // The glass itself: a soft per-rib sheen and a hard ridge line.
    float sheen = 0.035 * clamp(0.5 - local, 0.0, 1.0);
    float ridge = (1.0 - smoothstep(0.0, 1.2 * uDpr, (0.5 - abs(local)) * uRib)) * 0.09;
    word = over(vec4(vec3(1.0) * (sheen + ridge), sheen + ridge), word);
  } else {
    float a = A(px);
    word = vec4(ink * a, a);
  }

  // Slot edges (inside the pane): 1px lime hairlines.
  float slotLine = inPane * (1.0 - smoothstep(0.0, 1.0 * uDpr, abs(dSlot)));
  word = over(vec4(vec3(0.722, 1.0, 0.0) * slotLine, slotLine), word);

  // The pane's leading edge while it slides in: a 1px white hairline.
  float lead = (1.0 - smoothstep(0.0, 1.0 * uDpr, abs(px.x - uPane))) * 0.75 * step(1.0, uPane);
  word = over(vec4(vec3(1.0) * lead, lead), word);

  gl_FragColor = word;
}`;

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function mountFooterMark(host: HTMLElement, opts: { reduced: boolean; onReady: () => void }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'footer-mark-canvas';
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) throw new Error('WebGL unavailable');
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
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    canvas.remove();
    throw new Error('Reeded-glass shader failed to link');
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = {
    res: U('uRes'), dpr: U('uDpr'), rib: U('uRib'), shift: U('uShift'), drift: U('uDrift'),
    pane: U('uPane'), slotX: U('uSlotX'), slotW: U('uSlotW'), tex: U('uTex'),
  };

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(u.tex, 0);

  // --- the word, drawn to a 2D canvas in the headline face -------------------
  const family =
    getComputedStyle(document.documentElement).getPropertyValue('--font-eurostile').trim() || 'sans-serif';
  const wordCanvas = document.createElement('canvas');
  const wctx = wordCanvas.getContext('2d')!;
  let W = 1;
  let H = 1;
  let dpr = 1;
  let parkX = 0;       // device px — centre of the "x"
  let ribPx = 30;

  const drawWord = () => {
    wordCanvas.width = W;
    wordCanvas.height = H;
    wctx.clearRect(0, 0, W, H);
    wctx.font = `400 1000px ${family}`;
    const m = wctx.measureText('qbix');
    const asc = m.actualBoundingBoxAscent;
    const desc = m.actualBoundingBoxDescent;
    // Fill the width; the baseline sits near the stage floor so the q's tail
    // sinks below the page edge.
    void desc;
    const k = Math.min((0.94 * W) / m.width, (0.86 * H) / asc);
    const size = 1000 * k;
    wctx.font = `400 ${size}px ${family}`;
    wctx.fillStyle = '#ffffff';
    wctx.textBaseline = 'alphabetic';
    const wm = wctx.measureText('qbix');
    const x0 = (W - wm.width) / 2;
    const y0 = H * 0.93;
    wctx.fillText('qbix', x0, y0);
    parkX = x0 + wctx.measureText('qbi').width + wctx.measureText('x').width / 2;

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, wordCanvas);
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = host.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width * dpr));
    H = Math.max(1, Math.round(r.height * dpr));
    canvas.width = W;
    canvas.height = H;
    gl.viewport(0, 0, W, H);
    ribPx = Math.max(18, Math.min(34, r.width / 44)) * dpr;
    drawWord();
    if (slot.x === 0) slot.x = parkX;
    render(performance.now());
  };

  // --- motion state ------------------------------------------------------------
  const slot = { x: 0, v: 0, target: 0 };
  let pointerX: number | null = null;
  let lastPX = 0;
  let lastPT = 0;
  let boost = 0;
  let dragging = false;
  let entered = opts.reduced;
  let enterAt = 0;
  let drift = 0;
  let prev = performance.now();

  const toDevice = (clientX: number) => (clientX - host.getBoundingClientRect().left) * dpr;
  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    if (e.pointerType === 'mouse') {
      const near = e.clientY > r.top - 160 && e.clientY < r.bottom + 40;
      pointerX = near ? toDevice(e.clientX) : null;
    } else if (dragging) {
      pointerX = toDevice(e.clientX);
    }
    const now = performance.now();
    if (pointerX !== null && lastPT) {
      const v = Math.abs(e.clientX - lastPX) / Math.max(1, now - lastPT);   // css px / ms
      boost = Math.max(boost, Math.min(0.25, v * 0.12));
    }
    lastPX = e.clientX;
    lastPT = now;
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    dragging = true;
    pointerX = toDevice(e.clientX);
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    pointerX = null;   // touch: the slot parks back over the "x"
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);

  let ready = false;
  const render = (now: number) => {
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;

    // Pane: off to the right until the footer is in view, then slides across.
    let pane = W;
    let strength = 1;
    if (opts.reduced) pane = 0;
    else if (entered) {
      const t = (now - enterAt) / 1000;
      pane = W * (1 - easeOut(clamp01(t / 0.9)));
      strength = t < 0.9 ? 1.3 : 1.3 - 0.3 * easeOut(clamp01((t - 0.9) / 0.35));
    }

    if (!opts.reduced) {
      drift += 8 * dpr * dt;
      slot.target = pointerX ?? parkX;
      const acc = (slot.target - slot.x) * 170 - slot.v * 26;
      slot.v += acc * dt;
      slot.x += slot.v * dt;
      boost *= Math.exp(-dt / 0.3);
    } else {
      slot.x = parkX;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(u.res, W, H);
    gl.uniform1f(u.dpr, dpr);
    gl.uniform1f(u.rib, ribPx);
    gl.uniform1f(u.shift, ribPx * 0.42 * strength * (1 + boost));
    gl.uniform1f(u.drift, drift);
    gl.uniform1f(u.pane, pane);
    gl.uniform1f(u.slotX, slot.x);
    gl.uniform1f(u.slotW, ribPx * 2);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (!ready) {
      ready = true;
      opts.onReady();
    }
  };

  const FRAME_MS = 1000 / 30;
  let raf = 0;
  let last = 0;
  let visible = false;
  const loop = (now: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    if (now - last >= FRAME_MS) {
      last = now;
      render(now);
    }
    raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (opts.reduced) return;
    if (visible && !document.hidden && !raf) {
      prev = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };
  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      if (visible && !entered && e.intersectionRatio >= 0.4) {
        entered = true;
        enterAt = performance.now();
      }
      kick();
    },
    { threshold: [0, 0.4, 0.8] },
  );
  io.observe(host);
  document.addEventListener('visibilitychange', kick);

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  // Wait for the headline face so the word isn't drawn in a fallback font.
  document.fonts.load(`400 100px ${family}`).finally(() => resize());

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', kick);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    host.removeEventListener('pointerdown', onDown);
    gl.deleteTexture(tex);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.remove();
  };
}
