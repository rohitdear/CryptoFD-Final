import { prisma, incrementBalance } from "./db";

// Process daily FD earnings - credits to wallet_balance (every day, including weekends)
export async function processFDEarnings() {
  try {
    const now = new Date();
    console.log(`[FDEarnings] Starting processor at ${now.toISOString()}`);

    // Get all active FDs
    const activeFDs = await prisma.userFd.findMany({
      where: { status: "active" },
    });

    console.log(`[FDEarnings] Found ${activeFDs?.length || 0} active FDs`);

    if (!activeFDs || activeFDs.length === 0) {
      console.log(`[FDEarnings] No active FDs to process`);
      return;
    }

    console.log(`[FDEarnings] Processing ${activeFDs.length} active FDs`);

    for (const fd of activeFDs) {
      try {
        const endDate = new Date(fd.endDate);
        
        // Handle null/invalid lastPayoutDate - initialize to startDate or creation time
        let lastPayout = fd.lastPayoutDate ? new Date(fd.lastPayoutDate) : new Date(fd.startDate || fd.createdAt);
        
        // If lastPayout is still invalid, use today's date minus the duration to ensure ROI is credited
        if (isNaN(lastPayout.getTime())) {
          console.warn(`[FDEarnings] Invalid lastPayoutDate for FD ${fd.id}, resetting to endDate minus duration`);
          lastPayout = new Date(endDate);
          lastPayout.setDate(lastPayout.getDate() - 30);
        }

        // Check if FD has matured
        if (now >= endDate) {
          await handleFDMaturity(fd);
          continue;
        }

        // Check if 24 hours have passed since last payout
        const hoursSinceLastPayout = (now.getTime() - lastPayout.getTime()) / (1000 * 60 * 60);
        console.log(`[FDEarnings] FD ${fd.id}: lastPayout=${lastPayout.toISOString()}, now=${now.toISOString()}, hours since=${hoursSinceLastPayout.toFixed(2)}`);
        
        if (hoursSinceLastPayout < 24) {
          console.log(`[FDEarnings] FD ${fd.id}: Not ready yet (${hoursSinceLastPayout.toFixed(2)} hours < 24)`);
          continue; // Not yet time for daily payout
        }

        // Calculate days to pay (all days, including weekends)
        // Only pay for days that haven't been paid yet
        let daysToPay = 0;
        let currentDate = new Date(lastPayout);
        currentDate.setDate(currentDate.getDate() + 1); // Start from next day
        
        // Count days from lastPayout to now
        const totalDaysElapsed = Math.floor((now.getTime() - lastPayout.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only count full 24-hour periods that haven't been paid yet
        daysToPay = totalDaysElapsed;

        if (daysToPay === 0) continue; // No full days to pay

        const earningsToPay = Number(fd.dailyEarning) * daysToPay;

        console.log(`[FDEarnings] Crediting ${earningsToPay} USDT (${daysToPay} days) for user ${fd.userId}`);

        // Update FD record
        const newTotalEarned = Number(fd.totalEarned) + earningsToPay;
        
        await prisma.userFd.update({
          where: { id: fd.id },
          data: {
            totalEarned: newTotalEarned,
            lastPayoutDate: now,
          },
        });

        // Credit earnings to user wallet_balance
        await incrementBalance(fd.userId, earningsToPay);

        // Update profile total_earnings
        await prisma.profile.update({
          where: { id: fd.userId },
          data: {
            totalEarnings: { increment: earningsToPay },
          },
        });

        // Create transaction record
        await prisma.transaction.create({
          data: {
            userId: fd.userId,
            type: "fd_earning",
            amount: earningsToPay,
            status: "completed",
            description: `Daily ROI (${daysToPay} weekday${daysToPay > 1 ? 's' : ''}) - ${fd.planName}`,
            referenceId: fd.id,
          },
        });

        console.log(`[FDEarnings] Credited ${earningsToPay} USDT to user ${fd.userId}`);

      } catch (err) {
        console.error(`[FDEarnings] Error processing FD ${fd.id}:`, err);
      }
    }

  } catch (err) {
    console.error("[FDEarnings] Fatal error:", err);
  }
}

async function handleFDMaturity(fd: any) {
  console.log(`[FDEarnings] FD ${fd.id} has matured`);

  const principalAmount = Number(fd.amount);
  
  // Calculate any remaining unpaid earnings (all days, including weekends)
  // Handle null/invalid lastPayoutDate - use startDate as fallback
  let lastPayout = fd.lastPayoutDate ? new Date(fd.lastPayoutDate) : new Date(fd.startDate || fd.createdAt);
  
  if (isNaN(lastPayout.getTime())) {
    console.warn(`[FDEarnings] Invalid lastPayoutDate for FD ${fd.id} at maturity, resetting to startDate`);
    lastPayout = new Date(fd.startDate || fd.createdAt);
  }
  
  const endDate = new Date(fd.endDate);
  const now = new Date();
  
  // Calculate actual remaining days that haven't been paid yet
  const totalDaysFromCreationToMaturity = Math.floor((endDate.getTime() - lastPayout.getTime()) / (1000 * 60 * 60 * 24));
  const daysAlreadyPaid = Number(fd.totalEarned) / Number(fd.dailyEarning);
  const remainingDays = totalDaysFromCreationToMaturity - daysAlreadyPaid;
  
  const remainingEarnings = Math.max(0, Number(fd.dailyEarning) * remainingDays);

  try {
    // Get profile for locked_balance update
    const profile = await prisma.profile.findUnique({
      where: { id: fd.userId },
      select: { lockedBalance: true, totalEarnings: true },
    });

    if (!profile) {
      console.error(`[FDEarnings] Profile not found for user ${fd.userId}`);
      return;
    }

    // Return principal to wallet_balance and update locked_balance
    await prisma.profile.update({
      where: { id: fd.userId },
      data: {
        walletBalance: { increment: principalAmount + remainingEarnings },
        lockedBalance: { decrement: principalAmount },
        totalEarnings: { increment: remainingEarnings },
      },
    });

    // Mark FD as completed
    await prisma.userFd.update({
      where: { id: fd.id },
      data: {
        status: "completed",
        totalEarned: Number(fd.totalEarned) + remainingEarnings,
        lastPayoutDate: new Date(),
      },
    });

    // Create maturity transaction
    await prisma.transaction.create({
      data: {
        userId: fd.userId,
        type: "fd_maturity",
        amount: principalAmount + Number(fd.totalEarned) + remainingEarnings,
        status: "completed",
        description: `FD matured - Principal: ${principalAmount} USDT + Earnings: ${Number(fd.totalEarned) + remainingEarnings} USDT`,
        referenceId: fd.id,
      },
    });

    console.log(`[FDEarnings] FD ${fd.id} completed. Principal ${principalAmount} + Earnings returned to wallet`);

  } catch (err) {
    console.error(`[FDEarnings] Error handling maturity for FD ${fd.id}:`, err);
  }
}
