(function (root) {
  'use strict';
  const L = root.DC;
  const NAME = 'dial-console';
  const LOCAL = 'dial-console-v1';
  const JOURNAL = LOCAL + ':pending:';
  const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
  const empty = () => Object.fromEntries(L.STORES.map(store => [store, []]));

  function openIDB() {
    return new Promise((resolve, reject) => {
      const request = root.indexedDB.open(NAME, L.VERSION);
      request.onupgradeneeded = () => {
        for (const name of L.STORES) {
          if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Close the other Dial Console tab, then reload.'));
    });
  }
  function finished(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onabort = () => reject(transaction.error || new Error('Storage transaction aborted.'));
    });
  }
  function applyRows(base, changes) {
    const result = { ...base };
    for (const [store, rows] of Object.entries(changes)) {
      const map = new Map((base[store] || []).map(row => [row.id, row]));
      for (const row of rows) map.set(row.id, row);
      result[store] = [...map.values()];
    }
    return result;
  }
  class Storage {
    constructor(hooks = {}) {
      this.hooks = hooks;
      this.tail = null;
      this.dirty = {};
      this.journalKeys = new Set();
      this.unprotected = 0;
      this.sequence = 0;
    }
    inform(type, detail) {
      if (this.hooks[type]) this.hooks[type](detail);
    }
    async open() {
      let local;
      let localError;
      try {
        const raw = root.localStorage.getItem(LOCAL);
        if (raw) {
          local = JSON.parse(raw);
          if (!L.STORES.every(store => Array.isArray(local[store]))) throw new Error('The fallback store is malformed.');
        }
      } catch (error) { local = undefined; localError = error; }
      try {
        this.db = await openIDB();
      } catch (error) {
        if (['VersionError'].includes(error.name) || /other Dial Console tab/.test(error.message)) throw error;
        this.inform('fallback', localError
          ? 'IndexedDB is unavailable. Local storage could not be read. Export any changes before closing.'
          : 'IndexedDB is unavailable. Using localStorage. Export backups frequently.');
        this.local = local || empty();
        this.localReadFailed = Boolean(localError);
        return this.local;
      }
      this.db.onversionchange = () => {
        this.db.close();
        this.inform('failed', new Error('Storage was updated in another tab. Reload Dial Console.'));
      };
      const transaction = this.db.transaction(L.STORES, 'readonly');
      const data = {};
      for (const store of L.STORES) {
        const request = transaction.objectStore(store).getAll();
        request.onsuccess = () => { data[store] = request.result; };
      }
      await finished(transaction);
      if (local && !data.settings.length) {
        await this.write(local, true);
        try { root.localStorage.removeItem(LOCAL); } catch (_) { /* The IDB copy is durable. */ }
        return this.recover(local);
      }
      if (local && data.settings.length) this.inform('fallback',
        'IndexedDB is available again. A separate localStorage copy exists. Open with IndexedDB disabled and export that copy to merge it.');
      return this.recover(data);
    }
    putJournal(changes) {
      const key = JOURNAL + L.id();
      try {
        root.localStorage.setItem(key, JSON.stringify({
          order: performance.timeOrigin + performance.now(), sequence: this.sequence++, changes
        }));
        return key;
      } catch (_) { return null; }
    }
    removeJournal() {
      for (const key of this.journalKeys) {
        try { root.localStorage.removeItem(key); } catch (_) { /* The committed copy remains durable. */ }
      }
      this.journalKeys.clear();
    }
    async recover(data) {
      const entries = [];
      try {
        const local = root.localStorage;
        for (let i = 0; i < local.length; i++) {
          const key = local.key(i);
          if (!key || !key.startsWith(JOURNAL)) continue;
          const entry = JSON.parse(local.getItem(key));
          if (entry && Number.isFinite(entry.order) && entry.changes &&
              Object.entries(entry.changes).every(([name, rows]) => L.STORES.includes(name) &&
                Array.isArray(rows) && rows.every(row => row && typeof row.id === 'string'))) entries.push({ key, ...entry });
        }
      } catch (_) { /* Storage can be restricted independently of IndexedDB. */ }
      if (!entries.length) return data;
      entries.sort((a, b) => a.order - b.order || a.sequence - b.sequence);
      let changes = {};
      for (const entry of entries) {
        this.journalKeys.add(entry.key);
        changes = applyRows(changes, entry.changes);
      }
      await this.save(changes, false, false);
      return applyRows(data, changes);
    }
    async write(changes, replace) {
      if (!this.db) {
        if (this.localReadFailed) throw new Error('Local storage is unavailable or could not be read.');
        // Read again to preserve unrelated records saved by another tab since opening.
        const raw = replace ? null : root.localStorage.getItem(LOCAL);
        const next = replace ? changes : applyRows(raw ? JSON.parse(raw) : this.local, changes);
        root.localStorage.setItem(LOCAL, JSON.stringify(next));
        this.local = next;
        return;
      }
      const stores = replace ? L.STORES : Object.keys(changes);
      if (!stores.length) return;
      let transaction;
      try { transaction = this.db.transaction(stores, 'readwrite', { durability: 'strict' }); }
      catch (error) {
        if (!(error instanceof TypeError)) throw error;
        transaction = this.db.transaction(stores, 'readwrite');
      }
      const done = finished(transaction);
      try {
        for (const name of stores) {
          const store = transaction.objectStore(name);
          if (replace) store.clear();
          for (const row of changes[name] || []) store.put(row);
        }
        if (typeof transaction.commit === 'function') transaction.commit();
      } catch (error) {
        try { transaction.abort(); } catch (_) { /* Already inactive. */ }
        await done.catch(() => {});
        throw error;
      }
      await done;
    }
    async save(changes, replace, strict, journalKey) {
      if (journalKey) this.journalKeys.add(journalKey);
      const batch = replace ? changes : applyRows(this.dirty, changes);
      let failure;
      for (const wait of [0, 80, 200, 500]) {
        if (wait) await pause(wait);
        try {
          await this.write(batch, replace);
          this.dirty = {};
          this.removeJournal();
          this.inform('saved', new Date());
          return true;
        } catch (error) { failure = error; }
      }
      if (!strict) this.dirty = batch;
      this.inform('failed', failure);
      return false;
    }
    commit(changes, { replace = false, strict = false } = {}) {
      const journalKey = this.db && !replace && !strict ? this.putJournal(changes) : null;
      if (!journalKey) this.unprotected++;
      const run = () => this.save(changes, replace, strict, journalKey);
      const operation = this.tail ? this.tail.then(run, run) : run();
      this.tail = operation;
      const reset = () => {
        if (!journalKey) this.unprotected--;
        if (this.tail === operation) this.tail = null;
      };
      operation.then(reset, reset);
      return operation;
    }
  }
  root.ConsoleStorage = Storage;
})(window);
