import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Placeholder contact endpoint.
 *
 * Currently just logs the submission and returns 200. To wire to a real
 * destination, swap the body of POST with one of:
 *
 *   - Resend / Postmark / SendGrid: fetch their API with payload
 *   - Formspree / Basin: forward the JSON
 *   - Slack webhook: POST { text: ... } to the incoming webhook URL
 *
 * Read the secret from process.env, not from a hard-coded value.
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

  // eslint-disable-next-line no-console
  console.log('[contact]', {
    name,
    email,
    brief,
    company,
    projectTypes,
    budget,
    timeline,
    source: source ?? 'modal',
  });

  return NextResponse.json({ ok: true });
}
