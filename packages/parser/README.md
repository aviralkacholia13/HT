# Parser Service (Celery Worker)

This package will host the Celery-powered parsing service that downloads uploaded lab documents, classifies them, and extracts structured observations according to the flow described in `docs/design.md` section 9.

## Planned Stack
- Python 3.11
- Celery + Redis (broker) + SQLAlchemy database access
- pdfplumber for native PDFs
- pytesseract + OpenCV for scanned documents and images
- Custom normalization utilities (canonical names, UCUM units, range parsing)

Refer to the design blueprint for task sequencing, confidence scoring, and retry/error handling expectations.
