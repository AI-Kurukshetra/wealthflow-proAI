import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import type { Household } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"

import { HouseholdsView } from "./households-view"

export const metadata = { title: "Households" }

export default async function HouseholdsPage() {
  const supabase = await createClient()
  const { data: households, error } = await supabase
    .from("households")
    .select("*")
    .order("total_aum", { ascending: false })

  if (hasMissingSchemaError([error])) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the households workspace." />
    )
  }

  return <HouseholdsView households={((households ?? []) as Household[])} />
}
