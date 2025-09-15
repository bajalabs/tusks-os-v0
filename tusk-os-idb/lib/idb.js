(function(){
  const DB_NAME = 'tusk-idb';
  const DB_VERSION = 1;
  const SETTINGS_KEY = 'settings';

  function openDB(){
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (ev) => {
        const db = ev.target.result;
        if (!db.objectStoreNames.contains('leads')) {
          const s = db.createObjectStore('leads', { keyPath: 'id', autoIncrement: true });
          s.createIndex('by_created', 'created_at', { unique: false });
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function withStore(mode, fn){
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['leads','meta'], mode);
      const storeMap = {
        leads: tx.objectStore('leads'),
        meta: tx.objectStore('meta'),
      };
      const done = (v) => { try{ db.close(); }catch{} resolve(v); };
      const fail = (e) => { try{ db.close(); }catch{} reject(e); };
      tx.oncomplete = () => {};
      tx.onerror = () => fail(tx.error);
      Promise.resolve(fn(storeMap, tx)).then(done, fail);
    });
  }

  function nowSql(){
    return new Date().toISOString().replace('T',' ').replace('Z','');
  }

  const TuskIDB = {
    async ready(){ await openDB(); },

    // Settings
    async getSettings(){
      return withStore('readonly', ({meta}) => new Promise((res, rej) => {
        const r = meta.get(SETTINGS_KEY);
        r.onsuccess = () => res(r.result || {});
        r.onerror = () => rej(r.error);
      }));
    },
    async saveSettings(obj){
      return withStore('readwrite', ({meta}) => new Promise((res, rej) => {
        const r = meta.put(obj || {}, SETTINGS_KEY);
        r.onsuccess = () => res(true);
        r.onerror = () => rej(r.error);
      }));
    },

    // Leads
    async addLead({name, email}){
      const rec = { name, email: email||null, status: 'new', created_at: nowSql() };
      return withStore('readwrite', ({leads}) => new Promise((res, rej) => {
        const r = leads.add(rec);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      }));
    },
    async listLeads(limit=500){
      return withStore('readonly', ({leads}) => new Promise((res, rej) => {
        const idx = leads.index('by_created');
        const dir = 'prev'; // newest first
        const req = idx.openCursor(null, dir);
        const out = [];
        req.onsuccess = () => {
          const cur = req.result;
          if (!cur || out.length >= limit) return res(out);
          out.push(cur.value);
          cur.continue();
        };
        req.onerror = () => rej(req.error);
      }));
    },

    // Export full JSON dump
    async exportJSON(){
      const all = { meta: {}, leads: [] };
      const settings = await this.getSettings();
      all.meta.settings = settings;
      const leads = await this.listLeads(1000000);
      all.leads = leads;
      const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
      return blob;
    },

    // CSV export (leads only)
    async exportCSV(){
      const rows = await this.listLeads(1000000);
      const escape = (v) => {
        if (v == null) return '';
        const s = String(v);
        if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      };
      const header = 'id,name,email,status,created_at';
      const csv = [header].concat(rows.map(r => [r.id, r.name, r.email||'', r.status||'new', r.created_at||''].map(escape).join(','))).join('\n');
      return new Blob([csv], { type: 'text/csv' });
    },
  };

  window.TuskIDB = TuskIDB;
})();
