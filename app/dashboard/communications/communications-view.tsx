"use client"

import { useMemo, useState, useTransition } from "react"
import { MessageSquareIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

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

import { deleteCommunicationLog } from "./actions"
import { CommunicationForm } from "./communication-form"

type HouseholdOption = {
  id: string
  name: string
}

type ClientOption = {
  id: string
  first_name: string
  last_name: string
}

type CommunicationRow = {
  id: string
  household_id: string | null
  client_id: string | null
  channel: string
  subject: string | null
  summary: string
  logged_at: string
  households: { name: string } | null
  clients: { first_name: string; last_name: string } | null
}

const channelFilters = ["all", "email", "phone", "whatsapp", "meeting", "sms"] as const

const channelTone: Record<string, string> = {
  email: "bg-blue-50 text-blue-700 border-blue-200",
  phone: "bg-emerald-50 text-emerald-700 border-emerald-200",
  whatsapp: "bg-green-50 text-green-700 border-green-200",
  meeting: "bg-violet-50 text-violet-700 border-violet-200",
  sms: "bg-amber-50 text-amber-700 border-amber-200",
}

function getClientName(client: CommunicationRow["clients"]) {
  if (!client) {
    return null
  }

  return `${client.first_name} ${client.last_name}`.trim()
}

export function CommunicationsView({
  communications,
  households,
  clients,
}: {
  communications: CommunicationRow[]
  households: HouseholdOption[]
  clients: ClientOption[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editCommunication, setEditCommunication] = useState<CommunicationRow | null>(null)
  const [filter, setFilter] = useState<(typeof channelFilters)[number]>("all")
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filteredCommunications =
    filter === "all"
      ? communications
      : communications.filter((communication) => communication.channel === filter)

  const summary = useMemo(() => {
    const today = new Date()
    const todayCount = communications.filter((communication) => {
      const loggedDate = new Date(communication.logged_at)

      return (
        loggedDate.getFullYear() === today.getFullYear() &&
        loggedDate.getMonth() === today.getMonth() &&
        loggedDate.getDate() === today.getDate()
      )
    }).length

    return {
      todayCount,
      emailCount: communications.filter((communication) => communication.channel === "email").length,
      whatsappCount: communications.filter((communication) => communication.channel === "whatsapp").length,
    }
  }, [communications])

  function handleDelete(id: string) {
    if (!confirm("Delete this communication log?")) {
      return
    }

    setError(null)
    setDeletingId(id)

    startTransition(async () => {
      const result = await deleteCommunicationLog(id)

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
            Communications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Log advisor interactions across email, calls, WhatsApp, meetings, and SMS.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Add Log
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Communication Log</DialogTitle>
              <DialogDescription>
                Capture a client touchpoint or follow-up.
              </DialogDescription>
            </DialogHeader>
            <CommunicationForm
              households={households}
              clients={clients}
              onClose={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={Boolean(editCommunication)}
        onOpenChange={(open) => !open && setEditCommunication(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Communication Log</DialogTitle>
            <DialogDescription>
              Update the channel, timestamp, or conversation notes.
            </DialogDescription>
          </DialogHeader>
          {editCommunication ? (
            <CommunicationForm
              households={households}
              clients={clients}
              communication={editCommunication}
              onClose={() => setEditCommunication(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">Total Logs</p>
            <CardTitle className="text-3xl text-gray-900">
              {communications.length}
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
            <p className="text-sm text-gray-500">Email</p>
            <CardTitle className="text-3xl text-gray-900">
              {summary.emailCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-sm text-gray-500">WhatsApp</p>
            <CardTitle className="text-3xl text-gray-900">
              {summary.whatsappCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {channelFilters.map((channel) => (
          <button
            key={channel}
            type="button"
            onClick={() => setFilter(channel)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === channel
                ? "bg-blue-50 text-blue-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {channel === "all" ? "All" : channel} (
            {channel === "all"
              ? communications.length
              : communications.filter((communication) => communication.channel === channel).length}
            )
          </button>
        ))}
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {filteredCommunications.length > 0 ? (
        <div className="space-y-3">
          {filteredCommunications.map((communication) => (
            <div
              key={communication.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                      <MessageSquareIcon className="size-4" />
                    </div>
                    {communication.subject ? (
                      <p className="font-medium text-gray-900">{communication.subject}</p>
                    ) : (
                      <p className="font-medium text-gray-900">Communication log</p>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${channelTone[communication.channel] ?? ""}`}
                    >
                      {communication.channel}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {communication.households?.name ? (
                      <span>{communication.households.name}</span>
                    ) : null}
                    {getClientName(communication.clients) ? (
                      <span>{getClientName(communication.clients)}</span>
                    ) : null}
                    <span>
                      {new Date(communication.logged_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {communication.summary}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditCommunication(communication)}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <PencilIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(communication.id)}
                    disabled={deletingId === communication.id}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-gray-500">
            No communication logs found. Add one to build your client history.
          </p>
        </div>
      )}
    </div>
  )
}
