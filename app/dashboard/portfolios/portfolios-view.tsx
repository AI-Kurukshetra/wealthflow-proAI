"use client"

import { useMemo, useState, useTransition } from "react"
import {
  ArrowLeftRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CreditCardIcon,
  LandmarkIcon,
  PlusIcon,
  Trash2Icon,
  WalletIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCompactCurrency } from "@/lib/format"

import {
  addHolding,
  createAccount,
  createPortfolio,
  createTransaction,
  deleteAccount,
  deleteHolding,
  deletePortfolio,
  deleteTransaction,
} from "./actions"

type HoldingRow = {
  id: string
  symbol: string
  security_name: string
  asset_class: string
  units: number
  average_cost: number
  market_price: number
  market_value: number
  weight: number | null
}

type AccountRow = {
  id: string
  account_number: string
  custodian: string
  account_type: string
  cash_balance: number
}

type TransactionRow = {
  id: string
  account_id: string | null
  transaction_type: string
  symbol: string | null
  quantity: number
  price: number
  gross_amount: number
  fees: number
  traded_at: string
  settlement_at: string | null
  source: string | null
}

type PortfolioRow = {
  id: string
  name: string
  household_id: string
  total_value: number
  performance_ytd: number
  objective: string | null
  benchmark: string | null
  liquidity_ratio: number | null
  households: { name: string } | null
  holdings: HoldingRow[]
  accounts: AccountRow[]
  transactions: TransactionRow[]
}

type HouseholdOption = { id: string; name: string }

const accountTypes = [
  "demat",
  "mutual_fund",
  "bank",
  "pms",
  "aif",
  "insurance",
  "other",
]

const transactionTypes = [
  "buy",
  "sell",
  "deposit",
  "withdrawal",
  "dividend",
  "interest",
  "fee",
]

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

function formatLabel(value: string) {
  return value.replaceAll("_", " ")
}

function transactionBadgeClasses(transactionType: string) {
  switch (transactionType) {
    case "buy":
      return "border-blue-200 bg-blue-50 text-blue-700"
    case "sell":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "deposit":
    case "dividend":
    case "interest":
      return "border-teal-200 bg-teal-50 text-teal-700"
    case "withdrawal":
    case "fee":
      return "border-amber-200 bg-amber-50 text-amber-700"
    default:
      return "border-gray-200 bg-gray-50 text-gray-700"
  }
}

