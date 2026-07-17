import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Helper functions to match previous Supabase RPC calls
export async function incrementBalance(userId: string, amount: number) {
  return prisma.profile.update({
    where: { id: userId },
    data: { walletBalance: { increment: amount } },
  });
}

export async function decrementBalance(userId: string, amount: number) {
  return prisma.profile.update({
    where: { id: userId },
    data: { walletBalance: { decrement: amount } },
  });
}
