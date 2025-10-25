# Lablens MVP 1 – Product & Experience Design

## 1. Vision & Principles
- **Clarity over clutter**: prioritize quick comprehension of lab trends without clinical jargon or overwhelming dashboards.
- **Trust-first experience**: reinforce privacy, transparency, and data provenance on every screen.
- **Assistive, not prescriptive**: surface educational context while avoiding diagnoses or treatment guidance.
- **Accessible for all**: WCAG-compliant typography, color palettes, and keyboard-first navigation.

## 2. User Personas & Jobs-to-be-Done
| Persona | Primary Goal | Pain Points Today | Design Response |
| --- | --- | --- | --- |
| **Health Tracker Holly** (35, tech-savvy professional) | Consolidate recurring lab panels and notice trends early. | Paper/PDF reports scattered; hard to spot gradual changes. | Upload pipeline with automated parsing, responsive charts, insight callouts, exportable summaries. |
| **Caregiver Carlos** (52, supporting parent) | Monitor multiple labs (e.g., kidney markers) and keep clinicians informed. | Time-consuming manual entry; fear of misinterpreting data. | Role-based access (future), concise tables with plain-language statuses, "Not medical advice" disclaimers. |
| **Data-Driven Dana** (28, chronic condition) | Validate lab improvements after lifestyle changes. | Complex lab jargon and inconsistent units across reports. | Normalized UCUM units, consistent charts, glossary-based insight cards. |

## 3. Experience Flow Overview
1. **Onboarding & Auth**
   - Email/password auth with progressive disclosure of privacy promises and security measures.
   - First login directs to empty-state dashboard with prompt to upload a lab report.
2. **Upload & Library**
   - Drag-and-drop dropzone supporting PDF/JPG/PNG/HEIC; shows allowed size/types and encryption messaging.
   - Optimistic document card appears in the library with status badge (Uploaded → Parsing → Parsed/Error).
   - Audit log records upload action.
3. **Parsing & Review**
   - Background parser ingests file; user receives toast updates when parsing completes/fails.
   - Parsed table screen offers inline editable cells (value/unit/name/date) with immediate validation and save feedback.
4. **Trends & Insights**
   - From table or dashboard, user launches trend view for supported analytes. Chart renders in consistent UCUM units and overlays lab-provided reference band.
   - Out-of-range values highlighted with ValueChip (text + color) and associated InsightCard containing short, sourced guidance.
5. **Visit Summary Export**
   - User can generate PDF summary per diagnostic report with last values, trend sparklines, and educational disclaimers.

## 4. Information Architecture
```
Home
├─ Quick stats (new labs, flagged markers)
├─ Key trends carousel (top 3 analytes)
├─ Educational spotlight (rotating InsightCard)
Upload
└─ UploadDropzone + upload history log
Documents
├─ Filters: status, date, file type
├─ Cards with metadata & access logs (modal)
Reports/[id]
├─ Report header (lab name, report date, document link)
├─ ParsedTable (editable)
├─ Insight section (ValueChip + InsightCard)
Trends/[name]
├─ TrendChart with ref band
├─ Accessibility data table
├─ Insight summary
Auth
├─ Login / Signup forms (password strength meter, terms checkbox)
```

## 5. Visual & Interaction Design System
### 5.1 Color Palette (contrast checked)
- **Primary 600**: `#2563eb` (Royal Blue) – call-to-actions.
- **Primary 500**: `#3b82f6` – highlights.
- **Secondary 500**: `#14b8a6` (Teal) – success states.
- **Warning 500**: `#f59e0b` – low values.
- **Danger 500**: `#ef4444` – high values.
- **Neutral 900/700/500/200**: grayscale for text/backgrounds.
- **Background**: `#f8fafc` for app shell; white cards with 1px `#e2e8f0` borders.

### 5.2 Typography
- **Heading**: Inter, weight 600.
- **Body**: Inter, weight 400.
- Base font size 16px, line height 1.5; scale with Tailwind `text-sm`, `text-base`, `text-lg`, `text-xl`.

### 5.3 Component Patterns
- **Card Shell**: rounded-xl, shadow-sm, focus ring `ring-2 ring-primary-500`.
- **Button**: solid (primary), outline (secondary), ghost (tertiary). Loading state with spinner + aria-live announcements.
- **Form Controls**: floating labels for large fields; inline validation messages (assistive text `text-neutral-500`).
- **Status Chips**: `ValueChip` uses icon + text (`High`, `Low`, `Normal`, `Pending`) with color-blind safe palette and sr-only label.
- **InsightCard**: includes banner `Educational information — not medical advice.` with `aria-describedby` linking to disclaimer.

### 5.4 Layout
- App shell with fixed top nav (logo, Upload CTA, profile menu) and collapsible sidebar (Home, Documents, Trends, Insights).
- Content uses max-width `1200px`, responsive grid (`grid-cols-1` mobile, `grid-cols-12` desktop).
- Trend views leverage `aspect-[4/3]` containers to maintain chart readability.

## 6. Frontend Page Details
### 6.1 Home
- **Hero card**: "Your latest lab updates" with last upload timestamp.
- **Highlights grid** (3 cards): e.g., LDL trend arrow, A1c latest value, upcoming doctor visit reminder (manual entry later).
- **Recent documents list** with statuses.

### 6.2 Upload
- **Dropzone**: dashed border, icon (CloudArrowUp), instructions, and legal note about PHI security.
- Progress indicator: `react-dropzone` + `@headlessui/react` for modal confirmation once upload completes.

### 6.3 Documents Library
- Table/list hybrid with thumbnail preview icon, file name, upload date, status, actions (View, Download original).
- Filters using `Listbox` from Headless UI for accessible dropdowns.
- Audit log modal showing actions timeline (from `audit_log`).

