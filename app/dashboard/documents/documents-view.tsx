"use client"

import { useMemo, useState, useTransition } from "react"
import { ExternalLinkIcon, FileTextIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { deleteDocumentRecord, uploadDocument } from "./actions"

type HouseholdOption = {
  id: string
  name: string
}

type ClientOption = {
  id: string
  first_name: string
  last_name: string
}

type DocumentRow = {
  id: string
  title: string
  document_type: string
  classification: string | null
  version_label: string
  signed: boolean
  uploaded_at: string
  storage_path: string | null
  households: { name: string } | null
  clients: { first_name: string; last_name: string } | null
  download_url: string | null
}

const documentTypes = [
  "KYC Document",
  "Investment Policy Statement",
  "Portfolio Review",
  "Fee Disclosure",
  "Mandate Form",
  "Risk Profile Assessment",
  "Signed Agreement",
  "Tax Statement",
  "Other",
]

const classificationTone: Record<string, string> = {
  confidential: "bg-red-50 text-red-700 border-red-200",
  internal: "bg-amber-50 text-amber-700 border-amber-200",
  client_shared: "bg-blue-50 text-blue-700 border-blue-200",
  archive: "bg-gray-50 text-gray-600 border-gray-200",
}

function getClientLabel(client: DocumentRow["clients"]) {
  if (!client) {
    return "-"
  }

  return `${client.first_name} ${client.last_name}`.trim()
}

export function DocumentsView({
  documents,
  households,
  clients,
}: {
  documents: DocumentRow[]
  households: HouseholdOption[]
  clients: ClientOption[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "signed" | "unsigned">("all")
  const [classificationFilter, setClassificationFilter] = useState<string>("all")
  const [isPending, startTransition] = useTransition()

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const signedMatches =
        filter === "all" ||
        (filter === "signed" && document.signed) ||
        (filter === "unsigned" && !document.signed)
      const classificationMatches =
        classificationFilter === "all" ||
        (document.classification ?? "unclassified") === classificationFilter

      return signedMatches && classificationMatches
    })
  }, [classificationFilter, documents, filter])

  const summary = useMemo(() => {
    const signedCount = documents.filter((document) => document.signed).length
    const linkedToHousehold = documents.filter((document) => document.households).length
    const confidentialCount = documents.filter(
      (document) => document.classification === "confidential",
    ).length

    return {
      signedCount,
      linkedToHousehold,
      confidentialCount,
    }
  }, [documents])

  async function handleUpload(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await uploadDocument(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setAddOpen(false)
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this document record and its file?")) {
      return
    }

    setError(null)
    setDeletingId(id)

    startTransition(async () => {
      const result = await deleteDocumentRecord(id)

      if (result?.error) {
        setError(result.error)
      }

      setDeletingId(null)
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Documents
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Secure client records, signed agreements, and operational files.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Store a file and map it to a household or client record.
              </DialogDescription>
            </DialogHeader>
            <form action={handleUpload} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">File</label>
                <Input name="file" type="file" required className="h-10" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input name="title" placeholder="e.g. FY25 Portfolio Review Pack" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Document Type</label>
                  <select
                    name="document_type"
                    defaultValue="KYC Document"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {documentTypes.map((documentType) => (
                      <option key={documentType} value={documentType}>
                        {documentType}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Classification</label>
                  <select
                    name="classification"
                    defaultValue="confidential"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="confidential">Confidential</option>
                    <option value="client_shared">Client Shared</option>
                    <option value="internal">Internal</option>
                    <option value="archive">Archive</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Household</label>
                  <select
                    name="household_id"
                    defaultValue=""
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {households.map((household) => (
                      <option key={household.id} value={household.id}>
                        {household.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Client</label>
                  <select
                    name="client_id"
                    defaultValue=""
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Version Label</label>
                  <Input name="version_label" defaultValue="v1" />
                </div>
                <label className="flex items-center gap-2 pt-7 text-sm text-gray-700">
                  <input
                    name="signed"
                    type="checkbox"
                    className="size-4 rounded border-gray-300"
                  />
                  Mark as signed / executed
                </label>
              </div>

              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isPending ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Documents</CardDescription>
            <CardTitle className="text-3xl text-gray-900">{documents.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Signed Documents</CardDescription>
            <CardTitle className="text-3xl text-gray-900">
              {summary.signedCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Linked to Households</CardDescription>
            <CardTitle className="text-3xl text-gray-900">
              {summary.linkedToHousehold}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Confidential</CardDescription>
            <CardTitle className="text-3xl text-gray-900">
              {summary.confidentialCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { id: "all", label: "All" },
          { id: "signed", label: "Signed" },
          { id: "unsigned", label: "Unsigned" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id as "all" | "signed" | "unsigned")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === item.id
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </button>
        ))}

        <select
          value={classificationFilter}
          onChange={(event) => setClassificationFilter(event.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600"
        >
          <option value="all">All classifications</option>
          <option value="confidential">Confidential</option>
          <option value="client_shared">Client Shared</option>
          <option value="internal">Internal</option>
          <option value="archive">Archive</option>
          <option value="unclassified">Unclassified</option>
        </select>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {filteredDocuments.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Household</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <FileTextIcon className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{document.title}</p>
                        <p className="text-xs text-gray-400">{document.document_type}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {document.households?.name ?? "-"}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {getClientLabel(document.clients)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${
                        classificationTone[document.classification ?? ""] ?? ""
                      }`}
                    >
                      {(document.classification ?? "unclassified").replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-900">
                        {document.version_label}
                      </span>
                      <span
                        className={`text-xs ${
                          document.signed ? "text-emerald-600" : "text-gray-400"
                        }`}
                      >
                        {document.signed ? "Signed" : "Unsigned"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(document.uploaded_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {document.download_url ? (
                        <a
                          href={document.download_url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <ExternalLinkIcon className="size-4" />
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDelete(document.id)}
                        disabled={deletingId === document.id}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2Icon className="size-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-gray-500">
            No documents found. Upload a file to start building the document vault.
          </p>
        </div>
      )}
    </div>
  )
}
