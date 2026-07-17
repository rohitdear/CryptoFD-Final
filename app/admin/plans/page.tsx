import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAdminFDPlans } from "@/lib/admin-queries"
import { PlanActions } from "./plan-actions"
import { CreatePlanForm } from "./create-plan-form"

export default async function PlansPage() {
  const plans = await getAdminFDPlans()
  const activePlans = plans.filter((p) => p.isActive)
  const inactivePlans = plans.filter((p) => !p.isActive)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">FD Plans</h1>
        <p className="text-muted-foreground">Manage fixed deposit plans</p>
      </div>

      {/* Create New Plan */}
      <CreatePlanForm />

      {/* Active Plans */}
      <Card className="rounded-2xl border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground">
          Active Plans ({activePlans.length})
        </h3>
        
        {activePlans.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No active plans. Create one above.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activePlans.map((plan) => (
              <div key={plan.id} className="rounded-xl border border-border bg-secondary/30 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">{plan.name}</h4>
                    <Badge className="mt-1 bg-green-500/10 text-green-500">Active</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-500">{plan.dailyRoi}%</p>
                    <p className="text-xs text-muted-foreground">/day</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Min Amount</p>
                    <p className="font-medium text-foreground">${plan.minAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Amount</p>
                    <p className="font-medium text-foreground">${plan.maxAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">{plan.durationDays} days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total ROI</p>
                    <p className="font-medium text-green-500">
                      {(Number(plan.dailyRoi) * plan.durationDays).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <PlanActions plan={plan} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Inactive Plans */}
      {inactivePlans.length > 0 && (
        <Card className="rounded-2xl border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Inactive Plans ({inactivePlans.length})
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Daily ROI</th>
                  <th className="pb-3 pr-4">Min/Max</th>
                  <th className="pb-3 pr-4">Duration</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inactivePlans.map((plan) => (
                  <tr key={plan.id} className="border-b border-border">
                    <td className="py-3 pr-4 font-medium text-foreground">{plan.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{plan.dailyRoi}%/day</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      ${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{plan.durationDays} days</td>
                    <td className="py-3">
                      <PlanActions plan={plan} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
