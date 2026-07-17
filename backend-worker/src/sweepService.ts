import { ethers, HDNodeWallet } from "ethers";
import { CONFIG } from "./config";

const provider = new ethers.JsonRpcProvider(CONFIG.rpc);

// BSC USDT uses 18 decimals
const USDT_DECIMALS = 18;

const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

export async function sweep(task: any): Promise<string> {
  console.log(`[SweepService] Sweeping ${task.amount} USDT from index ${task.derivationIndex}`);

  // Derive wallet from mnemonic using ethers v6 correct syntax
  // Pass derivation path as 3rd argument to fromPhrase
  const derivedWallet = HDNodeWallet.fromPhrase(
    CONFIG.mnemonic,
    undefined, // no password
    `m/44'/60'/0'/0/${task.derivationIndex}` // BIP44 path
  );
  const wallet = derivedWallet.connect(provider);

  console.log(`[SweepService] Derived wallet: ${wallet.address}`);

  // Create USDT contract instance
  const contract = new ethers.Contract(CONFIG.usdt, USDT_ABI, wallet);

  // Check actual USDT balance
  const balance = await contract.balanceOf(wallet.address);
  const balanceFormatted = Number(ethers.formatUnits(balance, USDT_DECIMALS));

  console.log(`[SweepService] Wallet USDT balance: ${balanceFormatted}`);

  if (balanceFormatted < 0.01) {
    throw new Error(`Insufficient USDT balance: ${balanceFormatted}`);
  }

  // Sweep entire balance to hot wallet
  const amountToSweep = balance; // Sweep all available
  
  console.log(`[SweepService] Transferring ${ethers.formatUnits(amountToSweep, USDT_DECIMALS)} USDT to hot wallet ${CONFIG.hotAddress}`);

  const tx = await contract.transfer(CONFIG.hotAddress, amountToSweep);

  console.log(`[SweepService] Sweep TX sent: ${tx.hash}`);

  // Wait for confirmation
  const receipt = await tx.wait(1);

  if (!receipt || receipt.status !== 1) {
    throw new Error("Sweep transaction failed");
  }

  console.log(`[SweepService] Sweep confirmed: ${tx.hash}`);

  return tx.hash;
}
