"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient_, updateClient } from "./actions"

type Household = { id: string; name: string }
type ClientData = {
  id?: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  city: string | null
  pan_number?: string | null
  household_id?: string
  kyc_status?: string
  onboarding_stage?: string
}

export function ClientForm({
  households,
  client,
  onClose,
}: {
  households: Household[]
  client?: ClientData
  onClose: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEditing = !!client?.id

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = isEditing
        ? await updateClient(formData)
        : await createClient_(formData)

      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {isEditing && <input type="hidden" name="id" value={client.id} />}

      {!isEditing && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Household</label>
          <select
            name="household_id"
            required
            defaultValue={client?.household_id ?? ""}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select household...</option>
            {households.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">First Name</label>
          <Input name="first_name" required defaultValue={client?.first_name ?? ""} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <Input name="last_name" required defaultValue={client?.last_name ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input name="email" type="email" defaultValue={client?.email ?? ""} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <Input name="phone" defaultValue={client?.phone ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">City</label>
          <Input name="city" defaultValue={client?.city ?? ""} />
        </div>
        {!isEditing && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">PAN Number</label>
            <Input name="pan_number" defaultValue={client?.pan_number ?? ""} placeholder="ABCDE1234F" />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">KYC Status</label>
            <select
              name="kyc_status"
              defaultValue={client?.kyc_status ?? "pending"}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Onboarding Stage</label>
            <select
              name="onboarding_stage"
              defaultValue={client?.onboarding_stage ?? "prospect"}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="prospect">Prospect</option>
              <option value="onboarding">Onboarding</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isPending} className="bg-blue-600 text-white hover:bg-blue-700">
          {isPending ? "Saving..." : isEditing ? "Update Client" : "Add Client"}
        </Button>
      </div>
    </form>
  )
}
