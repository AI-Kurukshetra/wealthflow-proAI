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

import { deleteFeeSchedule } from "./actions"
import { FeeForm } from "./fee-form"

type HouseholdOption = {
  id: string
  name: string
}

type FeeScheduleRow = {
  id: string
  household_id: string
  billing_frequency: string
  advisory_fee_bps: number
  last_invoice_date: string | null
  next_invoice_date: string | null
  collection_status: string
  households: { name: string } | null
}

const feeFilters = ["all", "pending", "invoiced", "collected", "overdue", "waived"] as const

const statusTone: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  invoiced: "bg-blue-50 text-blue-700 border-blue-200",
  collected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
  waived: "bg-gray-50 text-gray-600 border-gray-200",
}

export function FeesView({
  feeSchedules,
  households,
}: {
  feeSchedules: FeeScheduleRow[]
  households: HouseholdOption[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editFeeSchedule, setEditFeeSchedule] = useState<FeeScheduleRow | null>(null)
  const [filter, setFilter] = useState<(typeof feeFilters)[number]>("all")
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filteredSchedules =
    filter === "all"
      ? feeSchedules
      : feeSchedules.filter((feeSchedule) => feeSchedule.collection_status === filter)

  const summary = useMemo(() => {
    const avgFeeBps =
      feeSchedules.length > 0
        ? Math.round(
            feeSchedules.reduce(
              (sum, feeSchedule) => sum + Number(feeSchedule.advisory_fee_bps),
              0,
            ) / feeSchedules.length,
          )
        : 0
    const overdueCount = feeSchedules.filter(
      (feeSchedule) => feeSchedule.collection_status === "overdue",
    ).length
    const collectedCount = feeSchedules.filter(
      (feeSchedule) => feeSchedule.collection_status === "collected",
    ).length

    return { avgFeeBps, overdueCount, collectedCount }
  }, [feeSchedules])

  function handleDelete(id: string) {
    if (!confirm("Delete this fee schedule?")) {
      return
    }

    setError(null)
    setDeletingId(id)

    startTransition(async () => {
      const result = await deleteFeeSchedule(id)

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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Fees</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage advisory fee schedules, billing cadence, and invoice status.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Add Fee Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Fee Schedule</DialogTitle>
              <DialogDescription>
                Add billing details for a household.
              </DialogDescription>
            </DialogHeader>
            <FeeForm households={households} onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={Boolean(editFeeSchedule)}
        onOpenChange={(open) => !open && setEditFeeSchedule(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Fee Schedule</DialogTitle>
            <DialogDescription>
              Update billing cadence, fee bps, or collection status.
            </DialogDescription>
          </DialogHeader>
          {editFeeSchedule ? (
            <FeeForm
              households={households}
              feeSchedule={editFeeSchedule}
              onClose={() => setEditFeeSchedule(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Total Schedules</p>
            <CardTitle className="text-3xl text-gray-900">
              {feeSchedules.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Average Fee</p>
            <CardTitle className="text-3xl text-gray-900">
              {summary.avgFeeBps} bps
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Collected</p>
            <CardTitle className="text-3xl text-gray-900">
              {summary.collectedCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Overdue</p>
            <CardTitle className="text-3xl text-gray-900">
              {summary.overdueCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {feeFilters.map((status) => (
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
              ? feeSchedules.length
              : feeSchedules.filter((feeSchedule) => feeSchedule.collection_status === status).length}
            )
          </button>
        ))}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {filteredSchedules.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Household</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Last Invoice</TableHead>
                <TableHead>Next Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((feeSchedule) => (
                <TableRow key={feeSchedule.id}>
                  <TableCell className="font-medium text-gray-900">
                    {feeSchedule.households?.name ?? "-"}
                  </TableCell>
                  <TableCell className="capitalize text-gray-600">
                    {feeSchedule.billing_frequency.replace("_", " ")}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {Number(feeSchedule.advisory_fee_bps).toFixed(0)} bps
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {feeSchedule.last_invoice_date
                      ? new Date(feeSchedule.last_invoice_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {feeSchedule.next_invoice_date
                      ? new Date(feeSchedule.next_invoice_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${statusTone[feeSchedule.collection_status] ?? ""}`}
                    >
                      {feeSchedule.collection_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditFeeSchedule(feeSchedule)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <PencilIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(feeSchedule.id)}
                        disabled={deletingId === feeSchedule.id}
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
            No fee schedules found. Add one to start tracking advisory billing.
          </p>
        </div>
      )}
    </div>
  )
}
