import { studioCapabilities } from '@/lib/data';

export default function Capabilities() {
  return (
    <div className="capabilities">
      <div className="cap-bar">
        <div className="cap-bar-left">
          <span className="sub" style={{ color: 'var(--signal)' }}>// CAPABILITIES</span>
          &nbsp;&nbsp;<span className="sub" style={{ color: 'var(--off)' }}>what we do well</span>
        </div>
        <div className="cap-bar-right">
          <span>INDEX 07 / 07</span>
          <span className="dot" />
          <span>HUMAN-LED · SYSTEM-FIRST</span>
        </div>
      </div>

      <div className="cap-matrix">
        {studioCapabilities.map((c) => (
          <article
            key={c.num}
            className={`cap-tile ${c.wide ? 'wide' : ''}`}
          >
            <div className="cap-tile-head">
              <span className="cap-tile-num">{c.num}</span>
              <span className="cap-tile-tag">{c.tag}</span>
            </div>
            <h3 className="cap-tile-label">{c.label}</h3>
            <div className="cap-tile-cn">{c.cn}</div>
            <p className="cap-tile-note">{c.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
