/**
 * Coastline Hub → GoHighLevel relay
 *
 * Why this exists: the app's JavaScript is public — anyone can read it in the
 * website's source or by unpacking the APK. Calling the GoHighLevel inbound
 * webhook directly would therefore publish that URL, and anyone who found it
 * could POST junk leads into the CRM all day.
 *
 * This Worker keeps the webhook URL server-side. The app talks to the Worker;
 * only the Worker knows where GoHighLevel actually is.
 *
 * ── Deploy ────────────────────────────────────────────────────────────────
 * 1. dash.cloudflare.com → Workers & Pages → Create → Worker
 * 2. Paste this file in, Deploy
 * 3. Settings → Variables and Secrets → add an ENCRYPTED secret:
 *        Name:  GHL_WEBHOOK_URL
 *        Value: your inbound-webhook URL from the CRM workflow
 * 4. Redeploy, then send the Worker's own *.workers.dev URL back — that one is
 *    safe to publish.
 *
 * Free tier covers 100,000 requests/day, far beyond what this needs.
 */

// Only these origins may call the relay. Anything else gets no CORS headers,
// so a browser on another site cannot use it even if the URL leaks.
const ALLOWED_ORIGINS = [
  'https://cailebpeck.github.io',
  'https://coastlinecurrentsolutions.com.au',
  'https://www.coastlinecurrentsolutions.com.au',
  // Capacitor's native origins — the iOS and Android builds are not a website.
  'capacitor://localhost',
  'http://localhost',
  'ionic://localhost',
];

const MAX_BODY_BYTES = 16 * 1024;

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

const json = (status, body, origin) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== 'POST') {
      return json(405, { error: 'POST only' }, origin);
    }
    if (!env.GHL_WEBHOOK_URL) {
      // Misconfiguration, not a client error — say so plainly in the logs.
      console.error('GHL_WEBHOOK_URL secret is not set on this Worker');
      return json(500, { error: 'Relay not configured' }, origin);
    }

    let payload;
    try {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'Payload too large' }, origin);
      payload = JSON.parse(raw);
    } catch {
      return json(400, { error: 'Expected JSON' }, origin);
    }

    // Honeypot: the app always sends this field empty. Bots that scrape the
    // form and fill everything in trip it. Answer 200 so they cannot tell
    // they were caught and retry with it blank.
    if (payload._hp) return json(200, { ok: true }, origin);
    delete payload._hp;

    if (!payload.type || !['booking', 'order', 'quote'].includes(payload.type)) {
      return json(400, { error: 'Unknown submission type' }, origin);
    }

    const enriched = {
      ...payload,
      source: 'Coastline Hub app',
      submittedAt: new Date().toISOString(),
      // Handy for spotting abuse in the CRM without exposing it to the client.
      country: request.headers.get('CF-IPCountry') || '',
    };

    let upstream;
    try {
      upstream = await fetch(env.GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enriched),
      });
    } catch (err) {
      console.error('Upstream fetch failed:', err);
      // The app falls back to email on a non-2xx, so be honest about failing.
      return json(502, { error: 'Could not reach the CRM' }, origin);
    }

    if (!upstream.ok) {
      console.error('CRM returned', upstream.status, await upstream.text().catch(() => ''));
      return json(502, { error: 'CRM rejected the submission' }, origin);
    }

    return json(200, { ok: true }, origin);
  },
};
