import { prisma } from "./db";
import { sweep } from "./sweepService";

export async function executeSweeps() {
  try {
    // Get tasks that have gas and are ready to sweep
    const tasks = await prisma.sweepTask.findMany({
      where: { status: "gas_sent" },
      orderBy: { createdAt: "asc" },
      take: 5,
    });

    if (!tasks || tasks.length === 0) {
      return;
    }

    console.log(`[SweepExecutor] Processing ${tasks.length} sweep tasks`);

    for (const task of tasks) {
      try {
        // Mark as sweeping
        await prisma.sweepTask.update({
          where: { id: task.id },
          data: { status: "sweeping", updatedAt: new Date() },
        });

        // Execute sweep
        const txHash = await sweep(task);

        // Mark as completed
        await prisma.sweepTask.update({
          where: { id: task.id },
          data: { 
            status: "completed", 
            sweepTxHash: txHash,
            updatedAt: new Date(),
          },
        });

        console.log(`[SweepExecutor] Sweep completed for task ${task.id}: ${txHash}`);

      } catch (e: any) {
        console.error(`[SweepExecutor] Failed to sweep task ${task.id}:`, e.message);

        // Mark as failed
        await prisma.sweepTask.update({
          where: { id: task.id },
          data: { 
            status: "failed", 
            errorMessage: e.message || "Unknown error",
            updatedAt: new Date(),
          },
        });
      }
    }
  } catch (e) {
    console.error("[SweepExecutor] Fatal error:", e);
  }
}
