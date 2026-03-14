import "server-only"

import { createClient } from "@supabase/supabase-js"

import { getSupabaseEnv } from "@/lib/env"

const documentsBucketName = "documents"
const defaultDocumentExpirySeconds = 60 * 60
const bucketAlreadyExistsPattern = /already exists/i

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? null
}

function sanitizeFileName(fileName: string) {
  const parts = fileName.split(".")
  const extension = parts.length > 1 ? parts.pop() : null
  const baseName = parts.join(".") || fileName

  const sanitizedBaseName =
    baseName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "document"

  if (!extension) {
    return sanitizedBaseName
  }

  const sanitizedExtension = extension.replace(/[^a-z0-9]+/gi, "").toLowerCase()

  return sanitizedExtension
    ? `${sanitizedBaseName}.${sanitizedExtension}`
    : sanitizedBaseName
}

function createAdminClient() {
  const serviceRoleKey = getServiceRoleKey()

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required to manage document uploads.",
    )
  }

  const { url } = getSupabaseEnv()

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export function canManageDocumentsStorage() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getServiceRoleKey())
}

export async function ensureDocumentsBucket() {
  const admin = createAdminClient()
  const { error: bucketError } = await admin.storage.getBucket(documentsBucketName)

  if (!bucketError) {
    return { success: true as const }
  }

  const { error: createError } = await admin.storage.createBucket(
    documentsBucketName,
    {
      public: false,
      fileSizeLimit: "10MB",
    },
  )

  if (createError && !bucketAlreadyExistsPattern.test(createError.message)) {
    return { error: createError.message }
  }

  return { success: true as const }
}

export async function uploadDocumentFile({
  documentId,
  uploaderId,
  file,
}: {
  documentId: string
  uploaderId: string | null
  file: File
}) {
  if (!canManageDocumentsStorage()) {
    return {
      error:
        "Document uploads need SUPABASE_SERVICE_ROLE_KEY configured on the server.",
    }
  }

  const bucketResult = await ensureDocumentsBucket()

  if ("error" in bucketResult) {
    return { error: bucketResult.error }
  }

  const admin = createAdminClient()
  const storagePath = `${uploaderId ?? "shared"}/${documentId}/${sanitizeFileName(
    file.name,
  )}`
  const fileBytes = new Uint8Array(await file.arrayBuffer())

  const { error } = await admin.storage
    .from(documentsBucketName)
    .upload(storagePath, fileBytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    })

  if (error) {
    return { error: error.message }
  }

  return { data: { storagePath } }
}

export async function createDocumentSignedUrl(storagePath: string | null) {
  if (!storagePath || !canManageDocumentsStorage()) {
    return null
  }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from(documentsBucketName)
    .createSignedUrl(storagePath, defaultDocumentExpirySeconds)

  if (error) {
    return null
  }

  return data?.signedUrl ?? null
}

export async function deleteDocumentFile(storagePath: string | null) {
  if (!storagePath || !canManageDocumentsStorage()) {
    return
  }

  const admin = createAdminClient()

  await admin.storage.from(documentsBucketName).remove([storagePath])
}
