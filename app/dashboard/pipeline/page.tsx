import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import { createClient } from "@/lib/supabase/server"
import type { Household, Opportunity } from "@/lib/database.types"
import { hasMissingSchemaError } from "@/lib/supabase/schema"

import { PipelineView } from "./pipeline-view"

export const metadata = { title: "Pipeline" }

type OpportunityWithHousehold = Opportunity & {
  households: Pick<Household, "name"> | null
}

export default async function PipelinePage() {
  const supabase = await createClient()

  const [
    { data: opportunities, error: opportunitiesError },
    { data: households, error: householdsError },
  ] = await Promise.all([
    supabase
      .from("opportunities")
      .select("*, households(name)")
      .order("expected_value", { ascending: false }),
    supabase.from("households").select("id, name").order("name"),
  ])

  if (hasMissingSchemaError([opportunitiesError, householdsError])) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the pipeline workspace." />
    )
  }

  return (
    <PipelineView
      opportunities={((opportunities ?? []) as OpportunityWithHousehold[])}
      households={((households ?? []) as Pick<Household, "id" | "name">[])}
    />
  )
}
