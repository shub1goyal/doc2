# Project Context - Analyst AI

## Core Objective
Analyst AI is a web-based document analysis platform built to extract, audit, and analyze financial and ESG (Environmental, Social, and Governance) data from corporate reports (Annual Reports, Sustainability Reports, ESG Reports). 
Key features:
1. **ESG Metrics Extraction**: Auto-extracts Scope 1/2/3 emissions, water, waste, energy, and social indicators.
2. **Revenue Consistency Auditing**: Compares segment-level, product-level, and consolidated revenues to verify mathematical and logical alignment.
3. **Multi-Year Variance Analysis**: Evaluates FY-over-FY KPI values. Identifies variances > 20% and extracts reasons/explanations from documents.
4. **Data Integrity Checks**: Checks reporting boundaries, flags inconsistencies, and captures data availability exclusions.

## Intended Architecture
- **Structure**: Single-page application (SPA) based on standard web files: `index.html` (styling and layout) and `index.js` (application state and orchestration logic).
- **Styling**: Tailwind CSS via CDN.
- **Markdown Parsing**: `marked.js` library via CDN for high-fidelity conversion of Gemini's Markdown output (including complex multi-column tables) to parsed HTML.
- **LLM Engine**: Google Gemini API via the ESM module `@google/generative-ai`.
- **API Key Resiliency**: Uses an injected list of Gemini API keys. In case of API quota limits (429), permissions issues (403), internal errors (500), service overloads (503), gateway timeouts (504), or high-demand spikes, the application rotates through keys or uses exponential backoff to recover gracefully.
- **File Ingestion**: Uploads PDF, DOCX, TXT, HTML, and image files to the Gemini File API using resumable HTTP uploads for caching and session context retention.
