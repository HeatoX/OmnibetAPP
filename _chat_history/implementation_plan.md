# OmniBet AI - Phase 2 Premium Expansion

## Overview
Implement the remaining 6 core features to finalize OmniBet AI as a complete commercial product.

---

## Feature 1: Pasarela de Pagos (Stripe / WhatsApp) 💰

### Purpose
Enable real monetization through subscription upgrades.

### Proposed Changes
#### [NEW] `src/lib/stripe.js`
- Initialize Stripe client
- Helper functions for creating checkout sessions

#### [NEW] `src/app/api/checkout/route.js`
- Endpoint to create Stripe Session
- Webhook handler for successful payments (update user tier in DB)

#### [MODIFY] `src/components/UpgradeModal.jsx`
- Replace dummy buttons with real checkout triggers
- Add "Pay via WhatsApp" button with direct link to sales number

---

## Feature 2: Comparador de Cuotas Real (Odds Comparison) 📈

### Purpose
Show users the best available odds across bookmakers to maximize returns.

### Proposed Changes
#### [MODIFY] `src/lib/real-data-service.js`
- Update match data structure to include `bookmakers` array (mocked for now based on base odds)
- Generate variations for Bet365, 1xBet, Codere

#### [NEW] `src/components/OddsComparison.jsx`
- Component to display table of bookmakers
- Highlight the "Best Value" cell
- "Apostar" button linking to bookmaker

#### [MODIFY] `src/components/MatchDetailModal.jsx`
- Integrate `OddsComparison` inside the prediction view

---

## Feature 3: Calculadora de Stake 💵

### Purpose
Professional bankroll management tool based on confidence and user balance.

### Proposed Changes
#### [NEW] `src/components/StakeCalculator.jsx`
- Input: User's total bankroll
- Input: Confidence (auto-filled from match)
- Output: Recommended Stake amount and % (Kelly Criterion simplified)
- Visual "Risk Meter"

#### [MODIFY] `src/components/PredictionCard.jsx`
- Add small "Calc Stake" button or integrate into detailed view

---

## Feature 4: "El Oráculo AI" (Chatbot) 🤖

### Purpose
Interactive AI agent for natural language queries about predictions.

### Proposed Changes
#### [NEW] `src/components/OracleChat.jsx`
- Floating chat widget (bottom right bubble)
- Chat interface with history
- "Quick Prompts" (e.g., "Best bet today?", "Safe parlay?")

#### [NEW] `src/app/api/oracle-chat/route.js`
- Simple RAG system: Contextualizes prompt with today's `bankerMatch` and high-confidence predictions
- Returns structured AI response

---

## Feature 5: Gamificación / Ranking 🏆

### Purpose
User engagement through competition.

### Proposed Changes
#### [NEW] `src/components/Leaderboard.jsx`
- Table of top users based on correct votes/predictions
- "My Rank" highlight

#### [MODIFY] `src/lib/history-tracker.js`
- Function to aggregate user voting accuracy

#### Database (Supabase)
- Use existing `prediction_votes` to calculate accuracy

---

## Feature 6: Buscador Inteligente 🔍

### Purpose
Fast navigation to specific teams or leagues.

### Proposed Changes
#### [NEW] `src/components/SmartSearch.jsx`
- Floating search bar (Command+K style)
- Filter matches by Team Name, League, or Sport
- Instant results dropdown

#### [MODIFY] `src/components/Header.jsx`
- Add search icon to trigger the component

---

---

## Phase 3: Dashboard Layout Refinement (Centered) 🎨

### Purpose
Improve dashboard hierarchy and centered alignment for a cleaner focus.

### Proposed Changes
#### [MODIFY] `src/app/app/page.jsx`
- Center the Premium Features zone.
- Reposition Sport Filter below Stats Preview.

#### [MODIFY] `src/components/SportWidgets.jsx`
- Center SportFilter items.
- Redesign LiveSummary as a centered pill button.

---

## Phase 4: Data Reliability & Sport-Specific Fixes 🎾⚾

