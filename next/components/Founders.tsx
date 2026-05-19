import { founders } from '@/lib/data';

export default function Founders() {
  return (
    <div className="crew">
      <div className="crew-bar">
        <div className="crew-bar-left">
          <span className="sub" style={{ color: 'var(--signal)' }}>// FOUNDERS</span>
          &nbsp;&nbsp;<span className="sub" style={{ color: 'var(--off)' }}>who&apos;s behind this</span>
        </div>
        <div className="crew-bar-right">
          <span>02 / 02 ONLINE</span>
          <span className="dot" />
          <span>NO HIRES · NO MIDDLEMEN</span>
        </div>
      </div>

      <div className="crew-grid">
        {founders.map((m) => (
          <article key={m.id} className="crew-card">
            <div className="crew-id">
              <div className="crew-letter" aria-hidden>{m.id}</div>
              <div className="crew-meta">
                <div className="crew-callsign">{m.callsign}</div>
                <div className="crew-role">{m.role}</div>
                <div className="crew-role-cn">{m.roleCn}</div>
              </div>
            </div>

            <p className="crew-blurb">{m.blurb}</p>

            <div className="crew-caps">
              {m.capabilities.map((c) => (
                <div key={c.label} className="cap">
                  <div className="cap-num">{c.num}</div>
                  <div className="cap-label">{c.label}</div>
                  <div className="cap-cn">{c.cn}</div>
                  <div className="cap-note">{c.note}</div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
