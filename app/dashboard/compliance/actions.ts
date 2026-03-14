"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"

export async function createComplianceRecord(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from("compliance_records").insert({
    household_id: (formData.get("household_id") as string) || null,
    owner_id: user?.id ?? null,
    record_type: formData.get("record_type") as string,
    status: "pending",
    due_at: (formData.get("due_at") as string) || null,
    finding: (formData.get("finding") as string) || null,
  })

  if (error) return { error: formatSupabaseActionError(error) }
  revalidatePath("/dashboard/compliance")
  return { success: true }
}

export async function updateComplianceStatus(id: string, status: string) {
  const supabase = await createClient()
  const updates: { status: string; completed_at?: string } = { status }
  if (status === "approved" || status === "closed") {
    updates.completed_at = new Date().toISOString().split("T")[0]
  }
  const { error } = await supabase.from("compliance_records").update(updates).eq("id", id)
  if (error) return { error: formatSupabaseActionError(error) }
  revalidatePath("/dashboard/compliance")
  return { success: true }
}

export async function deleteComplianceRecord(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("compliance_records").delete().eq("id", id)
  if (error) return { error: formatSupabaseActionError(error) }
  revalidatePath("/dashboard/compliance")
  return { success: true }
}
