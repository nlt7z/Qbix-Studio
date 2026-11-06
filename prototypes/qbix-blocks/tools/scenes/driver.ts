/**
 * Stands in for the site's lib/scene/driver.ts in the library's bundle.
 *
 * The site's driver plays every scene on the page with the scroll. Here the demo
 * page plays it (the gallery's harness, kit/stage.js, walks the timeline's
 * states), so `playScene` only hands the timeline over, through
 * `window.QMSceneReady(tl, n, section, intro)`, and gives back its removal.
 * The timelines are the site's own (components/scene/Scene.tsx builds them).
 *
 * `tallLayout` is the driver's, as is (some scenes ask it which layout to draw).
 */
import type { Timeline } from '@/lib/scene/timeline';

export type PlayedScene = { section: HTMLElement; tl: Timeline; n: number; intro: 'scroll' | 'load' };

type QMWindow = Window & {
  QMSceneReady?: (tl: Timeline, n: number, section: HTMLElement, intro: 'scroll' | 'load') => void;
  QMScenesPlayed?: PlayedScene[];
};

/** Phones and tall windows: the scene sits in a window over the words, which scroll on under it. */
export const tallLayout = () => window.innerWidth < 900 || window.innerWidth / window.innerHeight < 1;

/** Hand a scene's timeline to the page; returns its removal. */
export function playScene(o: { section: HTMLElement; tl: Timeline; n: number; intro?: 'scroll' | 'load' }) {
  const w = window as QMWindow;
  const played: PlayedScene = { section: o.section, tl: o.tl, n: o.n, intro: o.intro ?? 'scroll' };
  // (kept, so a page that registers its callback late can still pick the scene up)
  (w.QMScenesPlayed ||= []).push(played);
  w.QMSceneReady?.(played.tl, played.n, played.section, played.intro);
  return () => {
    const list = w.QMScenesPlayed;
    if (list) {
      const i = list.indexOf(played);
      if (i >= 0) list.splice(i, 1);
    }
    o.tl.dispose();
  };
}
