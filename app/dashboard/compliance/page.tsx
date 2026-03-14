import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import type { ComplianceRecord, Household } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"
import { ComplianceView } from "./compliance-view"

export const metadata = { title: "Compliance" }

type ComplianceRecordWithHousehold = ComplianceRecord & {
  households: Pick<Household, "name"> | null
}

export default async function CompliancePage() {
  const supabase = await createClient()

  const [
    { data: records, error: recordsError },
    { data: households, error: householdsError },
  ] = await Promise.all([
    supabase
      .from("compliance_records")
      .select("*, households(name)")
      .order("due_at", { ascending: true }),
    supabase.from("households").select("id, name").order("name"),
  ])

  if (hasMissingSchemaError([recordsError, householdsError])) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the compliance workspace." />
    )
  }

  return (
    <ComplianceView
      records={((records ?? []) as ComplianceRecordWithHousehold[])}
      households={((households ?? []) as Pick<Household, "id" | "name">[])}
    />
  )
}
