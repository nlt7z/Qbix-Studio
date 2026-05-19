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
export async function POST(req: Request) {
  let body: { name?: string; email?: string; brief?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, brief } = body;
  if (!name || !email || !brief) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }

  // eslint-disable-next-line no-console
  console.log('[contact]', { name, email, brief });

  return NextResponse.json({ ok: true });
}
