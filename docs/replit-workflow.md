# Pairly — Replit Agent Workflow Guide

This document defines execution rules and phase-by-phase criteria for developing Pairly:

## Workflow Rules
1. **Single Phase Discipline:** Implement only the current phase. Do not jump ahead to future phases prematurely.
2. **Preview Integrity:** Keep the application runnable in the live preview throughout development.
3. **Real Integrations:** Never fabricate user statistics, ratings, or artificial success notifications. If Supabase is unconfigured, display real setup status and actionable instructions.
4. **Secrets Management:** Keep API keys and credentials in Secrets or environment variables. Never commit credentials to source control.
5. **No AI Clutter:** Do not inject unsolicited chatbots, AI helpers, or LLM-based match guessing. Smart matching will be deterministic and arithmetic-based in Phase 4.
6. **Zero-Pill Discipline:** Follow clean typographic styling with subtle middot dividers and high-contrast accessible typography.
