'use client';

import { useEffect, useRef, useState } from 'react';
import { LAND_DOTS_B64 } from './globeDots';
import { watchCovered } from '@/components/three/covered';

/**
 * Studio globe — a dotted Earth in 3D (orthographic, drawn with Canvas 2D, so
 * no WebGL context) marking where the studio works: Seattle and the San
 * Francisco Bay Area, joined by a lifted arc. The land dots are lit by the
 * real sun: the day side reads bright, the night side dim, so the terminator
 * on the globe is the actual time of day. Next to it, the studio's local time.
 *
 * The globe sways around the Pacific Northwest and can be dragged (inertia).
 * ~30 fps, only while on screen and not covered by the next panel.
 */

const PLACES = [
  { name: 'Seattle, WA', lat: 47.6062, lon: -122.3321 },
  { name: 'San Francisco Bay Area', lat: 37.7749, lon: -122.4194 },
];
const TZ = 'America/Los_Angeles';
const RAD = Math.PI / 180;
const FRAME_MS = 1000 / 30;

function decodeDots() {
  const bin = atob(LAND_DOTS_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const ints = new Int16Array(bytes.buffer);
  const n = ints.length / 2;
  // Precompute unit vectors (x toward lon 0, y up, z toward lon 90°E).
  const xyz = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const lat = (ints[i * 2] / 100) * RAD;
    const lon = (ints[i * 2 + 1] / 100) * RAD;
    xyz[i * 3] = Math.cos(lat) * Math.cos(lon);
    xyz[i * 3 + 1] = Math.sin(lat);
    xyz[i * 3 + 2] = Math.cos(lat) * Math.sin(lon);
  }
  return { n, xyz };
}

const toXYZ = (lat: number, lon: number) => [
  Math.cos(lat * RAD) * Math.cos(lon * RAD),
  Math.sin(lat * RAD),
  Math.cos(lat * RAD) * Math.sin(lon * RAD),
];

/** Sub-solar point (lat, lon) for a UTC date — good to a fraction of a degree. */
function subsolar(d: Date) {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const day = (d.getTime() - start) / 86400000;
  const decl = -23.44 * Math.cos(((2 * Math.PI) / 365) * (day + 10));
  const hours = d.getUTCHours() + d.getUTCMinutes() / 60;
  return { lat: decl, lon: -15 * (hours - 12) };
}

function useStudioTime() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return null;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return { hm: `${get('hour')}:${get('minute')}`, s: get('second'), ampm: get('dayPeriod'), zone: get('timeZoneName') };
}

