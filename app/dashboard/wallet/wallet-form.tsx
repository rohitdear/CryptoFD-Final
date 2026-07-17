"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Copy, 
  Wallet,
  AlertCircle,
  Loader2,
  CheckCircle,
  RefreshCw
} from "lucide-react"
import { requestWithdrawal } from "@/lib/actions"

interface WalletFormProps {
  availableBalance: number
  savedAddress: string
}

interface WalletData {
  wallet: {
    balance: number
    locked: number
    total: number
    totalEarnings: number
    referralEarnings: number
  }
  depositAddress: {
    address: string
    network: string
    qrCode: string | null
  } | null
  hasAddress: boolean
}

export function WalletForm({ availableBalance, savedAddress }: WalletFormProps) {
  const router = useRouter()
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawAddress, setWithdrawAddress] = useState(savedAddress)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingWallet, setIsFetchingWallet] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [walletData, setWalletData] = useState<WalletData | null>(null)

  // Fetch wallet data with unique deposit address
  const fetchWalletData = async () => {
    setIsFetchingWallet(true)
    try {
      const response = await fetch('/api/wallet')
      if (response.ok) {
        const data = await response.json()
        setWalletData(data)
      }
    } catch (err) {
      console.error('Failed to fetch wallet data:', err)
    } finally {
      setIsFetchingWallet(false)
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [])

  const handleCopy = () => {
    if (walletData?.depositAddress?.address) {
      navigator.clipboard.writeText(walletData.depositAddress.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (!withdrawAddress || !amount || amount < 10) return
    
    setError(null)
    setIsLoading(true)

    const result = await requestWithdrawal(amount, withdrawAddress)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setWithdrawAmount("")
    setIsLoading(false)
    router.refresh()
    fetchWalletData()
    
    setTimeout(() => setSuccess(false), 5000)
  }

  const balance = walletData?.wallet?.balance ?? availableBalance

  return (
    <>
      {/* Balance Card */}
      <Card className="rounded-2xl border-border bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-3xl font-bold text-foreground">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </p>
          </div>
        </div>
      </Card>

      {/* Deposit & Withdraw Tabs */}
      <Tabs defaultValue="deposit" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-secondary">
          <TabsTrigger value="deposit" className="gap-2 data-[state=active]:bg-primary">
            <ArrowDownToLine className="h-4 w-4" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="gap-2 data-[state=active]:bg-primary">
            <ArrowUpFromLine className="h-4 w-4" />
            Withdraw
          </TabsTrigger>
        </TabsList>

        {/* Deposit Tab */}
        <TabsContent value="deposit">
          <Card className="rounded-2xl border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Deposit USDT (BEP-20)</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your unique deposit address - send only USDT on BEP-20 (BSC) network
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={fetchWalletData}
                disabled={isFetchingWallet}
              >
                <RefreshCw className={`h-4 w-4 ${isFetchingWallet ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <div className="mt-6 flex flex-col items-center">
              {isFetchingWallet ? (
                <div className="flex h-48 w-48 items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                </div>
              ) : walletData?.depositAddress ? (
                <>
                  {/* QR Code */}
                  <div className="rounded-2xl border-2 border-border bg-white p-4">
                    {walletData.depositAddress.qrCode ? (
                      <Image
                        src={walletData.depositAddress.qrCode}
                        alt="Deposit QR Code"
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="flex h-[200px] w-[200px] items-center justify-center text-muted-foreground">
                        QR Code unavailable
                      </div>
                    )}
                  </div>

                  {/* Network Badge */}
                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-500">
                      {walletData.depositAddress.network}
                    </span>
                    <span className="text-xs text-muted-foreground">Network</span>
                  </div>

                  {/* Deposit Address */}
                  <div className="mt-4 w-full">
                    <label className="text-sm text-muted-foreground">Your Unique Deposit Address</label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        value={walletData.depositAddress.address}
                        readOnly
                        className="bg-secondary/50 font-mono text-sm"
                      />
                      <Button variant="secondary" size="icon" onClick={handleCopy}>
                        {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    {copied && (
                      <p className="mt-2 text-center text-sm text-green-500">Address copied to clipboard!</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-yellow-500" />
                  <p className="mt-4 font-medium text-foreground">No Deposit Address Available</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Please contact support to get a deposit address assigned to your account.
                  </p>
                </div>
              )}

              {/* Warning */}
              <div className="mt-6 flex w-full items-start gap-2 rounded-xl bg-yellow-500/10 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-yellow-500">Important:</p>
                  <ul className="mt-1 list-inside list-disc space-y-1">
                    <li>Only send USDT on BEP-20 (BSC) network to this address</li>
                    <li>This address is uniquely assigned to your account</li>
                    <li>Minimum deposit: 50 USDT</li>
                    <li>Deposits are credited automatically after blockchain confirmation</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Withdraw Tab */}
        <TabsContent value="withdraw">
          <Card className="rounded-2xl border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground">Withdraw USDT (BEP-20)</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Withdraw your available balance to any BEP-20 (BSC) wallet
            </p>

            <div className="mt-6 space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">
                    Withdrawal request submitted successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <label className="text-sm text-muted-foreground">Withdrawal Address</label>
                <Input
                  placeholder="Enter BEP-20 (BSC) wallet address"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="mt-2 bg-secondary/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">Amount</label>
                  <span className="text-xs text-muted-foreground">
                    Available: ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-secondary/50"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => setWithdrawAmount(balance.toString())}
                  >
                    Max
                  </Button>
                </div>
              </div>

              {/* Fee Info */}
              <div className="rounded-xl bg-secondary/30 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee (3%)</span>
                  <span className="text-foreground">
                    {withdrawAmount 
                      ? `${(parseFloat(withdrawAmount) * 0.03).toFixed(2)} USDT` 
                      : "0.00 USDT"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm border-t border-border/30 pt-2">
                  <span className="text-muted-foreground">You Will Receive</span>
                  <span className="font-medium text-foreground">
                    {withdrawAmount 
                      ? `${Math.max(0, parseFloat(withdrawAmount) * 0.97).toFixed(2)} USDT` 
                      : "0.00 USDT"}
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-blue-500">Withdrawal Instructions:</p>
                  <ul className="mt-2 list-inside list-disc space-y-1.5">
                    <li><span className="font-semibold">Minimum Deposit:</span> 50 USDT</li>
                    <li><span className="font-semibold">Instant Withdraw:</span> Processed within seconds</li>
                    <li>Minimum withdrawal: 10 USDT</li>
                    <li>No withdrawals available on weekends (Saturday-Sunday)</li>
                    <li>Double-check your wallet address before confirming</li>
                  </ul>
                </div>
              </div>

              <Button 
                className="h-12 w-full text-base" 
                disabled={!withdrawAddress || !withdrawAmount || parseFloat(withdrawAmount) < 10 || parseFloat(withdrawAmount) > balance || isLoading}
                onClick={handleWithdraw}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : parseFloat(withdrawAmount) > balance ? (
                  "Insufficient Balance"
                ) : (
                  "Request Withdrawal"
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
