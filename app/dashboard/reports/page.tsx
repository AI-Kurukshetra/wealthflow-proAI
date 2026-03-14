import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCompactCurrency } from "@/lib/format"
import { hasMissingSchemaError } from "@/lib/supabase/schema"

export const metadata = { title: "Reports" }

export default async function ReportsPage() {
  const supabase = await createClient()

  const [
    { data: households, error: householdsError },
    { data: clients, error: clientsError },
    { data: portfolios, error: portfoliosError },
    { data: goals, error: goalsError },
    { data: tasks, error: tasksError },
    { data: meetings, error: meetingsError },
    { data: communications, error: communicationsError },
    { data: compliance, error: complianceError },
    { data: opportunities, error: opportunitiesError },
    { data: feeSchedules, error: feeSchedulesError },
  ] = await Promise.all([
    supabase.from("households").select("*"),
    supabase.from("clients").select("*"),
    supabase.from("portfolios").select("*"),
    supabase.from("goals").select("*"),
    supabase.from("tasks").select("*"),
    supabase.from("meetings").select("*"),
    supabase.from("communication_logs").select("*"),
    supabase.from("compliance_records").select("*"),
    supabase.from("opportunities").select("*"),
    supabase.from("fee_schedules").select("*"),
  ])

  if (
    hasMissingSchemaError([
      householdsError,
      clientsError,
      portfoliosError,
      goalsError,
      tasksError,
      meetingsError,
      communicationsError,
      complianceError,
      opportunitiesError,
      feeSchedulesError,
    ])
  ) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to unlock reports and analytics." />
    )
  }

  const totalAum = (households ?? []).reduce((sum, h) => sum + Number(h.total_aum), 0)
  const totalPortfolioValue = (portfolios ?? []).reduce((sum, p) => sum + Number(p.total_value), 0)
  const avgYtd = (portfolios ?? []).length > 0
    ? ((portfolios ?? []).reduce((sum, p) => sum + Number(p.performance_ytd), 0) / (portfolios ?? []).length).toFixed(1)
    : "0"

  const openTasks = (tasks ?? []).filter(t => t.status !== "done").length
  const doneTasks = (tasks ?? []).filter(t => t.status === "done").length
  const totalGoals = (goals ?? []).length
  const onTrackGoals = (goals ?? []).filter(g => g.status === "on_track").length
  const achievedGoals = (goals ?? []).filter(g => g.status === "achieved").length
  const totalGoalTarget = (goals ?? []).reduce((sum, g) => sum + Number(g.target_amount), 0)

  const now = new Date()
  const upcomingMeetings = (meetings ?? []).filter(m => new Date(m.starts_at) >= now).length
  const pastMeetings = (meetings ?? []).filter(m => new Date(m.starts_at) < now).length
  const communicationsToday = (communications ?? []).filter((log) => {
    const loggedDate = new Date(log.logged_at)
    return (
      loggedDate.getFullYear() === now.getFullYear() &&
      loggedDate.getMonth() === now.getMonth() &&
      loggedDate.getDate() === now.getDate()
    )
  }).length

  const complianceApproved = (compliance ?? []).filter(r => r.status === "approved" || r.status === "closed").length
  const complianceTotal = (compliance ?? []).length
  const complianceRate = complianceTotal > 0 ? Math.round((complianceApproved / complianceTotal) * 100) : 100

  const pipelineValue = (opportunities ?? []).reduce((sum, o) => sum + Number(o.expected_value), 0)
  const weightedPipeline = (opportunities ?? []).reduce((sum, o) => sum + Number(o.expected_value) * (o.probability / 100), 0)

  const totalFeesBps = (feeSchedules ?? []).reduce((sum, f) => sum + Number(f.advisory_fee_bps), 0)
  const avgFee = (feeSchedules ?? []).length > 0 ? (totalFeesBps / (feeSchedules ?? []).length).toFixed(0) : "0"
  const overdueFees = (feeSchedules ?? []).filter(f => f.collection_status === "overdue").length

  const kycPending = (clients ?? []).filter(c => c.kyc_status === "pending").length
  const kycExpired = (clients ?? []).filter(c => c.kyc_status === "expired").length

  const sections = [
    {
      title: "Practice Overview",
      items: [
        { label: "Total Households", value: String((households ?? []).length) },
        { label: "Total Clients", value: String((clients ?? []).length) },
        { label: "Total AUM", value: formatCompactCurrency(totalAum) },
        { label: "Portfolio Value", value: formatCompactCurrency(totalPortfolioValue) },
      ],
    },
    {
      title: "Portfolio Performance",
      items: [
        { label: "Active Portfolios", value: String((portfolios ?? []).length) },
        { label: "Avg YTD Return", value: `${avgYtd}%` },
        { label: "Total AUM", value: formatCompactCurrency(totalAum) },
      ],
    },
    {
      title: "Task Management",
      items: [
        { label: "Open Tasks", value: String(openTasks) },
        { label: "Completed Tasks", value: String(doneTasks) },
        { label: "Completion Rate", value: `${openTasks + doneTasks > 0 ? Math.round((doneTasks / (openTasks + doneTasks)) * 100) : 0}%` },
      ],
    },
    {
      title: "Goals",
      items: [
        { label: "Total Goals", value: String(totalGoals) },
        { label: "On Track", value: String(onTrackGoals) },
        { label: "Achieved", value: String(achievedGoals) },
        { label: "Target Corpus", value: formatCompactCurrency(totalGoalTarget) },
      ],
    },
    {
      title: "Activity",
      items: [
        { label: "Upcoming Meetings", value: String(upcomingMeetings) },
        { label: "Past Meetings", value: String(pastMeetings) },
        { label: "Communication Logs", value: String((communications ?? []).length) },
        { label: "Logged Today", value: String(communicationsToday) },
      ],
    },
    {
      title: "Compliance",
      items: [
        { label: "Total Records", value: String(complianceTotal) },
        { label: "Compliance Rate", value: `${complianceRate}%` },
        { label: "KYC Pending", value: String(kycPending) },
        { label: "KYC Expired", value: String(kycExpired) },
      ],
    },
    {
      title: "Sales Pipeline",
      items: [
        { label: "Open Opportunities", value: String((opportunities ?? []).length) },
        { label: "Pipeline Value", value: formatCompactCurrency(pipelineValue) },
        { label: "Weighted Value", value: formatCompactCurrency(weightedPipeline) },
      ],
    },
    {
      title: "Fee & Billing",
      items: [
        { label: "Active Schedules", value: String((feeSchedules ?? []).length) },
        { label: "Avg Fee (bps)", value: `${avgFee} bps` },
        { label: "Overdue Invoices", value: String(overdueFees) },
      ],
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Practice-wide metrics and business intelligence</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title} className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-gray-900">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
