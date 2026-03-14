"use client"

import { useMemo, useState, useTransition } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
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
import { formatCompactCurrency } from "@/lib/format"

import {
  createOpportunity,
  deleteOpportunity,
  updateOpportunityStage,
} from "./actions"

type HouseholdOption = {
  id: string
  name: string
}

type OpportunityRow = {
  id: string
  title: string
  stage: string
  expected_value: number
  probability: number
  target_close_date: string | null
  notes: string | null
  households: { name: string } | null
}

const stages = [
  "qualifying",
  "proposal",
  "diligence",
  "commitment",
  "won",
  "lost",
] as const

const stageConfig: Record<string, { label: string; color: string }> = {
  qualifying: { label: "Qualifying", color: "bg-gray-100 text-gray-700" },
  proposal: { label: "Proposal", color: "bg-blue-50 text-blue-700" },
  diligence: { label: "Due Diligence", color: "bg-amber-50 text-amber-700" },
  commitment: { label: "Commitment", color: "bg-emerald-50 text-emerald-700" },
  won: { label: "Won", color: "bg-green-50 text-green-700" },
  lost: { label: "Lost", color: "bg-red-50 text-red-700" },
}

export function PipelineView({
  opportunities,
  households,
}: {
  opportunities: OpportunityRow[]
  households: HouseholdOption[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const grouped = useMemo(
    () =>
      Object.fromEntries(
        stages.map((stage) => [
          stage,
          opportunities.filter((opportunity) => opportunity.stage === stage),
        ]),
      ) as Record<(typeof stages)[number], OpportunityRow[]>,
    [opportunities],
  )

  const totalValue = opportunities.reduce(
    (sum, opportunity) => sum + Number(opportunity.expected_value),
    0,
  )
  const weightedValue = opportunities.reduce(
    (sum, opportunity) =>
      sum + Number(opportunity.expected_value) * (opportunity.probability / 100),
    0,
  )

  async function handleCreate(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await createOpportunity(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setAddOpen(false)
      }
    })
  }

  function handleStageChange(id: string, stage: string) {
    setError(null)

    startTransition(async () => {
      const result = await updateOpportunityStage(id, stage)

      if (result.error) {
        setError(result.error)
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this opportunity from the pipeline?")) {
      return
    }

    setError(null)
    setDeletingId(id)

    startTransition(async () => {
      const result = await deleteOpportunity(id)

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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Sales Pipeline
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {opportunities.length} opportunities &middot;{" "}
            {formatCompactCurrency(totalValue)} total &middot;{" "}
            {formatCompactCurrency(weightedValue)} weighted
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Add Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Opportunity</DialogTitle>
              <DialogDescription>
                Add a new revenue opportunity to the pipeline.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input name="title" required placeholder="e.g. Family office onboarding" />
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
                  <label className="text-sm font-medium text-gray-700">Stage</label>
                  <select
                    name="stage"
                    defaultValue="qualifying"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {stages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stageConfig[stage].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Value (INR)</label>
                  <Input name="expected_value" type="number" defaultValue="0" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Probability (%)</label>
                  <Input name="probability" type="number" min="0" max="100" defaultValue="25" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Target Close</label>
                  <Input name="target_close_date" type="date" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Capture context, blockers, and next steps..."
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
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
                  {isPending ? "Saving..." : "Create Opportunity"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {stages.map((stage) => {
          const config = stageConfig[stage]
          const items = grouped[stage]

          return (
            <Card key={stage} className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base text-gray-900">
                    {config.label}
                  </CardTitle>
                  <Badge variant="outline" className={`text-xs ${config.color}`}>
                    {items.length}
                  </Badge>
                </div>
                <CardDescription>
                  {formatCompactCurrency(
                    items.reduce(
                      (sum, opportunity) => sum + Number(opportunity.expected_value),
                      0,
                    ),
                  )}{" "}
                  total value
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.length > 0 ? (
                  items.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {opportunity.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {opportunity.households?.name ?? "No household"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(opportunity.id)}
                          disabled={deletingId === opportunity.id}
                          className="rounded-md p-1 text-gray-300 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCompactCurrency(Number(opportunity.expected_value))}
                        </span>
                        <span className="text-xs text-gray-500">
                          {opportunity.probability}% prob.
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${opportunity.probability}%` }}
                        />
                      </div>

                      {opportunity.target_close_date ? (
                        <p className="mt-2 text-xs text-gray-400">
                          Close by{" "}
                          {new Date(opportunity.target_close_date).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </p>
                      ) : null}

                      {opportunity.notes ? (
                        <p className="mt-2 text-xs leading-5 text-gray-500">
                          {opportunity.notes}
                        </p>
                      ) : null}

                      <div className="mt-3">
                        <select
                          value={opportunity.stage}
                          onChange={(event) =>
                            handleStageChange(opportunity.id, event.target.value)
                          }
                          className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-700"
                        >
                          {stages.map((stageOption) => (
                            <option key={stageOption} value={stageOption}>
                              {stageConfig[stageOption].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                    No opportunities in this stage.
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
