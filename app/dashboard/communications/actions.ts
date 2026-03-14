"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"

const communicationPaths = ["/dashboard/communications"]

function revalidateCommunicationPaths() {
  communicationPaths.forEach((path) => revalidatePath(path))
}

export async function createCommunicationLog(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const summary = ((formData.get("summary") as string) || "").trim()

  if (!summary) {
    return { error: "Summary is required." }
  }

  const loggedAt =
    ((formData.get("logged_at") as string) || "").trim() || new Date().toISOString()

  const { error } = await supabase.from("communication_logs").insert({
    household_id: ((formData.get("household_id") as string) || "").trim() || null,
    client_id: ((formData.get("client_id") as string) || "").trim() || null,
    owner_id: user?.id ?? null,
    channel: (((formData.get("channel") as string) || "").trim() || "email") as
      | "email"
      | "phone"
      | "whatsapp"
      | "meeting"
      | "sms",
    subject: ((formData.get("subject") as string) || "").trim() || null,
    summary,
    logged_at: loggedAt,
  })

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateCommunicationPaths()
  return { success: true }
}

export async function updateCommunicationLog(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get("id") as string
  const summary = ((formData.get("summary") as string) || "").trim()

  if (!summary) {
    return { error: "Summary is required." }
  }

  const loggedAt =
    ((formData.get("logged_at") as string) || "").trim() || new Date().toISOString()

  const { error } = await supabase
    .from("communication_logs")
    .update({
      household_id: ((formData.get("household_id") as string) || "").trim() || null,
      client_id: ((formData.get("client_id") as string) || "").trim() || null,
      channel: (((formData.get("channel") as string) || "").trim() || "email") as
        | "email"
        | "phone"
        | "whatsapp"
        | "meeting"
        | "sms",
      subject: ((formData.get("subject") as string) || "").trim() || null,
      summary,
      logged_at: loggedAt,
    })
    .eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateCommunicationPaths()
  return { success: true }
}

export async function deleteCommunicationLog(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("communication_logs").delete().eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateCommunicationPaths()
  return { success: true }
}
