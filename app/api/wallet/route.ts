import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { sendWithdrawalEmail } from "@/lib/email"
import { ethers } from "ethers"
import QRCode from "qrcode"

// Generate a unique BEP-20 address from HD wallet using derivation index
function generateAddress(mnemonic: string, index: number): string {
  const wallet = ethers.HDNodeWallet.fromPhrase(
    mnemonic,
    undefined,
    `m/44'/60'/0'/0/${index}`
  )
  return wallet.address.toLowerCase()
}

// GET - Get or create unique deposit address for user
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get full user profile
    const profile = await prisma.profile.findUnique({
      where: { id: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Check if user already has a wallet
    let wallet = await prisma.wallet.findFirst({
      where: { userId: user.id }
    })

    // If no wallet, generate a new one
    if (!wallet) {
      const mnemonic = process.env.MNEMONIC
      
      if (!mnemonic) {
        return NextResponse.json({
          wallet: {
            balance: Number(profile.walletBalance),
            locked: Number(profile.lockedBalance),
            total: Number(profile.walletBalance) + Number(profile.lockedBalance),
            totalEarnings: Number(profile.totalEarnings),
            referralEarnings: Number(profile.referralEarnings),
          },
          depositAddress: null,
          hasAddress: false,
          error: "Deposit system not configured"
        })
      }

      // Get the next available derivation index
      const maxWallet = await prisma.wallet.findFirst({
        orderBy: { derivationIndex: "desc" }
      })

      const nextIndex = (maxWallet?.derivationIndex ?? -1) + 1

      // Generate new address (NO private key stored)
      const address = generateAddress(mnemonic, nextIndex)

      // Insert new wallet
      try {
        wallet = await prisma.wallet.create({
          data: {
            userId: user.id,
            address: address,
            derivationIndex: nextIndex,
          }
        })
      } catch (error) {
        console.error("Failed to create wallet:", error)
        return NextResponse.json({
          wallet: {
            balance: Number(profile.walletBalance),
            locked: Number(profile.lockedBalance),
            total: Number(profile.walletBalance) + Number(profile.lockedBalance),
            totalEarnings: Number(profile.totalEarnings),
            referralEarnings: Number(profile.referralEarnings),
          },
          depositAddress: null,
          hasAddress: false,
          error: "Failed to generate deposit address"
        })
      }
    }

    // Generate QR code
    let qrCodeDataUrl: string | null = null
    if (wallet?.address) {
      try {
        qrCodeDataUrl = await QRCode.toDataURL(wallet.address, {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        })
      } catch (qrError) {
        console.error("QR code generation error:", qrError)
      }
    }

    return NextResponse.json({
      wallet: {
        balance: Number(profile.walletBalance),
        locked: Number(profile.lockedBalance),
        total: Number(profile.walletBalance) + Number(profile.lockedBalance),
        totalEarnings: Number(profile.totalEarnings),
        referralEarnings: Number(profile.referralEarnings),
      },
      depositAddress: wallet ? {
        address: wallet.address,
        network: "BEP-20 (BSC)",
        qrCode: qrCodeDataUrl,
      } : null,
      hasAddress: !!wallet,
    })
  } catch (error) {
    console.error("Get wallet error:", error)
    return NextResponse.json(
      { error: "Failed to fetch wallet info" },
      { status: 500 }
    )
  }
}

// POST - Request withdrawal
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, address } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (amount < 10) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is 10 USDT" },
        { status: 400 }
      )
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const userBalance = Number(profile.walletBalance)
    if (amount > userBalance) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    if (!address || !ethers.isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid BEP-20 address" },
        { status: 400 }
      )
    }

    // Create withdrawal request and update balance atomically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // Create withdrawal request
      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          userId: user.id,
          amount: amount,
          toAddress: address.toLowerCase(),
          status: "pending",
        }
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "withdrawal",
          amount: -amount,
          status: "pending",
          description: `Withdrawal to ${address.slice(0, 10)}...${address.slice(-6)} (BEP-20)`,
        }
      })

      // Deduct balance
      await tx.profile.update({
        where: { id: user.id },
        data: {
          walletBalance: { decrement: amount }
        }
      })

      return withdrawal
    })

    // Send email notification
    await sendWithdrawalEmail(profile.email, amount, address)

    return NextResponse.json({
      success: true,
      withdrawalId: result.id,
      message: "Withdrawal request submitted.",
    })
  } catch (error) {
    console.error("Withdrawal error:", error)
    return NextResponse.json(
      { error: "Failed to process withdrawal" },
      { status: 500 }
    )
  }
}
