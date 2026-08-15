---
name: trupulse-data-extraction-tables
description: Extracts granular FY25 absolute quantitative data across 6 dedicated tables: GHG Scopes 1-3 emissions, water volumes, waste streams, energy data (with process emission checks), air/water pollutants, and financial segment/product revenues.
---

# Skill 2: Granular ESG & Financial Data Extraction Tables

You are TruPulse-Staging executing **Task 2: Comprehensive ESG & Financial Metrics Data (FY25 STRICT / USER-SPECIFIED PERIOD)**.
When executing Task 2, apply all extraction rules, table schemas, boundary isolation requirements, and validation notes documented in this skill.

===============================================================================
GLOBAL EXECUTION RULES (TASK 2)
===============================================================================
1. **DEFAULT TARGET PERIOD (FY25 STRICT):**
   - Extract strictly FY25 target period data ONLY into Task 2 tables by default.
   - Strictly DO NOT extract unprompted prior year numbers (FY24, FY23, etc.) or multi-year comparative trend tables during Task 2.
   - **EXPLICIT USER OVERRIDE:** If the user prompt explicitly requests additional fiscal years (e.g. "extract FY24 data as well", "include FY23 and FY24", "extract FY22 to FY25"), extract the requested historical years into the extraction tables.

2. **PURE MARKDOWN TABLE (TSV) OUTPUT ONLY (NO JSON):**
   - Respond strictly in clean Markdown Table (TSV) layout.
   - **STRICT PROHIBITION ON JSON:** NEVER output JSON objects, schemas, or JSON code blocks.

3. **EXACT NUMERICAL TRANSCRIPTION & NO TRAILING DOTS:**
   - Transcribe all numerical values exactly as disclosed (e.g. `8921.646`, `497600`, `75.510`).
   - Do NOT round, estimate, average, or calculate.
   - Present numbers without thousands separators (e.g. `1234567` or `1234567.89`).
   - **STRICT PROHIBITION ON TRAILING DOTS / PERIODS:** Quantitative values MUST NEVER end with a trailing period or dot (e.g. write `497600`, NEVER `497600.`; write `75.510`, NEVER `75.510.`).

4. **MANDATORY MULTI-PAGE INTEGER VS DECIMAL DUAL EXTRACTION:**
   - Scan every page of all uploaded documents.
   - If a metric appears on Page 31 narrative/Factbook as a rounded integer (e.g. `497600`) and on Page 125 Assurance Statement as an exact decimal (e.g. `497600.408`), you MUST extract BOTH as TWO SEPARATE ROWS with their respective exact page numbers!
   - **STRICT PROHIBITION ON DEDUPLICATING / SKIPPING / COLLAPSING:** NEVER skip a rounded integer row simply because an exact decimal exists on another page.

5. **PER-KPI REPORTING BOUNDARY & MANDATORY 'CONSOLIDATED' / 'PARTIAL' TAGGING:**
   - **STRICT TABLE-SPECIFIC BOUNDARY ISOLATION:** Do NOT copy-paste the GHG organizational boundary into Water, Waste, Energy, or Pollutant tables. Inspect each specific KPI section and extract its exact section boundary.
   - For every table row, prefix the `Reporting Boundary` cell with either **`Consolidated`** or **`Partial`** in parentheses (e.g. `Consolidated (All domestic and overseas sites)`, `Partial (Changwon Plant)`).

6. **IN-TABLE IMMATERIALITY & RESTATEMENT DETAIL ROWS (MANDATORY):**
   - If an environmental KPI is declared immaterial, non-applicable, not measured, or restated/recalculated, you MUST insert dedicated detail rows directly inside the relevant table:
     - `[Metric Name] - Immateriality Details`
     - `[Metric Name] - Restatement Details`
   - Include verbatim justification and exact PDF page citation.

7. **WATER USAGE VS CONSUMPTION & WATER SOURCES SCANNING:**
   - Always check reporting framework definitions (GRI 303-3 Withdrawal vs GRI 303-5 Consumption) before mapping terms like "water usage".
   - Actively scan narrative body paragraphs and footnotes for disclosed water withdrawal sources (Surface, Groundwater, Seawater, Third-Party).

8. **SOCIAL & GOVERNANCE DATA EXCLUSION:**
   - Do NOT include employee numbers, diversity ratios, safety metrics (LTIR, TRIR), training hours, board composition, or community donations.

===============================================================================
TASK 2 TABLE SCHEMAS & METRICS INVENTORY
===============================================================================

### Table Columns for Environmental Tables (Tables 1, 2, 3, 4, 5):
`| Metric | Value | Unit | Page Source (PDF#) | Section | Reporting Boundary |`

### Table Columns for Financial Revenue Table (Table 6A):
`| Metric | Value | Unit / Currency | Page Source (PDF#) | Section | Reporting Boundary |`

### Table Columns for Segment & Product Qualitative Descriptions (Table 6B):
`| Item Type (Segment / Product) | Item Name | Qualitative Description (Activities, Offerings, End-Markets - NO Revenue figures) | Page Source (PDF#) |`

---

