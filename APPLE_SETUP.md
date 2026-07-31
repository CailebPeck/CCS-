# Getting Coastline Hub onto iPhone — step by step

Every step here works from a phone or iPad. No Mac, no Xcode, at any point —
the build runs on a GitHub-hosted Mac.

**Values you will need throughout:**

| | |
| --- | --- |
| App name | `Coastline Hub` |
| Bundle ID | `au.com.coastlinecurrentsolutions.hub` |
| SKU (anything, never shown publicly) | `coastline-hub` |
| Primary language | English (Australia) |

---

## Step 1 — Enrol in the Apple Developer Program

**Enrol as an Individual / Sole Trader, not as an Organization.**

This is the single decision that decides whether this takes two days or a
month. Organization enrolment requires a **D-U-N-S number**, which takes 5–30
days to obtain. Individual enrolment verifies against your Apple ID and is
usually approved in **24–48 hours**.

The trade-off: the App Store lists your personal name as the seller rather
than the company name. You can convert the account to an organization later
without rebuilding or resubmitting anything, so this does not lock you in.

Fastest route: the **Apple Developer** app on iPhone or iPad. It reuses the
identity verification already attached to your Apple ID, which the website
cannot do. US$99/year.

Use an Apple ID that belongs to the business and has two-factor authentication
switched on. Changing it later is a support process.

**Then wait for the approval email.** Nothing below will work until it lands.

---

## Step 2 — Register the app's Bundle ID

[developer.apple.com/account](https://developer.apple.com/account) →
**Certificates, Identifiers & Profiles** → **Identifiers** → **+**

- App IDs → App
- Description: `Coastline Hub`
- Bundle ID: **Explicit** → `au.com.coastlinecurrentsolutions.hub`
- Leave every capability unticked — the app needs none of them

The bundle ID must match exactly. It is already set in the Xcode project and
cannot be changed later without creating a new app record.

---

## Step 3 — Note your Team ID

Same site → **Membership details**. It is 10 characters, e.g. `A1BC23DEF4`.

Write it down. This becomes the `APPLE_TEAM_ID` secret.

---

## Step 4 — Create the app record

[appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Apps** → **+** → **New App**

- Platform: **iOS**
- Name: `Coastline Hub`
- Primary language: **English (Australia)**
- Bundle ID: pick the one from step 2
- SKU: `coastline-hub`
- User access: Full Access

The name must be unique across the whole App Store. If it is taken, try
`Coastline Current Solutions`.

---

## Step 5 — Create an API key

App Store Connect → **Users and Access** → **Integrations** → **Team Keys** → **+**

- Name: `GitHub Actions`
- Access: **App Manager**

Then record three things:

1. **Key ID** — about 10 characters, shown in the table
2. **Issuer ID** — a long UUID shown above the table
3. The **`.p8` file** — download it

> **The `.p8` downloads exactly once.** There is no second chance. Save it
> somewhere permanent before leaving the page. If you lose it, revoke the key
> and make a new one.

---

## Step 6 — Add four secrets to GitHub

At [Settings → Secrets and variables → Actions](https://github.com/CailebPeck/CCS-/settings/secrets/actions),
add:

| Secret | Value |
| --- | --- |
| `APPLE_TEAM_ID` | the 10-character Team ID from step 3 |
| `APP_STORE_CONNECT_KEY_ID` | the Key ID from step 5 |
| `APP_STORE_CONNECT_ISSUER_ID` | the Issuer ID from step 5 |
| `APP_STORE_CONNECT_KEY_B64` | the `.p8` file, base64-encoded (below) |

To base64 the `.p8` without any local tools, use
[Google Cloud Shell](https://shell.cloud.google.com) — a free terminal in the
browser. Upload the file with the **⋮ → Upload** menu, then:

```bash
base64 -w0 AuthKey_XXXXXXXXXX.p8
```

Copy the whole output. It is a few hundred characters, far shorter than the
Android keystore.

> Check the paste took. Secrets are write-only, so a truncated value only
> surfaces as a build failure. The workflow checks all four are present before
> it starts, and names any that are missing.

---

## Step 7 — Run the build

GitHub → **Actions** → **iOS Build & TestFlight Upload** → **Run workflow** →
branch `main`.

Takes roughly 15–25 minutes. It archives the app on a macOS runner, signs it
using Apple's cloud-managed signing (no certificates or provisioning profiles
to wrangle) and uploads straight to App Store Connect.

The build number is set from the GitHub run number automatically, so it always
increases — Apple rejects repeats.

---

## Step 8 — Install it via TestFlight

App Store Connect → your app → **TestFlight**. The build appears after Apple
finishes processing, usually 10–30 minutes after the upload.

- **Internal Testing** — up to 100 people on your team, no Apple review, available
  within minutes. This is how you get it on your own phone.
- **External Testing** — up to 10,000 people, needs a short Apple review first
  (usually a day).

Add yourself as an internal tester, install **TestFlight** from the App Store,
and the build shows up there.

---

## Step 9 — Submitting to the App Store proper

Only when you are ready for the public listing. You will need:

- Screenshots at 6.7" and 6.5" (App Store Connect lists exact pixel sizes)
- Description, keywords, support URL, marketing URL — drafts are in `STORE_LISTING.md`
- A privacy policy URL — `PRIVACY_POLICY.md` needs hosting somewhere public
- The App Privacy questionnaire — the app collects nothing, so every answer is "no"

First review usually takes 1–3 days.

---

## If a build fails

The workflow checks the four secrets before doing anything and names whichever
are missing. Beyond that, the two common failures are:

- **"No profiles for ... were found"** — the Bundle ID in step 2 was not
  registered, or does not match exactly.
- **"Authentication credentials are invalid"** — the `.p8` base64 was truncated,
  or the Key ID and Issuer ID are the wrong way round. They are easy to swap:
  the Key ID is short, the Issuer ID is a long UUID.

---

## Notes on the project

- Deployment target is **iOS 14**, which covers iPhone 6s and newer.
- Version is **1.0** (`MARKETING_VERSION`). Bump it in Xcode's project settings
  for each public release; the build number handles itself.
- `ITSAppUsesNonExemptEncryption` is declared `false` in `Info.plist`. The app
  uses no encryption beyond the HTTPS iOS provides, which is exempt. Without
  that key every upload is held for a manual compliance answer before testers
  can install.
