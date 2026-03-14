import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import type { Client, Document, Household } from "@/lib/database.types"
import {
  canManageDocumentsStorage,
  createDocumentSignedUrl,
} from "@/lib/supabase/documents-storage"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"

import { DocumentsView } from "./documents-view"

export const metadata = { title: "Documents" }

type DocumentWithRelations = Document & {
  households: Pick<Household, "name"> | null
  clients: Pick<Client, "first_name" | "last_name"> | null
  download_url: string | null
}

export default async function DocumentsPage() {
  const supabase = await createClient()

  const [
    { data: documents, error: documentsError },
    { data: households, error: householdsError },
    { data: clients, error: clientsError },
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("*, households(name), clients(first_name, last_name)")
      .order("uploaded_at", { ascending: false }),
    supabase.from("households").select("id, name").order("name"),
    supabase.from("clients").select("id, first_name, last_name").order("first_name"),
  ])

  if (hasMissingSchemaError([documentsError, householdsError, clientsError])) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the documents workspace." />
    )
  }

  const documentsWithUrls = await Promise.all(
    ((documents ?? []) as Omit<DocumentWithRelations, "download_url">[]).map(
      async (document) => ({
        ...document,
        download_url: canManageDocumentsStorage()
          ? await createDocumentSignedUrl(document.storage_path)
          : null,
      }),
    ),
  )

  return (
    <DocumentsView
      documents={documentsWithUrls}
      households={((households ?? []) as Pick<Household, "id" | "name">[])}
      clients={(
        (clients ?? []) as Pick<Client, "id" | "first_name" | "last_name">[]
      )}
    />
  )
}
