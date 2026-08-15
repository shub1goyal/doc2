# Analyst AI Web App — System Prompt Templates

This directory contains the system prompt presets used by the **Analyst AI Web Application**.

---

## 🏛️ Repository Architecture Context (Analyst AI vs Copilot Studio)

This repository contains **two distinct software projects**:
1. **Analyst AI Web Application (`/prompts`)**:
   - Single-turn LLM extraction prompt presets loaded directly by the Analyst AI Web App frontend.
   - Files: `esg_2025.txt`, `esg_2024.txt`, `esg_2023.txt`, `esg_2022.txt`, `presets.json`.
   - Optimized for single-prompt full ESG & Business extraction.
2. **Microsoft Copilot Studio Agent Packages (`/copilot_agents`)**:
   - Multi-turn Microsoft Copilot Studio agent orchestrator prompts, agent custom skills, and knowledge base files organized by agent:
     - `copilot_agents/copilot_studio_fy25`: Agent 1 (Variant 1: 5-Turn Human-in-the-Loop Extraction)
     - `copilot_agents/copilot_studio_fy25_variant2`: Agent 1 (Variant 2: 2-Turn Streamlined Extraction)
     - `copilot_agents/agent_2`: Agent 2 (Data Entry Validator & DPM Buddy)


---

## 📁 Files Included

- **`presets.json`**: Configuration file defining available prompt presets in the Web App UI.
- **`esg_2025.txt`**: FY25 Default ESG & Financial Data Extraction Prompt.
- **`esg_2024.txt`**: FY24 Default ESG & Financial Data Extraction Prompt.
- **`esg_2023.txt`**: FY23 Default ESG & Financial Data Extraction Prompt.
- **`esg_2022.txt`**: FY21/FY22 Default ESG & Financial Data Extraction Prompt.
- **`dummy_esg.txt`**: Sample ESG extraction report file.

---

## ⚙️ Key Extraction Rules & Domain Features in `prompts/`

* **Strict Table-Specific Reporting Boundary Isolation**: Forbids copy-pasting or spilling GHG organizational boundaries into Water, Waste, Energy, or Pollutant tables. Forces section-specific boundary extraction for each KPI table.
* **Strict Water Volume Data (Task 2B)**: Task 2B is strictly reserved for Water Volumes (Withdrawal by source, Consumption, Total Discharge including Waste Water Discharge, Recycled/Reused, Water Stress Area Disclosures). Pollutants are excluded from Task 2B.
* **Dedicated Air & Water Pollutants Schema (Task 2D)**: Dedicated table for all pollutants:
  - **Air Pollutants:** NOx, SOx, PM10, PM2.5, VOCs, HAPs / POPs.
  - **Water Pollutants:** Phosphorus / Total P, Nitrogen / Total N, Chemical Oxygen Demand (COD), Biological Oxygen Demand (BOD), Total Suspended Solids (TSS), Heavy Metals (Lead, Mercury, Cadmium, Chromium), Oil & Grease.
* **Default Target Year & Explicit User Multi-Year Override Mandate**: Defaults to the active target fiscal year for each prompt file, but honors explicit user requests if additional historical years are requested.