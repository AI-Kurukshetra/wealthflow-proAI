"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { createCommunicationLog, updateCommunicationLog } from "./actions"

type HouseholdOption = {
  id: string
  name: string
}

type ClientOption = {
  id: string
  first_name: string
  last_name: string
}

type CommunicationLogData = {
  id?: string
  household_id: string | null
  client_id: string | null
  channel: string
  subject: string | null
  summary: string
  logged_at: string
}

const channelOptions = ["email", "phone", "whatsapp", "meeting", "sms"]

function toDatetimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  const timezoneOffsetInMs = date.getTimezoneOffset() * 60 * 1000

  return new Date(date.getTime() - timezoneOffsetInMs).toISOString().slice(0, 16)
}

export function CommunicationForm({
  households,
  clients,
  communication,
  onClose,
}: {
  households: HouseholdOption[]
  clients: ClientOption[]
  communication?: CommunicationLogData
  onClose: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(communication?.id)

  async function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = isEditing
        ? await updateCommunicationLog(formData)
        : await createCommunicationLog(formData)

      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {isEditing ? (
        <input type="hidden" name="id" value={communication?.id} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Channel</label>
          <select
            name="channel"
            defaultValue={communication?.channel ?? "email"}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {channelOptions.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Logged At</label>
          <Input
            name="logged_at"
            type="datetime-local"
            defaultValue={
              communication?.logged_at
                ? toDatetimeLocalValue(communication.logged_at)
                : toDatetimeLocalValue(new Date().toISOString())
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Household</label>
          <select
            name="household_id"
            defaultValue={communication?.household_id ?? ""}
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
            defaultValue={communication?.client_id ?? ""}
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

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Subject</label>
        <Input
          name="subject"
          defaultValue={communication?.subject ?? ""}
          placeholder="Optional subject or conversation topic"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Summary</label>
        <textarea
          name="summary"
          rows={4}
          required
          defaultValue={communication?.summary ?? ""}
          placeholder="Capture the discussion, outcome, and follow-up..."
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
              ? "Update Log"
              : "Create Log"}
        </Button>
      </div>
    </form>
  )
}
