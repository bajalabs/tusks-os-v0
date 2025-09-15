/**
 * TUSK-OS Static DB — SQLite via sql.js (WASM) + localStorage persistence.
 * Exposes global `TuskDB` with:
 *   await TuskDB.ready()
 *   await TuskDB.select(sql, params?)
 *   await TuskDB.exec(statements) // [ [sql, params?], ... ] and persists
 *   await TuskDB.export() // Uint8Array for download
 *   await TuskDB.import(bytes) // replace DB image and persist
 * Settings helpers: TuskDB.getSettings(), TuskDB.saveSettings(obj)
 */
const SQL_JS_CDN = "https://cdn.jsdelivr.net/npm/sql.js@1.10.2/dist/";
const DB_KEY = "tusk.sqlite.v1"; // sqlite (base64 image)
const LOCAL_KEY = "tusk.localdb.v1"; // local-only JSON fallback
const SETTINGS_KEY = "tusk.settings.v1";

function b64FromBytes(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function bytesFromB64(b64) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

let _SQL = null;
let _db = null;
let _mode = "sqlite"; // 'sqlite' | 'local'

// Local-only store shape: { seq: {leads:number}, leads: Array<Lead> }
function localDefault() {
  return { seq: { leads: 0 }, leads: [] };
}
function localLoad() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : localDefault();
  } catch {
    return localDefault();
  }
}
function localSave(obj) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(obj));
}

async function loadSQL() {
  if (_SQL) return _SQL;
  if (!window.initSqlJs) {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SQL_JS_CDN + "sql-wasm.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to load sql.js"));
      document.head.appendChild(s);
    });
  }
  _SQL = await window.initSqlJs({
    locateFile: (file) => SQL_JS_CDN + file,
  });
  return _SQL;
}

function bootstrapIfEmpty(db) {
  // Create minimal schema if new DB
  db.exec(`
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function persist() {
  const bytes = _db.export();
  localStorage.setItem(DB_KEY, b64FromBytes(bytes));
}

async function openDB() {
  if (_db || _mode === 'local') return _db;
  try {
    const SQL = await loadSQL();
    const stored = localStorage.getItem(DB_KEY);
    _db = stored ? new SQL.Database(bytesFromB64(stored)) : new SQL.Database();
    if (!stored) {
      bootstrapIfEmpty(_db);
      persist();
    }
    _mode = 'sqlite';
    return _db;
  } catch (e) {
    console.warn('[TUSK] Falling back to local storage DB:', e && e.message);
    _mode = 'local';
    // Ensure local store exists
    const obj = localLoad();
    if (!Array.isArray(obj.leads)) {
      localSave(localDefault());
    }
    return null;
  }
}

async function select(sql, params = []) {
  const db = await openDB();
  if (_mode === 'sqlite') {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }
  // Local-only: support app queries
  const store = localLoad();
  if (/FROM\s+leads/i.test(sql)) {
    const rows = store.leads.slice().sort((a,b) => {
      // sort by created_at desc then id desc
      const da = a.created_at || '';
      const dbb = b.created_at || '';
      if (da === dbb) return (b.id||0) - (a.id||0);
      return (dbb > da) ? 1 : (dbb < da ? -1 : 0);
    });
    const m = sql.match(/LIMIT\s+(\d+)/i);
    const limit = m ? parseInt(m[1], 10) : undefined;
    const sliced = limit ? rows.slice(0, limit) : rows;
    // Return only requested columns
    return sliced.map(r => ({ id: r.id, name: r.name, email: r.email || null, status: r.status || 'new', created_at: r.created_at }));
  }
  console.warn('[TUSK] Local DB select unsupported SQL, returning []:', sql);
  return [];
}

async function exec(statements = []) {
  const db = await openDB();
  if (_mode === 'sqlite') {
    db.exec("BEGIN IMMEDIATE;");
    try {
      for (const [sql, params = []] of statements) {
        const st = db.prepare(sql);
        st.bind(params);
        st.step();
        st.free();
      }
      db.exec("COMMIT;");
    } catch (e) {
      db.exec("ROLLBACK;");
      throw e;
    }
    persist();
    return { ok: true };
  }
  // Local-only execution for known statements
  const store = localLoad();
  for (const [sql, params = []] of statements) {
    if (/^\s*INSERT\s+INTO\s+leads/i.test(sql)) {
      const name = (params[0] || '').toString();
      const email = params[1] || null;
      const id = (store.seq.leads || 0) + 1;
      store.seq.leads = id;
      store.leads.push({ id, name, email, status: 'new', created_at: new Date().toISOString().replace('T', ' ').replace('Z','') });
    } else {
      console.warn('[TUSK] Local DB exec unsupported SQL, ignoring:', sql);
    }
  }
  localSave(store);
  return { ok: true };
}

async function exportBytes() {
  await openDB();
  if (_mode === 'sqlite') return _db.export();
  const data = localLoad();
  const json = JSON.stringify(data, null, 2);
  return new TextEncoder().encode(json);
}

async function importBytes(bytes) {
  // Try sqlite path if we are in sqlite mode; otherwise treat as JSON
  if (_mode === 'sqlite') {
    const SQL = await loadSQL();
    if (_db) try { _db.close(); } catch {}
    _db = new SQL.Database(bytes);
    persist();
    return { ok: true };
  }
  try {
    const text = new TextDecoder().decode(bytes);
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object' || !Array.isArray(obj.leads)) throw new Error('Invalid JSON backup');
    // Basic normalize
    if (!obj.seq || typeof obj.seq.leads !== 'number') obj.seq = { leads: obj.leads.reduce((m, r) => Math.max(m, r.id||0), 0) };
    localSave(obj);
    return { ok: true };
  } catch (e) {
    throw new Error('Failed to import JSON backup: ' + (e && e.message));
  }
}

// Settings helpers (localStorage JSON)
function getSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"); }
  catch { return {}; }
}
function saveSettings(obj) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(obj || {}, null, 2));
}

window.TuskDB = {
  ready: openDB,
  select,
  exec,
  export: exportBytes,
  import: importBytes,
  getSettings,
  saveSettings,
  get mode(){ return _mode; },
};
