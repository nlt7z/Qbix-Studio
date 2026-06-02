import { NextResponse } from 'next/server';
import { CONTACT_EMAIL } from '@/lib/data';

export const runtime = 'nodejs';

/**
 * Contact endpoint — delivers project briefs via Resend.
 *
 * Set these in `.env.local` (and in your Vercel project env):
 *   RESEND_API_KEY   — required to actually send mail (get one at resend.com)
 *   CONTACT_TO       — where briefs land (defaults to CONTACT_EMAIL)
 *   CONTACT_FROM     — verified sender, e.g. "Qbix Studio <hello@qbix.space>".
 *                      Falls back to Resend's shared "onboarding@resend.dev"
 *                      sender, which works without domain verification.
 *
 * Without RESEND_API_KEY the submission is logged to the server console and
 * the request still succeeds, so local dev works without secrets.
 */
type ContactBody = {
  name?: string;
  email?: string;
  brief?: string;
  // Optional richer fields from the full /start project form. The quick modal
  // omits these, so they must never be required.
  company?: string;
  projectTypes?: string[];
  budget?: string;
  timeline?: string;
  source?: string; // 'modal' | 'start-page'
};

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row(label: string, value?: string): string {
  if (!value) return '';
  return `<tr><td style="padding:4px 16px 4px 0;color:#888;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:4px 0;color:#111">${escapeHtml(value)}</td></tr>`;
}

export async function POST(req: Request) {
  let body: ContactBody = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, brief, company, projectTypes, budget, timeline, source } = body;
  if (!name || !email || !brief) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }

  const src = source ?? 'modal';
  const types = projectTypes?.length ? projectTypes.join(', ') : undefined;

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO || CONTACT_EMAIL;
  const from = process.env.CONTACT_FROM || 'Qbix Studio <onboarding@resend.dev>';

  // No key configured (local dev / preview) — log and succeed so the form works.
  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn(
      '[contact] RESEND_API_KEY not set — logging instead of emailing.',
      { name, email, brief, company, projectTypes, budget, timeline, source: src },
    );
    return NextResponse.json({ ok: true });
  }

  const subject = `New project brief — ${name}${company ? ` (${company})` : ''}`;
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5">
      <p style="margin:0 0 12px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.06em">Qbix · ${escapeHtml(src)}</p>
      <table style="border-collapse:collapse;margin-bottom:16px">
        ${row('Name', name)}
        ${row('Email', email)}
        ${row('Company', company)}
        ${row('Project', types)}
        ${row('Budget', budget)}
        ${row('Timeline', timeline)}
      </table>
      <p style="margin:0 0 6px;color:#888">Brief</p>
      <div style="white-space:pre-wrap;color:#111;border-left:3px solid #b2e851;padding-left:12px">${escapeHtml(brief)}</div>
    </div>`;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      // eslint-disable-next-line no-console
      console.error('[contact] Resend error', res.status, detail);
      return NextResponse.json(
        { ok: false, error: 'Email delivery failed' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[contact] Resend request threw', err);
    return NextResponse.json(
      { ok: false, error: 'Email delivery failed' },
      { status: 502 },
    );
  }
}
