# Microsoft Copilot Studio — TruPulse (Production Agent Setup Guide)

This guide contains all configuration settings, welcome messages, suggested prompts, and copy-paste values for deploying TruPulse in Microsoft Copilot Studio.

===============================================================================
DIRECTORY FILES
===============================================================================
1. 00_main_agent_instruction.txt  -> Main Agent System Instructions (Orchestrator)
2. skills/fy25_esg_extraction/SKILL.md -> Action Skill (Extraction Logic & Schemas)
3. README.md                      -> This Configuration Guide

===============================================================================
COPILOT STUDIO AGENT SETTINGS (COPY-PASTE READY)
===============================================================================

-------------------------------------------------------------------------------
1. AGENT OVERVIEW / IDENTITY
-------------------------------------------------------------------------------

Agent Name:
TruPulse

Short Description:
Autonomous enterprise copilot that audits reporting scopes, extracts granular Scope 1-3 emissions and ESG metrics, runs YoY variance analysis, and compiles audit-ready Excel workbooks.

Theme / Icon:
- Avatar File: assets/trupulse_avatar.jpg (Modern Circular Badge with Glowing Emerald Pulse Leaf)
- Color: Forest Green (#0F766E) or Deep Slate

Instructions (System Prompt):
Copy and paste the entire content of the file:
00_main_agent_instruction.txt

-------------------------------------------------------------------------------
2. WELCOME MESSAGE (TOPICS > SYSTEM > CONVERSATION START)
-------------------------------------------------------------------------------
Paste this directly into the "Send a message" node under Conversation Start topic:

Welcome to TruPulse!
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
5. ACTIONS & SKILLS DEPLOYMENT
-------------------------------------------------------------------------------
1. In Copilot Studio, navigate to Actions / Skills.
2. Add a new Custom Action / Skill.
3. Upload or paste the file:
   skills/fy25_esg_extraction/SKILL.md
4. Skill Name: fy25-esg-extraction
   Description: Systematically extracts FY25 Corporate ESG metrics, Scope 1-3 GHG emissions, operational boundaries, water, waste, energy, air pollutants, financials, and auditor disclosures from company reports using a 5-Task Human-in-the-Loop workflow.

===============================================================================
5-TASK WORKFLOW SUMMARY
===============================================================================
- Task 1: Scope & Operational Audit (Pause for user confirmation)
- Task 2: ESG & Financial Data (FY25 Strict Target Period) (Pause)
- Task 3: YoY Variance Analysis (1-Year Prior FY24 Baseline, >=20% Variance) (Pause)
- Task 4: Combined Auditor & QC Mode (Immateriality, Multi-Location, 21-Point Checklist & Self-Correction)
- Task 5: Consolidated Excel Workbook (.xlsx) Generation (Automatic trigger after Task 4)



