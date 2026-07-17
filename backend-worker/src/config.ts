import "dotenv/config";

export const CONFIG = {
  rpc: process.env.RPC_URL || "https://bsc-dataseed1.binance.org",
  usdt: (process.env.USDT_CONTRACT || "0x55d398326f99059fF775485246999027B3197955").toLowerCase(),
  mnemonic: process.env.MNEMONIC!,
  hotKey: process.env.HOT_WALLET_PRIVATE_KEY!,
  hotAddress: process.env.HOT_WALLET_ADDRESS!,
  coldAddress: process.env.COLD_WALLET_ADDRESS!,
  coldSweepThreshold: 5000, // Sweep to cold when hot wallet exceeds this amount
  databaseUrl: process.env.DATABASE_URL!,
};
