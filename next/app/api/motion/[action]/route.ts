import { NextResponse, type NextRequest } from 'next/server';
import { ApiError, COOKIE, SESSION_SECS, join, me, save, signin, signout } from '@/lib/motion-accounts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Qbix Motion's accounts (lib/motion-accounts.ts), for the static page at /motion:
 *
 *   GET  /api/motion/me        the member signed in (or null) and the ids they saved
 *   POST /api/motion/join      {name, email, password}
 *   POST /api/motion/signin    {email, password}
 *   POST /api/motion/signout
 *   POST /api/motion/save      {id, on}
 *
 * The answers are what the library's own tools/serve.py gives on localhost, so the page's app.js
 * talks to either. A POST must come from this site's page: same Origin, JSON, and the X-QM header
 * (which a cross-site form cannot send without a preflight this route never answers).
 */

type Result = { reply: object; cookie: string | null };

function answer(r: Result, status = 200) {
  const res = NextResponse.json(r.reply, { status, headers: { 'Cache-Control': 'no-store' } });
  if (r.cookie !== null) {
    res.cookies.set(COOKIE, r.cookie, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: r.cookie ? SESSION_SECS : 0,
    });
  }
  return res;
}
const refuse = (status: number, error: string) => answer({ reply: { ok: false, error }, cookie: null }, status);

function fromPage(req: NextRequest) {
  if (req.headers.get('x-qm') !== '1') return false;
  const origin = req.headers.get('origin');
  if (!origin) return true; // same-origin GETs may come without one
  try {
    return new URL(origin).host === (req.headers.get('x-forwarded-host') || req.headers.get('host'));
  } catch {
    return false;
  }
}
const ipOf = (req: NextRequest) => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';

async function handle(req: NextRequest, action: string, work: () => Promise<Result>) {
  if (!fromPage(req)) return refuse(403, 'That request did not come from the gallery.');
  try {
    return answer(await work());
  } catch (e) {
    if (e instanceof ApiError) return refuse(e.status, e.message);
    console.error(`motion ${action}:`, e);
    return refuse(500, 'Something went wrong on our side. Try again in a moment.');
  }
}

export async function GET(req: NextRequest, { params }: { params: { action: string } }) {
  if (params.action !== 'me') return refuse(404, 'There is no such request.');
  return handle(req, 'me', () => me(req.cookies.get(COOKIE)?.value));
}

export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  const { action } = params;
  if (!['join', 'signin', 'signout', 'save'].includes(action)) return refuse(404, 'There is no such request.');
  if (!(req.headers.get('content-type') || '').includes('application/json')) return refuse(403, 'That request did not come from the gallery.');
  return handle(req, action, async () => {
    const text = await req.text();
    if (text.length > 10_000) throw new ApiError(413, 'That request is too big.');
    let body: Record<string, unknown> = {};
    if (text.trim()) {
      try {
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
        body = parsed;
      } catch {
        throw new ApiError(400, "That request isn't valid JSON.");
      }
    }
    const token = req.cookies.get(COOKIE)?.value;
    if (action === 'join') return join(body, ipOf(req));
    if (action === 'signin') return signin(body, ipOf(req), token);
    if (action === 'signout') return signout(token);
    return save(body, token);
  });
}
