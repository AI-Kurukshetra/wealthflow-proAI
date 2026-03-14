const NETWORK_ERROR_PATTERN = /load failed|failed to fetch|fetch failed|networkerror/i

function isNetworkLikeMessage(message: string) {
  return NETWORK_ERROR_PATTERN.test(message)
}

export function formatAuthError(
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof Error) {
    const message = error.message.trim()

    if (isNetworkLikeMessage(message)) {
      return "Unable to reach Supabase Auth. Check your internet connection, disable browser privacy extensions for this site, and verify your Supabase project URL and anon key."
    }

    if (message) {
      return message
    }
  }

  if (typeof error === "string" && error.trim()) {
    if (isNetworkLikeMessage(error)) {
      return "Unable to reach Supabase Auth. Check your internet connection, disable browser privacy extensions for this site, and verify your Supabase project URL and anon key."
    }

    return error.trim()
  }

  return fallbackMessage
}
