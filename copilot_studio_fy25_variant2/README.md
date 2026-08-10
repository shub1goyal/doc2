# Microsoft Copilot Studio — FY25 ESG Master Agent & Skill (Variant 2: Automated Single-Turn)

This directory contains the setup files for **Variant 2** of the FY25 Corporate ESG Data Extraction Agent. In Variant 2, **the user does NOT need to type 'next' between tasks** — all 5 extraction tasks run automatically 1-by-1 in order within a single automated response stream.

---

## 📁 Files Included

1. **`skills/fy25_esg_extraction/SKILL.md`**: The official Agent Custom Skill file (with YAML frontmatter header) configured for automated single-turn unpaused 5-task extraction.
2. **`00_main_agent_instruction.txt`**: The Orchestrator prompt for Copilot Studio's Main Agent (Variant 2). Guides automated unpaused execution across all 5 tasks without 'type next' prompts.
3. **`copilot_studio_esg_2025_prompt.txt`**: Master prompt file for direct text copy-pasting or Knowledge Base upload.
4. **`README.md`**: This configuration and setup guide.

---

## 🛠️ Copilot Studio Architecture & Flow (Variant 2: Automated Single-Turn)

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
│ Task 1: Scope & Operational Audit ──► (Automated Unpaused Continuation)                                │
│   ↓                                                                                                    │
│ Task 2: ESG & Financial Data (FY25 STRICT ONLY) ──► (Automated Unpaused Continuation)                   │
│   ↓                                                                                                    │
│ Task 3: YoY Variance Analysis (1-Yr FY24 Baseline, >=20%) ──► (Automated Unpaused Continuation)        │
│   ↓                                                                                                    │
│ Task 4: Auditor & QC Mode Combined (Part A: Auditor, Part B: Multi-Location Audit, Part C: Coverage)   │
│   ↓                                                                                                    │
│ Task 5: Consolidated Excel Workbook (.xlsx) Generation ──► Output: Company-Named Multi-Tab .xlsx File  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Key Integration & Architectural Features

* **Consolidated Excel Workbook (.xlsx) Output (Task 5)**: Compiles all extracted data into a downloadable Excel workbook file.
  - **Company Name File Naming**: File name is dynamically set to the Company Name identified in Task 1 (`[Company_Name]_FY25_ESG_Report.xlsx`).
  - **Task-Specific Worksheets (Tabs)**: Dedicated tabs for `Task 1 - Scope Audit`, `Task 2 - ESG & Financial Data`, `Task 3 - YoY Variance`, and `Task 4 - Auditor & QC Report`.
* **Strict Task Step Isolation (No Multi-Year Lookahead Bleed)**: Prevents the agent from extracting multi-year data (e.g. FY22–FY24) prematurely during Task 2. Task 2 strictly extracts FY25 target data only; Task 3 restricts YoY comparison to 1 prior year (FY24 only).
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

