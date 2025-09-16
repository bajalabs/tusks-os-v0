# Vendor Libraries for file:// Parsing

To enable PDF and DOCX parsing entirely offline over file://, place the following libraries here with the exact paths:

- pdf.js (build artifacts):

  - `tests/vendor/pdfjs/pdf.min.js`
  - `tests/vendor/pdfjs/pdf.worker.min.js`

- mammoth (browser build):
  - `tests/vendor/mammoth/mammoth.browser.min.js`

You can obtain official builds from:

- PDF.js: unpkg serves the 4.3.136 build artifacts reliably:

  - https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.min.mjs
  - https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs
    Save them locally as `tests/vendor/pdfjs/pdf.min.js` and `tests/vendor/pdfjs/pdf.worker.min.js` respectively (renaming from .mjs is fine for script tag usage here).

- mammoth.js browser build:
  - https://unpkg.com/mammoth@1.6.0/mammoth.browser.min.js

Place files exactly with the above names so `tests/lib/file-parse.js` can load them via relative paths.
