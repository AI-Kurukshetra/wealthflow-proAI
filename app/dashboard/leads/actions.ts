"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"

const leadRelatedPaths = [
  "/dashboard/leads",
  "/dashboard/pipeline",
  "/dashboard/reports",
]

function revalidateLeadPaths() {
  leadRelatedPaths.forEach((path) => revalidatePath(path))
}

export async function createLead(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const contactName = ((formData.get("contact_name") as string) || "").trim()

  if (!contactName) {
    return { error: "Contact name is required." }
  }

  const { error } = await supabase.from("leads").insert({
    owner_id: user?.id ?? null,
    company_name: ((formData.get("company_name") as string) || "").trim() || null,
    contact_name: contactName,
    email: ((formData.get("email") as string) || "").trim() || null,
    phone: ((formData.get("phone") as string) || "").trim() || null,
    source: ((formData.get("source") as string) || "").trim() || null,
    status: ((formData.get("status") as string) || "").trim() || "new",
    score: Number(formData.get("score")) || 0,
  })

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateLeadPaths()
  return { success: true }
}

export async function updateLead(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get("id") as string
  const contactName = ((formData.get("contact_name") as string) || "").trim()

  if (!contactName) {
    return { error: "Contact name is required." }
  }

  const { error } = await supabase
    .from("leads")
    .update({
      company_name:
        ((formData.get("company_name") as string) || "").trim() || null,
      contact_name: contactName,
      email: ((formData.get("email") as string) || "").trim() || null,
      phone: ((formData.get("phone") as string) || "").trim() || null,
      source: ((formData.get("source") as string) || "").trim() || null,
      status: ((formData.get("status") as string) || "").trim() || "new",
      score: Number(formData.get("score")) || 0,
    })
    .eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateLeadPaths()
  return { success: true }
}

export async function deleteLead(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("leads").delete().eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateLeadPaths()
  return { success: true }
}

export async function convertLeadToOpportunity(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single()

  if (leadError) {
    return { error: formatSupabaseActionError(leadError) }
  }

  const { data: existingOpportunities, error: opportunityLookupError } =
    await supabase.from("opportunities").select("id").eq("lead_id", id).limit(1)

  if (opportunityLookupError) {
    return { error: formatSupabaseActionError(opportunityLookupError) }
  }

  if ((existingOpportunities ?? []).length > 0) {
    return { error: "This lead already has an opportunity in the pipeline." }
  }

  const opportunityTitle = lead.company_name
    ? `${lead.company_name} opportunity`
    : `${lead.contact_name} opportunity`

  const { error: createOpportunityError } = await supabase
    .from("opportunities")
    .insert({
      lead_id: lead.id,
      owner_id: user?.id ?? lead.owner_id ?? null,
      title: opportunityTitle,
      stage: "qualifying",
      expected_value: 0,
      probability: 25,
      notes: `Converted from lead ${lead.contact_name}.`,
    })

  if (createOpportunityError) {
    return { error: formatSupabaseActionError(createOpportunityError) }
  }

  const { error: updateLeadError } = await supabase
    .from("leads")
    .update({ status: "converted" })
    .eq("id", id)

  if (updateLeadError) {
    return { error: formatSupabaseActionError(updateLeadError) }
  }

  revalidateLeadPaths()
  return { success: true }
}
