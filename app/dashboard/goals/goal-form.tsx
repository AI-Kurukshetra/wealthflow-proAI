"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { createGoal, updateGoal } from "./actions"

type HouseholdOption = {
  id: string
  name: string
}

type GoalData = {
  id?: string
  household_id: string
  title: string
  target_amount: number
  current_amount: number
  target_date: string | null
  priority: string
  status: string
}

const priorityOptions = ["high", "medium", "low"]
const statusOptions = ["on_track", "at_risk", "off_track", "achieved", "paused"]

export function GoalForm({
  households,
  goal,
  onClose,
}: {
  households: HouseholdOption[]
  goal?: GoalData
  onClose: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(goal?.id)

  async function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = isEditing ? await updateGoal(formData) : await createGoal(formData)

      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {isEditing ? <input type="hidden" name="id" value={goal?.id} /> : null}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Household</label>
        <select
          name="household_id"
          required
          defaultValue={goal?.household_id ?? ""}
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

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Goal Title</label>
        <Input
          name="title"
          required
          defaultValue={goal?.title ?? ""}
          placeholder="e.g. Retirement corpus by 2035"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Target Amount (INR)</label>
          <Input
            name="target_amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={goal?.target_amount ?? 0}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Current Amount (INR)</label>
          <Input
            name="current_amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={goal?.current_amount ?? 0}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Priority</label>
          <select
            name="priority"
            defaultValue={goal?.priority ?? "medium"}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            defaultValue={goal?.status ?? "on_track"}
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
        <label className="text-sm font-medium text-gray-700">Target Date</label>
        <Input name="target_date" type="date" defaultValue={goal?.target_date ?? ""} />
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
          {isPending ? "Saving..." : isEditing ? "Update Goal" : "Create Goal"}
        </Button>
      </div>
    </form>
  )
}
