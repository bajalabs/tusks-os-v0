# Vendor Libraries for file:// Parsing

To enable PDF and DOCX parsing entirely offline over file://, place the following libraries here with the exact paths:

- pdf.js (build artifacts):

  - `tests/vendor/pdfjs/pdf.min.js`
  - `tests/vendor/pdfjs/pdf.worker.min.js`

- mammoth (browser build):
  - `tests/vendor/mammoth/mammoth.browser.min.js`

You can obtain official builds from:

- PDF.js: https://github.com/mozilla/pdf.js/releases (use the prebuilt `pdf.min.js` + `pdf.worker.min.js`)
- mammoth.js: https://github.com/mwilliamson/mammoth.js/ (use `dist/mammoth.browser.min.js`)

Place files exactly with the above names so `tests/lib/file-parse.js` can load them via relative paths.
