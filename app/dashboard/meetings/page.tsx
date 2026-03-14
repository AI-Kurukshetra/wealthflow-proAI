import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import type { Household, Meeting } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"

import { MeetingsView } from "./meetings-view"

export const metadata = { title: "Meetings" }

type MeetingWithHousehold = Meeting & {
  households: Pick<Household, "name"> | null
}

export default async function MeetingsPage() {
  const supabase = await createClient()

  const [
    { data: meetings, error: meetingsError },
    { data: households, error: householdsError },
  ] = await Promise.all([
    supabase
      .from("meetings")
      .select("*, households(name)")
      .order("starts_at", { ascending: true }),
    supabase.from("households").select("id, name").order("name"),
  ])

  if (hasMissingSchemaError([meetingsError, householdsError])) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the meetings workspace." />
    )
  }

  return (
    <MeetingsView
      meetings={((meetings ?? []) as MeetingWithHousehold[])}
      households={((households ?? []) as Pick<Household, "id" | "name">[])}
    />
  )
}
