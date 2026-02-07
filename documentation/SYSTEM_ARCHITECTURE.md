# Omnibet AI - System Architecture (V19)

## Core Components

### 1. Real Data Service (`real-data-service.js`)
**Role**: The "Nervous System".
- Fetches real-time data from ESPN APIs.
- **V19 Upgrade**: Auto-trains the **ELO Engine** on startup using 30 days of match history (`getPastMatches`).
- **Prediction Logic**: Hybrid V18/V19.
  - Feeds stats to the Oracle Pattern Scout.
  - Calculates "Winning Edge" probabilities using **Aggressive Leader Boost** (V18 Logic).
  - *Note*: ELO calculations are performed in background for "Power Ratings" but user preferred V18 visual output.

### 2. AI Engine (`ai-engine.js`)
**Role**: The "Brain" (Deep Analysis).
- Performs detailed match simulation.
- **V18 Logic**: Uses "Leader Boost" to prevent Draw Inflation in 3-way markets.
- Generates "Analyst Agents" reports (Tactical, Form, History).

### 3. Oracle Pattern Scout (`pattern-scout.js`)
**Role**: The "Intuition".
- Scans team form sequences (e.g., "W-W-L-D-W") for winning/losing streaks.
- Applies multipliers to base probabilities based on "Hot/Cold" states.

### 4. ELO Engine (`elo-engine.js`)
**Role**: The "Math Core" (V19 Hidden Gem).
- Pure JavaScript implementation of ELO Rating System.
- Dynamic K-Factor based on Margin of Victory.
- Provides a deterministic "Power Rating" baseline.

## Data Flow
1. **Startup**: `real-data-service` fetches history -> trains `elo-engine`.
2. **Request**: User visits Dashboard.
3. **Fetch**: `real-data-service` loops through active endpoints (Soccer, NBA, NFL, Tennis...).
4. **Predict**: 
   - Extract records/stats.
   - Run Pattern Scout.
   - Run "Aggressive Boost" (V18) to determine high-confidence winner.
5. **Display**: UI renders cards with Gold/Diamond confidence badges.
