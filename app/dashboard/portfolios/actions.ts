"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"

type WealthFlowClient = Awaited<ReturnType<typeof createClient>>

function revalidatePortfolioPaths() {
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/households")
  revalidatePath("/dashboard/portfolios")
  revalidatePath("/dashboard/reports")
}

function cashImpactForTransaction(transactionType: string, grossAmount: number, fees: number) {
  switch (transactionType) {
    case "buy":
    case "withdrawal":
      return -(grossAmount + fees)
    case "sell":
    case "dividend":
    case "deposit":
    case "interest":
      return grossAmount - fees
    case "fee":
      return -grossAmount
    default:
      return 0
  }
}

async function adjustAccountCashBalance(
  supabase: WealthFlowClient,
  accountId: string,
  delta: number,
) {
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("cash_balance")
    .eq("id", accountId)
    .maybeSingle()

  if (accountError) return accountError

  const nextBalance = Number(account?.cash_balance ?? 0) + delta

  const { error: updateError } = await supabase
    .from("accounts")
    .update({ cash_balance: nextBalance })
    .eq("id", accountId)

  return updateError ?? null
}

async function syncHouseholdAum(supabase: WealthFlowClient, householdId: string) {
  const { data: portfolios, error: portfolioError } = await supabase
    .from("portfolios")
    .select("total_value")
    .eq("household_id", householdId)

  if (portfolioError) return portfolioError

  const totalAum = (portfolios ?? []).reduce(
    (sum, portfolio) => sum + Number(portfolio.total_value),
    0,
  )

  const { error: updateError } = await supabase
    .from("households")
    .update({ total_aum: totalAum })
    .eq("id", householdId)

  return updateError ?? null
}

async function syncPortfolioTotals(supabase: WealthFlowClient, portfolioId: string) {
  const [
    { data: portfolio, error: portfolioError },
    { data: holdings, error: holdingsError },
    { data: accounts, error: accountsError },
  ] = await Promise.all([
    supabase
      .from("portfolios")
      .select("household_id")
      .eq("id", portfolioId)
      .maybeSingle(),
    supabase.from("holdings").select("market_value").eq("portfolio_id", portfolioId),
    supabase.from("accounts").select("cash_balance").eq("portfolio_id", portfolioId),
  ])

  if (portfolioError || holdingsError || accountsError) {
    return portfolioError ?? holdingsError ?? accountsError
  }

  if (!portfolio) return null

  const holdingsValue = (holdings ?? []).reduce(
    (sum, holding) => sum + Number(holding.market_value),
    0,
  )
  const cashBalance = (accounts ?? []).reduce(
    (sum, account) => sum + Number(account.cash_balance),
    0,
  )
  const totalValue = holdingsValue + cashBalance
  const liquidityRatio =
    totalValue > 0 ? Number(((cashBalance / totalValue) * 100).toFixed(2)) : 0

  const { error: updateError } = await supabase
    .from("portfolios")
    .update({
      liquidity_ratio: liquidityRatio,
      total_value: totalValue,
    })
    .eq("id", portfolioId)

  if (updateError) return updateError

  return syncHouseholdAum(supabase, portfolio.household_id)
}

export async function createPortfolio(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from("portfolios").insert({
    household_id: formData.get("household_id") as string,
    name: formData.get("name") as string,
    objective: (formData.get("objective") as string) || null,
    benchmark: (formData.get("benchmark") as string) || null,
    total_value: Number(formData.get("total_value")) || 0,
    performance_ytd: Number(formData.get("performance_ytd")) || 0,
  })

  if (error) return { error: formatSupabaseActionError(error) }

  revalidatePortfolioPaths()
  return { success: true }
}

export async function addHolding(formData: FormData) {
  const supabase = await createClient()
  const portfolioId = formData.get("portfolio_id") as string

  const units = Number(formData.get("units")) || 0
  const marketPrice = Number(formData.get("market_price")) || 0

  const { error } = await supabase.from("holdings").insert({
    portfolio_id: portfolioId,
    symbol: formData.get("symbol") as string,
    security_name: formData.get("security_name") as string,
    asset_class: formData.get("asset_class") as string,
    units,
    average_cost: Number(formData.get("average_cost")) || 0,
    market_price: marketPrice,
    market_value: units * marketPrice,
  })

  if (error) return { error: formatSupabaseActionError(error) }

  const syncError = await syncPortfolioTotals(supabase, portfolioId)
  if (syncError) return { error: formatSupabaseActionError(syncError) }

  revalidatePortfolioPaths()
  return { success: true }
}

