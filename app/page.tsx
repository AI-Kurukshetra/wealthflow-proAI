import Link from "next/link"
import {
  ArrowRightIcon,
  BadgeIndianRupeeIcon,
  BarChart3Icon,
  BriefcaseIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  FileTextIcon,
  GlobeIcon,
  LayoutDashboardIcon,
  LineChartIcon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  PieChartIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
  ZapIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

/* ───────────────────────── DATA ───────────────────────── */

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Platform", href: "#platform" },
  { label: "Pricing", href: "#pricing" },
]

const heroStats = [
  { value: "$154B", label: "Indian Wealth Management Market" },
  { value: "10x", label: "Faster Client Onboarding" },
  { value: "99.9%", label: "Platform Uptime" },
  { value: "100%", label: "SEBI Compliant" },
]

const coreFeatures = [
  {
    icon: UsersIcon,
    title: "Client Relationship Management",
    description:
      "Comprehensive client profiles with contact history, preferences, family relationships, and communication logs.",
  },
  {
    icon: PieChartIcon,
    title: "Portfolio Management Dashboard",
    description:
      "Real-time portfolio tracking, performance analytics, and asset allocation visualization across all accounts.",
  },
  {
    icon: TargetIcon,
    title: "Lead Management System",
    description:
      "Lead capture, scoring, nurturing workflows, and conversion tracking to grow your advisory practice.",
  },
  {
    icon: CalendarIcon,
    title: "Task & Activity Management",
    description:
      "Automated task creation, deadline tracking, and activity logging for client touchpoints and reviews.",
  },
  {
    icon: FileTextIcon,
    title: "Document Management",
    description:
      "Secure document storage, version control, e-signature integration, and compliance documentation.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Compliance Management",
    description:
      "SEBI compliance tracking, audit trails, and regulatory reporting for Indian wealth management firms.",
  },
  {
    icon: LineChartIcon,
    title: "Financial Goal Tracking",
    description:
      "Set and monitor client financial goals with progress visualization and milestone alerts.",
  },
  {
    icon: WalletIcon,
    title: "Fee & Billing Management",
    description:
      "Automated fee calculation, invoice generation, and payment tracking for wealth management services.",
  },
  {
    icon: BarChart3Icon,
    title: "Reporting & Analytics",
    description:
      "Customizable dashboards and reports for business performance, client metrics, and portfolio analytics.",
  },
]

const solutions = [
  {
    icon: BriefcaseIcon,
    title: "For Financial Advisors",
    description:
      "Streamline client interactions, portfolio reviews, and compliance workflows. Spend more time advising, less time on admin.",
    points: [
      "360-degree client view with household mapping",
      "Automated review preparation and follow-ups",
      "Real-time portfolio performance tracking",
      "AI-powered investment recommendations",
    ],
  },
  {
    icon: LayoutDashboardIcon,
    title: "For Wealth Management Firms",
    description:
      "Scale operations with unified client data, team management, and enterprise-grade compliance across your organization.",
    points: [
      "Multi-advisor team management and permissions",
      "Firm-wide AUM and revenue dashboards",
      "Centralized compliance and audit management",
      "White-label client portal and reporting",
    ],
  },
  {
    icon: ShieldCheckIcon,
    title: "For Compliance Teams",
    description:
      "Stay audit-ready with automated compliance checks, regulatory reporting, and complete audit trails for SEBI requirements.",
    points: [
      "Automated SEBI compliance checks",
      "KYC refresh tracking and alerts",
      "Document retention policy enforcement",
      "Real-time compliance health scoring",
    ],
  },
]

const platformCapabilities = [
  {
    icon: SparklesIcon,
    title: "AI-Powered Insights",
    description: "Machine learning algorithms suggest optimal asset allocation and investment opportunities based on client profiles.",
  },
  {
    icon: BadgeIndianRupeeIcon,
    title: "India-First Design",
    description: "Built for Indian markets with NSE/BSE data feeds, rupee-focused reporting, and SEBI compliance templates.",
  },
  {
    icon: TrendingUpIcon,
    title: "Market Data Integration",
    description: "Real-time market data feeds for stocks, mutual funds, bonds, and alternative investments.",
  },
  {
    icon: LockIcon,
    title: "Enterprise Security",
    description: "Bank-grade encryption, role-based access control, and complete audit trails for every action.",
  },
  {
    icon: ZapIcon,
    title: "Automated Workflows",
    description: "Configurable business process automation for onboarding, reviews, and compliance procedures.",
  },
  {
    icon: GlobeIcon,
    title: "Multi-Currency Support",
    description: "Handle international investments with real-time currency conversion and multi-currency reporting.",
  },
]

