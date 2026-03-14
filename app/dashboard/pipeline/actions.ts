"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"

const pipelinePaths = ["/dashboard", "/dashboard/pipeline", "/dashboard/reports"]

function revalidatePipelinePaths() {
  pipelinePaths.forEach((path) => revalidatePath(path))
}

export async function createOpportunity(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const title = ((formData.get("title") as string) || "").trim()

  if (!title) {
    return { error: "Opportunity title is required." }
  }

  const { error } = await supabase.from("opportunities").insert({
    household_id: ((formData.get("household_id") as string) || "").trim() || null,
    owner_id: user?.id ?? null,
    title,
    stage: (((formData.get("stage") as string) || "").trim() || "qualifying") as
      | "qualifying"
      | "proposal"
      | "diligence"
      | "commitment"
      | "won"
      | "lost",
    expected_value: Number(formData.get("expected_value")) || 0,
    probability: Number(formData.get("probability")) || 0,
    target_close_date:
      ((formData.get("target_close_date") as string) || "").trim() || null,
    notes: ((formData.get("notes") as string) || "").trim() || null,
  })

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidatePipelinePaths()
  return { success: true }
}

export async function updateOpportunityStage(id: string, stage: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("opportunities").update({ stage }).eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidatePipelinePaths()
  return { success: true }
}

export async function deleteOpportunity(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("opportunities").delete().eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidatePipelinePaths()
  return { success: true }
}
