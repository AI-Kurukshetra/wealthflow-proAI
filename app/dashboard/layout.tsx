"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  BarChart3Icon,
  HomeIcon,
  BriefcaseIcon,
  CalendarIcon,
  FileTextIcon,
  FlagIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageSquareIcon,
  MenuIcon,
  PieChartIcon,
  SearchIcon,
  ShieldCheckIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
  UserPlusIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"

import { signOut } from "./actions"

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/dashboard/households", label: "Households", icon: HomeIcon },
  { href: "/dashboard/leads", label: "Leads", icon: UserPlusIcon },
  { href: "/dashboard/clients", label: "Clients", icon: UsersIcon },
  { href: "/dashboard/goals", label: "Goals", icon: FlagIcon },
  { href: "/dashboard/portfolios", label: "Portfolios", icon: PieChartIcon },
  { href: "/dashboard/tasks", label: "Tasks", icon: TargetIcon },
  { href: "/dashboard/meetings", label: "Meetings", icon: CalendarIcon },
  { href: "/dashboard/communications", label: "Comms", icon: MessageSquareIcon },
  { href: "/dashboard/documents", label: "Documents", icon: FileTextIcon },
  { href: "/dashboard/fees", label: "Fees", icon: WalletIcon },
  { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheckIcon },
  { href: "/dashboard/pipeline", label: "Pipeline", icon: BriefcaseIcon },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3Icon },
]

type DashboardSidebarContentProps = {
  onNavigate: () => void
  pathname: string
}

function DashboardSidebarContent({
  onNavigate,
  pathname,
}: DashboardSidebarContentProps) {
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <>
      <div className="flex h-14 items-center gap-2.5 border-b border-gray-200 px-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700">
            <TrendingUpIcon className="size-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            WealthFlow<span className="text-blue-600">Pro</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {sidebarLinks.map((link) => {
          const Icon = link.icon
          const active = isActive(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`size-5 ${active ? "text-blue-600" : "text-gray-400"}`} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOutIcon className="size-5 text-gray-400" />
            Sign Out
          </button>
        </form>
      </div>
    </>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50/60">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-gray-200 bg-white lg:flex">
        <DashboardSidebarContent
          onNavigate={() => setSidebarOpen(false)}
          pathname={pathname}
        />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute right-3 top-3">
          <button onClick={() => setSidebarOpen(false)} className="rounded-md p-1 text-gray-400 hover:text-gray-600">
            <XIcon className="size-5" />
          </button>
        </div>
        <DashboardSidebarContent
          onNavigate={() => setSidebarOpen(false)}
          pathname={pathname}
        />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-60">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <MenuIcon className="size-5" />
          </button>
          <div className="hidden flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 sm:flex">
            <SearchIcon className="size-4" />
            Search clients, tasks, portfolios...
          </div>
          <div className="ml-auto" />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
