'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { relayout, useVariant, type VKey } from '@/components/blocks/variants/store';
import { steerScene } from '@/lib/scene/driver';

/**
 * A block whose scene the scroll plays (lib/scene/driver.ts), pinned with its words on a wide screen. The
 * scene's chapter is this section ([data-chapter]); the driver sets data-step on it and sends `scene:step`,
 * which lights the step in the list (blocks.css [data-steps]) and, on a phone, names it under the pinned scene.
 */
export default function Chapter({
  id,
  tone,
  sceneTone,
  side = 'right',
  moves,
  steps,
  caps,
  hidden,
  aud,
  vkey,
  className = '',
  copy,
  scene,
}: {
  id?: string;
  tone: 'white' | 'black';
  /** the drawing's own tone: 'paper' on white, 'dark' on the dark */
  sceneTone?: 'paper' | 'dark';
  side?: 'left' | 'right';
  /** the scene's states less one (each move gets 80vh of scroll) */
  moves: number;
  /** light the step list ([data-steps] .steps li) from the scene's state */
  steps?: boolean;
  /** each state's name, shown under the pinned scene on a phone */
  caps?: string[];
  hidden?: boolean;
  /** the homepage audience it belongs to (data-aud) */
  aud?: 'ai' | 'business';
  /** under review: which of the five ways to play its scene (variants/store.ts), 1 the scroll */
  vkey?: VKey;
  className?: string;
  copy: ReactNode;
  scene: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const picked = useVariant(vkey ?? 'hero');
  const drive = vkey ? picked : 1;
  const [n, setN] = useState(0);
  const [at, setAt] = useState(1);

  // played by something other than the scroll (2 the steps, 3 a timer, 4 a scrubber, 5 the pointer):
  // the chapter is one screen tall and its scene is steered (lib/scene/driver.ts steerScene)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    relayout();
    if (drive === 1) {
      steerScene(el, null);
      return;
    }
    let states = 0;
    let wait = 0;
    const find = () => {
      states = steerScene(el, 1);
      if (states) setN(states);
      else wait = window.setTimeout(find, 300);
    };
    find();
    const go = (t: number) => {
      if (!states) return;
      steerScene(el, t);
      setAt(t);
    };
    const offs: (() => void)[] = [];
    const on = <K extends keyof HTMLElementEventMap>(t: EventTarget, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
      t.addEventListener(type, fn as EventListener);
      offs.push(() => t.removeEventListener(type, fn as EventListener));
    };
    const steps = Array.from(el.querySelectorAll<HTMLLIElement>('.steps li'));
    const run = el.querySelector<HTMLElement>('.ch-run');
    if (drive === 2) {
      // the steps are buttons (pointed at or pressed); with no steps, the picture steps on when pressed
      steps.forEach((li, k) => {
        li.setAttribute('role', 'button');
        li.tabIndex = 0;
        on(li, 'click', () => go(k + 1));
        on(li, 'pointerenter', (e) => (e as PointerEvent).pointerType === 'mouse' && go(k + 1));
        on(li, 'keydown', (e) => ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') && (e.preventDefault(), go(k + 1)));
      });
      if (!steps.length && run) on(run, 'click', () => go(((Math.round(Number(el.dataset.step ?? 0)) + 1) % Math.max(1, states)) + 1));
    }
    if (drive === 3) {
      // on its own, a state at a time, while it is on screen and not pointed at
      let seen = false;
      let held = false;
      const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting), { threshold: 0.4 });
      io.observe(el);
      offs.push(() => io.disconnect());
      on(el, 'pointerenter', () => (held = true));
      on(el, 'pointerleave', () => (held = false));
      let k = 1;
      const tick = window.setInterval(() => {
        if (!seen || held || !states || document.hidden) return;
        k = (k % states) + 1;
        go(k);
      }, 2800);
      offs.push(() => window.clearInterval(tick));
    }
    if (drive === 5 && run) {
      // across the picture, left to right, is the whole story
      on(run, 'pointermove', (e) => {
        const r = run.getBoundingClientRect();
        go(1 + Math.min(1, Math.max(0, ((e as PointerEvent).clientX - r.left) / r.width)) * Math.max(0, states - 1));
      });
    }
    return () => {
      window.clearTimeout(wait);
      offs.forEach((f) => f());
      steps.forEach((li) => {
        li.removeAttribute('role');
        li.removeAttribute('tabindex');
      });
      steerScene(el, null);
    };
  }, [drive]);
  useEffect(() => {
    const el = ref.current;
    if (!el || !caps?.length) return;
    const on = (e: Event) => setStep(Math.min(caps.length - 1, Number((e as CustomEvent).detail) || 0));
    el.addEventListener('scene:step', on);
    return () => el.removeEventListener('scene:step', on);
  }, [caps]);
  return (
    <section
      ref={ref}
      id={id}
      className={`block chapter ${className}`.trim()}
      data-tone={tone}
      data-chapter=""
      data-steps={steps ? '' : undefined}
      data-side={side}
      style={{ '--moves': moves } as CSSProperties}
      hidden={hidden}
      data-aud={aud}
      data-drive={vkey ? drive : undefined}
    >
      <div className="ch-frame">
        <div className="ch-copy">{copy}</div>
        {/* data-run: on a phone the driver plays the scene by this column's own runway (lib/scene/driver.ts) */}
        <div className="ch-run" data-run={moves && drive === 1 ? '' : undefined}>
          <div className="ch-pin">
            <div className="scene" data-tone={sceneTone ?? (tone === 'black' ? 'dark' : 'paper')}>
              {scene}
            </div>
            {drive === 4 && n > 1 && (
              <input
                className="ch-scrub"
                type="range"
                min={1}
                max={n}
                step={0.01}
                value={at}
                aria-label="Play the picture"
                onChange={(e) => {
                  const t = Number(e.target.value);
                  setAt(t);
                  if (ref.current) steerScene(ref.current, t);
                }}
                style={{ '--p': `${((at - 1) / (n - 1)) * 100}%` } as CSSProperties}
              />
            )}
            {drive === 5 && <p className="ch-hint">Move across the picture</p>}
            {drive === 2 && !ref.current?.querySelector('.steps li') && <p className="ch-hint">Click the picture</p>}
            {caps?.length ? (
              <p className="ch-cap" aria-hidden="true">
                <span className="n">
                  {String(step + 1).padStart(2, '0')} / {String(caps.length).padStart(2, '0')}
                </span>
                <span>{caps[step]}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/** A chapter's steps, numbered by the list itself; the one the scene shows is lit. */
export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="steps">
      {items.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ol>
  );
}

/** Price and time, side by side. */
export function Meta({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="meta">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export { up } from '@/components/blocks/up';
