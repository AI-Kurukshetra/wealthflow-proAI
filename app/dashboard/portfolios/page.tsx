import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import type {
  Account,
  Holding,
  Household,
  Portfolio,
  Transaction,
} from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"
import { PortfoliosView } from "./portfolios-view"

export const metadata = { title: "Portfolios" }

type PortfolioWithRelations = Portfolio & {
  accounts: Account[] | null
  households: Pick<Household, "name"> | null
  holdings: Holding[] | null
  transactions: Transaction[] | null
}

export default async function PortfoliosPage() {
  const supabase = await createClient()

  const [
    { data: portfolios, error: portfoliosError },
    { data: households, error: householdsError },
  ] = await Promise.all([
    supabase
      .from("portfolios")
      .select("*, households(name), holdings(*), accounts(*), transactions(*)")
      .order("total_value", { ascending: false }),
    supabase.from("households").select("id, name").order("name"),
  ])

  if (hasMissingSchemaError([portfoliosError, householdsError])) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the portfolios workspace." />
    )
  }

  return (
    <PortfoliosView
      portfolios={((portfolios ?? []) as PortfolioWithRelations[]).map((portfolio) => ({
        ...portfolio,
        accounts: portfolio.accounts ?? [],
        holdings: portfolio.holdings ?? [],
        transactions: portfolio.transactions ?? [],
      }))}
      households={((households ?? []) as Pick<Household, "id" | "name">[])}
    />
  )
}
