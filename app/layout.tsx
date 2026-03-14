import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "WealthFlow Pro | India's #1 Wealth Management CRM Platform",
    template: "%s | WealthFlow Pro",
  },
  description:
    "Unify client relationships, portfolio tracking, compliance, and business intelligence into one powerful platform. Built for Indian financial advisors and wealth management firms.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
