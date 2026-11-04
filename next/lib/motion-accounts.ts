import { createHash, pbkdf2, randomBytes, timingSafeEqual } from 'node:crypto';
import PIECES from '@/lib/motion-ids.json';

/**
 * Accounts for Qbix Motion at qbix.space/motion (the static copy in public/motion/, made by the
 * library's tools/site.py). A member joins with a name, an email and a password, and can then copy
 * a piece's code and keep a bench of saved pieces. The gate is soft: the demo pages themselves hold
 * the code, so it asks visitors to join rather than locking anything away.
 *
 * Kept in Upstash Redis over its REST API (Vercel → Storage → Upstash for Redis sets
 * KV_REST_API_URL and KV_REST_API_TOKEN; UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN work
 * too). With neither, development keeps everything in memory and production answers 503 'accounts-off'.
 *
 *   qm:user:<email>       {id, name, handle, email, joined, salt, hash}   (email lowercased)
 *   qm:sess:<sha256>      {uid, email}, expires with the session            (never the token itself)
 *   qm:saves:<uid>        sorted set of piece ids, by when they were saved
 *   qm:savers:<piece>     set of member ids who saved it
 *   qm:rl:<what>:<who>    a counter for rate limits, expiring with its window
 *
 * Passwords: PBKDF2-HMAC-SHA256, 240,000 rounds, a 16-byte salt each (as tools/serve.py does locally).
 */

export const COOKIE = 'qm_session';
export const SESSION_SECS = 30 * 24 * 3600;
const ROUNDS = 240_000;
const NO_SALT = Buffer.alloc(16);
const ID_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TOKEN_RE = /^[A-Za-z0-9_-]{16,128}$/;
const pieces = new Set<string>(PIECES as string[]);

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/* --- the store: Upstash's REST API, or memory while developing ----------------------------- */
type Cmd = (string | number)[];
interface Store {
  run(cmds: Cmd[]): Promise<unknown[]>;
}

function upstash(): Store | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return {
    async run(cmds) {
      const r = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(cmds),
        cache: 'no-store',
      });
      if (!r.ok) throw new Error(`upstash ${r.status}`);
      const out = (await r.json()) as { result?: unknown; error?: string }[];
      return out.map((x) => {
        if (x.error) throw new Error(`upstash: ${x.error}`);
        return x.result;
      });
    },
  };
}

// The few commands used here, in memory, kept on globalThis so a hot reload does not sign everyone out.
type Mem = { kv: Map<string, { v: unknown; until: number }> };
function memory(): Store {
  const g = globalThis as unknown as { __qmMem?: Mem };
  const m = g.__qmMem || (g.__qmMem = { kv: new Map() });
  const live = (k: string) => {
    const e = m.kv.get(k);
    if (e && e.until && e.until < Date.now()) { m.kv.delete(k); return undefined; }
    return e;
  };
  const zset = (k: string) => { const e = live(k); return (e ? e.v : new Map()) as Map<string, number>; };
  const set = (k: string) => { const e = live(k); return (e ? e.v : new Set()) as Set<string>; };
  const one = (c: Cmd): unknown => {
    const [op, k] = [String(c[0]).toUpperCase(), String(c[1])];
    switch (op) {
      case 'GET': { const e = live(k); return e ? e.v : null; }
      case 'SET': {
        const nx = c.indexOf('NX') > 0, ex = c.indexOf('EX');
        if (nx && live(k)) return null;
        m.kv.set(k, { v: String(c[2]), until: ex > 0 ? Date.now() + Number(c[ex + 1]) * 1000 : 0 });
        return 'OK';
      }
      case 'DEL': return m.kv.delete(k) ? 1 : 0;
      case 'INCR': { const e = live(k); const n = Number(e ? e.v : 0) + 1; m.kv.set(k, { v: String(n), until: e ? e.until : 0 }); return n; }
      case 'EXPIRE': { const e = live(k); if (!e) return 0; e.until = Date.now() + Number(c[2]) * 1000; return 1; }
      case 'ZADD': { const z = zset(k); z.set(String(c[3]), Number(c[2])); m.kv.set(k, { v: z, until: 0 }); return 1; }
      case 'ZREM': { const z = zset(k); return z.delete(String(c[2])) ? 1 : 0; }
      case 'ZREVRANGE': {
        const z = zset(k), out: string[] = [];
        z.forEach((_, id) => out.push(id));
        return out.sort((a, b) => (z.get(b) || 0) - (z.get(a) || 0));
      }
      case 'SADD': { const s = set(k); s.add(String(c[2])); m.kv.set(k, { v: s, until: 0 }); return 1; }
      case 'SREM': { const s = set(k); return s.delete(String(c[2])) ? 1 : 0; }
      case 'SCARD': return set(k).size;
      default: throw new Error(`memory store: no ${op}`);
    }
  };
  return { async run(cmds) { return cmds.map(one); } };
}

