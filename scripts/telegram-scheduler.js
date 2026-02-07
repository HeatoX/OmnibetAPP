/**
 * Telegram Scheduler Script
 * Runs strictly to trigger the Next.js API endpoints at specific times.
 * 
 * Usage: node scripts/telegram-scheduler.js
 * Keep this terminal open!
 */

const fetch = require('node-fetch'); // If node-fetch isn't installed, use native fetch (Node 18+) or axios
// Note: In modern Node (18+), fetch is global. If < 18, user might need to install it.
// We'll assume Node 18+ or standard environment.

const APP_URL = 'http://localhost:3000'; // Make sure your Next.js app is running here

console.log('🤖 OmniBet Telegram Scheduler Started');
console.log('🕒 Waiting for triggers: 10:00 AM (Picks) & 23:00 PM (Results)');

async function triggerCron(type) {
    try {
        console.log(`Example Trigger: ${APP_URL}/api/cron/telegram?type=${type} at ${new Date().toLocaleTimeString()}`);
        const res = await fetch(`${APP_URL}/api/cron/telegram?type=${type}`);
        const json = await res.json();
        console.log(`✅ [${type.toUpperCase()}] Result:`, json);
    } catch (error) {
        console.error(`❌ [${type.toUpperCase()}] Failed:`, error.message);
    }
}

// Check time every minute
setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // 10:00 AM Trigger
    if (hours === 10 && minutes === 0) {
        triggerCron('morning');
    }

    // 11:00 PM (23:00) Trigger
    if (hours === 23 && minutes === 0) {
        triggerCron('evening');
    }

}, 60000); // Check every 60 seconds

// Test run on startup (Uncomment to test immediately)
// triggerCron('morning');
