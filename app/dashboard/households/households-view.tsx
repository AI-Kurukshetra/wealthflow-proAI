"use client"

import { useMemo, useState, useTransition } from "react"
import { PencilIcon, PlusIcon, Trash2Icon, WalletIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCompactCurrency } from "@/lib/format"

import { deleteHousehold } from "./actions"
import { HouseholdForm } from "./household-form"

type HouseholdRow = {
  id: string
  name: string
  segment: string
  total_aum: number
  risk_profile: string | null
  status: string
  next_review_date: string | null
  notes: string | null
  advisor_id: string | null
  created_at: string
}

const statusTone: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  prospect: "bg-blue-50 text-blue-700 border-blue-200",
  review_due: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-gray-50 text-gray-600 border-gray-200",
}

function isReviewDue(nextReviewDate: string | null) {
  if (!nextReviewDate) {
    return false
  }

  const reviewDate = new Date(nextReviewDate)
  const today = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  return reviewDate >= today && reviewDate <= thirtyDaysFromNow
}

export function HouseholdsView({ households }: { households: HouseholdRow[] }) {
  const [addOpen, setAddOpen] = useState(false)
  const [editHousehold, setEditHousehold] = useState<HouseholdRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const summary = useMemo(() => {
    const totalAum = households.reduce(
      (sum, household) => sum + Number(household.total_aum),
      0,
    )
    const activeCount = households.filter(
      (household) => household.status === "active",
    ).length
    const reviewDueCount = households.filter((household) =>
      isReviewDue(household.next_review_date),
    ).length
    const averageAum =
      households.length > 0 ? Math.round(totalAum / households.length) : 0

    return { totalAum, activeCount, reviewDueCount, averageAum }
  }, [households])

  function handleDelete(id: string) {
    if (
      !confirm(
        "Delete this household? Linked clients, portfolios, tasks, and opportunities may also be removed.",
      )
    ) {
      return
    }

    setDeletingId(id)
    startTransition(async () => {
      await deleteHousehold(id)
      setDeletingId(null)
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Households
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Core client groupings that power portfolios, tasks, compliance, and
            pipeline.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Add Household
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Household</DialogTitle>
              <DialogDescription>
                Add a new relationship group before onboarding clients or
                portfolios.
              </DialogDescription>
            </DialogHeader>
            <HouseholdForm onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={Boolean(editHousehold)}
        onOpenChange={(open) => !open && setEditHousehold(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Household</DialogTitle>
            <DialogDescription>
              Update servicing, segmentation, and review details.
            </DialogDescription>
          </DialogHeader>
          {editHousehold ? (
            <HouseholdForm
              household={editHousehold}
              onClose={() => setEditHousehold(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total Households</CardDescription>
            <CardTitle className="text-3xl text-gray-900">
              {households.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Total AUM</CardDescription>
            <CardTitle className="text-3xl text-gray-900">
              {formatCompactCurrency(summary.totalAum)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Active Relationships</CardDescription>
            <CardTitle className="text-3xl text-gray-900">
              {summary.activeCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Reviews Due in 30 Days</CardDescription>
            <CardTitle className="text-3xl text-gray-900">
              {summary.reviewDueCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {households.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Household</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>AUM</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Review</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {households.map((household) => (
                <TableRow key={household.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <WalletIcon className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {household.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Added{" "}
                          {new Date(household.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {household.segment}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {formatCompactCurrency(Number(household.total_aum))}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {household.risk_profile ?? "Not set"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${
                        statusTone[household.status] ?? ""
                      }`}
                    >
                      {household.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {household.next_review_date
                      ? new Date(household.next_review_date).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-xs text-sm text-gray-500">
                    {household.notes ? (
                      <span className="line-clamp-2">{household.notes}</span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditHousehold(household)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <PencilIcon className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(household.id)}
                        disabled={deletingId === household.id}
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
            No households yet. Create your first relationship group to unlock
            clients, portfolios, tasks, and pipeline.
          </p>
        </div>
      )}
    </div>
  )
}
