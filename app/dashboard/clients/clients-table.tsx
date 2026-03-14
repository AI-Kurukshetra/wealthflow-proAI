"use client"

import { useState, useTransition } from "react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { ClientForm } from "./client-form"
import { deleteClient } from "./actions"

type ClientRow = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  city: string | null
  kyc_status: string
  onboarding_stage: string
  household_id: string
  households: { name: string } | null
}

type Household = { id: string; name: string }

const kycBadgeColor: Record<string, string> = {
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  expired: "bg-red-50 text-red-700 border-red-200",
}

export function ClientsTable({
  clients,
  households,
}: {
  clients: ClientRow[]
  households: Household[]
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editClient, setEditClient] = useState<ClientRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this client?")) return
    setDeletingId(id)
    startTransition(async () => {
      await deleteClient(id)
      setDeletingId(null)
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">{clients.length} clients across {households.length} households</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>Create a new client record in your practice.</DialogDescription>
            </DialogHeader>
            <ClientForm households={households} onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information.</DialogDescription>
          </DialogHeader>
          {editClient && (
            <ClientForm
              households={households}
              client={editClient}
              onClose={() => setEditClient(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {clients.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Household</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>City</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                        {client.first_name[0]}{client.last_name[0]}
                      </div>
                      <span className="font-medium text-gray-900">
                        {client.first_name} {client.last_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{client.households?.name ?? "—"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {client.email && <div className="text-gray-600">{client.email}</div>}
                      {client.phone && <div className="text-xs text-gray-400">{client.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{client.city ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs capitalize ${kycBadgeColor[client.kyc_status] ?? ""}`}>
                      {client.kyc_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">{client.onboarding_stage}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditClient(client)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <PencilIcon className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        disabled={deletingId === client.id}
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
          <p className="text-gray-500">No clients yet. Add your first client to get started.</p>
        </div>
      )}
    </div>
  )
}
