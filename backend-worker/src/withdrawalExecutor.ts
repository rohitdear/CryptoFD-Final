import { ethers } from "ethers";
import { CONFIG } from "./config";
import { prisma, incrementBalance } from "./db";

// BSC USDT uses 18 decimals
const USDT_DECIMALS = 18;

const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

export async function processWithdrawals() {
  try {
    // Get pending withdrawal requests (process ASAP - instant withdrawal)
    const pendingWithdrawals = await prisma.withdrawalRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      take: 10, // Increase to 10 for faster processing
    });

    if (!pendingWithdrawals || pendingWithdrawals.length === 0) {
      return;
    }

    console.log(`[WithdrawalExecutor] Processing ${pendingWithdrawals.length} pending withdrawals (INSTANT)`);

    const provider = new ethers.JsonRpcProvider(CONFIG.rpc);
    const hotWallet = new ethers.Wallet(CONFIG.hotKey, provider);
    const usdtContract = new ethers.Contract(CONFIG.usdt, USDT_ABI, hotWallet);

    // Check hot wallet USDT balance once
    const hotWalletBalance = await usdtContract.balanceOf(hotWallet.address);
    const hotWalletBalanceFormatted = Number(ethers.formatUnits(hotWalletBalance, USDT_DECIMALS));
    
    console.log(`[WithdrawalExecutor] Hot wallet USDT balance: ${hotWalletBalanceFormatted}`);

    for (const withdrawal of pendingWithdrawals) {
      try {
        const withdrawAmount = Number(withdrawal.amount);
        
        // Calculate 3% platform fee
        const platformFee = withdrawAmount * 0.03;
        const amountToUser = withdrawAmount - platformFee;

        console.log(`[WithdrawalExecutor] INSTANT: ${withdrawAmount} USDT (${amountToUser} to user, ${platformFee} fee) to ${withdrawal.toAddress}`);

        // Check if hot wallet has enough balance (needs full amount to send to user)
        if (hotWalletBalanceFormatted < amountToUser) {
          console.log(`[WithdrawalExecutor] Insufficient balance, skipping withdrawal ${withdrawal.id}`);
          continue; // Skip but don't fail - will try again later
        }

        // Mark as processing
        await prisma.withdrawalRequest.update({
          where: { id: withdrawal.id },
          data: { status: "processing" },
        });

        // Convert amount to wei (18 decimals) - SEND ONLY 97% (after 3% fee)
        const amountWei = ethers.parseUnits(amountToUser.toString(), USDT_DECIMALS);

        // Send USDT transfer (amount after fee deduction)
        const tx = await usdtContract.transfer(withdrawal.toAddress, amountWei);
        console.log(`[WithdrawalExecutor] TX sent: ${tx.hash}`);

        // Wait for confirmation with timeout (30 seconds max)
        const receipt = await Promise.race([
          tx.wait(1),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Confirmation timeout")), 30000)
          )
        ]);

        if (receipt && (receipt as any).status === 1) {
          // Update withdrawal request as completed
          await prisma.withdrawalRequest.update({
            where: { id: withdrawal.id },
            data: {
              status: "completed",
              txHash: tx.hash,
              processedAt: new Date(),
            },
          });

          // Update existing transaction record (don't create duplicate)
          // Use referenceId to update the CORRECT transaction for THIS withdrawal
          await prisma.transaction.updateMany({
            where: {
              userId: withdrawal.userId,
              type: "withdrawal",
              referenceId: withdrawal.id,
            },
            data: {
              status: "completed",
              txHash: tx.hash,
            },
          });

          console.log(`[WithdrawalExecutor] INSTANT withdrawal ${withdrawal.id} completed: ${tx.hash}`);
        } else {
          throw new Error("Transaction failed");
        }
      } catch (err) {
        console.error(`[WithdrawalExecutor] Error processing withdrawal ${withdrawal.id}:`, err);
        
        // Mark as failed
        await prisma.withdrawalRequest.update({
          where: { id: withdrawal.id },
          data: { status: "failed" },
        });

        // Refund balance to user on failure
        await incrementBalance(withdrawal.userId, Number(withdrawal.amount));
        
        // Update transaction record to failed (don't create duplicate)
        // Use referenceId to update the CORRECT transaction for THIS withdrawal
        await prisma.transaction.updateMany({
          where: {
            userId: withdrawal.userId,
            type: "withdrawal",
            referenceId: withdrawal.id,
          },
          data: {
            status: "failed",
          },
        }).catch(() => {
          // Ignore if update fails
        });

        console.log(`[WithdrawalExecutor] Refunded ${withdrawal.amount} USDT to user ${withdrawal.userId}`);
      }
    }

  } catch (err) {
    console.error("[WithdrawalExecutor] Fatal error:", err);
  }
}