const pricingPlans = [
  {
    name: "Starter",
    price: "14,999",
    period: "/month",
    description: "Perfect for independent financial advisors starting their practice.",
    features: [
      "Up to 100 client profiles",
      "Basic portfolio tracking",
      "Document management",
      "Email support",
      "Standard compliance templates",
      "Basic reporting",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "39,999",
    period: "/month",
    description: "For growing advisory practices that need advanced tools and automation.",
    features: [
      "Up to 500 client profiles",
      "Advanced portfolio analytics",
      "Workflow automation",
      "Priority support",
      "SEBI compliance suite",
      "Custom reporting & dashboards",
      "Client portal access",
      "API integrations",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For wealth management firms requiring full customization and dedicated support.",
    features: [
      "Unlimited client profiles",
      "AI-powered recommendations",
      "White-label client portal",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced analytics & BI",
      "On-premise deployment option",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

const testimonials = [
  {
    quote:
      "WealthFlow Pro transformed how we manage client relationships. The SEBI compliance automation alone saves us 20 hours a week.",
    name: "Priya Krishnamurthy",
    role: "Chief Compliance Officer",
    company: "Vanguard Wealth Advisors, Mumbai",
  },
  {
    quote:
      "The portfolio dashboard gives us real-time visibility across all client accounts. Our advisors are now 3x more productive in client reviews.",
    name: "Rajesh Malhotra",
    role: "Managing Director",
    company: "Pinnacle Financial Services, Delhi",
  },
  {
    quote:
      "Finally, a wealth management platform that understands Indian markets. The NSE/BSE integration and rupee reporting are game-changers.",
    name: "Ananya Desai",
    role: "Senior Financial Advisor",
    company: "Heritage Wealth Partners, Bangalore",
  },
]

const footerLinks = {
  Product: ["Features", "Solutions", "Platform", "Pricing", "Security"],
  Company: ["About Us", "Careers", "Blog", "Press", "Contact"],
  Resources: ["Documentation", "API Reference", "Webinars", "Case Studies", "Help Center"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "SEBI Compliance"],
}

/* ───────────────────────── PAGE ───────────────────────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── NAVBAR ─── */}
      <header className="glass fixed top-0 right-0 left-0 z-50 border-b border-gray-100/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700">
                <TrendingUpIcon className="size-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                WealthFlow<span className="text-blue-600">Pro</span>
              </span>
            </Link>
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
              <Link href="/sign-in">Log In</Link>
            </Button>
            <Button asChild size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/sign-up">
                Get Started
                <ArrowRightIcon className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden pt-16">
        <div className="hero-orb absolute -top-20 -left-40 h-[500px] w-[500px] rounded-full bg-blue-400/20" />
        <div className="hero-orb absolute top-20 -right-32 h-[400px] w-[400px] rounded-full bg-indigo-400/15 [animation-delay:3s]" />
        <div className="hero-orb absolute -bottom-20 left-1/3 h-[350px] w-[350px] rounded-full bg-emerald-400/10 [animation-delay:6s]" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            <div className="reveal mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              <SparklesIcon className="size-4" />
              India&apos;s #1 Wealth Management Platform
            </div>

            <h1 className="reveal-delay-1 text-5xl font-bold leading-tight tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              The Operating System for{" "}
              <span className="gradient-text">Modern Wealth Management</span>
            </h1>

            <p className="reveal-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
              Unify client relationships, portfolio tracking, compliance, and
              business intelligence into one powerful platform. Built for
              Indian financial advisors and wealth management firms.
            </p>

            <div className="reveal-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-lg bg-blue-600 px-8 text-base text-white hover:bg-blue-700">
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRightIcon className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-lg px-8 text-base">
                <Link href="#platform">
                  Watch Demo
                  <ChevronRightIcon className="ml-1 size-4" />
                </Link>
              </Button>
            </div>

            <div className="reveal-delay-4 mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-gray-900 sm:text-3xl">{stat.value}</div>
                  <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="reveal-delay-4 mx-auto mt-20 max-w-5xl">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-950 shadow-2xl shadow-gray-900/20">
              <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-3">
                <div className="size-3 rounded-full bg-red-500" />
                <div className="size-3 rounded-full bg-yellow-500" />
                <div className="size-3 rounded-full bg-green-500" />
                <span className="ml-3 text-xs text-gray-400">WealthFlow Pro — Dashboard</span>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    { label: "Total AUM", value: "₹32.6 Cr", change: "+12.4%" },
                    { label: "Active Clients", value: "248", change: "+18" },
                    { label: "Open Tasks", value: "26", change: "14 due" },
                    { label: "Compliance", value: "96%", change: "Healthy" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="text-xs font-medium text-gray-500">{item.label}</div>
                      <div className="mt-1 text-2xl font-bold text-gray-900">{item.value}</div>
                      <div className="mt-1 text-xs text-emerald-600">{item.change}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-3 text-sm font-medium text-gray-700">Portfolio Performance</div>
                    <div className="flex h-32 items-end gap-2">
                      {[40, 55, 45, 65, 58, 72, 68, 80, 75, 88, 82, 95].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-blue-400" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-3 text-sm font-medium text-gray-700">Top Clients</div>
                    <div className="space-y-3">
                      {["Patel Family Office", "Iyer Legacy Trust", "Mehta Group"].map((name) => (
                        <div key={name} className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-blue-100 text-center text-xs font-medium leading-7 text-blue-700">
                            {name[0]}
                          </div>
                          <span className="text-xs text-gray-700">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUSTED BY ─── */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium uppercase tracking-widest text-gray-400">
            Trusted by leading wealth management firms across India
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {[
              "Vanguard Wealth",
              "Pinnacle Financial",
              "Heritage Partners",
              "Axis Advisory",
              "Meridian Capital",
              "Summit Wealth",
            ].map((name) => (
              <span key={name} className="text-lg font-semibold text-gray-300 transition-colors hover:text-gray-400">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CORE FEATURES ─── */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              Core Features
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need to Manage Wealth
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              A comprehensive suite of tools designed for Indian wealth
              management professionals. From client onboarding to compliance
              reporting.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SOLUTIONS ─── */}
      <section id="solutions" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              Solutions
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built for Every Role in Your Firm
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Whether you&apos;re an independent advisor or a large firm, WealthFlow
              Pro adapts to your workflow.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {solutions.map((solution) => {
              const Icon = solution.icon
              return (
                <div
                  key={solution.title}
                  className="rounded-2xl border border-gray-200 bg-white p-8 transition-shadow hover:shadow-lg"
                >
                  <div className="mb-5 flex size-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="size-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{solution.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{solution.description}</p>
                  <ul className="mt-6 space-y-3">
                    {solution.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm text-gray-700">
                        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── PLATFORM ─── */}
      <section id="platform" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                Platform
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Powered by Intelligence, Built for India
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Our platform combines cutting-edge AI with deep understanding
                of Indian financial markets to deliver unmatched value for
                wealth management professionals.
              </p>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {platformCapabilities.map((cap) => {
                  const Icon = cap.icon
                  return (
                    <div key={cap.title} className="flex gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{cap.title}</h4>
                        <p className="mt-1 text-sm leading-6 text-gray-600">{cap.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Platform Visual */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700">
                    <SparklesIcon className="size-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">AI Advisory Engine</h4>
                    <p className="text-xs text-gray-500">Real-time intelligence for advisors</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="mb-2 text-xs font-medium text-blue-700">Portfolio Recommendation</div>
                    <p className="text-sm text-gray-700">
                      Based on the Patel Family&apos;s risk profile and current market conditions,
                      consider rebalancing 15% from large-cap equity to debt funds.
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <div className="mb-2 text-xs font-medium text-emerald-700">Compliance Alert</div>
                    <p className="text-sm text-gray-700">
                      3 clients have KYC documents expiring within 30 days.
                      Auto-generated renewal reminders have been scheduled.
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-4">
                    <div className="mb-2 text-xs font-medium text-amber-700">Market Insight</div>
                    <p className="text-sm text-gray-700">
                      Nifty 50 up 2.3% this week. 4 client portfolios may benefit
                      from the sectoral rotation into IT and pharma stocks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              Pricing
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Choose the plan that fits your practice. All plans include a
              14-day free trial.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-shadow hover:shadow-lg ${
                  plan.highlighted
                    ? "border-blue-600 bg-white shadow-lg shadow-blue-100"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  {plan.price !== "Custom" && <span className="text-sm text-gray-500">₹</span>}
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <p className="mt-3 text-sm text-gray-600">{plan.description}</p>

                <Button
                  asChild
                  className={`mt-6 w-full ${
                    plan.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <Link href="/sign-up">{plan.cta}</Link>
                </Button>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-blue-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by Industry Leaders
            </h2>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="size-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-gray-700 leading-7">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {testimonial.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Transform Your Wealth Management Practice?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
            Join hundreds of financial advisors and wealth management firms
            across India who trust WealthFlow Pro to grow their business.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-lg bg-white px-8 text-base font-semibold text-blue-700 hover:bg-blue-50">
              <Link href="/sign-up">
                Start Free Trial
                <ArrowRightIcon className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-lg border-white/30 px-8 text-base text-white hover:bg-white/10 hover:text-white">
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-blue-200">
            No credit card required. 14-day free trial on all plans.
          </p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700">
                  <TrendingUpIcon className="size-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  WealthFlow<span className="text-blue-600">Pro</span>
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-6 text-gray-600">
                India&apos;s leading CRM and business intelligence platform for
                wealth management firms. SEBI compliant and built for Indian
                markets.
              </p>
              <div className="mt-6 flex gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MailIcon className="size-4" />
                  hello@wealthflowpro.in
                </div>
              </div>
              <div className="mt-2 flex gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <PhoneIcon className="size-4" />
                  +91 80-4567-8900
                </div>
              </div>
              <div className="mt-2 flex gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPinIcon className="size-4" />
                  Bangalore, India
                </div>
              </div>
            </div>

            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-gray-900">{category}</h4>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 sm:flex-row">
            <p className="text-sm text-gray-500">
              &copy; 2026 WealthFlow Pro. All rights reserved.
            </p>
            <p className="text-sm text-gray-400">
              SEBI Registered | ISO 27001 Certified | SOC 2 Type II
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
