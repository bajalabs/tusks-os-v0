(function(){
  // Export IndexedDB data to a SQLite database (Uint8Array) using sql.js
  const SQLJS_BASE = '../../tusk-os-static/lib/sqljs/';

  function bytesFromB64(b64){
    const s = atob(b64);
    const out = new Uint8Array(s.length);
    for (let i=0;i<s.length;i++) out[i] = s.charCodeAt(i);
    return out;
  }

  async function loadSQL(){
    if (window.initSqlJs && window.SQL) return window.SQL;
    // Try embedded wasm first
    await new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = SQLJS_BASE + 'sql-wasm-b64.js';
      s.onload = resolve;
      s.onerror = resolve; // optional
      document.head.appendChild(s);
    });
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SQLJS_BASE + 'sql-wasm.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    const options = { locateFile: (f) => SQLJS_BASE + f };
    try{
      if (window.SQL_WASM_BASE64) {
        options.wasmBinary = bytesFromB64(String(window.SQL_WASM_BASE64).replace(/\s+/g,''));
      }
    }catch{}
    window.SQL = await window.initSqlJs(options);
    return window.SQL;
  }

  async function exportLeadsToSQLite(listLeads){
    const SQL = await loadSQL();
    const db = new SQL.Database();
    db.exec(`
      PRAGMA journal_mode=OFF;
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        status TEXT DEFAULT 'new',
        created_at TEXT
      );
    `);
    const rows = await listLeads(1000000);
    const ins = db.prepare("INSERT INTO leads(name, email, status, created_at) VALUES(?, ?, ?, ?)");
    for (const r of rows){
      ins.bind([r.name, r.email||null, r.status||'new', r.created_at||null]);
      ins.step();
      ins.reset();
    }
    ins.free();
    const bytes = db.export();
    db.close();
    return new Blob([bytes], { type: 'application/x-sqlite3' });
  }

  window.TuskIDB_SQLiteExport = { exportLeadsToSQLite };
})();
