(function () {
  'use strict';

  const L = window.DC;
  const $ = id => document.getElementById(id);
  const SEEDS = window.DC_SCRIPT_SEEDS;
  const GROUPS = [...new Set(SEEDS.map(script => script.group))];
  const VIEWS = { dial: 'Dial', board: 'Board', calls: 'Calls', pipeline: 'Pipeline', funnel: 'Funnel',
    heatmap: 'Heatmap', leads: 'Leads', scripts: 'Scripts', content: 'Content', settings: 'Settings', import: 'Import' };
  const ICONS = {
    dial: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.9 19.9 0 0 1-8.7-3.1 19.5 19.5 0 0 1-6-6A19.9 19.9 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7l.6 2.8a2 2 0 0 1-.4 2.1l-1.3 1.3a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4l2.8.6a2 2 0 0 1 1.9 2.1Z"/>',
    board: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 16v-4m4 4V8m4 8v-6"/>',
    calls: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pipeline: '<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="11" rx="1"/><rect x="17" y="4" width="4" height="13" rx="1"/>',
    funnel: '<path d="M3 4h18l-7 8v6l-4 2v-8z"/>',
    heatmap: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m6-18v18M3 9h18M3 15h18"/>',
    leads: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8m-8 3h8m-8 3h5"/>',
    scripts: '<path d="M12 6a5 5 0 0 0-5-3H3v16h4a5 5 0 0 1 5 2 5 5 0 0 1 5-2h4V3h-4a5 5 0 0 0-5 3Zm0 0v15"/>',
    content: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m3 18 6-6 4 4 3-4 5 6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m9 3-.7 3-2 .9L3.5 6l-2 3.5 2.2 2-.1 2.2-2.1 2 2 3.4 3-.8 1.8 1 .7 2.7h4l.7-2.7 2-1 2.8.8 2-3.4-2.2-2v-2.2l2.2-2-2-3.5-2.8.9-2-.9-.7-3z" transform="translate(1 0)"/>',
    import: '<path d="M12 16V3m-5 5 5-5 5 5M4 14v6h16v-6"/>',
    download: '<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    no_answer: '<path d="m3 3 18 18m-5-8c1.6.4 3.2.5 4.5.4l1.4 3.2a1 1 0 0 1-.5 1.3l-2.2 1.2M3 14l-1 2.7a1 1 0 0 0 .5 1.3l3 1.4a1 1 0 0 0 1.3-.4l1.7-2.7a15 15 0 0 1 4-.1M5 12a17 17 0 0 1 5.1-.9"/>',
    gatekeeper: '<path d="M12 22s7-3.5 7-10V5l-7-3-7 3v7c0 6.5 7 10 7 10Z"/>',
    owner_spoke: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/>',
    meeting_booked: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-12 5 2 2 4-4"/>',
    dead: '<path d="m6 6 12 12M18 6 6 18"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    undo: '<path d="m9 5-5 5 5 5M4 10h10a5 5 0 0 1 0 10"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    edit: '<path d="m4 16-1 5 5-1L20 8l-4-4L4 16Zm10-10 4 4"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    left: '<path d="m15 6-6 6 6 6"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3c-1 .5-1 1-1 2m0 3h.01"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19m0-14-1.5 1.5m-11 11L5 19"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  const active = row => !row.deleted;
  const values = (state, store) => [...state.data[store].values()].filter(active);
  const number = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });
  const n = value => number.format(value);
  const inr = value => '₹' + n(value);
  const percent = value => value == null ? '–' : Math.round(value * 100) + '%';
  const clockFormat = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = value => value ? clockFormat.format(new Date(value)).toUpperCase() : '–';
  const humanDay = value => value ? dateFormat.format(typeof value === 'string' && value.length === 10 ? L.dateOf(value) : new Date(value)) : '–';
  const when = value => value ? humanDay(value) + ' · ' + time(value) : '–';
  const words = (count, singular, plural = singular + 's') => n(count) + ' ' + (count === 1 ? singular : plural);
  const stageLabel = value => ({ booked: 'Booked', held: 'Held', proposal: 'Proposal', won: 'Won', lost: 'Lost', no_show: 'No-show' })[value];
  const statusLabel = value => ({ new: 'New', meeting: 'Meeting' })[value] || L.OUTCOMES[value] || value;
  function relative(value, now = new Date()) {
    const diff = (+new Date(value) - +now) / L.HOUR;
    if (!Number.isFinite(diff)) return '–';
    if (Math.abs(diff) < 1 / 60) return 'now';
    const hours = Math.floor(Math.abs(diff));
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      if (days === 1) return diff < 0 ? 'yesterday' : 'tomorrow';
      return diff < 0 ? days + 'd ago' : 'in ' + days + 'd';
    }
    const span = hours ? hours + 'h' : Math.max(1, Math.floor(Math.abs(diff) * 60)) + 'm';
    return diff < 0 ? span + ' ago' : 'in ' + span;
  }
  const state = {
    data: Object.fromEntries(L.STORES.map(store => [store, new Map()])), view: 'board',
    current: null, today: L.day(new Date()), dayStats: new Map(), logsByLead: new Map(), logsByDay: new Map(),
    due: [], todayMeetings: [], callbacks: new Map(), openMeetings: new Map(), sessionLogs: [], sessionStart: null, lastOutcome: -Infinity,
    lastSave: null, saveError: false, fallback: '', backupDismissed: false, booting: true, busy: false,
    scriptGroup: GROUPS[0], scriptOpen: null, scriptQuery: '', scriptSearchOpen: false, logOpen: false,
    filters: { search: '', status: '', city: '', batch: '', note: false, page: 0 }, pipelineFilter: 'all',
    weekOffset: 0, metric: 'answered', heatCell: null, contentDay: '', contentSize: 1920,
    update: null, import: null, milestones: new Set(), keyTimer: null
  };
  let settings = L.DEFAULTS;
  let queue;
  let wakeLock;
  let wakePending = false;

  function reportError(error) {
    console.error(error);
    toast('Something failed. Your data is safe. Last save ' + (state.lastSave ? time(state.lastSave) : '–') + '.');
  }
  function guard(fn) {
    return function (...args) {
      try {
        const result = fn.apply(this, args);
        if (result && typeof result.catch === 'function') result.catch(reportError);
      } catch (error) { reportError(error); }
    };
  }
  const on = (node, name, fn, options) => node.addEventListener(name, guard(fn), options);
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value == null || value === false) continue;
      if (key === 'class') el.className = value;
      else if (key.startsWith('on') && typeof value === 'function') on(el, key.slice(2), value);
      else if (key === 'checked' || key === 'disabled' || key === 'selected' || key === 'value') el[key] = value;
      else el.setAttribute(key, value === true ? '' : value);
    }
    for (const child of children.flat(Infinity)) {
      if (child == null || child === false) continue;
      el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return el;
  }
  function icon(name, size = 18) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
      stroke: 'currentColor', 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })) svg.setAttribute(key, value);
    // The glyph registry is a fixed set of source-code literals.
    svg.innerHTML = ICONS[name] || ICONS.calls;
    return svg;
  }
  const key = value => h('kbd', {}, value);
  const btn = (label, action, opts = {}) => h('button', { type: 'button', class: 'button ' + (opts.kind || ''), onclick: action,
    title: opts.title, 'aria-label': opts.title || label, disabled: opts.disabled, id: opts.id, 'aria-pressed': opts.pressed },
  opts.icon && icon(opts.icon), label, opts.key && key(opts.key));
  const iconButton = (glyph, label, action) => btn('', action, { icon: glyph, title: label, kind: 'icon-button' });
  const chip = (text, tone = '') => h('span', { class: 'chip ' + tone }, text);
  const subtle = text => h('p', { class: 'muted' }, text);
  const title = (name, actions) => h('header', { class: 'page-title' }, h('h1', {}, name), actions && h('div', { class: 'actions' }, actions));
  const panel = (className, ...children) => h('section', { class: 'panel ' + (className || '') }, children);
  const field = (label, control, hint) => h('label', { class: 'field' }, h('span', {}, label), control, hint && h('small', {}, hint));
  const input = (name, type = 'text', value = '', attrs = {}) => h('input', { name, type, value, ...attrs });
  const area = (name, value = '', attrs = {}) => h('textarea', { name, rows: 3, ...attrs }, value);
  function options(name, entries, value, attrs = {}) {
    return h('select', { name, ...attrs }, entries.map(entry => {
      const [id, label] = Array.isArray(entry) ? entry : [entry, entry];
      return h('option', { value: id, selected: String(id) === String(value) }, label);
    }));
  }
  const check = (label, name, checked, attrs = {}) => h('label', { class: 'check' }, input(name, 'checkbox', 'on', { checked, ...attrs }), label);
  const formValue = (form, name) => form.elements.namedItem(name).value.trim();
  const isField = el => el && (el.matches('input,textarea,select') || el.isContentEditable);
  const focus = id => { const el = $(id); if (el) el.focus(); };
  const text = (id, value) => { const el = $(id); if (el && el.textContent !== value) el.textContent = value; };
  const todayStats = () => state.dayStats.get(state.today) || L.zero();
  const outText = value => L.OUTCOMES[value] || value;
  const touch = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const phoneWidth = () => window.matchMedia('(max-width: 699px)').matches;
  const compact = () => window.matchMedia('(max-width: 1099px)').matches;
  const hasModal = () => $('dialog').open || $('drawer').open;

  function toast(message, actions = [], { outcome = false, duration = 6000 } = {}) {
    const region = $('toasts');
    if (outcome) for (const old of region.querySelectorAll('.outcome-toast')) old.remove();
    const node = h('div', { class: 'toast' + (outcome ? ' outcome-toast' : '') },
      h('span', {}, message), actions.length > 0 && h('div', { class: 'toast-actions' },
        actions.map(([label, action, hint]) => btn(label, action, { kind: 'text-button', key: hint }))));
    region.append(node);
    while (region.children.length > 3) region.firstElementChild.remove();
    setTimeout(() => node.remove(), duration);
    return node;
  }
  function closeModal(id = 'dialog') {
    const el = $(id);
    if (el.open) el.close();
  }
  function openModal(name, content, { drawer = false, className = '' } = {}) {
    const el = $(drawer ? 'drawer' : 'dialog');
    el.className = (drawer ? 'drawer ' : '') + className;
    el.replaceChildren(h('header', { class: 'modal-title' },
      h('h2', { id: drawer ? 'drawer-title' : 'dialog-title' }, name),
      iconButton('dead', 'Close', () => closeModal(el.id))), content);
    if (!el.open) el.showModal();
    if (content.matches?.('form')) {
      const field = content.querySelector('input:not([type="hidden"]):not(:disabled),textarea:not(:disabled),select:not(:disabled)');
      (field || content.querySelector('button[type="submit"]'))?.focus({ preventScroll: true });
    }
    return el;
  }
  function makeForm(fields, handler, label = 'Save', extra = []) {
    const error = h('p', { class: 'form-error', role: 'status', hidden: true });
    const submit = h('button', { class: 'button primary', type: 'submit' }, label);
    const form = h('form', { class: 'form', onsubmit: async event => {
      event.preventDefault();
      if (form.dataset.saving) return;
      error.hidden = true;
      const show = message => { error.textContent = message; error.hidden = false; };
      form.dataset.saving = 'true';
      try { await handler(form, show); } finally { delete form.dataset.saving; }
    } }, fields, error, h('div', { class: 'actions form-actions' }, extra, submit));
    return { form, submit, error };
  }
  function confirmAction(name, description, label, action, extra) {
    const { form } = makeForm([subtle(description), extra], async (el, error) => {
      if (await action(el, error) !== false) closeModal();
    }, label);
    openModal(name, form);
  }
  async function copy(value, announce = true) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch (_) {
      const el = area('clipboard', value, { class: 'clipboard-fallback', readonly: true });
      const prior = document.activeElement;
      const host = $('dialog').open ? $('dialog') : $('drawer').open ? $('drawer') : document.body;
      host.append(el);
      el.select();
      el.setSelectionRange(0, value.length);
      const copied = document.execCommand('copy');
      el.remove();
      if (prior && prior.isConnected) prior.focus({ preventScroll: true });
      if (!copied) {
        const manual = area('copy-text', value, { readonly: true, 'aria-label': 'Text to copy' });
        openModal('Copy text', h('div', { class: 'form' }, manual));
        manual.select();
        return;
      }
    }
    if (announce) toast('Copied');
  }
  function download(name, content, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = h('a', { href: url, download: name });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  function websiteURL(value) {
    if (!value || /^\s*(?!https?:)[a-z][a-z0-9+.-]*:/i.test(value)) return '';
    try {
      const url = new URL(/^[a-z]+:\/\//i.test(value) ? value : 'https://' + value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (_) { return ''; }
  }

  function indexLog(log, direction) {
    if (direction > 0 && state.logsByLead.get(log.leadId)?.slice(-1)[0] !== log.id) {
      if (!state.logsByLead.has(log.leadId)) state.logsByLead.set(log.leadId, []);
      state.logsByLead.get(log.leadId).push(log.id);
      if (!state.logsByDay.has(log.day)) state.logsByDay.set(log.day, []);
      state.logsByDay.get(log.day).push(log.id);
    }
    if (!L.live(log)) return;
    if (!state.dayStats.has(log.day)) state.dayStats.set(log.day, L.zero());
    L.tally(state.dayStats.get(log.day), log, direction);
  }
  function updateIndexes(store, row, previous) {
    if (store === 'leads') {
      if (!row.deleted && row.status === 'callback' && row.callbackAt) state.callbacks.set(row.id, row);
      else state.callbacks.delete(row.id);
      queue.update(row);
    }
    if (store === 'meetings') {
      if (!row.deleted && row.stage === 'booked') state.openMeetings.set(row.id, row);
      else state.openMeetings.delete(row.id);
    }
    if (store === 'logs') {
      if (previous) {
        if (L.live(previous) && !L.live(row)) indexLog(previous, -1);
        else if (!L.live(previous) && L.live(row)) L.tally(state.dayStats.get(row.day) || L.zero(), row);
      } else indexLog(row, 1);
    }
  }
  function hydrate(data) {
    for (const store of L.STORES) state.data[store] = new Map(data[store].map(row => [row.id, row]));
    settings = { ...L.DEFAULTS, ...state.data.settings.get('settings') };
    queue = new L.Queue(state.data.leads);
    state.batchOrder = [...state.data.leads.values()].reduce((latest, item) =>
      Math.max(latest, item.batchOrder || Date.parse(item.createdAt) || 0), 0);
    state.callbacks = new Map(values(state, 'leads').filter(row => row.status === 'callback' && row.callbackAt).map(row => [row.id, row]));
    state.openMeetings = new Map(values(state, 'meetings').filter(row => row.stage === 'booked').map(row => [row.id, row]));
    state.dayStats = new Map();
    state.logsByDay = new Map();
    state.logsByLead = new Map();
    const logs = [...state.data.logs.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.ts.localeCompare(b.ts));
    for (const log of logs) indexLog(log, 1);
    refreshDue();
  }
  function snapshot() {
    return Object.fromEntries(L.STORES.map(store => [store, [...state.data[store].values()]]));
  }
  const storage = new window.ConsoleStorage({
    fallback: message => { state.fallback = message; renderNotices(); },
    saved: date => { state.lastSave = date; if (state.saveError) { state.saveError = false; renderNotices(); } },
    failed: () => { state.saveError = true; renderNotices(); }
  });
  function installChanges(changes) {
    for (const [store, rows] of Object.entries(changes)) {
      for (const row of rows) {
        const previous = state.data[store].get(row.id);
        state.data[store].set(row.id, row);
        updateIndexes(store, row, previous);
        if (store === 'settings') settings = row;
      }
    }
  }
  function commit(changes) {
    installChanges(changes);
    return storage.commit(changes);
  }
  function settingPatch(fields) {
    return { ...settings, ...fields, id: 'settings', updatedAt: new Date().toISOString() };
  }
  function saveSettings(fields) {
    const next = settingPatch(fields);
    if (!L.validSettings(next)) return false;
    commit({ settings: [next] });
    manageWake();
    return true;
  }
  function renderNotices() {
    const warnings = [];
    if (state.saveError) warnings.push(h('div', { class: 'notice error' },
      'Saving failed. Export a backup now.', btn('Export', exportBackup, { icon: 'download', disabled: state.booting && !queue })));
    if (state.fallback) warnings.push(h('div', { class: 'notice warning' }, state.fallback));
    if (state.update) warnings.push(h('div', { class: 'notice' }, 'Update available.', btn('Reload', async () => {
      if (storage.tail) await storage.tail;
      if (state.saveError) { toast('Export a backup before reloading.'); return; }
      state.update.postMessage('activate');
    })));
    if (!state.booting && !state.backupDismissed &&
        (!settings.lastBackupAt || Date.now() - Date.parse(settings.lastBackupAt) > L.DAY)) {
      const days = settings.lastBackupAt ? Math.max(1, Math.floor((Date.now() - Date.parse(settings.lastBackupAt)) / L.DAY)) : 0;
      warnings.push(h('div', { class: 'notice backup-notice' },
        settings.lastBackupAt ? 'Last backup: ' + words(days, 'day') + ' ago.' : 'No backup exported yet.',
        btn('Export now', exportBackup, { kind: 'text-button' }),
        iconButton('dead', 'Dismiss backup reminder', () => { state.backupDismissed = true; renderNotices(); })));
    }
    $('notices').replaceChildren(...warnings);
  }
  function refreshDue(now = new Date()) {
    state.due = [...state.callbacks.values()].filter(item => Date.parse(item.callbackAt) <= +now);
    state.todayMeetings = [...state.openMeetings.values()].filter(item => L.day(new Date(item.meetingAt)) === state.today)
      .sort((a, b) => a.meetingAt.localeCompare(b.meetingAt));
    document.title = state.due.length ? '(' + state.due.length + ') Dial Console' : 'Dial Console';
    for (const badge of document.querySelectorAll('.nav-badge')) {
      const count = badge.dataset.view === 'calls' ? state.due.length : state.todayMeetings.length;
      badge.textContent = count || '';
      badge.hidden = !count;
    }
  }
  function navButton(view, mobile = false) {
    const badge = view === 'calls' || view === 'pipeline';
    const selected = state.view === view || (view === 'more' && !['dial', 'board', 'calls', 'pipeline'].includes(state.view));
    return h('button', { class: 'nav-item' + (selected ? ' selected' : ''), type: 'button',
      'aria-current': selected ? 'page' : null, onclick: () => view === 'more' ? moreMenu() : navigate(view) },
    icon(view), h('span', {}, VIEWS[view] || 'More'), badge && h('span', { class: 'nav-badge', 'data-view': view, hidden: true }),
    !mobile && view === 'dial' && key('D'));
  }
  const brand = () => h('button', { class: 'brand', type: 'button', onclick: () => navigate('board'), 'aria-label': 'Dial Console Board' },
    h('span', { class: 'brand-mark' }, icon('dial', 19)), h('span', {}, 'Dial Console'));
  function renderNav() {
    $('rail').replaceChildren(brand(),
      h('nav', { class: 'rail-links', 'aria-label': 'Main navigation' },
        ['board', 'dial', 'calls', 'pipeline'].map(view => navButton(view)),
        h('div', { class: 'nav-rule' }), ['funnel', 'heatmap', 'leads', 'scripts', 'content', 'settings'].map(view => navButton(view))),
      h('div', { class: 'rail-footer' },
        h('div', { class: 'local-label' }, h('span', { class: 'local-dot' }), 'Stored on this device'),
        btn('Shortcuts', shortcutsModal, { icon: 'help', key: '?', kind: 'plain' })));
    $('topbar').replaceChildren(brand(), h('nav', { 'aria-label': 'Main navigation' },
      ['board', 'dial', 'calls', 'pipeline', 'more'].map(view => navButton(view))), iconButton('help', 'Keyboard shortcuts', shortcutsModal));
    $('mobile-nav').replaceChildren(...['dial', 'board', 'calls', 'pipeline', 'more'].map(view => navButton(view, true)));
    refreshDue();
  }
  function moreMenu() {
    openModal('More', h('nav', { class: 'more-list', 'aria-label': 'More views' },
      ['funnel', 'heatmap', 'leads', 'scripts', 'content', 'settings'].map(view =>
        btn(VIEWS[view], () => { closeModal(); navigate(view); }, { icon: view }))));
  }
  function selectNext(now = new Date()) {
    state.current = queue.next(now, settings)?.id || null;
  }
  function navigate(view, opts = {}) {
    if (state.booting || state.busy || !VIEWS[view]) return;
    const changed = view !== state.view;
    state.view = view;
    if (view === 'dial') {
      if (!state.sessionStart) state.sessionStart = performance.now();
      if (!state.current || state.data.leads.get(state.current)?.deleted) selectNext();
    }
    if (view === 'content' && opts.today) state.contentDay = state.today;
    if (changed) {
      renderNav();
      window.scrollTo(0, 0);
    }
    render();
    if (changed) $('screen').focus({ preventScroll: true });
    manageWake();
  }
  function render() {
    const screens = { dial: dialView, board: boardView, calls: callsView, pipeline: pipelineView,
      import: importView, leads: leadsView, scripts: scriptsView, funnel: funnelView, heatmap: heatmapView,
      content: contentView, settings: settingsView };
    const screen = $('screen');
    screen.className = 'screen screen-' + state.view;
    screen.replaceChildren(...[screens[state.view]()].flat(Infinity).filter(Boolean));
  }
  function refreshClock() {
    if (state.booting || state.busy) return;
    const now = new Date();
    const changedDay = state.today !== L.day(now);
    const previousClock = state.clock || +now;
    state.clock = +now;
    state.today = L.day(now);
    const previousDue = state.due.length;
    const previousMeetings = state.todayMeetings.length;
    refreshDue(now);
    if (state.view === 'dial') {
      updateDialHeader();
      if (!state.current && queue.next(now, settings) && !hasModal()) {
        selectNext(now);
        displayCurrent();
      }
      if (changedDay) updateTodayLog();
    }
    if (state.view === 'board' && changedDay) updateDialHeader();
    const meetingChanged = state.view === 'pipeline' && [...state.openMeetings.values()].some(item =>
      (Date.parse(item.meetingAt) < previousClock) !== (Date.parse(item.meetingAt) < +now));
    if (!hasModal() && ((state.view === 'board' && changedDay && !isField(document.activeElement)) ||
        (state.view === 'calls' && (previousDue !== state.due.length || changedDay)) ||
        (state.view === 'pipeline' && (changedDay || meetingChanged || previousMeetings !== state.todayMeetings.length)))) render();
    if (changedDay) renderNotices();
    manageWake();
  }
  async function manageWake() {
    const wanted = settings.keepAwake && state.view === 'dial' && document.visibilityState === 'visible';
    if (!wanted && wakeLock) {
      const old = wakeLock;
      wakeLock = null;
      await old.release().catch(() => {});
    }
    if (wanted && !wakeLock && !wakePending && navigator.wakeLock) {
      wakePending = true;
      try {
        const lock = await navigator.wakeLock.request('screen');
        wakeLock = lock;
        on(lock, 'release', () => { if (wakeLock === lock) wakeLock = null; });
        if (state.view !== 'dial' || !settings.keepAwake) await lock.release();
      } catch (_) { /* Unsupported or denied by the device. */ }
      finally { wakePending = false; }
    }
  }
  function markCurrent(item) {
    if (!item || item.deleted || state.busy) return;
    state.current = item.id;
    if ($('drawer').open) closeModal('drawer');
    navigate('dial');
  }

  // Dial
  function progress(value, target, markers = [], tone = '') {
    const width = Math.min(100, 100 * value / target);
    return h('div', { class: 'progress ' + tone, role: 'progressbar', 'aria-label': 'Progress toward target',
      'aria-valuenow': Math.min(value, target), 'aria-valuemin': 0, 'aria-valuemax': target },
    h('span', { class: 'progress-fill', style: 'width:' + width + '%' }),
    markers.map(mark => h('i', { class: 'progress-mark', style: 'left:' + Math.min(100, 100 * mark / target) + '%', title: 'Goal ' + n(mark) })));
  }
  function dialStrip(link = false) {
    const el = h(link ? 'button' : 'section', { id: 'dial-strip', class: 'dial-strip panel' + (link ? ' clickable' : ''),
      type: link ? 'button' : null, onclick: link ? () => navigate('board') : null,
      'aria-label': link ? 'Open Board' : 'Today’s dial progress' });
    populateStrip(el, link);
    return el;
  }
  function populateStrip(el, session) {
    const { dials, owners, meetings } = todayStats();
    const floor = settings.floor, target = settings.target;
    const hit = dials >= target ? 'Target hit' : dials >= floor ? 'Floor hit. ' + n(target - dials) + ' to target' : 'Floor in ' + n(floor - dials);
    const tone = dials >= target ? 'green' : dials >= floor ? 'amber' : 'blue';
    const streak = L.streak(state.dayStats, state.data.daysOff.values(), new Date(), settings);
    const runtime = state.sessionStart == null ? 0 : Math.max(0, performance.now() - state.sessionStart);
    const rate = runtime >= 60000 ? (state.sessionDials || 0) / (runtime / L.HOUR) : null;
    const projected = session && dials >= 10 && dials < target && rate > 0 ? new Date(Date.now() + L.HOUR * (target - dials) / rate) : null;
    const stat = (label, value) => h('div', { class: 'strip-stat' }, h('strong', {}, value), h('span', {}, label));
    el.replaceChildren(h('div', { class: 'strip-goal' },
      h('div', { class: 'goal-line' }, h('span', { class: 'counter-label' }, session ? 'Dial' : 'Today'), h('strong', {}, n(dials)),
        h('span', { class: 'counter-total' }, '/ ' + n(target)), h('span', { class: 'floor-label ' + tone }, hit)),
      progress(dials, target, [floor], tone)),
    h('div', { class: 'strip-stats' }, stat('Owners', n(owners)), stat('Meetings', n(meetings)),
      stat('Streak', words(streak.current, 'day')), session && stat('Dials/h', rate == null ? '–' : n(Math.round(rate)))),
    ...(projected ? [h('span', { class: 'projection' }, 'At this pace: ' + n(target) + ' dials at ' + time(projected))] : []));
  }
  function dialView() {
    return [
      dialStrip(true), h('div', { id: 'dial-alerts', class: 'dial-alerts' }, dialAlerts()),
      h('div', { class: 'dial-layout' },
        h('div', { class: 'dial-main' },
          h('div', { id: 'current-lead' }, leadCard(state.data.leads.get(state.current))),
          h('div', { id: 'dial-actions', class: 'outcomes', hidden: !state.current, 'aria-label': 'Log an outcome' },
            Object.entries(L.OUTCOMES).map(([outcome, label], i) => h('button', {
              class: 'outcome ' + outcome, type: 'button', onclick: () => handleOutcome(outcome)
            }, icon(outcome, 21), h('span', {}, label), key(i + 1)))),
          h('details', { id: 'today-log', class: 'panel today-log', open: state.logOpen,
            ontoggle: event => { state.logOpen = event.currentTarget.open; if (state.logOpen) updateTodayLog(); } },
          h('summary', {}, h('span', {}, 'Today’s log'), h('span', { id: 'today-log-count', class: 'muted' }, words(todayStats().dials, 'dial'))),
          h('div', { id: 'today-log-rows' }, state.logOpen ? todayLogRows() : []))),
        h('aside', { id: 'dial-script-host', class: 'dial-script-host' }, scriptPane()))
    ];
  }
  function dialAlerts() {
    const cards = [];
    if (state.due.length) cards.push(btn(words(state.due.length, 'callback') + ' due now', () => navigate('calls'), { icon: 'calls', kind: 'alert-button violet' }));
    if (state.todayMeetings.length) {
      const [first] = state.todayMeetings;
      cards.push(btn((state.todayMeetings.length === 1 ? '1 meeting today' : words(state.todayMeetings.length, 'meeting') + ' today · Next') +
        ' at ' + time(first.meetingAt) + ' · ' + first.company, () => navigate('pipeline'), { icon: 'meeting_booked', kind: 'alert-button green' }));
    }
    return cards;
  }
  function updateDialHeader() {
    const strip = $('dial-strip');
    if (strip) populateStrip(strip, state.view === 'dial');
    const alerts = $('dial-alerts');
    if (alerts) alerts.replaceChildren(...dialAlerts());
  }
  function queueEmpty() {
    const now = Date.now();
    let retries = 0, earliest = Infinity, later = 0, total = 0;
    for (const item of state.data.leads.values()) {
      if (item.deleted) continue;
      total++;
      if (['no_answer', 'gatekeeper', 'owner_spoke', 'new'].includes(item.status) && L.readyAt(item) > now) {
        retries++;
        earliest = Math.min(earliest, L.readyAt(item));
      }
      if (item.status === 'callback' && Date.parse(item.callbackAt) > now && L.day(new Date(item.callbackAt)) === state.today) later++;
    }
    return panel('empty-card', h('span', { class: 'empty-icon' }, icon('dial', 24)),
      h('h1', {}, total ? 'Queue empty' : 'No leads yet'),
      total ? subtle(words(retries, 'retry', 'retries') + ' waiting' + (retries ? ' · Next ' + when(earliest) : '') +
        ' · ' + n(later) + ' callbacks later today · 0 fresh') : subtle('Import your scraper CSV.'),
      h('div', { class: 'actions' }, btn('Import leads', () => navigate('import'), { kind: 'primary', icon: 'import' }),
        btn('Open Leads', () => navigate('leads')), btn('Add lead', addLead)),
      !total && firstRun());
  }
  function leadCard(item) {
    if (!item || item.deleted) return queueEmpty();
    const website = websiteURL(item.website);
    const owner = input('owner', 'text', item.owner, { id: 'dial-owner', autocomplete: 'off', placeholder: 'Add owner name' });
    const note = area('note', item.note, { id: 'dial-note', rows: 2, placeholder: 'Add a note' });
    for (const el of [owner, note]) {
      on(el, 'blur', () => saveLeadInput(item.id, el.name, el.value));
      on(el, 'keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); el.blur(); }
      });
    }
    const context = (item.note || item.callbackAt) && h('div', { class: 'lead-context' }, icon('scripts', 16),
      h('div', {}, item.callbackAt && h('div', {}, 'Callback · ' + when(item.callbackAt)),
        item.note && h('div', {}, h('strong', {}, 'Last note: '), item.note)));
    const href = item.phoneNorm ? 'tel:+91' + item.phoneNorm : null;
    return panel('lead-card', h('div', { class: 'lead-card-top' },
      h('div', { class: 'lead-identity' }, h('div', { class: 'label' }, 'Current lead'),
        h('h1', { class: 'truncate', title: item.company || 'Unnamed company' }, item.company || 'Unnamed company'),
        h('div', { class: 'chips' }, item.city && chip(item.city), item.category && chip(item.category),
          item.sample && chip('Sample', 'amber'), (item.rating !== '' || item.reviews !== '') &&
          chip((item.rating !== '' ? item.rating + ' rating' : '') + (item.reviews !== '' ? (item.rating !== '' ? ' · ' : '') + item.reviews + ' reviews' : '')))),
      iconButton('leads', 'Open lead details', () => leadDrawer(state.data.leads.get(item.id)))),
    h('div', { class: 'attempt-line' }, chip('Attempt ' + n(item.attempts + 1), 'blue'),
      item.lastOutcome && h('span', {}, 'Last: ' + outText(item.lastOutcome) + ' · ' + relative(item.lastAttemptAt)),
      website && h('a', { href: website, rel: 'noopener noreferrer', target: '_blank' }, 'Website')),
    h('div', { class: 'phone-zone' },
      item.phone ? h('button', { type: 'button', class: 'phone-number', onclick: () => copy(item.phone), title: 'Copy ' + item.phone }, item.phone)
        : h('span', { class: 'phone-number muted' }, 'No phone number'),
      h('div', { class: 'phone-actions' },
        btn('Copy', () => copy(item.phone), { kind: 'copy-primary', icon: 'copy', key: 'C', disabled: !item.phone }),
        href ? h('a', { class: 'button call-primary', id: 'tel-link', href, 'aria-label': 'Call ' + item.phone },
          icon('dial'), 'Call', key('D')) : btn('Call', null, { icon: 'dial', disabled: true }),
        btn('Skip', skipCurrent, { kind: 'plain', key: 'S' }),
        btn('Script', toggleScript, { icon: 'scripts', key: 'P', kind: 'mobile-script-toggle' }))),
    item.phone2 && h('div', { class: 'secondary-phone' },
      h('span', { class: 'muted' }, 'Alternate'), btn(item.phone2, () => copy(item.phone2), { kind: 'text-button' }),
      L.normalizePhone(item.phone2) && h('a', { href: 'tel:+91' + L.normalizePhone(item.phone2) }, 'Call alternate')),
    h('div', { class: 'dial-fields' }, field('Owner', owner, !touch() && 'O to focus'), field('Note', note, !touch() && 'N to focus')),
    context);
  }
  function saveLeadInput(id, fieldName, value) {
    const item = state.data.leads.get(id);
    const trimmed = value.trim();
    if (!item || item.deleted || item[fieldName] === trimmed) return;
    commit({ leads: [{ ...item, [fieldName]: trimmed, updatedAt: new Date().toISOString() }] });
    if (id === state.current && fieldName === 'owner') refreshScriptResults();
  }
  function flushDialFields() {
    const owner = $('dial-owner'), note = $('dial-note');
    if (owner) saveLeadInput(state.current, 'owner', owner.value);
    if (note) saveLeadInput(state.current, 'note', note.value);
  }
  function displayCurrent() {
    const container = $('current-lead');
    if (!container) return;
    container.replaceChildren(leadCard(state.data.leads.get(state.current)));
    $('dial-actions').hidden = !state.current;
    refreshScriptResults();
    updateDialHeader();
    updateTodayLog();
  }
  function skipCurrent() {
    if (!state.current || state.busy) return;
    flushDialFields();
    const item = state.data.leads.get(state.current);
    commit({ leads: [L.skip(item)] });
    selectNext();
    displayCurrent();
  }
  function handleOutcome(outcome) {
    if (!state.current || state.busy || hasModal() || performance.now() - state.lastOutcome < 350) return;
    flushDialFields();
    const item = state.data.leads.get(state.current);
    if (!item || item.deleted) return;
    if (outcome === 'callback') callbackModal(item, data => logOutcome(item.id, outcome, data));
    else if (outcome === 'meeting_booked') meetingModal(item);
    else logOutcome(item.id, outcome);
  }
  function logOutcome(id, outcome, data) {
    const item = state.data.leads.get(id);
    if (!item || item.deleted || state.busy || performance.now() - state.lastOutcome < 350) return false;
    const now = new Date();
    state.today = L.day(now);
    const result = L.applyOutcome(item, outcome, data, now, settings);
    state.lastOutcome = performance.now();
    const changes = { leads: [result.lead], logs: [result.log] };
    if (result.meeting) changes.meetings = [result.meeting];
    const dials = todayStats().dials + 1;
    const previous = Array.isArray(settings.milestones) ? settings.milestones : [];
    const marks = [];
    if (dials === settings.floor && !previous.includes(state.today + ':floor')) marks.push('floor');
    if (dials === settings.target && !previous.includes(state.today + ':target')) marks.push('target');
    if (marks.length) changes.settings = [settingPatch({ milestones: [...previous, ...marks.map(mark => state.today + ':' + mark)] })];
    commit(changes);
    state.sessionLogs.push(result.log.id);
    if (state.sessionLogs.length > 20) state.sessionLogs.shift();
    state.sessionDials = (state.sessionDials || 0) + 1;
    if (state.current === id) selectNext(now);
    refreshDue(now);
    if (state.view === 'dial') displayCurrent();
    else if (!state.booting) render();
    const actions = [['Undo', undoLast, 'U']];
    if (outcome === 'dead') actions.push(['Add reason', () => deadReasonModal(id, result.log.id)]);
    if (result.meeting) actions.push(['Copy WhatsApp confirmation', () => {
      const script = state.data.scripts.get('default-21') || SEEDS.find(row => row.id === 'default-21');
      return copy(L.template(script.body, scriptValues(result.lead, result.meeting)));
    }]);
    toast('Logged: ' + outText(outcome) + ' · Dial ' + n(dials) + '/' + n(settings.target), actions, { outcome: true });
    if (marks.includes('floor')) toast('Floor hit. ' + n(settings.floor) + ' done, ' + n(settings.target - settings.floor) + ' to target.');
    if (marks.includes('target')) toast(n(settings.target) + ' dials. Log it, then stop or keep going.');
    try { if (touch() && typeof navigator.vibrate === 'function' && navigator.userActivation?.hasBeenActive !== false) navigator.vibrate(10); } catch (_) { /* Optional feedback. */ }
    return true;
  }
  function deadReasonModal(id, logId) {
    const item = state.data.leads.get(id);
    if (!item || item.status !== 'dead' || (logId && state.data.logs.get(logId)?.undone)) return;
    openModal('Dead reason', h('div', { class: 'form chips' }, L.REASONS.map(reason => btn(reason, () => {
      const current = state.data.leads.get(id);
      if (current?.status === 'dead') commit({ leads: [{ ...current, deadReason: reason, updatedAt: new Date().toISOString() }] });
      closeModal();
    }))));
  }
  function undoLast() {
    if (state.busy) return;
    let log;
    while (state.sessionLogs.length && !log) {
      const candidate = state.data.logs.get(state.sessionLogs.pop());
      if (candidate && L.live(candidate)) log = candidate;
    }
    if (!log) { toast('No session logs to undo.'); return; }
    if (state.view === 'dial') flushDialFields();
    const meeting = state.data.meetings.get(log.meetingId);
    const result = L.undoOutcome(log, meeting);
    const changes = { leads: [result.lead], logs: [result.log] };
    if (result.meeting) {
      changes.meetings = [result.meeting];
      const clients = values(state, 'clients').filter(row => row.meetingId === result.meeting.id);
      if (clients.length) changes.clients = clients.map(row => ({ ...row, deleted: true, updatedAt: result.log.updatedAt }));
    }
    commit(changes);
    state.sessionDials = Math.max(0, (state.sessionDials || 0) - 1);
    state.current = result.lead.id;
    refreshDue();
    if (state.view === 'dial') displayCurrent();
    else navigate('dial');
    toast('Undone: ' + outText(log.outcome) + ' on ' + (result.lead.company || 'unnamed company'), [], { outcome: true });
  }
  function callbackModal(item, handler, prefill = false) {
    const presets = L.callbackPresets(new Date(), settings);
    const date = input('callbackAt', 'datetime-local', prefill && item.callbackAt && Date.parse(item.callbackAt) > Date.now()
      ? L.localInput(new Date(item.callbackAt)) : L.localInput(presets[1]), { required: true });
    const labels = ['Today 4:00 PM', 'Tomorrow 11:00 AM', 'In 2 working days 11:00 AM', 'Next week 11:00 AM', 'In 6 weeks 11:00 AM · Booked out'];
    const buttons = [];
    const setPreset = index => {
      if (!presets[index]) return false;
      date.value = L.localInput(presets[index]);
      for (const [i, button] of buttons.entries()) if (button) button.setAttribute('aria-pressed', String(i === index));
      return true;
    };
    for (let i = 0; i < presets.length; i++) buttons.push(presets[i] ?
      btn(labels[i], () => setPreset(i), { key: String(i + 1), kind: 'preset', pressed: String(i === 1 && date.value === L.localInput(presets[i])) }) : null);
    on(date, 'input', () => { for (const button of buttons) if (button) button.setAttribute('aria-pressed', 'false'); });
    const { form } = makeForm([h('div', { class: 'preset-list' }, buttons),
      field('Callback date and time', date),
      check('Spoke to the owner', 'callbackOwner', item.callbackOwner),
      field('Note', area('note', prefill ? item.note : ''))], (el, error) => {
      const chosen = new Date(date.value);
      if (!date.value || !Number.isFinite(+chosen) || chosen <= new Date()) { error('Choose a callback time in the future.'); return; }
      const changed = handler({ callbackAt: chosen.toISOString(), callbackOwner: el.elements.callbackOwner.checked, note: formValue(el, 'note') });
      if (changed !== false) closeModal();
    }, 'Save callback');
    openModal(prefill ? 'Reschedule callback' : 'Schedule callback', form, { className: 'callback-modal' });
    $('dialog').callbackPreset = setPreset;
    const selected = buttons.find(button => button?.getAttribute('aria-pressed') === 'true');
    if (selected) selected.focus();
  }
  function meetingModal(item) {
    const tomorrow = L.at(L.addDays(new Date(), 1), 0);
    const date = input('meetingAt', 'datetime-local', L.localInput(L.nextWorkdayAt(tomorrow, 10, 0, settings)), { required: true });
    const { form, submit } = makeForm([
      field('Owner name', input('owner', 'text', item.owner)),
      field('Meeting date and time', date),
      field('Their WhatsApp number', input('contactPhone', 'tel', item.phone)),
      field('Email', input('email', 'email')),
      field('Note', area('note'))
    ], (el, error) => {
      if (!(+new Date(date.value) > Date.now())) { error('Choose a meeting time in the future.'); return; }
      const data = Object.fromEntries(new FormData(form));
      if (logOutcome(item.id, 'meeting_booked', data)) closeModal();
    }, 'Save meeting');
    on(date, 'input', () => { submit.disabled = !(+new Date(date.value) > Date.now()); });
    openModal('Book meeting', form);
  }
  function todayLogRows() {
    const ids = state.logsByDay.get(state.today) || [];
    const rows = [];
    const limit = state.logLimit || 40;
    for (let i = ids.length - 1; i >= 0 && rows.length < limit; i--) {
      const log = state.data.logs.get(ids[i]);
      if (!L.live(log)) continue;
      const item = state.data.leads.get(log.leadId);
      const canUndo = rows.length === 0 && state.sessionLogs[state.sessionLogs.length - 1] === log.id;
      rows.push(h('div', { class: 'log-row' }, h('button', { class: 'log-link', type: 'button', onclick: () => leadDrawer(item || log.prevLead) },
        h('span', { class: 'muted' }, time(log.ts)),
        h('strong', { class: 'truncate', title: log.prevLead.company }, log.prevLead.company || 'Unnamed company'),
        chip(outText(log.outcome), log.outcome)), canUndo && iconButton('undo', 'Undo latest outcome', undoLast)));
    }
    if (!rows.length) return [subtle('No outcomes logged today.')];
    if (todayStats().dials > rows.length) rows.push(btn('Show more', () => { state.logLimit = limit + 40; updateTodayLog(); }));
    return rows;
  }
  function updateTodayLog() {
    text('today-log-count', words(todayStats().dials, 'dial'));
    const rows = $('today-log-rows');
    if (rows && state.logOpen) rows.replaceChildren(...todayLogRows());
  }

  // Import and leads
  function nextBatchOrder() {
    state.batchOrder = Math.max(Date.now(), state.batchOrder + 1);
    return state.batchOrder;
  }
  function firstRun() {
    return h('div', { class: 'first-run' },
      h('ol', {}, h('li', {}, 'Import your scraper CSV'), h('li', {}, btn('Check Settings', () => navigate('settings'), { kind: 'text-button' })),
        h('li', {}, 'Press D and dial')),
      btn('Load 10 sample leads', loadSamples, { icon: 'plus' }));
  }
  async function loadSamples() {
    if (state.busy) return;
    if (values(state, 'leads').some(row => row.sample)) { toast('Sample leads are already loaded.'); return; }
    const now = new Date();
    const batchOrder = nextBatchOrder();
    const samples = [
      ['Aruna Rooftop Solar', 'Madurai'], ['Kaveri Solar Works', 'Tiruchirappalli'], ['Veyil Energy', 'Chennai'],
      ['Lotus Terrace Solar', 'Coimbatore'], ['Sunline Roofs', 'Salem'], ['Bay Rooftop Energy', 'Puducherry'],
      ['Canopy Solar Studio', 'Bengaluru'], ['First Light Solar', 'Thanjavur'], ['Meridian Roof Power', 'Erode'],
      ['Clear Sky Solar', 'Tirunelveli']
    ].map(([company, city], index) => L.lead({
      company, city, ...L.phones('90000000' + String(index + 1).padStart(2, '0')), sample: true,
      batch: 'Sample leads', batchOrder, rowOrder: index, category: 'Solar installer', website: '',
      owner: index === 0 ? 'Arun' : '', note: index === 0 ? 'Sample data for practice.' : ''
    }, now));
    state.busy = true;
    try {
      if (!await storage.commit({ leads: samples }, { strict: true })) return;
      installChanges({ leads: samples });
      toast('Loaded 10 sample leads.');
    } finally { state.busy = false; }
    if (state.view === 'dial') { selectNext(); displayCurrent(); }
    else {
      state.import = null;
      render();
    }
  }
  function parseImport(source, name) {
    try {
      const parsed = L.parseCSV(source);
      if (!parsed.headers.length || !parsed.rows.length) throw new Error('The CSV needs a header and at least one data row.');
      const now = new Date();
      state.import = {
        parsed, name, mapping: L.mapHeaders(parsed.headers),
        options: { batch: 'Import ' + L.localInput(now).replace('T', ' '), city: '', skipInvalid: true, skipDuplicates: true, filter: '' },
        error: ''
      };
    } catch (error) { state.import = { error: error.message }; }
    render();
  }
  async function importFile(file) {
    if (!file || state.busy) return;
    try { parseImport(await file.text(), file.name); }
    catch (_) { state.import = { error: 'Could not read this CSV file.' }; render(); }
  }
  function importView() {
    const entry = state.import;
    const heading = title('Import leads', btn('Back to Leads', () => navigate('leads'), { icon: 'left' }));
    if (entry?.complete) return [heading, panel('empty-card',
      h('div', { class: 'empty-icon green' }, icon('check', 24)), h('h2', {}, words(entry.complete, 'lead') + ' imported'),
      btn('Start dialing', startDial, { kind: 'primary', icon: 'dial', key: 'D' }),
      btn('Import another CSV', () => { state.import = null; render(); }))];
    if (entry?.parsed) return [heading, importMapping(entry)];
    const picker = input('csv', 'file', '', { accept: '.csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain', id: 'csv-file',
      class: 'visually-hidden', 'aria-label': 'Choose CSV file', onchange: event => importFile(event.target.files[0]) });
    const zone = panel('drop-zone', h('div', { class: 'empty-icon' }, icon('import', 25)), h('h2', {}, 'Drop a CSV here'),
      btn('Choose CSV file', () => picker.click(), { kind: 'primary' }), picker);
    on(zone, 'dragover', event => { event.preventDefault(); zone.classList.add('drag-over'); });
    on(zone, 'dragleave', event => { if (!zone.contains(event.relatedTarget)) zone.classList.remove('drag-over'); });
    on(zone, 'drop', event => { event.preventDefault(); zone.classList.remove('drag-over'); return importFile(event.dataTransfer.files[0]); });
    const pasted = area('csvText', '', { rows: 5, placeholder: 'Company,Phone,City' });
    return [heading, entry?.error && h('p', { class: 'notice error', role: 'status' }, entry.error), zone,
      panel('flow-card', field('Paste CSV text', pasted), btn('Parse CSV', () => parseImport(pasted.value, 'Pasted CSV'), { icon: 'import' })),
      !state.data.leads.size && panel('flow-card', firstRun())];
  }
  const IMPORT_LABELS = { company: 'Company', phone: 'Phone', city: 'City', address: 'Address', website: 'Website',
    category: 'Category', rating: 'Rating', reviews: 'Reviews' };
  function importMapping(entry) {
    const { parsed, mapping, options: config } = entry;
    const columns = Object.keys(IMPORT_LABELS);
    const heading = h('div', { class: 'section-heading' },
      h('div', {}, h('h2', { class: 'truncate', title: entry.name }, entry.name),
        subtle(words(parsed.rows.length, 'row') + ' · ' + ({ ',': 'Comma', ';': 'Semicolon', '\t': 'Tab' })[parsed.delimiter] + ' delimiter')),
      btn('Choose another CSV', () => { state.import = null; render(); }));
    const preview = h('div', { class: 'table-scroll' });
    const summary = h('p', { class: 'import-summary', 'aria-live': 'polite' });
    const skipped = btn('Download skipped rows', () => download('dial-console-skipped.csv',
      L.csv([[...parsed.headers, 'Skip reason'], ...entry.plan.skipped]), 'text/csv;charset=utf-8'), { icon: 'download' });
    const submit = btn('Import leads', () => bulkImport(entry, host, bar, status), { kind: 'primary', icon: 'import' });
    const bar = h('progress', { class: 'bulk-progress', hidden: true, value: 0, max: 1, 'aria-label': 'Lead import progress' });
    const status = h('p', { class: 'muted', role: 'status', hidden: true });
    let timer;
    const refresh = () => {
      clearTimeout(timer);
      const rows = parsed.rows.slice(0, 5).map(row => L.mappedRow(row, mapping, config.city));
      preview.replaceChildren(table(columns.map(keyName => IMPORT_LABELS[keyName]), rows.map(row => columns.map(keyName => row[keyName] || '–'))));
      entry.plan = L.planImport(parsed, mapping, state.data.leads.values(), config);
      const plan = entry.plan;
      summary.textContent = n(parsed.rows.length) + ' rows → ' + n(plan.leads.length) + ' new leads · ' +
        n(plan.duplicates) + ' duplicates skipped · ' + n(plan.invalid) + ' without valid phone skipped · ' + n(plan.filtered) + ' filtered out';
      submit.disabled = !plan.leads.length;
      skipped.disabled = !plan.skipped.length;
    };
    const debounce = () => { clearTimeout(timer); submit.disabled = true; timer = setTimeout(refresh, 150); };
    const mapFields = columns.map(keyName => field(IMPORT_LABELS[keyName],
      options(keyName, [[-1, 'Unmapped'], ...parsed.headers.map((header, index) => [index, header || 'Column ' + (index + 1)])],
        mapping[keyName], { onchange: event => { mapping[keyName] = Number(event.target.value); refresh(); } })));
    const editable = (name, placeholder) => input(name, 'text', config[name], {
      placeholder, oninput: event => { config[name] = event.target.value; debounce(); }
    });
    const host = panel('flow-card mapping',
      heading, h('h3', {}, 'Map columns'), h('div', { class: 'field-grid map-fields' }, mapFields),
      h('div', { class: 'field-grid' }, field('Batch name', editable('batch')), field('Default city', editable('city')),
        field('Only keep rows where company or category contains', editable('filter', 'solar'))),
      h('div', { class: 'actions' },
        check('Skip rows with no valid phone', 'skipInvalid', config.skipInvalid, { onchange: event => { config.skipInvalid = event.target.checked; refresh(); } }),
        check('Skip duplicates already in the app', 'skipDuplicates', config.skipDuplicates, { onchange: event => { config.skipDuplicates = event.target.checked; refresh(); } })),
      h('h3', {}, 'Preview · first 5 rows'), preview, summary, bar, status, h('div', { class: 'actions' }, submit, skipped));
    refresh();
    return host;
  }
  async function bulkImport(entry, host, bar, status) {
    if (state.busy || !entry.plan.leads.length) return;
    state.busy = true;
    const controls = [...host.querySelectorAll('input,select,button')].filter(element => !element.disabled);
    controls.forEach(element => { element.disabled = true; });
    const rows = entry.pending || entry.plan.leads;
    if (!entry.pending) {
      const batchOrder = nextBatchOrder();
      for (const item of rows) item.batchOrder = batchOrder;
    }
    const total = entry.total || rows.length;
    entry.total = total;
    bar.hidden = false;
    status.hidden = false;
    bar.max = total;
    let done = total - rows.length;
    bar.value = done;
    try {
      for (let i = 0; i < rows.length; i += 500) {
        const leads = rows.slice(i, i + 500);
        if (!await storage.commit({ leads }, { strict: true })) {
          entry.pending = rows.slice(i);
          status.textContent = n(done) + ' of ' + n(total) + ' saved. Free storage and choose Import leads to continue.';
          return;
        }
        installChanges({ leads });
        done += leads.length;
        bar.value = done;
        status.textContent = n(done) + ' of ' + n(total) + ' saved';
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      state.import = { complete: total };
      state.current = null;
      render();
    } finally {
      state.busy = false;
      controls.forEach(element => { element.disabled = false; });
    }
  }
  function table(headers, rows, className = '') {
    return h('table', { class: className },
      h('thead', {}, h('tr', {}, headers.map(label => h('th', { scope: 'col' }, label)))),
      h('tbody', {}, rows.map(row => Array.isArray(row) ? h('tr', {}, row.map(cell => h('td', {}, cell))) : row)));
  }
  function leadsView() {
    const filters = state.filters;
    const live = values(state, 'leads');
    const choices = keyName => [...new Set(live.map(item => item[keyName]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const change = (keyName, value) => { filters[keyName] = value; filters.page = 0; refreshLeadRows(); };
    let timer;
    const search = input('q', 'search', filters.search, { placeholder: 'Company, city, phone or note', id: 'lead-search',
      oninput: event => { const value = event.target.value; clearTimeout(timer); timer = setTimeout(() => change('search', value), 150); } });
    const selectFilter = (label, keyName, entries) => field(label, options(keyName,
      [['', 'All ' + label.toLowerCase()], ...entries], filters[keyName], { onchange: event => change(keyName, event.target.value) }));
    return [title('Leads', [
      btn('Add lead', addLead, { icon: 'plus' }),
      btn('Import CSV', () => navigate('import'), { kind: 'primary', icon: 'import' }),
      btn('Export leads CSV', exportLeadsCSV, { icon: 'download' }),
      btn('Export logs CSV', exportLogsCSV, { icon: 'download' })]),
    panel('lead-table-panel',
      h('div', { class: 'lead-filters' }, field('Search', search),
        selectFilter('Status', 'status', L.STATUSES.map(value => [value, statusLabel(value)])),
        selectFilter('City', 'city', choices('city')), selectFilter('Batch', 'batch', choices('batch')),
        check('Has note', 'hasNote', filters.note, { onchange: event => change('note', event.target.checked) })),
      h('div', { id: 'lead-rows' }, leadRows()))];
  }
  function refreshLeadRows() {
    const el = $('lead-rows');
    if (el) el.replaceChildren(...leadRows());
  }
  function leadRows() {
    const { search, status, city, batch, note } = state.filters;
    const query = search.trim().toLowerCase();
    const digits = query.replace(/\D/g, '');
    const phoneQuery = digits.length > 2 && /^[\d+().\s-]+$/.test(query);
    const filtered = values(state, 'leads').filter(item => (!status || status === item.status) && (!city || city === item.city) &&
      (!batch || batch === item.batch) && (!note || item.note) && (!query ||
        [item.company, item.city, item.phone, item.phone2, item.note].some(value => value.toLowerCase().includes(query)) ||
        (phoneQuery && (item.phoneNorm.includes(digits) || item.phone.replace(/\D/g, '').includes(digits)))));
    const pages = Math.max(1, Math.ceil(filtered.length / 100));
    const page = state.filters.page = Math.min(pages - 1, state.filters.page);
    const start = page * 100;
    if (!filtered.length) return [h('div', { class: 'flat-empty' }, subtle('No leads match.'))];
    const rows = filtered.slice(start, start + 100).map(item => h('tr', { onclick: event => {
      if (!event.target.closest('button,a')) leadDrawer(item);
    } }, h('td', {}, h('button', { class: 'table-link truncate', type: 'button', title: item.company, onclick: () => leadDrawer(item) },
      item.company || 'Unnamed company')),
    h('td', {}, item.city || '–'), h('td', {}, item.phone || '–'), h('td', {}, chip(statusLabel(item.status), item.status)),
    h('td', {}, item.batch || '–'), h('td', {}, n(item.attempts))));
    const pageBy = amount => { state.filters.page += amount; refreshLeadRows(); };
    return [h('div', { class: 'table-scroll' }, table(['Company', 'City', 'Phone', 'Status', 'Batch', 'Attempts'], rows, 'lead-table')),
      h('div', { class: 'pagination' }, subtle(n(start + 1) + '–' + n(Math.min(start + 100, filtered.length)) + ' of ' + n(filtered.length)),
        btn('Previous', () => pageBy(-1), { icon: 'left', disabled: page <= 0 }),
        btn('Next', () => pageBy(1), { icon: 'right', disabled: page + 1 >= pages }))];
  }
  function addLead() {
    const { form } = makeForm([
      field('Company', input('company', 'text', '', { required: true })), field('Phone', input('phone', 'tel', '', { required: true })),
      field('City', input('city')), field('Owner', input('owner')), field('Note', area('note'))
    ], (el, error) => {
      const data = Object.fromEntries([...new FormData(el)].map(([name, value]) => [name, value.trim()]));
      const numbers = L.phones(data.phone);
      if (!data.company) { error('Enter a company name.'); return; }
      if (!numbers.phoneNorm) { error('Enter a valid Indian phone number.'); return; }
      commit({ leads: [L.lead({ ...data, ...numbers, batch: 'Manual', batchOrder: nextBatchOrder() })] });
      closeModal();
      if (state.view === 'dial' && !state.current) { selectNext(); displayCurrent(); } else render();
      toast('Lead added.');
    }, 'Add lead');
    openModal('Add lead', form);
  }
  function leadDrawer(item) {
    if (!item) return;
    const current = () => state.data.leads.get(item.id);
    const f = (name, label, type = 'text', attrs) => field(label, input(name, type, item[name] ?? '', attrs));
    const dt = (name, label) => field(label, input(name, 'datetime-local', item[name] ? L.localInput(new Date(item[name])) : ''));
    const fields = [
      h('div', { class: 'field-grid' }, f('company', 'Company'), f('owner', 'Owner'), f('phone', 'Phone', 'tel'), f('phone2', 'Alternate phone', 'tel'),
        f('city', 'City'), f('category', 'Category'), f('website', 'Website'), f('batch', 'Batch'), f('rating', 'Rating'), f('reviews', 'Reviews')),
      f('address', 'Address'), field('Note', area('note', item.note)),
      h('div', { class: 'field-grid' },
        field('Status', options('status', L.STATUSES.map(value => [value, statusLabel(value)]), item.status)),
        f('attempts', 'Attempts', 'number', { min: 0, step: 1, required: true }), f('deadReason', 'Dead reason'),
        field('Last outcome', options('lastOutcome', [['', 'None'], ...Object.entries(L.OUTCOMES)], item.lastOutcome)),
        dt('lastAttemptAt', 'Last attempt'), dt('nextEligibleAt', 'Next eligible'), dt('callbackAt', 'Callback time'), dt('skipUntil', 'Skip until')),
      h('div', { class: 'actions' }, check('Callback reached owner', 'callbackOwner', item.callbackOwner), check('Sample lead', 'sample', item.sample))
    ];
    const afterChange = () => {
      refreshDue();
      if (state.view === 'dial') {
        if (!state.current || state.data.leads.get(state.current)?.deleted) selectNext();
        displayCurrent();
      } else render();
    };
    const { form } = makeForm(fields, (el, error) => {
      const itemNow = current();
      if (!itemNow || itemNow.deleted) { error('This lead has been removed.'); return; }
      const data = Object.fromEntries([...new FormData(el)].map(([name, value]) => [name, value.trim()]));
      const numbers = L.phones(data.phone);
      if (data.phone && !numbers.phoneNorm && data.phone !== itemNow.phone) { error('Enter a valid Indian phone number.'); return; }
      if (data.phone2 && !L.normalizePhone(data.phone2)) { error('Enter a valid alternate number.'); return; }
      const selectedCallback = data.callbackAt;
      if (data.status === 'callback' && !selectedCallback) { error('Set a callback time for a callback lead.'); return; }
      for (const name of ['lastAttemptAt', 'nextEligibleAt', 'callbackAt', 'skipUntil']) {
        const initial = item[name] ? L.localInput(new Date(item[name])) : '';
        const value = data[name];
        data[name] = value ? (value === initial ? item[name] : new Date(value).toISOString()) : null;
      }
      if (data.status === 'callback') data.nextEligibleAt = data.callbackAt;
      else { data.callbackAt = null; if (data.status === 'new') data.nextEligibleAt = null; }
      const next = {
        ...itemNow, ...data, ...numbers, phone: numbers.phone || data.phone,
        phone2: L.displayPhone(L.normalizePhone(data.phone2)) || numbers.phone2,
        attempts: Number(data.attempts), lastOutcome: data.lastOutcome || null,
        callbackOwner: el.elements.callbackOwner.checked, sample: el.elements.sample.checked, updatedAt: new Date().toISOString()
      };
      commit({ leads: [next] });
      closeModal('drawer');
      afterChange();
      toast('Lead saved.');
    });
    const history = (state.logsByLead.get(item.id) || []).slice().reverse().map(id => {
      const log = state.data.logs.get(id);
      return h('li', { class: 'history-row' }, h('span', { class: 'muted' }, when(log.ts)), chip(outText(log.outcome), log.outcome),
        (log.undone || log.deleted) && chip(log.deleted ? 'Removed' : 'Undone'), log.note && h('span', {}, log.note));
    });
    const body = h('div', { class: 'drawer-body' },
      h('div', { class: 'actions' },
        btn('Make current lead', () => markCurrent(current()), { icon: 'dial', disabled: item.deleted }),
        item.status === 'dead' && !item.deleted && btn('Restore from Dead', () => {
          const row = current();
          commit({ leads: [{ ...row, status: 'new', deadReason: '', attempts: 0, nextEligibleAt: null, skipUntil: null, updatedAt: new Date().toISOString() }] });
          closeModal('drawer'); afterChange(); toast('Lead restored.');
        }),
        !item.deleted && btn('Delete lead', () => confirmAction('Delete lead', 'Remove this lead from the queue and Leads list? Its call history stays in the log.', 'Delete lead', () => {
          const row = current();
          commit({ leads: [{ ...row, deleted: true, updatedAt: new Date().toISOString() }] });
          closeModal('drawer'); afterChange();
        }), { kind: 'danger' })),
      item.deleted ? subtle('This lead has been removed.') : form,
      h('h3', {}, 'Call history'), history.length ? h('ul', { class: 'history' }, history) : subtle('No logged outcomes.'));
    const drawer = openModal(item.company || 'Lead details', body, { drawer: true });
    $('drawer-title').title = item.company;
    return drawer;
  }
  function exportLeadsCSV() {
    const columns = ['company', 'owner', 'city', 'phone', 'phoneNorm', 'phone2', 'address', 'website', 'category', 'rating',
      'reviews', 'batch', 'status', 'deadReason', 'attempts', 'lastOutcome', 'lastAttemptAt', 'nextEligibleAt', 'callbackAt', 'callbackOwner',
      'note', 'skipUntil', 'sample', 'id', 'createdAt', 'updatedAt'];
    download('dial-console-leads.csv', L.csv([columns, ...values(state, 'leads').map(row => columns.map(field => row[field]))]), 'text/csv;charset=utf-8');
  }
  function exportLogsCSV() {
    const columns = ['ts', 'day', 'hour', 'dow', 'company', 'outcome', 'spokeToOwner', 'callbackAt', 'note', 'undone', 'leadId', 'id'];
    const rows = values(state, 'logs').sort((a, b) => a.ts.localeCompare(b.ts)).map(log =>
      columns.map(field => field === 'company' ? log.prevLead.company : log[field]));
    download('dial-console-logs.csv', L.csv([columns, ...rows]), 'text/csv;charset=utf-8');
  }

  // Calls and pipeline
  function callsView() {
    const now = new Date();
    const callbacks = [...state.callbacks.values()].sort((a, b) => a.callbackAt.localeCompare(b.callbackAt));
    const overdue = [], today = [], upcoming = new Map();
    for (const item of callbacks) {
      const keyName = L.day(new Date(item.callbackAt));
      if (Date.parse(item.callbackAt) < +now) overdue.push(item);
      else if (keyName === state.today) today.push(item);
      else {
        if (!upcoming.has(keyName)) upcoming.set(keyName, []);
        upcoming.get(keyName).push(item);
      }
    }
    const group = (label, rows, late = false) => panel('call-group', h('h2', { class: late ? 'bad' : '' }, label, ' ', chip(n(rows.length))),
      rows.length ? rows.map(item => callbackRow(item, late, now)) : subtle('None scheduled.'));
    return [title('Calls', chip(words(state.due.length, 'callback') + ' due now', 'violet')),
      callbacks.length ? h('div', { class: 'stack' }, group('Overdue', overdue, true), group('Due today', today),
        panel('call-group', h('h2', {}, 'Upcoming ', chip(n(callbacks.length - overdue.length - today.length))),
          upcoming.size ? [...upcoming].map(([day, rows]) => h('section', { class: 'callback-date' },
            h('h3', {}, humanDay(day)), rows.map(item => callbackRow(item, false, now)))) : subtle('None scheduled.')))
        : panel('empty-card', h('div', { class: 'empty-icon' }, icon('calls', 23)), h('h2', {}, 'No callbacks scheduled.'))];
  }
  function callbackRow(item, late, now) {
    const hours = Math.max(0, (+now - Date.parse(item.callbackAt)) / L.HOUR);
    const overdue = hours < 1 ? words(Math.max(1, Math.floor(hours * 60)), 'minute') + ' late' : words(Math.floor(hours), 'hour') + ' late';
    return h('article', { class: 'call-row' },
      h('div', { class: 'row-title' }, h('h3', { class: 'truncate', title: item.company }, item.company || 'Unnamed company'),
        h('div', { class: 'muted' }, [item.city, item.owner].filter(Boolean).join(' · ')),
        item.note && h('p', { class: 'row-note' }, item.note)),
      h('div', { class: 'call-meta' }, h('strong', {}, when(item.callbackAt)), late && chip(overdue, 'bad'),
        item.phone && btn(item.phone, () => copy(item.phone), { kind: 'text-button', icon: 'copy' })),
      h('div', { class: 'actions' }, btn('Call now', () => markCurrent(item), { kind: 'primary', icon: 'dial' }),
        btn('Reschedule', () => callbackModal(item, data => reschedule(item, data), true)),
        btn('Dead', () => confirmAction('Mark callback dead', 'Log Dead and remove this callback from the queue?', 'Mark dead',
          () => logOutcome(item.id, 'dead')), { kind: 'danger' })));
  }
  function reschedule(item, data) {
    const current = state.data.leads.get(item.id);
    if (!current || current.deleted) return false;
    const ts = new Date().toISOString();
    commit({ leads: [{ ...current, ...data, status: 'callback', nextEligibleAt: data.callbackAt, skipUntil: null, updatedAt: ts }] });
    refreshDue();
    render();
    toast('Callback scheduled for ' + when(data.callbackAt) + '.');
    return true;
  }
  const PIPELINE_COLUMNS = [
    ['booked', 'Booked'], ['held', 'Held'], ['proposal', 'Proposal'], ['won', 'Won'], ['closed', 'Lost / No-show']
  ];
  function pipelineView() {
    const rows = values(state, 'meetings').sort((a, b) => a.meetingAt.localeCompare(b.meetingAt));
    const columns = PIPELINE_COLUMNS.map(([stage, label]) => {
      const items = rows.filter(row => stage === 'closed' ? ['lost', 'no_show'].includes(row.stage) : row.stage === stage);
      const filtered = state.pipelineFilter !== 'all' && state.pipelineFilter !== stage;
      return h('section', { class: 'kanban-column' + (filtered ? ' filtered' : '') },
        h('header', { class: 'kanban-heading' }, h('h2', {}, label), chip(n(items.length))),
        items.length ? items.map(pipelineCard) : subtle('No meetings.'));
    });
    return [title('Pipeline', chip(words(state.todayMeetings.length, 'meeting') + ' today', 'green')),
      h('div', { class: 'chips stage-filter', 'aria-label': 'Filter pipeline by stage' },
        [['all', 'All'], ...PIPELINE_COLUMNS].map(([value, label]) =>
          btn(label, () => { state.pipelineFilter = value; render(); }, { pressed: String(state.pipelineFilter === value) }))),
      h('div', { class: 'kanban' }, columns)];
  }
  function pipelineCard(item) {
    const now = new Date();
    const isToday = L.day(new Date(item.meetingAt)) === state.today;
    const past = item.stage === 'booked' && Date.parse(item.meetingAt) < +now;
    const select = options('stage', [['', 'Move stage'], ...L.STAGES.filter(stage => stage !== item.stage).map(stage => [stage, stageLabel(stage)])],
      '', { 'aria-label': 'Move ' + item.company + ' to stage', onchange: event => {
        const { value } = event.target;
        event.target.value = '';
        if (value) requestStage(item, value);
      } });
    return h('article', { class: 'pipeline-card' + (isToday ? ' meeting-today' : '') },
      h('div', { class: 'chips' }, isToday && chip('Today', 'green'), past && chip('Update status', 'amber'),
        ['lost', 'no_show'].includes(item.stage) && chip(stageLabel(item.stage), 'bad')),
      h('h3', { class: 'truncate', title: item.company }, item.company || 'Unnamed company'),
      item.owner && h('p', { class: 'muted' }, item.owner),
      h('p', { class: 'meeting-time' }, icon('meeting_booked', 15), when(item.meetingAt)),
      h('p', { class: 'muted' }, relative(item.meetingAt, now)),
      item.note && h('p', { class: 'row-note' }, item.note),
      item.lostReason && h('p', { class: 'row-note' }, item.lostReason),
      h('div', { class: 'pipeline-actions' }, select,
        item.stage === 'no_show' && btn('Reschedule', () => {
          const lead = state.data.leads.get(item.leadId);
          if (!lead || lead.deleted) { toast('The linked lead is unavailable.'); return; }
          callbackModal(lead, data => reschedule(lead, data), true);
        })));
  }
  function requestStage(item, stage) {
    if (stage === 'won') {
      const { form } = makeForm([
        field('Client name', input('name', 'text', item.company, { required: true })),
        field('Monthly fee (₹)', input('fee', 'number', settings.defaultMonthlyFee, { min: 0, step: .01, required: true })),
        field('Start date', input('startDate', 'date', state.today, { required: true }))
      ], (el, error) => {
        const name = formValue(el, 'name');
        if (!name) { error('Enter a client name.'); return; }
        moveStage(item.id, stage, { name, monthlyInr: Number(formValue(el, 'fee')), startDate: formValue(el, 'startDate') });
        closeModal();
      }, 'Mark won');
      openModal('Mark meeting won', form);
    } else if (stage === 'lost') {
      const { form } = makeForm([field('Lost reason (optional)', area('reason'))], el => {
        moveStage(item.id, stage, { lostReason: formValue(el, 'reason') });
        closeModal();
      }, 'Mark lost');
      openModal('Mark meeting lost', form);
    } else moveStage(item.id, stage);
  }
  function moveStage(id, stage, fields = {}) {
    const item = state.data.meetings.get(id);
    if (!item || item.deleted || item.stage === stage) return;
    const now = new Date(), ts = now.toISOString();
    const updated = { ...item, stage, stageHistory: [...item.stageHistory, { stage, ts }], updatedAt: ts,
      lostReason: stage === 'lost' ? fields.lostReason || '' : '' };
    const changes = { meetings: [updated] };
    let client, priorClient;
    if (stage === 'won') {
      priorClient = values(state, 'clients').find(row => row.meetingId === id);
      client = priorClient ? { ...priorClient, ...fields, status: 'active', updatedAt: ts } :
        L.record({ ...fields, status: 'active', leadId: item.leadId, meetingId: id, wonAt: ts, wonDay: L.day(now) }, now);
      changes.clients = [client];
    }
    commit(changes);
    refreshDue();
    render();
    toast('Moved to ' + stageLabel(stage) + '.', [['Undo', () => {
      const latest = state.data.meetings.get(id);
      if (latest !== updated) { toast('This meeting has changed since that move.'); return; }
      const undoTs = new Date().toISOString();
      const undo = { meetings: [{ ...item, stageHistory: [...latest.stageHistory, { stage: item.stage, ts: undoTs }], updatedAt: undoTs }] };
      if (client && state.data.clients.get(client.id) === client) undo.clients = [{ ...(priorClient || client), deleted: !priorClient, updatedAt: undoTs }];
      commit(undo);
      refreshDue();
      render();
      toast('Restored to ' + stageLabel(item.stage) + '.');
    }]]);
  }

  // Script library
  function scriptValues(lead, meeting) {
    return {
      company: lead?.company, owner: meeting?.owner || lead?.owner, city: lead?.city,
      phone: meeting?.contactPhone || lead?.phone, booking_link: settings.bookingLink,
      meeting_time: meeting?.meetingAt ? when(meeting.meetingAt) : undefined
    };
  }
  function sortedScripts() {
    return values(state, 'scripts').sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  }
  function scriptPane() {
    const opened = state.scriptOpen ?? !compact();
    const search = input('scripts', 'search', state.scriptQuery, { id: 'script-search', placeholder: 'Search scripts',
      'aria-label': 'Search scripts', oninput: event => { state.scriptQuery = event.target.value; refreshScriptResults(); } });
    const shell = panel('script-pane' + (!opened ? ' pane-closed' : ''), h('div', { class: 'script-handle', 'aria-hidden': 'true' }),
      h('div', { class: 'script-pane-heading' }, h('h2', {}, icon('scripts', 18), 'Call scripts'),
        h('div', { class: 'actions' }, phoneWidth() && iconButton('search', 'Search scripts', openScriptSearch),
          iconButton('dead', 'Close script pane', toggleScript))),
      h('div', { class: 'script-rule' }, h('strong', {}, 'Rules: '), 'One ask only. Meeting is the only goal. Never discuss price on a cold call.'),
      h('div', { class: 'search-wrap', hidden: phoneWidth() && !state.scriptSearchOpen }, icon('search', 17), search, key('/')),
      h('div', { id: 'script-tabs', class: 'chips script-tabs', 'aria-label': 'Script groups' }, scriptTabs()),
      h('div', { id: 'script-results', class: 'script-results' }, scriptResults()));
    if (phoneWidth()) {
      let startY;
      on(shell, 'pointerdown', event => {
        startY = event.target.closest('.script-handle,.script-pane-heading') ? event.clientY : null;
      });
      on(shell, 'pointerup', event => {
        if (startY != null && event.clientY - startY > 36) toggleScript();
        startY = null;
      });
      on(shell, 'pointercancel', () => { startY = null; });
    }
    return h('div', { class: 'script-wrap' }, !opened &&
      btn('Show call scripts', toggleScript, { icon: 'scripts', key: 'P', kind: 'show-scripts' }), shell);
  }
  function scriptTabs() {
    return GROUPS.map(group => btn(group, () => {
      state.scriptQuery = '';
      if ($('script-search')) $('script-search').value = '';
      state.scriptGroup = group;
      refreshScriptTabs();
      refreshScriptResults();
    }, { pressed: String(state.scriptGroup === group && !state.scriptQuery) }));
  }
  function refreshScriptTabs() {
    const el = $('script-tabs');
    if (el) el.replaceChildren(...scriptTabs());
  }
  function scriptResults() {
    const lead = state.data.leads.get(state.current);
    const meeting = lead && [...state.openMeetings.values()].find(item => item.leadId === lead.id);
    const variables = scriptValues(lead, meeting);
    const query = state.scriptQuery.trim().toLowerCase();
    const visible = sortedScripts().filter(script => query ?
      [script.group, script.title, script.body, script.note].some(value => value.toLowerCase().includes(query)) : script.group === state.scriptGroup);
    return visible.length ? visible.map(script => {
      const body = h('p', { class: 'script-body' }, L.templateParts(script.body, variables).map(part =>
        part.missing ? chip(part.text, 'amber') : part.text));
      const controls = btn('Copy', () => copy(L.template(script.body, scriptValues(state.data.leads.get(state.current), meeting))),
        { icon: 'copy', kind: 'text-button' });
      const note = script.note && h('p', { class: 'script-note muted' }, script.note);
      return script.group === 'Objections'
        ? h('details', { class: 'script-entry', name: 'objection' }, h('summary', {}, script.title), body, note, controls)
        : h('article', { class: 'script-entry' }, h('div', { class: 'section-heading' }, h('h3', {}, script.title), controls), body, note);
    }) : [subtle('No scripts match.')];
  }
  function refreshScriptResults() {
    const el = $('script-results');
    if (!el) return;
    el.replaceChildren(...scriptResults());
    for (const button of $('script-tabs').children) button.setAttribute('aria-pressed', String(button.textContent === state.scriptGroup && !state.scriptQuery));
  }
  function toggleScript() {
    state.scriptOpen = !(state.scriptOpen ?? !compact());
    const host = $('dial-script-host');
    if (host) {
      host.replaceChildren(scriptPane());
    }
  }
  function openScriptSearch() {
    state.scriptSearchOpen = true;
    if (!(state.scriptOpen ?? !compact())) toggleScript();
    const search = $('script-search');
    if (search) {
      search.closest('.search-wrap').hidden = false;
      search.focus();
    }
  }
  function selectScript(advance) {
    state.scriptQuery = '';
    if ($('script-search')) $('script-search').value = '';
    const index = (GROUPS.indexOf(state.scriptGroup) + advance + GROUPS.length) % GROUPS.length;
    state.scriptGroup = GROUPS[index];
    refreshScriptTabs();
    refreshScriptResults();
  }
  function scriptsView() {
    const all = sortedScripts();
    return [title('Scripts', [
      btn('Add custom script', () => editScript(), { icon: 'plus', kind: 'primary' }),
      btn('Reset all scripts', () => confirmAction('Reset all scripts', 'Restore the original copy and order, and remove custom scripts?', 'Reset all scripts', () => {
        const now = new Date();
        const rows = values(state, 'scripts').filter(script => script.custom)
          .map(script => ({ ...script, deleted: true, updatedAt: now.toISOString() }));
        commit({ scripts: [...rows, ...SEEDS.map(seed => resetSeed(seed, now))] });
        render();
      }), { kind: 'danger' })]),
    h('div', { class: 'stack scripts-library' }, GROUPS.map(group => {
      const rows = all.filter(script => script.group === group);
      return panel('library-group', h('h2', {}, group), rows.map((script, index) => h('article', { class: 'library-row' },
        h('div', {}, h('h3', {}, script.title), h('p', { class: 'script-body' }, script.body), script.note && subtle(script.note)),
        h('div', { class: 'actions' },
          btn('Edit', () => editScript(script), { icon: 'edit' }),
          btn('Up', () => reorderScript(script, rows[index - 1]), { disabled: index === 0 }),
          btn('Down', () => reorderScript(script, rows[index + 1]), { disabled: index === rows.length - 1 }),
          script.custom ? btn('Delete', () => confirmAction('Delete custom script', 'Remove “' + script.title + '” from the library?', 'Delete script', () => {
            commit({ scripts: [{ ...script, deleted: true, updatedAt: new Date().toISOString() }] });
            render();
          }), { kind: 'danger' }) : btn('Reset to default', () => confirmAction('Reset script', 'Restore the original copy and position of this script?', 'Reset script', () => {
            commit({ scripts: [resetSeed(SEEDS.find(seed => seed.id === script.id), new Date())] });
            render();
          }), { disabled: !script.isDefaultEdited })))));
    }))];
  }
  function resetSeed(seed, now) {
    const previous = state.data.scripts.get(seed.id);
    return L.record({ ...seed, ...(previous ? { createdAt: previous.createdAt } : {}) }, now);
  }
  function editScript(script) {
    const { form } = makeForm([
      field('Group', options('group', GROUPS, script?.group || GROUPS[0], { disabled: Boolean(script && !script.custom) })),
      field('Title', input('title', 'text', script?.title || '', { required: true })),
      field('Body', area('body', script?.body || '', { rows: 7, required: true }), 'Placeholders: {company} {owner} {city} {phone} {booking_link} {meeting_time}'),
      field('Note', area('note', script?.note || ''))
    ], (el, error) => {
      const titleText = formValue(el, 'title'), body = formValue(el, 'body');
      if (!titleText || !body) { error('Enter a title and script body.'); return; }
      const group = formValue(el, 'group');
      const now = new Date();
      const fields = { group, title: titleText, body, note: formValue(el, 'note') };
      const order = Math.max(0, ...values(state, 'scripts').map(row => row.order)) + 1;
      const row = script ? { ...script, ...fields, isDefaultEdited: !script.custom,
        order: script.group === group ? script.order : order, updatedAt: now.toISOString() }
        : L.record({ ...fields, order, custom: true, isDefaultEdited: false }, now);
      commit({ scripts: [row] });
      closeModal();
      render();
      toast('Script saved.');
    });
    openModal(script ? 'Edit script' : 'Add custom script', form);
  }
  function reorderScript(row, other) {
    if (!other) return;
    const ts = new Date().toISOString();
    commit({ scripts: [
      { ...row, order: other.order, isDefaultEdited: !row.custom, updatedAt: ts },
      { ...other, order: row.order, isDefaultEdited: !other.custom, updatedAt: ts }
    ] });
    render();
  }

  // Board and reports
  function startDial() { navigate('dial'); }
  function boardView() {
    const now = new Date(), week = L.weekStart(now);
    const clients = values(state, 'clients');
    const meetings = values(state, 'meetings');
    const weekStats = L.funnel(state.dayStats, clients, week);
    const streak = L.streak(state.dayStats, state.data.daysOff.values(), now, settings);
    const due = state.due.length;
    const todayMeetingCount = state.todayMeetings.length;
    const dateLine = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
    return [
      h('header', { class: 'board-heading page-title' },
        h('div', {}, h('div', { class: 'board-date' }, icon('meeting_booked', 15), dateLine), h('h1', {}, 'Scoreboard')),
        h('div', { class: 'actions' }, btn('Generate Day card', () => navigate('content', { today: true }), { icon: 'content' }),
          btn('Start dialing', startDial, { kind: 'primary start-dial', icon: 'dial', key: 'D' }))),
      dialStrip(),
      h('div', { class: 'board-context' },
        h('span', {}, icon('sun', 16), 'Best streak ', h('strong', {}, words(streak.best, 'day'))),
        h('span', {}, 'Days off used this month: ', h('strong', {}, n(streak.daysOff))),
        due > 0 && btn(words(due, 'callback') + ' due', () => navigate('calls'), { icon: 'calls', kind: 'text-button' }),
        todayMeetingCount > 0 && btn(words(todayMeetingCount, 'meeting') + ' today', () => navigate('pipeline'), { icon: 'meeting_booked', kind: 'text-button' })),
      !values(state, 'leads').length && panel('board-first-run empty-card', h('h2', {}, 'No leads yet'),
        btn('Import leads', () => navigate('import'), { icon: 'import', kind: 'primary' }), firstRun()),
      h('div', { class: 'section-heading board-week' }, h('h2', {}, 'Weekly activity'),
        h('span', { class: 'muted' }, weekLabel(week))),
      h('div', { class: 'dashboard-grid' },
        weeklyCard('Dials this week', 'dial', 'weeklyDials', weekStats.dials, todayStats().dials, settings.target, now),
        weeklyCard('Meetings booked this week', 'meeting_booked', 'weeklyMeetings', weekStats.meetings, todayStats().meetings, settings.weeklyMeetings / 5, now)),
      h('div', { class: 'section-heading board-week' }, h('h2', {}, 'Goals')),
      h('div', { class: 'dashboard-grid' },
        tierCard('Clients signed', 'owner_spoke', clients.length, settings.clientTiers, settings.clientDeadline, now, false),
        tierCard('MRR', 'pipeline', clients.filter(row => row.status === 'active').reduce((sum, row) => sum + row.monthlyInr, 0),
          settings.mrrTiers, settings.mrrDeadline, now, true),
        weightCard(now),
        panel('metric-card open-pipeline', h('div', { class: 'section-heading' },
          h('h2', {}, icon('pipeline', 18), 'Open pipeline')),
        h('div', { class: 'pipeline-totals' },
          h('div', {}, h('strong', {}, n(meetings.filter(row => row.stage === 'booked' || row.stage === 'held').length)), h('span', {}, 'Meetings')),
          h('div', {}, h('strong', {}, n(meetings.filter(row => row.stage === 'proposal').length)), h('span', {}, 'Proposals'))),
        btn('Open Pipeline', () => navigate('pipeline'), { kind: 'text-button', icon: 'pipeline' })),
        settings.showRunway && runwayCard())
    ];
  }
  function weeklyCard(label, glyph, keyName, value, today, daily, now) {
    const target = settings[keyName];
    const pace = L.pace(value, target, now, state.data.daysOff.values(), today, daily, settings);
    const delta = (pace.delta < 0 ? '−' : '+') + n(Math.abs(pace.delta));
    const tone = pace.status === 'Behind' ? 'bad' : pace.status === 'Ahead' ? 'green' : 'blue';
    return panel('metric-card', h('div', { class: 'section-heading' }, h('h3', {}, icon(glyph, 18), label),
      iconButton('edit', 'Edit ' + label.toLowerCase() + ' target', () => numericGoal(label + ' target', keyName, 1))),
    h('div', { class: 'metric-number' }, n(value), h('span', {}, '/ ' + n(target))),
    progress(value, target, [target / 5, target * 2 / 5, target * 3 / 5, target * 4 / 5], 'amber'),
    h('div', { class: 'metric-footer' }, h('strong', { class: tone }, pace.status, ' ', delta),
      h('span', { class: 'muted' }, 'Expected ' + n(pace.expected) + ' so far')));
  }
  function tierCard(label, glyph, value, levels, deadline, now, money) {
    const fmt = money ? inr : n;
    const tier = L.tiers(value, levels, deadline, now);
    return panel('metric-card tier-card', h('div', { class: 'section-heading' },
      money ? h('h3', {}, icon(glyph, 18), btn(label, clientModal, { kind: 'text-button', title: 'MRR · Open client list' }))
        : h('h3', {}, icon(glyph, 18), label),
      iconButton('edit', 'Edit ' + label + ' tiers', () => editTiers(money))),
    h('div', { class: 'metric-number' }, money ? h('button', { type: 'button', class: 'metric-link', onclick: clientModal }, fmt(value)) : fmt(value),
      h('span', {}, '/ ' + fmt(levels[1]))),
    progress(value, levels[2], levels, tier.next == null ? 'green' : 'amber'),
    h('div', { class: 'metric-footer' }, h('strong', { class: tier.status === 'Below floor' ? 'amber' : 'green' }, tier.status),
      h('span', { class: 'muted' }, words(tier.days, 'day') + ' left · ' + humanDay(deadline))),
    h('div', { class: 'tier-levels' }, levels.map((level, index) =>
      h('div', {}, h('span', { class: 'muted' }, ['Floor', 'Target', 'Stretch'][index]),
        h('strong', {}, !money && level === 3 && levels[2] === 5 ? '3–4' : fmt(level)),
        h('small', { class: value >= level ? 'green' : 'muted' },
          value >= level ? 'Hit' : fmt(Math.max(0, level - value)) + ' left')))),
    h('p', { class: 'tier-next muted' }, tier.next == null ? 'All tiers hit.' : 'Next tier ' + fmt(tier.next) + ' · ' + fmt(tier.remaining) + ' to go'),
    money && savingsBlock());
  }
  function numericGoal(label, keyName, minimum, step = 1, fmt = n) {
    const { form } = makeForm([field(label, input('value', 'number', settings[keyName] ?? '', { min: minimum, step, required: true }),
      settings[keyName] != null ? 'Current: ' + fmt(settings[keyName]) : null)], (el, error) => {
      const value = Number(formValue(el, 'value'));
      const patch = { [keyName]: value };
      if (keyName === 'savingsNow') patch.savingsUpdatedAt = new Date().toISOString();
      if (keyName === 'runway') patch.runwayUpdatedAt = new Date().toISOString();
      if (!saveSettings(patch)) { error('Enter a valid value.'); return; }
      closeModal();
      render();
    });
    openModal(label, form);
  }
  function editTiers(money) {
    const keyName = money ? 'mrrTiers' : 'clientTiers';
    const dateName = money ? 'mrrDeadline' : 'clientDeadline';
    const unit = money ? ' (₹)' : '';
    const { form } = makeForm([
      ...['Floor', 'Target', 'Stretch'].map((name, i) =>
        field(name + unit, input('tier' + i, 'number', settings[keyName][i], { min: 1, step: 1, required: true }))),
      field('Deadline', input('deadline', 'date', settings[dateName], { required: true }))
    ], (el, error) => {
      const tiers = [0, 1, 2].map(i => Number(formValue(el, 'tier' + i)));
      if (!saveSettings({ [keyName]: tiers, [dateName]: formValue(el, 'deadline') })) {
        error('Set three increasing tier amounts and a valid deadline.'); return;
      }
      closeModal();
      render();
    });
    openModal(money ? 'Edit MRR tiers' : 'Edit client tiers', form);
  }
  function savingsBlock() {
    return h('section', { class: 'savings-block' }, h('div', { class: 'section-heading' },
      h('h4', {}, 'Savings'), h('div', { class: 'actions' }, btn('Savings now', () => numericGoal('Savings now (₹)', 'savingsNow', 0, 1, inr),
        { kind: 'text-button' }), iconButton('edit', 'Edit savings goal', () => numericGoal('Savings goal (₹)', 'savingsGoal', 1, 1, inr)))),
    h('p', {}, h('strong', {}, inr(settings.savingsNow || 0)), h('span', { class: 'muted' }, ' / ' + inr(settings.savingsGoal))),
    progress(settings.savingsNow || 0, settings.savingsGoal, [], 'blue'),
    settings.savingsUpdatedAt && subtle('Updated ' + humanDay(settings.savingsUpdatedAt)));
  }
  function weightCard(now) {
    const stats = L.weightStats(state.data.weights.values(), now);
    const date = input('date', 'date', state.today, { required: true, max: state.today, 'aria-label': 'Weight date' });
    const kg = input('kg', 'number', '', { min: .1, step: .1, required: true, placeholder: 'kg', 'aria-label': 'Weight in kilograms' });
    const loadDay = () => {
      const row = values(state, 'weights').find(row => row.date === date.value);
      kg.value = row ? row.kg.toFixed(1) : '';
    };
    const form = h('form', { class: 'weight-form', onsubmit: event => {
      event.preventDefault();
      const value = Number(kg.value);
      const keyName = date.value;
      if (!(value > 0) || !L.isDateKey(keyName) || keyName > state.today) return;
      const stamp = new Date();
      const prior = values(state, 'weights').find(row => row.date === keyName);
      const row = prior ? { ...prior, kg: value, updatedAt: stamp.toISOString() }
        : L.record({ id: 'weight:' + keyName, date: keyName, kg: value }, stamp);
      commit({ weights: [row] });
      render();
      toast('Weight saved.');
    } }, date, kg, h('button', { type: 'submit', class: 'button primary' }, 'Save'));
    on(date, 'change', loadDay);
    loadDay();
    return panel('metric-card weight-card', h('div', { class: 'section-heading' }, h('h3', {}, icon('board', 18), 'Weight'),
      iconButton('edit', 'Edit weight goal', () => numericGoal('Weight goal (kg)', 'weightGoal', .1, .1))),
    h('div', { class: 'metric-number' }, stats.average == null ? '–' : stats.average.toFixed(1) + ' kg',
      h('span', {}, '/ ' + n(settings.weightGoal) + ' kg')),
    h('div', { class: 'metric-footer' }, h('span', { class: 'muted' }, '7-day average'),
      h('strong', {}, stats.change == null ? '–' : (stats.change > 0 ? '+' : '') + stats.change.toFixed(1) + ' kg vs prior 7 days')),
    stats.points.length ? weightSparkline(stats.points, now) : subtle('No weight entries in the last 30 days.'),
    form);
  }
  function svgElement(name, attrs, children = []) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (const [key, value] of Object.entries(attrs)) svg.setAttribute(key, value);
    svg.append(...children);
    return svg;
  }
  function weightSparkline(rows, now) {
    const first = L.day(L.addDays(now, -29));
    const bounds = rows.map(row => row.kg);
    const low = Math.min(...bounds) - .25, high = Math.max(...bounds) + .25;
    const points = rows.map(row => [4 + 232 * L.dayDistance(first, row.date) / 29, 44 - 38 * (row.kg - low) / (high - low)]);
    const svg = svgElement('svg', { viewBox: '0 0 240 48', class: 'sparkline', role: 'img', 'aria-label': 'Weight over the last 30 days' },
      [svgElement('path', { d: 'M4 44H236', stroke: 'var(--border)', 'stroke-width': 1 }),
        svgElement('polyline', { points: points.map(pair => pair.join(',')).join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2 }),
        ...points.map(([cx, cy]) => svgElement('circle', { cx, cy, r: 2.5, fill: 'var(--accent)' }))]);
    return svg;
  }
  function runwayCard() {
    const tone = settings.runway == null ? '' : settings.runway < 2 ? 'bad' : settings.runway < 4 ? 'amber' : '';
    return panel('metric-card', h('div', { class: 'section-heading' }, h('h3', {}, 'Runway'),
      iconButton('edit', 'Edit runway', () => numericGoal('Months of house money left', 'runway', 0, .1))),
    h('div', { class: 'metric-number ' + tone }, settings.runway == null ? '–' : n(settings.runway)),
    subtle('Months of house money left' + (settings.runwayUpdatedAt ? ' · Updated ' + humanDay(settings.runwayUpdatedAt) : '')));
  }
  const shortDay = value => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(value);
  const weekLabel = week => shortDay(week) + ' – ' + shortDay(L.addDays(week, 6));
  function funnelView() {
    const thisWeek = L.weekStart(new Date());
    const week = L.addDays(thisWeek, state.weekOffset * 7);
    const clients = state.data.clients.values();
    const result = L.funnel(state.dayStats, clients, week);
    const steps = [['Dials', result.dials, null], ['Owner conversations', result.owners, result.rates[0]],
      ['Meetings booked', result.meetings, result.rates[1]], ['Closes', result.closes, result.rates[2]]];
    const weeks = Array.from({ length: 8 }, (_, index) => {
      const w = L.addDays(week, -index * 7);
      const r = L.funnel(state.dayStats, state.data.clients.values(), w);
      return [weekLabel(w), n(r.dials), n(r.owners), n(r.meetings), n(r.closes), ...r.rates.map(percent)];
    });
    return [title('Funnel'),
      panel('flow-card', h('div', { class: 'section-heading' }, h('h2', {}, weekLabel(week)),
        h('div', { class: 'actions' },
          iconButton('left', 'Previous week', () => { state.weekOffset--; render(); }),
          btn('This week', () => { state.weekOffset = 0; render(); }, { disabled: state.weekOffset === 0 }),
          iconButton('right', 'Next week', () => { state.weekOffset++; render(); }))),
      h('div', { class: 'funnel-steps' }, steps.map(([label, count, rate], i) => h('article', { class: 'funnel-step' },
        h('p', { class: 'muted' }, label), h('strong', {}, n(count)), progress(count, Math.max(1, result.dials), [], 'amber'),
        i > 0 && h('span', { class: 'muted' }, percent(rate) + (rate == null ? '' : ' from prior step')))))),
      panel('flow-card', h('h2', {}, 'Trailing 8 weeks'),
        h('div', { class: 'table-scroll' }, table(['Week', 'Dials', 'Owners', 'Meetings', 'Closes', 'Owner / dial', 'Meeting / owner', 'Close / meeting'], weeks)))];
  }
  const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hourLabel = hour => (hour % 12 || 12) + (hour < 12 ? ' AM' : ' PM');
  function heatmapView() {
    const stats = L.heatmap(state.data.logs.values());
    const selected = state.heatCell;
    const metric = state.metric;
    const headers = ['Hour', ...WEEKDAYS.slice(0, 5).map(label => label.slice(0, 3)), 'All weekdays'];
    const detail = h('div', { class: 'heat-detail', id: 'heat-detail', 'aria-live': 'polite' });
    const show = (i, j) => {
      state.heatCell = [i, j];
      const cell = j === 5 ? stats.hours[i] : stats.cells[i][j];
      detail.replaceChildren(h('strong', {}, (j === 5 ? 'All weekdays' : WEEKDAYS[j]) + ' · ' + hourLabel(i + 8)),
        h('span', {}, words(cell.dials, 'dial') + ' · ' + n(cell.answered) + ' answered · ' + words(cell.owners, 'owner conversation')),
        ...(cell.dials < 5 ? [chip('Low data')] : []));
      for (const button of document.querySelectorAll('.heat-cell')) button.setAttribute('aria-pressed', String(button.dataset.cell === i + '-' + j));
    };
    const rows = stats.cells.map((cells, i) => [
      h('strong', {}, hourLabel(i + 8)), ...[...cells, stats.hours[i]].map((cell, j) => {
        const ratio = L.ratio(cell[metric], cell.dials);
        const strength = ratio == null ? 0 : ratio;
        return h('button', { class: 'heat-cell' + (cell.dials < 5 ? ' low-data' : '') + (j === 5 ? ' aggregate' : ''),
          type: 'button', style: '--intensity:' + Math.round(strength * 63) + '%;--rate:' + Math.round(strength * 100) + '%',
          'data-cell': i + '-' + j, 'aria-pressed': String(selected?.[0] === i && selected?.[1] === j),
          'aria-label': (j === 5 ? 'All weekdays' : WEEKDAYS[j]) + ' ' + hourLabel(i + 8) + ', ' + percent(ratio) + (cell.dials < 5 ? ', low data' : ''),
          onclick: () => show(i, j)
        }, h('strong', {}, percent(ratio)), cell.dials < 5 ? h('small', {}, 'low data') : h('small', {}, words(cell.dials, 'dial')));
      })]);
    if (selected) show(...selected);
    else detail.append(subtle('Select a cell to see dials, pickups, and owner conversations.'));
    const insight = stats.total < 150 ? ['Need 150+ dials for a confident read (now ' + n(stats.total) + ')',
      progress(stats.total, 150, [], 'amber')] : stats.best ?
      ['Best window so far: ' + hourLabel(stats.best.from) + '–' + hourLabel(stats.best.to) + ' · ' +
        percent(stats.best.rate) + ' owner reach · ' + words(stats.best.dials, 'dial')] :
      ['No three-hour window has at least 30 dials yet.'];
    return [title('Heatmap',
      [['answered', 'Pickup rate'], ['owners', 'Owner reach']].map(([value, label]) => btn(label, () => {
        state.metric = value;
        render();
      }, { pressed: String(metric === value) }))),
    panel('flow-card heat-panel', h('div', { class: 'heat-insight' }, insight),
      h('div', { class: 'table-scroll heat-scroll' }, table(headers, rows, 'heat-table')), detail)];
  }
  function contentView() {
    if (!state.contentDay) state.contentDay = state.today;
    const counts = state.dayStats.get(state.contentDay) || L.zero();
    const disabled = !counts.dials;
    const dayNumber = [...state.dayStats].filter(([key, value]) => key <= state.contentDay && value.dials > 0).length;
    const streak = L.streak(state.dayStats, state.data.daysOff.values(), L.dateOf(state.contentDay), settings, state.contentDay < state.today).current;
    const caption = 'Day ' + n(dayNumber) + '. ' + words(counts.dials, 'dial') + '. ' +
      words(counts.owners, 'owner conversation') + '. ' + words(counts.meetings, 'meeting booked', 'meetings booked') + '. ' + n(streak) + '-day streak.';
    const canvas = h('canvas', { width: 1080, height: state.contentSize, 'aria-label': 'Day card preview' });
    if (!disabled) drawDayCard(canvas, dayNumber, counts, streak);
    const dateField = field('Day', input('date', 'date', state.contentDay, { max: state.today, required: true, onchange: event => {
      if (!L.isDateKey(event.target.value) || event.target.value > state.today) { event.target.value = state.contentDay; return; }
      state.contentDay = event.target.value;
      render();
    } }));
    const sizeField = field('Format', options('format', [[1920, 'Story · 1080×1920'], [1350, 'Post · 1080×1350']], state.contentSize,
      { onchange: event => { state.contentSize = Number(event.target.value); render(); } }));
    return [title('Day card'), h('div', { class: 'content-layout' }, panel('flow-card content-controls', dateField, sizeField,
      disabled ? subtle('No dials logged for this day.') : panel('caption', h('h2', {}, 'Caption'), h('p', {}, caption)),
      h('div', { class: 'actions' }, btn('Download PNG', () => canvas.toBlob(blob => {
        if (blob) download('dial-console-day-' + dayNumber + '.png', blob, 'image/png');
      }), { disabled, kind: 'primary', icon: 'download' }),
      btn('Copy caption', () => copy(caption), { disabled, icon: 'copy' }))),
    panel('content-preview', disabled ? h('div', { class: 'empty-card' }, icon('content', 32), subtle('No card for this day.')) : canvas))];
  }
  function drawDayCard(canvas, dayNumber, counts, streak) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width, height = canvas.height;
    const amber = '#F5B83D', white = '#E8ECF1', muted = '#A6B0BD';
    ctx.fillStyle = '#0B0D10'; ctx.fillRect(0, 0, width, height);
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = amber; ctx.fillRect(86, height * .09, 86, 12);
    const heading = n(dayNumber);
    ctx.font = '800 142px system-ui'; ctx.fillText('DAY ' + heading, 84, height * .225, 910);
    const entries = [[counts.dials, 'Dials'], [counts.owners, 'Owner conversations'], [counts.meetings, 'Meetings booked']];
    for (const [index, [count, label]] of entries.entries()) {
      const y = height * (.36 + .16 * index);
      ctx.fillStyle = '#252C35'; ctx.fillRect(86, y - height * .048, 908, 2);
      ctx.fillStyle = white; ctx.font = '760 94px system-ui'; ctx.fillText(n(count), 86, y + 72, 330);
      ctx.fillStyle = muted; ctx.font = '550 48px system-ui'; ctx.fillText(label, 426, y + 65, 570);
    }
    ctx.fillStyle = amber; ctx.font = '680 44px system-ui'; ctx.fillText(n(streak) + '-day streak', 86, height * .924, 520);
    ctx.textAlign = 'right'; ctx.fillStyle = muted; ctx.font = '540 38px system-ui'; ctx.fillText(settings.handle, 994, height * .924, 370);
  }

  // Settings and backups
  const EPOCH = new Date(0);
  function defaultsData(timestamp = EPOCH) {
    return { ...Object.fromEntries(L.STORES.map(store => [store, []])),
      scripts: SEEDS.map(seed => L.record(seed, timestamp)),
      settings: [L.record({ ...L.DEFAULTS, id: 'settings' }, timestamp)] };
  }
  function settingsView() {
    const numeric = (label, name, min = 1, step = 1) => field(label, input(name, 'number', settings[name], { min, step, required: true }));
    const { form } = makeForm([
      h('div', { class: 'field-grid' }, numeric('Daily floor', 'floor'), numeric('Daily target', 'target'),
        numeric('Weekly dial target', 'weeklyDials'), numeric('Weekly meeting target', 'weeklyMeetings'),
        numeric('Retry delay hours', 'retryDelayHours', .1, .1), numeric('Maximum attempts', 'maxAttempts'),
        numeric('Owner cooldown days', 'ownerCooldownDays'), numeric('Default monthly fee (₹)', 'defaultMonthlyFee', 0, .01)),
      h('fieldset', {}, h('legend', {}, 'Working days'), h('div', { class: 'actions workdays' },
        WEEKDAYS.map((label, index) => check(label.slice(0, 3), 'day' + index, settings.workdays.includes(index))))),
      h('div', { class: 'field-grid' },
        field('Booking link', input('bookingLink', 'url', settings.bookingLink, { placeholder: 'https://' })),
        field('Handle', input('handle', 'text', settings.handle, { maxlength: 40, placeholder: '@username' })),
        field('Landing view', options('landing', Object.entries(VIEWS).filter(([view]) => view !== 'import'), settings.landing))),
      h('div', { class: 'settings-toggles' }, check('Callbacks first', 'callbacksFirst', settings.callbacksFirst),
        check('Keep screen awake while dialing', 'keepAwake', settings.keepAwake), check('Show runway card', 'showRunway', settings.showRunway))
    ], (el, error) => {
      const data = {};
      for (const name of ['floor', 'target', 'weeklyDials', 'weeklyMeetings', 'retryDelayHours', 'maxAttempts', 'ownerCooldownDays', 'defaultMonthlyFee']) {
        data[name] = Number(formValue(el, name));
      }
      for (const name of ['bookingLink', 'handle', 'landing']) data[name] = formValue(el, name);
      for (const name of ['callbacksFirst', 'keepAwake', 'showRunway']) data[name] = el.elements[name].checked;
      data.workdays = WEEKDAYS.map((_, index) => index).filter(index => el.elements['day' + index].checked);
      if (!data.workdays.length) { error('Select at least one working day.'); return; }
      if (data.floor > data.target) { error('The floor must be at or below the daily target.'); return; }
      if (data.bookingLink && !/^https?:\/\//i.test(data.bookingLink)) { error('Use an http or https booking link.'); return; }
      if (!saveSettings(data)) { error('Check the targets, retry settings and handle. Use a handle such as @username.'); return; }
      toast('Settings saved.');
    }, 'Save settings');
    const picker = input('backup', 'file', '', { class: 'visually-hidden', accept: '.json,application/json', 'aria-label': 'Choose a JSON backup',
      onchange: async event => {
        const [file] = event.target.files;
        event.target.value = '';
        if (file && !state.busy) await prepareBackup(file);
      } });
    return [title('Settings'), h('div', { class: 'settings-layout' },
      panel('flow-card', h('h2', {}, 'Dialing and goals'), form),
      h('div', { class: 'stack' },
        daysOffPanel(),
        panel('flow-card', h('h2', {}, 'Backup'), subtle('Last export: ' + (settings.lastBackupAt ? when(settings.lastBackupAt) : 'Never')),
          h('div', { class: 'actions' },
            btn('Export JSON', exportBackup, { icon: 'download' }),
            btn('Import JSON', () => picker.click(), { icon: 'import' }), picker)),
        panel('flow-card', h('h2', {}, 'Clients'), btn('Open client list', clientModal, { icon: 'owner_spoke' })),
        panel('flow-card danger-panel', h('h2', {}, 'Data removal'),
          btn('Remove sample data', removeSamples, { kind: 'danger', disabled: !values(state, 'leads').some(row => row.sample) }),
          btn('Erase everything', eraseData, { kind: 'danger' }))))];
  }
  function daysOffPanel() {
    const days = values(state, 'daysOff').sort((a, b) => b.day.localeCompare(a.day));
    const date = input('day', 'date', state.today, { required: true });
    const reason = options('reason', [['rest', 'Rest'], ['holiday', 'Holiday'], ['sick', 'Sick'], ['other', 'Other']], 'rest');
    const save = makeForm([field('Day', date), field('Reason', reason)], (form, error) => {
      if (!L.isDateKey(date.value)) { error('Choose a valid date.'); return; }
      const stamp = new Date(), keyName = 'dayOff:' + date.value;
      const before = state.data.daysOff.get(keyName) || days.find(row => row.day === date.value);
      const row = before ? { ...before, reason: reason.value, deleted: false, updatedAt: stamp.toISOString() }
        : L.record({ id: keyName, day: date.value, reason: reason.value }, stamp);
      commit({ daysOff: [row] });
      render();
      toast('Day off saved.');
    }, 'Mark day off');
    return panel('flow-card', h('h2', {}, 'Days off'), save.form,
      days.length > 0 && h('ul', { class: 'history' }, days.map(row => h('li', { class: 'history-row' },
        h('strong', {}, humanDay(row.day)), chip(row.reason),
        iconButton('dead', 'Remove day off ' + humanDay(row.day), () => confirmAction('Remove day off',
          'Count ' + humanDay(row.day) + ' as a regular day again?', 'Remove day off', () => {
            commit({ daysOff: [{ ...row, deleted: true, updatedAt: new Date().toISOString() }] });
            render();
          }))))));
  }
  function clientModal() {
    const clients = values(state, 'clients').sort((a, b) => b.wonAt.localeCompare(a.wonAt));
    const rows = clients.map(client => {
      const fee = input('monthlyInr', 'number', client.monthlyInr, { min: 0, step: .01, required: true });
      const status = options('status', [['active', 'Active'], ['churned', 'Churned']], client.status);
      return h('form', { class: 'client-row', onsubmit: event => {
        event.preventDefault();
        const current = state.data.clients.get(client.id);
        if (!current || current.deleted) return;
        commit({ clients: [{ ...current, monthlyInr: Number(fee.value), status: status.value, updatedAt: new Date().toISOString() }] });
        render();
        toast('Client saved.');
      } }, h('h3', { class: 'truncate', title: client.name }, client.name),
      subtle('Started ' + humanDay(client.startDate)),
      h('div', { class: 'field-grid' }, field('Monthly fee (₹)', fee), field('Status', status)),
      h('button', { class: 'button', type: 'submit' }, 'Save client'));
    });
    openModal('Clients', h('div', { class: 'form client-list' }, rows.length ? rows : subtle('No clients yet. Mark a meeting Won to add one.')));
  }
  function exportBackup() {
    if (!queue) return;
    const now = new Date();
    const next = { ...settings, lastBackupAt: now.toISOString() };
    const data = { schemaVersion: L.VERSION, exportedAt: now.toISOString(), ...snapshot(), settings: [next] };
    download('dial-console-backup-' + L.localInput(now).replace(':', '-') + '.json', JSON.stringify(data, null, 2), 'application/json');
    commit({ settings: [next] });
    renderNotices();
    if (state.view === 'settings' && !hasModal()) render();
    toast('Backup downloaded.');
  }
  async function prepareBackup(file) {
    let incoming;
    try { incoming = L.validateBackup(JSON.parse(await file.text())); }
    catch (error) { openModal('Cannot import backup', h('div', { class: 'form' },
      subtle(error instanceof SyntaxError ? 'The file is not valid JSON.' : error.message))); return; }
    const choose = mode => {
      const { summary } = L.merge(snapshot(), incoming, mode);
      const lines = L.STORES.filter(store => summary[store]).map(store =>
        '+' + n(summary[store]) + ' ' + (({ daysOff: 'days off', meetings: 'pipeline items', weights: 'weight entries', settings: 'settings record' })[store] || store));
      lines.push(n(summary.updated) + ' updated');
      if (mode === 'replace') lines.push(n(summary.removed) + ' removed');
      confirmAction(mode === 'merge' ? 'Confirm merge' : 'Confirm replace',
        (mode === 'replace' ? 'Replace all local data with this backup. ' : '') + lines.join(' · '),
        mode === 'merge' ? 'Merge backup' : 'Replace all data', async (_, show) => {
          if (state.busy) return false;
          state.busy = true;
          try {
            const { result } = L.merge(snapshot(), incoming, mode);
            if (!await storage.commit(withMissingSeeds(result), { replace: true, strict: true })) {
              show('The backup could not be applied. Existing data is intact.'); return false;
            }
            hydrate(result);
            clearSession();
            renderNav();
            renderNotices();
            render();
            toast(mode === 'merge' ? 'Backup merged.' : 'Backup restored.');
          } finally { state.busy = false; }
        }, mode === 'replace' ? btn('Export current data', exportBackup, { icon: 'download' }) : null);
    };
    openModal('Import JSON backup', h('div', { class: 'form' },
      subtle(file.name + ' · Exported ' + when(incoming.exportedAt)),
      h('p', {}, 'Merge combines records by ID and keeps newer edits. Replace clears the local database before restoring the backup.'),
      h('div', { class: 'actions' },
        btn('Merge', () => choose('merge'), { kind: 'primary' }), btn('Replace', () => choose('replace'), { kind: 'danger' }))));
  }
  function withMissingSeeds(data) {
    const known = new Set(data.scripts.map(row => row.id));
    data.scripts.push(...SEEDS.filter(seed => !known.has(seed.id)).map(seed => L.record(seed, EPOCH)));
    return data;
  }
  function clearSession() {
    state.current = null;
    state.sessionLogs = [];
    state.sessionDials = 0;
    state.sessionStart = null;
    state.lastOutcome = -Infinity;
    state.import = null;
    state.today = L.day(new Date());
    state.contentDay = '';
    state.logLimit = 40;
  }
  function removeSamples() {
    confirmAction('Remove sample data', 'Remove sample leads and their call logs, meetings, and clients?', 'Remove sample data', () => {
      const sampleIds = new Set(values(state, 'leads').filter(row => row.sample).map(row => row.id));
      const ts = new Date().toISOString();
      const changes = {};
      for (const store of ['leads', 'logs', 'meetings', 'clients']) {
        const rows = values(state, store).filter(row => sampleIds.has(store === 'leads' ? row.id : row.leadId));
        if (rows.length) changes[store] = rows.map(row => ({ ...row, deleted: true, updatedAt: ts }));
      }
      commit(changes);
      if (sampleIds.has(state.current)) state.current = null;
      refreshDue();
      render();
      toast('Sample data removed.');
    });
  }
  function eraseData() {
    const type = input('verification', 'text', '', { autocomplete: 'off', required: true });
    confirmAction('Erase everything', 'This permanently clears the records on this device. Export a backup before erasing.', 'Erase everything',
      async (_, error) => {
        if (type.value !== 'DELETE') { error('Type DELETE to continue.'); return false; }
        if (state.busy) return false;
        state.busy = true;
        try {
          const data = defaultsData();
          if (!await storage.commit(data, { replace: true, strict: true })) return error('Could not erase data. Try again.'), false;
          hydrate(data);
          clearSession();
          state.view = 'board';
          state.backupDismissed = false;
          renderNav();
          renderNotices();
          render();
          toast('Local data erased.');
        } finally { state.busy = false; }
      }, h('div', { class: 'stack' }, btn('Export JSON', exportBackup, { icon: 'download' }), field('Type DELETE', type)));
  }

  // Keyboard and startup
  const GOTO = { d: 'dial', b: 'board', c: 'calls', p: 'pipeline', f: 'funnel', h: 'heatmap', l: 'leads',
    s: 'scripts', i: 'import', t: 'settings' };
  function shortcutsModal() {
    const rows = [
      ['1–6', 'Log an outcome'], ['C / Enter', 'Copy the current number'], ['D', 'Start dialing or open the phone dialer'],
      ['S', 'Skip for three hours'], ['U / Ctrl or Cmd+Z', 'Undo the latest session outcome'], ['N / O', 'Focus note or owner'],
      ['P', 'Toggle the script pane'], ['[ / ]', 'Change script group'], ['/', 'Search scripts'],
      ['Esc', 'Close a dialog or leave a field'], ['?', 'Show shortcuts']
    ];
    openModal('Keyboard shortcuts', h('div', { class: 'form' }, h('h3', {}, 'Dial and global'),
      table(['Key', 'Action'], rows.map(([shortcut, label]) => [key(shortcut), label])),
      h('h3', {}, 'Navigation'), table(['Keys', 'View'], Object.entries(GOTO).map(([second, view]) => [key('G ' + second.toUpperCase()), VIEWS[view]]))));
  }
  function clearPrefix() {
    clearTimeout(state.keyTimer);
    state.keyTimer = null;
    $('key-prefix').hidden = true;
  }
  function keyboard(event) {
    if (event.defaultPrevented || event.isComposing || state.booting || state.busy) return;
    const keyName = event.key.toLowerCase();
    const focused = document.activeElement;
    const editing = isField(focused);
    const modal = $('dialog').open ? $('dialog') : $('drawer').open ? $('drawer') : null;
    if (keyName === 'escape') {
      if (modal) { event.preventDefault(); closeModal(modal.id); }
      else if (editing) focused.blur();
      else if (state.view === 'dial' && state.scriptOpen && compact()) toggleScript();
      clearPrefix();
      return;
    }
    if (modal) {
      if (!event.repeat && modal.classList.contains('callback-modal') && !editing && /^[1-5]$/.test(keyName)) {
        if (modal.callbackPreset(Number(keyName) - 1)) event.preventDefault();
      }
      const form = focused?.closest('form') || modal.querySelector('form');
      if (keyName === 'enter' && !event.repeat && form && !focused?.matches('textarea,select') &&
          (!focused?.matches('button') || focused.closest('.preset-list'))) {
        const submit = form.querySelector('[type="submit"]');
        if (submit && !submit.disabled) { event.preventDefault(); form.requestSubmit(submit); }
      }
      return;
    }
    if (editing) return;
    if (state.view === 'dial' && (event.ctrlKey || event.metaKey) && keyName === 'z' && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      if (!event.repeat) undoLast();
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (state.keyTimer) {
      clearPrefix();
      if (GOTO[keyName]) { event.preventDefault(); navigate(GOTO[keyName]); return; }
    }
    if (event.repeat) { if (/^[1-6]$/.test(keyName) && state.view === 'dial') event.preventDefault(); return; }
    if (keyName === 'g') {
      event.preventDefault();
      $('key-prefix').hidden = false;
      state.keyTimer = setTimeout(clearPrefix, 1500);
      return;
    }
    if (keyName === '?') { event.preventDefault(); shortcutsModal(); return; }
    if (keyName === 'u' && state.sessionLogs.length) { event.preventDefault(); undoLast(); return; }
    const activating = focused?.matches('button,a,summary');
    if (state.view !== 'dial') {
      if (keyName === 'd' || (keyName === 'enter' && state.view === 'board' && !activating)) {
        event.preventDefault();
        startDial();
      }
      return;
    }
    if (keyName === 'enter' && activating) return;
    const short = {
      c: () => copy(state.data.leads.get(state.current)?.phone), enter: () => copy(state.data.leads.get(state.current)?.phone),
      d: () => $('tel-link')?.click(), s: skipCurrent, u: undoLast, n: () => focus('dial-note'),
      o: () => focus('dial-owner'), p: toggleScript, '[': () => selectScript(-1), ']': () => selectScript(1),
      '/': openScriptSearch
    };
    if (/^[1-6]$/.test(keyName)) {
      event.preventDefault();
      handleOutcome(Object.keys(L.OUTCOMES)[Number(keyName) - 1]);
    } else if (short[keyName]) { event.preventDefault(); short[keyName](); }
  }
  async function enableOffline() {
    if (!['http:', 'https:'].includes(location.protocol)) return;
    document.head.append(h('link', { rel: 'manifest', href: './manifest.webmanifest' }));
    if (!navigator.serviceWorker || !window.isSecureContext) return;
    try {
      let controlled = Boolean(navigator.serviceWorker.controller);
      on(navigator.serviceWorker, 'controllerchange', () => {
        if (controlled) location.reload();
        controlled = true;
      });
      const registration = await navigator.serviceWorker.register('./sw.js');
      const announce = worker => {
        if (worker && navigator.serviceWorker.controller) { state.update = worker; renderNotices(); }
      };
      announce(registration.waiting);
      on(registration, 'updatefound', () => {
        const worker = registration.installing;
        if (worker) on(worker, 'statechange', () => { if (worker.state === 'installed') announce(registration.waiting || worker); });
      });
    } catch (_) { /* Direct file use and unsupported browser contexts work without a worker. */ }
  }
  async function init() {
    on(window, 'error', event => reportError(event.error || event.message));
    on(window, 'unhandledrejection', event => { event.preventDefault(); reportError(event.reason); });
    on(document, 'keydown', keyboard);
    on(document, 'visibilitychange', refreshClock);
    on(window, 'pageshow', refreshClock);
    for (const id of ['dialog', 'drawer']) {
      on($(id), 'cancel', event => { event.preventDefault(); if (!state.busy) closeModal(id); });
      on($(id), 'click', event => { if (event.target === $(id) && !state.busy) closeModal(id); });
    }
    on(window, 'beforeunload', event => {
      if (state.saveError || storage.unprotected) { event.preventDefault(); event.returnValue = ''; }
    });
    try {
      const records = await storage.open();
      const known = new Set(records.scripts.map(row => row.id));
      const seeds = SEEDS.filter(seed => !known.has(seed.id)).map(seed => L.record(seed, EPOCH));
      const changes = {};
      if (!records.settings.length) {
        records.settings.push(L.record({ ...L.DEFAULTS, id: 'settings' }, EPOCH));
        changes.settings = records.settings;
        if (navigator.storage && typeof navigator.storage.persist === 'function') navigator.storage.persist().catch(() => {});
      }
      if (seeds.length) {
        records.scripts.push(...seeds);
        changes.scripts = seeds;
      }
      hydrate(records);
      let saved = 0;
      for (const rows of Object.values(records)) {
        for (const row of rows) saved = Math.max(saved, Date.parse(row.updatedAt) || 0);
      }
      if (saved) state.lastSave = new Date(saved);
      if (Object.keys(changes).length) await storage.commit(changes);
    } catch (error) {
      reportError(error);
      $('screen').replaceChildren(title('Storage unavailable'),
        panel('empty-card', subtle(error.message || 'The browser could not open this database.'), btn('Reload', () => location.reload())));
      return;
    }
    state.booting = false;
    state.view = VIEWS[settings.landing] ? settings.landing : 'board';
    renderNav();
    renderNotices();
    navigate(state.view);
    setInterval(guard(refreshClock), 30000);
    enableOffline();
  }
  guard(init)();
})();
