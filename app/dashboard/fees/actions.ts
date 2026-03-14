"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"

const feePaths = ["/dashboard/fees", "/dashboard/reports"]

function revalidateFeePaths() {
  feePaths.forEach((path) => revalidatePath(path))
}

export async function createFeeSchedule(formData: FormData) {
  const supabase = await createClient()

  const householdId = ((formData.get("household_id") as string) || "").trim()

  if (!householdId) {
    return { error: "Household is required." }
  }

  const { error } = await supabase.from("fee_schedules").insert({
    household_id: householdId,
    billing_frequency:
      ((formData.get("billing_frequency") as string) || "").trim() || "quarterly",
    advisory_fee_bps: Number(formData.get("advisory_fee_bps")) || 0,
    last_invoice_date:
      ((formData.get("last_invoice_date") as string) || "").trim() || null,
    next_invoice_date:
      ((formData.get("next_invoice_date") as string) || "").trim() || null,
    collection_status:
      ((formData.get("collection_status") as string) || "").trim() || "pending",
  })

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateFeePaths()
  return { success: true }
}

export async function updateFeeSchedule(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get("id") as string
  const householdId = ((formData.get("household_id") as string) || "").trim()

  if (!householdId) {
    return { error: "Household is required." }
  }

  const { error } = await supabase
    .from("fee_schedules")
    .update({
      household_id: householdId,
      billing_frequency:
        ((formData.get("billing_frequency") as string) || "").trim() || "quarterly",
      advisory_fee_bps: Number(formData.get("advisory_fee_bps")) || 0,
      last_invoice_date:
        ((formData.get("last_invoice_date") as string) || "").trim() || null,
      next_invoice_date:
        ((formData.get("next_invoice_date") as string) || "").trim() || null,
      collection_status:
        ((formData.get("collection_status") as string) || "").trim() || "pending",
    })
    .eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateFeePaths()
  return { success: true }
}

export async function deleteFeeSchedule(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("fee_schedules").delete().eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateFeePaths()
  return { success: true }
}
