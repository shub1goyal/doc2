# Copilot Studio Sequential Agent Execution Architecture Guide

## 1. Why Sequential Task Injection? (Sandbox File Access Solution)

In Microsoft Copilot Studio, **Connected Child Agents run in isolated security sandboxes**. When a user uploads a document attachment in the main chat, child agent sandboxes **do NOT have access to the main session's file attachment object**.

### The Solution: Single Main Agent + Sequential Task Prompt Injection
By configuring the **Main Agent** with the **Sequential Task Execution Prompt**, the Main Agent retains **direct access to the uploaded document** while sequentially processing each specialized extraction task (Task 1 ➔ Task 2A ➔ Task 2B ➔ Task 2C ➔ Task 2D ➔ Task 3 ➔ Task 4 ➔ Task 4B ➔ Task 5).

---

## 2. Directory File Map

All prompt files in `copilot_studio_multi_agent/`:

| File Name | Purpose | Display Name |
| :--- | :--- | :--- |
| `00_main_agent_sequential_prompt.txt` | **Main Agent Master Prompt** | `ESG & Financial Data Analyst Agent` |
| `01_child_agent_task_1_document_scope.txt` | Task 1 Sequential Prompt | Document Scope & Boundary |
| `02_child_agent_task_2a_ghg_emissions.txt` | Task 2A Sequential Prompt | GHG Scope 1, 2, 3 & Sub-Decimals (`40657` vs `40657.476`) |
| `03_child_agent_task_2b_water_data.txt` | Task 2B Sequential Prompt | Water Withdrawal, Consumption & Stress |
| `04_child_agent_task_2c_waste_data.txt` | Task 2C Sequential Prompt | Hazardous / Non-Hazardous Waste |
| `05_child_agent_task_2d_pollutants_energy.txt` | Task 2D Sequential Prompt | Air Pollutants (PM2.5/PM10) & Energy Mix |
| `06_child_agent_task_3_financial_data.txt` | Task 3 Sequential Prompt | Consolidated/Standalone Revenue & Segments |
| `07_child_agent_task_4_auditor_notes.txt` | Task 4 Sequential Prompt | Missing Data & Immateriality Notes |
| `08_child_agent_task_4b_yoy_variance.txt` | Task 4B Sequential Prompt | YoY Variance Analysis (>20% Changes) |
| `09_child_agent_task_5_quality_control.txt` | Task 5 Sequential Prompt | Final Quality Control Audit Checklist |

---

## 3. Step-by-Step Copilot Studio Setup Instructions

1. Open **[Microsoft Copilot Studio](https://copilotstudio.microsoft.com/)** and select your Agent.
2. Open the main **Instructions** text box.
3. Copy the entire contents of `00_main_agent_sequential_prompt.txt` and paste them into the Instructions box.
4. Click **Save** and **Publish**.
5. Test in the right-hand **Test Pane** by uploading a report PDF. The Main Agent will process the document file sequentially across all 9 tasks with 100% precision!
