"use client"

import {
  ActivityIcon,
  BriefcaseBusinessIcon,
  FileTextIcon,
  PieChartIcon,
  TargetIcon,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCompactCurrency } from "@/lib/format"

const PORTAL_COLORS = ["#163654", "#1d6fa3", "#f29f67", "#4f8f79", "#cf5c36", "#7e8aa0"]

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.97)",
  border: "1px solid rgba(148, 163, 184, 0.24)",
  borderRadius: 18,
  boxShadow: "0 24px 70px -36px rgba(15, 23, 42, 0.45)",
  fontSize: 13,
}

type AllocationDatum = {
  name: string
  percentage: number
  value: number
}

type PortfolioDatum = {
  accounts: number
  holdings: number
  liquidity: number
  name: string
  value: number
  ytd: number
}

type GoalDatum = {
  currentAmount: number
  priority: string
  progress: number
  status: string
  targetAmount: number
  title: string
}

type ActivityDatum = {
  documents: number
  meetings: number
  month: string
  updates: number
}

type ClientPortalInsightsProps = {
  activityData: ActivityDatum[]
  allocationData: AllocationDatum[]
  goalData: GoalDatum[]
  openTasks: number
  portfolioData: PortfolioDatum[]
  signedDocuments: number
  totalAum: number
  totalDocuments: number
  upcomingMeetings: number
}

