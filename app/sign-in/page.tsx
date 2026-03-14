import Link from "next/link"
import { redirect } from "next/navigation"
import {
  LockIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
} from "lucide-react"

import { SignInForm } from "@/components/wealthflow/sign-in-form"
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
    title: "Real-Time Portfolio Tracking",
    detail: "Monitor AUM, performance, and asset allocation across all your client accounts in one dashboard.",
  },
  {
    icon: ShieldCheckIcon,
    title: "SEBI Compliance Built-In",
    detail: "Stay audit-ready with automated compliance checks, KYC tracking, and regulatory reporting.",
  },
  {
    icon: LockIcon,
    title: "Bank-Grade Security",
    detail: "Enterprise encryption, role-based access control, and complete audit trails for every action.",
  },
]

export default async function SignInPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen">
      {/* ─── LEFT PANEL ─── */}
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
              The smarter way to manage wealth.
            </h2>
            <p className="mt-3 max-w-md text-base leading-7 text-blue-100/80">
              Join hundreds of financial advisors across India who use WealthFlow
              Pro to grow their practice and delight their clients.
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

      {/* ─── RIGHT PANEL ─── */}
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
              <CardTitle className="text-2xl text-gray-900">Welcome back</CardTitle>
              <CardDescription className="text-gray-500">
                Sign in to access your wealth management dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SignInForm />
              <div className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Create one
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