export async function deleteHolding(id: string) {
  const supabase = await createClient()

  const { data: holding, error: holdingError } = await supabase
    .from("holdings")
    .select("portfolio_id")
    .eq("id", id)
    .maybeSingle()

  if (holdingError) return { error: formatSupabaseActionError(holdingError) }

  const { error } = await supabase.from("holdings").delete().eq("id", id)
  if (error) return { error: formatSupabaseActionError(error) }

  if (holding?.portfolio_id) {
    const syncError = await syncPortfolioTotals(supabase, holding.portfolio_id)
    if (syncError) return { error: formatSupabaseActionError(syncError) }
  }

  revalidatePortfolioPaths()
  return { success: true }
}

export async function createAccount(formData: FormData) {
  const supabase = await createClient()
  const portfolioId = formData.get("portfolio_id") as string

  const { error } = await supabase.from("accounts").insert({
    portfolio_id: portfolioId,
    account_number: formData.get("account_number") as string,
    custodian: formData.get("custodian") as string,
    account_type: formData.get("account_type") as string,
    cash_balance: Number(formData.get("cash_balance")) || 0,
  })

  if (error) return { error: formatSupabaseActionError(error) }

  const syncError = await syncPortfolioTotals(supabase, portfolioId)
  if (syncError) return { error: formatSupabaseActionError(syncError) }

  revalidatePortfolioPaths()
  return { success: true }
}

export async function deleteAccount(id: string) {
  const supabase = await createClient()

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("portfolio_id")
    .eq("id", id)
    .maybeSingle()

  if (accountError) return { error: formatSupabaseActionError(accountError) }

  const { error } = await supabase.from("accounts").delete().eq("id", id)
  if (error) return { error: formatSupabaseActionError(error) }

  if (account?.portfolio_id) {
    const syncError = await syncPortfolioTotals(supabase, account.portfolio_id)
    if (syncError) return { error: formatSupabaseActionError(syncError) }
  }

  revalidatePortfolioPaths()
  return { success: true }
}

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()

  const portfolioId = formData.get("portfolio_id") as string
  const accountIdValue = formData.get("account_id") as string
  const accountId = accountIdValue || null
  const transactionType = formData.get("transaction_type") as string
  const quantity = Number(formData.get("quantity")) || 0
  const price = Number(formData.get("price")) || 0
  const submittedGrossAmount = Number(formData.get("gross_amount")) || 0
  const grossAmount = submittedGrossAmount > 0 ? submittedGrossAmount : quantity * price
  const fees = Number(formData.get("fees")) || 0
  const tradedAtValue = formData.get("traded_at") as string
  const tradedAt = tradedAtValue
    ? new Date(tradedAtValue).toISOString()
    : new Date().toISOString()

  const { error } = await supabase.from("transactions").insert({
    account_id: accountId,
    portfolio_id: portfolioId,
    transaction_type: transactionType,
    symbol: ((formData.get("symbol") as string) || "").toUpperCase() || null,
    quantity,
    price,
    gross_amount: grossAmount,
    fees,
    traded_at: tradedAt,
    settlement_at: (formData.get("settlement_at") as string) || null,
    source: (formData.get("source") as string) || null,
  })

  if (error) return { error: formatSupabaseActionError(error) }

  if (accountId) {
    const accountError = await adjustAccountCashBalance(
      supabase,
      accountId,
      cashImpactForTransaction(transactionType, grossAmount, fees),
    )

    if (accountError) return { error: formatSupabaseActionError(accountError) }
  }

  const syncError = await syncPortfolioTotals(supabase, portfolioId)
  if (syncError) return { error: formatSupabaseActionError(syncError) }

  revalidatePortfolioPaths()
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()

  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .select("account_id, fees, gross_amount, portfolio_id, transaction_type")
    .eq("id", id)
    .maybeSingle()

  if (transactionError) return { error: formatSupabaseActionError(transactionError) }

  const { error } = await supabase.from("transactions").delete().eq("id", id)
  if (error) return { error: formatSupabaseActionError(error) }

  if (transaction?.account_id) {
    const accountError = await adjustAccountCashBalance(
      supabase,
      transaction.account_id,
      -cashImpactForTransaction(
        transaction.transaction_type,
        Number(transaction.gross_amount),
        Number(transaction.fees),
      ),
    )

    if (accountError) return { error: formatSupabaseActionError(accountError) }
  }

  if (transaction?.portfolio_id) {
    const syncError = await syncPortfolioTotals(supabase, transaction.portfolio_id)
    if (syncError) return { error: formatSupabaseActionError(syncError) }
  }

  revalidatePortfolioPaths()
  return { success: true }
}

export async function deletePortfolio(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("portfolios").delete().eq("id", id)
  if (error) return { error: formatSupabaseActionError(error) }
  revalidatePortfolioPaths()
  return { success: true }
}
