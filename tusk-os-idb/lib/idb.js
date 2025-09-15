(function(){
  const DB_NAME = 'tusk-idb';
  const DB_VERSION = 2; // bump for new stores and indexes
  const SETTINGS_KEY = 'settings';

  function openDB(){
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (ev) => {
        const db = ev.target.result;
        // Leads store (extend fields via index additions)
        if (!db.objectStoreNames.contains('leads')) {
          const s = db.createObjectStore('leads', { keyPath: 'id', autoIncrement: true });
          s.createIndex('by_created', 'created_at', { unique: false });
          s.createIndex('by_name', 'name', { unique: false });
          s.createIndex('by_email', 'email', { unique: false });
          s.createIndex('by_company', 'company', { unique: false });
          s.createIndex('by_owner', 'owner', { unique: false });
          s.createIndex('by_stage', 'stage', { unique: false });
        } else {
          const s = ev.currentTarget.transaction.objectStore('leads');
          // Add missing indexes safely
          const addIndex = (name, keyPath) => { try { if (!s.indexNames.contains(name)) s.createIndex(name, keyPath, { unique: false }); } catch(e){} };
          addIndex('by_created', 'created_at');
          addIndex('by_name', 'name');
          addIndex('by_email', 'email');
          addIndex('by_company', 'company');
          addIndex('by_owner', 'owner');
          addIndex('by_stage', 'stage');
        }
        // Meta store for settings
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta');
        }
        // Additional stores: accounts, contacts, deals, activities
        if (!db.objectStoreNames.contains('accounts')) {
          const s = db.createObjectStore('accounts', { keyPath: 'id', autoIncrement: true });
          s.createIndex('by_created', 'created_at', { unique: false });
          s.createIndex('by_name', 'name', { unique: false });
          s.createIndex('by_domain', 'domain', { unique: false });
          s.createIndex('by_owner', 'owner', { unique: false });
        }
        if (!db.objectStoreNames.contains('contacts')) {
          const s = db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });
          s.createIndex('by_created', 'created_at', { unique: false });
          s.createIndex('by_name', 'name', { unique: false });
          s.createIndex('by_email', 'email', { unique: false });
          s.createIndex('by_account', 'account_id', { unique: false });
          s.createIndex('by_owner', 'owner', { unique: false });
        }
        if (!db.objectStoreNames.contains('deals')) {
          const s = db.createObjectStore('deals', { keyPath: 'id', autoIncrement: true });
          s.createIndex('by_created', 'created_at', { unique: false });
          s.createIndex('by_name', 'name', { unique: false });
          s.createIndex('by_stage', 'stage', { unique: false });
          s.createIndex('by_owner', 'owner', { unique: false });
          s.createIndex('by_account', 'account_id', { unique: false });
        }
        if (!db.objectStoreNames.contains('activities')) {
          const s = db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
          s.createIndex('by_created', 'created_at', { unique: false });
          s.createIndex('by_type', 'type', { unique: false });
          s.createIndex('by_owner', 'owner', { unique: false });
          s.createIndex('by_related', 'related', { unique: false }); // e.g., {type:'lead', id:123}
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function withStore(mode, fn){
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const storeNames = Array.from(db.objectStoreNames);
      const tx = db.transaction(storeNames, mode);
      const storeMap = {
        leads: tx.objectStore('leads'),
        meta: tx.objectStore('meta'),
        accounts: storeNames.includes('accounts') ? tx.objectStore('accounts') : null,
        contacts: storeNames.includes('contacts') ? tx.objectStore('contacts') : null,
        deals: storeNames.includes('deals') ? tx.objectStore('deals') : null,
        activities: storeNames.includes('activities') ? tx.objectStore('activities') : null,
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
    async addLead({name, email, phone, company, source, owner, stage, tags, notes}){
      const rec = {
        name,
        email: email||null,
        phone: phone||null,
        company: company||null,
        source: source||null,
        owner: owner||null,
        stage: stage||'New',
        tags: tags||[], // array of strings
        notes: notes||null,
        status: 'new',
        created_at: nowSql(),
      };
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

    // Accounts
    async addAccount({name, domain, phone, owner, notes}){
      const rec = { name, domain: domain||null, phone: phone||null, owner: owner||null, notes: notes||null, created_at: nowSql() };
      return withStore('readwrite', ({accounts}) => new Promise((res, rej) => {
        const r = accounts.add(rec);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      }));
    },
    async listAccounts(limit=500){
      return withStore('readonly', ({accounts}) => new Promise((res, rej) => {
        const idx = accounts.index('by_created');
        const req = idx.openCursor(null, 'prev');
        const out = [];
        req.onsuccess = () => { const cur = req.result; if (!cur || out.length>=limit) return res(out); out.push(cur.value); cur.continue(); };
        req.onerror = () => rej(req.error);
      }));
    },

    // Contacts
    async addContact({name, email, phone, account_id, title, owner, notes}){
      const rec = { name, email: email||null, phone: phone||null, account_id: account_id||null, title: title||null, owner: owner||null, notes: notes||null, created_at: nowSql() };
      return withStore('readwrite', ({contacts}) => new Promise((res, rej) => {
        const r = contacts.add(rec);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      }));
    },
    async listContacts(limit=500){
      return withStore('readonly', ({contacts}) => new Promise((res, rej) => {
        const idx = contacts.index('by_created');
        const req = idx.openCursor(null, 'prev');
        const out = [];
        req.onsuccess = () => { const cur = req.result; if (!cur || out.length>=limit) return res(out); out.push(cur.value); cur.continue(); };
        req.onerror = () => rej(req.error);
      }));
    },

    // Deals
    async addDeal({name, amount, stage, owner, account_id, close_date, notes}){
      const rec = { name, amount: amount==null?null:Number(amount), stage: stage||'New', owner: owner||null, account_id: account_id||null, close_date: close_date||null, notes: notes||null, created_at: nowSql() };
      return withStore('readwrite', ({deals}) => new Promise((res, rej) => {
        const r = deals.add(rec);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      }));
    },
    async listDeals(limit=500){
      return withStore('readonly', ({deals}) => new Promise((res, rej) => {
        const idx = deals.index('by_created');
        const req = idx.openCursor(null, 'prev');
        const out = [];
        req.onsuccess = () => { const cur = req.result; if (!cur || out.length>=limit) return res(out); out.push(cur.value); cur.continue(); };
        req.onerror = () => rej(req.error);
      }));
    },

    // Activities
    async addActivity({type, subject, date, related, owner, notes}){
      // related: { kind: 'lead'|'contact'|'deal'|'account', id: number }
      const rec = { type, subject: subject||null, date: date||null, related: related||null, owner: owner||null, notes: notes||null, created_at: nowSql() };
      return withStore('readwrite', ({activities}) => new Promise((res, rej) => {
        const r = activities.add(rec);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      }));
    },
    async listActivities(limit=500){
      return withStore('readonly', ({activities}) => new Promise((res, rej) => {
        const idx = activities.index('by_created');
        const req = idx.openCursor(null, 'prev');
        const out = [];
        req.onsuccess = () => { const cur = req.result; if (!cur || out.length>=limit) return res(out); out.push(cur.value); cur.continue(); };
        req.onerror = () => rej(req.error);
      }));
    },

    // Counts
    async count(storeName){
      return withStore('readonly', (stores) => new Promise((res, rej) => {
        const s = stores[storeName];
        if (!s) return res(0);
        const r = s.count();
        r.onsuccess = () => res(r.result||0);
        r.onerror = () => rej(r.error);
      }));
    },

    // Export full JSON dump (all stores)
    async exportJSON(){
      const all = { meta: {}, leads: [], accounts: [], contacts: [], deals: [], activities: [] };
      all.meta.settings = await this.getSettings();
      all.leads = await this.listLeads(1000000);
      all.accounts = await this.listAccounts(1000000).catch(()=>[]);
      all.contacts = await this.listContacts(1000000).catch(()=>[]);
      all.deals = await this.listDeals(1000000).catch(()=>[]);
      all.activities = await this.listActivities(1000000).catch(()=>[]);
      const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
      return blob;
    },

    // CSV export (leads only, extended columns)
    async exportCSV(){
      const rows = await this.listLeads(1000000);
      const escape = (v) => {
        if (v == null) return '';
        const s = typeof v === 'string' ? v : Array.isArray(v) ? v.join(';') : String(v);
        if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      };
      const header = 'id,name,email,phone,company,source,owner,stage,tags,notes,status,created_at';
      const csv = [header].concat(rows.map(r => [r.id, r.name, r.email||'', r.phone||'', r.company||'', r.source||'', r.owner||'', r.stage||'New', (r.tags||[]).join(';'), r.notes||'', r.status||'new', r.created_at||''].map(escape).join(','))).join('\n');
      return new Blob([csv], { type: 'text/csv' });
    },
  };

  window.TuskIDB = TuskIDB;
})();
