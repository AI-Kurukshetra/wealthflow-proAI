/**
 * WealthFlow Pro - Database Setup Script
 *
 * This script:
 * 1. Creates a test advisor user via Supabase Auth Admin API
 * 2. Seeds the database with demo data via REST API
 *
 * Prerequisites: Run the migration SQL first in Supabase SQL Editor
 * (supabase/migrations/202603141200_init_wealthflow.sql)
 *
 * Usage: npx tsx scripts/setup.ts
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY in environment")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TEST_EMAIL = "advisor@wealthflowpro.in"
const TEST_PASSWORD = "WealthFlow2026!"

async function main() {
  console.log("🔧 WealthFlow Pro - Database Setup\n")

  // Step 1: Create test user
  console.log("1. Creating test advisor user...")

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find(u => u.email === TEST_EMAIL)

  let userId: string

  if (existingUser) {
    console.log(`   User ${TEST_EMAIL} already exists.`)
    userId = existingUser.id
  } else {
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Aditi Sharma" },
    })

    if (userError) {
      console.error("   Failed to create user:", userError.message)
      process.exit(1)
    }

    userId = newUser.user.id
    console.log(`   Created user: ${TEST_EMAIL} (${userId})`)
  }

  // Step 2: Ensure profile exists
  console.log("\n2. Setting up profile...")
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email: TEST_EMAIL,
      full_name: "Aditi Sharma",
      role: "admin",
      organization_name: "WealthFlow Advisory",
      phone: "+91 98765 00001",
      city: "Mumbai",
    }, { onConflict: "id" })

  if (profileError) {
    console.error("   Profile error:", profileError.message)
    // Don't exit - the trigger might have created it
  } else {
    console.log("   Profile ready.")
  }

  // Step 3: Seed households
  console.log("\n3. Seeding households...")
  const households = [
    { id: "a1000000-0000-0000-0000-000000000001", name: "Patel Family Office", segment: "UHNI", advisor_id: userId, total_aum: 92000000, risk_profile: "Balanced Growth", status: "active", next_review_date: "2026-03-28", notes: "Multi-generational family office based in Ahmedabad" },
    { id: "a1000000-0000-0000-0000-000000000002", name: "Iyer Legacy Trust", segment: "UHNI", advisor_id: userId, total_aum: 118000000, risk_profile: "Capital Preservation", status: "active", next_review_date: "2026-04-05", notes: "Trust established for succession planning" },
    { id: "a1000000-0000-0000-0000-000000000003", name: "Mehta Entrepreneurs", segment: "HNI", advisor_id: userId, total_aum: 54000000, risk_profile: "Aggressive Growth", status: "active", next_review_date: "2026-03-22", notes: "First-generation entrepreneurs diversifying" },
    { id: "a1000000-0000-0000-0000-000000000004", name: "Khandelwal Advisory Desk", segment: "Advisory", advisor_id: userId, total_aum: 62000000, risk_profile: "Income Focused", status: "active", next_review_date: "2026-04-10", notes: "Advisory branch operations in Pune" },
    { id: "a1000000-0000-0000-0000-000000000005", name: "Sharma Retirement Fund", segment: "HNI", advisor_id: userId, total_aum: 38000000, risk_profile: "Conservative", status: "active", next_review_date: "2026-04-15", notes: "Retirement planning for senior executives" },
  ]

  const { error: hhError } = await supabase.from("households").upsert(households, { onConflict: "id" })
  console.log(hhError ? `   Error: ${hhError.message}` : `   ${households.length} households seeded.`)

  // Step 4: Seed clients
  console.log("\n4. Seeding clients...")
  const clients = [
    { id: "b1000000-0000-0000-0000-000000000001", household_id: "a1000000-0000-0000-0000-000000000001", owner_id: userId, first_name: "Rajesh", last_name: "Patel", email: "rajesh.patel@example.com", phone: "+91 98765 43210", city: "Ahmedabad", onboarding_stage: "active", kyc_status: "verified", pan_number: "ABCPD1234E" },
    { id: "b1000000-0000-0000-0000-000000000002", household_id: "a1000000-0000-0000-0000-000000000001", owner_id: userId, first_name: "Meena", last_name: "Patel", email: "meena.patel@example.com", phone: "+91 98765 43211", city: "Ahmedabad", onboarding_stage: "active", kyc_status: "verified", pan_number: "ABCPD1235F" },
    { id: "b1000000-0000-0000-0000-000000000003", household_id: "a1000000-0000-0000-0000-000000000002", owner_id: userId, first_name: "Venkatesh", last_name: "Iyer", email: "v.iyer@example.com", phone: "+91 98765 43212", city: "Chennai", onboarding_stage: "active", kyc_status: "verified", pan_number: "EFGHI2345J" },
    { id: "b1000000-0000-0000-0000-000000000004", household_id: "a1000000-0000-0000-0000-000000000002", owner_id: userId, first_name: "Lakshmi", last_name: "Iyer", email: "l.iyer@example.com", phone: "+91 98765 43213", city: "Chennai", onboarding_stage: "active", kyc_status: "pending", pan_number: "EFGHI2346K" },
    { id: "b1000000-0000-0000-0000-000000000005", household_id: "a1000000-0000-0000-0000-000000000003", owner_id: userId, first_name: "Anil", last_name: "Mehta", email: "anil.mehta@example.com", phone: "+91 98765 43214", city: "Mumbai", onboarding_stage: "active", kyc_status: "verified", pan_number: "KLMNO3456P" },
    { id: "b1000000-0000-0000-0000-000000000006", household_id: "a1000000-0000-0000-0000-000000000004", owner_id: userId, first_name: "Priya", last_name: "Khandelwal", email: "priya.k@example.com", phone: "+91 98765 43215", city: "Pune", onboarding_stage: "prospect", kyc_status: "pending", pan_number: "PQRST4567U" },
    { id: "b1000000-0000-0000-0000-000000000007", household_id: "a1000000-0000-0000-0000-000000000005", owner_id: userId, first_name: "Deepak", last_name: "Sharma", email: "deepak.sharma@example.com", phone: "+91 98765 43216", city: "Delhi", onboarding_stage: "active", kyc_status: "verified", pan_number: "UVWXY5678Z" },
    { id: "b1000000-0000-0000-0000-000000000008", household_id: "a1000000-0000-0000-0000-000000000005", owner_id: userId, first_name: "Sunita", last_name: "Sharma", email: "sunita.sharma@example.com", phone: "+91 98765 43217", city: "Delhi", onboarding_stage: "active", kyc_status: "expired", pan_number: "UVWXY5679A" },
  ]

  const { error: clError } = await supabase.from("clients").upsert(clients, { onConflict: "id" })
  console.log(clError ? `   Error: ${clError.message}` : `   ${clients.length} clients seeded.`)

  // Step 5: Seed portfolios
  console.log("\n5. Seeding portfolios...")
  const portfolios = [
    { id: "c1000000-0000-0000-0000-000000000001", household_id: "a1000000-0000-0000-0000-000000000001", name: "Patel Growth Portfolio", objective: "Long-term capital appreciation", benchmark: "Nifty 50", total_value: 58000000, performance_ytd: 14.2 },
    { id: "c1000000-0000-0000-0000-000000000002", household_id: "a1000000-0000-0000-0000-000000000001", name: "Patel Fixed Income", objective: "Stable income generation", benchmark: "CRISIL Composite Bond", total_value: 34000000, performance_ytd: 8.5 },
    { id: "c1000000-0000-0000-0000-000000000003", household_id: "a1000000-0000-0000-0000-000000000002", name: "Iyer Preservation Fund", objective: "Capital preservation with modest growth", benchmark: "Nifty 100", total_value: 118000000, performance_ytd: 6.8 },
    { id: "c1000000-0000-0000-0000-000000000004", household_id: "a1000000-0000-0000-0000-000000000003", name: "Mehta High Growth", objective: "Aggressive capital growth", benchmark: "Nifty Midcap 150", total_value: 54000000, performance_ytd: 22.5 },
    { id: "c1000000-0000-0000-0000-000000000005", household_id: "a1000000-0000-0000-0000-000000000004", name: "Khandelwal Income", objective: "Regular income with capital safety", benchmark: "CRISIL Short Term Bond", total_value: 62000000, performance_ytd: 9.2 },
    { id: "c1000000-0000-0000-0000-000000000006", household_id: "a1000000-0000-0000-0000-000000000005", name: "Sharma Retirement", objective: "Retirement corpus building", benchmark: "Nifty 50", total_value: 38000000, performance_ytd: 11.4 },
  ]

  const { error: pfError } = await supabase.from("portfolios").upsert(portfolios, { onConflict: "id" })
  console.log(pfError ? `   Error: ${pfError.message}` : `   ${portfolios.length} portfolios seeded.`)

  // Step 6: Seed holdings
  console.log("\n6. Seeding holdings...")
  const holdings = [
    { portfolio_id: "c1000000-0000-0000-0000-000000000001", symbol: "RELIANCE", security_name: "Reliance Industries Ltd", asset_class: "Large Cap Equity", units: 2000, average_cost: 2400, market_price: 2680, market_value: 5360000, weight: 9.24 },
    { portfolio_id: "c1000000-0000-0000-0000-000000000001", symbol: "TCS", security_name: "Tata Consultancy Services", asset_class: "Large Cap Equity", units: 1500, average_cost: 3200, market_price: 3850, market_value: 5775000, weight: 9.96 },
    { portfolio_id: "c1000000-0000-0000-0000-000000000001", symbol: "HDFCBANK", security_name: "HDFC Bank Ltd", asset_class: "Large Cap Equity", units: 3000, average_cost: 1500, market_price: 1720, market_value: 5160000, weight: 8.90 },
    { portfolio_id: "c1000000-0000-0000-0000-000000000001", symbol: "INFY", security_name: "Infosys Ltd", asset_class: "Large Cap Equity", units: 2500, average_cost: 1400, market_price: 1580, market_value: 3950000, weight: 6.81 },
    { portfolio_id: "c1000000-0000-0000-0000-000000000002", symbol: "HDFCSTBF", security_name: "HDFC Short Term Debt Fund", asset_class: "Debt Mutual Fund", units: 100000, average_cost: 28, market_price: 31.2, market_value: 3120000, weight: 9.18 },
    { portfolio_id: "c1000000-0000-0000-0000-000000000002", symbol: "ICICILAF", security_name: "ICICI Pru Long Term Bond", asset_class: "Debt Mutual Fund", units: 80000, average_cost: 35, market_price: 38.5, market_value: 3080000, weight: 9.06 },
    { portfolio_id: "c1000000-0000-0000-0000-000000000003", symbol: "NIFTYBEES", security_name: "Nippon Nifty 50 ETF", asset_class: "Index ETF", units: 200000, average_cost: 240, market_price: 268, market_value: 53600000, weight: 45.42 },
    { portfolio_id: "c1000000-0000-0000-0000-000000000003", symbol: "GOLDBEES", security_name: "Nippon Gold ETF", asset_class: "Gold", units: 10000, average_cost: 48, market_price: 55.2, market_value: 552000, weight: 0.47 },
    { portfolio_id: "c1000000-0000-0000-0000-000000000004", symbol: "TATAMOTORS", security_name: "Tata Motors Ltd", asset_class: "Mid Cap Equity", units: 5000, average_cost: 620, market_price: 780, market_value: 3900000, weight: 7.22 },
    { portfolio_id: "c1000000-0000-0000-0000-000000000004", symbol: "BAJFINANCE", security_name: "Bajaj Finance Ltd", asset_class: "Large Cap Equity", units: 800, average_cost: 6500, market_price: 7200, market_value: 5760000, weight: 10.67 },
    { portfolio_id: "c1000000-0000-0000-0000-000000000005", symbol: "SBILIQUID", security_name: "SBI Liquid Fund", asset_class: "Liquid Fund", units: 150000, average_cost: 38, market_price: 40.5, market_value: 6075000, weight: 9.80 },
    { portfolio_id: "c1000000-0000-0000-0000-000000000006", symbol: "PPFAS", security_name: "PPFAS Flexi Cap Fund", asset_class: "Flexi Cap MF", units: 60000, average_cost: 52, market_price: 64, market_value: 3840000, weight: 10.11 },
  ]

  // Delete existing holdings first to avoid duplicates (no id-based upsert)
  for (const pId of ["c1000000-0000-0000-0000-000000000001", "c1000000-0000-0000-0000-000000000002", "c1000000-0000-0000-0000-000000000003", "c1000000-0000-0000-0000-000000000004", "c1000000-0000-0000-0000-000000000005", "c1000000-0000-0000-0000-000000000006"]) {
    await supabase.from("holdings").delete().eq("portfolio_id", pId)
  }
  const { error: hlError } = await supabase.from("holdings").insert(holdings)
  console.log(hlError ? `   Error: ${hlError.message}` : `   ${holdings.length} holdings seeded.`)

  // Step 7: Seed tasks
  console.log("\n7. Seeding tasks...")
  await supabase.from("tasks").delete().eq("owner_id", userId)
  const now = new Date()
  const tasks = [
    { household_id: "a1000000-0000-0000-0000-000000000001", owner_id: userId, title: "Complete KYC refresh for Patel Family Office", description: "Annual KYC documents need to be collected and verified", status: "todo", priority: "high", due_at: new Date(now.getTime() + 86400000).toISOString(), category: "compliance" },
    { household_id: "a1000000-0000-0000-0000-000000000002", owner_id: userId, title: "Prepare proposal pack for Iyer Legacy Trust", description: "Include succession planning options and alternative investment proposals", status: "todo", priority: "high", due_at: new Date(now.getTime() + 3 * 86400000).toISOString(), category: "advisory" },
    { household_id: "a1000000-0000-0000-0000-000000000003", owner_id: userId, title: "Schedule quarterly review for Mehta Entrepreneurs", description: "Review portfolio performance and discuss new opportunities", status: "todo", priority: "medium", due_at: new Date(now.getTime() + 5 * 86400000).toISOString(), category: "review" },
    { household_id: "a1000000-0000-0000-0000-000000000004", owner_id: userId, title: "Upload signed mandate for Khandelwal Advisory", description: "Signed advisory mandate needs to be uploaded to document vault", status: "in_progress", priority: "medium", due_at: new Date(now.getTime() + 4 * 86400000).toISOString(), category: "documentation" },
    { household_id: "a1000000-0000-0000-0000-000000000005", owner_id: userId, title: "Review retirement corpus projection for Sharma", description: "Update the retirement calculator with latest salary and expense data", status: "todo", priority: "medium", due_at: new Date(now.getTime() + 7 * 86400000).toISOString(), category: "planning" },
    { household_id: null, owner_id: userId, title: "Update market commentary for Q1 2026", description: "Prepare quarterly market commentary for client newsletter", status: "todo", priority: "low", due_at: new Date(now.getTime() + 10 * 86400000).toISOString(), category: "marketing" },
    { household_id: "a1000000-0000-0000-0000-000000000001", owner_id: userId, title: "File SEBI disclosure for Patel advisory fees", description: "Annual fee disclosure to be filed with regulator", status: "blocked", priority: "high", due_at: new Date(now.getTime() + 2 * 86400000).toISOString(), category: "compliance" },
  ]

  const { error: tkError } = await supabase.from("tasks").insert(tasks)
  console.log(tkError ? `   Error: ${tkError.message}` : `   ${tasks.length} tasks seeded.`)

  // Step 8: Seed compliance records
  console.log("\n8. Seeding compliance records...")
  await supabase.from("compliance_records").delete().eq("owner_id", userId)
  const complianceRecords = [
    { household_id: "a1000000-0000-0000-0000-000000000001", owner_id: userId, record_type: "SEBI Suitability Questionnaire", status: "pending", due_at: new Date(now.getTime() + 5 * 86400000).toISOString().split("T")[0], finding: "Patel Family Office has an expiring risk profile assessment" },
    { household_id: "a1000000-0000-0000-0000-000000000002", owner_id: userId, record_type: "KYC Document Review", status: "in_review", due_at: new Date(now.getTime() + 10 * 86400000).toISOString().split("T")[0], finding: "Lakshmi Iyer KYC documents need re-verification" },
    { household_id: "a1000000-0000-0000-0000-000000000004", owner_id: userId, record_type: "Document Retention Audit", status: "pending", due_at: new Date(now.getTime() + 7 * 86400000).toISOString().split("T")[0], finding: "4 files in advisory workspace missing classification tags" },
    { household_id: "a1000000-0000-0000-0000-000000000003", owner_id: userId, record_type: "Fee Disclosure Confirmation", status: "approved", due_at: new Date(now.getTime() + 15 * 86400000).toISOString().split("T")[0], finding: "Annual fee disclosure completed and acknowledged by client" },
    { household_id: "a1000000-0000-0000-0000-000000000005", owner_id: userId, record_type: "Annual Risk Assessment", status: "pending", due_at: new Date(now.getTime() + 20 * 86400000).toISOString().split("T")[0], finding: "Sharma retirement fund risk assessment needs updating" },
    { household_id: "a1000000-0000-0000-0000-000000000001", owner_id: userId, record_type: "Anti-Money Laundering Check", status: "approved", due_at: new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0], finding: "AML screening completed successfully", completed_at: new Date(now.getTime() - 35 * 86400000).toISOString().split("T")[0] },
    { household_id: "a1000000-0000-0000-0000-000000000002", owner_id: userId, record_type: "Investment Suitability Review", status: "flagged", due_at: new Date(now.getTime() + 3 * 86400000).toISOString().split("T")[0], finding: "Portfolio concentration exceeds 40% in single sector" },
  ]

  const { error: crError } = await supabase.from("compliance_records").insert(complianceRecords)
  console.log(crError ? `   Error: ${crError.message}` : `   ${complianceRecords.length} compliance records seeded.`)

  // Step 9: Seed opportunities
  console.log("\n9. Seeding opportunities...")
  await supabase.from("opportunities").delete().eq("owner_id", userId)
  const opportunities = [
    { household_id: null, owner_id: userId, title: "Nexus Family Wealth Mandate", stage: "qualifying", expected_value: 32000000, probability: 35, target_close_date: "2026-03-29", notes: "Prospect from Bengaluru referral network" },
    { household_id: null, owner_id: userId, title: "Pune Medical Partners Advisory", stage: "qualifying", expected_value: 27000000, probability: 30, target_close_date: "2026-04-02", notes: "Founders looking for succession planning" },
    { household_id: "a1000000-0000-0000-0000-000000000002", owner_id: userId, title: "Iyer Legacy Expansion", stage: "proposal", expected_value: 41000000, probability: 62, target_close_date: "2026-03-21", notes: "Alternative investments mandate add-on" },
    { household_id: "a1000000-0000-0000-0000-000000000004", owner_id: userId, title: "Khandelwal Compliance Retainer", stage: "proposal", expected_value: 16000000, probability: 55, target_close_date: "2026-03-25", notes: "Operations package for advisory branch rollout" },
    { household_id: "a1000000-0000-0000-0000-000000000001", owner_id: userId, title: "Patel Offshore Allocation", stage: "diligence", expected_value: 58000000, probability: 74, target_close_date: "2026-03-19", notes: "New family office portfolio sleeve" },
    { household_id: "a1000000-0000-0000-0000-000000000003", owner_id: userId, title: "Mehta Liquidity Mandate", stage: "commitment", expected_value: 24000000, probability: 88, target_close_date: "2026-03-15", notes: "Treasury and debt allocation refresh" },
  ]

  const { error: opError } = await supabase.from("opportunities").insert(opportunities)
  console.log(opError ? `   Error: ${opError.message}` : `   ${opportunities.length} opportunities seeded.`)

  // Step 10: Seed goals
  console.log("\n10. Seeding goals...")
  const goals = [
    { household_id: "a1000000-0000-0000-0000-000000000001", title: "Education Fund for Grandchildren", target_amount: 50000000, current_amount: 32000000, target_date: "2030-06-01", priority: "high", status: "on_track" },
    { household_id: "a1000000-0000-0000-0000-000000000002", title: "Charitable Trust Corpus", target_amount: 100000000, current_amount: 78000000, target_date: "2028-12-31", priority: "medium", status: "on_track" },
    { household_id: "a1000000-0000-0000-0000-000000000003", title: "Business Expansion Fund", target_amount: 80000000, current_amount: 42000000, target_date: "2027-12-31", priority: "high", status: "at_risk" },
    { household_id: "a1000000-0000-0000-0000-000000000005", title: "Retirement Corpus", target_amount: 60000000, current_amount: 38000000, target_date: "2032-03-31", priority: "high", status: "on_track" },
    { household_id: "a1000000-0000-0000-0000-000000000004", title: "Office Acquisition Fund", target_amount: 30000000, current_amount: 18000000, target_date: "2027-06-30", priority: "medium", status: "on_track" },
  ]

  // Delete existing goals for these households first
  for (const hhId of ["a1000000-0000-0000-0000-000000000001", "a1000000-0000-0000-0000-000000000002", "a1000000-0000-0000-0000-000000000003", "a1000000-0000-0000-0000-000000000004", "a1000000-0000-0000-0000-000000000005"]) {
    await supabase.from("goals").delete().eq("household_id", hhId)
  }
  const { error: glError } = await supabase.from("goals").insert(goals)
  console.log(glError ? `   Error: ${glError.message}` : `   ${goals.length} goals seeded.`)

  // Step 11: Seed fee schedules
  console.log("\n11. Seeding fee schedules...")
  for (const hhId of ["a1000000-0000-0000-0000-000000000001", "a1000000-0000-0000-0000-000000000002", "a1000000-0000-0000-0000-000000000003", "a1000000-0000-0000-0000-000000000004", "a1000000-0000-0000-0000-000000000005"]) {
    await supabase.from("fee_schedules").delete().eq("household_id", hhId)
  }
  const feeSchedules = [
    { household_id: "a1000000-0000-0000-0000-000000000001", billing_frequency: "quarterly", advisory_fee_bps: 75, last_invoice_date: "2025-12-31", next_invoice_date: "2026-03-31", collection_status: "pending" },
    { household_id: "a1000000-0000-0000-0000-000000000002", billing_frequency: "quarterly", advisory_fee_bps: 50, last_invoice_date: "2025-12-31", next_invoice_date: "2026-03-31", collection_status: "pending" },
    { household_id: "a1000000-0000-0000-0000-000000000003", billing_frequency: "monthly", advisory_fee_bps: 100, last_invoice_date: "2026-02-28", next_invoice_date: "2026-03-31", collection_status: "collected" },
    { household_id: "a1000000-0000-0000-0000-000000000004", billing_frequency: "quarterly", advisory_fee_bps: 65, last_invoice_date: "2025-12-31", next_invoice_date: "2026-03-31", collection_status: "overdue" },
    { household_id: "a1000000-0000-0000-0000-000000000005", billing_frequency: "annually", advisory_fee_bps: 60, last_invoice_date: "2025-03-31", next_invoice_date: "2026-03-31", collection_status: "pending" },
  ]

  const { error: fsError } = await supabase.from("fee_schedules").insert(feeSchedules)
  console.log(fsError ? `   Error: ${fsError.message}` : `   ${feeSchedules.length} fee schedules seeded.`)

  // Done!
  console.log("\n✅ Setup complete!\n")
  console.log("Login credentials:")
  console.log(`   Email:    ${TEST_EMAIL}`)
  console.log(`   Password: ${TEST_PASSWORD}`)
  console.log(`\n   Open http://localhost:3000/sign-in to get started.\n`)
}

main().catch(console.error)
