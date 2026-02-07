# Project Audit & Roadmap (V20 FINAL)

## 🧠 Current Focus: V20 "Final Polish"
**Goal**: Final UI adjustments and League Coverage (Copa del Rey).

### 🚀 Roadmap
- [x] **V16 "Paul the Octopus"**: Sport-specific logic (xG, Pace).
- [x] **V17 "Winning Edge"**: Sigmoid probability sharpening (50% -> 65%).
- [x] **V18 "Aggressive Bias"**: Leader Boosting & Dashboard Sync (70%+ Confidence).

- [x] **V19 "Deep Source" (External Intelligence)**
  - [x] **Research**: Verified GitHub models (mostly Python), selected JS-native ELO system.
  - [x] **Training**: System now auto-trains on 30 days of history on startup.
  - [x] **Revert to V18 Logic**: User preferred the V18 mechanics over ELO (Home Bias issue). Restored "Aggressive Leader Boost".

- [x] **V20 Final Polish: UI/UX & Restrictions**
  - [x] **Free Plan Enforcement**: Fix "Unlock" button missing and enforce 3-prediction limit.
  - [x] **UI Fixes**: Move "+" button to avoid collision with Gold/Diamond banner.
  - [x] **Banker Visibility**: Ensure Banker of the Day respects plan limits.
  - [x] **Date Grouping**: Filtered to show ONLY "Today" and "Tomorrow" with large headers (~50px spacing).
  - [x] **League Expansion**: Added **Copa del Rey** support to `real-data-service.js`.
