/* Coastline Hub — views & navigation (vanilla JS, no build step) */

const ICONS = {
  home: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 11.5L12 4l8 7.5V20a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8.5z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/></svg>',
  bag: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 8V6a5 5 0 0110 0v2M4.5 8h15l-1 12.5a1 1 0 01-1 .9H6.5a1 1 0 01-1-.9L4.5 8z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/></svg>',
  calendar: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  user: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 20c1.3-4 4-6 7.5-6s6.2 2 7.5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  grid: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="13" width="7.5" height="7.5" rx="1.5" stroke="currentColor" stroke-width="1.8"/></svg>',
  doc: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 3.5h8l4 4V20a1 1 0 01-1 1H6a1 1 0 01-1-1V4.5a1 1 0 011-1z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 13h6M9 16.5h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  tag: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M11 4h6a1 1 0 011 1v6l-9.5 9.5a1 1 0 01-1.4 0L4 18.4a1 1 0 010-1.4L13.5 7.5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="15" cy="8" r="1.3" fill="currentColor"/></svg>',
  users: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="9.5" r="2.3" stroke="currentColor" stroke-width="1.8"/><path d="M3 19c1-3 3-5 6-5s5 2 6 5M15 14.5c2.3.2 3.8 1.8 4.6 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
};

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Generated artwork (tools/generate-art.js) — bundled, so it works offline.
const catIcon = (catId) => 'img/cat/' + String(catId).replace(/\s+/g, '-') + '.svg';

// ── UI (non-persisted) state ────────────────────────────────────────────────
const UI = {
  route: 'hub',            // hub | electrical | street | tools
  streetView: 'shop',      // shop | product | cart
  streetProduct: null,     // product id when streetView === 'product'
  streetSize: null,        // selected size on the product page
  custTab: 'home',         // home | job | bookings | account
  custCategory: null,      // category id, or null
  modal: null,             // 'booking' | 'confirm' | null
  confirm: null,           // { ref, summary }
  staffTab: 'dashboard',   // dashboard | quote | prices | customers
  expandedCustomer: null,
  scrollPos: {},
};

const app = document.getElementById('app');

function go(patch) {
  Object.assign(UI, patch);
  render();
}

let toastTimer = null;
function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

// ── Renders ─────────────────────────────────────────────────────────────────

function render() {
  const scroller = app.querySelector('.screen');
  if (scroller) UI.scrollPos[UI.lastKey || ''] = scroller.scrollTop;

  let html = '';
  if (UI.route === 'hub') html = viewHub();
  else if (UI.route === 'street') html = viewStreet();
  else if (UI.route === 'tools') html = viewTools();
  else if (UI.route === 'electrical') html = Store.state.staffMode ? viewStaff() : viewCustomer();

  app.innerHTML = html;

  const key = [UI.route, UI.custTab, UI.custCategory, UI.staffTab, Store.state.staffMode].join('|');
  const newScroller = app.querySelector('.screen');
  if (newScroller && key === UI.lastKey) newScroller.scrollTop = UI.scrollPos[key] || 0;
  UI.lastKey = key;
}

// ── Hub ──
function viewHub() {
  return `
  <div class="screen">
    <div class="hub">
      <div class="hub-brand">
        <img src="img/brand/roundel.webp" alt="Coastline Current Solutions" width="96" height="96" style="width:96px;height:96px;display:block;margin:0 auto 16px">
        <h1 class="hub-title">COASTLINE</h1>
        <div class="hub-kicker" style="margin-bottom:14px">CURRENT SOLUTIONS · EST. 2024</div>
        <p class="hub-sub">${esc(BRAND.motto)}</p>
      </div>
      <div class="hub-cards">
        <button class="hub-card" data-action="nav" data-route="electrical">
          <div class="hub-icon" style="background:#1c2a33;color:#5ab0e0">⚡</div>
          <div class="name">Coastline Current Solutions</div>
          <div class="desc">Browse services, build a job, and book an electrician — clear prices up front.</div>
          <div class="cta" style="color:#5ab0e0">Open App →</div>
        </button>
        <button class="hub-card" data-action="nav" data-route="street">
          <div class="hub-icon" style="background:#2a1414;color:#f21d2a">⚡</div>
          <div class="name">Coastline Street</div>
          <div class="desc">Premium streetwear label — heavyweight tees, hoodies &amp; headwear.</div>
          <div class="cta" style="color:#f21d2a">Shop the Drop →</div>
        </button>
        <button class="hub-card" data-action="nav" data-route="tools">
          <div class="hub-icon" style="background:#2a2414;color:#e0b05a">🔧</div>
          <div class="name">CCS Tools</div>
          <div class="desc">Purpose-built tools for electricians — starting with the cable retrieval system.</div>
          <div class="cta" style="color:#e0b05a">View Concept →</div>
        </button>
      </div>
      <div class="hub-foot">
        Coastline Current Solutions · Coastline Street · CCS Tools<br>Central Coast, NSW
      </div>
    </div>
  </div>`;
}

// ── Electrical: customer app ──
function custTabbar() {
  const count = Store.cartTotals(Store.state.cart).count;
  const tabs = [
    { id: 'home', label: 'Home', icon: ICONS.home },
    { id: 'job', label: 'Job', icon: ICONS.bag, badge: count || null },
    { id: 'bookings', label: 'Bookings', icon: ICONS.calendar },
    { id: 'account', label: 'Account', icon: ICONS.user },
  ];
  return `<div class="tabbar">${tabs.map(t => `
    <button class="${UI.custTab === t.id ? 'active' : ''}" data-action="cust-tab" data-tab="${t.id}">
      ${t.icon}<div class="tab-label">${t.label}</div>
      ${t.badge ? `<div class="badge">${t.badge}</div>` : ''}
    </button>`).join('')}
  </div>`;
}

function itemRow(it, cartKey) {
  const qty = Store.state[cartKey][it.id] || 0;
  const p = Store.priceOf(it);
  const priceLabel = p == null ? 'Quote required' : money(p);
  const img = PRODUCT_IMAGES[it.id];
  const fallback = catIcon(it.catId);
  // Supplier photo when we have one; the category icon covers the rest and
  // also catches a failed load (offline, or the supplier moved the file).
  const thumb = img
    ? `<img class="item-thumb" src="${esc(img)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${fallback}';this.classList.add('ph')">`
    : `<img class="item-thumb ph" src="${fallback}" alt="" loading="lazy">`;
  const ctl = qty > 0
    ? `<div class="qty-ctl">
         <button class="dec" data-action="qty" data-cart="${cartKey}" data-id="${esc(it.id)}" data-d="-1">–</button>
         <div class="q">${qty}</div>
         <button class="inc" data-action="qty" data-cart="${cartKey}" data-id="${esc(it.id)}" data-d="1">+</button>
       </div>`
    : `<button class="add-btn" data-action="qty" data-cart="${cartKey}" data-id="${esc(it.id)}" data-d="1">Add</button>`;
  return `<div class="item-row">
    ${thumb}
    <div style="flex:1;min-width:0">
      <div class="item-name">${esc(it.name)}</div>
      <div class="item-unit">${esc(it.unit)}</div>
      <div class="item-price">${priceLabel}</div>
    </div>
    ${ctl}
  </div>`;
}

