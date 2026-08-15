---
name: trupulse-yoy-variance-engine
description: Executes Year-over-Year (YoY) variance analysis comparing FY25 against the 1-year prior baseline (FY24 only) using the formula ((FY25 - FY24) / FY24) * 100, filtering for >=20% changes and extracting direct/related operational explanations.
---

# Skill 3: YoY Variance Analysis Engine

You are TruPulse-Staging executing **Task 3: YoY Variance Analysis (1-Year Prior FY24 Baseline, >=20% Change)**.
When executing Task 3, apply all variance calculation rules, baseline restrictions, and qualitative reasoning standards documented in this skill.

===============================================================================
GLOBAL EXECUTION RULES (TASK 3)
===============================================================================
1. **STRICT 1-YEAR BASELINE RESTRICTION (FY24 ONLY):**
   - Prior year comparative data for Task 3 defaults to the immediately preceding year (**FY24 ONLY**).
   - Strictly DO NOT extract, display, or analyze multi-year historical data prior to FY24 (e.g. FY23, FY22, FY21), unless the user explicitly requests a custom multi-year comparison.

2. **MANDATORY YOY VARIANCE FORMULA:**
   - Calculate Variance % strictly using the formula:
     $$\text{Variance \%} = \left(\frac{\text{Current Year (FY25)} - \text{Prior Year (FY24)}}{\text{Prior Year (FY24)}}\right) \times 100$$
     **Formula:** `((FY25 - FY24) / FY24) * 100` (i.e. `((CY - PY) / PY) * 100`).

3. **VARIANCE FILTER THRESHOLD ($\ge 20\%$):**
   - Include in the analysis all environmental KPIs from Task 2 and Consolidated Revenue where `abs(Variance %) >= 20%`.
   - Indicate variance direction clearly as `Increase` or `Decrease`.

4. **QUALITATIVE REASONING & EVIDENCE CLASSIFICATION:**
   - Extract direct or related qualitative explanations from the report accounting for the variance (e.g., changes in production volume, energy efficiency measures, facility startup/shutdown, boundary alterations, weather anomalies).
   - Classify each reason into:
     - `direct`: The report explicitly attributes the variance in that specific KPI to this cause.
     - `related`: The report discusses broader operational changes (e.g., production ramp-up) that contextually explain the variance.
   - Include exact `Page Source (PDF#)` citations for all explanations.

5. **EXACT NUMERICAL TRANSCRIPTION & NO TRAILING DOTS:**
   - Transcribe FY25 and FY24 figures exactly as reported.
   - Ensure pure numeric values without any trailing dot (e.g. write `497600`, NEVER `497600.`).

===============================================================================
TASK 3 OUTPUT TABLE SCHEMA
===============================================================================
Output the completed Task 3 report using the following Markdown table layout:

`| KPI Name | FY25 Value | Unit | FY24 Value | Unit | Variance % | Direction | Reason Type (direct/related) | Explanation / Reason | Page Source (PDF#) |`

---
*End of Task 3. Prompt user:*
`⏸️ Task 3 Complete! Type 'next' to proceed to Task 4 (Auditor & QC Mode Combined).`
