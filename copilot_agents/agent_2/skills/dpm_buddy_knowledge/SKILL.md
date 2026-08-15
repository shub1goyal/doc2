---
name: dpm_buddy_knowledge
description: Expert ESG Data Entry Validation and Process Manual (DPM 7 / KMS / Segment Calc) intelligence skill for Microsoft Copilot Studio.
version: 3.0
---

# DPM Buddy & Data Entry Validation Skill

This skill equips Microsoft Copilot Studio agents to perform comprehensive visual audits of data entry tool screenshots ("snaps") against extracted ESG disclosures, and provide instant, citation-backed guidance on operating procedures, hard-coded business rules (R1–R13), and escalation protocols.

## Core Capabilities

1. **Visual Data Entry Screen Audit (Primary Function):**
   - Automatically cross-checks numeric entries, unit selections, dropdown flags, and scope checkboxes across all data entry tool tabs.
   - Compares tool state with extracted report tables (GHG, Energy, Water, Waste, Pollutants, Financials).
   - Generates an executive audit table with clear status badges (`✅ Match`, `⚠️ Flag Error`, `❌ Missing Item`, `🔄 Unit Discrepancy`, `⛔ Boundary Mismatch`).
   - Delivers an actionable numbered checklist of required fixes before submission.

2. **Process Manual & KMS Guidance (Secondary Function):**
   - Authoritative lookup across the 6-Document Registry (Environmental DPM 7, Financial DPM, Operational DPM, KMS Workbook, Banking Segment Calc, Insurance Segment Calc).
   - Strict 3-line output anchor (`Answering query: ...`, `Segment context: ...`, `Source: ...`).

3. **Escalation Trigger Monitoring:**
   - Detects 11 critical risk patterns (negative water consumption, hazardous disposal to land, missing Scope 1 with fossil fuels, unevidenced market-based Scope 2, restatements >20%).

## Key Validation Guidelines

### Numeric Transcription
- Verify exact figure match against published disclosures.
- Check for comma/period transposition and scaling discrepancies.

### Unit Selection & Concordance
- **GHG Emissions:** Metric Tonnes (MT / t) CO2e.
- **Energy:** MWh or GJ (apply GCV vs. NCV factor if specified).
- **Water:** Cubic Meters (m³) or Megaliters (ML).
- **Waste:** Metric Tonnes (MT).

### Flags & Dropdown Settings
- **Scope 2:** Default to `Location-Based` unless contractual instruments (RECs, GOs, PPAs) are evidenced (Rule R9).
- **Biogenic Emissions:** Must be reported in a separate line item, never merged with Scope 1 direct fossil emissions (Rule R8).
- **Water Use:** In FY24+ disclosures without process/cooling breakdown, map to `Unspecified Use` without model ratio proration (Rule R6).
- **Waste Streams:** Prioritize `Disposed Waste` over `Generated Waste` (Rule R7).
- **Scope 1 Energy Exclusions:** Note warning for pure process-emission sectors where fuel is non-combustive.

### Boundary & Activity Checkboxes
- In Partial Scope boundaries, verify that un-covered business activities are deselected in the tool (Rule R12). Analysts must not perform manual ratio downscaling.

## Audit Output Schema

```markdown
# 📋 Data Entry Audit Report — FY25 Disclosures

**Audit Status:** [🟢 100% VERIFIED — READY FOR SUBMISSION] OR [🔴 ACTION REQUIRED — (X Discrepancies Found)]
**Screenshots Analyzed:** [Recognized Tabs]
**Reporting Boundary Evaluated:** [Consolidated / Partial Boundary]

---

#### 🔹 Tab: [Tab Name]
| Status | Field / Resource Name | Entered in Tool (Snap) | Expected Value (Extracted Evidence) | Audit Finding | Required Action | Rule / DPM Citation |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| `✅` / `⚠️` / `❌` / `🔄` | [Field Name] | [Tool Value & Unit] | [Report Value & Unit] | [Finding Description] | [Fix Action] | [Citation] |

---

### 🛠️ Required Corrections Checklist:
1. **[Tab Name]** [Specific actionable fix].
```