### 6.4 Report Details
- Header summarizing lab info (name, report date, ordering provider) with link to original file.
- ParsedTable: editable cells using `contentEditable` or inline inputs; Save buttons appear row-wise with optimistic UI.
- Inline toasts (Headless UI `Transition`) for success/error.
- Right rail: Insight cards stacked, toggled by marker selection.

### 6.5 Trend View
- ChartJS line chart with gradient fill for reference range.
- Toggle between 6m/1y/All timeframe filters.
- Data table accessible fallback with `sr-only` caption describing dataset.
- Option to download CSV/PNG of chart.

### 6.6 Auth Pages
- Clean card centered on neutral background; includes password requirements (`min 12 chars`, `1 number`, `1 symbol`).
- Provide privacy policy link and text about encryption.
- Use `aria-live` for error messaging.

## 7. Design Tokens & Tailwind Config
```ts
// tailwind.config.ts excerpt
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
        },
        secondary: {
          50: '#ecfdf5',
          500: '#14b8a6',
        },
        warning: { 500: '#f59e0b' },
        danger: { 500: '#ef4444' },
      },
      boxShadow: {
        card: '0 10px 25px -15px rgba(15, 23, 42, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

## 8. Accessibility Considerations
- Minimum 4.5:1 contrast for text/buttons; chips include icons + text + aria labels.
- Keyboard navigation: focus outlines on all interactive components; logical tab order in tables.
- Charts accompanied by data table and textual summary (e.g., "LDL Cholesterol has decreased 15% since Jan 2024").
- Screen reader announcements for upload progress and parse completion.
- Support reduced motion preference (disable chart animations via `prefers-reduced-motion`).

## 9. Architecture & Data Flow
1. **Frontend (Next.js 14)**
   - App router with shared layouts for auth vs. protected routes.
   - Data fetching via React Query (TanStack) to handle stale-while-revalidate patterns for documents and observations.
   - Authentication handled using httpOnly JWT cookies; `next/headers` for server actions to forward tokens.
2. **Backend (FastAPI)**
   - Implements endpoints defined in spec; Pydantic models enforce validation (password length, MIME allowlist, patch constraints).
   - Alembic migrations for schema; SQLAlchemy ORM.
   - RBAC middleware ensures `user_id` scope on every query.
3. **Parser Service**
   - Celery worker triggered via Redis queue. Steps: classification, parsing (native vs. scanned), normalization, observation persistence.
   - Observes `parse_document` tasks with retries/backoff; writes audit log entries (parse_started, parse_succeeded, parse_failed).
4. **Storage & Infra**
   - MinIO/S3 for uploads, configured with bucket policies allowing presigned POST only.
   - Postgres for relational data; Redis for queue; Docker Compose orchestrates services.
   - Nginx reverse proxy terminates TLS (dev via mkcert, prod via ACM/Let’s Encrypt).
5. **Security**
   - Argon2 password hashing, JWT rotation, rate limiting using `slowapi`.
   - ClamAV scanning container triggered post-upload; parser runs only when file marked clean.
   - Logs sanitized (IDs only) and shipped to centralized log aggregator.

## 10. Data Entities
- Tables per provided schema; include derived view `observation_timeseries` for efficient chart queries.
- Audit trail extends to READ events (e.g., `observation_viewed`).
- Insight cards stored in `shared/insights.json`; served via API with caching headers.

## 11. Key User Stories & Acceptance Criteria
1. **Upload lab report**
   - When user drags PDF, dropzone validates type/size.
   - After upload, document appears with `Parsing` badge; within 60s status updates to `Ready` or `Error`.
2. **Review parsed results**
   - User sees table with rows for each analyte; values align with raw report.
   - Out-of-range row displays ValueChip (`High`/`Low`) and toggles relevant InsightCard.
3. **Correct a value**
   - Editing cell reveals inline form with unit dropdown (UCUM). Save triggers PATCH and re-renders row.
4. **View trend**
   - Selecting "View trend" shows chart with consistent units; tooltips display date/value/range, accessible summary provided.
5. **Download summary**
   - Button generates PDF with latest metrics, disclaimers, and optional insights, retaining branding.

## 12. Content Strategy
- Plain-language microcopy emphasizing privacy (e.g., "Files are encrypted in storage. Only you can view them.").
- Insight cards cite reputable sources (MedlinePlus, CDC, NIH).
- Empty states use illustrative icons and actionable text ("Upload your first lab report to see trends").

## 13. Analytics & Observability Hooks
- Instrument events via `posthog-js` or similar: `upload_started`, `upload_completed`, `parse_started`, `parse_succeeded`, `parse_failed`, `observation_corrected`, `insight_viewed`, `trend_viewed`.
- Backend exports structured logs with correlation IDs; parser attaches `document_id` context.
- Dashboard monitors parse latency percentiles, OCR accuracy metrics, and correction rates.

## 14. Testing Strategy Alignment
- Jest/React Testing Library for frontend components (UploadDropzone drag events, TrendChart data table fallback, InsightCard disclaimers).
- Pytest for API (auth, RBAC, patch validation) and parser unit tests (range parsing, fuzzy matching accuracy).
- Integration tests using Docker Compose to run end-to-end scenario with synthetic fixtures.
- Accessibility tests with `@axe-core/playwright` and manual screen reader verification (NVDA/VoiceOver).

## 15. Roadmap Notes Beyond MVP
- Shareable caregiver access with granular permissions.
- Provider-friendly summary view with note upload.
- Push notifications once native apps exist.
- Automated lab integrations via patient portal connectors (post-MVP, ensure consent flows).

---
This design blueprint translates the implementation plan into concrete user-facing experiences, visual standards, and architectural guardrails, ensuring the lab test record app launches with a modern, trustworthy, and accessible interface.
