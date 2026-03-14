import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import type { FeeSchedule, Household } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"

import { FeesView } from "./fees-view"

export const metadata = { title: "Fees" }

type FeeScheduleWithHousehold = FeeSchedule & {
  households: Pick<Household, "name"> | null
}

export default async function FeesPage() {
  const supabase = await createClient()

  const [
    { data: feeSchedules, error: feeSchedulesError },
    { data: households, error: householdsError },
  ] = await Promise.all([
    supabase
      .from("fee_schedules")
      .select("*, households(name)")
      .order("next_invoice_date", { ascending: true }),
    supabase.from("households").select("id, name").order("name"),
  ])

  if (hasMissingSchemaError([feeSchedulesError, householdsError])) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the fee schedules workspace." />
    )
  }

  return (
    <FeesView
      feeSchedules={((feeSchedules ?? []) as FeeScheduleWithHousehold[])}
      households={((households ?? []) as Pick<Household, "id" | "name">[])}
    />
  )
}
