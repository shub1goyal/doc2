# Microsoft Copilot Studio — FY25 ESG Master Agent & Skill Integration Guide

This directory contains the complete setup files for deploying a **Human-in-the-Loop ESG Extraction Agent** in **Microsoft Copilot Studio** utilizing Knowledge Base files and Custom Skills.

---

## 📁 Files Included

1. **`SKILL.md`**: The official Agent Custom Skill file (with YAML frontmatter header) containing full instructions, scope rules, and schemas for FY25 ESG extraction.
2. **`skills/fy25_esg_extraction/SKILL.md`**: Standard packaged skill folder ready for Agent Custom Skill loaders.
3. **`00_main_agent_instruction.txt`**: The Orchestrator prompt for Copilot Studio's Main Agent. Guides skill invocation at the start of each task, context preservation from previous task responses, and human-in-the-loop stepping.
4. **`copilot_studio_esg_2025_prompt.txt`**: Master prompt file for direct text copy-pasting or Knowledge Base upload.
5. **`README.md`**: This configuration and setup guide.

---

## 🛠️ Copilot Studio Architecture & Flow

```
                               ┌──────────────────────────────────────────────┐
                               │       Copilot Studio Main Agent              │
                               │    (Instruction: 00_main_agent_instruction)  │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      ▼
                      ┌──────────────────────────────────────────────────────────────┐
                      │      Agent Skill: SKILL.md (fy25_esg_extraction)           │
                      └──────────────────────────────┬───────────────────────────────┘
                                                     │
                                                     ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Task 1: Scope Audit  ──► Pause: "Type 'next'"  ──► User: "next"                                        │
│   ↓ (Pass Task 1 Output as Context)                                                                    │
│ Task 2: Comprehensive ESG & Financial Metrics  ──► Pause: "Type 'next'"  ──► User: "next"             │
│   ↓ (Pass Tasks 1 & 2 Outputs as Context)                                                              │
│ Task 3: YoY Variance Analysis (>=20%)  ──► Pause: "Type 'next'"  ──► User: "next"                        │
│   ↓ (Pass Tasks 1, 2 & 3 Outputs as Context)                                                           │
│ Task 4: Auditor & QC Mode Combined (Part A: Auditor, Part B: Multi-Location Audit, Part C: Coverage)   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Key Integration Features

* **Skill Invocation in Start of Each Task**: At the start of each task (Task 1 ➔ Task 2 ➔ Task 3 ➔ Task 4), the Main Agent invokes the Skill (`fy25_esg_extraction` / `SKILL.md`) to retrieve exact extraction rules, boundary rules, and table schemas.
* **Context Preservation Across Tasks**: Previous task responses are automatically included as active context for subsequent tasks so that YoY variance and auditor checks have 100% data continuity.
* **Cross-Document Company Match Check (Task 1)**: Verifies that all uploaded files belong to the same company; issues a warning callout if a mismatch is detected (`⚠️ CRITICAL WARNING: Company Mismatch Detected`).
* **Non-Negotiable Immateriality & Restatements**: Dedicated detail rows inside Task 2 data tables (`[Metric Name] - Immateriality Details` and `[Metric Name] - Restatement Details`) and full coverage in Task 4 Part A.
* **Multi-Location & Distinct Value Verification (Task 4 Part B)**: Audits whether any KPI appeared with different values across multiple pages/reports (e.g. Page 31 integer vs Page 125 decimal). Displays omitted/discrepant values in a Markdown table.
* **Pure Markdown Output**: No JSON output or code blocks. All responses are formatted in clean Markdown text and tables.

---

## 🚀 Step-by-Step Copilot Studio Deployment

### Option A: Using as a Custom Agent Skill (`SKILL.md`)
1. Import `SKILL.md` (or the folder `skills/fy25_esg_extraction/`) into your agent framework / Copilot Studio custom skills repository.
2. Set `00_main_agent_instruction.txt` as the Main Agent System Instruction.

### Option B: Uploading to Knowledge Base
1. In Copilot Studio, go to **Knowledge** / **Generative Answers**.
2. Upload `SKILL.md` or `copilot_studio_esg_2025_prompt.txt` as a reference Knowledge document.
3. Paste `00_main_agent_instruction.txt` into your Main Agent Instructions.
