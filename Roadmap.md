# 🧭 The Paths of Power — Development Roadmap

---

## 🌟 Core Design Pillars

- [ ] Discover → Unlock → Improve → Repeat loop is reinforced
- [ ] Knowledge unlocks systems (not just power)
- [ ] World evolves (town + wilds feel alive)
- [ ] Idle-friendly but interaction-rewarding

---

# 🗺️ PHASE 1 — FOUNDATIONS

## Exploration System
- [ ] Add "Explore the Wilds" action
- [ ] Implement exploration outcomes:
  - [ ] Resource gains (herbs, stone, etc.)
  - [ ] Random events
  - [ ] Discoveries (tower, dungeons, ruins)
- [ ] Add exploration scaling (based on stats later)

## Discovery System
- [ ] Implement hidden → revealed system
- [ ] Add discovery flags in state
- [ ] Hook rendering to discovered content
- [ ] Ensure discovered content stays visible permanently

## Abandoned Tower System
- [ ] Add "Abandoned Tower (Ruins)" discovery
- [ ] Create tower state (ruined → cleared → rebuilt → expanded)
- [ ] Add "Clear Tower" action
- [ ] Add "Rebuild Tower" resource requirements
- [ ] Unlock basic functionality after rebuild

## NPC Interaction System
- [ ] Add Herbalist NPC
- [ ] Add "Chat with Herbalist" action
- [ ] Create dialogue → unlock system
- [ ] Unlock herb gathering via interaction

## Basic Crafting (Tier 1)
- [ ] Add Herbs resource
- [ ] Add "Gather Herbs" action
- [ ] Add "Healing Salve" recipe
- [ ] Implement crafting system (basic)
- [ ] Add healing effect (regen or instant)

---

# 🧱 PHASE 2 — SYSTEM EXPANSION

## Knowledge System
- [ ] Add item type: Books / Tomes
- [ ] Add "Study" mechanic (time-based)
- [ ] Create knowledge unlock tracking
- [ ] Add first knowledge item:
  - [ ] Tome of Potionmaking
- [ ] Tie knowledge → crafting unlocks

## Dungeon System
- [ ] Create "Dungeons" tab
- [ ] Add dungeon discovery method:
  - [ ] Exploration
  - [ ] Town rumors (future)
- [ ] Implement dungeon entry system
- [ ] Add multi-encounter flow
- [ ] Add completion rewards

## First Dungeons
- [ ] Cave Dungeon
  - [ ] Basic enemies
  - [ ] Simple reward table
- [ ] Bandit Camp (optional next)
- [ ] Ruins (optional next)

## Dungeon Rewards
- [ ] Add rare drops
- [ ] Add knowledge drops (tomes)
- [ ] Add unique resources

---

# ⚙️ PHASE 3 — LOOP REINFORCEMENT

## Resource Interconnection
- [ ] Ensure loop:
  - [ ] Exploration → resources
  - [ ] Resources → crafting
  - [ ] Crafting → survival
  - [ ] Survival → dungeon success
  - [ ] Dungeon → new unlocks

## Risk vs Reward
- [ ] Balance exploration (low risk)
- [ ] Balance dungeons (high risk)
- [ ] Add failure consequences

## Soft Progression Gates
- [ ] Require salves for survival
- [ ] Require knowledge for crafting
- [ ] Require tower upgrades for processing

---

# 🧠 PHASE 4 — DEPTH & IDLE EVOLUTION

## Automation
- [ ] Add worker system
- [ ] Assign workers to:
  - [ ] Wood gathering
  - [ ] Herb gathering
- [ ] Add idle progression logic

## Skill System Integration
- [ ] Tie stats to systems:
  - [ ] Perception → exploration
  - [ ] Intelligence → study speed
  - [ ] Control → crafting efficiency

## Event System
- [ ] Add random world events:
  - [ ] Traveling Merchant
  - [ ] Injured Adventurer
  - [ ] Bandit Activity
- [ ] Add event outcomes and choices

---

# 🧩 SYSTEM ARCHITECTURE ALIGNMENT

## state.js
- [ ] Add discovery tracking
- [ ] Add tower state
- [ ] Add knowledge tracking

## actions.js
- [ ] Exploration actions
- [ ] NPC interactions
- [ ] Crafting actions

## combat.js
- [ ] Dungeon encounters
- [ ] Multi-stage combat flow

## render.js
- [ ] Dynamic rendering based on discovery
- [ ] Show/hide unlocked systems

## save.js
- [ ] Save discoveries
- [ ] Save knowledge progress
- [ ] Save tower state

## config.js (if implemented)
- [ ] Define dungeons
- [ ] Define NPCs
- [ ] Define items
- [ ] Define recipes

---

# 🛤️ BUILD ORDER (Recommended)

- [ ] Step 1: Exploration system + discovery flags
- [ ] Step 2: Abandoned Tower (basic rebuild)
- [ ] Step 3: Herbalist + Healing Salve
- [ ] Step 4: First Dungeon
- [ ] Step 5: First Tome drop
- [ ] Step 6: Study system

---

# 💡 DESIGN REMINDERS

- [ ] Avoid hardcoded unlock buttons
- [ ] Everything should come from:
  - [ ] Discovery
  - [ ] NPC interaction
  - [ ] Loot drops
- [ ] Prioritize systems over content early
- [ ] Keep everything expandable

---

# 🚀 FUTURE IDEAS (Optional)

- [ ] Multiple towers / bases
- [ ] Faction system
- [ ] Advanced crafting chains
- [ ] Boss dungeons
- [ ] Prestige / rebirth system

---
