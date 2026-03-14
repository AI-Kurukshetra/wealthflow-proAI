export type AppRole = "admin" | "advisor" | "ops" | "compliance"
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done"
export type OpportunityStage = "qualifying" | "proposal" | "diligence" | "commitment" | "won" | "lost"
export type CommunicationChannel = "email" | "phone" | "whatsapp" | "meeting" | "sms"
export type ComplianceStatus = "pending" | "in_review" | "approved" | "flagged" | "closed"

/* ── Profiles ── */
export type Profile = {
  id: string
  email: string | null
  full_name: string
  role: AppRole
  organization_name: string | null
  phone: string | null
  city: string | null
  created_at: string
  updated_at: string
}
export type ProfileInsert = Omit<Profile, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string }
export type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at">>

/* ── Households ── */
export type Household = {
  id: string
  name: string
  segment: string
  advisor_id: string | null
  total_aum: number
  risk_profile: string | null
  status: string
  next_review_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
export type HouseholdInsert = Omit<Household, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
export type HouseholdUpdate = Partial<Omit<Household, "id" | "created_at">>

/* ── Clients ── */
export type Client = {
  id: string
  household_id: string
  owner_id: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  city: string | null
  onboarding_stage: string
  kyc_status: string
  date_of_birth: string | null
  pan_number: string | null
  created_at: string
  updated_at: string
}
export type ClientInsert = Omit<Client, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
export type ClientUpdate = Partial<Omit<Client, "id" | "created_at">>

/* ── Portfolios ── */
export type Portfolio = {
  id: string
  household_id: string
  name: string
  base_currency: string
  objective: string | null
  benchmark: string | null
  total_value: number
  performance_ytd: number
  liquidity_ratio: number | null
  created_at: string
  updated_at: string
}
export type PortfolioInsert = Omit<Portfolio, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
export type PortfolioUpdate = Partial<Omit<Portfolio, "id" | "created_at">>

/* ── Accounts ── */
export type Account = {
  id: string
  portfolio_id: string
  account_number: string
  custodian: string
  account_type: string
  cash_balance: number
  created_at: string
  updated_at: string
}
export type AccountInsert = Omit<Account, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
export type AccountUpdate = Partial<Omit<Account, "id" | "created_at">>

/* ── Holdings ── */
export type Holding = {
  id: string
  portfolio_id: string
  symbol: string
  security_name: string
  asset_class: string
  units: number
  average_cost: number
  market_price: number
  market_value: number
  weight: number | null
  last_priced_at: string | null
  created_at: string
  updated_at: string
}
export type HoldingInsert = Omit<Holding, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
export type HoldingUpdate = Partial<Omit<Holding, "id" | "created_at">>

/* ── Transactions ── */
export type Transaction = {
  id: string
  account_id: string | null
  portfolio_id: string
  transaction_type: string
  symbol: string | null
  quantity: number
  price: number
  gross_amount: number
  fees: number
  traded_at: string
  settlement_at: string | null
  source: string | null
  created_at: string
}
export type TransactionInsert = Omit<Transaction, "id" | "created_at"> & { id?: string; created_at?: string }

/* ── Goals ── */
export type Goal = {
  id: string
  household_id: string
  title: string
  target_amount: number
  current_amount: number
  target_date: string | null
  priority: string
  status: string
  created_at: string
  updated_at: string
}
export type GoalInsert = Omit<Goal, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
export type GoalUpdate = Partial<Omit<Goal, "id" | "created_at">>

/* ── Tasks ── */
export type Task = {
  id: string
  household_id: string | null
  client_id: string | null
  owner_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: string
  due_at: string | null
  category: string | null
  created_at: string
  updated_at: string
}
export type TaskInsert = Omit<Task, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
export type TaskUpdate = Partial<Omit<Task, "id" | "created_at">>

/* ── Meetings ── */
export type Meeting = {
  id: string
  household_id: string | null
  owner_id: string | null
  subject: string
  meeting_type: string
  location: string | null
  notes: string | null
  starts_at: string
  ends_at: string | null
  created_at: string
  updated_at: string
}
export type MeetingInsert = Omit<Meeting, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
export type MeetingUpdate = Partial<Omit<Meeting, "id" | "created_at">>

/* ── Documents ── */
export type Document = {
  id: string
  household_id: string | null
  client_id: string | null
  uploaded_by: string | null
  title: string
  document_type: string
  classification: string | null
  storage_path: string | null
  version_label: string
  signed: boolean
  uploaded_at: string
  updated_at: string
}
export type DocumentInsert = Omit<Document, "id" | "uploaded_at" | "updated_at"> & { id?: string; uploaded_at?: string; updated_at?: string }
export type DocumentUpdate = Partial<Omit<Document, "id" | "uploaded_at">>

/* ── Communication Logs ── */
export type CommunicationLog = {
  id: string
  household_id: string | null
  client_id: string | null
  owner_id: string | null
  channel: CommunicationChannel
  subject: string | null
  summary: string
  logged_at: string
}
export type CommunicationLogInsert = Omit<CommunicationLog, "id" | "logged_at"> & { id?: string; logged_at?: string }

/* ── Leads ── */
export type Lead = {
  id: string
  owner_id: string | null
  company_name: string | null
  contact_name: string
  email: string | null
  phone: string | null
  source: string | null
  status: string
  score: number
  created_at: string
  updated_at: string
}
export type LeadInsert = Omit<Lead, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
export type LeadUpdate = Partial<Omit<Lead, "id" | "created_at">>

/* ── Opportunities ── */
export type Opportunity = {
  id: string
  household_id: string | null
  lead_id: string | null
  owner_id: string | null
  title: string
  stage: OpportunityStage
  expected_value: number
  probability: number
  target_close_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
export type OpportunityInsert = Omit<Opportunity, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
export type OpportunityUpdate = Partial<Omit<Opportunity, "id" | "created_at">>

/* ── Compliance Records ── */
export type ComplianceRecord = {
  id: string
  household_id: string | null
  owner_id: string | null
  record_type: string
  status: ComplianceStatus
  due_at: string | null
  completed_at: string | null
  finding: string | null
  created_at: string
  updated_at: string
}
export type ComplianceRecordInsert = Omit<ComplianceRecord, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
export type ComplianceRecordUpdate = Partial<Omit<ComplianceRecord, "id" | "created_at">>

/* ── Fee Schedules ── */
export type FeeSchedule = {
  id: string
  household_id: string
  billing_frequency: string
  advisory_fee_bps: number
  last_invoice_date: string | null
  next_invoice_date: string | null
  collection_status: string
  created_at: string
  updated_at: string
}
export type FeeScheduleInsert = Omit<FeeSchedule, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }
export type FeeScheduleUpdate = Partial<Omit<FeeSchedule, "id" | "created_at">>
