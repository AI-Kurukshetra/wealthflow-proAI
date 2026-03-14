import { CircleAlertIcon, DatabaseIcon, UserPlusIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { schemaMigrationPath, schemaSeedPath } from "@/lib/supabase/schema"

type SchemaSetupRequiredProps = {
  title?: string
  description?: string
}

const setupSteps = [
  {
    icon: DatabaseIcon,
    title: "Run the schema migration",
    detail: schemaMigrationPath,
  },
  {
    icon: UserPlusIcon,
    title: "Create one user in Supabase Auth",
    detail: "This creates the first profile via the auth trigger.",
  },
  {
    icon: CircleAlertIcon,
    title: "Optionally load demo data",
    detail: schemaSeedPath,
  },
]

export function SchemaSetupRequired({
  title = "Supabase setup required",
  description = "WealthFlow is connected to Supabase, but the app tables are not installed in the project yet.",
}: SchemaSetupRequiredProps) {
  return (
    <Card className="border-amber-200 bg-amber-50/70 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <CircleAlertIcon className="size-5" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
          <p className="text-sm leading-6 text-gray-600">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {setupSteps.map((step, index) => {
          const Icon = step.icon

          return (
            <div
              key={step.title}
              className="flex items-start gap-3 rounded-xl border border-white/70 bg-white/80 p-4"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {index + 1}. {step.title}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800">
                    {step.detail}
                  </code>
                </p>
              </div>
            </div>
          )
        })}
        <p className="text-sm text-gray-600">
          After the migration and first user are created, refresh this page.
        </p>
      </CardContent>
    </Card>
  )
}
