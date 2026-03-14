import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import type { Client, CommunicationLog, Household } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"

import { CommunicationsView } from "./communications-view"

export const metadata = { title: "Communications" }

type CommunicationLogWithRelations = CommunicationLog & {
  households: Pick<Household, "name"> | null
  clients: Pick<Client, "first_name" | "last_name"> | null
}

export default async function CommunicationsPage() {
  const supabase = await createClient()

  const [
    { data: communications, error: communicationsError },
    { data: households, error: householdsError },
    { data: clients, error: clientsError },
  ] = await Promise.all([
    supabase
      .from("communication_logs")
      .select("*, households(name), clients(first_name, last_name)")
      .order("logged_at", { ascending: false }),
    supabase.from("households").select("id, name").order("name"),
    supabase.from("clients").select("id, first_name, last_name").order("first_name"),
  ])

  if (hasMissingSchemaError([communicationsError, householdsError, clientsError])) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the communications workspace." />
    )
  }

  return (
    <CommunicationsView
      communications={((communications ?? []) as CommunicationLogWithRelations[])}
      households={((households ?? []) as Pick<Household, "id" | "name">[])}
      clients={((clients ?? []) as Pick<Client, "id" | "first_name" | "last_name">[])}
    />
  )
}
