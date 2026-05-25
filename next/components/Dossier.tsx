import { dossierBlocks } from '@/lib/data';
import Capabilities from './Capabilities';

export default function Dossier() {
  return (
    <section className="dossier" id="dossier">
      <div className="section-head">
        <div className="left">
          <div className="sub" style={{ marginBottom: 14 }}>
            <span style={{ color: 'var(--signal)' }}>// 03 DOSSIER</span>
            &nbsp;&nbsp;<span style={{ color: 'var(--off)' }}>studio</span>
          </div>
          <h2>Studio dossier.</h2>
          <div className="sub sub-plain">
            An independent AI-native product design and software studio. We design and build AI products, web and SaaS interfaces, and brand systems — from strategy to launch.
          </div>
        </div>
        <div className="dossier-meta">
          <div>EST. <span>2026</span></div>
          <div>FOUNDERS <span>02</span></div>
          <div>SECTOR <span>UNKNOWN</span></div>
        </div>
      </div>

      <Capabilities />

      <div className="dossier-grid">
        {dossierBlocks.map((b) => (
          <article
            key={b.num}
            className="dossier-block"
            style={b.span ? { gridColumn: 'span 2' } : undefined}
          >
            <div className="d-num">{b.num}</div>
            <h3>{b.title}</h3>
            <p>{b.body}</p>
            {b.tags && (
              <div className="d-tags">
                {b.tags.map((t) => (
                  <span key={t} className="d-tag">{t}</span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
