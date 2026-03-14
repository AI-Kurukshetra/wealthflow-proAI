"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"

const goalPaths = ["/dashboard/goals", "/dashboard/reports"]

function revalidateGoalPaths() {
  goalPaths.forEach((path) => revalidatePath(path))
}

export async function createGoal(formData: FormData) {
  const supabase = await createClient()

  const householdId = ((formData.get("household_id") as string) || "").trim()
  const title = ((formData.get("title") as string) || "").trim()

  if (!householdId) {
    return { error: "Household is required." }
  }

  if (!title) {
    return { error: "Goal title is required." }
  }

  const { error } = await supabase.from("goals").insert({
    household_id: householdId,
    title,
    target_amount: Number(formData.get("target_amount")) || 0,
    current_amount: Number(formData.get("current_amount")) || 0,
    target_date: ((formData.get("target_date") as string) || "").trim() || null,
    priority: ((formData.get("priority") as string) || "").trim() || "medium",
    status: ((formData.get("status") as string) || "").trim() || "on_track",
  })

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateGoalPaths()
  return { success: true }
}

export async function updateGoal(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get("id") as string
  const householdId = ((formData.get("household_id") as string) || "").trim()
  const title = ((formData.get("title") as string) || "").trim()

  if (!householdId) {
    return { error: "Household is required." }
  }

  if (!title) {
    return { error: "Goal title is required." }
  }

  const { error } = await supabase
    .from("goals")
    .update({
      household_id: householdId,
      title,
      target_amount: Number(formData.get("target_amount")) || 0,
      current_amount: Number(formData.get("current_amount")) || 0,
      target_date: ((formData.get("target_date") as string) || "").trim() || null,
      priority: ((formData.get("priority") as string) || "").trim() || "medium",
      status: ((formData.get("status") as string) || "").trim() || "on_track",
    })
    .eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateGoalPaths()
  return { success: true }
}

export async function deleteGoal(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("goals").delete().eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateGoalPaths()
  return { success: true }
}
