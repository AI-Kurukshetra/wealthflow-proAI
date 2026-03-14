import Link from "next/link"
import { redirect } from "next/navigation"
import {
  CalendarIcon,
  CheckCircle2Icon,
  Clock3Icon,
  ExternalLinkIcon,
  FileTextIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  PieChartIcon,
  ShieldCheckIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react"

import { seedDemoWorkspaceForUser } from "@/lib/demo/seed-demo-workspace"
import type {
  Account,
  Client,
  CommunicationLog,
  Document,
  Goal,
  Holding,
  Household,
  Meeting,
  Portfolio,
  Task,
} from "@/lib/database.types"
import { formatCompactCurrency } from "@/lib/format"
import {
  canManageDocumentsStorage,
  createDocumentSignedUrl,
} from "@/lib/supabase/documents-storage"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"
import { ClientPortalInsights } from "@/components/wealthflow/client-portal-insights"
import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = { title: "Investor Portal" }

type PortalClient = Pick<
  Client,
  | "city"
  | "email"
  | "first_name"
  | "household_id"
  | "id"
  | "kyc_status"
  | "last_name"
  | "onboarding_stage"
  | "phone"
>

type PortfolioWithRelations = Portfolio & {
  accounts: Account[] | null
  holdings: Holding[] | null
}

type PortalDocument = Document & {
  download_url: string | null
}

function formatDate(value: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function pillClass(status: string) {
  switch (status) {
    case "verified":
    case "approved":
    case "done":
    case "achieved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "pending":
    case "todo":
    case "in_progress":
    case "on_track":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "expired":
    case "blocked":
    case "flagged":
    case "at_risk":
      return "border-red-200 bg-red-50 text-red-700"
    default:
      return "border-slate-200 bg-slate-50 text-slate-700"
  }
}

function goalProgress(goal: Goal) {
  if (Number(goal.target_amount) <= 0) return 0

  return Math.min(
    100,
    Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100),
  )
}

function buildPortalActivityData(
  documents: PortalDocument[],
  meetings: Meeting[],
  communications: CommunicationLog[],
) {
  const monthBuckets = Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setMonth(date.getMonth() - 5 + index, 1)

    return {
      documents: 0,
      key: `${date.getFullYear()}-${date.getMonth()}`,
      meetings: 0,
      month: date.toLocaleDateString("en-IN", { month: "short" }),
      updates: 0,
    }
  })

  const bucketsByKey = new Map(monthBuckets.map((bucket) => [bucket.key, bucket]))

  const incrementBucket = (
    value: string | null,
    field: "documents" | "meetings" | "updates",
  ) => {
    if (!value) return

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return

    const bucket = bucketsByKey.get(`${date.getFullYear()}-${date.getMonth()}`)

    if (bucket) {
      bucket[field] += 1
    }
  }

  documents.forEach((document) => incrementBucket(document.uploaded_at, "documents"))
  meetings.forEach((meeting) => incrementBucket(meeting.starts_at, "meetings"))
  communications.forEach((communication) => incrementBucket(communication.logged_at, "updates"))

  return monthBuckets.map((bucket) => ({
    documents: bucket.documents,
    meetings: bucket.meetings,
    month: bucket.month,
    updates: bucket.updates,
  }))
}

async function getPortalClients(supabase: Awaited<ReturnType<typeof createClient>>, email: string | null) {
  const clientFields =
    "id, first_name, last_name, email, phone, city, household_id, kyc_status, onboarding_stage"

  const [matchedResult, previewResult] = await Promise.all([
    email
      ? supabase.from("clients").select(clientFields).eq("email", email).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("clients").select(clientFields).order("created_at").limit(1).maybeSingle(),
  ])

  return {
    matchedClient: (matchedResult.data as PortalClient | null) ?? null,
    matchedClientError: matchedResult.error,
    previewClient: (previewResult.data as PortalClient | null) ?? null,
    previewClientError: previewResult.error,
  }
}

