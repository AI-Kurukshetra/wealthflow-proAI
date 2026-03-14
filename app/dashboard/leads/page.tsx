import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import type { Lead, Opportunity } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"

import { LeadsView } from "./leads-view"

export const metadata = { title: "Leads" }

type LeadWithOpportunity = Lead & {
  opportunity: { id: string; stage: string } | null
}

export default async function LeadsPage() {
  const supabase = await createClient()

  const [
    { data: leads, error: leadsError },
    { data: opportunities, error: opportunitiesError },
  ] = await Promise.all([
    supabase.from("leads").select("*").order("updated_at", { ascending: false }),
    supabase.from("opportunities").select("id, lead_id, stage"),
  ])

  if (hasMissingSchemaError([leadsError, opportunitiesError])) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the leads workspace." />
    )
  }

  const opportunitiesByLeadId = new Map(
    ((opportunities ?? []) as Pick<Opportunity, "id" | "lead_id" | "stage">[])
      .filter((opportunity) => opportunity.lead_id)
      .map((opportunity) => [
        opportunity.lead_id as string,
        { id: opportunity.id, stage: opportunity.stage },
      ]),
  )

  const leadsWithOpportunity = ((leads ?? []) as Lead[]).map((lead) => ({
    ...lead,
    opportunity: opportunitiesByLeadId.get(lead.id) ?? null,
  })) as LeadWithOpportunity[]

  return <LeadsView leads={leadsWithOpportunity} />
}
