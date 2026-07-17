import cron from "node-cron";
import { scan } from "./scanner";
import { sendGas } from "./gasService";
import { executeSweeps } from "./sweepExecutor";
import { processWithdrawals } from "./withdrawalExecutor";
import { processFDEarnings } from "./fdEarningsProcessor";

console.log("========================================");
console.log("  CryptoFD Backend Worker");
console.log("  BEP-20 USDT Deposit & Withdrawal System");
console.log("========================================");

// Scan for deposits every 15 seconds
cron.schedule("*/15 * * * * *", async () => {
  try {
    await scan();
  } catch (err) {
    console.error("[CRON] Deposit scanner error:", err);
  }
});

// Send gas to pending sweep tasks every 30 seconds
cron.schedule("*/30 * * * * *", async () => {
  try {
    await sendGas();
  } catch (err) {
    console.error("[CRON] Gas service error:", err);
  }
});

// Execute sweeps every minute
cron.schedule("* * * * *", async () => {
  try {
    await executeSweeps();
  } catch (err) {
    console.error("[CRON] Sweep executor error:", err);
  }
});

// Process withdrawals every 60 seconds
cron.schedule("*/60 * * * * *", async () => {
  try {
    await processWithdrawals();
  } catch (err) {
    console.error("[CRON] Withdrawal executor error:", err);
  }
});

// Process FD earnings every 15 minutes (to credit ROI daily)
cron.schedule("*/15 * * * *", async () => {
  try {
    await processFDEarnings();
  } catch (err) {
    console.error("[CRON] FD earnings processor error:", err);
  }
});

console.log("[Worker] Cron jobs scheduled:");
console.log("  - Deposit scanner: every 15 seconds");
console.log("  - Gas service: every 30 seconds");
console.log("  - Sweep executor: every minute");
console.log("  - Withdrawal executor: every 60 seconds");
console.log("  - FD earnings processor: every 15 minutes");
console.log("[Worker] Running...");
