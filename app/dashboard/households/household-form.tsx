"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { createHousehold, updateHousehold } from "./actions"

type HouseholdData = {
  id?: string
  name: string
  segment: string
  total_aum: number
  risk_profile: string | null
  status: string
  next_review_date: string | null
  notes: string | null
}

export function HouseholdForm({
  household,
  onClose,
}: {
  household?: HouseholdData
  onClose: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(household?.id)

  async function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = isEditing
        ? await updateHousehold(formData)
        : await createHousehold(formData)

      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {isEditing ? <input type="hidden" name="id" value={household?.id} /> : null}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Household Name</label>
        <Input
          name="name"
          required
          defaultValue={household?.name ?? ""}
          placeholder="e.g. Sharma Family Office"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Segment</label>
          <select
            name="segment"
            defaultValue={household?.segment ?? "HNWI"}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="HNWI">HNWI</option>
            <option value="Affluent">Affluent</option>
            <option value="Mass Affluent">Mass Affluent</option>
            <option value="Family Office">Family Office</option>
            <option value="Institutional">Institutional</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            defaultValue={household?.status ?? "active"}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="prospect">Prospect</option>
            <option value="review_due">Review Due</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Total AUM (INR)</label>
          <Input
            name="total_aum"
            type="number"
            min="0"
            step="0.01"
            defaultValue={household?.total_aum ?? 0}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Next Review Date</label>
          <Input
            name="next_review_date"
            type="date"
            defaultValue={household?.next_review_date ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Risk Profile</label>
        <select
          name="risk_profile"
          defaultValue={household?.risk_profile ?? ""}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Not set</option>
          <option value="Conservative">Conservative</option>
          <option value="Moderate">Moderate</option>
          <option value="Balanced">Balanced</option>
          <option value="Growth">Growth</option>
          <option value="Aggressive">Aggressive</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={household?.notes ?? ""}
          placeholder="Add review notes, preferences, or servicing context..."
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          {isPending
            ? "Saving..."
            : isEditing
              ? "Update Household"
              : "Create Household"}
        </Button>
      </div>
    </form>
  )
}