export function PortfoliosView({
  portfolios,
  households,
}: {
  portfolios: PortfolioRow[]
  households: HouseholdOption[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [holdingPortfolioId, setHoldingPortfolioId] = useState<string | null>(null)
  const [accountPortfolioId, setAccountPortfolioId] = useState<string | null>(null)
  const [transactionPortfolioId, setTransactionPortfolioId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const totalAum = portfolios.reduce((sum, portfolio) => sum + Number(portfolio.total_value), 0)
  const totalAccounts = portfolios.reduce(
    (sum, portfolio) => sum + portfolio.accounts.length,
    0,
  )
  const totalTransactions = portfolios.reduce(
    (sum, portfolio) => sum + portfolio.transactions.length,
    0,
  )

  const selectedTransactionPortfolio = useMemo(
    () =>
      portfolios.find((portfolio) => portfolio.id === transactionPortfolioId) ?? null,
    [portfolios, transactionPortfolioId],
  )

  function resetError() {
    setError(null)
  }

  async function handleAddPortfolio(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await createPortfolio(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setAddOpen(false)
      }
    })
  }

  async function handleAddHolding(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await addHolding(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setHoldingPortfolioId(null)
      }
    })
  }

  async function handleAddAccount(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await createAccount(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setAccountPortfolioId(null)
      }
    })
  }

  async function handleAddTransaction(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await createTransaction(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setTransactionPortfolioId(null)
      }
    })
  }

  async function handleDeletePortfolio(id: string) {
    if (!confirm("Delete this portfolio and all of its linked data?")) return

    startTransition(async () => {
      const result = await deletePortfolio(id)
      if (result.error) setError(result.error)
    })
  }

  async function handleDeleteHolding(id: string) {
    if (!confirm("Delete this holding?")) return

    startTransition(async () => {
      const result = await deleteHolding(id)
      if (result.error) setError(result.error)
    })
  }

  async function handleDeleteAccount(id: string) {
    if (!confirm("Delete this account? Existing transactions will remain but become unassigned.")) {
      return
    }

    startTransition(async () => {
      const result = await deleteAccount(id)
      if (result.error) setError(result.error)
    })
  }

  async function handleDeleteTransaction(id: string) {
    if (!confirm("Delete this transaction?")) return

    startTransition(async () => {
      const result = await deleteTransaction(id)
      if (result.error) setError(result.error)
    })
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Portfolios</h1>
          <p className="mt-1 text-sm text-gray-500">
            {portfolios.length} portfolios, {totalAccounts} linked accounts,{" "}
            {totalTransactions} transactions tracked
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Total AUM
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatCompactCurrency(totalAum)}
            </p>
          </div>

          <Dialog
            open={addOpen}
            onOpenChange={(open) => {
              setAddOpen(open)
              if (!open) resetError()
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <PlusIcon className="mr-1.5 size-4" /> Add Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Portfolio</DialogTitle>
                <DialogDescription>Add a new investment portfolio.</DialogDescription>
              </DialogHeader>

              <form action={handleAddPortfolio} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Household</label>
                  <select
                    name="household_id"
                    required
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select household...</option>
                    {households.map((household) => (
                      <option key={household.id} value={household.id}>
                        {household.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Portfolio Name</label>
                  <Input
                    name="name"
                    required
                    placeholder="e.g. Core Growth Portfolio"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Starting Value (INR)
                    </label>
                    <Input name="total_value" type="number" min="0" defaultValue="0" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      YTD Performance (%)
                    </label>
                    <Input
                      name="performance_ytd"
                      type="number"
                      step="0.1"
                      defaultValue="0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Objective</label>
                  <Input
                    name="objective"
                    placeholder="e.g. Long-term capital appreciation"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Benchmark</label>
                  <Input name="benchmark" placeholder="e.g. Nifty 50 TRI" />
                </div>

                {error ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isPending ? "Creating..." : "Create Portfolio"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog
        open={Boolean(holdingPortfolioId)}
        onOpenChange={(open) => {
          if (!open) {
            setHoldingPortfolioId(null)
            resetError()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Holding</DialogTitle>
            <DialogDescription>Add a security to this portfolio.</DialogDescription>
          </DialogHeader>

          <form action={handleAddHolding} className="space-y-4">
            <input type="hidden" name="portfolio_id" value={holdingPortfolioId ?? ""} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Symbol</label>
                <Input name="symbol" required placeholder="e.g. HDFCBANK" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Security Name</label>
                <Input
                  name="security_name"
                  required
                  placeholder="e.g. HDFC Bank Ltd"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Asset Class</label>
              <select
                name="asset_class"
                required
                defaultValue="Large Cap Equity"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <option value="Large Cap Equity">Large Cap Equity</option>
                <option value="Mid Cap Equity">Mid Cap Equity</option>
                <option value="Small Cap Equity">Small Cap Equity</option>
                <option value="Debt Mutual Fund">Debt Mutual Fund</option>
                <option value="Liquid Fund">Liquid Fund</option>
                <option value="Index ETF">Index ETF</option>
                <option value="Gold">Gold</option>
                <option value="Flexi Cap MF">Flexi Cap MF</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Units</label>
                <Input name="units" type="number" required min="0" step="0.0001" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Avg Cost</label>
                <Input name="average_cost" type="number" required min="0" step="0.01" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Market Price</label>
                <Input name="market_price" type="number" required min="0" step="0.01" />
              </div>
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setHoldingPortfolioId(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isPending ? "Adding..." : "Add Holding"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(accountPortfolioId)}
        onOpenChange={(open) => {
          if (!open) {
            setAccountPortfolioId(null)
            resetError()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Account</DialogTitle>
            <DialogDescription>
              Link a custody or bank account to this portfolio.
            </DialogDescription>
          </DialogHeader>

          <form action={handleAddAccount} className="space-y-4">
            <input type="hidden" name="portfolio_id" value={accountPortfolioId ?? ""} />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Account Number</label>
              <Input
                name="account_number"
                required
                placeholder="e.g. DEMAT-001254"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Custodian</label>
                <Input name="custodian" required placeholder="e.g. Zerodha" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Account Type</label>
                <select
                  name="account_type"
                  defaultValue="demat"
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  {accountTypes.map((accountType) => (
                    <option key={accountType} value={accountType}>
                      {formatLabel(accountType)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Opening Cash Balance (INR)
              </label>
              <Input
                name="cash_balance"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAccountPortfolioId(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isPending ? "Adding..." : "Add Account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(transactionPortfolioId)}
        onOpenChange={(open) => {
          if (!open) {
            setTransactionPortfolioId(null)
            resetError()
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Record cash movement or trading activity for this portfolio.
            </DialogDescription>
          </DialogHeader>

          <form action={handleAddTransaction} className="space-y-4">
            <input type="hidden" name="portfolio_id" value={transactionPortfolioId ?? ""} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Transaction Type</label>
                <select
                  name="transaction_type"
                  defaultValue="buy"
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  {transactionTypes.map((transactionType) => (
                    <option key={transactionType} value={transactionType}>
                      {formatLabel(transactionType)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Account</label>
                <select
                  name="account_id"
                  defaultValue=""
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Portfolio-level / unassigned</option>
                  {(selectedTransactionPortfolio?.accounts ?? []).map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_number} · {account.custodian}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Symbol</label>
                <Input name="symbol" placeholder="Optional for cash transactions" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Source</label>
                <Input
                  name="source"
                  placeholder="e.g. Manual entry, CAMS import, broker statement"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <Input name="quantity" type="number" min="0" step="0.0001" defaultValue="0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Price</label>
                <Input name="price" type="number" min="0" step="0.01" defaultValue="0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Gross Amount</label>
                <Input
                  name="gross_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Fees</label>
                <Input name="fees" type="number" min="0" step="0.01" defaultValue="0" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Trade Time</label>
                <Input
                  name="traded_at"
                  type="datetime-local"
                  defaultValue={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Settlement Date</label>
                <Input name="settlement_at" type="date" />
              </div>
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTransactionPortfolioId(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isPending ? "Saving..." : "Add Transaction"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {portfolios.length > 0 ? (
        <div className="space-y-4">
          {portfolios.map((portfolio) => {
            const isExpanded = expandedId === portfolio.id
            const pnlColor =
              portfolio.performance_ytd >= 0 ? "text-emerald-600" : "text-red-600"
            const sortedTransactions = [...portfolio.transactions].sort(
              (left, right) =>
                new Date(right.traded_at).getTime() - new Date(left.traded_at).getTime(),
            )
            const totalCash = portfolio.accounts.reduce(
              (sum, account) => sum + Number(account.cash_balance),
              0,
            )
            const latestTransaction = sortedTransactions[0] ?? null
            const accountLookup = new Map(
              portfolio.accounts.map((account) => [account.id, account.account_number]),
            )

            return (
              <Card key={portfolio.id} className="border-gray-200 bg-white shadow-sm">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : portfolio.id)}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-start gap-3">
                      {isExpanded ? (
                        <ChevronDownIcon className="mt-0.5 size-5 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="mt-0.5 size-5 text-gray-400" />
                      )}

                      <div>
                        <CardTitle className="text-base text-gray-900">
                          {portfolio.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {portfolio.households?.name ?? "—"} ·{" "}
                          {portfolio.objective ?? "No objective set"}
                        </CardDescription>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="outline">{portfolio.accounts.length} accounts</Badge>
                          <Badge variant="outline">{portfolio.holdings.length} holdings</Badge>
                          <Badge variant="outline">
                            {portfolio.transactions.length} transactions
                          </Badge>
                          {portfolio.benchmark ? (
                            <Badge variant="outline">{portfolio.benchmark}</Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 xl:items-end">
                      <div className="text-left xl:text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCompactCurrency(Number(portfolio.total_value))}
                        </p>
                        <p className={`text-sm font-medium ${pnlColor}`}>
                          {portfolio.performance_ytd >= 0 ? "+" : ""}
                          {portfolio.performance_ytd}% YTD
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            resetError()
                            setHoldingPortfolioId(portfolio.id)
                          }}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          title="Add holding"
                        >
                          <PlusIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            resetError()
                            setAccountPortfolioId(portfolio.id)
                          }}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          title="Add account"
                        >
                          <CreditCardIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            resetError()
                            setTransactionPortfolioId(portfolio.id)
                          }}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          title="Add transaction"
                        >
                          <ArrowLeftRightIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            void handleDeletePortfolio(portfolio.id)
                          }}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete portfolio"
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded ? (
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                          <WalletIcon className="size-4 text-gray-400" />
                          Cash Position
                        </div>
                        <p className="mt-3 text-xl font-semibold text-gray-900">
                          {formatCompactCurrency(totalCash)}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {Number(portfolio.liquidity_ratio ?? 0).toFixed(1)}% liquid
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                          <CreditCardIcon className="size-4 text-gray-400" />
                          Custody Accounts
                        </div>
                        <p className="mt-3 text-xl font-semibold text-gray-900">
                          {portfolio.accounts.length}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {portfolio.accounts.map((account) => account.custodian).join(", ") ||
                            "No linked accounts"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                          <LandmarkIcon className="size-4 text-gray-400" />
                          Trading Activity
                        </div>
                        <p className="mt-3 text-xl font-semibold text-gray-900">
                          {portfolio.transactions.length}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {latestTransaction
                            ? `Last entry ${formatDateTime(latestTransaction.traded_at)}`
                            : "No transactions yet"}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                      <section className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">Accounts</h3>
                            <p className="text-sm text-gray-500">
                              Custodian and cash-balance records for this portfolio.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              resetError()
                              setAccountPortfolioId(portfolio.id)
                            }}
                          >
                            <PlusIcon className="mr-1.5 size-4" /> Add Account
                          </Button>
                        </div>

                        {portfolio.accounts.length > 0 ? (
                          <div className="overflow-hidden rounded-xl border border-gray-200">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Account</TableHead>
                                  <TableHead>Custodian</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead className="text-right">Cash</TableHead>
                                  <TableHead className="w-[56px] text-right"> </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {portfolio.accounts.map((account) => (
                                  <TableRow key={account.id}>
                                    <TableCell className="font-medium text-gray-900">
                                      {account.account_number}
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                      {account.custodian}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">
                                        {formatLabel(account.account_type)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-gray-900">
                                      {formatCompactCurrency(Number(account.cash_balance))}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <button
                                        type="button"
                                        onClick={() => void handleDeleteAccount(account.id)}
                                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                        title="Delete account"
                                      >
                                        <Trash2Icon className="size-4" />
                                      </button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
                            No linked accounts yet.
                          </div>
                        )}
                      </section>

                      <section className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              Transactions
                            </h3>
                            <p className="text-sm text-gray-500">
                              Trading, fees, and cash movements.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              resetError()
                              setTransactionPortfolioId(portfolio.id)
                            }}
                          >
                            <PlusIcon className="mr-1.5 size-4" /> Add Transaction
                          </Button>
                        </div>

                        {sortedTransactions.length > 0 ? (
                          <div className="space-y-3">
                            {sortedTransactions.slice(0, 8).map((transaction) => (
                              <div
                                key={transaction.id}
                                className="rounded-xl border border-gray-200 bg-white p-4"
                              >
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className={transactionBadgeClasses(
                                          transaction.transaction_type,
                                        )}
                                      >
                                        {formatLabel(transaction.transaction_type)}
                                      </Badge>
                                      <span className="text-sm font-medium text-gray-900">
                                        {transaction.symbol ?? "Cash movement"}
                                      </span>
                                    </div>

                                    <p className="mt-2 text-sm text-gray-500">
                                      {accountLookup.get(transaction.account_id ?? "") ??
                                        "Unassigned"}{" "}
                                      · {formatDateTime(transaction.traded_at)}
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                                      <span>
                                        Amount:{" "}
                                        <span className="font-medium text-gray-900">
                                          {formatCompactCurrency(
                                            Number(transaction.gross_amount),
                                          )}
                                        </span>
                                      </span>
                                      <span>
                                        Fees:{" "}
                                        <span className="font-medium text-gray-900">
                                          {formatCompactCurrency(Number(transaction.fees))}
                                        </span>
                                      </span>
                                      <span>
                                        Qty/Price:{" "}
                                        <span className="font-medium text-gray-900">
                                          {Number(transaction.quantity).toLocaleString("en-IN")} @{" "}
                                          {formatCompactCurrency(Number(transaction.price))}
                                        </span>
                                      </span>
                                    </div>

                                    {transaction.source ? (
                                      <p className="mt-2 text-sm text-gray-500">
                                        Source: {transaction.source}
                                      </p>
                                    ) : null}
                                  </div>

                                  <div className="flex items-center gap-3 md:flex-col md:items-end">
                                    <div className="text-sm text-gray-500">
                                      Settle {formatDate(transaction.settlement_at)}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleDeleteTransaction(transaction.id)
                                      }
                                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                      title="Delete transaction"
                                    >
                                      <Trash2Icon className="size-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
                            No transactions yet.
                          </div>
                        )}
                      </section>
                    </div>

                    <section className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">Holdings</h3>
                          <p className="text-sm text-gray-500">
                            Securities and asset-allocation records.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            resetError()
                            setHoldingPortfolioId(portfolio.id)
                          }}
                        >
                          <PlusIcon className="mr-1.5 size-4" /> Add Holding
                        </Button>
                      </div>

                      {portfolio.holdings.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Security</TableHead>
                                <TableHead>Asset Class</TableHead>
                                <TableHead className="text-right">Units</TableHead>
                                <TableHead className="text-right">Avg Cost</TableHead>
                                <TableHead className="text-right">Market Price</TableHead>
                                <TableHead className="text-right">Market Value</TableHead>
                                <TableHead className="w-[56px] text-right"> </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {portfolio.holdings.map((holding) => (
                                <TableRow key={holding.id}>
                                  <TableCell className="font-medium text-gray-900">
                                    {holding.symbol}
                                  </TableCell>
                                  <TableCell className="text-gray-600">
                                    {holding.security_name}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                      {holding.asset_class}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {Number(holding.units).toLocaleString("en-IN")}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCompactCurrency(Number(holding.average_cost))}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCompactCurrency(Number(holding.market_price))}
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-gray-900">
                                    {formatCompactCurrency(Number(holding.market_value))}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <button
                                      type="button"
                                      onClick={() => void handleDeleteHolding(holding.id)}
                                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                      title="Delete holding"
                                    >
                                      <Trash2Icon className="size-4" />
                                    </button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
                          No holdings yet.
                        </div>
                      )}
                    </section>
                  </CardContent>
                ) : null}
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-gray-500">
            No portfolios yet. Create your first portfolio to start tracking
            investments.
          </p>
        </div>
      )}
    </div>
  )
}
