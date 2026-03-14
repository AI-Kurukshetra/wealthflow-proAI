"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"

const householdRelatedPaths = [
  "/dashboard",
  "/dashboard/households",
  "/dashboard/clients",
  "/dashboard/portfolios",
  "/dashboard/tasks",
  "/dashboard/compliance",
  "/dashboard/pipeline",
  "/dashboard/reports",
]

function revalidateHouseholdPaths() {
  householdRelatedPaths.forEach((path) => revalidatePath(path))
}

export async function createHousehold(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const name = (formData.get("name") as string).trim()
  const segment = (formData.get("segment") as string).trim()
  const totalAum = Number(formData.get("total_aum") ?? 0)
  const riskProfile = ((formData.get("risk_profile") as string) || "").trim() || null
  const status = (formData.get("status") as string).trim()
  const nextReviewDate =
    ((formData.get("next_review_date") as string) || "").trim() || null
  const notes = ((formData.get("notes") as string) || "").trim() || null

  const { error } = await supabase.from("households").insert({
    name,
    segment,
    advisor_id: user?.id ?? null,
    total_aum: Number.isFinite(totalAum) ? totalAum : 0,
    risk_profile: riskProfile,
    status,
    next_review_date: nextReviewDate,
    notes,
  })

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateHouseholdPaths()
  return { success: true }
}

export async function updateHousehold(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get("id") as string
  const name = (formData.get("name") as string).trim()
  const segment = (formData.get("segment") as string).trim()
  const totalAum = Number(formData.get("total_aum") ?? 0)
  const riskProfile = ((formData.get("risk_profile") as string) || "").trim() || null
  const status = (formData.get("status") as string).trim()
  const nextReviewDate =
    ((formData.get("next_review_date") as string) || "").trim() || null
  const notes = ((formData.get("notes") as string) || "").trim() || null

  const { error } = await supabase
    .from("households")
    .update({
      name,
      segment,
      total_aum: Number.isFinite(totalAum) ? totalAum : 0,
      risk_profile: riskProfile,
      status,
      next_review_date: nextReviewDate,
      notes,
    })
    .eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateHouseholdPaths()
  return { success: true }
}

export async function deleteHousehold(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("households").delete().eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateHouseholdPaths()
  return { success: true }
}
