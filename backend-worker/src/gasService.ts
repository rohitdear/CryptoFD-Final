import { ethers } from "ethers";
import { prisma } from "./db";
import { CONFIG } from "./config";

const provider = new ethers.JsonRpcProvider(CONFIG.rpc);
const hotWallet = new ethers.Wallet(CONFIG.hotKey, provider);

// Amount of BNB to send for gas (enough for 1 USDT transfer)
const GAS_AMOUNT = "0.0005";

export async function sendGas() {
  try {
    // Get pending sweep tasks that need gas
    const tasks = await prisma.sweepTask.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      take: 5,
    });

    if (!tasks || tasks.length === 0) {
      return;
    }

    console.log(`[GasService] Processing ${tasks.length} pending tasks`);

    // Check hot wallet BNB balance
    const hotWalletBalance = await provider.getBalance(hotWallet.address);
    const minRequired = ethers.parseEther(GAS_AMOUNT) * BigInt(tasks.length);

    if (hotWalletBalance < minRequired) {
      console.error(`[GasService] Insufficient BNB in hot wallet. Have: ${ethers.formatEther(hotWalletBalance)}, Need: ${ethers.formatEther(minRequired)}`);
      return;
    }

    for (const task of tasks) {
      try {
        // Check if user wallet already has enough gas
        const userBalance = await provider.getBalance(task.walletAddress);
        const gasNeeded = ethers.parseEther(GAS_AMOUNT);

        if (userBalance >= gasNeeded) {
          console.log(`[GasService] Wallet ${task.walletAddress} already has gas, marking as gas_sent`);
          await prisma.sweepTask.update({
            where: { id: task.id },
            data: { status: "gas_sent", updatedAt: new Date() },
          });
          continue;
        }

        console.log(`[GasService] Sending ${GAS_AMOUNT} BNB to ${task.walletAddress}`);

        const tx = await hotWallet.sendTransaction({
          to: task.walletAddress,
          value: ethers.parseEther(GAS_AMOUNT),
        });

        console.log(`[GasService] Gas TX sent: ${tx.hash}`);

        // Wait for confirmation
        const receipt = await tx.wait(1);

        if (receipt && receipt.status === 1) {
          await prisma.sweepTask.update({
            where: { id: task.id },
            data: { 
              status: "gas_sent", 
              gasTxHash: tx.hash,
              updatedAt: new Date(),
            },
          });

          console.log(`[GasService] Gas sent successfully to ${task.walletAddress}`);
        } else {
          throw new Error("Gas transaction failed");
        }

      } catch (e: any) {
        console.error(`[GasService] Failed to send gas to ${task.walletAddress}:`, e.message);
      }
    }
  } catch (e) {
    console.error("[GasService] Fatal error:", e);
  }
}
