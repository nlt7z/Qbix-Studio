import { CONTACT_EMAIL } from '@/lib/data';

export default function Transmission() {
  return (
    <section className="transmission" id="transmission">
      <div className="tm-bar">
        <span className="sub" style={{ color: 'var(--signal)' }}>// 04 TRANSMISSION</span>
        &nbsp;&nbsp;<span className="sub" style={{ color: 'var(--off)' }}>contact</span>
      </div>

      <div className="tm-frame">
        <span className="tm-corner tl" aria-hidden />
        <span className="tm-corner br" aria-hidden />

        <header className="tm-head">
          <span className="tm-dot" />
          <span className="tm-title">TRANSMISSION OPEN</span>
          <span className="tm-spacer" />
          <span className="tm-state">RX READY</span>
        </header>

        <div className="tm-body">
          <p className="tm-lead">
            For press, collaboration, publishing, or general inquiries — send a signal.
          </p>

          <a className="tm-mail" href={`mailto:${CONTACT_EMAIL}`}>
            <span className="tm-mail-prefix">→</span>
            <span className="tm-mail-addr">{CONTACT_EMAIL}</span>
          </a>

          <div className="tm-note">
            Response within 48h. No newsletters, no funnels, no AI auto-replies.
          </div>
        </div>
      </div>
    </section>
  );
}