let chosen: Store | null | undefined;
function store(): Store {
  if (chosen === undefined) chosen = upstash() || (process.env.NODE_ENV === 'production' ? null : memory());
  if (!chosen) throw new ApiError(503, 'accounts-off');
  return chosen;
}
const run = (...cmds: Cmd[]) => store().run(cmds);

/* --- helpers ----------------------------------------------------------------------------- */
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
const stretch = (password: string, salt: Buffer) =>
  new Promise<Buffer>((ok, no) => pbkdf2(password, salt, ROUNDS, 32, 'sha256', (e, key) => (e ? no(e) : ok(key))));
const stamp = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');

/** A name or title: control characters out, spaces collapsed, 1 to `limit` characters. */
function oneLine(v: unknown, bad: string, limit: number) {
  if (typeof v !== 'string') throw new ApiError(400, bad);
  const s = v.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, ' ').split(/\s+/).filter(Boolean).join(' ');
  if (s.length < 1 || s.length > limit) throw new ApiError(400, bad);
  return s;
}
const slug = (name: string) =>
  name.normalize('NFKD').replace(/[^\x00-\x7f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'member';
const initials = (name: string) => {
  const w = name.split(/\s+/).filter(Boolean);
  return w.length ? (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase() : '?';
};

type User = { id: string; name: string; handle: string; email: string; joined: string; salt: string; hash: string };
export type PublicUser = { id: string; name: string; handle: string; initials: string; joined: string };
const pub = (u: User): PublicUser => ({ id: u.id, name: u.name, handle: u.handle, initials: initials(u.name), joined: u.joined });

async function userByEmail(email: string): Promise<User | null> {
  const [raw] = await run(['GET', `qm:user:${email}`]);
  try { return raw ? (JSON.parse(String(raw)) as User) : null; } catch { return null; }
}

/** Counts a try against a limit for a window; past the limit, a 429. */
async function limit(what: string, who: string, max: number, secs: number) {
  const k = `qm:rl:${what}:${sha(who).slice(0, 24)}`;
  const [n] = await run(['INCR', k]);
  if (Number(n) === 1) await run(['EXPIRE', k, secs]);
  if (Number(n) > max) throw new ApiError(429, 'Too many tries. Wait a few minutes and try again.');
}

async function startSession(user: User) {
  const token = randomBytes(32).toString('base64url');
  await run(['SET', `qm:sess:${sha(token)}`, JSON.stringify({ uid: user.id, email: user.email }), 'EX', SESSION_SECS]);
  return token;
}

/** The member a cookie belongs to, or null. */
export async function userFor(token: string | undefined): Promise<User | null> {
  if (!token || !TOKEN_RE.test(token)) return null;
  const [raw] = await run(['GET', `qm:sess:${sha(token)}`]);
  if (!raw) return null;
  let s: { uid?: string; email?: string };
  try { s = JSON.parse(String(raw)); } catch { return null; }
  const u = s.email ? await userByEmail(s.email) : null;
  return u && u.id === s.uid ? u : null;
}

/* --- the requests ------------------------------------------------------------------------ */
export async function me(token: string | undefined) {
  store(); // with no store yet, even a visitor without a cookie hears 'accounts-off', so the page says joining opens soon
  const u = await userFor(token);
  if (!u) return { reply: { ok: true, user: null, liked: [], saved: [] }, cookie: token ? '' : null };
  const [ids] = await run(['ZREVRANGE', `qm:saves:${u.id}`, 0, -1]);
  const saved = ((ids as string[]) || []).filter((id) => pieces.has(id));
  return { reply: { ok: true, user: pub(u), liked: [], saved }, cookie: null };
}

export async function join(body: Record<string, unknown>, ip: string) {
  const name = oneLine(body.name, 'Tell us your name (1 to 40 characters).', 40);
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !EMAIL_RE.test(email)) throw new ApiError(400, "That doesn't look like an email address.");
  const password = body.password;
  if (typeof password !== 'string' || password.length < 8) throw new ApiError(400, 'Use a password of at least 8 characters.');
  if (password.length > 200) throw new ApiError(400, 'That password is too long (200 characters at most).');
  await limit('join', ip, 10, 3600);
  const salt = randomBytes(16);
  const key = await stretch(password, salt);
  const user: User = {
    id: `u-${randomBytes(5).toString('hex')}`, name, handle: slug(name), email, joined: stamp(),
    salt: salt.toString('hex'), hash: key.toString('hex'),
  };
  // NX: two people joining with one email at once cannot both get it
  const [ok] = await run(['SET', `qm:user:${email}`, JSON.stringify(user), 'NX']);
  if (ok !== 'OK') throw new ApiError(409, 'There is already an account with that email. Try signing in.');
  return { reply: { ok: true, user: pub(user) }, cookie: await startSession(user) };
}

export async function signin(body: Record<string, unknown>, ip: string, token: string | undefined) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password || password.length > 200) throw new ApiError(400, 'Enter your email and password.');
  await limit('signin-ip', ip, 30, 900);
  await limit('signin-email', email, 10, 900);
  const u = await userByEmail(email);
  let salt = NO_SALT, want = Buffer.alloc(32);
  if (u) { try { salt = Buffer.from(u.salt, 'hex'); want = Buffer.from(u.hash, 'hex'); } catch { /* a broken record never matches */ } }
  const got = await stretch(password, salt); // also for an unknown email, so the time does not tell
  if (!u || want.length !== got.length || !timingSafeEqual(got, want)) throw new ApiError(401, "That email and password don't match.");
  if (token && TOKEN_RE.test(token)) await run(['DEL', `qm:sess:${sha(token)}`]);
  return { reply: { ok: true, user: pub(u) }, cookie: await startSession(u) };
}

export async function signout(token: string | undefined) {
  if (token && TOKEN_RE.test(token)) await run(['DEL', `qm:sess:${sha(token)}`]);
  return { reply: { ok: true }, cookie: '' };
}

export async function save(body: Record<string, unknown>, token: string | undefined) {
  const u = await userFor(token);
  if (!u) throw new ApiError(401, 'Sign in to save pieces.');
  const { id, on } = body;
  if (typeof on !== 'boolean') throw new ApiError(400, 'Say whether to turn it on or off.');
  if (typeof id !== 'string' || !ID_RE.test(id) || !pieces.has(id)) throw new ApiError(404, 'There is no such piece.');
  const out = await run(
    on ? ['ZADD', `qm:saves:${u.id}`, Date.now(), id] : ['ZREM', `qm:saves:${u.id}`, id],
    on ? ['SADD', `qm:savers:${id}`, u.id] : ['SREM', `qm:savers:${id}`, u.id],
    ['SCARD', `qm:savers:${id}`],
  );
  return { reply: { ok: true, n: Number(out[2]) || 0 }, cookie: null };
}
