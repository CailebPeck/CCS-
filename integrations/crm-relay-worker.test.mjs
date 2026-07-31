import worker from './crm-relay-worker.js';

const ORIGIN = 'https://cailebpeck.github.io';
const HOOK = 'https://hooks.leadconnectorhq.com/v1/hooker/TEST';
let forwarded = null;

const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  forwarded = { url, body: JSON.parse(init.body) };
  return new Response('{"ok":true}', { status: 200 });
};

const post = (body, opts = {}) => new Request('https://relay.workers.dev', {
  method: opts.method || 'POST',
  headers: { 'Content-Type': 'application/json', Origin: opts.origin ?? ORIGIN, ...(opts.headers||{}) },
  ...(opts.method === 'OPTIONS' || opts.method === 'GET' ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }),
});

const env = { GHL_WEBHOOK_URL: HOOK };
let pass = 0, fail = 0;
const check = (name, cond, extra='') => { cond ? pass++ : fail++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`); };

console.log('\nCRM relay Worker');

let r = await worker.fetch(post({}, { method: 'OPTIONS' }), env);
check('preflight returns 204', r.status === 204);
check('preflight allows our origin', r.headers.get('Access-Control-Allow-Origin') === ORIGIN);

r = await worker.fetch(post({}, { method: 'GET' }), env);
check('GET rejected', r.status === 405);

r = await worker.fetch(post({ type: 'booking' }), {});
check('missing secret -> 500, not a silent success', r.status === 500);

r = await worker.fetch(post('not json'), env);
check('malformed body -> 400', r.status === 400);

r = await worker.fetch(post({ type: 'nonsense' }), env);
check('unknown type -> 400', r.status === 400);

forwarded = null;
r = await worker.fetch(post({ type: 'booking', _hp: 'bot filled me' }), env);
check('honeypot answers 200 (bot learns nothing)', r.status === 200);
check('honeypot forwards nothing', forwarded === null);

forwarded = null;
r = await worker.fetch(post({ type: 'booking', ref: 'CCS-1', name: 'Jane', _hp: '' }), env);
check('valid booking -> 200', r.status === 200);
check('forwards to the secret URL', forwarded?.url === HOOK);
check('honeypot stripped before forwarding', !('_hp' in (forwarded?.body || {})));
check('adds source + timestamp', forwarded?.body.source === 'Coastline Hub app' && !!forwarded?.body.submittedAt);
check('preserves payload', forwarded?.body.ref === 'CCS-1' && forwarded?.body.name === 'Jane');

r = await worker.fetch(post({ type: 'booking' }, { origin: 'https://evil.example' }), env);
check('unknown origin gets no CORS grant', r.headers.get('Access-Control-Allow-Origin') === 'null');

r = await worker.fetch(post({ type: 'booking' }, { origin: 'capacitor://localhost' }), env);
check('native app origin allowed', r.headers.get('Access-Control-Allow-Origin') === 'capacitor://localhost');

globalThis.fetch = async () => { throw new Error('upstream unreachable'); };
r = await worker.fetch(post({ type: 'booking' }), env);
check('upstream failure -> 502 so the app can fall back', r.status === 502);

globalThis.fetch = async () => new Response('nope', { status: 400 });
r = await worker.fetch(post({ type: 'booking' }), env);
check('CRM rejection -> 502, not a false success', r.status === 502);

globalThis.fetch = realFetch;
console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
