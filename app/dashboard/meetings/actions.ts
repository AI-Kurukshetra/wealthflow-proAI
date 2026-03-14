"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"

const meetingPaths = ["/dashboard/meetings"]

function revalidateMeetingPaths() {
  meetingPaths.forEach((path) => revalidatePath(path))
}

export async function createMeeting(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const subject = ((formData.get("subject") as string) || "").trim()
  const startsAt = ((formData.get("starts_at") as string) || "").trim()

  if (!subject) {
    return { error: "Meeting subject is required." }
  }

  if (!startsAt) {
    return { error: "Start time is required." }
  }

  const { error } = await supabase.from("meetings").insert({
    household_id: ((formData.get("household_id") as string) || "").trim() || null,
    owner_id: user?.id ?? null,
    subject,
    meeting_type:
      ((formData.get("meeting_type") as string) || "").trim() || "review",
    location: ((formData.get("location") as string) || "").trim() || null,
    notes: ((formData.get("notes") as string) || "").trim() || null,
    starts_at: startsAt,
    ends_at: ((formData.get("ends_at") as string) || "").trim() || null,
  })

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateMeetingPaths()
  return { success: true }
}

export async function updateMeeting(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get("id") as string
  const subject = ((formData.get("subject") as string) || "").trim()
  const startsAt = ((formData.get("starts_at") as string) || "").trim()

  if (!subject) {
    return { error: "Meeting subject is required." }
  }

  if (!startsAt) {
    return { error: "Start time is required." }
  }

  const { error } = await supabase
    .from("meetings")
    .update({
      household_id:
        ((formData.get("household_id") as string) || "").trim() || null,
      subject,
      meeting_type:
        ((formData.get("meeting_type") as string) || "").trim() || "review",
      location: ((formData.get("location") as string) || "").trim() || null,
      notes: ((formData.get("notes") as string) || "").trim() || null,
      starts_at: startsAt,
      ends_at: ((formData.get("ends_at") as string) || "").trim() || null,
    })
    .eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateMeetingPaths()
  return { success: true }
}

export async function deleteMeeting(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("meetings").delete().eq("id", id)

  if (error) {
    return { error: formatSupabaseActionError(error) }
  }

  revalidateMeetingPaths()
  return { success: true }
}
