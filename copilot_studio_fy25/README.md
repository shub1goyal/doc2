# Microsoft Copilot Studio — FY25 ESG Master Prompt (Human-in-the-Loop)

This directory contains the overrideable master prompt for **FY25 ESG Extraction** tailored specifically for **Microsoft Copilot Studio**.

---

## 📁 Files Included

* **`copilot_studio_esg_2025_prompt.txt`**: Full consolidated prompt with Human-in-the-Loop task stepping and pure Markdown output (no JSON).

---

## ⚙️ Key Copilot Studio Configuration Rules

1. **Human-in-the-Loop Flow (Task Stepping)**:
   - Copilot Studio runs **one task at a time**.
   - After completing each task (e.g. Task 1 Scope Audit), Copilot Studio displays the output table, prints:
     `⏸️ Task [X] Complete! Type 'next' to proceed to Task [Y].`
   - It pauses execution and waits for the user to type `next` or provide feedback/edits.

2. **Pure Markdown Output**:
   - Designed strictly for **GitHub-Flavored Markdown** rendering.
   - All JSON schema and JSON object constraints have been removed.

3. **Master S&P Trucost Methodology Integrated**:
   - Dedicated Task 1 Reporting Scope & Operational Boundary Audit.
   - Special Manufacturing Plant Rule + Service Segment >10% Override.
   - Revenue Coverage Rules (Geographical / Income Statement revenue only).
   - Mandatory `Consolidated` / `Partial` prefix tagging in `Reporting Boundary` column.
   - Multi-Page Exhaustive Scanning & Value Non-Collapsing Rule.
   - Scope 3 Disaggregation (Total Scope 3 + Categories 1–15).
   - Associate/Minority Interest (20%–50%) $\to$ Scope 3 Category 15.
   - REIT Operating Lease $\to$ Scope 3 Category 13.

---

## 🚀 How to Use in Copilot Studio

1. Open your Copilot Studio Bot / Agent topic.
2. Open `copilot_studio_esg_2025_prompt.txt` and copy its entire content.
3. Paste it as the **System Instructions** or **Topic Prompt** for your ESG Extraction Agent.
4. Upload your company's FY25 PDF report.
5. Copilot Studio will execute Task 1 and pause. Type `next` to move through Tasks 2A, 2B, 2C, 2D, 2E, 2F, 4, 4B, and the Final Summary!
