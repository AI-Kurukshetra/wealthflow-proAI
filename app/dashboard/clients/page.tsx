import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import type { Client, Household } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"
import { ClientsTable } from "./clients-table"

export const metadata = { title: "Clients" }

type ClientWithHousehold = Client & {
  households: Pick<Household, "name"> | null
}

export default async function ClientsPage() {
  const supabase = await createClient()

  const [
    { data: clients, error: clientsError },
    { data: households, error: householdsError },
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("*, households(name)")
      .order("created_at", { ascending: false }),
    supabase.from("households").select("id, name").order("name"),
  ])

  if (hasMissingSchemaError([clientsError, householdsError])) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the clients workspace." />
    )
  }

  return (
    <ClientsTable
      clients={((clients ?? []) as ClientWithHousehold[])}
      households={((households ?? []) as Pick<Household, "id" | "name">[])}
    />
  )
}