function Globe() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'globe-canvas';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    host.appendChild(canvas);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const { n, xyz } = decodeDots();
    const places = PLACES.map((p) => toXYZ(p.lat, p.lon));
    // The arc: great-circle points between the two places, lifted mid-way.
    const ARC_STEPS = 40;
    const [a, b] = places;
    const dotAB = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const omega = Math.acos(Math.min(1, dotAB));
    const arc: number[][] = [];
    for (let i = 0; i <= ARC_STEPS; i++) {
      const t = i / ARC_STEPS;
      const s0 = Math.sin((1 - t) * omega) / Math.sin(omega);
      const s1 = Math.sin(t * omega) / Math.sin(omega);
      const lift = 1 + 0.16 * Math.sin(Math.PI * t);
      arc.push([(a[0] * s0 + b[0] * s1) * lift, (a[1] * s0 + b[1] * s1) * lift, (a[2] * s0 + b[2] * s1) * lift]);
    }

    let W = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(host.getBoundingClientRect().width));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(W * dpr);
      draw(performance.now());
    };

    // View: centred a little east of the coast so both cities sit left of
    // centre with North America behind them; a gentle sway; tilt to the north.
    const HOME_LON = -106;
    const TILT = 28 * RAD;
    const view = { lon: HOME_LON, vel: 0, drag: false, lastX: 0, lastT: 0, offset: 0 };
    let sun = subsolar(new Date());
    let sunAt = 0;
    const BUCKETS = 12;
    const paths: Path2D[] = [];

    const draw = (now: number) => {
      if (!W) return;
      if (now - sunAt > 60000) {
        sun = subsolar(new Date());
        sunAt = now;
      }
      const R = W * 0.47;
      const cx = W / 2;
      const cy = W / 2;
      const lon0 = view.lon * RAD;
      const cosT = Math.cos(TILT);
      const sinT = Math.sin(TILT);
      const cosL = Math.cos(lon0);
      const sinL = Math.sin(lon0);
      const S = toXYZ(sun.lat, sun.lon);
      // Project a unit vector: rotate about Y by -lon0, then tilt about X.
      const project = (x: number, y: number, z: number) => {
        // rotate so lon0 faces the viewer (+Z toward the camera)
        const x1 = -x * sinL + z * cosL;
        const z1 = x * cosL + z * sinL;
        const y2 = y * cosT - z1 * sinT;
        const z2 = y * sinT + z1 * cosT;
        return [x1, y2, z2];
      };

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, W);

      // Sphere edge.
      ctx.strokeStyle = 'rgba(247, 248, 248, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // Land dots, batched into alpha buckets (one fill per bucket).
      for (let k = 0; k < BUCKETS; k++) paths[k] = new Path2D();
      const back = new Path2D();
      const size = Math.max(1.3, W / 150);
      for (let i = 0; i < n; i++) {
        const x = xyz[i * 3];
        const y = xyz[i * 3 + 1];
        const z = xyz[i * 3 + 2];
        const [px, py, pz] = project(x, y, z);
        const sx = cx + px * R - size / 2;
        const sy = cy - py * R - size / 2;
        if (pz < 0) {
          back.rect(sx, sy, size * 0.8, size * 0.8);
          continue;
        }
        const light = x * S[0] + y * S[1] + z * S[2];          // cos of the angle to the sun
        const day = Math.min(1, Math.max(0, (light + 0.08) / 0.22));
        const limb = 0.35 + 0.65 * pz;                          // fade toward the edge
        const alpha = (0.2 + 0.72 * day) * limb;
        paths[Math.min(BUCKETS - 1, Math.floor(alpha * BUCKETS))].rect(sx, sy, size, size);
      }
      ctx.fillStyle = 'rgba(247, 248, 248, 0.06)';
      ctx.fill(back);
      for (let k = 0; k < BUCKETS; k++) {
        ctx.fillStyle = `rgba(232, 236, 238, ${((k + 0.5) / BUCKETS).toFixed(3)})`;
        ctx.fill(paths[k]);
      }

      // The arc between the two studio cities (front side only).
      ctx.strokeStyle = '#B8FF00';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      let pen = false;
      for (const p of arc) {
        const [px, py, pz] = project(p[0], p[1], p[2]);
        if (pz < -0.05) {
          pen = false;
          continue;
        }
        const sx = cx + px * R;
        const sy = cy - py * R;
        if (pen) ctx.lineTo(sx, sy);
        else ctx.moveTo(sx, sy);
        pen = true;
      }
      ctx.stroke();

      // City markers: a lime square with a ring that keeps opening outward.
      const pulse = reduce ? 0.5 : (now / 1600) % 1;
      for (const p of places) {
        const [px, py, pz] = project(p[0], p[1], p[2]);
        if (pz < 0) continue;
        const sx = cx + px * R;
        const sy = cy - py * R;
        const m = Math.max(4, W / 46);
        ctx.fillStyle = '#B8FF00';
        ctx.fillRect(sx - m / 2, sy - m / 2, m, m);
        const ring = m * (1.2 + 2.2 * pulse);
        ctx.strokeStyle = `rgba(184, 255, 0, ${(0.9 * (1 - pulse)).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(sx - ring / 2, sy - ring / 2, ring, ring);
      }
    };

    // Drag to spin; let go and it eases back into the sway.
    const onDown = (e: PointerEvent) => {
      view.drag = true;
      view.lastX = e.clientX;
      view.lastT = performance.now();
      host.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!view.drag) return;
      const t = performance.now();
      const dx = e.clientX - view.lastX;
      view.offset -= dx * 0.45;
      view.vel = (-dx * 0.45) / Math.max(1, t - view.lastT);
      view.lastX = e.clientX;
      view.lastT = t;
    };
    const onUp = () => {
      view.drag = false;
    };
    host.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);

    let raf = 0;
    let last = 0;
    let prev = performance.now();
    let clock = 0;
    let visible = false;
    let covered = false;
    const loop = (now: number) => {
      raf = 0;
      if (!visible || covered || document.hidden) return;
      if (now - last >= FRAME_MS - 2) {
        const dt = Math.min(0.1, (now - prev) / 1000);
        prev = now;
        last = now;
        clock += dt;
        if (!view.drag) {
          view.offset += view.vel * dt * 1000;
          view.vel *= Math.exp(-dt * 3);
          view.offset *= Math.exp(-dt * 0.6);   // drift home
        }
        view.lon = HOME_LON + 16 * Math.sin(clock * 0.22) + view.offset;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (reduce) return;
      if (visible && !covered && !document.hidden && !raf) {
        prev = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick();
    });
    io.observe(host);
    const unwatch = watchCovered(host, (c) => {
      covered = c;
      kick();
    });
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    document.addEventListener('visibilitychange', kick);
    // Reduced motion: a still globe, refreshed each minute for the terminator.
    const still = reduce ? window.setInterval(() => draw(performance.now()), 60000) : 0;

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      unwatch();
      window.clearInterval(still);
      document.removeEventListener('visibilitychange', kick);
      host.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="globe" aria-hidden />;
}

export default function StudioGlobe() {
  const time = useStudioTime();
  return (
    <div className="studio">
      <Globe />
      <div className="studio-read">
        <span className="studio-label mono">Studio</span>
        <ul className="studio-places">
          {PLACES.map((p) => (
            <li key={p.name}>
              <i aria-hidden />
              {p.name}
            </li>
          ))}
        </ul>
        <span className="studio-time" role="timer" aria-label={time ? `Studio time ${time.hm} ${time.ampm} ${time.zone}` : 'Studio time'}>
          <span className="studio-hm">{time ? time.hm : '--:--'}</span>
          <span className="studio-s">{time ? `:${time.s}` : ''}</span>
          <span className="studio-ampm mono">{time ? time.ampm : ''}</span>
        </span>
        <span className="studio-zone mono">Pacific time{time ? ` · ${time.zone}` : ''}</span>
      </div>
    </div>
  );
}
