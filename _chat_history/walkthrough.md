# OmniBet AI - Project Walkthrough

## 🚀 Current Status: "Neural Swarm" Active (Oracle v2.0)
The application has been upgraded with a military-grade predictive engine. The "Oracle" is now a system of **7 autonomous agents** analyzing different dimensions of every match.

### 🧠 The Neural Swarm Agents
1.  **Weather Agent (OpenMeteo):** Real-time analysis of wind, rain, and temperature impacts.
2.  **Referee Agent (The Judge):** Knowledge base of referee strictness and card tendencies.
3.  **Venue Agent (The Groundskeeper):** Stadium-specific analysis (Altitude, Turf, Fortress Factor).
4.  **Tactical Agent (The Tactician):** Analyzing matchup styles (e.g. Possession vs Counter-Attack).
5.  **News Sentinel (The Spy):** Simulates "Intel" on injuries and personal issues (gossip).
6.  **Morale Monitor ( The Psychologist):** Locker room chemistry and coach stability tracking.
7.  **Market Shark (The Whale):** Detects "Smart Money" movements in betting odds.

### 🧪 Features Implemented
- **Swarm Intelligence:** Predictions now include a "Context Score" derived from all 7 agents.
- **Visual Insights:** `DetailedMatchAnalysis` now features a "Neural Swarm" tab showing active alerts.
- **Deep Context:** Predictions explain *why* (e.g., "Sharp money detected", "High wind favors defense").

### 📸 Verification
- **Test Script:** `scripts/verify-oracle-swarm.mjs` confirms all agents fire and influence confidence.
- **UI:** New tab successfully renders weather widgets and agent insights.

---

## 📅 Recent Updates
### [Phase 5] Oracle v2.0 Implementation
- **Architecture:** Parallel execution of 7 specialized analysis functions.
- **Data:** Integrated OpenMeteo for real weather data.
- **Logic:** `calculateDeepPrediction` now orchestrates the swarm.

### 3. Universal Player Stats & Robust Rosters 🌍
- **Goal**: Ensure "Stats" and "Rosters" work for ALL sports (NBA, NFL, MLB, Tennis, Soccer Cups), not just major leagues.
- **Changes**:
    - **Multi-Strategy Roster Fetch**: Implemented a smart fallsystem that finds a team's roster even if they are playing in a Cup match (e.g., finding a Ligue 2 team's roster during a Coupe de France game).
    - **Form & Standings Recovery**: Added logic to fetch a team's full schedule if the match summary lacks recent history, ensuring "Last 5 Games" is never empty.
    - **Global Stats Parsing**: Added logic to extract key stats for every sport (Avg/HR for Baseball, Yds/TD for Football, Aces/Rank for Tennis).
    - **Dynamic Slugs**: Fixed API URL generation for all minor and major leagues.

### [Phase 3] Dashboard Refinement
- Centered layout for "Premium Features".
- Improved Sport Filter visibility.

---

## 🔮 Next Steps
- **Production Rollout:** Deploy to Vercel/Netlify.
- **User Feedback Loop:** Monitor how users interact with Swarm insights.
