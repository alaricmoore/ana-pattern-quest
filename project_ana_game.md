---
name: ANA Pattern Recognition Game
description: React web app for identifying ANA ICAP AC patterns from immunofluorescence images, Foldit-inspired, part of larger Immuno Goblin pedagogical universe
type: project
---

## Game Overview
Building a React web app game for ANA ICAP AC pattern recognition from immunofluorescence microscopy images. Inspired by Foldit (crowdsourced protein folding).

**Why:** Commercial AI (Quest Diagnostics etc.) is bad at rare patterns like AC-25 (spindle apparatus — looks like "bright green mitosis" to AI). Crowdsourced human pattern recognition could supplement AI, plus it's educational. ANA pattern training is currently gated behind medical school lab rotations — no public-facing way to learn.

**How to apply:**
- MVP: One page, two ANA images side by side, pick which is AC-X, immediate feedback
- Full game: quiz mode, image annotation/tracing, progressive difficulty (common → rare)
- Source images from anapatterns.org (ICAP, openly available) and other public/open-access resources
- Progressive tiers: competent-level patterns first, expert-level later
- ICAP grouping (nuclear, cytoplasmic, mitotic, composite) structures progression
- Mitotic patterns need own dedicated module (cell cycle stage matters as much as staining distribution)

## Part of Immuno Goblin Universe
The game sits within a larger pedagogical project teaching immunology via anthropomorphized "immuno goblins" (immunoglobulins). Each AC pattern could link to which goblin/cell type "made the mess."

## Tech Context
- Alaric has: Raspberry Pi 4 → Tailscale → Oracle Cloud VM → sardines.duckdns.org
- Flask + SQLite existing infrastructure (Biotracker/SARDines)
- Familiar with HTML, basic JS, Python web dev
- Building React app initially, deployable later to her infrastructure

## Design Principles (from Alaric, load-bearing)
1. Immune cells as characters with jobs — relational scaffold for abstract content
2. Labs as clues, not verdicts
3. Patient is authority on own symptoms even when labs disagree
4. Mouse vs human translational gap made explicit
5. Multi-organism comparative framing (humans and dogs both get lupus)

## Funding Intent
Proceeds to SARDines community or to Alaric if disability prevents work. Patient-built tooling for underserved population.
