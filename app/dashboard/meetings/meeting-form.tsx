"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { createMeeting, updateMeeting } from "./actions"

type HouseholdOption = {
  id: string
  name: string
}

type MeetingData = {
  id?: string
  household_id: string | null
  subject: string
  meeting_type: string
  location: string | null
  notes: string | null
  starts_at: string
  ends_at: string | null
}

const meetingTypes = [
  "review",
  "onboarding",
  "planning",
  "check_in",
  "compliance",
  "portfolio_discussion",
]

function toDatetimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  const timezoneOffsetInMs = date.getTimezoneOffset() * 60 * 1000

  return new Date(date.getTime() - timezoneOffsetInMs).toISOString().slice(0, 16)
}

export function MeetingForm({
  households,
  meeting,
  onClose,
}: {
  households: HouseholdOption[]
  meeting?: MeetingData
  onClose: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(meeting?.id)

  async function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = isEditing
        ? await updateMeeting(formData)
        : await createMeeting(formData)

      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {isEditing ? <input type="hidden" name="id" value={meeting?.id} /> : null}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Subject</label>
        <Input
          name="subject"
          required
          defaultValue={meeting?.subject ?? ""}
          placeholder="e.g. Q1 portfolio review"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Household</label>
          <select
            name="household_id"
            defaultValue={meeting?.household_id ?? ""}
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
          <label className="text-sm font-medium text-gray-700">Meeting Type</label>
          <select
            name="meeting_type"
            defaultValue={meeting?.meeting_type ?? "review"}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {meetingTypes.map((meetingType) => (
              <option key={meetingType} value={meetingType}>
                {meetingType.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Starts At</label>
          <Input
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocalValue(meeting?.starts_at)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Ends At</label>
          <Input
            name="ends_at"
            type="datetime-local"
            defaultValue={toDatetimeLocalValue(meeting?.ends_at)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Location</label>
        <Input
          name="location"
          defaultValue={meeting?.location ?? ""}
          placeholder="Office / Zoom / Client site"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={meeting?.notes ?? ""}
          placeholder="Agenda, attendees, and preparation notes..."
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
              ? "Update Meeting"
              : "Create Meeting"}
        </Button>
      </div>
    </form>
  )
}
