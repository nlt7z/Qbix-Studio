/**
 * The Scenes group's bundle: the site's own scene components (components/scenes),
 * with React, exposed as window.QMScenes.mount(name, el, props).
 *
 *   const s = QMScenes.mount('forma', el, props)   // el sits inside <section data-chapter data-tone="…">
 *   window.QMSceneReady = (tl, n, section, intro) => { … }   // the timeline, once built
 *   s.unmount()
 *
 * props go to the scene (Dream takes { biz }); `pictures` is the page's own:
 * true shows the real things as photographs, false as drawings, left out as the
 * site has it (see pictures.tsx here). Built by tools/scenes/build.cjs.
 */
import { createElement, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Forma from '@/components/scenes/Forma';
import Kova from '@/components/scenes/Kova';
import Labs from '@/components/scenes/Labs';
import Dream from '@/components/scenes/Dream';
import { ListingStory, ListingTour, ListingHero } from '@/components/scenes/Listing';
import { PracticeStory, PracticeTourScene, PracticeHero } from '@/components/scenes/Practice';
import { StrataHero, StrataTour } from '@/components/scenes/Strata';
import GlassCube from '@/components/scene/GlassCube';
import { Force, Pictures } from '@/components/scene/pictures';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SCENES: Record<string, ComponentType<any>> = {
  forma: Forma,
  kova: Kova,
  labs: Labs,
  dream: Dream,
  'listing-story': ListingStory,
  'listing-tour': ListingTour,
  'listing-hero': ListingHero,
  'practice-story': PracticeStory,
  'practice-tour': PracticeTourScene,
  'practice-hero': PracticeHero,
  'strata-hero': StrataHero,
  'strata-tour': StrataTour,
  'glass-cube': GlassCube,
};

/** The faces the scenes set type in (the kit's qbix.css declares them): in before anything is measured. */
const FACES = ['400 16px Eurostile', '400 16px Geist', '500 16px Geist', '600 16px Geist', '400 16px "Encode Sans"', '500 16px "Encode Sans"'];
const fonts = () =>
  document.fonts ? Promise.all(FACES.map((f) => document.fonts.load(f).catch(() => []))).then(() => undefined) : Promise.resolve();

type Props = { pictures?: boolean; [k: string]: unknown };

function mount(name: string, el: HTMLElement, props: Props = {}) {
  const Scene = SCENES[name];
  if (!Scene) throw new Error(`QMScenes: no scene "${name}" (${Object.keys(SCENES).join(', ')})`);
  if (!el.closest('[data-chapter]')) throw new Error('QMScenes: mount inside a <section data-chapter data-tone="…">, the scene reads its colours from it');
  const { pictures, ...rest } = props;
  let root: Root | null = createRoot(el);
  // the faces first: a scene measures its words when it builds its timeline (tl.type)
  const ready = fonts().then(() => {
    if (!root) return;
    root.render(
      createElement(Force.Provider, { value: pictures }, createElement(Pictures.Provider, { value: pictures ?? false }, createElement(Scene, rest))),
    );
  });
  return {
    ready,
    unmount() {
      root?.unmount();
      root = null;
    },
  };
}

(window as unknown as { QMScenes: unknown }).QMScenes = { mount, names: Object.keys(SCENES), fonts };
