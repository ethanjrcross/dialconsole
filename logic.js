(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DC = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  const VERSION = 1;
  const STORES = ['leads', 'logs', 'meetings', 'clients', 'weights', 'daysOff', 'scripts', 'settings'];
  const OUTCOMES = {
    no_answer: 'No answer', gatekeeper: 'Gatekeeper', owner_spoke: 'Owner spoke',
    meeting_booked: 'Meeting booked', callback: 'Callback', dead: 'Dead'
  };
  const STATUSES = ['new', 'no_answer', 'gatekeeper', 'owner_spoke', 'callback', 'meeting', 'dead'];
  const STAGES = ['booked', 'held', 'proposal', 'won', 'lost', 'no_show'];
  const REASONS = ['Not a solar installer', 'Distributor/dealer only', 'Closed', 'Wrong number', 'Hostile', 'Other'];
  const HOUR = 3600000;
  const DAY = HOUR * 24;
  const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const DEFAULTS = Object.freeze({
    floor: 50, target: 100, weeklyDials: 500, weeklyMeetings: 5,
    clientTiers: [2, 3, 5], clientDeadline: '2027-01-31',
    mrrTiers: [60000, 100000, 150000], mrrDeadline: '2027-05-01',
    savingsGoal: 500000, weightGoal: 73, retryDelayHours: 3, maxAttempts: 4,
    ownerCooldownDays: 14, callbacksFirst: true, workdays: [0, 1, 2, 3, 4],
    defaultMonthlyFee: 15000, bookingLink: 'https://calendly.com/ethanjrcross/20-minute-fit-call',
    handle: '@ethanjrcross', landing: 'board', keepAwake: true, showRunway: false,
    savingsNow: 0, savingsUpdatedAt: null, runway: null, runwayUpdatedAt: null, lastBackupAt: null
  });
  let serial = 0;
  function id() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') return globalThis.crypto.randomUUID();
    return Date.now().toString(36) + '-' + (++serial).toString(36) + '-' + Math.random().toString(36).slice(2);
  }
  function record(fields, date = new Date()) {
    const ts = date.toISOString();
    return { id: id(), createdAt: ts, updatedAt: ts, deleted: false, ...fields };
  }
  function lead(fields, date) {
    return record({
      company: '', owner: '', city: '', phone: '', phoneNorm: '', phone2: '', address: '',
      website: '', category: '', rating: '', reviews: '', batch: '', status: 'new', deadReason: '',
      attempts: 0, lastOutcome: null, lastAttemptAt: null, nextEligibleAt: null,
      callbackAt: null, callbackOwner: false, note: '', skipUntil: null, sample: false, ...fields
    }, date);
  }
  const pad = n => String(n).padStart(2, '0');
  const day = date => [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
  const dow = date => (date.getDay() + 6) % 7;
  const dateOf = key => new Date(key + 'T00:00:00');
  const localInput = date => day(date) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  function addDays(date, count) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + count);
    return copy;
  }
  function at(date, hour, minute = 0) {
    const copy = new Date(date);
    copy.setHours(hour, minute, 0, 0);
    return copy;
  }
  const dayDistance = (a, b) => (Date.parse(b) - Date.parse(a)) / DAY;
  const isWorkday = (date, settings = DEFAULTS) => settings.workdays.includes(dow(date));
  function nextWorkdayAt(from, hour, minute, settings = DEFAULTS) {
    for (let i = 0; i <= 7; i++) {
      const candidate = at(addDays(from, i), hour, minute);
      if (candidate > from && isWorkday(candidate, settings)) return candidate;
    }
    throw new Error('Select at least one working day.');
  }
  const weekStart = date => at(addDays(date, -dow(date)), 0);
  const skip = (item, now = new Date()) => ({
    ...item, skipUntil: new Date(+now + 3 * HOUR).toISOString(), updatedAt: now.toISOString()
  });

  function parseCSV(input) {
    const source = String(input).replace(/^\uFEFF/, '');
    const counts = { ',': 0, ';': 0, '\t': 0 };
    let quoted = false;
    let headerStarted = false;
    for (let i = 0; i < source.length; i++) {
      const char = source[i];
      if (char === '"') quoted = !quoted;
      if (!quoted && (char === '\r' || char === '\n')) {
        if (headerStarted) break;
        continue;
      }
      if (char.trim() || char === '\t') headerStarted = true;
      if (!quoted && owns(counts, char)) counts[char]++;
    }
    const delimiter = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    const lines = [];
    let line = [], field = '', afterQuote = false;
    quoted = false;
    function endField() { line.push(field); field = ''; afterQuote = false; }
    function endLine() { endField(); lines.push(line); line = []; }
    for (let i = 0; i < source.length; i++) {
      const char = source[i];
      if (quoted) {
        if (char !== '"') field += char;
        else if (source[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; afterQuote = true; }
      } else if (char === delimiter) endField();
      else if (char === '\r' || char === '\n') {
        if (char === '\r' && source[i + 1] === '\n') i++;
        endLine();
      } else if (char === '"' && !field && !afterQuote) quoted = true;
      else field += char;
    }
    if (quoted) throw new Error('CSV contains an unclosed quoted field.');
    if (field || line.length || afterQuote) endLine();
    const blank = row => row.length === 1 && !row[0].trim();
    while (lines.length && blank(lines[lines.length - 1])) lines.pop();
    const first = lines.findIndex(row => !blank(row));
    if (first < 0) return { headers: [], rows: [], delimiter };
    const headers = lines[first].map(value => value.trim());
    return { headers, rows: lines.slice(first + 1).map(row => {
      while (row.length < headers.length) row.push('');
      return row;
    }), delimiter };
  }
  function normalizePhone(value) {
    const raw = String(value == null ? '' : value).trim().replace(/^'(?=\+\d)/, '');
    if (!/^[\d\s+().-]+$/.test(raw)) return '';
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('91') && (digits.length === 12 || (raw.startsWith('+') && digits.length === 13))) {
      digits = digits.slice(2);
    }
    if (digits.startsWith('0')) digits = digits.slice(1);
    return /^[1-9]\d{9}$/.test(digits) ? digits : '';
  }
  function displayPhone(norm) {
    if (!norm) return '';
    return /^[6-9]/.test(norm) ? '+91 ' + norm.slice(0, 5) + ' ' + norm.slice(5)
      : '+91 ' + norm.slice(0, 3) + ' ' + norm.slice(3, 6) + ' ' + norm.slice(6);
  }
  function phones(value) {
    const matches = [...new Set(String(value || '').split(/[/,;|\r\n]+/).map(normalizePhone).filter(Boolean))];
    return { phoneNorm: matches[0] || '', phone: displayPhone(matches[0]), phone2: displayPhone(matches[1]) };
  }
  const HEADERS = {
    company: ['name', 'title', 'business name', 'company', 'company name'],
    phone: ['phone', 'phone_1', 'phone number', 'phoneunformatted', 'mobile', 'contact', 'tel'],
    city: ['city', 'locality', 'town', 'district'], address: ['address', 'full_address', 'street'],
    website: ['website', 'site', 'url', 'domain'], category: ['category', 'categoryname', 'type'],
    rating: ['rating', 'totalscore', 'stars'], reviews: ['reviews', 'reviewscount', 'reviews_count']
  };
  function mapHeaders(headers) {
    const clean = headers.map(name => name.trim().toLowerCase());
    return Object.fromEntries(Object.entries(HEADERS).map(([key, names]) => [key, clean.findIndex(name => names.includes(name))]));
  }
  const INDIA_STATE = /^(?:andhra pradesh|arunachal pradesh|assam|bihar|chhattisgarh|delhi|goa|gujarat|haryana|himachal pradesh|jammu and kashmir|jharkhand|karnataka|kerala|ladakh|madhya pradesh|maharashtra|manipur|meghalaya|mizoram|nagaland|odisha|orissa|punjab|rajasthan|sikkim|tamil nadu|telangana|tripura|uttar pradesh|uttarakhand|west bengal|puducherry|chandigarh|andaman and nicobar islands|lakshadweep|dadra and nagar haveli|daman and diu|india)(?:\s|$)/i;
  function inferCity(address) {
    const parts = address.split(',').map(part => part.trim()).filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      if (INDIA_STATE.test(part)) continue;
      const withoutPin = part.replace(/\s*-?\s*\b\d{6}\b\s*$/, '').trim();
      if ((i < parts.length - 1 || withoutPin !== part || /^\d{6}$/.test(part)) &&
          withoutPin && !/\d/.test(withoutPin)) return withoutPin;
    }
    return '';
  }
  function mappedRow(row, mapping, defaultCity = '') {
    const mapped = Object.fromEntries(Object.keys(HEADERS).map(key => [key, String(row[mapping[key]] || '').trim()]));
    if (!mapped.city) mapped.city = (mapping.city < 0 ? inferCity(mapped.address) : '') || defaultCity.trim();
    return mapped;
  }
  function planImport(parsed, mapping, existing, options, now = new Date()) {
    const known = new Set();
    for (const item of existing) {
      if (item.deleted) continue;
      if (item.phoneNorm) known.add(item.phoneNorm);
      const second = normalizePhone(item.phone2);
      if (second) known.add(second);
    }
    const result = { leads: [], skipped: [], duplicates: 0, invalid: 0, filtered: 0 };
    const query = options.filter.trim().toLowerCase();
    const batchId = id();
    for (const [index, row] of parsed.rows.entries()) {
      const mapped = mappedRow(row, mapping, options.city);
      const numbers = phones(mapped.phone);
      const second = normalizePhone(numbers.phone2);
      let reason;
      if (query && !mapped.company.toLowerCase().includes(query) && !mapped.category.toLowerCase().includes(query)) reason = 'filtered';
      else if (!numbers.phoneNorm && options.skipInvalid) reason = 'invalid';
      else if (options.skipDuplicates && ((numbers.phoneNorm && known.has(numbers.phoneNorm)) || (second && known.has(second)))) reason = 'duplicates';
      if (reason) {
        result[reason]++;
        result.skipped.push([...parsed.headers.map((_, col) => row[col] || ''), reason]);
        continue;
      }
      if (numbers.phoneNorm) known.add(numbers.phoneNorm);
      if (second) known.add(second);
      result.leads.push(lead({
        ...mapped, ...numbers, phone: numbers.phone || mapped.phone, batch: options.batch, batchId, rowOrder: index
      }, now));
    }
    return result;
  }
  function csv(rows) {
    return '\uFEFF' + rows.map(row => row.map(value => {
      let cell = value == null ? '' : String(value);
      if (/^[\s\uFEFF]*[=+\-@]/.test(cell)) cell = "'" + cell;
      return '"' + cell.replace(/"/g, '""') + '"';
    }).join(',')).join('\r\n');
  }

  function applyOutcome(item, outcome, data = {}, now = new Date(), settings = DEFAULTS) {
    if (!owns(OUTCOMES, outcome)) throw new Error('Unknown outcome.');
    const ts = now.toISOString();
    const updated = {
      ...item, status: outcome, attempts: (item.attempts || 0) + 1, lastOutcome: outcome,
      lastAttemptAt: ts, updatedAt: ts, nextEligibleAt: null, callbackAt: null,
      callbackOwner: false, skipUntil: null, deadReason: ''
    };
    let meeting;
    if (outcome === 'no_answer') {
      if (updated.attempts >= settings.maxAttempts) {
        updated.status = 'dead';
        updated.deadReason = 'unreachable after ' + updated.attempts + ' attempts';
      } else {
        const delayed = new Date(+now + settings.retryDelayHours * HOUR);
        updated.nextEligibleAt = (isWorkday(delayed, settings) && delayed <= at(delayed, 18)
          ? delayed : nextWorkdayAt(now, 11, 0, settings)).toISOString();
      }
    }
    if (outcome === 'gatekeeper') updated.nextEligibleAt = nextWorkdayAt(now, 11, 0, settings).toISOString();
    if (outcome === 'owner_spoke') updated.nextEligibleAt = addDays(now, settings.ownerCooldownDays).toISOString();
    if (outcome === 'callback') {
      const date = new Date(data.callbackAt);
      if (!data.callbackAt || !Number.isFinite(+date) || date <= now) throw new Error('Choose a callback time in the future.');
      updated.callbackAt = updated.nextEligibleAt = date.toISOString();
      updated.callbackOwner = Boolean(data.callbackOwner);
      if (data.note) updated.note = data.note;
    }
    if (outcome === 'meeting_booked') {
      const date = new Date(data.meetingAt);
      if (!data.meetingAt || !Number.isFinite(+date) || date <= now) throw new Error('Choose a meeting time in the future.');
      updated.status = 'meeting';
      updated.owner = data.owner == null ? item.owner : data.owner.trim();
      meeting = record({
        leadId: item.id, company: item.company, owner: updated.owner,
        contactPhone: data.contactPhone || item.phone, email: data.email || '', meetingAt: date.toISOString(),
        stage: 'booked', stageHistory: [{ stage: 'booked', ts }], lostReason: '', note: data.note || ''
      }, now);
    }
    if (outcome === 'dead' && data.deadReason) updated.deadReason = data.deadReason;
    const log = record({
      leadId: item.id, outcome, ts, day: day(now), hour: now.getHours(), dow: dow(now),
      spokeToOwner: outcome === 'owner_spoke' || outcome === 'meeting_booked' || updated.callbackOwner,
      prevLead: { ...item }, undone: false, callbackAt: updated.callbackAt, note: data.note || item.note || '',
      ...(meeting ? { meetingId: meeting.id } : {})
    }, now);
    return { lead: updated, log, meeting };
  }
  function undoOutcome(log, meeting, now = new Date()) {
    const ts = now.toISOString();
    return {
      lead: { ...log.prevLead }, log: { ...log, undone: true, updatedAt: ts },
      meeting: meeting ? { ...meeting, deleted: true, updatedAt: ts } : undefined
    };
  }
  function callbackPresets(now, settings) {
    const tomorrow = nextWorkdayAt(at(addDays(now, 1), 0), 11, 0, settings);
    return [isWorkday(now, settings) && at(now, 16) > now ? at(now, 16) : null, tomorrow, nextWorkdayAt(tomorrow, 11, 0, settings),
      nextWorkdayAt(at(addDays(now, 7), 0), 11, 0, settings),
      nextWorkdayAt(at(addDays(now, 42), 0), 11, 0, settings)];
  }
  const isQueued = item => !item.deleted && STATUSES.slice(0, 5).includes(item.status);
  const readyAt = item => Math.max(Date.parse(item.nextEligibleAt) || 0, Date.parse(item.skipUntil) || 0,
    item.status === 'callback' ? Date.parse(item.callbackAt) || 0 : 0);
  const groupOf = item => item.status === 'callback' ? 0 : item.status === 'new' ? 2 : 1;
  class Heap {
    constructor(compare) { this.items = []; this.compare = compare; }
    peek() { return this.items[0]; }
    push(value) {
      const items = this.items;
      let i = items.length;
      items.push(value);
      while (i > 0) {
        const parent = (i - 1) >> 1;
        if (this.compare(items[parent], value) <= 0) break;
        items[i] = items[parent];
        i = parent;
      }
      items[i] = value;
    }
    pop() {
      const items = this.items;
      const first = items[0], last = items.pop();
      if (items.length) {
        let i = 0;
        while (i * 2 + 1 < items.length) {
          let child = i * 2 + 1;
          if (child + 1 < items.length && this.compare(items[child + 1], items[child]) < 0) child++;
          if (this.compare(last, items[child]) <= 0) break;
          items[i] = items[child];
          i = child;
        }
        items[i] = last;
      }
      return first;
    }
  }
  class Queue {
    constructor(leads, now = new Date()) {
      this.leads = leads;
      this.rebuild(+now);
    }
    rebuild(now) {
      this.clock = now;
      this.ready = Array.from({ length: 3 }, () => new Heap((a, b) =>
        a.order - b.order || a.item.createdAt.localeCompare(b.item.createdAt) ||
        (a.item.batchId || '').localeCompare(b.item.batchId || '') ||
        (a.item.rowOrder || 0) - (b.item.rowOrder || 0)));
      this.future = new Heap((a, b) => a.at - b.at);
      for (const item of this.leads.values()) this.update(item);
    }
    update(item) {
      if (!isQueued(item)) return;
      const group = groupOf(item);
      const entry = { item, group, at: readyAt(item), order: group === 2 ? item.batchOrder || Date.parse(item.createdAt) || 0
        : Date.parse(group === 0 ? item.callbackAt : item.nextEligibleAt) || 0 };
      if (entry.at > this.clock) this.future.push(entry);
      else this.ready[group].push(entry);
    }
    advance(now) {
      if (+now < this.clock) this.rebuild(+now);
      this.clock = +now;
      while (this.future.peek() && this.future.peek().at <= this.clock) {
        const entry = this.future.pop();
        if (this.leads.get(entry.item.id) === entry.item) this.ready[entry.group].push(entry);
      }
    }
    next(now, settings = DEFAULTS) {
      this.advance(now);
      for (const index of settings.callbacksFirst ? [0, 1, 2] : [0, 2, 1]) {
        const heap = this.ready[index];
        while (heap.peek() && this.leads.get(heap.peek().item.id) !== heap.peek().item) heap.pop();
        if (heap.peek()) return heap.peek().item;
      }
      return null;
    }
  }

  const zero = () => ({ dials: 0, answered: 0, owners: 0, meetings: 0 });
  const live = log => !log.deleted && !log.undone;
  function tally(counts, log, change = 1) {
    if (!live(log)) return counts;
    counts.dials += change;
    if (['gatekeeper', 'owner_spoke', 'callback', 'meeting_booked'].includes(log.outcome)) counts.answered += change;
    if (log.spokeToOwner) counts.owners += change;
    if (log.outcome === 'meeting_booked') counts.meetings += change;
    return counts;
  }
  function aggregate(logs) {
    const counts = new Map();
    for (const log of logs) {
      if (!live(log)) continue;
      if (!counts.has(log.day)) counts.set(log.day, zero());
      tally(counts.get(log.day), log);
    }
    return counts;
  }
  const dayDials = (counts, key) => (counts.get(key) || zero()).dials;
  function streak(counts, daysOff, today, settings = DEFAULTS, dayComplete = false) {
    const off = new Set([...daysOff].filter(row => !row.deleted).map(row => row.day));
    const currentDay = day(today);
    const active = [...counts.keys()].filter(key => key <= currentDay && dayDials(counts, key) >= settings.floor).sort();
    let best = 0, run = 0, previous;
    function nextActive(date) {
      let next = addDays(date, 1);
      while (!isWorkday(next, settings) || off.has(day(next))) next = addDays(next, 1);
      return next;
    }
    for (const key of active) {
      const date = dateOf(key);
      if (!isWorkday(date, settings) || off.has(key)) continue;
      run = previous && day(nextActive(previous)) === key ? run + 1 : 1;
      previous = date;
      best = Math.max(run, best);
    }
    const current = previous && nextActive(previous) >= at(addDays(today, dayComplete ? 1 : 0), 0) ? run : 0;
    return { current, best, daysOff: [...off].filter(key => key <= currentDay && key.slice(0, 7) === currentDay.slice(0, 7)).length };
  }
  const ratio = (a, b) => b ? a / b : null;
  function funnel(counts, clients, week) {
    const start = day(week), end = day(addDays(week, 7));
    const total = zero();
    for (const [key, value] of counts) {
      if (key < start || key >= end) continue;
      for (const field of Object.keys(total)) total[field] += value[field];
    }
    let closes = 0;
    for (const client of clients) {
      const key = client.wonDay || (client.wonAt ? day(new Date(client.wonAt)) : '');
      if (!client.deleted && key >= start && key < end) closes++;
    }
    return { ...total, closes, rates: [ratio(total.owners, total.dials), ratio(total.meetings, total.owners), ratio(closes, total.meetings)] };
  }
  function pace(actual, target, today, daysOff, todayActual, dailyTarget, settings = DEFAULTS) {
    const off = new Set([...daysOff].filter(row => !row.deleted).map(row => row.day));
    const monday = weekStart(today);
    let completed = 0;
    for (let i = 0; i < dow(today); i++) {
      const date = addDays(monday, i);
      if (isWorkday(date, settings) && !off.has(day(date))) completed++;
    }
    const expected = target / 5 * completed;
    const delta = actual - expected;
    const elapsed = Math.min(1, Math.max(0, (+today - +at(today, 8)) / (12 * HOUR)));
    const onPace = !isWorkday(today, settings) || off.has(day(today)) || todayActual >= dailyTarget * elapsed;
    return { expected, delta, completed, status: delta >= 0 && onPace ? 'Ahead' : actual >= expected * .9 ? 'On pace' : 'Behind' };
  }
  function tiers(value, levels, deadline, today) {
    const hit = levels.reduce((result, level, index) => value >= level ? index : result, -1);
    const next = levels[hit + 1] ?? null;
    return { status: ['Below floor', 'Floor hit', 'Target hit', 'Stretch hit'][hit + 1],
      next, remaining: next == null ? 0 : Math.max(0, next - value),
      days: Math.max(0, dayDistance(day(today), deadline)) };
  }
  function heatmap(logs) {
    const cells = Array.from({ length: 12 }, () => Array.from({ length: 5 }, zero));
    const hours = Array.from({ length: 12 }, zero);
    let total = 0;
    for (const log of logs) {
      if (!live(log)) continue;
      total++;
      if (log.dow < 0 || log.dow > 4 || log.hour < 8 || log.hour > 19) continue;
      tally(cells[log.hour - 8][log.dow], log);
      tally(hours[log.hour - 8], log);
    }
    let best = null;
    if (total >= 150) {
      for (let i = 0; i <= 9; i++) {
        const window = hours.slice(i, i + 3);
        const dials = window.reduce((sum, cell) => sum + cell.dials, 0);
        const owners = window.reduce((sum, cell) => sum + cell.owners, 0);
        const rate = ratio(owners, dials);
        if (dials >= 30 && (!best || rate > best.rate || (rate === best.rate && dials > best.dials))) {
          best = { from: i + 8, to: i + 11, dials, rate };
        }
      }
    }
    return { cells, hours, total, best };
  }
  function weightStats(weights, today) {
    const rows = [...weights].filter(row => !row.deleted && row.date <= day(today)).sort((a, b) => a.date.localeCompare(b.date));
    function avg(from, to) {
      const values = rows.filter(row => row.date >= day(addDays(today, from)) && row.date <= day(addDays(today, to)));
      return ratio(values.reduce((sum, row) => sum + row.kg, 0), values.length);
    }
    const average = avg(-6, 0), earlier = avg(-13, -7);
    return { average, change: average == null || earlier == null ? null : average - earlier,
      points: rows.filter(row => row.date >= day(addDays(today, -29))) };
  }
  const PLACEHOLDERS = { company: 'company', owner: 'owner name', city: 'city', phone: 'phone',
    booking_link: 'booking link', meeting_time: 'meeting time' };
  function templateParts(body, values) {
    return String(body).split(/(\{(?:company|owner|city|phone|booking_link|meeting_time)\})/g).map(value => {
      const key = value.slice(1, -1);
      const token = value.startsWith('{') && owns(PLACEHOLDERS, key);
      const missing = token && !values[key];
      return { text: token ? (values[key] || '[' + PLACEHOLDERS[key] + ']') : value, missing };
    });
  }
  const template = (body, values) => templateParts(body, values).map(part => part.text).join('');
  function isDateKey(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  }
  const iso = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
  const optionalISO = value => value == null || iso(value);
  const strings = (row, names) => names.every(name => typeof row[name] === 'string');
  const integer = (value, min, max = Infinity) => Number.isInteger(value) && value >= min && value <= max;
  const baseRecord = row => row && typeof row === 'object' && typeof row.id === 'string' &&
    row.id.length > 0 && iso(row.createdAt) && iso(row.updatedAt) && typeof row.deleted === 'boolean';
  const validLead = row => baseRecord(row) && STATUSES.includes(row.status) &&
    strings(row, ['company', 'owner', 'city', 'phone', 'phoneNorm', 'phone2', 'address', 'website', 'category', 'batch', 'note', 'deadReason']) &&
    [row.rating, row.reviews].every(value => typeof value === 'string' || Number.isFinite(value)) &&
    /^(?:[1-9]\d{9})?$/.test(row.phoneNorm) && integer(row.attempts, 0) &&
    (row.batchOrder == null || integer(row.batchOrder, 0)) && (row.rowOrder == null || integer(row.rowOrder, 0)) &&
    (row.lastOutcome == null || owns(OUTCOMES, row.lastOutcome)) &&
    ['lastAttemptAt', 'nextEligibleAt', 'callbackAt', 'skipUntil'].every(key => optionalISO(row[key])) &&
    typeof row.callbackOwner === 'boolean' && typeof row.sample === 'boolean';
  const levelsValid = values => Array.isArray(values) && values.length === 3 &&
    values.every((value, i) => integer(value, 1) && (i === 0 || value > values[i - 1]));
  function validSettings(row) {
    return row.id === 'settings' && !row.deleted && integer(row.floor, 1) && integer(row.target, row.floor) &&
      ['weeklyDials', 'weeklyMeetings', 'maxAttempts', 'ownerCooldownDays', 'savingsGoal'].every(key => integer(row[key], 1)) &&
      Number.isFinite(row.retryDelayHours) && row.retryDelayHours > 0 &&
      Number.isFinite(row.weightGoal) && row.weightGoal > 0 &&
      ['defaultMonthlyFee', 'savingsNow', 'runway'].every(key => row[key] == null || (Number.isFinite(row[key]) && row[key] >= 0)) &&
      levelsValid(row.clientTiers) && levelsValid(row.mrrTiers) && isDateKey(row.clientDeadline) && isDateKey(row.mrrDeadline) &&
      Array.isArray(row.workdays) && row.workdays.length > 0 && row.workdays.every(value => integer(value, 0, 6)) &&
      strings(row, ['bookingLink', 'handle', 'landing']) &&
      (row.handle === '' || /^@(?=[\w.]{1,39}$)[\w.]*[a-z][\w.]*$/i.test(row.handle)) &&
      ['callbacksFirst', 'keepAwake', 'showRunway'].every(key => typeof row[key] === 'boolean') &&
      ['lastBackupAt', 'savingsUpdatedAt', 'runwayUpdatedAt'].every(key => optionalISO(row[key]));
  }
  const validators = {
    leads: validLead,
    logs: row => typeof row.leadId === 'string' && owns(OUTCOMES, row.outcome) &&
      iso(row.ts) && isDateKey(row.day) && integer(row.hour, 0, 23) && integer(row.dow, 0, 6) &&
      typeof row.undone === 'boolean' && typeof row.spokeToOwner === 'boolean' && validLead(row.prevLead) &&
      row.prevLead.id === row.leadId && optionalISO(row.callbackAt) && typeof row.note === 'string' &&
      (row.meetingId == null || typeof row.meetingId === 'string'),
    meetings: row => strings(row, ['leadId', 'company', 'owner', 'contactPhone', 'email', 'lostReason', 'note']) &&
      STAGES.includes(row.stage) && iso(row.meetingAt) && Array.isArray(row.stageHistory) &&
      row.stageHistory.every(entry => entry && STAGES.includes(entry.stage) && iso(entry.ts)),
    clients: row => strings(row, ['name', 'leadId']) && Number.isFinite(row.monthlyInr) && row.monthlyInr >= 0 &&
      isDateKey(row.startDate) && ['active', 'churned'].includes(row.status) && iso(row.wonAt),
    weights: row => isDateKey(row.date) && Number.isFinite(row.kg) && row.kg > 0 && Number.isInteger(row.kg * 10),
    daysOff: row => isDateKey(row.day) && ['rest', 'holiday', 'sick', 'other'].includes(row.reason),
    scripts: row => strings(row, ['group', 'title', 'body', 'note']) && Number.isFinite(row.order) &&
      typeof row.custom === 'boolean' && typeof row.isDefaultEdited === 'boolean',
    settings: validSettings
  };
  function validateBackup(backup) {
    if (!backup || typeof backup !== 'object' || !Number.isInteger(backup.schemaVersion)) throw new Error('Invalid backup format.');
    if (backup.schemaVersion > VERSION) throw new Error('This backup uses a newer schema version. Update Dial Console first.');
    if (backup.schemaVersion !== VERSION || !iso(backup.exportedAt)) throw new Error('Unsupported or malformed backup.');
    for (const store of STORES) {
      const rows = backup[store], seen = new Set();
      if (!Array.isArray(rows)) throw new Error('Invalid backup store: ' + store + '.');
      for (const row of rows) {
        if (!baseRecord(row) || seen.has(row.id) || !validators[store](row)) throw new Error('Invalid record in ' + store + '.');
        seen.add(row.id);
      }
    }
    if (backup.settings.length !== 1) throw new Error('Backup must contain one settings record.');
    return backup;
  }
  function merge(current, incoming, mode = 'merge') {
    validateBackup(incoming);
    if (mode !== 'merge' && mode !== 'replace') throw new Error('Choose Merge or Replace.');
    const summary = { updated: 0, removed: 0 }, result = {};
    for (const store of STORES) {
      const present = new Map(current[store].map(row => [row.id, row]));
      const next = mode === 'merge' ? new Map(present) : new Map();
      summary[store] = 0;
      for (const row of incoming[store]) {
        const before = present.get(row.id);
        let winner = before;
        if (!before) { winner = row; summary[store]++; }
        else if (mode === 'replace') winner = row;
        else if (store === 'logs') {
          if (row.undone && !before.undone) winner = { ...before, undone: true, updatedAt: row.updatedAt };
          if (row.deleted && !winner.deleted) winner = { ...winner, deleted: true };
        } else if (+new Date(row.updatedAt) > +new Date(before.updatedAt) ||
            (store === 'settings' && row.updatedAt === before.updatedAt && (row.lastBackupAt || '') > (before.lastBackupAt || ''))) winner = row;
        next.set(row.id, winner);
      }
      if (mode === 'replace') summary.removed += present.size - [...present.keys()].filter(key => next.has(key)).length;
      result[store] = [...next.values()];
    }
    if (mode === 'merge') {
      const undoneMeetings = new Set();
      const undoneLeads = new Map();
      for (const log of result.logs) {
        if (!log.undone) continue;
        if (log.meetingId) undoneMeetings.add(log.meetingId);
        const matching = undoneLeads.get(log.leadId) || new Map();
        const key = log.ts + log.outcome;
        if (!matching.has(key) || log.updatedAt > matching.get(key).updatedAt) matching.set(key, log);
        undoneLeads.set(log.leadId, matching);
      }
      result.leads = result.leads.map(item => {
        const undone = undoneLeads.get(item.id);
        if (item.deleted || !undone) return item;
        const seen = new Set();
        let restored = item;
        for (let key = restored.lastAttemptAt + restored.lastOutcome; undone.has(key) && !seen.has(key);
            key = restored.lastAttemptAt + restored.lastOutcome) {
          const log = undone.get(key);
          if (restored.updatedAt > log.updatedAt && restored.updatedAt !== log.ts) break;
          seen.add(key);
          restored = log.prevLead;
        }
        return restored;
      });
      result.meetings = result.meetings.map(item => undoneMeetings.has(item.id) && !item.deleted ? { ...item, deleted: true } : item);
      result.clients = result.clients.map(item => undoneMeetings.has(item.meetingId) && !item.deleted ? { ...item, deleted: true } : item);
    }
    for (const store of STORES) {
      const before = new Map(current[store].map(item => [item.id, item]));
      for (const item of result[store]) {
        const previous = before.get(item.id);
        if (previous && item !== previous && JSON.stringify(item) !== JSON.stringify(previous)) summary.updated++;
      }
    }
    return { result, summary };
  }
  return {
    VERSION, STORES, OUTCOMES, STATUSES, STAGES, REASONS, DEFAULTS, HOUR, DAY, HEADERS,
    id, record, lead, day, dow, dateOf, localInput, addDays, at, dayDistance, isWorkday, nextWorkdayAt,
    weekStart, skip, parseCSV, normalizePhone, displayPhone, phones, mapHeaders, inferCity, mappedRow,
    planImport, csv, applyOutcome, undoOutcome, callbackPresets, isQueued, readyAt, Queue,
    zero, live, tally, aggregate, streak, ratio, funnel, pace, tiers, heatmap, weightStats,
    templateParts, template, validateBackup, merge, isDateKey, validSettings
  };
});