function numberValue(value: unknown) {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function EmptyState({
  description,
  title,
}: {
  description: string
  title: string
}) {
  return (
    <div className="flex min-h-80 items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,252,0.9),rgba(255,255,255,0.95))] p-8 text-center">
      <div className="max-w-sm space-y-2">
        <p className="text-base font-medium text-slate-900">{title}</p>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  )
}

export function ClientPortalInsights({
  activityData,
  allocationData,
  goalData,
  openTasks,
  portfolioData,
  signedDocuments,
  totalAum,
  totalDocuments,
  upcomingMeetings,
}: ClientPortalInsightsProps) {
  const defaultTab =
    allocationData.length > 0
      ? "allocation"
      : portfolioData.length > 0
        ? "portfolios"
        : goalData.length > 0
          ? "goals"
          : "activity"

  const trackedAssets = allocationData.reduce((sum, item) => sum + item.value, 0)
  const signedRatio =
    totalDocuments > 0 ? Math.round((signedDocuments / totalDocuments) * 100) : 100
  const fundedAmount = goalData.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const targetAmount = goalData.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const goalFundingRatio =
    targetAmount > 0 ? Math.round((fundedAmount / targetAmount) * 100) : 0
  const activityTotals = activityData.reduce(
    (totals, month) => ({
      documents: totals.documents + month.documents,
      meetings: totals.meetings + month.meetings,
      updates: totals.updates + month.updates,
    }),
    { documents: 0, meetings: 0, updates: 0 },
  )

  return (
    <Card className="overflow-hidden border-white/70 bg-white/82 py-0 shadow-[0_30px_90px_-48px_rgba(15,23,42,0.65)] backdrop-blur-xl">
      <Tabs defaultValue={defaultTab} className="gap-0">
        <CardHeader className="space-y-6 border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(250,252,255,0.96),rgba(237,246,255,0.94),rgba(255,245,232,0.88))] px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <Badge
                variant="outline"
                className="border-sky-200 bg-white/70 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-900"
              >
                Interactive Insights
              </Badge>
              <CardTitle className="mt-4 text-2xl tracking-tight text-slate-950 sm:text-[2rem]">
                Portfolio, planning, and service momentum
              </CardTitle>
              <CardDescription className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Move through each view to understand your current wealth mix,
                portfolio positioning, goal funding, and recent advisor activity.
              </CardDescription>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm shadow-slate-950/5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Tracked Assets
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {formatCompactCurrency(trackedAssets || totalAum)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Allocation coverage in the portal
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm shadow-slate-950/5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Signed Docs
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {signedRatio}%
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {signedDocuments} of {totalDocuments} files completed
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm shadow-slate-950/5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Goal Funding
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {goalFundingRatio}%
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatCompactCurrency(fundedAmount)} funded so far
                </p>
              </div>
            </div>
          </div>

          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-[24px] border border-white/80 bg-white/72 p-1.5 shadow-sm shadow-slate-950/5">
            <TabsTrigger
              value="allocation"
              className="flex-none rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-600 data-active:bg-slate-950 data-active:text-white"
            >
              <PieChartIcon className="size-4" />
              Allocation
            </TabsTrigger>
            <TabsTrigger
              value="portfolios"
              className="flex-none rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-600 data-active:bg-slate-950 data-active:text-white"
            >
              <BriefcaseBusinessIcon className="size-4" />
              Portfolios
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="flex-none rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-600 data-active:bg-slate-950 data-active:text-white"
            >
              <TargetIcon className="size-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="flex-none rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-600 data-active:bg-slate-950 data-active:text-white"
            >
              <ActivityIcon className="size-4" />
              Activity
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className="px-6 py-6 sm:px-8">
          <TabsContent value="allocation">
            {allocationData.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
                <div className="rounded-[28px] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(239,246,255,0.92))] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Household allocation mix
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Hover any segment for a precise asset view.
                      </p>
                    </div>
                    <Badge variant="outline" className="border-slate-200 bg-white/80 text-slate-700">
                      {allocationData.length} segments
                    </Badge>
                  </div>

                  <div className="mt-6 h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocationData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={88}
                          outerRadius={124}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {allocationData.map((item, index) => (
                            <Cell
                              key={`${item.name}-${index}`}
                              fill={PORTAL_COLORS[index % PORTAL_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(value) => [
                            formatCompactCurrency(numberValue(value)),
                            "Tracked value",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3">
                  {allocationData.slice(0, 6).map((item, index) => (
                    <div
                      key={item.name}
                      className="rounded-2xl border border-slate-200/70 bg-white/92 p-4 shadow-sm shadow-slate-950/5"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="size-3 shrink-0 rounded-full"
                          style={{ backgroundColor: PORTAL_COLORS[index % PORTAL_COLORS.length] }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900">{item.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                            {item.percentage}% of tracked assets
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-950">
                          {formatCompactCurrency(item.value)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                    <p className="text-sm font-medium text-slate-900">Mix summary</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      The portal is tracking {allocationData.length} allocation
                      slices across {formatCompactCurrency(trackedAssets || totalAum)}{" "}
                      in visible assets.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Allocation data will appear here"
                description="Add holdings or portfolios to see how household assets are distributed."
              />
            )}
          </TabsContent>

          <TabsContent value="portfolios">
            {portfolioData.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                <div className="rounded-[28px] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(240,249,255,0.92))] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Portfolio value comparison
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Each bar is sized by current value and colored by return strength.
                      </p>
                    </div>
                    <Badge variant="outline" className="border-slate-200 bg-white/80 text-slate-700">
                      {portfolioData.length} active portfolios
                    </Badge>
                  </div>

                  <div className="mt-6 h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={portfolioData}
                        layout="vertical"
                        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                      >
                        <CartesianGrid
                          horizontal={false}
                          stroke="rgba(148, 163, 184, 0.18)"
                        />
                        <XAxis
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          tickFormatter={(value) => formatCompactCurrency(numberValue(value))}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#334155", fontSize: 12 }}
                          width={140}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                          contentStyle={tooltipStyle}
                          formatter={(value, _, item) => {
                            const payload = item.payload as PortfolioDatum
                            return [
                              formatCompactCurrency(numberValue(value)),
                              `${payload.ytd >= 0 ? "+" : ""}${payload.ytd.toFixed(1)}% YTD`,
                            ]
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 12, 12, 0]} maxBarSize={28}>
                          {portfolioData.map((portfolio, index) => (
                            <Cell
                              key={`${portfolio.name}-${index}`}
                              fill={
                                portfolio.ytd >= 12
                                  ? "#163654"
                                  : portfolio.ytd >= 0
                                    ? "#1d6fa3"
                                    : "#cf5c36"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3">
                  {portfolioData.map((portfolio) => (
                    <div
                      key={portfolio.name}
                      className="rounded-2xl border border-slate-200/70 bg-white/92 p-4 shadow-sm shadow-slate-950/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">{portfolio.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                            {portfolio.accounts} accounts · {portfolio.holdings} holdings
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            portfolio.ytd >= 0
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                          }
                        >
                          {portfolio.ytd >= 0 ? "+" : ""}
                          {portfolio.ytd.toFixed(1)}% YTD
                        </Badge>
                      </div>
                      <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                        {formatCompactCurrency(portfolio.value)}
                      </p>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#163654,#1d6fa3,#f29f67)]"
                          style={{ width: `${Math.max(8, Math.min(100, portfolio.liquidity || 0))}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Liquidity ratio {portfolio.liquidity > 0 ? `${portfolio.liquidity.toFixed(0)}%` : "not set"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Portfolio charts will appear here"
                description="Create portfolios to compare current value, return, and liquidity at a glance."
              />
            )}
          </TabsContent>

          <TabsContent value="goals">
            {goalData.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                <div className="rounded-[28px] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(245,252,248,0.92))] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Goal completion outlook
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Compare funding progress across every active household goal.
                      </p>
                    </div>
                    <Badge variant="outline" className="border-slate-200 bg-white/80 text-slate-700">
                      {goalData.length} goals
                    </Badge>
                  </div>

                  <div className="mt-6 h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={goalData}
                        layout="vertical"
                        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                      >
                        <CartesianGrid
                          horizontal={false}
                          stroke="rgba(148, 163, 184, 0.16)"
                        />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          tickFormatter={(value) => `${numberValue(value)}%`}
                        />
                        <YAxis
                          type="category"
                          dataKey="title"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#334155", fontSize: 12 }}
                          width={140}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                          contentStyle={tooltipStyle}
                          formatter={(value, _, item) => {
                            const payload = item.payload as GoalDatum
                            return [
                              `${numberValue(value)}% funded`,
                              `${formatCompactCurrency(payload.currentAmount)} of ${formatCompactCurrency(payload.targetAmount)}`,
                            ]
                          }}
                        />
                        <Bar dataKey="progress" radius={[0, 12, 12, 0]} maxBarSize={26}>
                          {goalData.map((goal, index) => (
                            <Cell
                              key={`${goal.title}-${index}`}
                              fill={
                                goal.progress >= 80
                                  ? "#4f8f79"
                                  : goal.progress >= 45
                                    ? "#f29f67"
                                    : "#1d6fa3"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3">
                  {goalData.map((goal) => (
                    <div
                      key={goal.title}
                      className="rounded-2xl border border-slate-200/70 bg-white/92 p-4 shadow-sm shadow-slate-950/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">{goal.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                            {goal.priority} priority
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            goal.status === "achieved"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : goal.status === "at_risk"
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                          }
                        >
                          {goal.status.replaceAll("_", " ")}
                        </Badge>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#163654,#4f8f79,#f29f67)]"
                          style={{ width: `${Math.max(6, goal.progress)}%` }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-500">
                          {formatCompactCurrency(goal.currentAmount)} funded
                        </span>
                        <span className="font-medium text-slate-900">
                          {goal.progress}% complete
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Goal tracking will appear here"
                description="Add household goals to compare progress and funding momentum in one place."
              />
            )}
          </TabsContent>

          <TabsContent value="activity">
            {activityData.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                <div className="rounded-[28px] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(255,247,237,0.88))] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Portal activity over time
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Shared documents, meetings, and advisor updates for the last six months.
                      </p>
                    </div>
                    <Badge variant="outline" className="border-slate-200 bg-white/80 text-slate-700">
                      6-month view
                    </Badge>
                  </div>

                  <div className="mt-6 h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={activityData}
                        margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="portalDocuments" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#163654" stopOpacity={0.28} />
                            <stop offset="100%" stopColor="#163654" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="portalMeetings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1d6fa3" stopOpacity={0.26} />
                            <stop offset="100%" stopColor="#1d6fa3" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="portalUpdates" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f29f67" stopOpacity={0.24} />
                            <stop offset="100%" stopColor="#f29f67" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          vertical={false}
                          stroke="rgba(148, 163, 184, 0.18)"
                          strokeDasharray="4 4"
                        />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                        />
                        <YAxis
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(value, name) => [numberValue(value), String(name)]}
                        />
                        <Area
                          type="monotone"
                          dataKey="documents"
                          stroke="#163654"
                          strokeWidth={2.4}
                          fill="url(#portalDocuments)"
                        />
                        <Area
                          type="monotone"
                          dataKey="meetings"
                          stroke="#1d6fa3"
                          strokeWidth={2.2}
                          fill="url(#portalMeetings)"
                        />
                        <Area
                          type="monotone"
                          dataKey="updates"
                          stroke="#f29f67"
                          strokeWidth={2.2}
                          fill="url(#portalUpdates)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-slate-200/70 bg-white/92 p-4 shadow-sm shadow-slate-950/5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <FileTextIcon className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Documents shared</p>
                        <p className="text-xs text-slate-500">Visible across the last six months</p>
                      </div>
                    </div>
                    <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                      {activityTotals.documents}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white/92 p-4 shadow-sm shadow-slate-950/5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[#1d6fa3] text-white">
                        <ActivityIcon className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Advisor updates</p>
                        <p className="text-xs text-slate-500">Recent communication cadence</p>
                      </div>
                    </div>
                    <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                      {activityTotals.updates}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-white/92 p-4 shadow-sm shadow-slate-950/5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[#f29f67] text-white">
                        <TargetIcon className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Near-term activity</p>
                        <p className="text-xs text-slate-500">Upcoming service moments</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50/80 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Meetings
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">
                          {upcomingMeetings}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50/80 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Open tasks
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">
                          {openTasks}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Activity history will appear here"
                description="Once documents, meetings, or advisor updates are logged, the portal will chart that momentum over time."
              />
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
