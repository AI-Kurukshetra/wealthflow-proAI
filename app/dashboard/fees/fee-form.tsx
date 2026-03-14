"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { createFeeSchedule, updateFeeSchedule } from "./actions"

type HouseholdOption = {
  id: string
  name: string
}

type FeeScheduleData = {
  id?: string
  household_id: string
  billing_frequency: string
  advisory_fee_bps: number
  last_invoice_date: string | null
  next_invoice_date: string | null
  collection_status: string
}

const billingFrequencies = ["monthly", "quarterly", "half_yearly", "annual"]
const collectionStatuses = ["pending", "invoiced", "collected", "overdue", "waived"]

export function FeeForm({
  households,
  feeSchedule,
  onClose,
}: {
  households: HouseholdOption[]
  feeSchedule?: FeeScheduleData
  onClose: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(feeSchedule?.id)

  async function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = isEditing
        ? await updateFeeSchedule(formData)
        : await createFeeSchedule(formData)

      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {isEditing ? <input type="hidden" name="id" value={feeSchedule?.id} /> : null}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Household</label>
        <select
          name="household_id"
          required
          defaultValue={feeSchedule?.household_id ?? ""}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select household...</option>
          {households.map((household) => (
            <option key={household.id} value={household.id}>
              {household.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Billing Frequency</label>
          <select
            name="billing_frequency"
            defaultValue={feeSchedule?.billing_frequency ?? "quarterly"}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {billingFrequencies.map((frequency) => (
              <option key={frequency} value={frequency}>
                {frequency.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Advisory Fee (bps)</label>
          <Input
            name="advisory_fee_bps"
            type="number"
            min="0"
            step="0.01"
            defaultValue={feeSchedule?.advisory_fee_bps ?? 0}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Last Invoice Date</label>
          <Input
            name="last_invoice_date"
            type="date"
            defaultValue={feeSchedule?.last_invoice_date ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Next Invoice Date</label>
          <Input
            name="next_invoice_date"
            type="date"
            defaultValue={feeSchedule?.next_invoice_date ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Collection Status</label>
        <select
          name="collection_status"
          defaultValue={feeSchedule?.collection_status ?? "pending"}
          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {collectionStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
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
          {isPending ? "Saving..." : isEditing ? "Update Fee Schedule" : "Create Fee Schedule"}
        </Button>
      </div>
    </form>
  )
}
