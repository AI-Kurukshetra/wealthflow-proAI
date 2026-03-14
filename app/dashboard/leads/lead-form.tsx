"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { createLead, updateLead } from "./actions"

type LeadData = {
  id?: string
  company_name: string | null
  contact_name: string
  email: string | null
  phone: string | null
  source: string | null
  status: string
  score: number
}

const sourceOptions = [
  "referral",
  "digital",
  "event",
  "partner",
  "cold_outreach",
  "existing_client",
  "other",
]

const statusOptions = [
  "new",
  "contacted",
  "qualified",
  "nurturing",
  "converted",
  "lost",
]

export function LeadForm({
  lead,
  onClose,
}: {
  lead?: LeadData
  onClose: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(lead?.id)

  async function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = isEditing
        ? await updateLead(formData)
        : await createLead(formData)

      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {isEditing ? <input type="hidden" name="id" value={lead?.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Contact Name
          </label>
          <Input
            name="contact_name"
            required
            defaultValue={lead?.contact_name ?? ""}
            placeholder="e.g. Anika Mehta"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Company</label>
          <Input
            name="company_name"
            defaultValue={lead?.company_name ?? ""}
            placeholder="e.g. Mehta Family Office"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input
            name="email"
            type="email"
            defaultValue={lead?.email ?? ""}
            placeholder="anika@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <Input
            name="phone"
            defaultValue={lead?.phone ?? ""}
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Source</label>
          <select
            name="source"
            defaultValue={lead?.source ?? "referral"}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {sourceOptions.map((source) => (
              <option key={source} value={source}>
                {source.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            defaultValue={lead?.status ?? "new"}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Lead Score</label>
        <Input
          name="score"
          type="number"
          min="0"
          max="100"
          defaultValue={lead?.score ?? 50}
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {isPending ? "Saving..." : isEditing ? "Update Lead" : "Create Lead"}
        </Button>
      </div>
    </form>
  )
}
