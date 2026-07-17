import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getUserById, getUserTransactions, getUserFDs, UserFdWithRelations } from "@/lib/admin-queries"
import Link from "next/link"
import { ArrowLeft, Wallet, Layers, Receipt, Shield } from "lucide-react"
import { UserActions } from "./user-actions"
import type { Transaction } from "@/lib/types"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params
  const [user, transactions, fds] = await Promise.all([
    getUserById(id),
    getUserTransactions(id),
    getUserFDs(id),
  ])

  if (!user) {
    redirect("/admin/users")
  }

  const activeFDs = fds.filter((fd: UserFdWithRelations) => fd.status === "active")
  const totalInvested = activeFDs.reduce((acc: number, fd: UserFdWithRelations) => acc + Number(fd.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {user.name || "Anonymous User"}
          </h1>
          <p className="text-muted-foreground">User Details</p>
        </div>
        {user.isAdmin && (
          <Badge className="bg-red-500/10 text-red-500">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        )}
      </div>

      {/* User Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium text-foreground">{user.name || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{user.email || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{user.phone || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Referral Code</p>
              <p className="font-mono font-medium text-foreground">{user.referralCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Referred By</p>
              <p className="font-medium text-foreground">{user.referredBy || "None"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">USDT Address</p>
              <p className="font-mono text-sm text-foreground break-all">
                {user.usdtAddress || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="font-medium text-foreground">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Balances */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  ${Number(user.walletBalance).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="rounded-2xl border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Locked Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  ${Number(user.lockedBalance).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="rounded-2xl border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                <Receipt className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-green-500">
                  +${Number(user.totalEarnings).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Admin Actions */}
      <UserActions userId={user.id} isAdmin={user.isAdmin || false} />

      {/* Active FDs */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground">
          Active Fixed Deposits ({activeFDs.length})
        </h3>
        {activeFDs.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No active FDs</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeFDs.map((fd: UserFdWithRelations) => (
              <div key={fd.id} className="rounded-xl bg-secondary/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{fd.plan?.name}</span>
                  <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  ${Number(fd.amount).toFixed(2)}
                </p>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Daily: +${Number(fd.dailyEarning).toFixed(2)}</p>
                  <p>Earned: +${Number(fd.totalEarned).toFixed(2)}</p>
                  <p>Ends: {new Date(fd.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No transactions</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((tx: Transaction) => (
                  <tr key={tx.id} className="border-b border-border">
                    <td className="py-3 pr-4 capitalize text-foreground">
                      {tx.type.replace("_", " ")}
                    </td>
                    <td className={`py-3 pr-4 font-medium ${Number(tx.amount) > 0 ? "text-green-500" : "text-foreground"}`}>
                      {Number(tx.amount) > 0 ? "+" : ""}${Math.abs(Number(tx.amount)).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={
                        tx.status === "completed" ? "bg-green-500/10 text-green-500" :
                        tx.status === "pending" ? "bg-yellow-500/10 text-yellow-500" :
                        "bg-red-500/10 text-red-500"
                      }>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
