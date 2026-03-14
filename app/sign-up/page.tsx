import Link from "next/link"
import { redirect } from "next/navigation"
import {
  LockIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UserPlusIcon,
} from "lucide-react"

import { SignUpForm } from "@/components/wealthflow/sign-up-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

const benefits = [
  {
    icon: TrendingUpIcon,
    title: "Launch your advisor workspace",
    detail:
      "Create an account and start managing clients, portfolios, and operations from one place.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Supabase-backed authentication",
    detail:
      "New accounts are created securely in Supabase Auth and mapped into WealthFlow automatically.",
  },
  {
    icon: LockIcon,
    title: "Ready for your first login",
    detail:
      "Use your email and password to sign in immediately, or confirm by email if your project requires it.",
  },
]

export default async function SignUpPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/15">
            <TrendingUpIcon className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            WealthFlow<span className="text-blue-200">Pro</span>
          </span>
        </Link>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              Create your WealthFlow workspace.
            </h2>
            <p className="mt-3 max-w-md text-base leading-7 text-blue-100/80">
              Sign up with email and password to start using the product without
              manual user creation in the Supabase dashboard.
            </p>
          </div>

          <div className="space-y-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div
                  key={benefit.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                      <Icon className="size-4 text-blue-200" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{benefit.title}</p>
                      <p className="mt-1 text-sm leading-6 text-blue-100/70">
                        {benefit.detail}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="text-sm text-blue-200/60">
          &copy; 2026 WealthFlow Pro. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700">
                <TrendingUpIcon className="size-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                WealthFlow<span className="text-blue-600">Pro</span>
              </span>
            </Link>
          </div>

          <Card className="border-gray-200 bg-white shadow-lg">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserPlusIcon className="size-5" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Create account</CardTitle>
              <CardDescription className="text-gray-500">
                Start with your email and password. We&apos;ll create your
                WealthFlow profile automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SignUpForm />
              <div className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
