# Implementation Plan - Real-Time History & Transparency

The goal is to ensure the "History" page reflects completely real, transparent, and verifiable data.
Currently, the history is simulated/backfilled. We will switch to a persistent database model where predictions are recorded when made, and resolved when matches finish.

## User Review Required
> [!IMPORTANT]
> This change will make the History page start **EMPTY** (or with only new manual predictions) because it will switch from "Simulated History" to "Recorded Database History".
> To populate it initially, I will run a script to "backfill" the last 3 days of games as "Official System Predictions".

## Proposed Changes

### 1. Database & Resolution Logic (`src/lib/history-tracker.js`)
*   **[MODIFY]** `resolvePendingPredictions()`: Implement logic to check pending DB records against `real-data-service` results and update status (WON/LOST).
*   **[MODIFY]** `backfillHistory()`: A utility to automatically generate and save predictions for finished games (to populate history initially for transparency).

### 2. API Endpoint for Updates (`src/app/api/cron/update-history/route.js`)
*   **[NEW]** Create an API route that can be triggered manually or via cron.
    *   Calls `resolvePendingPredictions()`.
    *   Calls `recordOfficialPredictions()` (optional: to auto-bet on big games).

### 3. Frontend - History Page (`src/app/history/page.jsx`)
*   **[MODIFY]** Switch data source from `getRealHistory()` (simulated) to `getRecentPredictions()` (DB).
*   **[NEW]** Add "🔄 Actualizar Resultados" button (Admin only) to trigger the resolution API.

### 4. Prediction Recording (`src/components/PredictionCard.jsx`)
*   **[VERIFY]** Ensure that when a user views/unlocks a prediction, it is recorded in the DB (if not already).
*   **[OPTIONAL]** We might want to record "Official" Daily Predictions automatically at midnight.

## Verification Plan

### Manual Verification
1.  **Backfill:** Run the backfill script and verify `prediction_history` table in Supabase has rows.
2.  **View History:** Check `localhost:3000/history` and verify it shows the DB rows.
3.  **Resolution:**
    *   Manually set a prediction status to `pending` in DB.
    *   Click "Actualizar Resultados" as Admin.
    *   Verify status changes to `won` or `lost` based on real score.
4.  **Consistency:** Verify that the ROI/Stats match the table data.
