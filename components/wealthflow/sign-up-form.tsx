"use client"

import { type FormEvent, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatAuthError } from "@/lib/supabase/auth-errors"
import { createClient } from "@/lib/supabase/browser"

function getRedirectTarget(redirect: string | null) {
  if (!redirect || !redirect.startsWith("/")) {
    return "/dashboard"
  }

  return redirect
}

export function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = getRedirectTarget(searchParams.get("redirect"))
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const fullName = String(formData.get("full_name") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirm_password") ?? "")

    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const emailRedirectTo = new URL("/sign-in", window.location.origin)

      if (redirectTarget !== "/dashboard") {
        emailRedirectTo.searchParams.set("redirect", redirectTarget)
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: emailRedirectTo.toString(),
        },
      })

      if (signUpError) {
        setError(
          formatAuthError(
            signUpError,
            "Unable to create your account right now. Please try again.",
          ),
        )
        return
      }

      form.reset()

      if (data.session) {
        setSuccess("Account created. Redirecting to your dashboard...")
        startTransition(() => {
          router.replace(redirectTarget)
          router.refresh()
        })
        return
      }

      setSuccess(
        "Account created. If email confirmation is enabled, check your inbox and then sign in.",
      )
    } catch (submissionError) {
      setError(
        formatAuthError(
          submissionError,
          "Unable to create your account right now. Please try again.",
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-[rgb(22,36,54)]"
          htmlFor="full_name"
        >
          Full Name
        </label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          placeholder="Aditi Sharma"
          required
          autoComplete="name"
          className="h-11 bg-white"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[rgb(22,36,54)]" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="advisor@wealthflow.pro"
          required
          autoComplete="email"
          className="h-11 bg-white"
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-[rgb(22,36,54)]"
          htmlFor="password"
        >
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Create a password"
          required
          minLength={6}
          autoComplete="new-password"
          className="h-11 bg-white"
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-[rgb(22,36,54)]"
          htmlFor="confirm_password"
        >
          Confirm Password
        </label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          placeholder="Repeat your password"
          required
          minLength={6}
          autoComplete="new-password"
          className="h-11 bg-white"
        />
      </div>

      {error ? (
        <p className="rounded-2xl border border-[rgba(194,74,47,0.18)] bg-[rgba(194,74,47,0.08)] px-4 py-3 text-sm text-[rgb(143,51,33)]">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-2xl border border-[rgba(24,48,77,0.14)] bg-[rgba(24,48,77,0.06)] px-4 py-3 text-sm text-[rgb(24,48,77)]">
          {success}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full bg-[rgb(22,36,54)] text-white"
        disabled={isSubmitting || isPending}
      >
        {isSubmitting || isPending ? "Creating account..." : "Create WealthFlow account"}
      </Button>
    </form>
  )
}
