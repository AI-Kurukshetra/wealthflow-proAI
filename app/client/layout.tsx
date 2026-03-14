import Link from "next/link"
import { LayoutDashboardIcon, LogOutIcon, TrendingUpIcon } from "lucide-react"

import { signOut } from "@/app/dashboard/actions"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#eef6fb_38%,#f7f5ef_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top_left,rgba(29,111,163,0.16),transparent_38%),radial-gradient(circle_at_top_right,rgba(242,159,103,0.18),transparent_32%),radial-gradient(circle_at_center_top,rgba(22,54,84,0.08),transparent_52%)]" />

      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#163654_0%,#1d6fa3_58%,#f29f67_100%)] shadow-lg shadow-sky-950/20">
                <TrendingUpIcon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-base font-bold tracking-tight text-slate-950">
                  WealthFlow<span className="text-sky-700">Pro</span>
                </p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Investor Portal
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm shadow-slate-950/5 transition-all hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 sm:inline-flex"
            >
              <LayoutDashboardIcon className="size-4" />
              Advisor Workspace
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-slate-950/[0.12] transition-all hover:-translate-y-0.5 hover:bg-slate-900"
              >
                <LogOutIcon className="size-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
