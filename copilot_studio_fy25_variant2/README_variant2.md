# Microsoft Copilot Studio — FY25 ESG Master Agent & Skill (Variant 2: Dedicated Excel Turn)

This directory contains the setup files for **Variant 2** of the FY25 Corporate ESG Data Extraction Agent. In Variant 2:
1. **Turn 1 (Tasks 1–4 Automated Stream):** Tasks 1, 2, 3, and 4 run automatically in sequence within a single continuous response stream without requiring 'next' prompts.
2. **Turn 2 (Dedicated Task 5 Excel Generation):** When the user types "excel" (or "download"), Task 5 executes in its own dedicated turn to generate and deliver the consolidated `[Company_Name]_FY25_ESG_Report.xlsx` workbook without hitting single-turn token ceilings or HTTP timeouts.

---

## 📁 Files Included

1. **`skills/fy25_esg_extraction/SKILL.md`**: The official Agent Custom Skill file (with YAML frontmatter header) configured for automated Tasks 1–4 stream + dedicated Task 5 Excel generation turn.
2. **`00_main_agent_instruction_variant2.txt`**: The Orchestrator prompt for Copilot Studio's Main Agent (Variant 2).
3. **`copilot_studio_esg_2025_prompt_variant2.txt`**: Master prompt file for direct text copy-pasting or Knowledge Base upload (Variant 2).
4. **`README_variant2.md`**: This configuration and setup guide (Variant 2).

---

## 🛠️ Copilot Studio Architecture & Flow (Variant 2: Two-Phase Execution)

