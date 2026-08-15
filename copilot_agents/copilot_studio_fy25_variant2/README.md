# Microsoft Copilot Studio — TruPulse-Staging (Variant 2: Modular Skills Setup Guide)

This guide contains all configuration settings, welcome messages, suggested prompts, and modular skill registry for deploying TruPulse-Staging (Variant 2) in Microsoft Copilot Studio.

===============================================================================
DIRECTORY FILES & MODULAR SKILLS
===============================================================================
1. 00_main_agent_instruction_variant2.txt -> Main Agent Orchestrator Prompt
2. skills/skill_1_scope_boundary_audit.md -> Task 1 Action Skill
3. skills/skill_2_data_extraction_tables.md -> Task 2 Action Skill
4. skills/skill_3_yoy_variance_engine.md -> Task 3 Action Skill
5. skills/skill_4_auditor_qc_engine.md -> Task 4 Action Skill
6. skills/skill_5_excel_workbook_builder.md -> Task 5 Action Skill
7. README.md -> This Configuration Guide

===============================================================================
COPILOT STUDIO AGENT SETTINGS (COPY-PASTE READY)
===============================================================================

-------------------------------------------------------------------------------
1. AGENT OVERVIEW / IDENTITY
-------------------------------------------------------------------------------

Agent Name:
TruPulse-Staging

Short Description:
Staging environment for TruPulse modular reasoning skills, granular corporate ESG extraction, self-correction QC engine, and multi-tab Excel workbook generation.

Theme / Icon:
- Avatar File: assets/trupulse_staging_avatar.jpg (3D Friendly AI Assistant Mascot Robot with Sprout)
- Color: Emerald Green (#059669) or Electric Blue (#2563EB)

Instructions (System Prompt):
Copy and paste the entire content of the file:
00_main_agent_instruction_variant2.txt

-------------------------------------------------------------------------------
2. WELCOME MESSAGE (TOPICS > SYSTEM > CONVERSATION START)
-------------------------------------------------------------------------------
Paste this directly into the "Send a message" node under Conversation Start topic:

Welcome to TruPulse-Staging!
I am your corporate ESG extraction and operational boundary auditor.

Upload your company's Annual Report, Sustainability Report, or BRSR PDF, then click a suggested prompt below or type "Start Task 1".

-------------------------------------------------------------------------------
3. SUGGESTED PROMPTS (CONVERSATION STARTERS)
-------------------------------------------------------------------------------
Add these clickable starter buttons on the agent overview page:

1. Start Task 1: Audit reporting scope and operational boundary
2. Start Task 2: Extract FY25 ESG data, emissions and financials
3. Start Task 3: Calculate YoY variance against FY24 baseline
4. Start Task 4: Run Auditor & QC check with 21-point GHG checklist
5. Start Task 5: Generate consolidated multi-tab Excel workbook
6. Extract multi-year data (FY23, FY24, FY25) for uploaded report

-------------------------------------------------------------------------------
4. GENERATIVE AI & KNOWLEDGE SETTINGS
-------------------------------------------------------------------------------
- Generative Orchestration / Dynamic Chaining: Enabled
- Content Moderation Level: Medium (Default)
- Knowledge Tab: Upload company ESG PDF reports only (Annual Reports, Sustainability Reports, BRSR).
  IMPORTANT: Do NOT upload prompt or instruction text files to the Knowledge tab.

-------------------------------------------------------------------------------
5. ACTIONS & SKILLS DEPLOYMENT (UPLOAD ALL 5 SKILLS)
-------------------------------------------------------------------------------
In Copilot Studio, go to Actions / Skills and upload each file:

Skill 1:
- File: skills/skill_1_scope_boundary_audit.md
- Name: trupulse-scope-boundary-audit
- Description: Audits corporate reporting boundaries, evaluates manufacturing/service revenue thresholds, determines Consolidated vs Partial classifications, and extracts GHG accounting approaches, SBTi targets, and assurance profiles for FY25.

Skill 2:
- File: skills/skill_2_data_extraction_tables.md
- Name: trupulse-data-extraction-tables
- Description: Extracts granular FY25 absolute quantitative data across 6 dedicated tables: GHG Scopes 1-3 emissions, water volumes, waste streams, energy data (with process emission checks), air/water pollutants, and financial segment/product revenues.

Skill 3:
- File: skills/skill_3_yoy_variance_engine.md
- Name: trupulse-yoy-variance-engine
- Description: Executes Year-over-Year (YoY) variance analysis comparing FY25 against the 1-year prior baseline (FY24 only) using the formula ((FY25 - FY24) / FY24) * 100, filtering for >=20% changes and extracting direct/related operational explanations.

Skill 4:
- File: skills/skill_4_auditor_qc_engine.md
- Name: trupulse-auditor-qc-engine
- Description: Audits missing environmental data, explicit immateriality statements, restatements, multi-location distinct values, executes an exhaustive 21-point GRI 305 GHG verification checklist, and runs automated self-correction recovery.

Skill 5:
- File: skills/skill_5_excel_workbook_builder.md
- Name: trupulse-excel-workbook-builder
- Description: Compiles and generates a downloadable, multi-tab Microsoft Excel (.xlsx) workbook dynamically named [Company_Name]_FY25_ESG_Report.xlsx, enforcing strict ###0.000 numerical cell formatting and native numeric types.

===============================================================================
5-TASK WORKFLOW SUMMARY
===============================================================================
- Turn 1 (Task 1): Upload report -> Runs Skill 1 -> Pause: Type 'next'
- Turn 2 (Task 2): User: 'next' -> Runs Skill 2 -> Pause: Type 'next'
- Turn 3 (Task 3): User: 'next' -> Runs Skill 3 -> Pause: Type 'next'
- Turn 4 (Task 4 + Task 5): User: 'next' -> Runs Skill 4 -> Automatically runs Skill 5 to build multi-tab Excel workbook.


