"use client"

import { useState, useTransition } from "react"
import { CheckCircle2Icon, CircleIcon, ClockIcon, PauseCircleIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createTask, updateTaskStatus, deleteTask } from "./actions"

type TaskRow = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_at: string | null
  category: string | null
  household_id: string | null
  households: { name: string } | null
}

type Household = { id: string; name: string }

const statusConfig: Record<string, { icon: typeof CircleIcon; label: string; color: string }> = {
  todo: { icon: CircleIcon, label: "To Do", color: "text-gray-400" },
  in_progress: { icon: ClockIcon, label: "In Progress", color: "text-blue-500" },
  blocked: { icon: PauseCircleIcon, label: "Blocked", color: "text-red-500" },
  done: { icon: CheckCircle2Icon, label: "Done", color: "text-emerald-500" },
}

const priorityColor: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-gray-50 text-gray-600 border-gray-200",
}

export function TasksView({ tasks, households }: { tasks: TaskRow[]; households: Household[] }) {
  const [addOpen, setAddOpen] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter)

  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    blocked: tasks.filter(t => t.status === "blocked").length,
    done: tasks.filter(t => t.status === "done").length,
  }

  async function handleCreate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createTask(formData)
      if (result.error) setError(result.error)
      else setAddOpen(false)
    })
  }

  function handleStatusChange(id: string, newStatus: string) {
    startTransition(async () => { await updateTaskStatus(id, newStatus) })
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return
    startTransition(async () => { await deleteTask(id) })
  }

  function isOverdue(dueAt: string | null) {
    if (!dueAt) return false
    return new Date(dueAt) < new Date()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">{tasks.length} total tasks</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <PlusIcon className="mr-1.5 size-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>Add a new task to your queue.</DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input name="title" required placeholder="e.g. Complete KYC review" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" rows={2} placeholder="Optional details..." className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <select
                    name="priority"
                    defaultValue="medium"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Due Date</label>
                  <Input name="due_at" type="datetime-local" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <select name="category" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                    <option value="">None</option>
                    <option value="compliance">Compliance</option>
                    <option value="advisory">Advisory</option>
                    <option value="review">Review</option>
                    <option value="documentation">Documentation</option>
                    <option value="planning">Planning</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Household</label>
                  <select name="household_id" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                    <option value="">None</option>
                    {households.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              </div>
              {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending} className="bg-blue-600 text-white hover:bg-blue-700">
                  {isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "todo", "in_progress", "blocked", "done"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === key ? "bg-blue-50 text-blue-700" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {key === "all" ? "All" : statusConfig[key]?.label ?? key} ({counts[key]})
          </button>
        ))}
      </div>

      {/* Task List */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((task) => {
            const cfg = statusConfig[task.status] ?? statusConfig.todo
            const StatusIcon = cfg.icon
            const overdue = task.status !== "done" && isOverdue(task.due_at)

            return (
              <div key={task.id} className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm ${overdue ? "border-red-200" : "border-gray-200"}`}>
                <button
                  onClick={() => {
                    const next = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : task.status === "blocked" ? "todo" : "todo"
                    handleStatusChange(task.id, next)
                  }}
                  className={`mt-0.5 shrink-0 ${cfg.color}`}
                  title={`Status: ${cfg.label}. Click to advance.`}
                >
                  <StatusIcon className="size-5" />
                </button>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`font-medium ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                      {task.title}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className={`text-xs capitalize ${priorityColor[task.priority] ?? ""}`}>
                        {task.priority}
                      </Badge>
                      <button onClick={() => handleDelete(task.id)} className="rounded-md p-1 text-gray-300 hover:bg-red-50 hover:text-red-500">
                        <Trash2Icon className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  {task.description && <p className="mt-1 text-sm text-gray-500">{task.description}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    {task.households?.name && <span>{task.households.name}</span>}
                    {task.category && <Badge variant="outline" className="text-xs capitalize">{task.category}</Badge>}
                    {task.due_at && (
                      <span className={overdue ? "font-medium text-red-500" : ""}>
                        Due {new Date(task.due_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {overdue && " (overdue)"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-gray-500">No tasks found. Create a task to get started.</p>
        </div>
      )}
    </div>
  )
}
