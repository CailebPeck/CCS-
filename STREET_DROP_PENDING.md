# Coastline Street — drop staged, waiting on photo files

22 product photos have come through in chat across four sends (11 Aug batch:
Bolt tee/hoodie; the Tidal range; the multimeter mascot tee). None have
reached disk — `ls` on the upload directory shows nothing newer than the
`.ai`/`.pdf` logo files from earlier in the session, across every batch since.

That's the same upload pipeline that worked fine for the logo files, so this
looks like a transfer problem on the image path specifically, not something a
resend fixes. Worth raising with Anthropic support if it's still happening
next session — from this end there's nothing further to retry.

**Nothing below is wired into the app.** `www/js/app.js`'s street image tags
have no `onerror` fallback (unlike the electrical item thumbs, which fall back
to a category icon) — so adding these to `STREET_PRODUCTS` / `STREET_VOLT` now
would ship broken image icons on the live site. This file exists so the copy
work isn't lost and nothing has to be re-described from memory once the photos
land.

**To bring a piece live once its file exists:**
1. Save the photo as `www/img/street/<id>.webp`
2. Copy its entry below into `STREET_PRODUCTS` or `STREET_VOLT` in
   `www/js/data.js`
3. `node tools/generate-brand.py` is unrelated — no build step needed here,
   the shop just picks it up

Everything below is my draft — read the names, descriptions and prices as
placeholders to correct, not as decided.

---

## Tidal collection (8 pieces)

Shared graphic language across all eight: the wave-inside-a-circle badge
split by a bolt, sometimes with a compass rose, in a few colourways and
wordmark treatments (boxed, stacked, gothic arch). Reads as a proper drop
rather than one design — worth keeping together as its own collection tab
if the shop ever grows tabs.

```js
{ id: 'td-boxwave-grey', name: 'Boxed Wave Tee', colour: 'Grey Acid Wash', collection: 'Tidal', price: 89.95, tag: '',
  desc: 'Boxed COASTLINE wordmark on the chest, the wave-and-bolt roundel across the back. Acid-washed 320gsm cotton.' },
{ id: 'td-splitwave-white', name: 'Splitline Tee', colour: 'White', collection: 'Tidal', price: 89.95, tag: '',
  desc: 'COAST/LINE split top to bottom by the bolt, boxed wordmark up front. Clean white ground, oversized fit.' },
{ id: 'td-boxwave-marle', name: 'Boxed Wave Tee', colour: 'Grey Marle', collection: 'Tidal', price: 89.95, tag: '',
  desc: 'Same wave-and-bolt back badge in a tonal grey marle colourway. 320gsm heavyweight cotton.' },
{ id: 'td-gothic-black', name: 'Gothic Compass Tee', colour: 'Black Acid Wash', collection: 'Tidal', price: 94.95, tag: '',
  desc: 'Arched gothic COASTLINE lettering over a full compass rose with the wave-and-bolt centred. The heaviest graphic in the range.' },
{ id: 'td-gothic-qz', name: 'Gothic Compass Quarter Zip', colour: 'Black', collection: 'Tidal', price: 149.95, tag: '',
  desc: 'The gothic compass graphic on a quarter-zip pullover, tonal on the front. Brushed-back fleece.' },
{ id: 'td-boxwave-tank', name: 'Boxed Wave Tank', colour: 'Black Acid Wash', collection: 'Tidal', price: 79.95, tag: '',
  desc: 'The boxed wordmark and wave badge on a tank, sleeve hit down the side seam. 320gsm cotton.' },
{ id: 'td-gothic-hoodie', name: 'Gothic Compass Hoodie', colour: '480gsm Black', collection: 'Tidal', price: 179.95, tag: 'Heavyweight',
  desc: 'Small chest wordmark, full gothic wave-and-bolt graphic across the back. 480gsm fleece, double-lined hood.' },
{ id: 'td-beanie', name: 'Coastline Beanie', colour: 'Black', collection: 'Tidal', price: 44.95, tag: '',
  desc: 'Ribbed beanie with a woven wordmark patch on the cuff — wave-and-bolt patch on the reverse.' },
```

## Standalone pieces

```js
// Fits alongside STREET_VOLT — same mascot-illustration format as Tool Crew,
// Lock Out & Live etc, but a distinct character (the clamp meter).
{ id: 'sv-clampmeter', name: 'Clamp Meter Tee', colour: 'Grey Acid Wash', price: 94.95, line: 'Live Current',
  desc: 'The clamp meter mascot, mid-job with a screwdriver and pliers in hand. Small wave-and-bolt badge, "Powering What Matters" line. 320gsm heavyweight cotton.' },

// New product, not matching any existing collection — angry bolt graphic,
// distinct from the Tidal range's wave-and-bolt badge.
{ id: 'bolt-tee', name: 'Bolt Tee', colour: 'Black', collection: 'Bolt', price: 89.95, tag: 'New',
  desc: 'An angry lightning bolt front and centre. Boxed COASTLINE / CCS lockup below it, small bolt hit on the sleeve. 320gsm heavyweight cotton.' },
{ id: 'bolt-hoodie', name: 'Bolt Hoodie', colour: '480gsm Black', collection: 'Bolt', price: 179.95, tag: 'Heavyweight',
  desc: 'The bolt graphic on the front, a different back print entirely — the crew mascot in a CCS cap throwing a shaka, cable coil in hand. 480gsm fleece.',
  images: ['bolt-hoodie-front', 'bolt-hoodie-back'] },
```

**Note on the Bolt Hoodie:** front and back are different artwork, so it
needs two files (`bolt-hoodie-front.webp`, `bolt-hoodie-back.webp`) rather
than the usual single photo — `images` is already set up for that above,
the carousel handles it with no other change needed.

## Sizes

All of the above assumed to run the same S–2XL as the rest of the range
(`STREET_SIZES` in `data.js`). Flag anything that doesn't.
