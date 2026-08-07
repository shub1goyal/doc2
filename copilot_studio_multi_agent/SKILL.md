---
name: copilot-studio-multi-agent
description: Complete specification and instruction set for deploying a Multi-Agent ESG & Financial Extraction pipeline in Microsoft Copilot Studio using Connected Agents.
---

# Copilot Studio Multi-Agent Skill

## Overview
This skill documents the multi-agent orchestration architecture for Copilot Studio. It enables enterprise extraction of Environmental, Business, and Financial metrics from uploaded PDF reports.

## Core Multi-Agent Hierarchy
1. **Parent Agent (ESG Master Supervisor)**: Orchestrates request routing and synthesizes outputs.
2. **Child Agent 1 (Document Scope)**: Identifies company name, report type, reporting year, and ESG boundary classification.
3. **Child Agent 2 (GHG Specialist)**: Extracts Scope 1, 2 (location & market-based), Scope 3 (all 15 categories), enforcing sub-decimal precision (`40657` vs `40657.476`).
4. **Child Agent 3 (Water Specialist)**: Extracts water consumption, withdrawal, discharge, and water-stressed area metrics.
5. **Child Agent 4 (Waste Specialist)**: Extracts hazardous/non-hazardous waste generation and disposal routes.
6. **Child Agent 5 (Pollutants & Energy)**: Extracts NOx, SOx, PM2.5, PM10, and energy consumption mix.
7. **Child Agent 6 (Financial Auditor)**: Extracts total revenue, standalone revenue, segment breakdowns, and verifies segment-to-consolidated revenue sums.
8. **Child Agent 7 (Auditor Notes)**: Extracts immateriality notes, missing data justifications, and restatement details.
9. **Child Agent 8 (Variance Specialist)**: Performs YoY variance analysis (>20% changes) and extracts operational driver explanations.
10. **Child Agent 9 (QC Inspector)**: Executes final Quality Control audit checklist verifying numeric accuracy, boundary alignment, and zero hallucinations.

## Prompt Assets Location
All ready-to-use Copilot Studio system prompts are stored in `copilot_studio_multi_agent/`.
