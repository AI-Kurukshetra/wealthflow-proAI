import { SchemaSetupRequired } from "@/components/wealthflow/schema-setup-required"
import type { Household, Task } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"
import { hasMissingSchemaError } from "@/lib/supabase/schema"
import { TasksView } from "./tasks-view"

export const metadata = { title: "Tasks" }

type TaskWithHousehold = Task & {
  households: Pick<Household, "name"> | null
}

export default async function TasksPage() {
  const supabase = await createClient()

  const [
    { data: tasks, error: tasksError },
    { data: households, error: householdsError },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, households(name)")
      .order("due_at", { ascending: true }),
    supabase.from("households").select("id, name").order("name"),
  ])

  if (hasMissingSchemaError([tasksError, householdsError])) {
    return (
      <SchemaSetupRequired title="Finish Supabase setup to use the tasks workspace." />
    )
  }

  return (
    <TasksView
      tasks={((tasks ?? []) as TaskWithHousehold[])}
      households={((households ?? []) as Pick<Household, "id" | "name">[])}
    />
  )
}
