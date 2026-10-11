import type { Metadata } from 'next';
import Link from 'next/link';
import Colophon from '@/components/Colophon';
import SplitText from '@/components/SplitText';
import SubHero from '@/components/sub/SubHero';
import SubSection from '@/components/sub/SubSection';
import { previews } from '@/components/MissionPreviews';
import { missions } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Games',
  description:
    'Game and interaction-system experiments from Qbix. Four small game systems in development — one playable, three in concept build.',
};

export default function GamesPage() {
  const playable = missions.filter((m) => m.status === 'playable');
  const inBuild = missions.filter((m) => m.status !== 'playable');

  return (
    <>
      <main className="sp">
        <SubHero
          crumb={{ href: '/#products', label: 'Products' }}
          eyebrow="Qbix Labs · Games"
          title="Games."
          lede="Four small game systems in development. One playable. Three in concept build."
        />

        <SubSection index="G.1 — Playable" title="Play it now">
          {playable.map((m) => {
            const Preview = previews[m.preview];
            return (
              <article key={m.id} className="sp-feature">
                <Link href={m.href ?? '/games'} className="sp-window sp-feature-media" aria-label={`Open ${m.title}`}>
                  <span className="sp-window-bar" aria-hidden>
                    <i /><i /><i />
                    <span className="mono">{m.num}</span>
                  </span>
                  <span className="sp-window-body">
                    <Preview />
                  </span>
                </Link>
                <div className="sp-feature-copy">
                  <span className="sp-index mono">{m.statusLabel}</span>
                  <h3 className="sp-feature-title">{m.title}</h3>
                  <p className="sp-feature-text">{m.hook}</p>
                  <div className="svc-tags">
                    {m.tags.map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                  {m.href && (
                    <Link href={m.href} className="btn btn-primary btn-lg split-cta">
                      <SplitText text={`Open ${m.title}`} arrow />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </SubSection>

        <SubSection tone="lime" index="G.2 — In build" title="On the bench">
          <ul className="sp-bench">
            {inBuild.map((m) => {
              const Preview = previews[m.preview];
              return (
                <li key={m.id}>
                  <div className="sp-window">
                    <span className="sp-window-bar" aria-hidden>
                      <i /><i /><i />
                      <span className="mono">{m.num}</span>
                    </span>
                    <span className="sp-window-body">
                      <Preview />
                    </span>
                  </div>
                  <h3 className="sp-bench-title">{m.title}</h3>
                  <p className="sp-bench-text">{m.hook}</p>
                  <span className="sp-chip mono">{m.statusLabel}</span>
                </li>
              );
            })}
          </ul>
        </SubSection>
      </main>
      <Colophon />
    </>
  );
}
