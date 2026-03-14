"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"

import { formatCompactCurrency } from "@/lib/format"

type OverviewChartProps = {
  data: ReadonlyArray<{
    month: string
    aum: number
    revenue: number
  }>
}

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="aumGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(22,36,54)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="rgb(22,36,54)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(201,108,51)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="rgb(201,108,51)" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(22,36,54,0.08)" />
          <XAxis
            axisLine={false}
            dataKey="month"
            tickLine={false}
            tick={{ fill: "rgba(22,36,54,0.62)", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ stroke: "rgba(22,36,54,0.18)", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 18,
              border: "1px solid rgba(22,36,54,0.08)",
              backgroundColor: "rgba(255,255,255,0.96)",
              boxShadow: "0 24px 50px rgba(22,36,54,0.12)",
            }}
            formatter={(value, name) => [
              formatCompactCurrency(Number(value ?? 0)),
              name === "aum" ? "AUM" : "Revenue",
            ]}
            labelStyle={{ color: "rgb(22,36,54)", fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="aum"
            stroke="rgb(22,36,54)"
            strokeWidth={2.4}
            fill="url(#aumGradient)"
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="rgb(201,108,51)"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
