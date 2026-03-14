"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { formatSupabaseActionError } from "@/lib/supabase/schema"
import {
  deleteDocumentFile,
  uploadDocumentFile,
} from "@/lib/supabase/documents-storage"

const documentPaths = ["/dashboard/documents"]

function revalidateDocumentPaths() {
  documentPaths.forEach((path) => revalidatePath(path))
}

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." }
  }

  const documentId = crypto.randomUUID()
  const title = ((formData.get("title") as string) || "").trim() || file.name
  const documentType = ((formData.get("document_type") as string) || "").trim()
  const versionLabel =
    ((formData.get("version_label") as string) || "").trim() || "v1"

  if (!documentType) {
    return { error: "Document type is required." }
  }

  const uploadResult = await uploadDocumentFile({
    documentId,
    uploaderId: user?.id ?? null,
    file,
  })

  if ("error" in uploadResult) {
    return { error: uploadResult.error }
  }

  const { error } = await supabase.from("documents").insert({
    id: documentId,
    household_id: ((formData.get("household_id") as string) || "").trim() || null,
    client_id: ((formData.get("client_id") as string) || "").trim() || null,
    uploaded_by: user?.id ?? null,
    title,
    document_type: documentType,
    classification:
      ((formData.get("classification") as string) || "").trim() || null,
    storage_path: uploadResult.data.storagePath,
    version_label: versionLabel,
    signed: formData.get("signed") === "on",
  })

  if (error) {
    await deleteDocumentFile(uploadResult.data.storagePath)
    return { error: formatSupabaseActionError(error) }
  }

  revalidateDocumentPaths()
  return { success: true }
}

export async function deleteDocumentRecord(id: string) {
  const supabase = await createClient()
  const { data: document, error: fetchError } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .single()

  if (fetchError) {
    return { error: formatSupabaseActionError(fetchError) }
  }

  const { error: deleteError } = await supabase.from("documents").delete().eq("id", id)

  if (deleteError) {
    return { error: formatSupabaseActionError(deleteError) }
  }

  await deleteDocumentFile(document.storage_path)
  revalidateDocumentPaths()

  return { success: true }
}
