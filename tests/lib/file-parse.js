(function () {
  // tests/lib/file-parse.js
  // Standalone parsing utilities for converting uploads to Markdown.
  // Goals:
  // - Work offline over file://
  // - Prefer vendored libs in ../vendor
  // - Graceful fallback with helpful error messages

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

  async function ensurePdfJs() {
    if (window.pdfjsLib) return true;
    try {
      await loadScript("../vendor/pdfjs/pdf.min.js");
      // Optional worker; for file://, set workerSrc to relative path
      if (window.pdfjsLib) {
        const worker = "../vendor/pdfjs/pdf.worker.min.js";
        try {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
        } catch {}
        return true;
      }
    } catch {}
    return false;
  }

  async function ensureMammoth() {
    if (window.mammoth) return true;
    try {
      await loadScript("../vendor/mammoth/mammoth.browser.min.js");
      return !!window.mammoth;
    } catch {}
    return false;
  }

  // Basic text to markdown fallback (very naive)
  function textToMarkdown(text) {
    // collapse excessive spaces and ensure line breaks preserved
    return String(text || "").replace(/\r\n/g, "\n");
  }

  async function parsePDFToMarkdown(file) {
    const ok = await ensurePdfJs();
    if (!ok)
      throw new Error(
        "pdf.js not available. Vendor it into tests/vendor/pdfjs/"
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
        "mammoth not available. Vendor it into tests/vendor/mammoth/"
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
