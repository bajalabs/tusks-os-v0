(function () {
  // tests-4o/lib/file-parse.js
  // Reuse the proven parser from tests/, but point to ../tests/vendor to avoid large file duplication.

  async function readAsArrayBuffer(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = () => rej(fr.error);
      fr.readAsArrayBuffer(file);
    });
  }

  async function readAsText(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = () => rej(fr.error);
      fr.readAsText(file);
    });
  }

  function download(filename, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => res();
      s.onerror = () => rej(new Error("Failed to load " + src));
      document.head.appendChild(s);
    });
  }

  function loadPdfJsAsModule(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.type = "module";
      s.textContent = `
        import * as pdfjs from ${JSON.stringify(src)};
        window.pdfjsLib = pdfjs;
      `;
      s.onload = () => res();
      s.onerror = () => rej(new Error("Failed to import module " + src));
      document.head.appendChild(s);
    });
  }

  async function ensurePdfJs() {
    if (window.pdfjsLib) return true;
    const base = "../tests/vendor/pdfjs";
    const umdCandidates = [`${base}/pdf.min.js`, `${base}/pdf.js`];
    for (const src of umdCandidates) {
      try {
        await loadScript(src);
        if (window.pdfjsLib) {
          try {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${base}/pdf.worker.min.js`;
          } catch {}
          return true;
        }
      } catch {}
    }
    const esmCandidates = [`${base}/pdf.min.mjs`, `${base}/pdf.mjs`];
    for (const src of esmCandidates) {
      try {
        await loadPdfJsAsModule(src);
        if (window.pdfjsLib) {
          try {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${base}/pdf.worker.min.js`;
          } catch {}
          return true;
        }
      } catch {}
    }
    return false;
  }

  async function ensureMammoth() {
    if (window.mammoth) return true;
    try {
      await loadScript("../tests/vendor/mammoth/mammoth.browser.min.js");
      return !!window.mammoth;
    } catch {}
    return false;
  }

  function textToMarkdown(text) {
    return String(text || "").replace(/\r\n/g, "\n");
  }

  async function parsePDFToMarkdown(file) {
    const ok = await ensurePdfJs();
    if (!ok)
      throw new Error(
        "pdf.js not available. Ensure vendors exist under tests/vendor/pdfjs/"
      );
    const buf = await readAsArrayBuffer(file);
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    let out = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((it) => it.str).join(" ");
      out.push(strings.trim());
    }
    const md = out.join("\n\n");
    return textToMarkdown(md);
  }

  async function parseDOCXToMarkdown(file) {
    const ok = await ensureMammoth();
    if (!ok)
      throw new Error(
        "mammoth not available. Ensure vendors exist under tests/vendor/mammoth/"
      );
    const buf = await readAsArrayBuffer(file);
    const result = await window.mammoth.convertToMarkdown({ arrayBuffer: buf });
    return result.value || "";
  }

  async function parseFileToMarkdown(file) {
    const name = ((file && file.name) || "").toLowerCase();
    if (!name) throw new Error("No file name");
    if (name.endsWith(".pdf")) return parsePDFToMarkdown(file);
    if (name.endsWith(".docx")) return parseDOCXToMarkdown(file);
    if (name.endsWith(".txt") || name.endsWith(".md")) return readAsText(file);
    throw new Error("Unsupported file type: " + name.split(".").pop());
  }

  window.TuskFileParse = {
    parseFileToMarkdown,
    parsePDFToMarkdown,
    parseDOCXToMarkdown,
    download,
  };
})();
