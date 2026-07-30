import { missions } from '@/lib/data';
import MissionCard from './MissionCard';

export default function Archive() {
  const playable = missions.filter((m) => m.status === 'playable');
  const inDev = missions.filter((m) => m.status !== 'playable');

  return (
    <section className="archive" id="archive">
      <div className="section-head">
        <div className="left">
          <div className="sub" style={{ marginBottom: 14 }}>
            <span style={{ color: 'var(--signal)' }}>// 02 ARCHIVE</span>
            &nbsp;&nbsp;<span style={{ color: 'var(--off)' }}>our games</span>
          </div>
          {/* h1: Archive is the /games page's top-level heading. */}
          <h1>Mission archive.</h1>
          <div className="sub sub-plain">
            Four small game systems in development. One playable. Three in concept build.
          </div>
        </div>
      </div>

      {playable.length > 0 && (
        <>
          <div className="sub" style={{ margin: '8px 0 14px', color: 'var(--signal)' }}>
            // PLAYABLE
          </div>
          <div className="mission-grid">
            {playable.map((m, i) => (
              <MissionCard key={m.id} mission={m} index={i} />
            ))}
          </div>
        </>
      )}

      {inDev.length > 0 && (
        <>
          <div className="sub" style={{ margin: '40px 0 14px', color: 'var(--off)' }}>
            // IN DEVELOPMENT
          </div>
          <div className="mission-grid">
            {inDev.map((m, i) => (
              <MissionCard key={m.id} mission={m} index={i + playable.length} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