function viewCustomer() {
  let body = '';
  if (UI.custTab === 'home' && UI.custCategory) body = custCategory();
  else if (UI.custTab === 'home') body = custHome();
  else if (UI.custTab === 'job') body = custJob();
  else if (UI.custTab === 'bookings') body = custBookings();
  else if (UI.custTab === 'account') body = custAccount();

  let sheet = '';
  if (UI.modal === 'booking') sheet = sheetBooking();
  if (UI.modal === 'confirm') sheet = sheetConfirm();

  return `<div class="screen">${body}</div>${custTabbar()}${sheet}`;
}

function custHome() {
  const cats = CATEGORIES.map(cat => {
    const prices = cat.items.map(it => Store.priceOf(it)).filter(p => p != null);
    const fromLabel = prices.length ? 'From ' + money(Math.min(...prices)) : 'Quote required';
    return `<button class="cat-tile" data-action="open-cat" data-cat="${esc(cat.id)}">
      <img class="cat-icon" src="${catIcon(cat.id)}" alt="" loading="lazy">
      <div>
        <div class="cname">${esc(cat.name)}</div>
        <div class="cfrom">${fromLabel}</div>
      </div>
    </button>`;
  }).join('');

  return `
  <div class="topbar" style="justify-content:space-between">
    <div style="display:flex;align-items:center;gap:10px">
      <button class="back" data-action="nav" data-route="hub" aria-label="Back to hub">‹</button>
      <img src="img/brand/roundel.webp" alt="" width="34" height="34" style="width:34px;height:34px;flex-shrink:0">
      <div>
        <div class="manrope" style="font-weight:800;font-size:15px">${esc(COMPANY.name)}</div>
        <div style="font-size:11px;color:var(--muted)">${esc(COMPANY.tagline)}</div>
      </div>
    </div>
  </div>
  <div style="padding:10px 20px 4px">
    <button data-action="custom-job" style="width:100%;border:none;text-align:left;background:linear-gradient(135deg,var(--red),var(--red-dark));border-radius:14px;padding:16px;color:#fff;cursor:pointer">
      <div class="manrope" style="font-weight:800;font-size:15px;margin-bottom:3px">Not sure what you need?</div>
      <div style="font-size:12.5px;opacity:0.9">Request a custom quote →</div>
    </button>
  </div>
  <div class="section-label">Browse services</div>
  <div class="cat-grid">${cats}</div>
  <div style="padding:0 20px 8px">
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div class="manrope" style="font-weight:800;font-size:13px">Why Coastline</div>
        <div style="font-size:10.5px;color:var(--muted)">coastlinecurrentsolutions.com.au</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center">
        <div style="background:var(--panel-2);border-radius:10px;padding:10px 4px">
          <div class="manrope" style="font-weight:800;font-size:15px;color:var(--red)">20+</div>
          <div style="font-size:10px;color:var(--muted)">Years combined</div>
        </div>
        <div style="background:var(--panel-2);border-radius:10px;padding:10px 4px">
          <div class="manrope" style="font-weight:800;font-size:15px;color:var(--red)">1,000+</div>
          <div style="font-size:10px;color:var(--muted)">Projects done</div>
        </div>
        <div style="background:var(--panel-2);border-radius:10px;padding:10px 4px">
          <div class="manrope" style="font-weight:800;font-size:15px;color:var(--red)">99%</div>
          <div style="font-size:10px;color:var(--muted)">Satisfaction</div>
        </div>
      </div>
      <div style="margin-top:10px;font-size:11px;color:var(--muted);line-height:1.6">Licensed &amp; insured NSW electrical contractor · $5M public liability · Fully vetted, certified team.</div>
    </div>
  </div>
  <div style="padding:8px 20px 24px">
    <a href="${COMPANY.phoneHref}" style="text-decoration:none;display:block" class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;color:#fff">
        <div>
          <div class="manrope" style="font-weight:800;font-size:13.5px;margin-bottom:3px">24/7 emergency? Call us now</div>
          <div style="font-size:12px;color:var(--muted)">${esc(COMPANY.serviceArea)} · quick response</div>
        </div>
        <div class="manrope" style="font-weight:800;font-size:14px;color:var(--red);white-space:nowrap">${esc(COMPANY.phone)}</div>
      </div>
    </a>
  </div>`;
}

function custCategory() {
  const cat = CATEGORIES.find(c => c.id === UI.custCategory);
  if (!cat) { UI.custCategory = null; return custHome(); }
  return `
  <div class="topbar">
    <button class="back" data-action="close-cat">‹</button>
    <h1>${esc(cat.name)}</h1>
  </div>
  <div style="padding:6px 16px 24px;display:flex;flex-direction:column;gap:10px">
    ${cat.items.map(it => itemRow(it, 'cart')).join('')}
  </div>`;
}

