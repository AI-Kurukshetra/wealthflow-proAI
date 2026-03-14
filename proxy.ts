import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { updateSession } from "@/lib/supabase/middleware"
import { getSupabaseEnv } from "@/lib/env"

export async function proxy(request: NextRequest) {
  const response = await updateSession(request)

  // Protect /dashboard routes — redirect to /sign-in if not authenticated
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const { url, anonKey } = getSupabaseEnv()
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const signInUrl = new URL("/sign-in", request.url)
      signInUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