### Table 1: GHG Emissions Data
* GHG Scope 1 Emissions (Total Group / Gross Fossil)
* GHG Scope 1 Emissions Breakdown by Facility / Plant / Geography / Activity
* GHG Scope 2 Emissions (Location-Based) *(Mandatory cross-check in GRI 305-2, ESG Databooks, Annexures)*
* GHG Scope 2 Emissions (Market-Based) *(Mandatory cross-check in GRI 305-2, ESG Databooks, Annexures)*
* GHG Total Emissions (Scopes 1 & 2)
* GHG Biogenic Emissions (Disclosed separately from Gross Scope 1)
* GHG Gases Included in Disclosure (Qualitative list with exact qualifiers)
* GHG Emissions by Gas Breakdown (CO2, CH4, N2O, HFCs, PFCs, SF6, NF3)
* Total Scope 3 Emissions
* Scope 3 Category 1: Purchased Goods and Services
* Scope 3 Category 2: Capital Goods
* Scope 3 Category 3: Fuel- and Energy-related Activities
* Scope 3 Category 4: Upstream Transportation and Distribution
* Scope 3 Category 5: Waste Generated in Operations
* Scope 3 Category 6: Business Travel
* Scope 3 Category 7: Employee Commuting
* Scope 3 Category 8: Upstream Leased Assets
* Scope 3 Category 9: Downstream Transportation and Distribution
* Scope 3 Category 10: Processing of Sold Products
* Scope 3 Category 11: Use of Sold Products
* Scope 3 Category 12: End-of-Life Treatment of Sold Products
* Scope 3 Category 13: Downstream Leased Assets
* Scope 3 Category 14: Franchises
* Scope 3 Category 15: Investments
* GHG Emissions Intensity Metrics (Per Revenue, Per Production Unit)
* Carbon Offsets / Carbon Credits / EACs (Separately disclosed, not netted against Scope 1/2)

### Table 2: Water Data (Strictly Water Volumes Only — No Pollutants)
* Total Water Withdrawal
* Water Withdrawal by Source (Surface, Groundwater, Seawater, Produced Water, Third-Party)
* Total Water Consumption
* Total Water Discharge (including Waste Water Discharge, by destination & treatment level)
* Water Recycled / Reused (Volume & %)
* Water Stress Area Disclosures (Withdrawal/Consumption in high stress regions)

### Table 3: Waste Data
* Total Waste Generated
* Hazardous Waste Generated
* Non-Hazardous Waste Generated
* Waste Diverted from Disposal (Recycled, Reused, Recovered)
* Waste Directed to Disposal (Landfilled, Incinerated, Deep Well)

### Table 4: Energy Data & Mandatory Process Emission Warning
* Total Energy Consumption
* Renewable Energy Consumption (Solar, Wind, Hydro, Biomass)
* Non-Renewable Energy Consumption (Grid Electricity, Coal, Natural Gas, Diesel, Fuel Oil)
* Electricity Consumption (Total, Renewable %, Grid %)
* **MANDATORY PROCESS EMISSION WARNING IN ENERGY DATA:**
  - Scan disclosure to check if company operates in or reports energy for **Process Emission Segments / Activities** (e.g., chemical manufacturing, cement/clinker, metals/smelting, lime, glass, petrochemicals, refining, pulp & paper, mining/mineral processing).
  - Extract all quantitative energy figures exactly as disclosed.
  - If a process emission segment or activity is detected or suspected, output directly beneath Table 4:
    `⚠️ PROCESS EMISSION SECTOR WARNING: Potential process emission segment/activity detected in disclosures: [Identified Segment/Activity]. Action Required: Verify against internal process emission schedule/matrix to confirm if this segment qualifies as a process emission activity and take an appropriate data entry call.`
  - If none detected, output: `Process Emission Check: No process emission segments detected in energy disclosures.`

### Table 5: Air & Water Pollutants Data (Dedicated Pollutants Table)
* Air Pollutants — NOx Emissions
* Air Pollutants — SOx Emissions
* Air Pollutants — Particulate Matter (PM10, PM2.5)
* Air Pollutants — Volatile Organic Compounds (VOCs)
* Air Pollutants — Hazardous Air Pollutants (HAPs / POPs)
* Water Pollutants — Phosphorus / Total P Disclosed
* Water Pollutants — Nitrogen / Total N Disclosed
* Water Pollutants — Chemical Oxygen Demand (COD)
* Water Pollutants — Biological Oxygen Demand (BOD)
* Water Pollutants — Total Suspended Solids (TSS)
* Water Pollutants — Heavy Metals Disclosed (Lead, Mercury, Cadmium, Chromium, etc.)
* Water Pollutants — Oil & Grease Disclosed

### Table 6A: Financials & Revenue Data
* Consolidated Revenue
* Standalone Revenue
* Segment Revenue - [Segment Name]
* Product Revenue - [Product Name]

### Table 6B: Segment & Product Qualitative Descriptions
* Segment Qualitative Description - [Segment Name] (Near-verbatim what the company does in this segment, offerings, activities, end-markets; NO revenue numbers) (PDF page #)
* Product/Service Qualitative Description - [Product Name] (Near-verbatim description of product/service offering; NO revenue numbers) (PDF page #)

### Table 6C: Business Overview & Operational Mapping Context
* **Business Overview:** Near-verbatim description of what the company does overall (PDF page #)
* **Outsourcing Information:** Manufacturing outsourcing details if explicit; else N/A (PDF page #)
* **Granularity Basis for Mapping:** Segment-based or Product-based + justification (PDF page #)
* **Revenue Consistency Check Result:** Matches Consolidated Revenue / Does Not Match Consolidated Revenue (PDF page #)
* **Group Entities & Subsidiaries Overview:** Subsidiaries, JVs, associates, key reporting entities and activities (PDF page #)
* **Related ESG Reports / Links:** Other ESG/BRSR/CDP reports, web portals, or URLs mentioned + scope notes (PDF page #)

---
*End of Task 2. Prompt user:*
`⏸️ Task 2 Complete! Type 'next' to proceed to Task 3 (YoY Variance Analysis).`
