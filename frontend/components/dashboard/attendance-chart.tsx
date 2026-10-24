"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { day: "Mon", present: 92, absent: 8 },
  { day: "Tue", present: 88, absent: 12 },
  { day: "Wed", present: 95, absent: 5 },
  { day: "Thu", present: 90, absent: 10 },
  { day: "Fri", present: 85, absent: 15 },
  { day: "Sat", present: 78, absent: 22 },
  { day: "Sun", present: 0, absent: 0 },
]

export function AttendanceChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-[0_2px_10px_rgb(27_57_46/4%)] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">Weekly Attendance</h3>
          <p className="mt-1 text-sm text-muted-foreground">Student attendance rate this week</p>
        </div>
        <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">This week</span>
      </div>
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.24} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
                boxShadow: "0 8px 24px rgb(23 39 35 / 12%)",
              }}
              formatter={(value: number) => [`${value}%`, "Present"]}
            />
            <Area
              type="monotone"
              dataKey="present"
              stroke="var(--primary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#presentGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
          <span className="text-sm text-muted-foreground">Absent</span>
        </div>
      </div>
    </div>
  )
}
