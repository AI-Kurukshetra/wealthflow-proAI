import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import type { Goal, Household } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"

import { GoalsView } from "./goals-view"

export const metadata = { title: "Goals" }

type GoalWithHousehold = Goal & {
  households: Pick<Household, "name"> | null
}

export default async function GoalsPage() {
  const supabase = await createClient()

  const [
    { data: goals, error: goalsError },
    { data: households, error: householdsError },
  ] = await Promise.all([
    supabase
      .from("goals")
      .select("*, households(name)")
      .order("created_at", { ascending: false }),
    supabase.from("households").select("id, name").order("name"),
  ])

  if (hasMissingSchemaError([goalsError, householdsError])) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the goals workspace." />
    )
  }

  return (
    <GoalsView
      goals={((goals ?? []) as GoalWithHousehold[])}
      households={((households ?? []) as Pick<Household, "id" | "name">[])}
    />
  )
}
