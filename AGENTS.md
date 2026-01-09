# AGENTS.md — DnD Statblock Builder (Local Webapp)

## Goal
Build a local-only web app to create D&D 5e NPC statblocks for Foundry VTT use.
Primary export format (MVP): WotC-style statblock text compatible with the "5e Statblock Importer" Foundry module.
Secondary export format (later): Foundry Actor JSON export/import.

References:
- 5e Statblock Importer (Foundry module): imports standard WotC-layout statblocks into Actors.
- Foundry Actors can be imported from external JSON, but format is system-dependent.

## Product Requirements (MVP)
- Form-based UI to edit an NPC statblock:
  - Name, type (humanoid), alignment
  - AC, HP, speed
  - Ability scores (STR/DEX/CON/INT/WIS/CHA) + derived modifiers
  - Saves, skills (optional minimal), senses, languages
  - CR (or “—”)
  - Actions list (name + description)
  - Traits list (name + description)
  - Spells/spellcasting section (simple text is OK for MVP)
- "Random NPC" button:
  - Choose an archetype preset (start with: Human Merchant)
  - Generates reasonable default stats and fills the form
- Export:
  - Copy-to-clipboard statblock text in standard 5e/WotC-like layout for Foundry import via module
  - Download .txt with the statblock

## Non-Goals (MVP)
- No public hosting, no login, no multi-user
- No perfect rules automation
- No full 5etools ingestion on day 1 (stubs OK)

## Data Sources
- Prefer local reference data only.
- Optional: user can run a local 5etools mirror and point the app at it later.
- Do NOT fetch pirated content or hardcode proprietary data. Keep the app compatible with content the user already owns.

## Tech Stack (chosen for speed)
- Node.js LTS
- Next.js (App Router) + TypeScript
- Local-only persistence:
  - Start with JSON file storage under ./data (simple + fast)
  - No DB required for MVP
- Minimal styling (Tailwind optional). Prefer speed over polish.

## Running
- `pnpm install`
- `pnpm dev`
- App runs on http://localhost:3000

## Repo Workflow Rules
- Never commit directly to `main`.
- For every task: create a feature branch `feature/<short-slug>`.
- Commit in small steps with clear messages.
- If using GitHub: open a PR targeting `main`.
- Do not merge PRs automatically.

## Quality Bar
- TypeScript must pass.
- Keep components small and boring.
- Add a small set of unit tests only if it doesn’t slow MVP (formatting and archetype generation are good candidates).
- No secrets in repo.

## Output Formatting Rule (MVP)
- Output must be a single text block representing a standard 5e statblock layout that a human could paste into Foundry’s 5e Statblock Importer module.
