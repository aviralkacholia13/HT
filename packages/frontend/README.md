# Health Trends Frontend

Client-only Progressive Web App built with Vite, React, and TypeScript. The application processes PDF and image lab reports in the
browser, extracts structured data, persists it locally with IndexedDB (Dexie), and visualises trends offline.

## Features

- File uploads for PDF and image lab reports
- PDF text extraction via `pdfjs-dist`
- OCR for images using `tesseract.js`
- Heuristic parsing of tabular lab results (test, value, unit, reference range, date)
- IndexedDB persistence using Dexie
- Trend chart powered by Chart.js with shaded reference bands and status chips
- Insight cards loaded from static JSON with a "Not medical advice" banner
- Visit summary export to PDF via jsPDF
- Offline-first PWA configuration via `vite-plugin-pwa`

## Getting started

```bash
cd packages/frontend
npm install
npm run dev
```

The application is entirely client-side and does not perform any network requests beyond optional language data downloads required by
`tesseract.js` during OCR.

## Building

```bash
npm run build
```

The build output in `dist/` is suitable for static hosting and is used by the GitHub Pages deployment workflow.
