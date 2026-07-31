# Connecting the app to the CRM

The CRM is GoHighLevel, white-labelled by My Digital Group — the LeadConnector
app and the `hooks.leadconnectorhq.com` webhook host are both GoHighLevel.

GoHighLevel workflows can start from an **Inbound Webhook**: you get a URL, and
anything POSTed to it creates or updates a contact and runs whatever automation
follows. No API key involved, and it is write-only — it can push data in, but
cannot read the customer list out.

## Why there is a Worker in the middle

The app cannot hold that URL. `www/js/` ships inside the APK and is served as
plain text on the website, so anything written there is public — not
"obscure", genuinely readable by anyone. GoHighLevel's own guidance is to treat
the inbound webhook URL as a secret.

Leaking it would not expose customer data, but anyone who found it could POST
junk leads into the CRM indefinitely.

So a Cloudflare Worker sits in between and holds the URL server-side:

```
app  →  your Worker (public URL, safe to publish)  →  GoHighLevel (secret)
```

The Worker also rejects unknown origins, drops honeypot submissions, caps body
size, and returns a real error rather than a false success when the CRM is
unreachable — which is what lets the app fall back to email instead of losing
the booking.

## Setup

**1. Create the workflow in the CRM**

Automation → Workflows → Create Workflow → Add Trigger → **Inbound Webhook**.
Copy the generated URL. Add an action — Create/Update Contact, or create an
Opportunity if you would rather track quoted → scheduled → invoiced. Publish it.

**2. Deploy the Worker**

[dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create →
Worker. Paste in `crm-relay-worker.js`, deploy.

**3. Add the webhook URL as a secret**

Worker → Settings → Variables and Secrets → Add, type **Secret** (encrypted):

| Name | Value |
| --- | --- |
| `GHL_WEBHOOK_URL` | the inbound webhook URL from step 1 |

Redeploy. The URL now lives only in Cloudflare — not in this repo, not in the
app, not in a chat.

**4. Point the app at the Worker**

Put the Worker's own `*.workers.dev` address into `CRM_RELAY_URL` in
`www/js/data.js`. That one is safe to publish; it is the whole point of the
arrangement.

Free tier covers 100,000 requests/day, far past what this needs.

## What gets sent

```json
{
  "type": "booking",
  "ref": "CCS-2431",
  "name": "Jane Citizen",
  "phone": "0400 111 222",
  "address": "12 Ocean Pde, Terrigal NSW",
  "date": "Mon 3 Aug",
  "time": "9:00 AM – 11:00 AM",
  "itemsSummary": "2x Tradesperson labour",
  "total": 330,
  "notes": "Side gate code 4821"
}
```

`type` is `booking`, `order` or `quote`. The Worker adds `source`,
`submittedAt` and `country` before forwarding.

## Behaviour when it fails

`Store.sendToCrm()` resolves `true` only on a confirmed 2xx. Not configured,
offline, relay down, CRM rejected — all resolve `false`, and the confirmation
screen falls back to the email and text buttons.

A booking is never silently lost. That was the original defect and the fallback
exists specifically to stop it recurring.

## Tests

```bash
node integrations/crm-relay-worker.test.mjs
```

17 cases covering CORS preflight, origin allowlisting, method and payload
rejection, the honeypot, secret-not-set, upstream failure and CRM rejection.
No dependencies — it stubs `fetch` and runs on plain Node.
