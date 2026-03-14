"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"

export async function createClient_(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const householdId = formData.get("household_id") as string
  const firstName = formData.get("first_name") as string
  const lastName = formData.get("last_name") as string
  const email = (formData.get("email") as string) || null
  const phone = (formData.get("phone") as string) || null
  const city = (formData.get("city") as string) || null
  const panNumber = (formData.get("pan_number") as string) || null

  const { error } = await supabase.from("clients").insert({
    household_id: householdId,
    owner_id: user?.id ?? null,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    city,
    pan_number: panNumber,
    onboarding_stage: "prospect",
    kyc_status: "pending",
  })

  if (error) return { error: formatSupabaseActionError(error) }

  revalidatePath("/dashboard/clients")
  return { success: true }
}

export async function updateClient(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get("id") as string
  const firstName = formData.get("first_name") as string
  const lastName = formData.get("last_name") as string
  const email = (formData.get("email") as string) || null
  const phone = (formData.get("phone") as string) || null
  const city = (formData.get("city") as string) || null
  const kycStatus = formData.get("kyc_status") as string
  const onboardingStage = formData.get("onboarding_stage") as string

  const { error } = await supabase
    .from("clients")
    .update({ first_name: firstName, last_name: lastName, email, phone, city, kyc_status: kycStatus, onboarding_stage: onboardingStage })
    .eq("id", id)

  if (error) return { error: formatSupabaseActionError(error) }

  revalidatePath("/dashboard/clients")
  return { success: true }
}

export async function deleteClient(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("clients").delete().eq("id", id)

  if (error) return { error: formatSupabaseActionError(error) }

  revalidatePath("/dashboard/clients")
  return { success: true }
}
