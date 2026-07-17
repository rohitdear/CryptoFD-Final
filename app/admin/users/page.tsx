import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllUsers } from "@/lib/admin-queries"
import Link from "next/link"
import { Shield, Users, DollarSign, Eye } from "lucide-react"

export default async function UsersPage() {
  const users = await getAllUsers()

  const totalBalance = users.reduce((acc, u) => acc + Number(u.walletBalance) + Number(u.lockedBalance), 0)
  const totalUsers = users.length
  const adminUsers = users.filter((u) => u.isAdmin).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">Manage platform users</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Admin Users</p>
              <p className="text-2xl font-bold text-foreground">{adminUsers}</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Platform Balance</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground">All Users</h3>
        
        {users.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Available</th>
                  <th className="pb-3 pr-4">Locked</th>
                  <th className="pb-3 pr-4">Total Earnings</th>
                  <th className="pb-3 pr-4">Referral Code</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-medium">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      ${Number(user.walletBalance).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      ${Number(user.lockedBalance).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 text-green-500">
                      +${Number(user.totalEarnings).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-sm text-muted-foreground">
                      {user.referralCode}
                    </td>
                    <td className="py-3 pr-4">
                      {user.isAdmin ? (
                        <Badge className="bg-red-500/10 text-red-500">Admin</Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-500">User</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
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
