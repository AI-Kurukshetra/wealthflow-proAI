type SupabaseErrorLike = {
  code?: string | null
  message?: string | null
} | null | undefined

const schemaErrorCodes = new Set(["42P01", "PGRST200", "PGRST205"])

const schemaErrorPatterns = [
  /Could not find the table/i,
  /Could not find a relationship/i,
  /relation .* does not exist/i,
  /schema cache/i,
]

export const schemaMigrationPath =
  "supabase/migrations/202603141200_init_wealthflow.sql"
export const schemaSeedPath = "supabase/seed.sql"

export function isMissingSchemaError(error: SupabaseErrorLike) {
  if (!error) {
    return false
  }

  if (error.code && schemaErrorCodes.has(error.code)) {
    return true
  }

  return schemaErrorPatterns.some((pattern) =>
    pattern.test(error.message ?? "")
  )
}

export function hasMissingSchemaError(errors: SupabaseErrorLike[]) {
  return errors.some((error) => isMissingSchemaError(error))
}

export function formatSupabaseActionError(error: SupabaseErrorLike) {
  if (!error) {
    return "Something went wrong while saving data."
  }

  if (isMissingSchemaError(error)) {
    return "WealthFlow tables are not installed in Supabase yet. Run the migration, create one auth user, then optionally run the seed script."
  }

  return error.message ?? "Something went wrong while saving data."
}
