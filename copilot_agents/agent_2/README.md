# Microsoft Copilot Studio — Agent 2: Data Entry Validator & DPM Buddy

## Overview
**Agent 2 (Data Entry Validator & DPM Buddy)** is an expert quality assurance and process manual intelligence agent built for Microsoft Copilot Studio.

### Primary Functions:
1. **Multi-Modal Visual Data Entry Audit (Core Engine):** Audits uploaded data entry tool screenshots ("snaps") against extracted ESG disclosures, checking numeric values, units, flags, dropdowns, and boundary activity checkboxes.
2. **Process Manual & KMS Guidance:** Answers complex rule, methodology, and conversion questions grounded in the 6-document registry and hard-coded business rules (R1–R13).
3. **Escalation Detection:** Automatically flags 11 high-risk compliance patterns (e.g., negative water consumption, hazardous disposal to land, missing Scope 1 with fossil fuel, unevidenced market-based Scope 2).

---

## Deployment & Setup in Microsoft Copilot Studio

### Step 1: Create a New Agent in Copilot Studio
1. Open [Microsoft Copilot Studio](https://copilotstudio.microsoft.com/).
2. Click **Create** > **New agent**.
3. Name the agent: `Agent 2 - Data Entry Validator & DPM Buddy`.
4. Description: `Expert visual audit and quality assurance agent for ESG data entry screenshots and process manual guidance.`

### Step 2: Configure System Instructions
1. Navigate to **Overview** > **Instructions**.
2. Open `00_main_agent_instruction_dpm_buddy.txt`.
3. Copy the entire contents and paste into the **Instructions** text box.

### Step 3: Configure Generative AI & Multi-Modal Vision Settings
1. Navigate to **Settings** > **Generative AI**.
2. **Model Selection:** Select **GPT-4o** or **GPT-4.1** (ensuring multi-modal image input processing is active).
3. **Content Moderation:** Set to **Medium** or standard enterprise policy.
4. **Knowledge Grounding:** Enable *"Allow the AI to use its own general knowledge"* = **Off** (Strict Grounding only to attached Knowledge).

### Step 4: Upload Knowledge Base Reference Files
1. Navigate to **Knowledge** > **Add knowledge**.
2. Upload the following documents from this folder:
   - `knowledge_base/knowledge_base_dpm_buddy.txt`
   - `skills/dpm_buddy_knowledge/SKILL.md`
   - *(Optional)* Your team's Environmental Process Manual (DPM 7), Financial DPM, KMS Workbook, and Segment Calculation Manuals.

---

## How to Connect Agent 1 (Extraction) to Agent 2 (Validator)

You can link **Agent 1 (Extraction Agent - Variant 1 or Variant 2)** to **Agent 2 (Data Entry Validator)** using Copilot Studio's native **Connected Agent** or **Topic Action (Call an Agent)** feature:

### Method A: Native Connected Agent (Recommended)
1. Open your **Agent 1** (Variant 1 or Variant 2) in Copilot Studio.
2. Go to **Settings** > **Connected agents** (or **Child Agents**).
3. Click **Add connected agent** and select `Agent 2 - Data Entry Validator & DPM Buddy`.
4. Under description for routing, enter:
   > `Invoke this agent when the user uploads data entry tool screenshots (snaps) to validate entered values, units, flags, and boundaries against extracted ESG report data, or when the user asks specific process manual (DPM) questions.`

### Method B: Topic-Based Handoff / Transfer
1. In **Agent 1**, go to **Topics** > **Add a topic** > **From blank**.
2. Set Trigger Phrases:
   - *"Validate data entry screenshots"*
   - *"Audit my data entry snaps"*
   - *"Check tool entry against report"*
   - *"Here are the tool snaps"*
3. In the Topic canvas, add a node: **Agent action** > **Transfer to agent** (or **Call an action** > **Invoke Agent 2**).
4. Map input parameters:
   - `Extracted_ESG_Data` $\leftarrow$ Variable containing Task 1 to Task 5 extraction outputs.
   - `Uploaded_Images` $\leftarrow$ User uploaded image attachments.
5. Display Agent 2's generated **Executive Audit Report** and **Required Corrections Checklist** to the analyst.

---

## Audit Output Example

When an analyst uploads data entry screenshots, Agent 2 generates a clean, executive report:

```markdown
# 📋 Data Entry Audit Report — FY25 Disclosures

**Audit Status:** 🔴 ACTION REQUIRED (1 Discrepancy, 1 Flag Warning Found)
**Screenshots Analyzed:** 2 Screens (GHG Emissions Tab, Energy Tab)
**Reporting Boundary Evaluated:** Consolidated (98% Revenue Coverage)

---

#### 🔹 Tab: GHG Emissions (Scope 1 & Scope 2)
| Status | Field / Resource Name | Entered in Tool (Snap) | Expected Value (Extracted Evidence) | Audit Finding | Required Action | Rule / DPM Citation |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| `✅` | Scope 1 Total | 450,200 MT | 450,200 MT (Page 34, Table 3) | Exact match | None | Doc-1 DPM 7 Sec 3.1 |
| `⚠️` | Scope 2 Electricity | 82,100 MT (Market) | 82,100 MT (Location-Based) | Flag error: No contractual instruments disclosed | Change flag dropdown to 'Location-Based' | Rule R9 / DPM 7 Sec 3.2 |
| `❌` | Biogenic CO2 | [Blank] | 14,500 MT (Page 35, Table 3) | Omitted in tool; disclosed separately in report | Add row for Biogenic CO2 with 14,500 MT | DPM 7 Sec 3.4 |

---

### 🛠️ Required Corrections Checklist (Before Final Submission):
1. **[GHG Tab]** Switch Scope 2 dropdown flag from `Market-Based` to `Location-Based`.
2. **[GHG Tab]** Add missing `Biogenic CO2` line item with value `14,500 MT`.
```
