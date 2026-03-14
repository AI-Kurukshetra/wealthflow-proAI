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
import { formatCompactCurrency } from "@/lib/format"

import { deleteGoal } from "./actions"
import { GoalForm } from "./goal-form"

type HouseholdOption = {
  id: string
  name: string
}

type GoalRow = {
  id: string
  household_id: string
  title: string
  target_amount: number
  current_amount: number
  target_date: string | null
  priority: string
  status: string
  households: { name: string } | null
}

const goalFilters = ["all", "on_track", "at_risk", "off_track", "achieved", "paused"] as const

const statusTone: Record<string, string> = {
  on_track: "bg-emerald-50 text-emerald-700 border-emerald-200",
  at_risk: "bg-amber-50 text-amber-700 border-amber-200",
  off_track: "bg-red-50 text-red-700 border-red-200",
  achieved: "bg-blue-50 text-blue-700 border-blue-200",
  paused: "bg-gray-50 text-gray-600 border-gray-200",
}

const priorityTone: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-gray-50 text-gray-600 border-gray-200",
}

function getProgressPercent(goal: GoalRow) {
  if (goal.target_amount <= 0) {
    return 0
  }

  return Math.max(
    0,
    Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100)),
  )
}

export function GoalsView({
  goals,
  households,
}: {
  goals: GoalRow[]
  households: HouseholdOption[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<GoalRow | null>(null)
  const [filter, setFilter] = useState<(typeof goalFilters)[number]>("all")
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filteredGoals =
    filter === "all" ? goals : goals.filter((goal) => goal.status === filter)

  const summary = useMemo(() => {
    const achieved = goals.filter((goal) => goal.status === "achieved").length
    const onTrack = goals.filter((goal) => goal.status === "on_track").length
    const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.target_amount), 0)

    return { achieved, onTrack, totalTarget }
  }, [goals])

  function handleDelete(id: string) {
    if (!confirm("Delete this goal?")) {
      return
    }

    setError(null)
    setDeletingId(id)

    startTransition(async () => {
      const result = await deleteGoal(id)

      if (result.error) {
        setError(result.error)
      }

      setDeletingId(null)
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Goals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track household targets, progress, and planning priorities.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Goal</DialogTitle>
              <DialogDescription>
                Add a financial objective for a household.
              </DialogDescription>
            </DialogHeader>
            <GoalForm households={households} onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={Boolean(editGoal)}
        onOpenChange={(open) => !open && setEditGoal(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Update progress, priority, or status.
            </DialogDescription>
          </DialogHeader>
          {editGoal ? (
            <GoalForm households={households} goal={editGoal} onClose={() => setEditGoal(null)} />
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Total Goals</p>
            <CardTitle className="text-3xl text-gray-900">{goals.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">On Track</p>
            <CardTitle className="text-3xl text-gray-900">{summary.onTrack}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Achieved</p>
            <CardTitle className="text-3xl text-gray-900">{summary.achieved}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Target Corpus</p>
            <CardTitle className="text-3xl text-gray-900">
              {formatCompactCurrency(summary.totalTarget)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {goalFilters.map((status) => (
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
            {status === "all" ? "All" : status.replace("_", " ")} (
            {status === "all"
              ? goals.length
              : goals.filter((goal) => goal.status === status).length}
            )
          </button>
        ))}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {filteredGoals.length > 0 ? (
        <div className="space-y-3">
          {filteredGoals.map((goal) => {
            const progressPercent = getProgressPercent(goal)
            const targetRemaining = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount))

            return (
              <div key={goal.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-gray-900">{goal.title}</p>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${statusTone[goal.status] ?? ""}`}
                      >
                        {goal.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${priorityTone[goal.priority] ?? ""}`}
                      >
                        {goal.priority}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>{goal.households?.name ?? "-"}</span>
                      <span>Target {formatCompactCurrency(Number(goal.target_amount))}</span>
                      <span>Current {formatCompactCurrency(Number(goal.current_amount))}</span>
                      <span>Remaining {formatCompactCurrency(targetRemaining)}</span>
                      {goal.target_date ? (
                        <span>
                          Due{" "}
                          {new Date(goal.target_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                        <span>Progress</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditGoal(goal)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <PencilIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(goal.id)}
                      disabled={deletingId === goal.id}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-gray-500">
            No goals found. Add one to start tracking planning outcomes.
          </p>
        </div>
      )}
    </div>
  )
}