function custJob() {
  const totals = Store.cartTotals(Store.state.cart);
  if (totals.count === 0) {
    return `
    <div class="topbar"><h1 style="font-size:19px">Your job</h1></div>
    <div style="padding:60px 30px;text-align:center;color:var(--muted);font-size:13px;line-height:1.6">
      Your job is empty.<br>Browse services to add items.
      <div style="margin-top:16px">
        <button data-action="cust-tab" data-tab="home" style="border:none;background:var(--red);color:#fff;border-radius:20px;padding:10px 20px;font-weight:700;font-size:12.5px;cursor:pointer">Browse services</button>
      </div>
    </div>`;
  }
  const lines = totals.lines.map(({ it, qty }) => {
    const p = Store.priceOf(it);
    return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;background:var(--panel);border-radius:12px;padding:12px 14px">
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:13px;margin-bottom:2px">${esc(it.name)}</div>
        <div style="font-size:11.5px;color:var(--muted)">${qty} × ${p == null ? 'quote' : money(p)}</div>
      </div>
      <div style="font-weight:700;font-size:13px;color:var(--red)">${p == null ? 'Quote' : money(p * qty)}</div>
      <button data-action="remove-line" data-id="${esc(it.id)}" style="border:none;background:transparent;color:rgba(255,255,255,0.35);cursor:pointer;font-size:16px;padding:2px 4px">×</button>
    </div>`;
  }).join('');

  return `
  <div class="topbar"><h1 style="font-size:19px">Your job</h1></div>
  <div style="padding:8px 20px;display:flex;flex-direction:column;gap:8px">${lines}</div>
  <div style="margin:14px 20px" class="card">
    <div style="display:flex;justify-content:space-between;font-size:13px;color:rgba(255,255,255,0.6)"><span>Subtotal (inc. GST)</span><span>${money(totals.subtotal)}</span></div>
    ${totals.hasCustom ? '<div style="font-size:11.5px;color:var(--muted);line-height:1.5;margin-top:6px">+ custom items — final price confirmed after a quick look</div>' : ''}
  </div>
  <div style="margin:0 20px 14px" class="field">
    <label>Notes for the electrician</label>
    <textarea data-action="job-notes" placeholder="e.g. gate code, parking, access details" style="min-height:56px;resize:none">${esc(Store.state.jobNotes)}</textarea>
  </div>
  <div style="padding:0 20px 24px">
    <button class="primary-btn" data-action="open-booking">Book this job</button>
  </div>`;
}

function custBookings() {
  const mine = Store.state.bookings.filter(b => b.mine);
  const rows = mine.map(b => `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:8px">
        <div class="manrope" style="font-weight:700;font-size:13.5px">${esc(b.itemsSummary)}</div>
        <div class="status-pill ${b.status === 'Confirmed' ? 'status-ok' : 'status-pend'}">${esc(b.status)}</div>
      </div>
      <div style="font-size:11.5px;color:var(--muted);line-height:1.6">${esc(b.date)} · ${esc(b.time)}<br>${esc(b.address)}</div>
      <div style="margin-top:8px;font-weight:700;font-size:13px;color:var(--red)">${b.total == null ? 'Quote required' : money(b.total)}</div>
    </div>`).join('');
  return `
  <div class="topbar"><h1 style="font-size:19px">My bookings</h1></div>
  ${mine.length === 0 ? '<div style="padding:50px 30px;text-align:center;color:var(--muted);font-size:13px">No bookings yet.</div>' : ''}
  <div style="padding:0 20px 24px;display:flex;flex-direction:column;gap:10px">${rows}</div>`;
}

function custAccount() {
  return `
  <div class="topbar"><h1 style="font-size:19px">Account</h1></div>
  <div style="margin:0 20px 10px" class="card">
    <div style="font-size:11px;color:var(--muted);margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">${esc(COMPANY.legalName)}</div>
    <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;line-height:1.5">
      <div style="display:flex;gap:8px"><span style="color:var(--red)">⌖</span><span>${esc(COMPANY.address)}</span></div>
      <a href="${COMPANY.phoneHref}" style="display:flex;gap:8px;color:#fff;text-decoration:none"><span style="color:var(--red)">✆</span><span>${esc(COMPANY.phone)}</span></a>
      <a href="${COMPANY.website}" target="_blank" style="display:flex;gap:8px;color:#fff;text-decoration:none"><span style="color:var(--red)">⚭</span><span>coastlinecurrentsolutions.com.au</span></a>
      <div style="display:flex;gap:8px"><span style="color:var(--red)">◷</span><span>24/7 emergency · ${esc(COMPANY.serviceArea)}</span></div>
    </div>
  </div>
  <div style="margin:0 20px 10px" class="card">
    <div style="font-size:11px;color:var(--muted);margin-bottom:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">App mode</div>
    <div class="seg">
      <button class="on">Customer</button>
      <button data-action="staff-mode" data-on="1">Staff</button>
    </div>
    <div style="font-size:11px;color:var(--muted);margin-top:8px;line-height:1.5">Staff mode gives the crew the quote builder, live price list and customer history.</div>
  </div>
  <div style="margin:0 20px 10px" class="card">
    <div style="font-size:11px;color:var(--muted);margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">More from Coastline</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <button data-action="nav" data-route="street" class="ghost-btn" style="text-align:left;padding:12px 14px">Coastline Street — shop the label →</button>
      <button data-action="nav" data-route="tools" class="ghost-btn" style="text-align:left;padding:12px 14px">CCS Tools — see the concept →</button>
    </div>
  </div>
  <div style="margin:0 20px 24px">
    <button class="ghost-btn" data-action="reset-data">Reset app data</button>
  </div>`;
}

function sheetBooking() {
  const f = Store.state.form;
  const slots = ['Morning (7–11am)', 'Midday (11–2pm)', 'Afternoon (2–5pm)'];
  return `
  <div class="sheet">
    <div class="topbar">
      <button class="back" data-action="close-booking">×</button>
      <h1>Book your job</h1>
    </div>
    <div class="sheet-body" style="padding:10px 20px 20px;display:flex;flex-direction:column;gap:14px">
      <div class="field"><label>Site address</label><input data-action="form-field" data-field="address" placeholder="Street, suburb" value="${esc(f.address)}"></div>
      <div class="field"><label>Preferred date</label><input type="date" data-action="form-field" data-field="date" value="${esc(f.date)}"></div>
      <div class="field"><label>Time slot</label>
        <div style="display:flex;gap:8px">
          ${slots.map(sl => `<button data-action="time-slot" data-slot="${esc(sl)}" style="flex:1;border-radius:10px;padding:10px 4px;font-size:11.5px;font-weight:700;cursor:pointer;border:1px solid ${f.timeSlot === sl ? 'var(--red)' : 'rgba(255,255,255,0.12)'};background:${f.timeSlot === sl ? 'var(--red)' : 'transparent'};color:${f.timeSlot === sl ? '#fff' : 'rgba(255,255,255,0.6)'}">${esc(sl)}</button>`).join('')}
        </div>
      </div>
      <div style="display:flex;gap:10px">
        <div class="field" style="flex:1"><label>Name</label><input data-action="form-field" data-field="name" value="${esc(f.name)}"></div>
        <div class="field" style="flex:1"><label>Phone</label><input type="tel" data-action="form-field" data-field="phone" value="${esc(f.phone)}"></div>
      </div>
    </div>
    <div style="padding:12px 20px calc(26px + var(--sab))">
      <button class="primary-btn" data-action="submit-booking">Confirm booking</button>
    </div>
  </div>`;
}

// The app has no server, so a booking cannot deliver itself. These build the
// booking as plain text and hand it to the phone's own mail or messaging app,
// which needs no backend, no account and no API key. The customer taps send.
function bookingText(ref, s) {
  return [
    `Booking request ${ref}`,
    '',
    `Job: ${s.itemsSummary}`,
    `When: ${s.date}, ${s.time}`,
    `Address: ${s.address}`,
    `Total: ${s.totalLabel}`,
    s.name ? `Name: ${s.name}` : '',
    s.phone ? `Phone: ${s.phone}` : '',
    s.notes ? `Notes: ${s.notes}` : '',
    '',
    'Sent from the Coastline Hub app.',
  ].filter(Boolean).join('\n');
}

function bookingEmailHref(ref, s) {
  return 'mailto:' + COMPANY.email
    + '?subject=' + encodeURIComponent(`Booking request ${ref} — ${s.name || 'new customer'}`)
    + '&body=' + encodeURIComponent(bookingText(ref, s));
}

function bookingSmsHref(ref, s) {
  // "?&body=" is the form both iOS and Android accept; iOS ignores a plain "?".
  return 'sms:' + COMPANY.smsNumber + '?&body=' + encodeURIComponent(bookingText(ref, s));
}

function sheetConfirm() {
  const c = UI.confirm || { ref: '', summary: {} };
  const s = c.summary;
  return `
  <div class="sheet">
    <div class="sheet-body" style="padding:60px 24px 20px;display:flex;flex-direction:column;align-items:center;text-align:center">
      <div style="width:56px;height:56px;border-radius:50%;background:var(--red);display:flex;align-items:center;justify-content:center;margin-bottom:16px">
        <svg width="26" height="20" viewBox="0 0 26 20"><path d="M2 10L10 18L24 2" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="manrope" style="font-weight:800;font-size:20px;margin-bottom:6px">Almost done</div>
      <div style="font-size:12.5px;color:var(--muted);margin-bottom:20px">Reference #${esc(c.ref)}</div>
      <div class="card" style="width:100%;box-sizing:border-box;text-align:left;margin-bottom:16px">
        <div style="font-weight:700;font-size:13.5px;margin-bottom:8px">${esc(s.itemsSummary)}</div>
        <div style="font-size:12px;color:var(--muted);line-height:1.7">${esc(s.date)} · ${esc(s.time)}<br>${esc(s.address)}</div>
        <div style="margin-top:10px;font-weight:800;font-size:15px;color:var(--red)">${esc(s.totalLabel)}</div>
      </div>
      <div style="font-size:11.5px;color:var(--muted);line-height:1.6;margin-bottom:20px">
        Send this through and we'll confirm your time — and final pricing on any custom items — within one business day.
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;width:100%">
        <a class="primary-btn" style="display:block;text-decoration:none;text-align:center;color:#fff"
           href="${bookingEmailHref(c.ref, s)}" data-action="booking-sent">Send by email</a>
        <a class="ghost-btn" style="display:block;text-decoration:none;text-align:center"
           href="${bookingSmsHref(c.ref, s)}" data-action="booking-sent">Send by text</a>
        <a class="ghost-btn" style="display:block;text-decoration:none;text-align:center"
           href="${esc(COMPANY.phoneHref)}">Call ${esc(COMPANY.phone)}</a>
        <button class="ghost-btn" style="border:none;color:var(--muted)" data-action="confirm-to-bookings">View my bookings</button>
      </div>
    </div>
  </div>`;
}

// ── Electrical: staff app ──
function staffTabbar() {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.grid },
    { id: 'quote', label: 'Quote', icon: ICONS.doc },
    { id: 'prices', label: 'Prices', icon: ICONS.tag },
    { id: 'customers', label: 'Customers', icon: ICONS.users },
  ];
  return `<div class="tabbar">${tabs.map(t => `
    <button class="${UI.staffTab === t.id ? 'active' : ''}" data-action="staff-tab" data-tab="${t.id}">
      ${t.icon}<div class="tab-label">${t.label}</div>
    </button>`).join('')}
  </div>`;
}

function viewStaff() {
  let body = '';
  if (UI.staffTab === 'dashboard') body = staffDashboard();
  else if (UI.staffTab === 'quote') body = staffQuote();
  else if (UI.staffTab === 'prices') body = staffPrices();
  else if (UI.staffTab === 'customers') body = staffCustomers();
  return `<div class="screen">${body}</div>${UI.staffTab === 'quote' ? staffQuoteFooter() : ''}${staffTabbar()}`;
}

function staffDashboard() {
  const s = Store.state;
  const jobsToday = s.bookings.filter(b => b.date === 'Mon 28 Jul').length;
  const quotesPending = s.bookings.filter(b => b.status === 'Pending confirmation').length;
  const newRequests = s.bookings.filter(b => b.isNew).length;
  const rows = s.bookings.map(b => `
    <div class="card" style="border-color:${b.isNew ? 'var(--red)' : 'var(--line)'}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
        <div class="manrope" style="font-weight:700;font-size:13.5px">${esc(b.customerName)}</div>
        ${b.isNew ? '<div style="font-size:9.5px;font-weight:800;background:var(--red);color:#fff;border-radius:7px;padding:2px 6px">NEW</div>' : ''}
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-bottom:6px">${esc(b.itemsSummary)}</div>
      <div style="font-size:11px;color:var(--muted)">${esc(b.time)} · ${esc(b.date)} · ${esc(b.address)}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
        <div class="status-pill ${b.status === 'Confirmed' ? 'status-ok' : 'status-pend'}">${esc(b.status)}</div>
        <div style="font-weight:700;font-size:13px;color:var(--red)">${b.total == null ? 'Quote required' : money(b.total)}</div>
      </div>
    </div>`).join('');

  return `
  <div class="topbar" style="justify-content:space-between">
    <div style="display:flex;align-items:center;gap:10px">
      <button class="back" data-action="nav" data-route="hub">‹</button>
      <div>
        <h1>G'day, Sam</h1>
        <div style="font-size:11px;color:var(--muted)">Staff mode · ${esc(COMPANY.name)}</div>
      </div>
    </div>
    <button data-action="staff-mode" data-on="0" style="border:1px solid var(--line);background:transparent;color:var(--muted);border-radius:10px;padding:8px 12px;font-size:11px;font-weight:700;cursor:pointer">Exit staff</button>
  </div>
  <div style="padding:6px 20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
    <div class="stat-tile"><div class="stat-num">${jobsToday}</div><div class="stat-cap">Jobs today</div></div>
    <div class="stat-tile"><div class="stat-num">${quotesPending}</div><div class="stat-cap">Quotes pending</div></div>
    <div class="stat-tile"><div class="stat-num" style="color:var(--red)">${newRequests}</div><div class="stat-cap">New requests</div></div>
  </div>
  <div class="section-label">Bookings</div>
  <div style="padding:0 20px 24px;display:flex;flex-direction:column;gap:10px">${rows}</div>`;
}

function staffQuote() {
  const s = Store.state;
  const cats = CATEGORIES.map(cat => `
    <div>
      <div class="manrope" style="font-weight:700;font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">${esc(cat.name)}</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${cat.items.map(it => {
          const qty = s.quoteCart[it.id] || 0;
          const p = Store.priceOf(it);
          return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;background:var(--panel);border-radius:12px;padding:11px 13px">
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;font-size:12.5px">${esc(it.name)}</div>
              <div style="font-size:11px;color:var(--red);font-weight:700;margin-top:2px">${p == null ? 'Quote required' : money(p)}</div>
            </div>
            <div class="qty-ctl" style="padding:5px 8px">
              <button class="dec" data-action="qty" data-cart="quoteCart" data-id="${esc(it.id)}" data-d="-1" style="width:20px;height:20px;font-size:13px">–</button>
              <div class="q" style="font-size:12px;min-width:12px">${qty}</div>
              <button class="inc" data-action="qty" data-cart="quoteCart" data-id="${esc(it.id)}" data-d="1" style="width:20px;height:20px;font-size:13px">+</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');

  return `
  <div class="topbar"><h1 style="font-size:19px">New quote</h1></div>
  <div style="padding:4px 20px 10px;display:flex;gap:10px">
    <input data-action="quote-field" data-field="quoteCustomer" placeholder="Customer name" value="${esc(s.quoteCustomer)}" style="flex:1;box-sizing:border-box;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 12px;color:#fff;font-size:12.5px;outline:none">
    <input data-action="quote-field" data-field="quoteSite" placeholder="Site address" value="${esc(s.quoteSite)}" style="flex:1;box-sizing:border-box;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 12px;color:#fff;font-size:12.5px;outline:none">
  </div>
  <div style="padding:8px 20px 190px;display:flex;flex-direction:column;gap:16px">${cats}</div>`;
}

// An itemised quote as plain text, handed to the phone's mail or messaging
// app. Same reasoning as bookings and orders: there is no server, so the
// alternative is a button that claims to have sent something and has not.
function quoteText() {
  const s = Store.state;
  const t = Store.cartTotals(s.quoteCart);
  const total = t.subtotal + (s.calloutFee ? 60 : 0);
  return [
    `Quote — ${COMPANY.legalName}`,
    s.quoteCustomer ? `Customer: ${s.quoteCustomer}` : '',
    s.quoteSite ? `Site: ${s.quoteSite}` : '',
    '',
    ...t.lines.map(({ it, qty }) => {
      const p = Store.priceOf(it);
      return p == null
        ? `${qty > 1 ? qty + 'x ' : ''}${it.name} — quote required`
        : `${qty > 1 ? qty + 'x ' : ''}${it.name} — ${money(p * qty)}`;
    }),
    s.calloutFee ? `Call-out fee — ${money(60)}` : '',
    '',
    `Total (inc. GST): ${money(total)}${t.hasCustom ? ' + items to be quoted' : ''}`,
    '',
    `${COMPANY.phone} · ${COMPANY.website}`,
  ].filter(Boolean).join('\n');
}

function quoteEmailHref() {
  const s = Store.state;
  return 'mailto:?subject='
    + encodeURIComponent(`Quote from ${COMPANY.legalName}${s.quoteCustomer ? ' — ' + s.quoteCustomer : ''}`)
    + '&body=' + encodeURIComponent(quoteText());
}

function quoteSmsHref() {
  return 'sms:?&body=' + encodeURIComponent(quoteText());
}

function staffQuoteFooter() {
  const s = Store.state;
  const totals = Store.cartTotals(s.quoteCart);
  const total = totals.subtotal + (s.calloutFee ? 60 : 0);
  const empty = !totals.lines.length;
  return `
  <div style="background:#131313;border-top:1px solid var(--line);padding:10px 20px 12px;flex-shrink:0">
    <div style="display:flex;justify-content:space-between;font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:6px"><span>Subtotal (inc. GST)</span><span>${money(totals.subtotal)}</span></div>
    <button class="check-row" data-action="toggle-callout" style="padding-bottom:8px">
      <div class="check-box" style="background:${s.calloutFee ? 'var(--red)' : 'transparent'}">${s.calloutFee ? '✓' : ''}</div>
      Add call-out fee ($60)
    </button>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div class="manrope" style="font-weight:800;font-size:16px;color:var(--red)">${money(total)}${totals.hasCustom ? ' + quote' : ''}</div>
    </div>
    <div style="display:flex;gap:6px">
      <a class="quote-send${empty ? ' off' : ''}" ${empty ? '' : `href="${quoteEmailHref()}"`}>Email quote</a>
      <a class="quote-send${empty ? ' off' : ''}" ${empty ? '' : `href="${quoteSmsHref()}"`}>Text quote</a>
    </div>
    <!-- Xero and the CRM are not connected yet. These stay visible so the
         workflow is clear, but they must not look like they did something. -->
    <div class="sync-pending">Xero &amp; CRM sync — not connected yet</div>
  </div>`;
}

function staffPrices() {
  const cats = CATEGORIES.map(cat => `
    <div>
      <div class="manrope" style="font-weight:700;font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">${esc(cat.name)}</div>
      <div style="display:flex;flex-direction:column;gap:1px;background:var(--panel);border-radius:12px;overflow:hidden">
        ${cat.items.map(it => {
          const p = Store.priceOf(it);
          const editable = it.price != null || Store.state.priceOverrides[it.id] != null;
          return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:11px 13px;border-bottom:1px solid rgba(255,255,255,0.05)">
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;font-size:12.5px">${esc(it.name)}</div>
              <div style="font-size:10.5px;color:var(--muted)">${esc(it.unit)}</div>
            </div>
            ${editable
              ? `<div class="price-input"><span style="font-size:12px;color:rgba(255,255,255,0.5)">$</span><input type="number" inputmode="decimal" data-action="set-price" data-id="${esc(it.id)}" value="${p == null ? '' : p}"></div>`
              : '<div style="font-size:11.5px;color:var(--muted);font-style:italic">Quote required</div>'}
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');
  return `
  <div class="topbar"><h1 style="font-size:19px">Price list</h1></div>
  <div style="padding:0 20px 10px;font-size:11.5px;color:var(--muted)">Tap a price to edit — changes apply across the app.</div>
  <div style="padding:0 20px 24px;display:flex;flex-direction:column;gap:16px">${cats}</div>`;
}

const STAFF_CUSTOMERS = [
  { id: 'c1', name: 'Marion Osei', suburb: 'Terrigal NSW', totalSpent: 620, jobs: [{ date: '28 Jul', name: 'Safety switch + smoke alarm', amount: 310 }, { date: '2 Mar', name: 'GPO x3', amount: 310 }] },
  { id: 'c2', name: 'Dean Whitfield', suburb: 'Erina NSW', totalSpent: 1450, jobs: [{ date: '28 Jul', name: 'Switchboard upgrade', amount: 1450 }] },
  { id: 'c3', name: 'Priya Nair', suburb: 'Kincumber NSW', totalSpent: 800, jobs: [{ date: '29 Jul', name: 'Downlights + pendant', amount: 800 }] },
  { id: 'c4', name: 'Callum Reeve', suburb: 'Wamberal NSW', totalSpent: 245, jobs: [{ date: '14 Jun', name: 'Ceiling fan install', amount: 165 }, { date: '2 Jan', name: 'Data point', amount: 80 }] },
];

function staffCustomers() {
  const rows = STAFF_CUSTOMERS.map(c => `
    <button class="card" data-action="toggle-customer" data-id="${c.id}" style="width:100%;box-sizing:border-box;text-align:left;color:#fff;cursor:pointer">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div class="manrope" style="font-weight:700;font-size:13.5px">${esc(c.name)}</div>
          <div style="font-size:11.5px;color:var(--muted);margin-top:2px">${esc(c.suburb)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700;font-size:13px;color:var(--red)">${money(c.totalSpent)}</div>
          <div style="font-size:10.5px;color:var(--muted)">lifetime</div>
        </div>
      </div>
      ${UI.expandedCustomer === c.id ? `
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:6px">
        ${c.jobs.map(j => `<div style="display:flex;justify-content:space-between;font-size:11.5px;color:rgba(255,255,255,0.6)"><span>${esc(j.date)} · ${esc(j.name)}</span><span>${money(j.amount)}</span></div>`).join('')}
      </div>` : ''}
    </button>`).join('');
  return `
  <div class="topbar"><h1 style="font-size:19px">Customers</h1></div>
  <div style="padding:0 20px 24px;display:flex;flex-direction:column;gap:10px">${rows}</div>`;
}

// ── Street ──
// A product's shots. Only one photo exists per garment today, so this falls
// back to the single file; listing more in `images` is all the carousel needs.
function streetImages(p) {
  return (p.images && p.images.length ? p.images : [p.id]).map((n) => `img/street/${n}.webp`);
}

function streetCard(p) {
  const kicker = p.collection || p.line || '';
  return `<div class="street-card" data-action="street-open" data-id="${esc(p.id)}" style="cursor:pointer">
    ${p.tag ? `<div class="street-tag-chip">${esc(p.tag)}</div>` : ''}
    <img class="street-img" src="${esc(streetImages(p)[0])}" alt="${esc(p.name)}" loading="lazy">
    <div class="street-meta">
      <div style="min-width:0">
        ${kicker ? `<div class="street-coll">${esc(kicker)}</div>` : ''}
        <div class="street-name">${esc(p.name)}</div>
        ${p.colour ? `<div class="street-colour">${esc(p.colour)}</div>` : ''}
        <div class="street-price">A$${p.price.toFixed(2)}</div>
      </div>
      <div class="street-add" aria-hidden="true">›</div>
    </div>
  </div>`;
}

function streetBag() {
  const n = Store.streetTotals().count;
  return `<button class="street-bag" data-action="street-cart" aria-label="View bag (${n} items)">
    ${ICONS.bag}${n ? `<span class="street-bag-count">${n}</span>` : ''}
  </button>`;
}

// ── Street: product detail ──
function viewStreetProduct() {
  const all = STREET_PRODUCTS.concat(STREET_VOLT);
  const p = all.find((x) => x.id === UI.streetProduct);
  if (!p) return viewStreetShop();

  const imgs = streetImages(p);
  const size = UI.streetSize || STREET_SIZES[1];
  const kicker = p.collection || p.line || '';
  const inBag = Store.state.streetCart[Store.streetKey(p.id, size)] || 0;

  return `
  <div class="screen" style="background:#050505">
    <div class="topbar" style="justify-content:space-between;background:#050505;position:sticky;top:0;z-index:5">
      <div style="display:flex;align-items:center;gap:10px">
        <button class="back" data-action="street-back" aria-label="Back to shop">‹</button>
        <div class="oswald" style="font-weight:700;font-size:15px;letter-spacing:2px">COASTLINE <span style="color:var(--street-red)">STREET</span></div>
      </div>
      ${streetBag()}
    </div>

    <div class="pdp-gallery" data-gallery>
      <div class="pdp-track">
        ${imgs.map((src, i) => `<img class="pdp-img" src="${esc(src)}" alt="${esc(p.name)} — view ${i + 1}" ${i ? 'loading="lazy"' : ''}>`).join('')}
      </div>
    </div>
    ${imgs.length > 1 ? `<div class="pdp-dots">${imgs.map((_, i) => `<span class="pdp-dot${i ? '' : ' on'}"></span>`).join('')}</div>` : ''}

    <div style="padding:22px 20px calc(120px + var(--sab))">
      ${kicker ? `<div class="street-coll">${esc(kicker)}</div>` : ''}
      <h1 class="oswald" style="font-size:28px;font-weight:700;margin:4px 0 6px;line-height:1.1">${esc(p.name)}</h1>
      ${p.colour ? `<div style="font-size:12.5px;color:#8a8a8a;margin-bottom:10px">${esc(p.colour)}</div>` : ''}
      <div style="font-size:20px;color:#f5f5f2;font-weight:700;margin-bottom:18px">A$${p.price.toFixed(2)}</div>
      ${p.desc ? `<p style="font-size:13.5px;color:#a9a9a9;line-height:1.75;margin:0 0 24px">${esc(p.desc)}</p>` : ''}

      <div style="font-size:11px;letter-spacing:2px;color:#8a8a8a;text-transform:uppercase;margin-bottom:10px">Size</div>
      <div class="size-row">
        ${STREET_SIZES.map((s) => `<button class="size-btn${s === size ? ' on' : ''}" data-action="street-size" data-size="${esc(s)}">${esc(s)}</button>`).join('')}
      </div>
      ${inBag ? `<div style="font-size:12px;color:#7ed6a0;margin-top:14px">${inBag} × size ${esc(size)} already in your bag</div>` : ''}

      <div style="margin-top:28px;padding-top:22px;border-top:1px solid #1a1a1a;font-size:12px;color:#6f6f6f;line-height:1.8">
        Free AU shipping over A$150<br>Limited runs — once it's gone, it's gone
      </div>
    </div>

    <div class="pdp-bar">
      <button class="primary-btn" style="background:var(--street-red)" data-action="street-add" data-id="${esc(p.id)}" data-size="${esc(size)}">
        Add to bag — A$${p.price.toFixed(2)}
      </button>
    </div>
  </div>`;
}

// ── Street: bag ──
function viewStreetCart() {
  const { lines, count, subtotal } = Store.streetTotals();
  const freeShip = subtotal >= 150;

  return `
  <div class="screen" style="background:#050505">
    <div class="topbar" style="justify-content:space-between;background:#050505;position:sticky;top:0;z-index:5">
      <div style="display:flex;align-items:center;gap:10px">
        <button class="back" data-action="street-back" aria-label="Back">‹</button>
        <div class="oswald" style="font-weight:700;font-size:17px;letter-spacing:2px">YOUR BAG</div>
      </div>
    </div>

    ${!lines.length ? `
      <div style="padding:80px 30px;text-align:center">
        <div style="font-size:40px;margin-bottom:14px;opacity:.35">⛃</div>
        <div class="oswald" style="font-size:20px;margin-bottom:8px">Your bag is empty</div>
        <div style="color:#8a8a8a;font-size:13px;line-height:1.6;margin-bottom:26px">Collection 001 is live now.</div>
        <button class="primary-btn" style="background:var(--street-red);max-width:220px;margin:0 auto" data-action="street-back">Shop the drop</button>
      </div>` : `
      <div style="padding:8px 16px 0">
        ${lines.map((l) => `
          <div class="bag-line">
            <img src="${esc(streetImages(l.product)[0])}" alt="" class="bag-thumb" loading="lazy">
            <div style="flex:1;min-width:0">
              <div class="street-name" style="margin-bottom:2px">${esc(l.product.name)}</div>
              <div style="font-size:11.5px;color:#8a8a8a;margin-bottom:8px">Size ${esc(l.size)}${l.product.colour ? ' · ' + esc(l.product.colour) : ''}</div>
              <div style="display:flex;align-items:center;gap:12px">
                <div class="qty-ctl" style="background:#101011">
                  <button class="dec" data-action="street-qty" data-id="${esc(l.product.id)}" data-size="${esc(l.size)}" data-d="-1" aria-label="Decrease">–</button>
                  <div class="q">${l.qty}</div>
                  <button class="inc" style="background:var(--street-red)" data-action="street-qty" data-id="${esc(l.product.id)}" data-size="${esc(l.size)}" data-d="1" aria-label="Increase">+</button>
                </div>
                <button class="link-btn" data-action="street-remove" data-key="${esc(l.key)}">Remove</button>
              </div>
            </div>
            <div style="font-weight:700;font-size:14px;white-space:nowrap">A$${l.line.toFixed(2)}</div>
          </div>`).join('')}
      </div>

      <div style="padding:22px 20px calc(30px + var(--sab))">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#8a8a8a;margin-bottom:8px">
          <span>Subtotal (${count} item${count === 1 ? '' : 's'})</span><span>A$${subtotal.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;color:${freeShip ? '#7ed6a0' : '#8a8a8a'};margin-bottom:14px">
          <span>Shipping</span><span>${freeShip ? 'Free' : 'Calculated at checkout'}</span>
        </div>
        ${!freeShip ? `<div style="font-size:11.5px;color:#6f6f6f;margin-bottom:14px">A$${(150 - subtotal).toFixed(2)} away from free AU shipping</div>` : ''}
        <div style="display:flex;justify-content:space-between;font-size:17px;font-weight:800;padding-top:14px;border-top:1px solid #1a1a1a;margin-bottom:20px">
          <span>Total</span><span>A$${subtotal.toFixed(2)}</span>
        </div>
        <a class="primary-btn" style="background:var(--street-red);display:block;text-align:center;text-decoration:none;color:#fff"
           href="${streetOrderHref()}" data-action="street-ordered">Send order enquiry</a>
        <div style="font-size:11.5px;color:#6f6f6f;line-height:1.6;margin-top:12px;text-align:center">
          Opens your email with the order ready to send. We'll reply to confirm stock and payment.
        </div>
      </div>`}
  </div>`;
}

// Same approach as bookings: no server, so the order is handed to the phone's
// mail app pre-filled rather than silently going nowhere.
function streetOrderHref() {
  const { lines, count, subtotal } = Store.streetTotals();
  const body = [
    'Order enquiry — Coastline Street',
    '',
    ...lines.map((l) => `${l.qty}x ${l.product.name} — size ${l.size} — A$${l.line.toFixed(2)}`),
    '',
    `Total: A$${subtotal.toFixed(2)} (${count} item${count === 1 ? '' : 's'})`,
    '',
    'Name:',
    'Delivery address:',
    'Phone:',
    '',
    'Sent from the Coastline Hub app.',
  ].join('\n');
  return 'mailto:' + COMPANY.email
    + '?subject=' + encodeURIComponent('Coastline Street order enquiry')
    + '&body=' + encodeURIComponent(body);
}

function viewStreet() {
  if (UI.streetView === 'product') return viewStreetProduct();
  if (UI.streetView === 'cart') return viewStreetCart();
  return viewStreetShop();
}

function viewStreetShop() {
  return `
  <div class="screen" style="background:#050505">
    <div class="street-banner">Collection 001 — Bloodline — Now Live · Free AU shipping over A$150</div>
    <div class="topbar" style="justify-content:space-between;background:#050505">
      <div style="display:flex;align-items:center;gap:10px">
        <button class="back" data-action="nav" data-route="hub">‹</button>
        <div class="oswald" style="font-weight:700;font-size:17px;letter-spacing:2px">COASTLINE <span style="color:var(--street-red)">STREET</span></div>
      </div>
      ${streetBag()}
    </div>
    <div class="street-hero">
      <div class="inner">
        <div class="street-kicker">Collection 001</div>
        <h1 class="street-h1">BLOODLINE</h1>
        <div class="street-tag">BUILT ON THE COAST. POWERED BY QUALITY.</div>
        <button data-action="street-shop" style="background:var(--street-red);color:#fff;border:none;padding:14px 26px;font-family:'Oswald','Manrope',sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer">Shop The Drop</button>
      </div>
    </div>
    <div class="marquee">
      <div class="track">
        <span>Electrical ⚡ Power ⚡ Energy</span><span style="color:var(--street-red)">320GSM Heavyweight</span><span>Built on the Coast</span><span style="color:var(--street-red)">Raised Puff Embroidery</span><span>Est. 2024 — Central Coast NSW</span><span style="color:var(--street-red)">Limited Runs Only</span>
        <span>Electrical ⚡ Power ⚡ Energy</span><span style="color:var(--street-red)">320GSM Heavyweight</span><span>Built on the Coast</span><span style="color:var(--street-red)">Raised Puff Embroidery</span><span>Est. 2024 — Central Coast NSW</span><span style="color:var(--street-red)">Limited Runs Only</span>
      </div>
    </div>
    <div id="street-drop" style="padding:36px 20px 20px">
      <div class="street-kicker">The First Current</div>
      <h2 class="oswald" style="font-size:26px;font-weight:600;margin:0 0 8px">NEW DROP — COLLECTION 001</h2>
      <div style="color:#8a8a8a;font-size:12.5px;line-height:1.6">Oversized 320gsm heavyweight cotton. Raised puff embroidery. Built for the coast, not the office.</div>
    </div>
    <div class="street-grid">${STREET_PRODUCTS.map(streetCard).join('')}</div>
    <div style="padding:40px 20px 8px">
      <div class="street-kicker">Mascot Series</div>
      <h2 class="oswald" style="font-size:26px;font-weight:700;margin:0 0 8px">VOLT DIVISION ⚡</h2>
      <div style="color:#8a8a8a;font-size:12.5px;line-height:1.6">The tool crew comes to life. Cartoon-mascot graphic tees — multimeters, pliers and screwdrivers with attitude.</div>
    </div>
    <div class="street-grid" style="margin-top:16px">${STREET_VOLT.map(streetCard).join('')}</div>
    <div style="padding:44px 24px;text-align:center;border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;margin-top:36px">
      <div class="oswald" style="font-size:26px;font-weight:700;letter-spacing:1px;color:var(--street-red)">ELECTRICAL. POWER. ENERGY.</div>
      <div style="font-size:11px;letter-spacing:3px;color:#8a8a8a;text-transform:uppercase;margin-top:12px">Quality. Reliability. Solutions.</div>
    </div>
    <div style="padding:36px 24px calc(40px + var(--sab));text-align:center">
      <h2 class="oswald" style="font-size:22px;font-weight:600;margin:0 0 10px">JOIN THE CURRENT</h2>
      <p style="color:#8a8a8a;font-size:13px;margin:0 0 20px">Early access to drops, restocks and limited releases.</p>
      <div style="display:flex;border:1px solid #333">
        <input id="street-email" type="email" placeholder="Email address" style="flex:1;min-width:0;background:transparent;border:none;padding:13px 14px;color:#f5f5f2;font-size:13px;outline:none">
        <button data-action="street-subscribe" style="background:var(--street-red);color:#fff;border:none;padding:13px 18px;font-family:'Oswald','Manrope',sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer">Subscribe</button>
      </div>
      <div style="font-size:10px;color:#555;margin-top:26px">© 2024 Coastline Street — a Coastline Current Solutions company</div>
    </div>
  </div>`;
}

// ── Tools ──
function viewTools() {
  return `
  <div class="screen" style="background:#111214">
    <div class="topbar" style="justify-content:space-between">
      <div style="display:flex;align-items:center;gap:10px">
        <button class="back" data-action="nav" data-route="hub">‹</button>
        <div class="oswald" style="font-weight:700;font-size:17px;letter-spacing:2px">CCS <span style="color:var(--gold)">TOOLS</span></div>
      </div>
    </div>
    <div style="padding:36px 24px 40px;text-align:center">
      <div style="font-size:11px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:14px">Concept · Pre-Prototype</div>
      <h1 class="oswald" style="font-size:30px;font-weight:700;margin:0 0 16px;line-height:1.15">The Cable Retrieval &amp; Inspection Tool</h1>
      <p style="color:#b0b0b0;font-size:14px;line-height:1.7;margin:0">A purpose-built cable retrieval system designed by an electrician, for electricians — replacing the bent bucket handle for good.</p>
    </div>
    <div style="padding:0 20px 24px">
      <img src="img/tools/tool.svg" alt="Cable retrieval hook tool and camera probe" style="width:100%;display:block;border:1px solid #262626;border-radius:12px">
    </div>
    <div style="padding:0 20px 30px;display:flex;flex-direction:column;gap:14px">
      <div class="card" style="border-color:#262626">
        <div style="font-size:11px;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:10px">The Problem</div>
        <p style="font-size:13px;color:#b0b0b0;line-height:1.7;margin:0">Electricians commonly improvise with a bent bucket handle to hook cables inside wall cavities and ceilings — no visibility, lots of guessing, repeated attempts, wasted time.</p>
      </div>
      <div class="card" style="border-color:#262626">
        <div style="font-size:11px;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:10px">The Idea</div>
        <p style="font-size:13px;color:#b0b0b0;line-height:1.7;margin:0">A two-part handheld system: an extendable, interchangeable-tip cable hook plus a flexible gooseneck camera/light probe — one hand hooks, one hand sees.</p>
      </div>
    </div>
    <div style="padding:0 20px 30px">
      <h2 class="oswald" style="font-size:20px;font-weight:600;text-align:center;margin:0 0 20px">TWO TOOLS, ONE JOB</h2>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="card" style="border-color:#262626">
          <div style="font-size:26px;margin-bottom:10px">🪝</div>
          <div class="oswald" style="font-size:16px;font-weight:600;margin-bottom:8px">Hook Tool</div>
          <ul style="margin:0;padding-left:18px;color:#a9a9a9;font-size:12.5px;line-height:2">
            <li>Compact handheld handle</li>
            <li>Telescopic, semi-rigid shaft</li>
            <li>Rotating hook control</li>
            <li>Interchangeable tips: open, closed, fork, lasso, capture</li>
          </ul>
        </div>
        <div class="card" style="border-color:#262626">
          <div style="font-size:26px;margin-bottom:10px">📷</div>
          <div class="oswald" style="font-size:16px;font-weight:600;margin-bottom:8px">Camera Probe</div>
          <ul style="margin:0;padding-left:18px;color:#a9a9a9;font-size:12.5px;line-height:2">
            <li>Flexible gooseneck, small diameter</li>
            <li>Built-in LED light</li>
            <li>Live view on phone</li>
            <li>Held independently or clip-mounted</li>
          </ul>
        </div>
      </div>
    </div>
    <div style="background:#0d0d0f;padding:36px 24px">
      <h2 class="oswald" style="font-size:19px;font-weight:600;text-align:center;margin:0 0 22px">ROADMAP</h2>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px">
        ${TOOLS_ROADMAP.map(step => `<div class="tools-chip">${esc(step)}</div>`).join('')}
      </div>
    </div>
    <div style="padding:36px 24px;text-align:center">
      <div class="oswald" style="font-size:18px;font-weight:600;color:var(--gold);margin-bottom:10px">"Not another fish tape. Not another inspection camera."</div>
      <p style="color:#8a8a8a;font-size:12.5px;margin:0">Designed for electricians, data installers, security &amp; solar installers, and HVAC techs.</p>
    </div>
    <div style="border-top:1px solid #232323;padding:20px 24px calc(28px + var(--sab));text-align:center;font-size:10.5px;color:#555;line-height:1.6">
      CCS Tools — early concept, no pricing or manufacturing yet.<br>Part of the Coastline Current Solutions group.
    </div>
  </div>`;
}

// ── Event wiring (delegation) ───────────────────────────────────────────────
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const a = el.dataset.action;

  if (a === 'nav') go({ route: el.dataset.route, modal: null });
  else if (a === 'cust-tab') go({ custTab: el.dataset.tab, custCategory: null });
  else if (a === 'open-cat') go({ custCategory: el.dataset.cat });
  else if (a === 'close-cat') go({ custCategory: null });
  else if (a === 'custom-job') {
    Store.setQty('cart', 'custom-job', Store.state.cart['custom-job'] ? -1 : 1);
    go({ custTab: 'job' });
  }
  else if (a === 'qty') {
    Store.setQty(el.dataset.cart, el.dataset.id, Number(el.dataset.d));
    render();
  }
  else if (a === 'remove-line') {
    const qty = Store.state.cart[el.dataset.id] || 0;
    Store.setQty('cart', el.dataset.id, -qty);
    render();
  }
  else if (a === 'open-booking') go({ modal: 'booking' });
  else if (a === 'close-booking') go({ modal: null });
  else if (a === 'time-slot') {
    Store.state.form.timeSlot = el.dataset.slot;
    Store.save();
    render();
  }
  else if (a === 'submit-booking') {
    UI.confirm = Store.submitBooking();
    go({ modal: 'confirm' });
  }
  else if (a === 'booking-sent') {
    // Deferred: these are real <a> elements, and re-rendering synchronously
    // would tear the anchor out of the DOM mid-click and cancel the handoff
    // to the mail or messaging app.
    setTimeout(() => go({ modal: null, custTab: 'bookings' }), 900);
  }
  else if (a === 'confirm-to-bookings') go({ modal: null, custTab: 'bookings' });
  else if (a === 'confirm-to-home') go({ modal: null, custTab: 'home', custCategory: null });
  else if (a === 'staff-mode') {
    Store.set({ staffMode: el.dataset.on === '1' });
    go({ staffTab: 'dashboard' });
  }
  else if (a === 'staff-tab') go({ staffTab: el.dataset.tab });
  else if (a === 'toggle-callout') { Store.set({ calloutFee: !Store.state.calloutFee }); render(); }
  else if (a === 'toggle-customer') go({ expandedCustomer: UI.expandedCustomer === el.dataset.id ? null : el.dataset.id });
  else if (a === 'reset-data') {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
  else if (a === 'street-open') {
    go({ streetView: 'product', streetProduct: el.dataset.id, streetSize: null });
  }
  else if (a === 'street-size') go({ streetSize: el.dataset.size });
  else if (a === 'street-cart') go({ streetView: 'cart' });
  else if (a === 'street-back') {
    // From the bag, step back to whatever was being looked at before.
    go(UI.streetView === 'cart' && UI.streetProduct
      ? { streetView: 'product' }
      : { streetView: 'shop', streetProduct: null });
  }
  else if (a === 'street-qty') {
    Store.streetAdd(el.dataset.id, el.dataset.size, Number(el.dataset.d));
    render();
  }
  else if (a === 'street-remove') { Store.streetRemove(el.dataset.key); render(); }
  else if (a === 'street-ordered') {
    // Deferred for the same reason as bookings: re-rendering synchronously
    // would remove the anchor mid-click and cancel the handoff to the mail app.
    setTimeout(() => go({ streetView: 'shop', streetProduct: null }), 900);
  }
  else if (a === 'street-add') {
    const size = el.dataset.size || STREET_SIZES[1];
    Store.streetAdd(el.dataset.id, size, 1);
    render();
    toast(`Added — size ${size}`);
  }
  else if (a === 'street-shop') {
    const t = document.getElementById('street-drop');
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  }
  else if (a === 'street-subscribe') {
    const em = document.getElementById('street-email');
    if (em && em.value.includes('@')) { em.value = ''; toast("You're on the list ⚡"); }
    else toast('Enter a valid email address');
  }
});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const a = el.dataset.action;
  if (a === 'job-notes') { Store.state.jobNotes = el.value; Store.save(); }
  else if (a === 'form-field') { Store.state.form[el.dataset.field] = el.value; Store.save(); }
  else if (a === 'quote-field') { Store.state[el.dataset.field] = el.value; Store.save(); }
  else if (a === 'set-price') {
    const n = el.value === '' ? null : Number(el.value);
    const overrides = Object.assign({}, Store.state.priceOverrides);
    if (n == null || isNaN(n)) delete overrides[el.dataset.id];
    else overrides[el.dataset.id] = n;
    Store.set({ priceOverrides: overrides });
  }
});

render();
