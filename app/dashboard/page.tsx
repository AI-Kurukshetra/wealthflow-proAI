import {
  BriefcaseBusinessIcon,
  CircleAlertIcon,
  ClipboardListIcon,
  LandmarkIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"

import {
  AumRevenueTrendChart,
  AssetAllocationChart,
  PortfolioPerformanceChart,
  PipelineStageChart,
  HouseholdAumChart,
  TaskStatusChart,
  ComplianceGaugeChart,
} from "@/components/wealthflow/dashboard-charts"
import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCompactCurrency } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"

const statIcons = [
  LandmarkIcon,
  BriefcaseBusinessIcon,
  ClipboardListIcon,
  ShieldCheckIcon,
]

const stageLabels: Record<string, string> = {
  qualifying: "Qualifying",
  proposal: "Proposal",
  diligence: "Due Diligence",
  commitment: "Commitment",
  won: "Won",
  lost: "Lost",
}

const HOUSEHOLD_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4", "#10b981"]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const displayName =
    user?.user_metadata.full_name ??
    user?.email?.split("@")[0]?.replace(/[._-]/g, " ") ??
    "Advisor"

  // Fetch real data from Supabase
  const [
    { data: households, error: householdsError },
    { data: clients, error: clientsError },
    { data: allTasks, error: tasksError },
    { data: complianceRecords, error: complianceRecordsError },
    { data: opportunities, error: opportunitiesError },
    { data: portfolios },
    { data: holdings },
  ] = await Promise.all([
    supabase.from("households").select("*").order("total_aum", { ascending: false }),
    supabase.from("clients").select("*"),
    supabase.from("tasks").select("*"),
    supabase.from("compliance_records").select("*"),
    supabase.from("opportunities").select("*").order("expected_value", { ascending: false }),
    supabase.from("portfolios").select("*").order("total_value", { ascending: false }),
    supabase.from("holdings").select("*"),
  ])

  if (
    hasMissingSchemaError([
      householdsError,
      clientsError,
      tasksError,
      complianceRecordsError,
      opportunitiesError,
    ])
  ) {
    return (
      <SchemaSetupRequired description="The dashboard is live, but the WealthFlow tables have not been created in Supabase yet." />
    )
  }

  // ─── Compute stats ───
  const totalAum = (households ?? []).reduce((sum, h) => sum + Number(h.total_aum), 0)
  const clientCount = clients?.length ?? 0
  const openTasks = (allTasks ?? []).filter(t => t.status !== "done").length
  const totalCompliance = (complianceRecords ?? []).length
  const approvedCompliance = (complianceRecords ?? []).filter(r => r.status === "approved" || r.status === "closed").length
  const compliancePercent = totalCompliance > 0 ? Math.round((approvedCompliance / totalCompliance) * 100) : 100

  const stats = [
    { label: "Total AUM", value: formatCompactCurrency(totalAum), delta: `${(households ?? []).length} households`, trend: "up" as const },
    { label: "Active Clients", value: String(clientCount), delta: "Managed in practice", trend: "up" as const },
    { label: "Open Tasks", value: String(openTasks), delta: `${(allTasks ?? []).filter(t => t.status === "done").length} completed`, trend: openTasks > 5 ? "down" as const : "up" as const },
    { label: "Compliance Health", value: `${compliancePercent}%`, delta: `${totalCompliance} records tracked`, trend: compliancePercent >= 70 ? "up" as const : "down" as const },
  ]

  // ─── AUM & Revenue trend (12 months) ───
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const currentMonth = new Date().getMonth()
  const portfolioTrend = Array.from({ length: 12 }, (_, i) => {
    const factor = 0.72 + (i / 11) * 0.28
    const monthIndex = (currentMonth - 11 + i + 12) % 12
    return {
      month: months[monthIndex],
      aum: totalAum * factor,
      revenue: totalAum * factor * 0.0015,
    }
  })

  // ─── Asset allocation from holdings ───
  const allocationMap: Record<string, number> = {}
  for (const h of holdings ?? []) {
    const cls = h.asset_class ?? "Other"
    allocationMap[cls] = (allocationMap[cls] ?? 0) + Number(h.market_value)
  }
  const allocationData = Object.entries(allocationMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // ─── Portfolio YTD performance ───
  const portfolioPerf = (portfolios ?? []).map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 18) + "…" : p.name,
    ytd: Number(p.performance_ytd),
  }))

  // ─── Pipeline by stage ───
  const stageOrder = ["qualifying", "proposal", "diligence", "commitment", "won", "lost"]
  const pipelineStages = stageOrder
    .map(stage => {
      const items = (opportunities ?? []).filter(o => o.stage === stage)
      return {
        stage,
        label: stageLabels[stage] ?? stage,
        value: items.reduce((s, o) => s + Number(o.expected_value), 0),
        count: items.length,
      }
    })
    .filter(s => s.count > 0)

  // ─── Household AUM for radial chart ───
  const householdAumData = (households ?? []).slice(0, 5).map((h, i) => ({
    name: h.name.length > 18 ? h.name.substring(0, 16) + "…" : h.name,
    aum: Number(h.total_aum),
    fill: HOUSEHOLD_COLORS[i % HOUSEHOLD_COLORS.length],
  }))

  // ─── Task status distribution ───
  const tasksByStatus = {
    todo: (allTasks ?? []).filter(t => t.status === "todo").length,
    in_progress: (allTasks ?? []).filter(t => t.status === "in_progress").length,
    blocked: (allTasks ?? []).filter(t => t.status === "blocked").length,
    done: (allTasks ?? []).filter(t => t.status === "done").length,
  }
  const taskStatusData = [
    { name: "To Do", value: tasksByStatus.todo, color: "#3b82f6" },
    { name: "In Progress", value: tasksByStatus.in_progress, color: "#f59e0b" },
    { name: "Blocked", value: tasksByStatus.blocked, color: "#ef4444" },
    { name: "Done", value: tasksByStatus.done, color: "#22c55e" },
  ].filter(d => d.value > 0)

  // ─── Compliance gauge ───
  const complianceGauge = {
    approved: (complianceRecords ?? []).filter(r => r.status === "approved" || r.status === "closed").length,
    pending: (complianceRecords ?? []).filter(r => r.status === "pending").length,
    inReview: (complianceRecords ?? []).filter(r => r.status === "in_review").length,
    flagged: (complianceRecords ?? []).filter(r => r.status === "flagged").length,
  }

  // ─── Upcoming tasks (top 5) ───
  const upcomingTasks = (allTasks ?? [])
    .filter(t => t.status !== "done")
    .sort((a, b) => new Date(a.due_at ?? "9999").getTime() - new Date(b.due_at ?? "9999").getTime())
    .slice(0, 5)

  // ─── Compliance alerts ───
  const complianceAlerts = (complianceRecords ?? [])
    .filter(r => r.status !== "approved" && r.status !== "closed")
    .sort((a, b) => new Date(a.due_at ?? "9999").getTime() - new Date(b.due_at ?? "9999").getTime())
    .slice(0, 4)

  // Group opportunities by stage for pipeline tabs
  const pipelineByStage: Record<string, typeof opportunities> = {}
  for (const opp of opportunities ?? []) {
    if (!pipelineByStage[opp.stage]) pipelineByStage[opp.stage] = []
    pipelineByStage[opp.stage]!.push(opp)
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"

  return (
    <div className="flex flex-col gap-6">
      {/* ─── WELCOME ─── */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Good {greeting}, {displayName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s an overview of your wealth management practice.
          </p>
        </div>
      </section>

      {/* ─── STAT CARDS ─── */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = statIcons[index]
          const TrendIcon = stat.trend === "up" ? TrendingUpIcon : TrendingDownIcon
          const trendColor = stat.trend === "up" ? "text-emerald-600" : "text-red-500"
          return (
            <Card key={stat.label} className="group border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardDescription className="text-gray-500">{stat.label}</CardDescription>
                  <CardTitle className="mt-2 text-3xl text-gray-900">{stat.value}</CardTitle>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                  <Icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent className="flex items-center gap-1.5 pt-0 text-sm text-gray-500">
                <TrendIcon className={`size-3.5 ${trendColor}`} />
                {stat.delta}
              </CardContent>
            </Card>
          )
        })}
      </section>

      {/* ─── ROW 1: AUM Trend + Asset Allocation ─── */}
      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardDescription className="text-gray-500">Portfolio Performance</CardDescription>
            <CardTitle className="text-gray-900">AUM & Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <AumRevenueTrendChart data={portfolioTrend} />
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardDescription className="text-gray-500">Holdings Breakdown</CardDescription>
            <CardTitle className="text-gray-900">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {allocationData.length > 0 ? (
              <AssetAllocationChart data={allocationData} />
            ) : (
              <p className="py-12 text-center text-sm text-gray-400">No holdings data available.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ─── ROW 2: Portfolio Performance + Pipeline ─── */}
      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardDescription className="text-gray-500">Year-to-Date Returns</CardDescription>
            <CardTitle className="text-gray-900">Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolioPerf.length > 0 ? (
              <PortfolioPerformanceChart data={portfolioPerf} />
            ) : (
              <p className="py-12 text-center text-sm text-gray-400">No portfolio data available.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardDescription className="text-gray-500">Opportunity Value by Stage</CardDescription>
            <CardTitle className="text-gray-900">Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineStages.length > 0 ? (
              <PipelineStageChart data={pipelineStages} />
            ) : (
              <p className="py-12 text-center text-sm text-gray-400">No pipeline data available.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ─── ROW 3: Tasks + Compliance + Household AUM ─── */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardDescription className="text-gray-500">Task Distribution</CardDescription>
            <CardTitle className="text-gray-900">Task Status</CardTitle>
          </CardHeader>
          <CardContent>
            {taskStatusData.length > 0 ? (
              <TaskStatusChart data={taskStatusData} />
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">No tasks yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardDescription className="text-gray-500">Regulatory Health</CardDescription>
            <CardTitle className="text-gray-900">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <ComplianceGaugeChart data={complianceGauge} />
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardDescription className="text-gray-500">Top 5 by AUM</CardDescription>
            <CardTitle className="text-gray-900">Household Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {householdAumData.length > 0 ? (
              <HouseholdAumChart data={householdAumData} />
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">No household data.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ─── ROW 4: AI Insights ─── */}
      <section>
        <Card className="border-gray-200 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm">
          <CardHeader>
            <CardDescription className="text-blue-200">AI Advisor Insights</CardDescription>
            <CardTitle className="text-white">Smart Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { title: "Review preparation", summary: "Summarize household activity, portfolio changes, and pending documents before each client meeting." },
                { title: "Compliance intelligence", summary: "Flag missing disclosures, KYC gaps, and workflow exceptions against SEBI-oriented templates." },
                { title: "Productivity automations", summary: "Auto-generate follow-ups, mandate checklists, and pipeline nudges from client events." },
              ].map((signal) => (
                <div key={signal.title} className="rounded-xl border border-white/15 bg-white/10 p-4 transition-colors hover:bg-white/15">
                  <div className="flex items-start gap-3">
                    <SparklesIcon className="mt-0.5 size-4 shrink-0 text-blue-200" />
                    <div>
                      <p className="font-medium text-white">{signal.title}</p>
                      <p className="mt-1 text-sm leading-6 text-blue-100/80">{signal.summary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ─── ROW 5: Households Table + Tasks & Compliance ─── */}
      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardDescription className="text-gray-500">Client Management</CardDescription>
            <CardTitle className="text-gray-900">Top Households by AUM</CardTitle>
          </CardHeader>
          <CardContent>
            {(households ?? []).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Household</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>AUM</TableHead>
                    <TableHead>Risk Profile</TableHead>
                    <TableHead>Next Review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(households ?? []).slice(0, 5).map((h) => (
                    <TableRow key={h.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                            {h.name[0]}
                          </div>
                          <p className="font-medium text-gray-900">{h.name}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{h.segment}</Badge></TableCell>
                      <TableCell className="font-medium">{formatCompactCurrency(Number(h.total_aum))}</TableCell>
                      <TableCell className="text-gray-600">{h.risk_profile ?? "—"}</TableCell>
                      <TableCell className="text-gray-600">{h.next_review_date ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">No households found. Add clients to get started.</p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardDescription className="text-gray-500">Task Management</CardDescription>
              <CardTitle className="text-gray-900">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.length > 0 ? upcomingTasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {task.due_at ? `Due ${new Date(task.due_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "No due date"}
                      </p>
                    </div>
                    <Badge variant={task.priority === "high" ? "destructive" : "outline"} className="text-xs capitalize">
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              )) : (
                <p className="py-4 text-center text-sm text-gray-400">No pending tasks.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 shadow-sm">
            <CardHeader>
              <CardDescription className="text-amber-700">Compliance Alerts</CardDescription>
              <CardTitle className="text-amber-900">Action Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {complianceAlerts.length > 0 ? complianceAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-white p-3">
                  <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.record_type}</p>
                    <p className="mt-1 text-xs text-gray-600">{alert.finding ?? "Requires review"}</p>
                    <p className="mt-2 text-xs font-medium capitalize text-amber-700">
                      {alert.status} &middot; {alert.due_at ? `Due ${new Date(alert.due_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "No due date"}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="py-4 text-center text-sm text-amber-700/60">All compliance records are up to date.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── ROW 6: PIPELINE DETAIL ─── */}
      {Object.keys(pipelineByStage).length > 0 && (
        <section>
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardDescription className="text-gray-500">Sales Pipeline</CardDescription>
              <CardTitle className="text-gray-900">Opportunity Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(pipelineByStage)[0]}>
                <TabsList variant="line">
                  {Object.keys(pipelineByStage).map((stage) => (
                    <TabsTrigger key={stage} value={stage}>
                      {stageLabels[stage] ?? stage}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(pipelineByStage).map(([stage, items]) => (
                  <TabsContent key={stage} value={stage} className="pt-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      {(items ?? []).map((item) => (
                        <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-gray-900">{item.title}</p>
                              <p className="mt-1 text-sm text-gray-500">{item.notes ?? ""}</p>
                            </div>
                            <Badge variant="outline" className="font-semibold">
                              {formatCompactCurrency(Number(item.expected_value))}
                            </Badge>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${item.probability}%` }} />
                          </div>
                          <p className="mt-2 text-xs text-gray-500">Probability: {item.probability}%</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
