"use client"

import { useMemo, useState, useTransition } from "react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { convertLeadToOpportunity, deleteLead } from "./actions"
import { LeadForm } from "./lead-form"

type LeadRow = {
  id: string
  company_name: string | null
  contact_name: string
  email: string | null
  phone: string | null
  source: string | null
  status: string
  score: number
  created_at: string
  updated_at: string
  opportunity: { id: string; stage: string } | null
}

const statusTone: Record<string, string> = {
  new: "bg-gray-50 text-gray-700 border-gray-200",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  qualified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  nurturing: "bg-amber-50 text-amber-700 border-amber-200",
  converted: "bg-violet-50 text-violet-700 border-violet-200",
  lost: "bg-red-50 text-red-700 border-red-200",
}

const leadStatusFilters = [
  "all",
  "new",
  "contacted",
  "qualified",
  "nurturing",
  "converted",
  "lost",
] as const

export function LeadsView({ leads }: { leads: LeadRow[] }) {
  const [addOpen, setAddOpen] = useState(false)
  const [editLead, setEditLead] = useState<LeadRow | null>(null)
  const [filter, setFilter] = useState<(typeof leadStatusFilters)[number]>("all")
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [convertingId, setConvertingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filteredLeads =
    filter === "all" ? leads : leads.filter((lead) => lead.status === filter)

  const summary = useMemo(() => {
    const converted = leads.filter((lead) => lead.status === "converted").length
    const qualified = leads.filter((lead) => lead.status === "qualified").length
    const avgScore =
      leads.length > 0
        ? Math.round(
            leads.reduce((sum, lead) => sum + Number(lead.score), 0) / leads.length,
          )
        : 0

    return { converted, qualified, avgScore }
  }, [leads])

  function handleDelete(id: string) {
    if (!confirm("Delete this lead?")) {
      return
    }

    setError(null)
    setDeletingId(id)

    startTransition(async () => {
      const result = await deleteLead(id)

      if (result.error) {
        setError(result.error)
      }

      setDeletingId(null)
    })
  }

  function handleConvert(id: string) {
    setError(null)
    setConvertingId(id)

    startTransition(async () => {
      const result = await convertLeadToOpportunity(id)

      if (result.error) {
        setError(result.error)
      }

      setConvertingId(null)
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Leads
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track prospects, qualification, and pipeline handoff.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Lead</DialogTitle>
              <DialogDescription>
                Capture a new prospect before qualification.
              </DialogDescription>
            </DialogHeader>
            <LeadForm onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={Boolean(editLead)}
        onOpenChange={(open) => !open && setEditLead(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update prospect details, source, and qualification.
            </DialogDescription>
          </DialogHeader>
          {editLead ? (
            <LeadForm lead={editLead} onClose={() => setEditLead(null)} />
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Total Leads</p>
            <CardTitle className="text-3xl text-gray-900">{leads.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Qualified</p>
            <CardTitle className="text-3xl text-gray-900">
              {summary.qualified}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Converted</p>
            <CardTitle className="text-3xl text-gray-900">
              {summary.converted}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Average Score</p>
            <CardTitle className="text-3xl text-gray-900">
              {summary.avgScore}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {leadStatusFilters.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === status
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {status === "all" ? "All" : status} (
            {status === "all"
              ? leads.length
              : leads.filter((lead) => lead.status === status).length}
            )
          </button>
        ))}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {filteredLeads.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Pipeline</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-48">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">
                        {lead.contact_name}
                      </p>
                      {lead.email ? (
                        <p className="text-xs text-gray-500">{lead.email}</p>
                      ) : null}
                      {lead.phone ? (
                        <p className="text-xs text-gray-400">{lead.phone}</p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {lead.company_name ?? "-"}
                  </TableCell>
                  <TableCell className="capitalize text-gray-600">
                    {(lead.source ?? "-").replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${
                        statusTone[lead.status] ?? ""
                      }`}
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {lead.score}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {lead.opportunity ? (
                      <Badge variant="outline" className="text-xs capitalize">
                        {lead.opportunity.stage}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(lead.updated_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {!lead.opportunity && lead.status !== "converted" ? (
                        <button
                          type="button"
                          onClick={() => handleConvert(lead.id)}
                          disabled={convertingId === lead.id}
                          className="rounded-md border border-blue-200 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
                        >
                          {convertingId === lead.id ? "Converting..." : "Convert"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setEditLead(lead)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <PencilIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(lead.id)}
                        disabled={deletingId === lead.id}
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
            No leads found. Add a prospect to start filling the pipeline.
          </p>
        </div>
      )}
    </div>
  )
}
