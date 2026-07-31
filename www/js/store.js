/* Coastline Hub — app state with localStorage persistence */

const STORAGE_KEY = 'coastline-hub-state-v1';

const DEFAULT_BOOKINGS = [
  { id: 'b1', customerName: 'Marion Osei', itemsSummary: 'Safety switch install + smoke alarm', total: 310, hasCustom: false, date: 'Mon 28 Jul', time: '9:00 AM – 11:00 AM', address: '4 Riverside Dr, Gosford', status: 'Confirmed', isNew: false, mine: false },
  { id: 'b2', customerName: 'Dean Whitfield', itemsSummary: 'Switchboard upgrade', total: null, hasCustom: true, date: 'Mon 28 Jul', time: '1:00 PM – 3:00 PM', address: '19 Highview Tce, Erina', status: 'Pending confirmation', isNew: false, mine: false },
  { id: 'b3', customerName: 'Priya Nair', itemsSummary: '2x downlight sets, pendant install', total: 800, hasCustom: false, date: 'Tue 29 Jul', time: '8:00 AM – 10:00 AM', address: '7 Kincumber Cres, Kincumber', status: 'Confirmed', isNew: false, mine: false },
];

const Store = {
  state: {
    // electrical — customer
    cart: {},               // itemId -> qty
    jobNotes: '',
    bookings: DEFAULT_BOOKINGS.slice(),
    form: { address: '', date: '', name: '', phone: '', timeSlot: null },
    // electrical — staff
    staffMode: false,
    quoteCart: {},
    quoteCustomer: '',
    quoteSite: '',
    calloutFee: false,
    priceOverrides: {},     // itemId -> number
    // Coastline Street cart: "productId|size" -> qty. Size is part of the key
    // so the same garment in M and L are separate lines.
    streetCart: {},
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        this.state = Object.assign({}, this.state, saved);
        this.state.form = Object.assign({ address: '', date: '', name: '', phone: '', timeSlot: null }, saved.form);
        if (!Array.isArray(this.state.bookings) || !this.state.bookings.length) {
          this.state.bookings = DEFAULT_BOOKINGS.slice();
        }
        // streetCart used to be a plain count. Anyone carrying that older
        // saved state would otherwise land here with a number where the code
        // now expects a map, so drop it rather than crash on load.
        if (typeof this.state.streetCart !== 'object' || this.state.streetCart === null) {
          this.state.streetCart = {};
        }
      }
    } catch (e) { /* corrupt state — start fresh */ }
  },

  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); } catch (e) { /* storage full/unavailable */ }
  },

  set(patch) {
    Object.assign(this.state, patch);
    this.save();
  },

  // ── cart helpers ──
  setQty(cartKey, itemId, delta) {
    const cart = Object.assign({}, this.state[cartKey]);
    cart[itemId] = Math.max(0, (cart[itemId] || 0) + delta);
    if (cart[itemId] === 0) delete cart[itemId];
    this.set({ [cartKey]: cart });
  },

  priceOf(item) {
    const o = this.state.priceOverrides[item.id];
    return (o === undefined || o === null) ? item.price : o;
  },

  cartLines(cartObj) {
    return Object.entries(cartObj)
      .filter(([, q]) => q > 0)
      .map(([id, qty]) => ({ it: FLAT_ITEMS.find(f => f.id === id), qty }))
      .filter(l => l.it);
  },

  cartTotals(cartObj) {
    const lines = this.cartLines(cartObj);
    let subtotal = 0, hasCustom = false, count = 0;
    lines.forEach(({ it, qty }) => {
      count += qty;
      const price = this.priceOf(it);
      if (price == null) hasCustom = true; else subtotal += price * qty;
    });
    return { lines, subtotal, hasCustom, count };
  },

  summaryText(cartObj) {
    const { lines } = this.cartTotals(cartObj);
    if (!lines.length) return 'Custom job request';
    return lines.map(l => (l.qty > 1 ? l.qty + 'x ' : '') + l.it.name).join(', ');
  },

  // Posts a submission to the CRM relay. Resolves true only on a confirmed
  // 2xx — not-configured, offline, relay down and CRM-rejected all resolve
  // false, so the caller falls back to email rather than a booking quietly
  // evaporating. Never rejects, and never blocks the UI: the confirmation
  // screen renders immediately and this settles behind it.
  sendToCrm(type, data) {
    if (typeof CRM_RELAY_URL !== 'string' || !CRM_RELAY_URL) return Promise.resolve(false);
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    return fetch(CRM_RELAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // _hp is the relay's honeypot and must always go out empty.
      body: JSON.stringify(Object.assign({ type: type, _hp: '' }, data)),
      signal: ctl.signal,
    })
      .then((r) => r.ok)
      .catch(() => false)
      .then((ok) => { clearTimeout(timer); return ok; });
  },

  // ── Coastline Street cart ──
  streetKey(id, size) { return id + '|' + size; },

  streetAdd(id, size, d) {
    const key = this.streetKey(id, size);
    const next = Object.assign({}, this.state.streetCart);
    const qty = (next[key] || 0) + d;
    if (qty > 0) next[key] = qty; else delete next[key];
    this.set({ streetCart: next });
  },

  streetRemove(key) {
    const next = Object.assign({}, this.state.streetCart);
    delete next[key];
    this.set({ streetCart: next });
  },

  // Resolves cart keys back to products, skipping any whose id no longer
  // exists so a renamed product cannot break the cart for someone mid-shop.
  streetLines() {
    const all = STREET_PRODUCTS.concat(STREET_VOLT);
    return Object.entries(this.state.streetCart).map(([key, qty]) => {
      const [id, size] = key.split('|');
      const p = all.find((x) => x.id === id);
      return p ? { key, product: p, size, qty, line: p.price * qty } : null;
    }).filter(Boolean);
  },

  streetTotals() {
    const lines = this.streetLines();
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.line, 0),
    };
  },

  submitBooking() {
    const s = this.state;
    const { subtotal, hasCustom } = this.cartTotals(s.cart);
    const ref = 'CCS-' + (2400 + Math.floor(Math.random() * 400));
    const summary = {
      itemsSummary: this.summaryText(s.cart),
      date: s.form.date || 'Date to be confirmed',
      time: s.form.timeSlot || 'Time to be confirmed',
      address: s.form.address || 'Address to be confirmed',
      // Carried through so the confirmation screen can hand the whole booking
      // to an email or text — nothing is transmitted automatically.
      name: s.form.name || '',
      phone: s.form.phone || '',
      notes: s.jobNotes || '',
      total: hasCustom ? null : subtotal,
      hasCustom,
      totalLabel: hasCustom ? (subtotal > 0 ? money(subtotal) + ' + quote' : 'Quote required') : money(subtotal),
    };
    const booking = {
      id: ref, customerName: s.form.name || 'You', itemsSummary: summary.itemsSummary,
      total: summary.total, hasCustom, date: summary.date, time: summary.time,
      address: summary.address, status: 'Pending confirmation', isNew: true, mine: true,
    };
    this.set({ bookings: [booking].concat(s.bookings), cart: {}, jobNotes: '' });
    return { ref, summary };
  },
};

Store.load();
