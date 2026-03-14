"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from("tasks").insert({
    household_id: (formData.get("household_id") as string) || null,
    owner_id: user?.id ?? null,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    priority: formData.get("priority") as string,
    due_at: (formData.get("due_at") as string) || null,
    category: (formData.get("category") as string) || null,
    status: "todo",
  })

  if (error) return { error: formatSupabaseActionError(error) }
  revalidatePath("/dashboard/tasks")
  return { success: true }
}

export async function updateTaskStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("tasks").update({ status }).eq("id", id)
  if (error) return { error: formatSupabaseActionError(error) }
  revalidatePath("/dashboard/tasks")
  return { success: true }
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("tasks").delete().eq("id", id)
  if (error) return { error: formatSupabaseActionError(error) }
  revalidatePath("/dashboard/tasks")
  return { success: true }
}
