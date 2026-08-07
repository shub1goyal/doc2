# Copilot Studio Multi-Agent Architecture & Deployment Guide

This guide provides the complete architectural blueprint and click-by-click setup instructions for deploying an enterprise **Multi-Agent ESG and Financial Data Extraction System** in **Microsoft Copilot Studio** using **Connected Agents**.

---

## 1. System Architecture Blueprint

```
                                  ┌───────────────────────────────────────────┐
                                  │      PARENT AGENT (Supervisor)            │
                                  │     Name: ESG Master Supervisor           │
                                  │                                           │
                                  │  • System Instructions: Master Router     │
                                  │  • Document Input: Chat Upload Attachment │
                                  └─────────────────────┬─────────────────────┘
                                                        │
          ┌──────────────────┬──────────────────┬───────┴──────────┬──────────────────┬──────────────────┐
          │                  │                  │                  │                  │                  │
          ▼                  ▼                  ▼                  ▼                  ▼                  ▼
┌──────────────────┐┌──────────────────┐┌──────────────────┐┌──────────────────┐┌──────────────────┐┌──────────────────┐
│ CHILD AGENT 1    ││ CHILD AGENT 2    ││ CHILD AGENT 3    ││ CHILD AGENT 4    ││ CHILD AGENT 5    ││ CHILD AGENT 6    │
│ Document Scope   ││ GHG Specialist   ││ Water Specialist ││ Waste Specialist ││ Pollutants/Energy││ Financial Auditor│
│ (Task 1)         ││ (Task 2A)        ││ (Task 2B)        ││ (Task 2C)        ││ (Task 2D)        ││ (Task 3)         │
└─────────┬────────┘└────────┬─────────┘└────────┬─────────┘└────────┬─────────┘└────────┬─────────┘└────────┬─────────┘
          │                  │                  │                  │                  │                  │
          └──────────────────┴──────────────────┼──────────────────┴──────────────────┴──────────────────┘
                                                │
                                                ▼
                                   ┌─────────────────────────┐
                                   │ CHILD AGENT 9           │
                                   │ QC Inspector (Task 5)   │
                                   │ (Final Audit Verification│
                                   └─────────────────────────┘
```

---

## 2. Why Connected Agents Architecture?

1. **Bypasses Copilot Studio Instruction Size Caps**: Copilot Studio limits a single agent's instructions to ~5,300 cumulative characters. By dividing the pipeline into 9 Connected Child Agents, you get over **45,000 characters of instruction capacity**!
2. **Sub-Decimal Numeric Precision (`40657` vs `40657.476`)**: Each Child Agent focuses on a narrow task domain, preventing "lost-in-the-middle" LLM hallucinations and ensuring decimal figures are never rounded or truncated.
3. **No Power Automate / No Azure Keys Required**: Uses standard, native Copilot Studio Connected Agents and Instructions boxes that pass conversation attachments automatically.

---

## 3. Directory File Map

All prompts are saved in `copilot_studio_multi_agent/`:

| File Name | Agent Role | Display Name | Description |
| :--- | :--- | :--- | :--- |
| `00_main_parent_supervisor_agent.txt` | **Parent Agent** | `ESG Master Supervisor` | Master Router & Orchestrator |
| `01_child_agent_task_1_document_scope.txt` | **Child Agent 1** | `Child Agent 1: Document Scope` | Document ID & Boundary Classification |
| `02_child_agent_task_2a_ghg_emissions.txt` | **Child Agent 2** | `Child Agent 2: GHG Specialist` | Scope 1, 2, 3 Emissions & Sub-Decimal Rules |
| `03_child_agent_task_2b_water_data.txt` | **Child Agent 3** | `Child Agent 3: Water Specialist` | Water Withdrawal, Consumption & Stress |
| `04_child_agent_task_2c_waste_data.txt` | **Child Agent 4** | `Child Agent 4: Waste Specialist` | Hazardous / Non-Hazardous Waste Breakdown |
| `05_child_agent_task_2d_pollutants_energy.txt` | **Child Agent 5** | `Child Agent 5: Pollutants & Energy` | NOx, SOx, PM2.5, PM10 & Energy Mix |
| `06_child_agent_task_3_financial_data.txt` | **Child Agent 6** | `Child Agent 6: Financial Auditor` | Revenue, Segment Breakdown & Consistency |
| `07_child_agent_task_4_auditor_notes.txt` | **Child Agent 7** | `Child Agent 7: Auditor Notes` | Missing Data & Immateriality Notes |
| `08_child_agent_task_4b_yoy_variance.txt` | **Child Agent 8** | `Child Agent 8: Variance Specialist` | YoY Variance Analysis (>20% Changes) |
| `09_child_agent_task_5_quality_control.txt` | **Child Agent 9** | `Child Agent 9: QC Inspector` | Final Quality Audit Checklist |

---

## 4. Step-by-Step Copilot Studio Setup Instructions

### STEP 1: Create Child Agents
1. Go to **[Microsoft Copilot Studio](https://copilotstudio.microsoft.com/)**.
2. For each Child Agent file (`01` through `09`):
   - Click **+ Create agent**.
   - Copy **DISPLAY NAME** from the prompt file and paste it into the Name field.
   - Copy **SYSTEM INSTRUCTIONS** from the prompt file and paste them into the Instructions text box.
   - Click **Publish**.

### STEP 2: Create Parent Agent & Connect Child Agents
1. Click **+ Create agent**. Name it `ESG Master Supervisor`.
2. In the left navigation menu, click **Agents** (or **Connected Agents**).
3. Click **+ Connect an agent**.
4. Select all 9 Child Agents and click **Add**.

### STEP 3: Configure Parent Agent Instructions
1. Open `ESG Master Supervisor`'s **Instructions** box.
2. Copy the **SYSTEM INSTRUCTIONS** from `00_main_parent_supervisor_agent.txt` and paste it.
3. Click **Publish**.

---

## 5. Testing & Verification

1. In the right-hand **Test Pane** of Copilot Studio, click the attachment paperclip icon and upload an ESG / Annual Report PDF.
2. Type: *"Extract all ESG and Financial metrics for FY25."*
3. The Parent Agent will automatically orchestrate task delegation to all Connected Agents and display the verified markdown tables.
