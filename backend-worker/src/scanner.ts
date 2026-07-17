import { ethers } from "ethers";
import { prisma, incrementBalance } from "./db";
import { CONFIG } from "./config";

const provider = new ethers.JsonRpcProvider(CONFIG.rpc);
const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

// BSC USDT uses 18 decimals
const USDT_DECIMALS = 18;

// Max addresses per query (RPC providers usually limit this)
const BATCH_SIZE = 50;

export async function scan() {
  try {
    // Get all user wallets
    const wallets = await prisma.wallet.findMany({
      select: { address: true, userId: true, derivationIndex: true },
    });

    if (!wallets || wallets.length === 0) {
      console.log("[Scanner] No assigned wallets to scan");
      return;
    }

    // Create a map for quick lookup
    const walletMap = new Map(
      wallets.map((w) => [w.address.toLowerCase(), w])
    );

    const latest = await provider.getBlockNumber();
    // Use 12 confirmations for safety on BSC
    const safe = latest - 12;

    let tracker = await prisma.blockTracker.findUnique({
      where: { chain: "bsc" },
    });

    let last = tracker?.lastBlock || safe - 100;

    // Don't scan more than 500 blocks at once
    if (safe - last > 500) {
      last = safe - 500;
    }

    if (last >= safe) {
      console.log("[Scanner] Already up to date");
      return;
    }

    console.log(`[Scanner] Scanning blocks ${last + 1} to ${safe} for ${wallets.length} addresses`);

    // Batch addresses for topic filtering
    const addresses = wallets.map((w) => w.address.toLowerCase());

    for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
      const batch = addresses.slice(i, i + BATCH_SIZE);

      // Convert addresses to padded topic format (32 bytes)
      const paddedAddresses = batch.map((addr) =>
        ethers.zeroPadValue(addr, 32)
      );

      // Scan in block chunks (10 blocks max for Alchemy free tier compatibility)
      for (let from = last + 1; from <= safe; from += 10) {
        const to = Math.min(from + 9, safe);

        try {
          // Filter logs where topic[2] (to address) matches our addresses
          const logs = await provider.getLogs({
            address: CONFIG.usdt,
            fromBlock: from,
            toBlock: to,
            topics: [
              TRANSFER_TOPIC,
              null, // from address - any
              paddedAddresses, // to address - our addresses
            ],
          });

          for (const log of logs) {
            await processLog(log, walletMap);
          }
        } catch (e) {
          console.error(`[Scanner] Error scanning blocks ${from}-${to}:`, e);
        }
      }
    }

    // Update block tracker
    await prisma.blockTracker.upsert({
      where: { chain: "bsc" },
      update: { lastBlock: safe, updatedAt: new Date() },
      create: { chain: "bsc", lastBlock: safe },
    });

    console.log(`[Scanner] Updated last_block to ${safe}`);

  } catch (e) {
    console.error("[Scanner] Error:", e);
  }
}

async function processLog(
  log: ethers.Log,
  walletMap: Map<string, { address: string; userId: string; derivationIndex: number }>
) {
  const txHash = log.transactionHash;
  const logIndex = log.index;

  // Check if already processed
  const exists = await prisma.transaction.findFirst({
    where: { txHash, logIndex },
  });

  if (exists) return;

  // Extract recipient address from topics
  const to = "0x" + log.topics[2].slice(26).toLowerCase();

  // Get wallet from our map (we already filtered at RPC level)
  const wallet = walletMap.get(to);
  if (!wallet || !wallet.userId) return;

  // Parse amount (BSC USDT has 18 decimals)
  const amount = Number(ethers.formatUnits(log.data, USDT_DECIMALS));

  console.log(`[Scanner] Deposit detected: ${amount} USDT to ${to}`);

  try {
    // Save transaction
    await prisma.transaction.create({
      data: {
        userId: wallet.userId,
        type: "deposit",
        amount,
        status: "completed",
        txHash,
        logIndex,
        description: `Deposit of ${amount} USDT`,
      },
    });

    // Update user balance
    await incrementBalance(wallet.userId, amount);

    // Create sweep task to move funds to hot wallet
    await prisma.sweepTask.create({
      data: {
        userId: wallet.userId,
        address: to,
        walletAddress: to,
        amount,
        derivationIndex: wallet.derivationIndex,
        txHash,
        status: "pending",
      },
    });

    console.log(`[Scanner] Deposit processed: ${amount} USDT for user ${wallet.userId}`);
  } catch (e) {
    console.error("[Scanner] Failed to process log:", e);
  }
}