### Purpose
Ensure all sports display data correctly or communicate season status clearly.

### Proposed Changes
#### [MODIFY] `src/lib/real-data-service.js`
- **Tennis Fix:** Support nested `groupings` in ESPN Scoreboard API.
- **Tennis Fix:** Handle `athlete` objects in competitors (extract name from `athlete.displayName`).
- **Data Bug:** Fix URL malformation when appending query parameters (applied).
- **Baseball Handling:** Detect when a sport has no matches and categorize as "Off-season" if appropriate.

#### [MODIFY] `src/app/app/page.jsx`
- Add "Fuera de Temporada" (Off-season) message when a sport is selected but empty.

---

1. **Layout Refinement** (Done)
2. **Tennis Data Extraction Fix** (Critical)
3. **Off-season Messaging** (UX polish)

---

## Phase 5: Oracle v2.0 - The "Neural Swarm" Upgrade 🧠⚡

### Purpose
Transform the prediction engine from a stats-calculator into a context-aware "AI Swarm" that considers external factors like weather, arbitrage, and venue specifics.

### Proposed Changes
#### [NEW] `src/lib/weather-service.js`
- Integration with OpenMeteo API (Free/No Key).
- Fetch real forecast based on Stadium/City coordinates.
- Impact Logic: Rain/Snow/Wind effects on Scoring (Over/Under) and Playstyle.

#### [NEW] `src/lib/referee-database.js`
- Static database of top referees for major leagues (LaLiga, Premier, NBA refs).
- Stats: Card frequency, Foul strictness, Home bias.
- Return "Referee Impact Score" for markets (e.g. "High Card Risk").

#### [NEW] `src/lib/venue-database.js` 🏟️
- Database of key stadiums (Bernabéu, Anfield, Broncos Stadium, La Paz).
- Factors: Altitude (High fatigue), Surface (Turf vs Grass), "Fortress" rating (Home crowd impact).

#### [NEW] `src/lib/tactical-database.js` ♟️
- Team Playstyles (e.g. "High Press", "Low Block", "Possession").
- Matchup Logic: "Counter-Attack" > "High Possession" (Stylistic advantages).

#### [NEW] `src/lib/news-sentinel.js` 📰
- **"The Gossip Engine"**: Simulation of social media/news scraping.
- **Factors:** Injuries (Flu, Muscle), Personal (Breakups, Parties/Nightlife).
- **Impact:** Direct penalty to "Star Player Influence" in predictive model.

#### [NEW] `src/lib/morale-monitor.js` 🎭 (Agent 6)
- **"Locker Room Pulse"**: Team chemistry analysis.
- **Factors:** Consecutive losses impact, "Coach sacking" rumors, Player mutiny.
- **Logic:** "Dead Man Walking" theory (Team plays hard to save coach OR tanks to fire him).

#### [NEW] `src/lib/market-shark.js` 🦈 (Agent 7)
- **"Smart Money Tracker"**: Detects suspicious odds movements.
- **Logic:** If odds drop suddenly without news, "Someone knows something".
- **Function:** Overrides stats if Market Sentiment is effectively 90%+ in one direction.

#### [MODIFY] `src/lib/prediction-oracle.js`
- **Main Update:** Implement `calculateContextFactors()` function.
- Integrate Weather, Referee, Venue, Tactical, News, Morale, and Market Agents.
- **New Output:** "Context Insights" (e.g. "🦈 Sharp money detected on Underdog").

#### [MODIFY] `src/components/DetailedMatchAnalysis.jsx`
- Display "Field Conditions" widget (Weather Icon, Temp).
- Display "Officiating" widget (Referee Name, Strictness Meter).
- Add "Neural Swarm Analysis" section explaining specific factors.

---

## Execution Order (Revised)
1. **Weather Service** (Real Data)
2. **Static Knowledge Bases** (Referees, Venues, Tactics)
3. **News & Morale Agents** (Soft Factors)
4. **Market Shark Agent** (Hard Money Data)
5. **Oracle Logic Upgrade** (The Brain)
6. **UI Visualization** (The Interface)