export default async function ClientPortalPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/sign-in?redirect=/client")
  }

  let portalClients = await getPortalClients(supabase, user.email ?? null)

  if (
    hasMissingSchemaError([
      portalClients.matchedClientError,
      portalClients.previewClientError,
    ])
  ) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the investor portal." />
    )
  }

  let autoSeedError: string | null = null

  if (!portalClients.matchedClient) {
    const seedResult = await seedDemoWorkspaceForUser({
      email: user.email ?? null,
      fullName: (user.user_metadata.full_name as string | undefined) ?? null,
      userId: user.id,
    })

    if (seedResult.error) {
      autoSeedError = seedResult.error
    } else {
      portalClients = await getPortalClients(supabase, user.email ?? null)
    }
  }

  const activeClient = portalClients.matchedClient ?? portalClients.previewClient
  const previewMode =
    !portalClients.matchedClient && Boolean(portalClients.previewClient)

  if (!activeClient) {
    return (
      <Card className="border-amber-200 bg-amber-50/70 shadow-sm">
        <CardHeader>
          <CardDescription className="text-amber-700">Investor Portal</CardDescription>
          <CardTitle className="text-slate-900">No investor profile is available yet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>
            WealthFlow could not find an investor record linked to this account,
            and there is no demo household data available yet.
          </p>
          {autoSeedError ? <p className="text-red-600">{autoSeedError}</p> : null}
          <Link href="/dashboard" className="font-medium text-blue-600 hover:text-blue-700">
            Open advisor workspace
          </Link>
        </CardContent>
      </Card>
    )
  }

  const [
    { data: household, error: householdError },
    { data: householdMembers, error: membersError },
    { data: portfolios, error: portfoliosError },
    { data: documents, error: documentsError },
    { data: meetings, error: meetingsError },
    { data: tasks, error: tasksError },
    { data: goals, error: goalsError },
    { data: communications, error: communicationsError },
  ] = await Promise.all([
    supabase.from("households").select("*").eq("id", activeClient.household_id).maybeSingle(),
    supabase
      .from("clients")
      .select("id, first_name, last_name, email, phone, city, kyc_status, onboarding_stage")
      .eq("household_id", activeClient.household_id)
      .order("first_name"),
    supabase
      .from("portfolios")
      .select("*, holdings(*), accounts(*)")
      .eq("household_id", activeClient.household_id)
      .order("total_value", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("household_id", activeClient.household_id)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("meetings")
      .select("*")
      .eq("household_id", activeClient.household_id)
      .order("starts_at", { ascending: true }),
    supabase
      .from("tasks")
      .select("*")
      .eq("household_id", activeClient.household_id)
      .order("due_at", { ascending: true }),
    supabase
      .from("goals")
      .select("*")
      .eq("household_id", activeClient.household_id)
      .order("target_date", { ascending: true }),
    supabase
      .from("communication_logs")
      .select("*")
      .eq("household_id", activeClient.household_id)
      .order("logged_at", { ascending: false })
      .limit(5),
  ])

  if (
    hasMissingSchemaError([
      householdError,
      membersError,
      portfoliosError,
      documentsError,
      meetingsError,
      tasksError,
      goalsError,
      communicationsError,
    ])
  ) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the investor portal." />
    )
  }

  const documentsWithUrls = await Promise.all(
    (((documents ?? []) as Document[]) || []).map(async (document) => ({
      ...document,
      download_url: canManageDocumentsStorage()
        ? await createDocumentSignedUrl(document.storage_path)
        : null,
    })),
  )

  const typedHousehold = household as Household | null
  const typedMembers = (householdMembers ?? []) as PortalClient[]
  const displayedMembers = typedMembers.some((member) => member.id === activeClient.id)
    ? [...typedMembers].sort((left, right) => {
        if (left.id === activeClient.id) return -1
        if (right.id === activeClient.id) return 1

        return left.first_name.localeCompare(right.first_name)
      })
    : [activeClient, ...typedMembers]
  const typedPortfolios = ((portfolios ?? []) as PortfolioWithRelations[]).map((portfolio) => ({
    ...portfolio,
    accounts: portfolio.accounts ?? [],
    holdings: portfolio.holdings ?? [],
  }))
  const typedDocuments = documentsWithUrls as PortalDocument[]
  const typedMeetings = (meetings ?? []) as Meeting[]
  const typedTasks = (tasks ?? []) as Task[]
  const typedGoals = (goals ?? []) as Goal[]
  const typedCommunications = (communications ?? []) as CommunicationLog[]

  const now = new Date()
  const totalAum = typedPortfolios.reduce(
    (sum, portfolio) => sum + Number(portfolio.total_value),
    0,
  )
  const displayedAum = totalAum || Number(typedHousehold?.total_aum ?? 0)
  const allUpcomingMeetings = typedMeetings.filter((meeting) => new Date(meeting.starts_at) >= now)
  const upcomingMeetings = allUpcomingMeetings.slice(0, 3)
  const allOpenTasks = typedTasks.filter((task) => task.status !== "done")
  const openTasks = allOpenTasks.slice(0, 4)
  const completedGoals = typedGoals.filter((goal) => goal.status === "achieved").length
  const signedDocuments = typedDocuments.filter((document) => document.signed).length
  const signedDocumentRatio =
    typedDocuments.length > 0 ? Math.round((signedDocuments / typedDocuments.length) * 100) : 100
  const goalFundingAmount = typedGoals.reduce(
    (sum, goal) => sum + Number(goal.current_amount),
    0,
  )
  const goalTargetAmount = typedGoals.reduce(
    (sum, goal) => sum + Number(goal.target_amount),
    0,
  )
  const goalFundingRatio =
    goalTargetAmount > 0 ? Math.round((goalFundingAmount / goalTargetAmount) * 100) : 0
  const weightedPerformance =
    displayedAum > 0
      ? typedPortfolios.reduce(
          (sum, portfolio) =>
            sum + Number(portfolio.total_value) * Number(portfolio.performance_ytd),
          0,
        ) / displayedAum
      : 0
  const totalCash = typedPortfolios.reduce(
    (sum, portfolio) =>
      sum +
      portfolio.accounts.reduce(
        (accountSum, account) => accountSum + Number(account.cash_balance),
        0,
      ),
    0,
  )
  const allHoldings = typedPortfolios.flatMap((portfolio) => portfolio.holdings)
  const allocationMap = new Map<string, number>()

  if (allHoldings.length > 0) {
    allHoldings.forEach((holding) => {
      const assetClass = holding.asset_class || "Other"

      allocationMap.set(
        assetClass,
        (allocationMap.get(assetClass) ?? 0) + Number(holding.market_value),
      )
    })
  } else {
    typedPortfolios.forEach((portfolio) => {
      allocationMap.set(portfolio.name, Number(portfolio.total_value))
    })
  }

  const rawAllocationData = Array.from(allocationMap.entries())
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
  const allocationTotal = rawAllocationData.reduce((sum, item) => sum + item.value, 0)
  const allocationData = rawAllocationData.map((item) => ({
    ...item,
    percentage: allocationTotal > 0 ? Math.round((item.value / allocationTotal) * 100) : 0,
  }))
  const portfolioChartData = typedPortfolios
    .map((portfolio) => ({
      accounts: portfolio.accounts.length,
      holdings: portfolio.holdings.length,
      liquidity: Number(portfolio.liquidity_ratio ?? 0),
      name: portfolio.name,
      value: Number(portfolio.total_value),
      ytd: Number(portfolio.performance_ytd),
    }))
    .sort((a, b) => b.value - a.value)
  const goalChartData = typedGoals.map((goal) => ({
    currentAmount: Number(goal.current_amount),
    priority: goal.priority,
    progress: goalProgress(goal),
    status: goal.status,
    targetAmount: Number(goal.target_amount),
    title: goal.title,
  }))
  const activityData = buildPortalActivityData(
    typedDocuments,
    typedMeetings,
    typedCommunications,
  )
  const householdName =
    typedHousehold?.name ?? `${activeClient.first_name} ${activeClient.last_name} household`
  const householdNotes =
    typedHousehold?.notes ??
    "Managed through WealthFlow Pro with unified planning, reporting, and secure document delivery."
  const nextMeeting = allUpcomingMeetings[0] ?? null
  const portalCardClass =
    "border-white/70 bg-white/82 shadow-[0_30px_90px_-48px_rgba(15,23,42,0.65)] backdrop-blur-xl"
  const insetCardClass =
    "rounded-[24px] border border-slate-200/70 bg-white/88 p-4 shadow-sm shadow-slate-950/5"

  return (
    <div className="relative space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] reveal">
        <Card className="overflow-hidden border-none bg-[radial-gradient(circle_at_top_left,rgba(242,159,103,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(29,111,163,0.28),transparent_36%),linear-gradient(135deg,#0f2437_0%,#163654_45%,#1d6fa3_100%)] py-0 text-white shadow-[0_36px_100px_-54px_rgba(15,23,42,0.95)]">
          <CardContent className="relative px-6 py-6 sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_64%)]" />

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-white/18 bg-white/10 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-50"
              >
                Investor Portal
              </Badge>
              <Badge
                variant="outline"
                className="border-white/18 bg-white/10 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-50"
              >
                {previewMode ? "Preview Mode" : "Secure Household Workspace"}
              </Badge>
            </div>

            <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)]">
              <div>
                <CardTitle className="max-w-3xl text-3xl leading-tight tracking-tight text-white sm:text-[2.6rem]">
                  Welcome back, {activeClient.first_name} {activeClient.last_name}
                </CardTitle>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-sky-50/82 sm:text-base">
                  Track your household value, portfolio mix, planning goals, and
                  advisor activity from a richer portal designed for faster check-ins.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={`${pillClass(activeClient.kyc_status)} border-white/15 bg-white/10 text-white`}
                  >
                    KYC {activeClient.kyc_status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-white/15 bg-white/10 text-white"
                  >
                    {typedHousehold?.risk_profile ?? "Risk profile pending"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`${pillClass(activeClient.onboarding_stage)} border-white/15 bg-white/10 text-white`}
                  >
                    {activeClient.onboarding_stage.replaceAll("_", " ")}
                  </Badge>
                </div>

                {previewMode ? (
                  <div className="mt-6 rounded-[24px] border border-amber-200/30 bg-amber-100/12 px-4 py-3 text-sm leading-6 text-amber-50">
                    Preview mode is active. This signed-in account is viewing the
                    seeded demo household until an investor record is linked.
                  </div>
                ) : null}

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="#insights"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-slate-950/10 transition-all hover:-translate-y-0.5"
                  >
                    Explore insights
                  </Link>
                  <Link
                    href="#documents"
                    className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white/16"
                  >
                    View documents
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                  <div className="min-w-0 rounded-[24px] border border-white/14 bg-white/10 p-4 backdrop-blur">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-white/12">
                      <PieChartIcon className="size-5 text-sky-50" />
                    </div>
                    <p className="mt-4 break-words text-[11px] leading-4 font-semibold uppercase tracking-[0.16em] text-sky-100/70">
                      Household Value
                    </p>
                    <p className="mt-2 break-words text-lg leading-tight font-semibold tracking-tight text-white sm:text-xl">
                      {formatCompactCurrency(displayedAum)}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-[24px] border border-white/14 bg-white/10 p-4 backdrop-blur">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-white/12">
                      <TrendingUpIcon className="size-5 text-sky-50" />
                    </div>
                    <p className="mt-4 break-words text-[11px] leading-4 font-semibold uppercase tracking-[0.16em] text-sky-100/70">
                      Weighted Return
                    </p>
                    <p className="mt-2 break-words text-lg leading-tight font-semibold tracking-tight text-white sm:text-xl">
                      {weightedPerformance >= 0 ? "+" : ""}
                      {weightedPerformance.toFixed(1)}% YTD
                    </p>
                  </div>
                  <div className="min-w-0 rounded-[24px] border border-white/14 bg-white/10 p-4 backdrop-blur">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-white/12">
                      <TargetIcon className="size-5 text-sky-50" />
                    </div>
                    <p className="mt-4 break-words text-[11px] leading-4 font-semibold uppercase tracking-[0.16em] text-sky-100/70">
                      Goal Funding
                    </p>
                    <p className="mt-2 break-words text-lg leading-tight font-semibold tracking-tight text-white sm:text-xl">
                      {goalFundingRatio}%
                    </p>
                  </div>
                  <div className="min-w-0 rounded-[24px] border border-white/14 bg-white/10 p-4 backdrop-blur">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-white/12">
                      <FileTextIcon className="size-5 text-sky-50" />
                    </div>
                    <p className="mt-4 break-words text-[11px] leading-4 font-semibold uppercase tracking-[0.16em] text-sky-100/70">
                      Signed Docs
                    </p>
                    <p className="mt-2 break-words text-lg leading-tight font-semibold tracking-tight text-white sm:text-xl">
                      {signedDocumentRatio}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/14 bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-100/72">
                  Household Concierge
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  {householdName}
                </p>
                <p className="mt-3 text-sm leading-6 text-sky-50/78">{householdNotes}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="border-white/15 bg-white/10 text-white"
                  >
                    {typedHousehold?.segment ?? "Investor"} household
                  </Badge>
                  {typedHousehold?.next_review_date ? (
                    <Badge
                      variant="outline"
                      className="border-white/15 bg-white/10 text-white"
                    >
                      Review {formatDate(typedHousehold.next_review_date)}
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-6 space-y-3 text-sm text-sky-50/82">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3">
                    <MailIcon className="size-4 text-sky-100/72" />
                    <span>{activeClient.email ?? "Not shared"}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3">
                    <PhoneIcon className="size-4 text-sky-100/72" />
                    <span>{activeClient.phone ?? "Not shared"}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3">
                    <MapPinIcon className="size-4 text-sky-100/72" />
                    <span>{activeClient.city ?? "India"}</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/66">
                      Next Review
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {typedHousehold?.next_review_date
                        ? formatDate(typedHousehold.next_review_date)
                        : "TBD"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/66">
                      Next Meeting
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {nextMeeting ? formatDate(nextMeeting.starts_at) : "None booked"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/66">
                      Cash Reserve
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatCompactCurrency(totalCash)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/66">
                      Open Items
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {allOpenTasks.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${portalCardClass} py-0 reveal-delay-1`}>
          <CardContent className="px-6 py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardDescription className="text-slate-500">
                  Investor Snapshot
                </CardDescription>
                <CardTitle className="mt-2 text-2xl tracking-tight text-slate-950">
                  Contact and service details
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className="border-slate-200 bg-slate-50 text-slate-700"
              >
                {typedMembers.length || 1} members
              </Badge>
            </div>

            <div className="mt-6 grid gap-3">
              <div className={insetCardClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Advisor updates
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {typedCommunications.length}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Recent notes shared in the portal
                </p>
              </div>
              <div className={insetCardClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Upcoming meetings
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {allUpcomingMeetings.length}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Reviews and planning sessions scheduled
                </p>
              </div>
              <div className={insetCardClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Goal completion
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {completedGoals}/{typedGoals.length || 0}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Achieved goals across the household plan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="insights" className="reveal-delay-2">
        <ClientPortalInsights
          activityData={activityData}
          allocationData={allocationData}
          goalData={goalChartData}
          openTasks={allOpenTasks.length}
          portfolioData={portfolioChartData}
          signedDocuments={signedDocuments}
          totalAum={displayedAum}
          totalDocuments={typedDocuments.length}
          upcomingMeetings={allUpcomingMeetings.length}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr] reveal-delay-3">
        <Card className={portalCardClass}>
          <CardHeader className="border-b border-slate-200/70">
            <div className="flex items-center gap-2">
              <UsersIcon className="size-4 text-sky-700" />
              <CardTitle className="text-slate-950">Household Overview</CardTitle>
            </div>
            <CardDescription className="text-slate-500">
              Family members, household profile, and planning context.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className={insetCardClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Members
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {typedMembers.length}
                </p>
              </div>
              <div className={insetCardClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Risk Profile
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {typedHousehold?.risk_profile ?? "Balanced"}
                </p>
              </div>
              <div className={insetCardClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Household Status
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {typedHousehold?.status ?? "active"}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.95),rgba(240,249,255,0.86))] p-5">
              <p className="text-lg font-semibold tracking-tight text-slate-950">
                {householdName}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{householdNotes}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {typedHousehold?.risk_profile ? (
                  <Badge variant="outline" className="border-slate-200 bg-white/90 text-slate-700">
                    {typedHousehold.risk_profile}
                  </Badge>
                ) : null}
                {typedHousehold?.next_review_date ? (
                  <Badge variant="outline" className="border-slate-200 bg-white/90 text-slate-700">
                    Next review {formatDate(typedHousehold.next_review_date)}
                  </Badge>
                ) : null}
              </div>
            </div>

            {displayedMembers.length > 0 ? (
              <div className="space-y-3">
                {displayedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 rounded-[24px] border border-slate-200/70 bg-white/92 px-4 py-4 shadow-sm shadow-slate-950/5"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#163654,#1d6fa3)] text-sm font-semibold text-white">
                      {member.first_name[0]}
                      {member.last_name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-950">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {member.email ?? member.phone ?? "Member profile"}
                      </p>
                    </div>
                    <Badge variant="outline" className={pillClass(member.kyc_status)}>
                      {member.kyc_status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                No household members yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={portalCardClass}>
          <CardHeader className="border-b border-slate-200/70">
            <div className="flex items-center gap-2">
              <PieChartIcon className="size-4 text-sky-700" />
              <CardTitle className="text-slate-950">Portfolio Snapshot</CardTitle>
            </div>
            <CardDescription className="text-slate-500">
              Active portfolios, return profile, and top visible holdings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {typedPortfolios.length > 0 ? (
              typedPortfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="rounded-[28px] border border-slate-200/70 bg-white/92 p-5 shadow-sm shadow-slate-950/5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-slate-950">
                        {portfolio.name}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {portfolio.objective ?? "Long-term wealth management mandate"}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xl font-semibold tracking-tight text-slate-950">
                        {formatCompactCurrency(Number(portfolio.total_value))}
                      </p>
                      <p
                        className={`mt-1 text-sm font-medium ${
                          Number(portfolio.performance_ytd) >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {Number(portfolio.performance_ytd) >= 0 ? "+" : ""}
                        {Number(portfolio.performance_ytd).toFixed(1)}% YTD
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50/80 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Accounts
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        {portfolio.accounts.length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50/80 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Holdings
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        {portfolio.holdings.length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50/80 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Liquidity
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">
                        {portfolio.liquidity_ratio
                          ? `${Number(portfolio.liquidity_ratio).toFixed(0)}%`
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#163654,#1d6fa3,#f29f67)]"
                      style={{
                        width: `${Math.min(100, Math.max(0, Number(portfolio.liquidity_ratio ?? 0)))}%`,
                      }}
                    />
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {portfolio.holdings.length > 0 ? (
                      portfolio.holdings.slice(0, 3).map((holding) => (
                        <div
                          key={holding.id}
                          className="rounded-2xl bg-[linear-gradient(135deg,rgba(248,250,252,0.95),rgba(255,247,237,0.9))] px-4 py-3"
                        >
                          <p className="text-sm font-semibold text-slate-950">
                            {holding.symbol}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {holding.security_name}
                          </p>
                          <p className="mt-3 text-sm font-semibold text-slate-950">
                            {formatCompactCurrency(Number(holding.market_value))}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="md:col-span-3 rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
                        No holdings have been loaded for this portfolio yet.
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                No active portfolios yet.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section
        id="documents"
        className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr] reveal-delay-4"
      >
        <Card className={portalCardClass}>
          <CardHeader className="border-b border-slate-200/70">
            <div className="flex items-center gap-2">
              <TargetIcon className="size-4 text-sky-700" />
              <CardTitle className="text-slate-950">Goals & Planning</CardTitle>
            </div>
            <CardDescription className="text-slate-500">
              Funding progress across your long-term household goals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className={insetCardClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Completed Goals
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {completedGoals}/{typedGoals.length}
                </p>
              </div>
              <div className={insetCardClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Total Funded
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {formatCompactCurrency(goalFundingAmount)}
                </p>
              </div>
            </div>

            {typedGoals.length > 0 ? (
              typedGoals.map((goal) => {
                const progress = goalProgress(goal)

                return (
                  <div
                    key={goal.id}
                    className="rounded-[28px] border border-slate-200/70 bg-white/92 p-5 shadow-sm shadow-slate-950/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold tracking-tight text-slate-950">
                          {goal.title}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Target {formatCompactCurrency(Number(goal.target_amount))} by{" "}
                          {formatDate(goal.target_date)}
                        </p>
                      </div>
                      <Badge variant="outline" className={pillClass(goal.status)}>
                        {goal.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#163654,#4f8f79,#f29f67)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-500">
                        {formatCompactCurrency(Number(goal.current_amount))} funded
                      </span>
                      <span className="font-medium text-slate-950">
                        {progress}% complete
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                No household goals yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={portalCardClass}>
          <CardHeader className="border-b border-slate-200/70">
            <div className="flex items-center gap-2">
              <FileTextIcon className="size-4 text-sky-700" />
              <CardTitle className="text-slate-950">Documents</CardTitle>
            </div>
            <CardDescription className="text-slate-500">
              Shared files, KYC records, and planning documents in one feed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className={insetCardClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Signed Files
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {signedDocuments}/{typedDocuments.length}
                </p>
              </div>
              <div className={insetCardClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Latest Upload
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  {typedDocuments[0] ? formatDate(typedDocuments[0].uploaded_at) : "—"}
                </p>
              </div>
            </div>

            {typedDocuments.length > 0 ? (
              typedDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-4 rounded-[26px] border border-slate-200/70 bg-white/92 px-5 py-4 shadow-sm shadow-slate-950/5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-950">{document.title}</p>
                      <Badge
                        variant="outline"
                        className={
                          document.signed
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }
                      >
                        {document.signed ? "Signed" : "Pending"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {document.document_type} · {document.version_label} · Updated{" "}
                      {formatDate(document.updated_at)}
                    </p>
                  </div>

                  {document.download_url ? (
                    <Link
                      href={document.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-slate-900"
                    >
                      Open document
                      <ExternalLinkIcon className="size-4" />
                    </Link>
                  ) : (
                    <span className="text-sm text-slate-400">
                      Available in portal preview
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                No shared documents yet.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <Card className={portalCardClass}>
            <CardHeader className="border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-sky-700" />
                <CardTitle className="text-slate-950">Upcoming Meetings</CardTitle>
              </div>
              <CardDescription className="text-slate-500">
                Reviews, proposal calls, and planning check-ins.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {upcomingMeetings.length > 0 ? (
                upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="rounded-[26px] border border-slate-200/70 bg-white/92 p-5 shadow-sm shadow-slate-950/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-950">{meeting.subject}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {meeting.location ?? "Virtual"}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                        {meeting.meeting_type}
                      </Badge>
                    </div>
                    <p className="mt-4 text-sm text-slate-600">
                      {formatDateTime(meeting.starts_at)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                  No upcoming meetings.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={portalCardClass}>
            <CardHeader className="border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <Clock3Icon className="size-4 text-sky-700" />
                <CardTitle className="text-slate-950">Open Requests</CardTitle>
              </div>
              <CardDescription className="text-slate-500">
                Items currently in progress for your household.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {openTasks.length > 0 ? (
                openTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-[26px] border border-slate-200/70 bg-white/92 p-5 shadow-sm shadow-slate-950/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-950">{task.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {task.description ?? "In progress in your advisor workspace."}
                        </p>
                      </div>
                      <Badge variant="outline" className={pillClass(task.status)}>
                        {task.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <span>Due {formatDate(task.due_at)}</span>
                      {task.category ? <span>• {task.category}</span> : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                  No open requests.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={portalCardClass}>
            <CardHeader className="border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="size-4 text-sky-700" />
                <CardTitle className="text-slate-950">Service Status</CardTitle>
              </div>
              <CardDescription className="text-slate-500">
                A quick view of readiness across the relationship.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-sm text-slate-600">
              <div className={insetCardClass}>
                <div className="flex items-center justify-between gap-3">
                  <span>KYC verification</span>
                  <Badge variant="outline" className={pillClass(activeClient.kyc_status)}>
                    {activeClient.kyc_status}
                  </Badge>
                </div>
              </div>
              <div className={insetCardClass}>
                <div className="flex items-center justify-between gap-3">
                  <span>Document completion</span>
                  <span className="font-medium text-slate-950">{signedDocumentRatio}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#163654,#1d6fa3,#f29f67)]"
                    style={{ width: `${signedDocumentRatio}%` }}
                  />
                </div>
              </div>
              <div className={insetCardClass}>
                <div className="flex items-center justify-between gap-3">
                  <span>Goal funding</span>
                  <span className="font-medium text-slate-950">{goalFundingRatio}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#163654,#4f8f79,#f29f67)]"
                    style={{ width: `${goalFundingRatio}%` }}
                  />
                </div>
              </div>
              <div className={insetCardClass}>
                <div className="flex items-center justify-between gap-3">
                  <span>Next portfolio review</span>
                  <span className="font-medium text-slate-950">
                    {typedHousehold?.next_review_date
                      ? formatDate(typedHousehold.next_review_date)
                      : "TBD"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className={portalCardClass}>
          <CardHeader className="border-b border-slate-200/70">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="size-4 text-sky-700" />
              <CardTitle className="text-slate-950">Recent Advisor Updates</CardTitle>
            </div>
            <CardDescription className="text-slate-500">
              Latest communication notes from your advisory team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {typedCommunications.length > 0 ? (
              typedCommunications.map((communication) => (
                <div
                  key={communication.id}
                  className="rounded-[28px] border border-slate-200/70 bg-white/92 p-5 shadow-sm shadow-slate-950/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">
                      {communication.subject ?? "Advisor update"}
                    </p>
                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                      {communication.channel}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {communication.summary}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                    <CheckCircle2Icon className="size-3.5" />
                    Logged {formatDateTime(communication.logged_at)}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                No recent advisor updates.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
