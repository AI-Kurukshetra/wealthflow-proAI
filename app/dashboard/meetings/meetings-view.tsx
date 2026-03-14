"use client"

import { useMemo, useState, useTransition } from "react"
import { Clock3Icon, MapPinIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

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

import { deleteMeeting } from "./actions"
import { MeetingForm } from "./meeting-form"

type HouseholdOption = {
  id: string
  name: string
}

type MeetingRow = {
  id: string
  household_id: string | null
  subject: string
  meeting_type: string
  location: string | null
  notes: string | null
  starts_at: string
  ends_at: string | null
  households: { name: string } | null
}

const filters = ["all", "upcoming", "today", "past"] as const

function isToday(dateValue: string) {
  const date = new Date(dateValue)
  const now = new Date()

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function isPastMeeting(meeting: MeetingRow) {
  const endDate = meeting.ends_at ? new Date(meeting.ends_at) : new Date(meeting.starts_at)

  return endDate < new Date()
}

export function MeetingsView({
  meetings,
  households,
}: {
  meetings: MeetingRow[]
  households: HouseholdOption[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editMeeting, setEditMeeting] = useState<MeetingRow | null>(null)
  const [filter, setFilter] = useState<(typeof filters)[number]>("all")
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filteredMeetings = useMemo(() => {
    if (filter === "all") {
      return meetings
    }

    if (filter === "today") {
      return meetings.filter((meeting) => isToday(meeting.starts_at))
    }

    if (filter === "past") {
      return meetings.filter((meeting) => isPastMeeting(meeting))
    }

    return meetings.filter((meeting) => !isPastMeeting(meeting))
  }, [filter, meetings])

  const summary = useMemo(() => {
    const todayCount = meetings.filter((meeting) => isToday(meeting.starts_at)).length
    const pastCount = meetings.filter((meeting) => isPastMeeting(meeting)).length
    const upcomingCount = meetings.length - pastCount

    return { todayCount, pastCount, upcomingCount }
  }, [meetings])

  function handleDelete(id: string) {
    if (!confirm("Delete this meeting?")) {
      return
    }

    setError(null)
    setDeletingId(id)

    startTransition(async () => {
      const result = await deleteMeeting(id)

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
            Meetings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage advisor reviews, onboarding calls, and client touchpoints.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Meeting</DialogTitle>
              <DialogDescription>
                Add a meeting to the practice calendar.
              </DialogDescription>
            </DialogHeader>
            <MeetingForm households={households} onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={Boolean(editMeeting)}
        onOpenChange={(open) => !open && setEditMeeting(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
            <DialogDescription>
              Update agenda, timing, or client context.
            </DialogDescription>
          </DialogHeader>
          {editMeeting ? (
            <MeetingForm
              households={households}
              meeting={editMeeting}
              onClose={() => setEditMeeting(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Total Meetings</p>
            <CardTitle className="text-3xl text-gray-900">
              {meetings.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Upcoming</p>
            <CardTitle className="text-3xl text-gray-900">
              {summary.upcomingCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Today</p>
            <CardTitle className="text-3xl text-gray-900">
              {summary.todayCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Past</p>
            <CardTitle className="text-3xl text-gray-900">
              {summary.pastCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((filterKey) => (
          <button
            key={filterKey}
            type="button"
            onClick={() => setFilter(filterKey)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === filterKey
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {filterKey === "all" ? "All" : filterKey} (
            {filterKey === "all"
              ? meetings.length
              : filterKey === "today"
                ? summary.todayCount
                : filterKey === "past"
                  ? summary.pastCount
                  : summary.upcomingCount}
            )
          </button>
        ))}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {filteredMeetings.length > 0 ? (
        <div className="space-y-3">
          {filteredMeetings.map((meeting) => {
            const past = isPastMeeting(meeting)

            return (
              <div
                key={meeting.id}
                className={`rounded-xl border bg-white p-4 shadow-sm ${
                  past ? "border-gray-200" : "border-blue-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-gray-900">{meeting.subject}</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {meeting.meeting_type.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${past ? "" : "text-blue-700"}`}
                      >
                        {past ? "Completed" : "Upcoming"}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>{meeting.households?.name ?? "No household"}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3Icon className="size-4" />
                        {new Date(meeting.starts_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {meeting.ends_at
                          ? ` - ${new Date(meeting.ends_at).toLocaleString("en-IN", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}`
                          : ""}
                      </span>
                      {meeting.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPinIcon className="size-4" />
                          {meeting.location}
                        </span>
                      ) : null}
                    </div>
                    {meeting.notes ? (
                      <p className="mt-3 text-sm leading-6 text-gray-500">
                        {meeting.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditMeeting(meeting)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <PencilIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(meeting.id)}
                      disabled={deletingId === meeting.id}
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
            No meetings found. Schedule one to start tracking advisor activity.
          </p>
        </div>
      )}
    </div>
  )
}
