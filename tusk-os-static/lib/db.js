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
const DB_KEY = "tusk.sqlite.v1";
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
  if (_db) return _db;
  const SQL = await loadSQL();
  const stored = localStorage.getItem(DB_KEY);
  _db = stored ? new SQL.Database(bytesFromB64(stored)) : new SQL.Database();
  if (!stored) {
    bootstrapIfEmpty(_db);
    persist();
  }
  return _db;
}

async function select(sql, params = []) {
  const db = await openDB();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

async function exec(statements = []) {
  const db = await openDB();
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

async function exportBytes() {
  await openDB();
  return _db.export();
}

async function importBytes(bytes) {
  const SQL = await loadSQL();
  if (_db) try { _db.close(); } catch {}
  _db = new SQL.Database(bytes);
  persist();
  return { ok: true };
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
};
