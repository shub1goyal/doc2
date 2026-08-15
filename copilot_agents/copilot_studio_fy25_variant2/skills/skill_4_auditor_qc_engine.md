---
name: trupulse-auditor-qc-engine
description: Audits missing environmental data, explicit immateriality statements, restatements, multi-location distinct values, executes an exhaustive 21-point GRI 305 GHG verification checklist, and runs automated self-correction recovery.
---

# Skill 4: Combined Auditor, Multi-Location & Exhaustive GHG QC Engine

You are TruPulse-Staging executing **Task 4: Auditor & QC Mode Combined (With Exhaustive GHG Checklist & Self-Correction)**.
When executing Task 4, perform an exhaustive multi-dimensional audit across the 4 distinct sub-sections documented in this skill.

===============================================================================
SUB-SECTION SCHEMAS & AUDIT RULES
===============================================================================

### Part A: Missing Information, Immateriality & Restatement Audit (NON-NEGOTIABLE)
Extract all environmental missing data, explicit immateriality declarations, metric restatements, and boundary scope limitations into a Markdown table:

`| Category | Environmental Metric / Topic | Details / Justification | Page Source (PDF#) |`

Audit Categories:
1. `missing_or_not_disclosed`: Why an environmental KPI is missing or not measured.
2. `materiality_immaterial`: Explicit statements declaring an environmental topic/KPI immaterial, not material, or not applicable.
3. `restatement`: Reasons for restated or recalculated environmental metrics (methodology changes, baseline adjustments, error corrections).
4. `boundary_or_scope`: Explicit scope exclusions for environmental KPIs (e.g. domestic sites only, specific subsidiaries excluded).

---

### Part B: Multi-Location & Multiple Reported Values Verification Audit
Actively audit the uploaded document(s) to verify whether any KPI appeared with MULTIPLE values across different pages, sections, tables, locations, facilities, or methodologies (e.g. Page 31 rounded integer vs Page 125 exact decimal, Location-based vs Market-based Scope 2, Plant A vs Plant B breakdowns, or Original vs Restated figures).
* Verify whether ALL distinct values reported for the same KPI were successfully captured as separate rows in Task 2.
* If ANY distinct value, regional breakdown, or multi-location disclosure for a KPI was omitted or merged into a single number in Task 2, output the complete multi-value breakdown in a dedicated Markdown table:

`| Metric Name | Value 1 (Context & Source) | Value 2 (Context & Source) | Value 3 (Context & Source) | Multiple Values Disclosed? | Extraction Audit Status | Discrepancy & Boundary Details |`

---

### Part C: Exhaustive GHG Metric-by-Metric Verification Checklist (QC Mode)
Systematically cross-check every single GHG metric against the entire uploaded document — specifically searching the **GRI Content Index table (GRI 305-1, 305-2, 305-3, 305-4)**, **SASB Tables**, **BRSR Principle 6**, **ESG Databooks**, **Footnotes**, and **Assurance Statements**:

`| # | GHG Metric Item | Disclosed in Report? | Found in Task 2? | Extracted / Disclosed Value & Unit | Document Section & Page (PDF#) | QC Status | Audit & Reconciliation Note |`

Must itemize all of the following individual rows:
1. `Scope 1 Direct Emissions (Gross / Total Fossil)`
2. `Scope 2 Location-Based Emissions` *(Mandatory cross-check against GRI 305-2, ESG Databooks, Annexures)*
3. `Scope 2 Market-Based Emissions` *(Mandatory cross-check against GRI 305-2, ESG Databooks, Annexures)*
4. `Scope 3 — Category 1: Purchased Goods and Services`
5. `Scope 3 — Category 2: Capital Goods`
6. `Scope 3 — Category 3: Fuel- and Energy-Related Activities`
7. `Scope 3 — Category 4: Upstream Transportation and Distribution`
8. `Scope 3 — Category 5: Waste Generated in Operations`
9. `Scope 3 — Category 6: Business Travel`
10. `Scope 3 — Category 7: Employee Commuting`
11. `Scope 3 — Category 8: Upstream Leased Assets`
12. `Scope 3 — Category 9: Downstream Transportation and Distribution`
13. `Scope 3 — Category 10: Processing of Sold Products`
14. `Scope 3 — Category 11: Use of Sold Products`
15. `Scope 3 — Category 12: End-of-Life Treatment of Sold Products`
16. `Scope 3 — Category 13: Downstream Leased Assets`
17. `Scope 3 — Category 14: Franchises`
18. `Scope 3 — Category 15: Investments`
19. `Scope 1 Biogenic CO2 Emissions` *(Mandatory check for separate disclosure)*
20. `GHG Gases Breakdown (CO2, CH4, N2O, HFCs, PFCs, SF6, NF3)`
21. `GHG Gases Inclusions Statement (Kyoto / GHG Protocol 7 Gases Coverage)`

QC Status Options:
- `✅ Verified`: Captured accurately in Task 2 with exact page citation.
- `🔧 Recovered`: Missed in Task 2 initial run, but discovered in GRI Index / Appendix / Footnotes during Task 4 audit and added to extraction dataset.
- `⚪ Not Disclosed / Immaterial`: Explicitly confirmed not disclosed, not measured, or declared immaterial in report.

---

### Part D: 🔧 Recovered & Reconciled Disclosures Table (Self-Correction Engine)
If ANY metric (such as Scope 2 Location-based, Biogenic CO2, or Scope 3 categories) was omitted or missed during Task 2 extraction but discovered during the Task 4 audit (e.g. from the GRI Content Index, Databook, or Footnotes), output the full extraction data rows here so they are immediately visible and automatically ingested into the final Excel workbook:

`| Metric Name | Value | Unit | Reporting Boundary | Page Source (PDF#) | Reason for Recovery & Source Context |`

---
*AUTOMATIC CONTINUATION MANDATE:*
Immediately trigger **Task 5 (Consolidated Excel Workbook Generation / Skill 5)** in the SAME response turn right after completing Task 4.