```
                               ┌──────────────────────────────────────────────┐
                               │     Copilot Studio Main Agent (Variant 2)    │
                               │    (Instruction: 00_main_agent_instruction)  │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      ▼
                      ┌──────────────────────────────────────────────────────────────┐
                      │ Agent Skill: skills/fy25_esg_extraction/SKILL.md             │
                      └──────────────────────────────┬───────────────────────────────┘
                                                     │
                                                     ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TURN 1 AUTOMATED STREAM:                                                                              │
│ Task 1: Scope & Operational Audit ──► (Automated Unpaused Continuation)                                │
│   ↓                                                                                                    │
│ Task 2: ESG & Financial Data (FY25 STRICT ONLY) ──► (Automated Unpaused Continuation)                   │
│   ↓                                                                                                    │
│ Task 3: YoY Variance Analysis (1-Yr FY24 Baseline, >=20%) ──► (Automated Unpaused Continuation)        │
│   ↓                                                                                                    │
│ Task 4: Auditor & QC Mode Combined (Part A: Auditor, Part B: Multi-Location Audit, Part C: Coverage)   │
│   ↓                                                                                                    │
│ PAUSE PROMPT: "Type 'excel' to generate [Company_Name]_FY25_ESG_Report.xlsx workbook."                 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TURN 2 DEDICATED EXCEL GENERATION:                                                                     │
│ User: "excel" ──► Task 5: Consolidated Excel Workbook (.xlsx) Generation                               │
│ Output: Downloadable [Company_Name]_FY25_ESG_Report.xlsx Multi-Tab Excel Workbook                      │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Key Integration & Architectural Features

* **Consolidated Excel Workbook (.xlsx) Output (Task 5)**: Compiles all extracted data into a downloadable Excel workbook file.
  - **Company Name File Naming**: File name is dynamically set to the Company Name identified in Task 1 (`[Company_Name]_FY25_ESG_Report.xlsx`).
  - **Task-Specific Worksheets (Tabs)**: Dedicated tabs for `Task 1 - Scope Audit`, `Task 2 - ESG & Financial Data`, `Task 3 - YoY Variance`, and `Task 4 - Auditor & QC Report`.
  - **Strict Numeric Data Cell Formatting**: Forces all quantitative numbers to be stored as native Excel `Number` cells (not text strings) so formulas (`=SUM()`, `=AVERAGE()`) work natively without green "Number stored as text" warnings.
* **Sequential Step-by-Step Task Reasoning (No Batch Thinking)**: Forces the agent to focus 100% of its reasoning on solving Task 1 first (Scope Audit), outputting Task 1, then carrying Task 1 context forward to reason about and solve Task 2 (Data Tables), rendering Task 2, then reasoning about Task 3 (YoY Variance), and finally reasoning about Task 4 (Auditor QC). Eliminates context confusion and maximizes extraction accuracy.
* **Strict Table-Specific Reporting Boundary Isolation**: Prevents GHG organizational boundaries from spilling into Water, Waste, Energy, or Pollutant tables. Forces section-specific boundary extraction for each KPI table.
* **Dedicated Air & Water Pollutants Data (Table 5)**: Table 2 is strictly reserved for water volumes (withdrawal, consumption, discharge including wastewater discharge, recycled, stress). Table 5 is the dedicated table for all pollutants: Air Pollutants (NOx, SOx, PM10, PM2.5, VOCs, HAPs) and Water Pollutants (Phosphorus/Total P, Nitrogen/Total N, COD, BOD, TSS, Heavy Metals, Oil & Grease).
* **Default FY25 Target & Explicit User Multi-Year Override Mandate**: By default, Task 2 extracts strictly FY25 target data to prevent unprompted multi-year bleed. If the user prompt explicitly requests additional fiscal years (e.g. "extract FY24 as well", "include FY23 and FY24", "extract FY22 to FY25"), the agent honors the explicit user request and extracts the specified historical years.
* **Segment & Product Qualitative Descriptions**: Extracts near-verbatim qualitative descriptions of segment and product/service offerings (excluding revenue numbers from descriptions) to support NAICS classification and granular mapping.
* **BRSR Templated Disclosure Zero Rule**: Requires explicit qualitative validation before accepting zero values in templated disclosures (e.g. BRSR).
* **Social & Governance Exclusion**: Explicit global prohibition against extracting out-of-scope social/governance metrics (diversity, safety LTIR, board composition, training hours, donations).
* **GHG Base Year & SBTi Target Tracking**: Captures stated base year, recalculation policy triggers, and Science-Based Targets (SBTi) in Task 1.
* **Context Preservation Across Tasks**: Previous task responses are automatically included as active context for subsequent tasks so that YoY variance and auditor checks have 100% data continuity.
* **Cross-Document Company Match & Target Selection Gate (Task 1)**: Verifies whether uploaded files belong to the same company. If a mismatch is detected, displays a warning callout (`⚠️ CRITICAL WARNING: Company Mismatch Detected`), **STOPS execution**, and prompts the user to select which company to analyze (`⏸️ Company Mismatch Detected! Please specify which company you want to analyze before proceeding.`). Extracts data strictly for the single chosen target company.
* **Non-Negotiable Immateriality & Restatements**: Dedicated detail rows inside Task 2 data tables (`[Metric Name] - Immateriality Details` and `[Metric Name] - Restatement Details`) and full coverage in Task 4 Part A.
* **Multi-Location & Distinct Value Verification (Task 4 Part B)**: Audits whether any KPI appeared with different values across multiple pages/reports (e.g. Page 31 integer vs Page 125 decimal). Displays omitted/discrepant values in a Markdown table.
* **Markdown Table (TSV) Format**: All in-chat task outputs are rendered in clean Markdown Table (TSV / Tab-Separated Values) format.

---

## 🚀 Step-by-Step Copilot Studio Deployment

### Option A: Using as a Custom Agent Skill (`skills/fy25_esg_extraction/SKILL.md`)
1. Import `skills/fy25_esg_extraction/SKILL.md` into your agent framework / Copilot Studio custom skills repository.
2. Set `00_main_agent_instruction.txt` as the Main Agent System Instruction.

### Option B: Uploading to Knowledge Base
1. In Copilot Studio, go to **Knowledge** / **Generative Answers**.
2. Upload `skills/fy25_esg_extraction/SKILL.md` or `copilot_studio_esg_2025_prompt.txt` as a reference Knowledge document.
3. Paste `00_main_agent_instruction.txt` into your Main Agent Instructions.

