# Copilot Studio Agent 1 (Variant 2: Modular Skills Architecture)

This variant duplicates all functions and workflows of Variant 1, but utilizes a **Modular Skills Architecture** to maximize reasoning depth, eliminate token truncation, and allow clean file uploads in Copilot Studio.

---

## 📁 Directory & File Structure

```
copilot_agents/copilot_studio_fy25_variant2/
│
├── 00_main_agent_instruction_variant2.txt   <-- Main Agent Instruction / Orchestrator Prompt
├── README.md                                <-- This Setup & Usage Guide
│
└── skills/                                  <-- 5 Distinct Modular Skill Files (Uploadable directly)
     ├── skill_1_scope_boundary_audit.md     <-- Task 1: Scope, Boundary & GHG Profile Setup
     ├── skill_2_data_extraction_tables.md   <-- Task 2: Comprehensive FY25 ESG & Financial Tables
     ├── skill_3_yoy_variance_engine.md      <-- Task 3: YoY Variance Analysis (((FY25-FY24)/FY24)*100)
     ├── skill_4_auditor_qc_engine.md        <-- Task 4: Auditor & QC Mode with GHG Checklist & Self-Correction
     └── skill_5_excel_workbook_builder.md   <-- Task 5: Consolidated 4-Tab Excel (.xlsx) Builder (###0.000)
```

---

## 🚀 How to Set Up in Microsoft Copilot Studio

### Step 1: Create the Agent
1. Open **Microsoft Copilot Studio** and create a new agent (e.g. `Analyst AI - Variant 2`).
2. In **Agent Overview / Instructions**, copy and paste the full text from `00_main_agent_instruction_variant2.txt`.

### Step 2: Upload the 5 Modular Skill Files
1. In Copilot Studio, navigate to **Knowledge** (or Custom Actions / Skills depending on your tenant setup).
2. Upload each of the 5 distinct skill files directly from `skills/`:
   - `skill_1_scope_boundary_audit.md`
   - `skill_2_data_extraction_tables.md`
   - `skill_3_yoy_variance_engine.md`
   - `skill_4_auditor_qc_engine.md`
   - `skill_5_excel_workbook_builder.md`
3. Because each file has a distinct and descriptive name, Copilot Studio easily indexes and identifies them without any naming collisions.

---

## 🔄 5-Task Execution Workflow

1. **Turn 1 (Task 1):** User uploads company report(s). Agent checks company match and runs **Skill 1** (Scope, Layman 'Why' Rationale, Revenue coverage, Assurance).
   - *Prompt:* `⏸️ Task 1 Complete! Type 'next' to proceed to Task 2...`
2. **Turn 2 (Task 2):** User types `"next"`. Agent runs **Skill 2** (All 6 FY25 data tables, multi-page integer/decimal dual extraction, in-table immateriality/restatements).
   - *Prompt:* `⏸️ Task 2 Complete! Type 'next' to proceed to Task 3...`
3. **Turn 3 (Task 3):** User types `"next"`. Agent runs **Skill 3** (YoY variance calculated as `((FY25 - FY24) / FY24) * 100`, $\ge 20\%$ variance filter, direct/related reasons).
   - *Prompt:* `⏸️ Task 3 Complete! Type 'next' to proceed to Task 4...`
4. **Turn 4 (Task 4 + Task 5):** User types `"next"`. Agent runs **Skill 4** (Auditor table, multi-location check, exhaustive GRI 305 GHG checklist, and self-correction recovery table) and immediately triggers **Skill 5** to generate the consolidated multi-tab Excel file (`[Company_Name]_FY25_ESG_Report.xlsx`) with `###0.000` numerical formatting.
